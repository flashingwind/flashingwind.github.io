import { useEffect, useMemo, useState } from 'react';
import { supabase, hasSupabase, supabaseBucket } from './lib/supabase';
import { fileToDataUrl, uploadPreviewAsset } from './lib/storage';
import {
  createEmptyForm,
  createGeneratedPlaceholder,
  seedWorks,
  socialLinks,
} from './data/seed';
import {
  mapDbRowToWork,
  normalizeWork,
  readLocalWorks,
  sortWorksByPublishedAtDesc,
  toDbRow,
  writeLocalWorks,
} from './lib/works';

function App() {
  const [works, setWorks] = useState(seedWorks);
  const [form, setForm] = useState(createEmptyForm());
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
            .order('published_at', { ascending: false })
            .order('created_at', { ascending: false });

          if (error) {
            throw error;
          }

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
      if (!cancelled) {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setSelectedPreview('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setSelectedPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedFile]);

  const sortedWorks = useMemo(() => sortWorksByPublishedAtDesc(works), [works]);

  const stats = useMemo(
    () => [
      { label: '作品', value: `${sortedWorks.length} 件` },
      { label: '保存先', value: hasSupabase ? 'Supabase 優先' : 'LocalStorage 代替' },
      { label: '公開', value: 'GitHub Pages' },
    ],
    [sortedWorks.length],
  );

  const livePreview = selectedFile ? selectedPreview : form.thumbnailUrl.trim();

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus('保存中です...');

    try {
      const normalized = normalizeWork({
        ...form,
        id: crypto.randomUUID(),
      });

      let thumbnailUrl = normalized.thumbnailUrl;
      let thumbnailSource = normalized.thumbnailSource;

      if (selectedFile) {
        if (hasSupabase) {
          const uploaded = await uploadPreviewAsset(selectedFile, {
            bucket: supabaseBucket,
            supabaseClient: supabase,
          });
          thumbnailUrl = uploaded.url;
          thumbnailSource = uploaded.source;
        } else {
          thumbnailUrl = await fileToDataUrl(selectedFile);
          thumbnailSource = 'Local preview';
        }
      }

      if (!thumbnailUrl) {
        thumbnailUrl = createGeneratedPlaceholder(normalized.title || 'Untitled', normalized.publishedAt);
        thumbnailSource = 'Generated placeholder';
      }

      const nextWork = normalizeWork({
        ...normalized,
        thumbnailUrl,
        thumbnailSource,
      });

      if (hasSupabase) {
        const { data, error } = await supabase
          .from('works')
          .upsert(toDbRow(nextWork), { onConflict: 'id' })
          .select('*')
          .single();

        if (error) {
          throw error;
        }

        const savedWork = mapDbRowToWork(data);
        setWorks((current) =>
          sortWorksByPublishedAtDesc([
            savedWork,
            ...current.filter((entry) => entry.id !== savedWork.id),
          ]),
        );
        setStatus('Supabase に保存しました。');
      } else {
        const nextWorks = sortWorksByPublishedAtDesc([nextWork, ...works.filter((entry) => entry.id !== nextWork.id)]);
        writeLocalWorks(nextWorks);
        setWorks(nextWorks);
        setStatus('ローカルに保存しました。');
      }

      setForm(createEmptyForm());
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      setStatus('保存に失敗しました。Supabase の接続設定と RLS を確認してください。');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const nextWorks = sortedWorks.filter((entry) => entry.id !== id);

    if (hasSupabase) {
      const { error } = await supabase.from('works').delete().eq('id', id);
      if (error) {
        setStatus('削除に失敗しました。');
        return;
      }

      setWorks(nextWorks);
      setStatus('Supabase から削除しました。');
      return;
    }

    writeLocalWorks(nextWorks);
    setWorks(nextWorks);
    setStatus('ローカル保存から削除しました。');
  }

  function handleReset() {
    setForm(createEmptyForm());
    setSelectedFile(null);
    setSelectedPreview('');
    setStatus('入力を初期化しました。');
  }

  return (
    <div className="page-shell">
      <aside className="sidebar">
        <div className="eyebrow">Munenori IIDA / Portfolio</div>
        <h1>作品を登録して、時系列で見せる。</h1>
        <p className="lead">
          Supabase を軸に、作品登録・プレビュー・アップロード・並べ替えをまとめたポートフォリオの実装です。
          GitHub Pages は表示専用、データは Supabase に寄せる構成を前提にしています。
        </p>

        <div className="stat-list">
          {stats.map((item) => (
            <div className="stat-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        <nav className="link-list" aria-label="連絡先">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
            >
              <span>{link.label}</span>
              <span>{link.note}</span>
            </a>
          ))}
        </nav>

        <div className="status-box">
          <strong>状態</strong>
          <p>{loading ? '読み込み中です...' : status}</p>
        </div>

        <div className="status-box subtle">
          <strong>接続情報</strong>
          <p>
            {hasSupabase
              ? `Supabase ${supabaseBucket} を使用しています。`
              : 'VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を入れると Supabase 連携に切り替わります。'}
          </p>
        </div>
      </aside>

      <main className="content">
        <section className="hero">
          <div>
            <p className="section-label">React + Vite + GitHub Pages</p>
            <h2>バックエンドは Supabase、画像は Storage か Cloudinary。</h2>
            <p className="section-copy">
              作品は publishedAt の降順で自動整列します。YouTube や Instagram は URL を持たせるだけで追加でき、
              連絡先メールと GitHub / X の導線も同じ画面で管理できます。
            </p>
          </div>

          <div className="hero-grid">
            <div>
              <span>フロント</span>
              <strong>React + Vite</strong>
            </div>
            <div>
              <span>バックエンド</span>
              <strong>Supabase</strong>
            </div>
            <div>
              <span>公開</span>
              <strong>GitHub Actions</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="section-label">作品登録</p>
              <h3>作品を入力して、そのまま保存する。</h3>
            </div>
            <p className="panel-note">サムネイルはファイル選択でプレビューし、Supabase Storage へ送れます。</p>
          </div>

          <form className="entry-form" onSubmit={handleSubmit}>
            <label>
              <span>作品名</span>
              <input name="title" value={form.title} onChange={updateForm} placeholder="Brand Concept" required />
            </label>

            <label>
              <span>公開日</span>
              <input type="date" name="publishedAt" value={form.publishedAt} onChange={updateForm} required />
            </label>

            <label>
              <span>種別</span>
              <select name="type" value={form.type} onChange={updateForm}>
                <option>Web</option>
                <option>YouTube</option>
                <option>Instagram</option>
                <option>Photo</option>
                <option>Other</option>
              </select>
            </label>

            <label className="full-width">
              <span>概要</span>
              <textarea name="summary" value={form.summary} onChange={updateForm} placeholder="この作品の要点を短く書く" rows="3" />
            </label>

            <label>
              <span>Web URL</span>
              <input name="websiteUrl" value={form.websiteUrl} onChange={updateForm} placeholder="https://example.com" />
            </label>

            <label>
              <span>GitHub URL</span>
              <input name="githubUrl" value={form.githubUrl} onChange={updateForm} placeholder="https://github.com/..." />
            </label>

            <label>
              <span>YouTube URL</span>
              <input name="youtubeUrl" value={form.youtubeUrl} onChange={updateForm} placeholder="https://youtube.com/watch?v=..." />
            </label>

            <label>
              <span>Instagram URL</span>
              <input name="instagramUrl" value={form.instagramUrl} onChange={updateForm} placeholder="https://www.instagram.com/..." />
            </label>

            <label>
              <span>連絡先メール</span>
              <input name="contactEmail" value={form.contactEmail} onChange={updateForm} placeholder="hello@example.com" />
            </label>

            <label className="full-width">
              <span>サムネイル画像</span>
              <input type="file" accept="image/*" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
            </label>

            <label className="full-width">
              <span>サムネイルURL</span>
              <input name="thumbnailUrl" value={form.thumbnailUrl} onChange={updateForm} placeholder="手入力する場合はこちら" />
            </label>

            <div className="preview-panel full-width">
              <div>
                <p className="section-label">プレビュー</p>
                <h4>{form.title || '未入力'}</h4>
                <p>{form.summary || '概要がここに表示されます。'}</p>
              </div>

              <div className="preview-frame">
                {livePreview ? (
                  <img src={livePreview} alt="preview" />
                ) : (
                  <div className="preview-empty">画像を選ぶとここにプレビューが出ます。</div>
                )}
              </div>
            </div>

            <div className="form-actions full-width">
              <button type="submit" disabled={saving}>{saving ? '保存中...' : '保存する'}</button>
              <button type="button" className="secondary" onClick={handleReset}>リセット</button>
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="section-label">作品一覧</p>
              <h3>新しい順に並べた公開データ。</h3>
            </div>
            <p className="panel-note">並び順は publishedAt による自動整列です。</p>
          </div>

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
                    <button type="button" className="text-button" onClick={() => handleDelete(work.id)}>削除</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="footnote">ローカル実行では LocalStorage に保存し、Supabase 設定後は works テーブルと storage bucket に切り替わります。</p>
      </main>
    </div>
  );
}

export default App;
