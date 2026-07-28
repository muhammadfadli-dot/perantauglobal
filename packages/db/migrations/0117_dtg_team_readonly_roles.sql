-- 0117_dtg_team_readonly_roles.sql
-- Tier akses READ-ONLY per orang untuk tim DTG.
-- Dirancang 27 Jul 2026 untuk sesi kerja DTG 28 Jul 2026.
--
-- KENAPA per orang, bukan satu kredensial bersama:
--   audit dan pencabutan harus bisa dilakukan per orang. Satu kredensial bersama
--   berarti kalau satu laptop hilang, semua harus dirotasi.
--
-- KENAPA read-only:
--   keenam orang ini SUDAH admin di admin_users, jadi mereka sudah bisa membaca
--   dan menulis lewat aplikasi admin. Tier ini tidak menambah kewenangan apa pun,
--   cuma memberi jalan BACA yang bisa dipakai AI mereka. Menulis tetap lewat
--   aplikasi, supaya tetap kena validasi, trigger, dan audit log.
--
-- PASSWORD TIDAK ADA DI FILE INI, dan memang tidak boleh ada.
--   File ini masuk git. Password di-set terpisah lewat ALTER ROLE dan hanya
--   tersimpan di kit privat per orang (folder secrets/, sudah di-gitignore).
--   Selama password belum di-set, role login ini tidak bisa dipakai konek.
--
-- BYPASSRLS sengaja TIDAK dipakai. RLS membatasi BARIS, jadi tiap tabel ber-RLS
--   diberi policy SELECT eksplisit. Efeknya sama, tapi model keamanannya utuh.

-- 1. Group role sebagai tempat menggantungkan semua hak
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'dtg_ro') then
    create role dtg_ro nologin;
  end if;
end $$;

-- 2. Role login per orang
do $$
declare r text;
begin
  foreach r in array array['ro_martin','ro_zalfa','ro_ifa','ro_ririn','ro_indria','ro_ai'] loop
    if not exists (select 1 from pg_roles where rolname = r) then
      execute format('create role %I login', r);
    end if;
    execute format('grant dtg_ro to %I', r);
  end loop;
end $$;

-- 3. Hanya schema public. auth, storage, dan vault sengaja tidak diberi USAGE,
--    jadi token, sesi, dan rahasia tetap tidak terjangkau.
grant usage on schema public to dtg_ro;
grant select on all tables in schema public to dtg_ro;
alter default privileges in schema public grant select on tables to dtg_ro;

-- 4. Policy baca per tabel ber-RLS
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' and rowsecurity loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = t and policyname = 'dtg_ro_read'
    ) then
      execute format('create policy dtg_ro_read on public.%I for select to dtg_ro using (true)', t);
    end if;
  end loop;
end $$;
