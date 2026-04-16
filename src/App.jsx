import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import WorkCard from './components/WorkCard'

const CONTACT_LINKS = [
  { label: 'x.com/flashingwind',           href: 'https://x.com/flashingwind' },
  { label: 'instagram.com/flashingwind',    href: 'https://www.instagram.com/flashingwind' },
  { label: 'note.com/flashingwind',         href: 'https://note.com/flashingwind' },
  { label: 'github.com/flashingwind',       href: 'https://github.com/flashingwind' },
  { label: 'youtube.com/@flashingwind',     href: 'https://www.youtube.com/@flashingwind' },
]

export default function App() {
  const [works, setWorks] = useState([
    { id: '1', title: 'このポートフォリオサイト', description: 'React + Vite + Supabase で構築。', tags: ['React', 'Supabase'], urls: ['https://github.com/flashingwind/flashingwind.github.io'], published_at: '2025-06-01' },
    { id: '2', title: '映像作品 A', description: '短編映像プロジェクト。', tags: ['映像'], urls: ['https://youtube.com'], published_at: '2025-03-01' },
  ])

  // useEffect(() => {
  //   supabase
  //     .from('works')
  //     .select('*')
  //     .order('published_at', { ascending: false })
  //     .then(({ data }) => { if (data) setWorks(data) })
  // }, [])

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
              {CONTACT_LINKS.map(({ label, href }) => (
                <a key={href} href={href} target="_blank" rel="noreferrer" className="contact-link">
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
