import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore'
import WorkForm from '../../components/WorkForm'

export default function AdminWorks() {
  const [works, setWorks] = useState([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState(null) // null | 'add' | { edit: work }
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWorks()
  }, [])

  async function fetchWorks() {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, 'works'))
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setWorks(all.sort((a, b) => (b.published_at || '').localeCompare(a.published_at || '')))
    } catch (err) {
      console.error('Failed to fetch works:', err)
      setError('作品の読み込みに失敗しました。')
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('この作品を削除しますか？')) return
    try {
      await deleteDoc(doc(db, 'works', id))
    } catch (err) { console.error('Failed to delete work:', err); setError('削除に失敗しました。'); return }
    setWorks(ws => ws.filter(w => w.id !== id))
  }

  async function handleTogglePublish(w) {
    try {
      await updateDoc(doc(db, 'works', w.id), { published: !w.published })
    } catch (err) { console.error('Failed to update work:', err); setError('更新に失敗しました。'); return }
    setWorks(ws => ws.map(x => x.id === w.id ? { ...x, published: !w.published } : x))
  }

  function handleSave(saved) {
    if (mode === 'add') {
      setWorks(ws => [saved, ...ws])
    } else {
      setWorks(ws => ws.map(w => w.id === saved.id ? saved : w))
    }
    setMode(null)
  }

if (mode === 'add' || (mode && mode.edit)) {
    return (
      <div className="admin-section">
        <WorkForm
          initial={mode.edit ?? null}
          onSave={handleSave}
          onCancel={() => setMode(null)}
        />
      </div>
    )
  }

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h1 className="admin-title">Works 管理</h1>
        <button className="btn-primary" onClick={() => setMode('add')}>+ 追加</button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="admin-hint">読み込み中...</p>
      ) : works.length === 0 ? (
        <p className="admin-hint">作品がまだありません。</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>サムネイル</th>
              <th>タイトル</th>
              <th>タグ</th>
              <th>公開日</th>
              <th>公開</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {works.map(w => (
              <tr key={w.id} className={w.published ? '' : 'admin-row-draft'}>
                <td>
                  {w.thumbnail_url
                    ? <img className="admin-thumb" src={w.thumbnail_url} alt="" />
                    : <div className="admin-thumb admin-thumb-empty" />}
                </td>
                <td className="admin-td-title">{w.title}</td>
                <td>
                  <div className="admin-tags">
                    {(w.tags ?? []).map(t => (
                      <span key={t} className="work-tag">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="admin-td-date">{w.published_at?.slice(0, 10) ?? '—'}</td>
                <td>
                  <button
                    className={w.published ? 'btn-publish-on btn-sm' : 'btn-publish-off btn-sm'}
                    onClick={() => handleTogglePublish(w)}
                  >
                    {w.published ? '公開中' : '下書き'}
                  </button>
                </td>
                <td>
                  <div className="admin-actions">
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => setMode({ edit: w })}
                    >
                      編集
                    </button>
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => handleDelete(w.id)}
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
