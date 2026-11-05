import { useState } from 'react'
import { db } from '../lib/firebase'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'

function isTweetUrl(url) {
  return /x\.com|twitter\.com/.test(url) && /\/status\/\d+/.test(url)
}

function isImageUrl(url) {
  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url)
}

export default function WorkForm({ initial, onSave, onCancel }) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    thumbnail_url: initial?.thumbnail_url ?? '',
    tweet_url: initial?.tweet_url ?? '',
    tags: (initial?.tags ?? []).join(', '),
    url: (initial?.urls ?? [])[0] ?? '',
    published_at: initial?.published_at ?? new Date().toISOString().slice(0, 10),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleUrlBlur(url) {
    if (!url) return
    if (isTweetUrl(url)) {
      set('tweet_url', url)
      set('url', '')
      return
    }
    if (isImageUrl(url)) {
      set('thumbnail_url', url)
      return
    }
    // ウェブサイト → microlinkでOGP取得
    try {
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false`)
      const data = await res.json()
      const img = data?.data?.screenshot?.url || data?.data?.image?.url
      if (img) { set('thumbnail_url', img) }
    } catch (err) { console.error('microlink error:', err) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const thumbnailUrl = form.thumbnail_url
      const payload = {
        title: form.title,
        description: form.description,
        thumbnail_url: thumbnailUrl,
        tweet_url: form.tweet_url || null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        urls: form.url.trim() ? [form.url.trim()] : [],
        published_at: form.published_at || null,
        published: initial?.published ?? true,
      }
      if (isEdit) {
        await updateDoc(doc(db, 'works', initial.id), payload)
        onSave({ ...initial, ...payload, id: initial.id })
      } else {
        const ref = await addDoc(collection(db, 'works'), payload)
        onSave({ id: ref.id, ...payload })
      }
    } catch (err) {
      console.error('Failed to save work:', err)
      setError('保存に失敗しました。しばらく後に再度お試しください。')
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
          rows={3}
        />
      </label>

      <label className="form-label">
        URL（Twitter / 画像 / ウェブサイト）
        <input
          className="form-input"
          type="text"
          placeholder="https://..."
          value={form.url || form.tweet_url}
          onChange={e => { set('url', e.target.value); set('tweet_url', '') }}
          onBlur={e => handleUrlBlur(e.target.value.trim())}
        />
      </label>

      <label className="form-label">
        サムネイル画像URL
        <input
          className="form-input"
          type="text"
          placeholder="/images/example.jpg または https://..."
          value={form.thumbnail_url}
          onChange={e => set('thumbnail_url', e.target.value)}
        />
        {form.thumbnail_url && (
          <img className="thumb-preview" src={form.thumbnail_url} alt="thumbnail preview" />
        )}
        <span className="form-hint">画像ファイルはリポジトリの public/ 以下に置いて、そのパスを指定してください</span>
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
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? '保存中...' : isEdit ? '更新' : '追加'}
        </button>
      </div>
    </form>
  )
}
