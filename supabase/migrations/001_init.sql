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
