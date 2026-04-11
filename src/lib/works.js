export const LOCAL_STORAGE_KEY = 'munenori-iida-portfolio-works-v1';

function trimValue(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

export function normalizeWork(work) {
  const publishedAt = trimValue(work.publishedAt) || new Date().toISOString().slice(0, 10);

  return {
    id: work.id || crypto.randomUUID(),
    title: trimValue(work.title),
    publishedAt,
    type: trimValue(work.type) || 'Web',
    summary: trimValue(work.summary),
    websiteUrl: trimValue(work.websiteUrl),
    githubUrl: trimValue(work.githubUrl),
    youtubeUrl: trimValue(work.youtubeUrl),
    instagramUrl: trimValue(work.instagramUrl),
    contactEmail: trimValue(work.contactEmail),
    thumbnailUrl: trimValue(work.thumbnailUrl),
    thumbnailSource: trimValue(work.thumbnailSource),
    createdAt: trimValue(work.createdAt),
    updatedAt: trimValue(work.updatedAt),
  };
}

export function sortWorksByPublishedAtDesc(items) {
  return [...items].sort((left, right) => {
    const dateCompare = (right.publishedAt || '').localeCompare(left.publishedAt || '');
    if (dateCompare !== 0) {
      return dateCompare;
    }

    return (right.createdAt || '').localeCompare(left.createdAt || '');
  });
}

export function readLocalWorks() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeWork) : [];
  } catch {
    return [];
  }
}

export function writeLocalWorks(items) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export function mapDbRowToWork(row) {
  return normalizeWork({
    id: row.id,
    title: row.title,
    publishedAt: row.published_at,
    type: row.type,
    summary: row.summary,
    websiteUrl: row.website_url,
    githubUrl: row.github_url,
    youtubeUrl: row.youtube_url,
    instagramUrl: row.instagram_url,
    contactEmail: row.contact_email,
    thumbnailUrl: row.thumbnail_url,
    thumbnailSource: row.thumbnail_source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export function toDbRow(work) {
  const normalized = normalizeWork(work);

  return {
    id: normalized.id,
    title: normalized.title,
    published_at: normalized.publishedAt,
    type: normalized.type,
    summary: normalized.summary,
    website_url: normalized.websiteUrl,
    github_url: normalized.githubUrl,
    youtube_url: normalized.youtubeUrl,
    instagram_url: normalized.instagramUrl,
    contact_email: normalized.contactEmail,
    thumbnail_url: normalized.thumbnailUrl,
    thumbnail_source: normalized.thumbnailSource,
    created_at: normalized.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
