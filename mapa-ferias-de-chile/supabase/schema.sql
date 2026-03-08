-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor) to create the markets table.
-- Free tier is enough for this use case.
--
-- Table shape matches GeoJSON Feature: one row = one feature.
-- - geometry  = the GeoJSON geometry object (Point or LineString)
-- - properties = the rest (name, Días, Horario, etc.) as a single JSON object

create table if not exists public.markets (
  id uuid primary key default gen_random_uuid(),
  geometry jsonb not null,
  properties jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Optional: enable Row Level Security (RLS) and allow anonymous read/write for the anon key.
-- If you use auth later, replace with policies that check auth.uid().
alter table public.markets enable row level security;

create policy "Allow public read"
  on public.markets for select
  using (true);

create policy "Allow public insert"
  on public.markets for insert
  with check (true);

create policy "Allow public update"
  on public.markets for update
  using (true);

create policy "Allow public delete"
  on public.markets for delete
  using (true);

-- Column mapping (GeoJSON Feature → table):
--   feature.geometry  → geometry   e.g. { "type": "LineString", "coordinates": [[lng,lat], ...] }
--   feature.properties → properties e.g. { "name": "...", "Días": "...", "Horario": "..." }
--
-- If your source has flat columns (id, name, dias, horario, geom), insert like this:
--
--   insert into public.markets (geometry, properties)
--   values (
--     '{"type":"LineString","coordinates":[[-70.64,-33.50],[-70.65,-33.51]]}'::jsonb,
--     '{"name":"Feria Example","Días":"Viernes","Horario":"09:00 - 15:00"}'::jsonb
--   );
--
-- So: put the geometry object into geometry, and build one JSON object for properties from name/dias/horario.
