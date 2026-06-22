-- 0086_cek_kesiapan_readiness.sql
-- "Analisa Kesiapan Merantau" — live webinar engagement + readiness lead-magnet.
-- Non-PII by design: stores first name + a/b/c answers + computed persona only
-- (no email/phone), so the live dashboard can safely subscribe via Realtime.
-- Public anon insert/select via RLS so the tool needs no login.

create table if not exists public.readiness_responses (
  id uuid primary key default gen_random_uuid(),
  session_key text not null default 'wtr-2026-06-23',
  name text not null,
  answers jsonb not null default '{}'::jsonb,
  persona text not null check (persona in ('pemimpi', 'penjajak', 'siap')),
  score int not null default 0,
  sector_interest text check (sector_interest in ('hospitality', 'healthcare', 'unsure')),
  created_at timestamptz not null default now()
);

create index if not exists readiness_responses_session_created_idx
  on public.readiness_responses (session_key, created_at desc);

alter table public.readiness_responses enable row level security;

-- Anon may insert (public engagement tool). Light guard: name length 1..40.
drop policy if exists "readiness anon insert" on public.readiness_responses;
create policy "readiness anon insert" on public.readiness_responses
  for insert to anon, authenticated
  with check (char_length(name) between 1 and 40);

-- Anon may read (live dashboard aggregate + ticker; rows are non-PII).
drop policy if exists "readiness anon read" on public.readiness_responses;
create policy "readiness anon read" on public.readiness_responses
  for select to anon, authenticated
  using (true);

-- Realtime: emit INSERTs to the live dashboard (idempotent add).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'readiness_responses'
  ) then
    execute 'alter publication supabase_realtime add table public.readiness_responses';
  end if;
end $$;
