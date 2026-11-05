import { useEffect, useState } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { auth } from '../../lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/login', { replace: true })
      else setChecking(false)
    })

    return () => unsubscribe()
  }, [navigate])

  async function handleLogout() {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  if (checking) return <div className="admin-loading">認証確認中...</div>

  return (
    <div className="admin-wrap">
      <nav className="admin-nav">
        <Link to="/" className="admin-nav-logo">flashingwind</Link>
        <div className="admin-nav-links">
          <Link to="/admin">Works</Link>
        </div>
        <button className="btn-logout" onClick={handleLogout}>ログアウト</button>
      </nav>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
