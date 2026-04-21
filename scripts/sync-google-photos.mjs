import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
const BUCKET = process.env.VITE_SUPABASE_BUCKET || 'portfolio-assets'
const SYNC_COUNT = 3

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`)
  return data.access_token
}

async function fetchRecentPhotos(accessToken) {
  const res = await fetch(
    `https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=${SYNC_COUNT}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const data = await res.json()
  if (!data.mediaItems) throw new Error(`Photos error: ${JSON.stringify(data)}`)
  // 画像のみ
  return data.mediaItems.filter(item => item.mimeType?.startsWith('image/'))
}

function parseExif(mediaMetadata) {
  const photo = mediaMetadata?.photo || {}
  const lines = []
  if (mediaMetadata?.creationTime) {
    const d = new Date(mediaMetadata.creationTime)
    lines.push(`撮影日時: ${d.toLocaleString('ja-JP')}`)
  }
  if (photo.cameraMake)  lines.push(`カメラ: ${photo.cameraMake} ${photo.cameraModel || ''}`.trim())
  if (photo.focalLength) lines.push(`焦点距離: ${photo.focalLength}mm`)
  if (photo.apertureFNumber) lines.push(`F値: f/${photo.apertureFNumber}`)
  if (photo.exposureTime) lines.push(`SS: ${photo.exposureTime}s`)
  if (photo.isoEquivalent) lines.push(`ISO: ${photo.isoEquivalent}`)
  return lines.join('\n')
}

async function uploadToSupabase(accessToken, item) {
  // Google Photos の画像バイナリを取得（=d でオリジナルサイズ）
  const imageRes = await fetch(`${item.baseUrl}=d`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!imageRes.ok) throw new Error(`Image fetch failed: ${imageRes.status}`)
  const buffer = await imageRes.arrayBuffer()

  const ext = item.mimeType === 'image/png' ? 'png' : 'jpg'
  const path = `google-photos/${item.id}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: item.mimeType, upsert: true })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

async function main() {
  console.log('Google Photos から写真を取得中...')
  const accessToken = await getAccessToken()
  const photos = await fetchRecentPhotos(accessToken)
  console.log(`${photos.slice(0, SYNC_COUNT).length} 枚取得`)

  // 既存の google-photos 由来の works を削除
  const { error: delError } = await supabase
    .from('works')
    .delete()
    .eq('source', 'google-photos')
  if (delError) throw delError

  // 新しく登録
  for (const item of photos.slice(0, SYNC_COUNT)) {
    console.log(`処理中: ${item.filename}`)
    const thumbnailUrl = await uploadToSupabase(accessToken, item)
    const description = parseExif(item.mediaMetadata)
    const publishedAt = item.mediaMetadata?.creationTime
      ? new Date(item.mediaMetadata.creationTime).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)

    const { error } = await supabase.from('works').insert({
      title: item.filename.replace(/\.[^.]+$/, ''),
      description,
      thumbnail_url: thumbnailUrl,
      original_url: `${item.baseUrl}=d`,
      tags: ['Photography'],
      urls: [],
      published_at: publishedAt,
      source: 'google-photos',
      published: false,  // 管理画面で承認後に公開
    })
    if (error) throw error
    console.log(`登録完了: ${item.filename}`)
  }

  console.log('同期完了')
}

main().catch(e => { console.error(e); process.exit(1) })
