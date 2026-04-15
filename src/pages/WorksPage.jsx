import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, hasSupabase } from '../lib/supabase';
import { seedWorks, socialLinks, createGeneratedPlaceholder } from '../data/seed';
import { sortWorksByPublishedAtDesc, mapDbRowToWork, readLocalWorks } from '../lib/works';

function WorksPage() {
  const [works, setWorks] = useState(seedWorks);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadWorks() {
      setLoading(true);

      if (hasSupabase) {
        try {
          const { data, error } = await supabase
            .from('works')
            .select('*')
            .eq('is_public', true)
            .order('published_at', { ascending: false })
            .order('created_at', { ascending: false });

          if (error) throw error;

          const remoteWorks = (data ?? []).map(mapDbRowToWork);
          const nextWorks = remoteWorks.length > 0 ? remoteWorks : seedWorks;

          if (!cancelled) {
            setWorks(sortWorksByPublishedAtDesc(nextWorks));
            setStatus(
              remoteWorks.length > 0
                ? 'Supabase から作品を読み込みました。'
                : 'Supabase にまだ作品がないため、サンプルを表示しています。',
            );
          }
          return;
        } catch (error) {
          console.error(error);
          if (!cancelled) {
            setStatus('Supabase の読み込みに失敗したため、サンプルに切り替えました。');
          }
        }
      }

      const localWorks = readLocalWorks();
      if (!cancelled) {
        setWorks(sortWorksByPublishedAtDesc(localWorks.length > 0 ? localWorks : seedWorks));
        setStatus('ローカル保存のサンプルを表示しています。');
      }
    }

    loadWorks().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const sortedWorks = useMemo(() => sortWorksByPublishedAtDesc(works), [works]);

  return (
    <div className="page-shell-public">
      <main className="content">
        <header className="public-header">
          <div className="eyebrow">Munenori IIDA / Portfolio</div>

          <nav className="social-row" aria-label="連絡先">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </header>

        <section className="panel">
          <div className="works-grid">
            {sortedWorks.map((work, index) => (
              <article className="work-card" key={work.id} style={{ '--tilt': `${index % 2 === 0 ? -1.2 : 0.9}deg` }}>
                <img
                  className="work-thumb"
                  src={work.thumbnailUrl || createGeneratedPlaceholder(work.title, work.publishedAt)}
                  alt={work.title}
                  loading="lazy"
                />
                <div className="work-body">
                  <div className="work-meta">
                    <strong>{work.title}</strong>
                    <span>{work.publishedAt}</span>
                  </div>
                  <p>{work.summary}</p>
                  <div className="chip-row">
                    <span className="chip">{work.type}</span>
                    {work.websiteUrl ? <a className="chip" href={work.websiteUrl} target="_blank" rel="noreferrer">Web</a> : null}
                    {work.githubUrl ? <a className="chip" href={work.githubUrl} target="_blank" rel="noreferrer">GitHub</a> : null}
                    {work.youtubeUrl ? <a className="chip" href={work.youtubeUrl} target="_blank" rel="noreferrer">YouTube</a> : null}
                    {work.instagramUrl ? <a className="chip" href={work.instagramUrl} target="_blank" rel="noreferrer">Instagram</a> : null}
                    {work.contactEmail ? <a className="chip" href={`mailto:${work.contactEmail}`}>Mail</a> : null}
                  </div>
                  <div className="card-footer">
                    <span>{work.thumbnailSource || 'No source'}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="footnote">Powered by Supabase &amp; GitHub Pages &middot; <Link to="/admin" style={{ color: '#22584c' }}>管理者用</Link></p>
      </main>
    </div>
  );
}

export default WorksPage;
