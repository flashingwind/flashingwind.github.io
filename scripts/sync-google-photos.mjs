import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
const BUCKET = process.env.VITE_SUPABASE_BUCKET || 'portfolio-assets'
const DRIVE_FOLDER_ID = '1o7uFoVAIPvGgU9Bq7bLLmn_rBbiy249-'
const SYNC_COUNT = 12

console.log('Environment check:')
console.log('VITE_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
console.log('SUPABASE_SERVICE_KEY:', SUPABASE_KEY ? '✓' : '✗')
console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? '✓' : '✗')
console.log('GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET ? '✓' : '✗')
console.log('GOOGLE_REFRESH_TOKEN:', GOOGLE_REFRESH_TOKEN ? '✓' : '✗')

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

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

async function fetchDrivePhotos(accessToken) {
  const query = encodeURIComponent(
    `'${DRIVE_FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`
  )
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&pageSize=${SYNC_COUNT}&orderBy=createdTime desc&fields=files(id,name,mimeType,createdTime,imageMediaMetadata)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const data = await res.json()
  if (data.error) throw new Error(`Drive error: ${JSON.stringify(data.error)}`)
  return data.files || []
}

function parseExif(meta) {
  if (!meta) return ''
  const lines = []
  if (meta.time) lines.push(`撮影日時: ${meta.time}`)
  if (meta.cameraMake) lines.push(`カメラ: ${meta.cameraMake} ${meta.cameraModel || ''}`.trim())
  if (meta.focalLength) lines.push(`焦点距離: ${meta.focalLength}mm`)
  if (meta.aperture) lines.push(`f/${meta.aperture}`)
  if (meta.exposureTime) {
    const ss = meta.exposureTime < 1 ? `1/${Math.round(1 / meta.exposureTime)}` : `${meta.exposureTime}`
    lines.push(`${ss}s`)
  }
  if (meta.isoSpeed) lines.push(`ISO${meta.isoSpeed}`)
  return lines.join('\n')
}

async function uploadToSupabase(accessToken, file) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) throw new Error(`Drive download failed: ${res.status}`)
  const buffer = await res.arrayBuffer()

  const ext = file.mimeType === 'image/png' ? 'png' : 'jpg'
  const path = `google-photos/${file.id}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.mimeType, upsert: true })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

async function main() {
  console.log('Google Drive から写真を取得中...')
  const accessToken = await getAccessToken()
  const files = await fetchDrivePhotos(accessToken)
  console.log(`${files.length} 枚取得`)

  if (files.length === 0) {
    console.log('新しい写真なし')
    return
  }

  // 既存の google-photos 由来の works を削除
  const { error: delError } = await supabase
    .from('works')
    .delete()
    .eq('source', 'google-photos')
  if (delError) throw delError

  for (const file of files) {
    console.log(`処理中: ${file.name}`)
    const thumbnailUrl = await uploadToSupabase(accessToken, file)
    const description = parseExif(file.imageMediaMetadata)
    const publishedAt = file.createdTime
      ? new Date(file.createdTime).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)

    const { error } = await supabase.from('works').insert({
      title: file.name.replace(/\.[^.]+$/, ''),
      description,
      thumbnail_url: thumbnailUrl,
      original_url: thumbnailUrl,
      tags: ['Photography'],
      urls: [],
      published_at: publishedAt,
      source: 'google-photos',
      published: false,
    })
    if (error) throw error
    console.log(`登録完了: ${file.name}`)
  }

  console.log('同期完了')
}

main().catch(e => { console.error(e); process.exit(1) })
