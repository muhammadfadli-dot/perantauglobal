-- 0123_shape_mismatch_view_revoke_anon.sql
--
-- Menutup hak `anon` pada view diagnostik yang dibuat migrasi 0122.
--
-- Supabase memasang default `GRANT ALL ON ALL TABLES` ke anon dan authenticated,
-- jadi SETIAP view baru otomatis kebagian, termasuk yang tidak diniatkan publik.
-- Migrasi 0122 sudah memberi security_invoker=true, sehingga anon tetap mendapat
-- nol baris karena RLS pemanggil berlaku. Tapi pelajaran migrasi 0056 (lubang
-- IDOR / enumerasi PII di application_readiness_view) adalah: jangan bertumpu pada
-- satu lapis. Hak yang tidak dipakai harus dicabut, bukan diandalkan tidak berguna.
--
-- Catatan untuk migrasi berikutnya: setiap kali membuat view atau tabel baru di
-- schema public, cabut anon secara eksplisit di migrasi yang sama. Jangan menunggu
-- advisor Supabase yang menemukannya.

REVOKE ALL    ON public.application_answer_shape_mismatch FROM anon;
REVOKE ALL    ON public.application_answer_shape_mismatch FROM authenticated;
GRANT  SELECT ON public.application_answer_shape_mismatch TO authenticated;
GRANT  SELECT ON public.application_answer_shape_mismatch TO dtg_ro;
