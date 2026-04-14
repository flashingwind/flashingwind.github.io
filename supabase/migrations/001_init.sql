create extension if not exists pgcrypto;

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  published_at date not null default current_date,
  type text not null default 'Web',
  summary text not null default '',
  website_url text not null default '',
  github_url text not null default '',
  youtube_url text not null default '',
  instagram_url text not null default '',
  contact_email text not null default '',
  thumbnail_url text not null default '',
  thumbnail_source text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists works_published_at_idx on public.works (published_at desc, created_at desc);

alter table public.works enable row level security;

drop policy if exists "public read works" on public.works;
drop policy if exists "authenticated insert works" on public.works;
drop policy if exists "authenticated update works" on public.works;
drop policy if exists "authenticated delete works" on public.works;

create policy "public read works"
  on public.works
  for select
  using (true);

create policy "authenticated insert works"
  on public.works
  for insert
  with check (auth.uid() is not null);

create policy "authenticated update works"
  on public.works
  for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "authenticated delete works"
  on public.works
  for delete
  using (auth.uid() is not null);

insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do nothing;

drop policy if exists "portfolio public read assets" on storage.objects;
drop policy if exists "portfolio authenticated upload assets" on storage.objects;
drop policy if exists "portfolio authenticated update assets" on storage.objects;
drop policy if exists "portfolio authenticated delete assets" on storage.objects;

create policy "portfolio public read assets"
  on storage.objects
  for select
  using (bucket_id = 'portfolio-assets');

create policy "portfolio authenticated upload assets"
  on storage.objects
  for insert
  with check (bucket_id = 'portfolio-assets' and auth.uid() is not null);

create policy "portfolio authenticated update assets"
  on storage.objects
  for update
  using (bucket_id = 'portfolio-assets' and auth.uid() is not null)
  with check (bucket_id = 'portfolio-assets' and auth.uid() is not null);

create policy "portfolio authenticated delete assets"
  on storage.objects
  for delete
  using (bucket_id = 'portfolio-assets' and auth.uid() is not null);

insert into public.works (
  id,
  title,
  published_at,
  type,
  summary,
  website_url,
  github_url,
  youtube_url,
  instagram_url,
  contact_email,
  thumbnail_url,
  thumbnail_source,
  created_at,
  updated_at
) values
  (
    '11111111-1111-1111-1111-111111111111',
    'Brand Concept',
    '2026-04-11',
    'Web',
    'ブランドサイト / 世界観に合わせた構成。',
    'https://example.com/brand-concept',
    'https://github.com/flashingwind',
    '',
    '',
    'hello@example.com',
    '',
    'Seed data',
    now(),
    now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Analytics UX',
    '2026-03-15',
    'Web',
    'データ活用UI / 可視化と体験改善。',
    'https://example.com/analytics-ux',
    '',
    '',
    '',
    'hello@example.com',
    '',
    'Seed data',
    now(),
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Recruit Site',
    '2026-02-20',
    'Web',
    '採用向け特設サイト / 導線改善。',
    'https://example.com/recruit-site',
    '',
    '',
    '',
    'hello@example.com',
    '',
    'Seed data',
    now(),
    now()
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'YouTube Case',
    '2025-12-18',
    'YouTube',
    '動画作品をカードとして載せるためのサンプル。',
    '',
    '',
    'https://youtube.com/watch?v=dQw4w9WgXcQ',
    '',
    'hello@example.com',
    '',
    'Seed data',
    now(),
    now()
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'EC Promotion',
    '2025-10-08',
    'Web',
    '商品ページ最適化 / クリック率改善。',
    'https://example.com/ec-promotion',
    '',
    '',
    '',
    'hello@example.com',
    '',
    'Seed data',
    now(),
    now()
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Photo Story',
    '2025-08-30',
    'Photo',
    '趣味写真をポラロイド風に見せるためのサンプル。',
    '',
    '',
    '',
    'https://www.instagram.com/',
    'hello@example.com',
    '',
    'Seed data',
    now(),
    now()
  )
on conflict (id) do nothing;
