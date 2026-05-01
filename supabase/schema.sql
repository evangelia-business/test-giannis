-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Photos table
create table if not exists public.photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  image_url text not null,
  description text not null default '',
  latitude double precision,
  longitude double precision,
  place_name text,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.photos enable row level security;

-- Users can only see their own photos
create policy "Users can view own photos"
  on public.photos for select
  using (auth.uid() = user_id);

-- Users can insert their own photos
create policy "Users can insert own photos"
  on public.photos for insert
  with check (auth.uid() = user_id);

-- Users can delete their own photos
create policy "Users can delete own photos"
  on public.photos for delete
  using (auth.uid() = user_id);

-- Storage bucket for photos
insert into storage.buckets (id, name, public)
  values ('photos', 'photos', true)
  on conflict (id) do nothing;

-- Storage policies
create policy "Authenticated users can upload photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

create policy "Public can view photos"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Users can delete own photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
