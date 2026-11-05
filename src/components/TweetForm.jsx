import { useState } from 'react'
import { db } from '../lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

export default function TweetForm({ onSave, onCancel }) {
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim()) return
    setSaving(true)
    setError('')
    try {
      const tweetId = url.match(/status\/(\d+)/)?.[1]
      if (!tweetId) throw new Error('URLからツイートIDを取得できませんでした')

      const title = ''

      const payload = {
        title,
        tweet_url: url.trim(),
        tags: ['Twitter'],
        urls: [],
        published_at: new Date().toISOString().slice(0, 10),
        published: true,
      }
      const ref = await addDoc(collection(db, 'works'), payload)
      onSave({ id: ref.id, ...payload })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="work-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Tweet を追加</h2>

      <label className="form-label">
        Tweet URL <span className="required">*</span>
        <input
          className="form-input"
          type="url"
          placeholder="https://x.com/user/status/..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
          autoFocus
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>キャンセル</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? '追加中...' : '追加'}
        </button>
      </div>
    </form>
  )
}
