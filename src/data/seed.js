const palettePairs = [
  ['#22584c', '#4f8f7f'],
  ['#4b5f8f', '#79a6d2'],
  ['#934f7a', '#d3a05e'],
  ['#9b6f2d', '#d9b46f'],
  ['#354b5e', '#7f9eb2'],
  ['#6b4d3f', '#d29b7e'],
  ['#67508c', '#a9b4de'],
  ['#25736a', '#80c3a8'],
  ['#2d6a4f', '#95c59c'],
  ['#335d7e', '#8db7d9'],
  ['#72503b', '#be9771'],
  ['#8b4c3b', '#d28d6d'],
];

function buildPlaceholder(title, publishedAt, from, to) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-labelledby="title desc">
      <title>${title}</title>
      <desc>${publishedAt}</desc>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)" />
      <circle cx="190" cy="180" r="220" fill="rgba(255,255,255,0.18)" />
      <circle cx="940" cy="180" r="180" fill="rgba(255,255,255,0.12)" />
      <path d="M0 620 C190 540, 310 750, 520 660 S900 520, 1200 680 V900 H0 Z" fill="rgba(255,255,255,0.18)" />
      <path d="M0 710 C210 620, 420 840, 640 720 S980 630, 1200 760 V900 H0 Z" fill="rgba(0,0,0,0.14)" />
      <text x="64" y="124" fill="rgba(255,255,255,0.94)" font-family="Avenir Next, Hiragino Kaku Gothic ProN, Yu Gothic, sans-serif" font-size="56" font-weight="700">${title}</text>
      <text x="64" y="178" fill="rgba(255,255,255,0.84)" font-family="Avenir Next, Hiragino Kaku Gothic ProN, Yu Gothic, sans-serif" font-size="28">${publishedAt}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createSeedWork({ id, title, publishedAt, type, summary, index, websiteUrl = '', githubUrl = '', youtubeUrl = '', instagramUrl = '', contactEmail = '' }) {
  const [from, to] = palettePairs[index % palettePairs.length];

  return {
    id,
    title,
    publishedAt,
    type,
    summary,
    websiteUrl,
    githubUrl,
    youtubeUrl,
    instagramUrl,
    contactEmail,
    thumbnailUrl: buildPlaceholder(title, publishedAt, from, to),
    thumbnailSource: 'Seed placeholder',
    createdAt: `${publishedAt}T00:00:00.000Z`,
    updatedAt: `${publishedAt}T00:00:00.000Z`,
  };
}

export function createEmptyForm() {
  return {
    title: '',
    publishedAt: new Date().toISOString().slice(0, 10),
    type: 'Web',
    summary: '',
    websiteUrl: '',
    githubUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    contactEmail: '',
    thumbnailUrl: '',
    thumbnailSource: '',
  };
}

export function createGeneratedPlaceholder(title, publishedAt) {
  return buildPlaceholder(title, publishedAt, '#58647c', '#b79b7a');
}

export const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/flashingwind', note: 'profile' },
  { label: 'X', href: 'https://x.com/flashingwind', note: 'social' },
  { label: 'Mail', href: 'mailto:flashingwind@gmail.com', note: 'contact' },
];

export const seedWorks = [
  createSeedWork({
    id: 'seed-1',
    title: 'Brand Concept',
    publishedAt: '2026-04-11',
    type: 'Web',
    summary: 'ブランドサイト / 世界観に合わせた構成。',
    index: 0,
    websiteUrl: 'https://example.com/brand-concept',
    githubUrl: 'https://github.com/flashingwind',
  }),
  createSeedWork({
    id: 'seed-2',
    title: 'Analytics UX',
    publishedAt: '2026-03-15',
    type: 'Web',
    summary: 'データ活用UI / 可視化と体験改善。',
    index: 1,
    websiteUrl: 'https://example.com/analytics-ux',
  }),
  createSeedWork({
    id: 'seed-3',
    title: 'Recruit Site',
    publishedAt: '2026-02-20',
    type: 'Web',
    summary: '採用向け特設サイト / 導線改善。',
    index: 2,
    websiteUrl: 'https://example.com/recruit-site',
  }),
  createSeedWork({
    id: 'seed-4',
    title: 'YouTube Case',
    publishedAt: '2025-12-18',
    type: 'YouTube',
    summary: '動画作品をカードとして載せるためのサンプル。',
    index: 3,
    youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
  }),
  createSeedWork({
    id: 'seed-5',
    title: 'EC Promotion',
    publishedAt: '2025-10-08',
    type: 'Web',
    summary: '商品ページ最適化 / クリック率改善。',
    index: 4,
    websiteUrl: 'https://example.com/ec-promotion',
  }),
  createSeedWork({
    id: 'seed-6',
    title: 'Photo Story',
    publishedAt: '2025-08-30',
    type: 'Photo',
    summary: '趣味写真をポラロイド風に見せるためのサンプル。',
    index: 5,
    instagramUrl: 'https://www.instagram.com/',
  }),
];
