-- 0125_shape_guard_functions_fixed_search_path.sql
--
-- Mengunci search_path pada tiga fungsi penjaga bentuk dari migrasi 0122.
-- Supabase advisor menandainya `function_search_path_mutable` (WARN, SECURITY).
--
-- Risikonya kecil di sini: ketiganya IMMUTABLE, tidak menyentuh tabel apa pun,
-- dan bukan SECURITY DEFINER, jadi tetap berjalan dengan hak pemanggil. Tapi
-- advisor ini pengawas yang berdiri terus, dan membiarkan satu peringatan
-- menetap membuat peringatan berikutnya lebih mudah diabaikan. Biayanya satu
-- baris per fungsi, jadi tidak ada alasan menundanya.
--
-- Definisi badan fungsinya tidak berubah sama sekali, hanya ditambah SET.
-- preview_field_change_impact (migrasi 0124) sudah punya SET sejak awal.

ALTER FUNCTION public.jsonb_is_array(jsonb)
  SET search_path TO 'public', 'pg_temp';

ALTER FUNCTION public.options_have_qualifying_gate(jsonb)
  SET search_path TO 'public', 'pg_temp';

ALTER FUNCTION public.answer_shape_matches(form_field_type, jsonb)
  SET search_path TO 'public', 'pg_temp';
