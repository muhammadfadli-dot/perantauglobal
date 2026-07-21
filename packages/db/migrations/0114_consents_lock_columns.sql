-- Migration 0114: kunci kolom tabel `consents` supaya ledger PDP tidak bisa
-- ditulis ulang oleh subjek datanya sendiri.
--
-- KENAPA
-- Policy `consents_candidate_withdraw_own` (dari 0001) membatasi BARIS, bukan
-- KOLOM: USING dan WITH CHECK dua-duanya cuma `candidate_id IN (...)`. Artinya
-- kandidat yang login, dengan publishable key biasa, boleh meng-UPDATE baris
-- consent miliknya sendiri dan mengubah kolom APA PUN di baris itu, termasuk
-- `purpose_text`, `version`, dan `granted_at`.
--
-- Itu melubangi seluruh nilai pembuktian ledger. Seluruh argumen kepatuhan
-- UU PDP 27/2022 kita bertumpu pada "kami menyimpan teks persis yang disetujui,
-- lengkap dengan tanggal dan versinya". Kalau teks itu bisa diedit belakangan
-- oleh orang yang menyetujuinya, catatan itu bukan bukti.
--
-- Sampai sekarang belum ada yang mengeksploitasi (0 dari 2524 baris pernah
-- ditarik, dan sebelum hari ini memang nol kode yang pernah menulis
-- `withdrawn_at`). Tapi halaman "Privasi & data saya" yang baru justru
-- mengandalkan jalur UPDATE ini, jadi lubangnya harus ditutup bareng.
--
-- BUKTI DRY-RUN (dijalankan di data produksi 2026-07-21, semua di-rollback,
-- memakai role `authenticated` + JWT claim kandidat asli pemilik barisnya):
--   1. SEBELUM trigger, kandidat menulis ulang purpose_text .... BERHASIL
--   2. SESUDAH trigger, menulis ulang purpose_text ............. DITOLAK
--   3. SESUDAH trigger, menggeser granted_at ................... DITOLAK
--   4. SESUDAH trigger, menarik consent (withdrawn_at) ......... BERHASIL
--   5. SESUDAH trigger, membatalkan penarikan .................. DITOLAK
--   6. SESUDAH trigger, koreksi oleh service_role .............. BERHASIL
--
-- Baris 4 itu syaratnya: penutupan ini tidak boleh mematikan hak tarik yang
-- baru saja kita janjikan di portal. Baris 6 juga: backend dan admin tetap
-- harus bisa melakukan koreksi sah lewat service_role.
--
-- CATATAN DESAIN
-- - Fungsi ini SECURITY INVOKER (default), BUKAN definer. `current_user` harus
--   berisi role pemanggil sebenarnya; kalau dibuat SECURITY DEFINER, nilainya
--   jadi owner fungsi dan pengecekan role di bawah selalu lolos.
-- - Penarikan dibuat sekali jalan: `withdrawn_at` yang sudah terisi tidak bisa
--   diubah atau dikosongkan lagi, supaya jejaknya utuh.
-- - Additive dan idempotent. Tidak menyentuh satu baris data pun.

create or replace function public.consents_lock_columns()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $body$
begin
  -- Backend dan operasi admin lewat service_role tetap bisa melakukan koreksi
  -- sah (mis. backfill, perbaikan data). Yang dikunci adalah jalur kandidat.
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  if new.id           is distinct from old.id
     or new.candidate_id is distinct from old.candidate_id
     or new.pending_id   is distinct from old.pending_id
     or new.purpose      is distinct from old.purpose
     or new.purpose_text is distinct from old.purpose_text
     or new.version      is distinct from old.version
     or new.granted_at   is distinct from old.granted_at
     or new.ip_address   is distinct from old.ip_address
     or new.user_agent   is distinct from old.user_agent then
    raise exception 'consents: hanya withdrawn_at yang boleh diubah (catatan persetujuan PDP bersifat append-only)'
      using errcode = '42501';
  end if;

  -- Sekali ditarik, tetap tertarik. Membalik `withdrawn_at` ke NULL akan
  -- menghapus jejak bahwa penarikan pernah terjadi.
  if old.withdrawn_at is not null
     and new.withdrawn_at is distinct from old.withdrawn_at then
    raise exception 'consents: withdrawn_at sudah terisi dan tidak bisa diubah lagi'
      using errcode = '42501';
  end if;

  return new;
end;
$body$;

drop trigger if exists consents_lock_columns_trg on public.consents;

create trigger consents_lock_columns_trg
  before update on public.consents
  for each row
  execute function public.consents_lock_columns();
