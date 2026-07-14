-- 0101_countries_registry.sql
-- Country registry: single source of truth for all country metadata, replacing
-- the 6 hardcoded copies duplicated across apps/web (positions.ts,
-- positions-db.ts, lowonganCountries.ts, lowongan/page.tsx, PositionCard.tsx,
-- jsonld.ts) and packages/db/src/country.ts. Those copies had already drifted:
-- packages/db knew 6 countries while apps/web knew 8, so live Bulgaria + Kuwait
-- positions vanished from the candidate portal's /explore.
--
-- Additive + backward-compatible: nothing reads this table yet, so applying it
-- to production is inert for the running site. The FK positions.country ->
-- countries.db_value is intentionally deferred to a later migration (after the
-- new admin create form ships) so the currently-deployed free-text create path
-- keeps working during rollout (expand-contract).

create table if not exists public.countries (
  key                 text primary key,                 -- internal key: saudi, jepang, ...
  db_value            text not null unique,             -- literal stored in positions.country
  label               text not null,                    -- candidate-facing display name
  initials            text not null,                    -- 2-letter badge for the admin CRM
  flag                text not null,                    -- flag emoji
  currency            text not null default '',         -- e.g. "SAR riyal", "¥ yen"
  contract            text not null default '',         -- default contract label
  tagline             text not null default '',         -- chapter band tagline (web)
  image_url           text not null default '',         -- country band/card image (path or URL)
  img_filter          text not null default '',         -- CSS filter over the web band image
  tint_hex            text not null default '#4f6d7a',  -- web band + card fallback tint
  portal_tint_hex     text not null default '#4f6d7a',  -- portal card background tint
  portal_tint_filter  text not null default '',         -- portal hero image grade filter
  iso                 text not null default '',         -- ISO 3166-1 alpha-2 for JobPosting
  default_city        text not null default '',         -- fallback city when a slug has none
  aliases             text[] not null default '{}',     -- raw country strings that map to this key
  sort_order          int not null default 100,         -- display order for tiles/chapters
  active              boolean not null default true,    -- shows as a country chapter/filter
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.countries is
  'Single source of truth for country display metadata (label, flag, tint, tagline, city, ISO). Read by apps/web (listing/detail/sitemap/JSON-LD), apps/platform (explore/dashboard), and the admin position editor. Adding a country = inserting a row (no code deploy).';

alter table public.countries enable row level security;

-- Public read: country metadata is not sensitive and every candidate surface needs it.
create policy countries_anon_read on public.countries
  for select to anon, authenticated using (true);

-- Admin-only write, mirroring positions_admin_write.
create policy countries_admin_write on public.countries
  for all to authenticated using (is_admin()) with check (is_admin());

create trigger trg_countries_updated_at
  before update on public.countries
  for each row execute function set_updated_at();

create index idx_countries_active_sort on public.countries (active, sort_order);

-- Seed the 8 live countries + a "Global" bucket for country="any" positions.
-- Values mirror the pre-migration hardcoded maps exactly, except: (1) Saudi's
-- label is unified to "Saudi Arabia" (was "Arab Saudi" only in the portal), and
-- (2) taglines had their em dashes normalized to commas.
insert into public.countries
  (key, db_value, label, initials, flag, currency, contract, tagline, image_url, img_filter, tint_hex, portal_tint_hex, portal_tint_filter, iso, default_city, aliases, sort_order, active)
values
  ('saudi', 'saudi_arabia', 'Saudi Arabia', 'SA', '🇸🇦', 'SAR riyal', 'Kontrak 2 tahun',
   'Hospitality, perawat, mekanik berat, gaji riyal, makan ditanggung. Banyak posisi terbuka di Riyadh & Jeddah.',
   '/images/countries/saudi.jpg', 'saturate(1.05) brightness(0.96) sepia(0.18)', '#b89358', '#8a5a14', 'saturate(1.05) brightness(0.94) sepia(0.16)',
   'SA', 'Riyadh', array['saudi','saudi_arabia','saudi arabia','arab saudi','ksa'], 1, true),

  ('jepang', 'japan', 'Jepang', 'JP', '🇯🇵', '¥ yen', 'Sistem SSW · 5 tahun',
   'Sistem SSW resmi pemerintah Jepang. Caregiver (Kaigo), food service, dan pengolahan makanan, kerja terstruktur, hak penuh.',
   '/images/countries/jepang.jpg', 'saturate(0.85) brightness(0.92) hue-rotate(-8deg)', '#36598c', '#1c3d6e', 'saturate(0.85) brightness(0.92) hue-rotate(-8deg)',
   'JP', 'Tokyo', array['japan','jepang'], 2, true),

  ('taiwan', 'taiwan', 'Taiwan', 'TW', '🇹🇼', 'NT$', 'Kontrak 3 tahun',
   'Caregiver di rumah tangga atau panti. Kontrak 3 tahun, lingkungan kerja yang dekat dengan keluarga Taiwan.',
   '/images/countries/taiwan.jpg', 'saturate(1.1) brightness(0.97)', '#3a8567', '#1e6d4d', 'saturate(1.1) brightness(0.95)',
   'TW', 'Taipei', array['taiwan'], 3, true),

  ('europe', 'europe', 'Eropa Timur', 'EU', '🇪🇺', 'Euro (€)', 'Kontrak 1 tahun',
   'Posisi spesialis pengeboran (drilling) di project site Eropa Timur. Untuk tenaga berpengalaman, gaji euro, kontrak resmi lewat jalur yang benar.',
   '/images/countries/europe.jpg', 'saturate(0.95) brightness(0.93)', '#4f6d7a', '#4f6d7a', 'saturate(0.95) brightness(0.93)',
   'BG', 'Balkan', array['europe','eropa','eropa timur','ee'], 4, true),

  ('mexico', 'mexico', 'Meksiko', 'MX', '🇲🇽', 'USD / peso', 'Kontrak 1 tahun',
   'Posisi welder fabrikasi baja berat di Meksiko. Untuk tenaga las berpengalaman & bersertifikat, kontrak resmi lewat jalur yang benar.',
   '/images/countries/mexico.jpg', 'saturate(1.08) brightness(0.93) sepia(0.08)', '#9c5a2a', '#9c5a2a', 'saturate(1.08) brightness(0.93) sepia(0.08)',
   'MX', 'Monterrey', array['mexico','meksiko','mx'], 5, true),

  ('bulgaria', 'bulgaria', 'Bulgaria', 'BG', '🇧🇬', 'Euro (€)', 'Kontrak 8 bulan',
   'Posisi teknisi HVAC (AC) di Bulgaria untuk tenaga terampil. Instalasi dan maintenance unit, gaji euro, kontrak resmi lewat jalur yang benar.',
   '/images/countries/bulgaria.jpg', 'saturate(0.98) brightness(0.94)', '#5a6b8c', '#5a6b8c', 'saturate(0.98) brightness(0.94)',
   'BG', 'Sofia', array['bulgaria'], 6, true),

  ('kuwait', 'kuwait', 'Kuwait', 'KW', '🇰🇼', 'KWD dinar', 'Kontrak 2 tahun',
   'Posisi hospitality di Kuwait. Gaji dinar, makan dan akomodasi ditanggung, buat tenaga yang siap kerja di kawasan Teluk.',
   '/images/countries/kuwait.jpg', 'saturate(1.05) brightness(0.96) sepia(0.12)', '#b0843f', '#b0843f', 'saturate(1.05) brightness(0.96) sepia(0.12)',
   'KW', 'Kuwait City', array['kuwait'], 7, true),

  ('indonesia', 'indonesia', 'Indonesia', 'ID', '🇮🇩', 'Rupiah', 'Penempatan domestik',
   'Penempatan SPG & posisi domestik di Indonesia, buat yang belum siap berangkat ke luar negeri, tetap dapat support resmi.',
   '/images/countries/indonesia.jpg', 'saturate(1.05) brightness(0.95)', '#c4452f', '#b8341c', 'saturate(1.05) brightness(0.93)',
   'ID', 'Jakarta', array['indonesia'], 8, true),

  ('any', 'any', 'Global', 'GL', '🌐', '', '', '', '', '', '#4f6d7a', '#4f6d7a', '', '', '', array['any','global','semua','lainnya'], 99, false);
