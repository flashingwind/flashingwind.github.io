import { useState } from 'react'
import { supabase } from '../lib/supabase'

const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'portfolio-assets'

export default function WorkForm({ initial, onSave, onCancel }) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    thumbnail_url: initial?.thumbnail_url ?? '',

    tags: (initial?.tags ?? []).join(', '),
    urls: (initial?.urls ?? [])[0] ?? '',
    published_at: initial?.published_at ?? new Date().toISOString().slice(0, 10),
  })
  const [thumbFile, setThumbFile] = useState(null)
  const [thumbPreview, setThumbPreview] = useState(initial?.thumbnail_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleThumbChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setThumbFile(file)
    setThumbPreview(URL.createObjectURL(file))
  }

  async function fetchOgpThumbnail(url) {
    if (!url || thumbFile || form.thumbnail_url) return
    try {
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      const img = data?.data?.image?.url || data?.data?.screenshot?.url
      if (img) { set('thumbnail_url', img); setThumbPreview(img) }
    } catch {}
  }

  async function uploadThumbnail() {
    if (!thumbFile) return form.thumbnail_url
    setUploading(true)
    const ext = thumbFile.name.split('.').pop()
    const path = `thumbnails/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, thumbFile, { upsert: true })
    setUploading(false)
    if (upErr) throw upErr
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const thumbnailUrl = await uploadThumbnail()
      const payload = {
        title: form.title,
        description: form.description,
        thumbnail_url: thumbnailUrl,

        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        urls: form.urls.trim() ? [form.urls.trim()] : [],
        published_at: form.published_at || null,
      }
      let result
      if (isEdit) {
        result = await supabase.from('works').update(payload).eq('id', initial.id).select().single()
      } else {
        result = await supabase.from('works').insert(payload).select().single()
      }
      if (result.error) throw result.error
      onSave(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="work-form" onSubmit={handleSubmit}>
      <h2 className="form-title">{isEdit ? '作品を編集' : '作品を追加'}</h2>

      <label className="form-label">
        タイトル <span className="required">*</span>
        <input
          className="form-input"
          type="text"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          required
        />
      </label>

      <label className="form-label">
        説明
        <textarea
          className="form-input form-textarea"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={4}
        />
      </label>

      <label className="form-label">
        サムネイル
        <div className="thumb-upload-area">
          {thumbPreview && (
            <img className="thumb-preview" src={thumbPreview} alt="thumbnail preview" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbChange}
            className="form-input-file"
          />
          {uploading && <span className="form-hint">アップロード中...</span>}
        </div>
        <input
          className="form-input"
          type="url"
          placeholder="または URL を直接入力"
          value={form.thumbnail_url}
          onChange={e => { set('thumbnail_url', e.target.value); setThumbPreview(e.target.value) }}
        />
      </label>

      <label className="form-label">
        タグ（カンマ区切り）
        <input
          className="form-input"
          type="text"
          placeholder="React, Vite, Supabase"
          value={form.tags}
          onChange={e => set('tags', e.target.value)}
        />
      </label>

      <label className="form-label">
        リンク
        <input
          className="form-input"
          type="url"
          placeholder="https://github.com/..."
          value={form.urls}
          onChange={e => set('urls', e.target.value)}
          onBlur={e => fetchOgpThumbnail(e.target.value.trim())}
        />
      </label>

      <label className="form-label">
        公開日
        <input
          className="form-input"
          type="date"
          value={form.published_at}
          onChange={e => set('published_at', e.target.value)}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>キャンセル</button>
        <button type="submit" className="btn-primary" disabled={saving || uploading}>
          {saving ? '保存中...' : isEdit ? '更新' : '追加'}
        </button>
      </div>
    </form>
  )
}
