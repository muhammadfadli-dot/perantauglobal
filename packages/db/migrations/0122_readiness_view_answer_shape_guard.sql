-- 0122_readiness_view_answer_shape_guard.sql
--
-- Memperbaiki matinya /admin/applications, /admin/candidates, dan /admin/positions
-- dengan error "cannot extract elements from a scalar" (SQLSTATE 22023).
--
-- ============================================================================
-- APA YANG TERJADI
-- ============================================================================
-- 12 Agu 2026 pukul 13:43-14:16 UTC, lewat admin Position Editor, field screening
-- di belasan posisi diubah massal (audit: action=update_application_field dengan
-- changed_type=true, changed_options=true, changed_importance=true). Di posisi
-- `tokutei-ginou-konstruksi-hyogo`, empat field jadi field_type='multiselect',
-- importance='required', dan options-nya dapat flag `qualifying`.
--
-- Sembilan lamaran lama di posisi itu (1-30 Jul) menyimpan jawaban sebagai STRING
-- polos, bukan array, karena saat mereka melamar field-nya belum multiselect:
--
--   answers->'berapa_level_jlpt_kamu'    = "JLPT N3"   (bukan ["jlpt_n3"])
--   answers->'berapa_usia_kamu_saat_ini' = "28"        (bukan ["25_32"])
--
-- Cabang multiselect di application_readiness_view memanggil
--
--   jsonb_array_elements_text(COALESCE(a.answers -> paf.field_key, '[]'::jsonb))
--
-- COALESCE hanya menangkap SQL NULL. JSON scalar (string, angka, boolean, dan JSON
-- null) lolos dari situ dan langsung meledak di jsonb_array_elements_text.
--
-- Karena satu baris cukup untuk menggagalkan seluruh query, dan karena
-- list_applications_for_admin LEFT JOIN ke view ini, sembilan lamaran itu
-- mematikan halaman lamaran untuk SEMUA posisi dan semua admin, termasuk daftar
-- kandidat Welder yang sedang dikejar. Halaman /admin/candidates (filter
-- hard_pass) dan /admin/positions (rekap ready per posisi) ikut mati.
--
-- ============================================================================
-- KENAPA INI BUKAN SEKADAR SALAH KETIK
-- ============================================================================
-- Dua asumsi diam-diam yang dipegang view lama:
--
--   1. "Kalau field_type sekarang multiselect, jawaban yang tersimpan pasti array."
--      Salah. field_type bisa diubah kapan saja lewat admin, sedangkan jawaban
--      yang sudah masuk tidak ikut berubah bentuk. Setiap ganti tipe field
--      meninggalkan jawaban yatim yang bentuknya mengikuti tipe LAMA.
--
--   2. "COALESCE(x, '[]') cukup untuk mengamankan jsonb_array_elements."
--      Salah. COALESCE hanya soal SQL NULL, bukan soal bentuk JSON.
--      Penjaga yang benar adalah jsonb_typeof(x) = 'array'.
--
-- ============================================================================
-- ATURAN BARU: BENTUK TIDAK COCOK = TIDAK BISA DINILAI, BUKAN TIDAK LOLOS
-- ============================================================================
-- Jawaban yang bentuknya tidak cocok dengan tipe field saat ini berasal dari era
-- konfigurasi yang berbeda. Kita TIDAK menilainya dengan gate yang sekarang, dan
-- kita TIDAK menganggapnya gagal. Field seperti itu turun ke pengecekan kehadiran
-- (terisi atau tidak), yaitu persis perilaku yang berlaku untuk baris-baris ini
-- sebelum 12 Agustus.
--
-- Alternatif yang sengaja DITOLAK: mencocokkan string lama ke daftar options.
-- Terbukti berbahaya pada data nyata. Satu lamaran menyimpan usia "25" sebagai
-- teks bebas, sementara options sekarang punya value "25" yang labelnya "< 25"
-- dan qualifying=false. Kandidat berumur 25 tahun justru masuk rentang "25 - 32"
-- yang qualifying=true. Mencocokkan string mentah ke value akan membalik
-- kesimpulannya gara-gara kebetulan dua teks sama.
--
-- Arah kesalahan dipilih sadar: menyembunyikan kandidat yang sebenarnya lolos
-- lebih mahal daripada memunculkan kandidat yang perlu dicek ulang. Ini kelas bug
-- yang sama dengan filter "Sudah Qualified" (PR #250, 4 Agu).
--
-- Pemakaian pertama gate baru pada sebuah field tetap berlaku normal untuk semua
-- jawaban yang bentuknya benar. Yang dilindungi hanya jawaban warisan.
--
-- ============================================================================
-- ISI MIGRASI
-- ============================================================================
--   1. Dua fungsi penjaga bentuk yang bisa dipakai ulang.
--   2. application_readiness_view ditulis ulang memakai penjaga itu.
--   3. list_applications_for_admin: has_gate ikut dijaga (lubang laten yang sama).
--   4. View diagnostik application_answer_shape_mismatch supaya jawaban yatim
--      kelihatan, bukan menunggu meledak lagi.
--
-- Tidak ada data lamaran yang diubah. Migrasi ini murni definisi.

-- ---------------------------------------------------------------------------
-- 1. Fungsi penjaga bentuk
-- ---------------------------------------------------------------------------
-- Keduanya murni: hanya melihat nilai yang dioper, tidak menyentuh tabel apa pun.
-- EXECUTE sengaja dibiarkan di default (PUBLIC). application_readiness_view
-- berjalan security_invoker=true, jadi pemanggilnya adalah `authenticated` dan
-- `dtg_ro`. Mencabut EXECUTE dari PUBLIC justru akan mematikan view itu untuk
-- mereka. Tidak ada risiko: fungsi ini tidak membaca data apa pun.

CREATE OR REPLACE FUNCTION public.jsonb_is_array(p_value jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT p_value IS NOT NULL AND jsonb_typeof(p_value) = 'array';
$$;

COMMENT ON FUNCTION public.jsonb_is_array(jsonb) IS
  'TRUE hanya kalau nilainya benar-benar array JSON. Pakai ini sebagai penjaga sebelum jsonb_array_elements / jsonb_array_elements_text. COALESCE(x, ''[]'') BUKAN penjaga: ia cuma menangkap SQL NULL, sedangkan JSON scalar tetap lolos dan bikin error 22023.';

-- Apakah daftar options sebuah field benar-benar mendefinisikan gate kelolosan?
CREATE OR REPLACE FUNCTION public.options_have_qualifying_gate(p_options jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT public.jsonb_is_array(p_options)
     AND EXISTS (SELECT 1 FROM jsonb_array_elements(p_options) o WHERE o ? 'qualifying');
$$;

COMMENT ON FUNCTION public.options_have_qualifying_gate(jsonb) IS
  'TRUE kalau options berbentuk array DAN ada minimal satu opsi yang membawa kunci `qualifying`. Sudah aman terhadap options yang bukan array.';

-- Apakah bentuk jawaban tersimpan cocok dengan tipe field yang berlaku sekarang?
CREATE OR REPLACE FUNCTION public.answer_shape_matches(
  p_field_type form_field_type,
  p_answer     jsonb
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT CASE
    -- kunci tidak ada sama sekali
    WHEN p_answer IS NULL THEN false
    -- multiselect menyimpan banyak pilihan: wajib array
    WHEN p_field_type = 'multiselect' THEN jsonb_typeof(p_answer) = 'array'
    -- pilihan tunggal: wajib scalar. array/object = warisan tipe lama,
    -- JSON null = kosong dan memang tidak bisa dinilai gate.
    ELSE jsonb_typeof(p_answer) NOT IN ('array', 'object', 'null')
  END;
$$;

COMMENT ON FUNCTION public.answer_shape_matches(form_field_type, jsonb) IS
  'Apakah bentuk jawaban tersimpan cocok dengan tipe field yang berlaku SEKARANG. FALSE berarti jawaban itu warisan dari konfigurasi field yang lama (tipe field pernah diganti), jadi tidak boleh dinilai dengan gate qualifying yang sekarang.';

-- ---------------------------------------------------------------------------
-- 2. application_readiness_view
-- ---------------------------------------------------------------------------
-- security_invoker=true ditulis ulang secara eksplisit supaya pengerasan
-- migrasi 0056 (tutup lubang IDOR / enumerasi PII) tidak hilang diam-diam kalau
-- berkas ini pernah dijalankan di lingkungan lain.

CREATE OR REPLACE VIEW public.application_readiness_view
WITH (security_invoker = true) AS
SELECT
  a.id           AS application_id,
  a.candidate_id,
  a.position_slug,
  COALESCE((
    SELECT bool_and(field_checks.field_pass)
    FROM (
      SELECT
        CASE
          -- (a) Field berkas: cukup ada dokumennya.
          WHEN paf.field_type = 'file' AND paf.document_type IS NOT NULL THEN EXISTS (
            SELECT 1
            FROM candidate_documents cd
            WHERE cd.application_id = a.id
              AND cd.doc_type = paf.document_type
          )

          -- (b) Field punya gate qualifying DAN bentuk jawabannya cocok dengan
          --     tipe field sekarang. Barulah gate itu dipakai menilai.
          WHEN public.options_have_qualifying_gate(paf.options)
               AND public.answer_shape_matches(paf.field_type, a.answers -> paf.field_key)
            THEN CASE
              WHEN paf.field_type = 'multiselect' THEN EXISTS (
                SELECT 1
                FROM jsonb_array_elements_text(a.answers -> paf.field_key) AS selected(val)
                JOIN jsonb_array_elements(paf.options)                     AS opt(value)
                  ON (opt.value ->> 'value') = selected.val
                WHERE COALESCE((opt.value ->> 'qualifying')::boolean, false) = true
              )
              ELSE EXISTS (
                SELECT 1
                FROM jsonb_array_elements(paf.options) AS opt(value)
                WHERE (opt.value ->> 'value') = (a.answers ->> paf.field_key)
                  AND COALESCE((opt.value ->> 'qualifying')::boolean, false) = true
              )
            END

          -- (c) Sisanya: tidak ada gate, ATAU ada gate tapi jawabannya warisan
          --     bentuk lama. Turun ke pengecekan kehadiran. Jangan menjatuhkan
          --     kandidat gara-gara konfigurasi berubah setelah dia melamar.
          ELSE (a.answers ->> paf.field_key) IS NOT NULL
               AND (a.answers ->> paf.field_key) <> ALL (ARRAY['', '[]', 'null'])
        END AS field_pass
      FROM position_application_fields paf
      WHERE paf.position_slug = a.position_slug
        AND paf.importance = 'required'
    ) field_checks
  ), true) AS hard_pass
FROM applications a;

COMMENT ON VIEW public.application_readiness_view IS
  'hard_pass per lamaran. security_invoker=true: mengikuti RLS pemanggil pada applications / candidate_documents / position_application_fields. Kandidat cuma baris miliknya, admin (is_admin()) semua, anon nol. Dikeraskan di migrasi 0056. Sejak migrasi 0122: jawaban yang bentuknya tidak cocok dengan tipe field sekarang (warisan sebelum tipe field diganti) TIDAK dinilai dengan gate qualifying, melainkan turun ke pengecekan kehadiran. Lihat application_answer_shape_mismatch untuk daftarnya.';

-- ---------------------------------------------------------------------------
-- 3. list_applications_for_admin
-- ---------------------------------------------------------------------------
-- Sama persis dengan versi migrasi 0082, satu perubahan: penjaga `has_gate`.
-- Versi lama memakai `pgf.options IS NOT NULL` sebelum jsonb_array_elements.
-- Itu penjaga yang salah dengan cara yang sama seperti COALESCE: options berisi
-- JSON null lolos dari IS NOT NULL lalu meledak. Belum pernah kejadian di
-- produksi, tapi ini lubang yang sama dan ditutup sekalian.

CREATE OR REPLACE FUNCTION public.list_applications_for_admin(
  p_position text DEFAULT NULL::text,
  p_search   text DEFAULT NULL::text,
  p_sort     text DEFAULT 'newest'::text,
  p_pool     text DEFAULT 'pool'::text,
  p_limit    integer DEFAULT 40,
  p_offset   integer DEFAULT 0
)
RETURNS TABLE(
  id uuid, candidate_id uuid, position_slug text, pipeline_stage pipeline_stage,
  reached_out boolean, score integer, created_at timestamp with time zone,
  candidate_name text, candidate_phone text, candidate_city text,
  position_name text, position_country text, job_order_id uuid,
  job_order_intake_label text, readiness jsonb,
  cv_fit_score integer, cv_fit_status text, cv_has_flags boolean,
  candidate_has_cv boolean,
  total_count bigint
)
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $function$
  WITH filtered AS (
    SELECT
      a.id, a.candidate_id, a.position_slug, a.pipeline_stage, a.reached_out,
      a.score, a.created_at,
      c.full_name AS candidate_name, c.phone AS candidate_phone, c.city AS candidate_city,
      p.name AS position_name, p.country::text AS position_country,
      a.job_order_id, jo.intake_label AS job_order_intake_label,
      jsonb_build_object(
        'hard_pass', COALESCE(arv.hard_pass, TRUE),
        'score_pct', CASE
          WHEN COALESCE(par.total_fields, 0) = 0 THEN 100
          ELSE ROUND((par.passed_fields::numeric / par.total_fields) * 100)::int
        END,
        -- Apakah posisi ini punya gate kelolosan sungguhan? (field required yang
        -- options-nya membawa flag `qualifying`). Hanya kalau ada, hard_pass
        -- bermakna "lolos/belum lolos"; kalau tidak, badge menampilkan "-".
        'has_gate', EXISTS (
          SELECT 1 FROM position_application_fields pgf
          WHERE pgf.position_slug = a.position_slug
            AND pgf.importance = 'required'
            AND public.options_have_qualifying_gate(pgf.options)
        )
      ) AS readiness,
      acvf.fit_score AS cv_fit_score,
      acvf.status    AS cv_fit_status,
      COALESCE(acvf.has_flags, FALSE) AS cv_has_flags,
      -- Kandidatnya punya dokumen CV sama sekali? Ini yang membedakan
      -- "Belum CV" dari "Belum dinilai".
      EXISTS (
        SELECT 1 FROM candidate_documents cd
        WHERE cd.candidate_id = a.candidate_id AND cd.doc_type = 'cv'
      ) AS candidate_has_cv,
      COUNT(*) OVER() AS total_count
    FROM applications a
    LEFT JOIN candidates c ON c.id = a.candidate_id
    LEFT JOIN positions  p ON p.slug = a.position_slug
    LEFT JOIN job_orders jo ON jo.id = a.job_order_id
    LEFT JOIN application_readiness_view arv ON arv.application_id = a.id
    LEFT JOIN application_cv_fit acvf ON acvf.application_id = a.id
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS total_fields,
             COUNT(*) FILTER (WHERE satisfied)::int AS passed_fields
      FROM (
        SELECT CASE
            WHEN paf.field_type = 'file' AND paf.document_type IS NOT NULL THEN EXISTS (
              SELECT 1 FROM candidate_documents cd
              WHERE cd.application_id = a.id AND cd.doc_type = paf.document_type)
            ELSE (a.answers ->> paf.field_key) IS NOT NULL
              AND (a.answers ->> paf.field_key) NOT IN ('', '[]', 'null')
          END AS satisfied
        FROM position_application_fields paf
        WHERE paf.position_slug = a.position_slug
      ) per_field
    ) par ON TRUE
    WHERE
      (p_position IS NULL OR p_position = '' OR a.position_slug = p_position)
      AND (
        p_pool = 'all'
        OR (p_pool = 'pool'         AND a.job_order_id IS NULL AND a.pipeline_stage NOT IN ('rejected','exit'))
        OR (p_pool = 'in_job_order' AND a.job_order_id IS NOT NULL)
      )
      AND (
        p_search IS NULL OR p_search = ''
        OR c.full_name ILIKE '%' || p_search || '%'
        OR c.phone     ILIKE '%' || p_search || '%'
      )
  )
  SELECT
    id, candidate_id, position_slug, pipeline_stage, reached_out, score, created_at,
    candidate_name, candidate_phone, candidate_city, position_name, position_country,
    job_order_id, job_order_intake_label, readiness, cv_fit_score, cv_fit_status, cv_has_flags,
    candidate_has_cv, total_count
  FROM filtered
  ORDER BY
    CASE WHEN p_sort = 'fit'       THEN cv_fit_score                       END DESC NULLS LAST,
    CASE WHEN p_sort = 'readiness' THEN (readiness->>'hard_pass')::boolean END DESC NULLS LAST,
    CASE WHEN p_sort = 'readiness' THEN (readiness->>'score_pct')::int     END DESC NULLS LAST,
    created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$function$;

-- ---------------------------------------------------------------------------
-- 4. Diagnostik: jawaban yang bentuknya tidak cocok lagi
-- ---------------------------------------------------------------------------
-- Sebelum ini, jawaban yatim tidak kelihatan sampai ia mematikan satu halaman.
-- View ini membuatnya bisa dilihat kapan saja, dan dipakai admin Position Editor
-- untuk memperingatkan sebelum tipe field diganti.

CREATE OR REPLACE VIEW public.application_answer_shape_mismatch
WITH (security_invoker = true) AS
SELECT
  a.id            AS application_id,
  a.candidate_id,
  a.position_slug,
  paf.field_key,
  paf.field_label,
  paf.field_type,
  paf.importance,
  jsonb_typeof(a.answers -> paf.field_key) AS bentuk_jawaban,
  a.answers -> paf.field_key               AS jawaban,
  public.options_have_qualifying_gate(paf.options) AS field_punya_gate,
  a.created_at    AS lamaran_dibuat,
  paf.updated_at  AS field_terakhir_diubah
FROM applications a
JOIN position_application_fields paf
  ON paf.position_slug = a.position_slug
WHERE a.answers ? paf.field_key
  AND NOT public.answer_shape_matches(paf.field_type, a.answers -> paf.field_key);

COMMENT ON VIEW public.application_answer_shape_mismatch IS
  'Jawaban lamaran yang bentuknya tidak cocok lagi dengan tipe field yang berlaku sekarang, akibat tipe field pernah diganti setelah lamaran masuk. Baris di sini TIDAK dinilai oleh gate qualifying di application_readiness_view, melainkan turun ke pengecekan kehadiran. Kolom field_punya_gate menandai mana yang benar-benar berdampak ke keputusan lolos. security_invoker=true, jadi mengikuti RLS pemanggil.';

GRANT SELECT ON public.application_answer_shape_mismatch TO authenticated;
GRANT SELECT ON public.application_answer_shape_mismatch TO dtg_ro;
