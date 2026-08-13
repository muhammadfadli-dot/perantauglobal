-- 0124_preview_field_change_impact.sql
--
-- Membuat akibat dari mengubah field screening kelihatan SEBELUM disimpan.
--
-- LATAR: 12 Agu 2026 belasan field screening diubah massal lewat admin Position
-- Editor. Layarnya tidak pernah memberi tahu bahwa lamaran yang sudah masuk ikut
-- terdampak. Dua kerusakan lahir dari satu sesi edit yang niatnya benar:
--
--   1. Ganti tipe field (radio <-> multiselect) mengubah BENTUK jawaban yang
--      diharapkan, sementara jawaban lama tetap tersimpan dalam bentuk lama.
--      Akibatnya /admin/applications mati total (lihat migrasi 0122).
--
--   2. Ganti kode `value` sebuah opsi memutus jawaban lama dari daftar opsi.
--      Contoh nyata di truck-driver-jepang: opsi SIM diganti kodenya dari
--      a / b1 / b2 menjadi sim_a / sim_b1 / sim_b2. Ketiganya qualifying.
--      166 kandidat yang benar-benar punya SIM itu langsung terbaca
--      "Belum lolos", tanpa pesan apa pun, tanpa jejak. Label di layar tidak
--      berubah, jadi tidak ada yang curiga.
--
-- Kerusakan kedua lebih berbahaya daripada yang pertama justru karena tidak
-- membuat apa pun mati. Halaman tetap terbuka, angkanya saja yang salah.
--
-- Fungsi ini menghitung dampaknya di muka: berapa lamaran yang sudah menjawab
-- field ini, berapa yang bentuk jawabannya akan tidak cocok lagi, dan berapa
-- yang nilainya tidak akan dikenali daftar opsi yang baru. Editor memanggilnya
-- sebelum menyimpan dan menaruh angkanya di dialog konfirmasi.
--
-- Fungsi ini TIDAK mengubah apa pun. Murni hitung.
--
-- security invoker: RLS pemanggil berlaku pada applications, jadi admin melihat
-- semua baris dan pemanggil lain melihat nol. EXECUTE dicabut dari anon.

CREATE OR REPLACE FUNCTION public.preview_field_change_impact(
  p_position_slug text,
  p_field_key     text,
  p_next_type     form_field_type,
  p_next_options  jsonb
)
RETURNS TABLE (
  total_menjawab      bigint,
  bentuk_tidak_cocok  bigint,
  nilai_tak_dikenal   bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public', 'pg_temp'
AS $function$
  WITH jawaban AS (
    SELECT a.answers -> p_field_key AS ans
    FROM applications a
    WHERE a.position_slug = p_position_slug
      AND a.answers ? p_field_key
  ),
  nilai_baru AS (
    SELECT o.value ->> 'value' AS v
    FROM jsonb_array_elements(
      CASE WHEN public.jsonb_is_array(p_next_options)
           THEN p_next_options
           ELSE '[]'::jsonb END
    ) AS o(value)
    WHERE o.value ->> 'value' IS NOT NULL
  )
  SELECT
    COUNT(*)::bigint AS total_menjawab,

    COUNT(*) FILTER (
      WHERE NOT public.answer_shape_matches(p_next_type, j.ans)
    )::bigint AS bentuk_tidak_cocok,

    -- Hanya dihitung kalau bentuknya masih cocok (kalau bentuknya sudah tidak
    -- cocok, ia sudah masuk hitungan di atas) DAN daftar opsi barunya memang
    -- punya gate. Tanpa gate, nilai yang tidak dikenal tidak mengubah keputusan.
    COUNT(*) FILTER (
      WHERE public.answer_shape_matches(p_next_type, j.ans)
        AND public.options_have_qualifying_gate(p_next_options)
        AND CASE
              WHEN p_next_type = 'multiselect' THEN EXISTS (
                SELECT 1
                FROM jsonb_array_elements_text(j.ans) AS s(val)
                WHERE NOT EXISTS (SELECT 1 FROM nilai_baru n WHERE n.v = s.val)
              )
              ELSE NOT EXISTS (
                SELECT 1 FROM nilai_baru n WHERE n.v = (j.ans #>> '{}')
              )
            END
    )::bigint AS nilai_tak_dikenal
  FROM jawaban j;
$function$;

COMMENT ON FUNCTION public.preview_field_change_impact(text, text, form_field_type, jsonb) IS
  'Menghitung dampak calon perubahan sebuah field screening terhadap lamaran yang SUDAH masuk, sebelum perubahan disimpan. bentuk_tidak_cocok = jawaban lama yang bentuknya tidak akan cocok lagi dengan tipe field baru. nilai_tak_dikenal = jawaban yang bentuknya masih cocok tapi nilainya tidak ada di daftar opsi baru, sehingga diam-diam terbaca tidak lolos. Read-only, security invoker.';

REVOKE ALL     ON FUNCTION public.preview_field_change_impact(text, text, form_field_type, jsonb) FROM anon;
REVOKE ALL     ON FUNCTION public.preview_field_change_impact(text, text, form_field_type, jsonb) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.preview_field_change_impact(text, text, form_field_type, jsonb) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.preview_field_change_impact(text, text, form_field_type, jsonb) TO service_role;
