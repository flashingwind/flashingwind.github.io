import { useState, useEffect, useRef } from 'react'

const ICONS = {
  github:    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.17c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.479 5.92.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z"/></svg>,
  youtube:   <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  instagram: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
  web:       <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
  mail:      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
}

function linkType(url) {
  if (!url) return null
  if (url.includes('github.com'))    return 'github'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('instagram.com')) return 'instagram'
  if (url.startsWith('mailto:'))     return 'mail'
  return 'web'
}

function TweetEmbed({ url }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!url || !ref.current) return
    ref.current.innerHTML = ''
    const render = () => {
      window.twttr?.widgets.createTweet(
        url.match(/status\/(\d+)/)?.[1],
        ref.current,
        { theme: 'dark', dnt: true, conversation: 'none' }
      )
    }
    if (window.twttr) {
      render()
    } else {
      const s = document.createElement('script')
      s.src = 'https://platform.twitter.com/widgets.js'
      s.onload = render
      document.head.appendChild(s)
    }
  }, [url])

  return <div ref={ref} />
}

function PhotoModal({ work, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-inner" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <img
          className="modal-image"
          src={work.original_url || work.thumbnail_url}
          alt={work.title}
        />
        {work.description && (
          <pre className="modal-exif">{work.description}</pre>
        )}
      </div>
    </div>
  )
}

export default function WorkCard({ work }) {
  const { title, description, thumbnail_url, original_url, tags, published_at, urls, source, tweet_url } = work
  const date = published_at ? published_at.slice(0, 7) : ''
  const linkList = (urls || []).filter(Boolean)
  const isPhoto = source === 'google-photos'
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="work-card">
        {tweet_url ? (
          <TweetEmbed url={tweet_url} />
        ) : (
          <div
            className={`work-thumb${isPhoto ? ' work-thumb-clickable' : ''}`}
            onClick={isPhoto ? () => setOpen(true) : undefined}
          >
            {thumbnail_url
              ? <img src={thumbnail_url} alt={title} />
              : <svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="6" width="20" height="14" rx="1"/><circle cx="8" cy="11" r="2"/><path d="M2 17l5-4 4 3 4-3 7 5H2z"/></svg>
            }
          </div>
        )}
        <div className="work-meta">
          <span className="work-date">{date}</span>
          <div className="work-tags">
            {(tags || []).map(t => <span key={t} className="work-tag">{t}</span>)}
          </div>
        </div>
        {title && <div className="work-title">{title}</div>}
        {description && !tweet_url && (
          <pre className="work-desc work-exif">{description}</pre>
        )}
        {linkList.length > 0 && (
          <div className="work-links">
            {linkList.map(url => {
              const type = linkType(url)
              return (
                <a key={url} className="work-link" href={url} target="_blank" rel="noreferrer">
                  {ICONS[type]}
                </a>
              )
            })}
          </div>
        )}
      </div>

      {open && <PhotoModal work={work} onClose={() => setOpen(false)} />}
    </>
  )
}
