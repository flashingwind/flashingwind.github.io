import { useEffect, useState } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login', { replace: true })
      else setChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login', { replace: true })
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  async function handleLogout() {
    await supabase.auth.signOut()
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
