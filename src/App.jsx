import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import WorkCard from './components/WorkCard'

const X_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const INSTAGRAM_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
)
const NOTE_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm4 3a1 1 0 0 0 0 2h10a1 1 0 0 0 0-2H7zm0 4a1 1 0 0 0 0 2h7a1 1 0 0 0 0-2H7z"/>
  </svg>
)
const GITHUB_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.17c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.479 5.92.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)
const YOUTUBE_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const CONTACT_LINKS = [
  { label: 'x.com/flashingwind',           href: 'https://x.com/flashingwind',                  icon: X_ICON },
  { label: 'instagram.com/flashingwind',    href: 'https://www.instagram.com/flashingwind',       icon: INSTAGRAM_ICON },
  { label: 'note.com/flashingwind',         href: 'https://note.com/flashingwind',                icon: NOTE_ICON },
  { label: 'github.com/flashingwind',       href: 'https://github.com/flashingwind',              icon: GITHUB_ICON },
  { label: 'youtube.com/@flashingwind',     href: 'https://www.youtube.com/@flashingwind',        icon: YOUTUBE_ICON },
]

export default function App() {
  const [works, setWorks] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') navigate('/admin', { replace: true })
    })
    supabase
      .from('works')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => { if (data) setWorks(data) })
  }, [])

  return (
    <>
      <nav>
        <a className="nav-logo" href="#">flashingwind</a>
        <div className="nav-links">
          <a href="#works">Works</a>
          <a href="#about">About</a>
        </div>
      </nav>

      <section id="works">
        <div className="works-grid">
          {works.map(w => <WorkCard key={w.id} work={w} />)}
        </div>
      </section>

      <section id="about">
        <div className="about-grid">
          <div className="about-card">
            <p className="section-label">About</p>
            <p className="about-text">
              flashingwind。Java / C / WordPress カスタマイズ / HTML / CSS。個人プロジェクトから細かいパソコンのお悩みまで。
            </p>
          </div>
          <div className="about-card">
            <p className="section-label">Contact</p>
            <div className="contact-links">
              {CONTACT_LINKS.map(({ label, href, icon }) => (
                <a key={href} href={href} target="_blank" rel="noreferrer" className="contact-link">
                  {icon}
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer>
        <span className="footer-copy">© 2025 flashingwind</span>
      </footer>
    </>
  )
}
