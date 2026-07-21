-- 0115_akademi_hardening.sql
--
-- Tindak lanjut audit Akademi 2026-07-21. Tiga hal, semuanya ditegakkan di DB
-- supaya berlaku untuk SEMUA jalur masuk (form publik, portal, admin, trigger
-- signup), bukan cuma jalur yang kebetulan lewat aplikasi web.
--
-- K1  Jawaban screening wajib divalidasi di server.
--     `enroll_in_academy_program` dulu menyimpan COALESCE(p_answers,'{}') apa
--     adanya, jadi pemanggilan langsung bisa membuat pendaftaran sertifikasi
--     tanpa satu pun jawaban screening.
--
-- K3  Program draft tidak boleh punya pendaftaran.
--     RPC sudah menolak non-published, TAPI cabang `intent='academy'` di
--     handle_new_auth_user menyisipkan enrollment tanpa cek status. Daripada
--     menulis ulang trigger signup yang besar dan dipakai tiga alur sekaligus,
--     invariannya dipasang di tabel tujuannya. Satu tempat, semua jalur.
--
-- P   payment_status untuk program gratis.
--     Migrasi 0084 menambah kolom dengan DEFAULT 'unpaid' dan tidak ada satu
--     pun jalur yang menimpanya untuk program gratis. Akibatnya 56 orang yang
--     tidak berutang apa pun tercatat sama dengan calon peserta berbayar yang
--     memang belum bayar.

-- ---------------------------------------------------------------------------
-- 1. Invariant tabel: program draft ditolak, program gratis otomatis 'waived'
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.academy_enrollment_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_status  TEXT;
  v_is_free BOOLEAN;
BEGIN
  SELECT status, is_free INTO v_status, v_is_free
  FROM academy_programs WHERE slug = NEW.program_slug;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'academy program % not found', NEW.program_slug;
  END IF;

  IF v_status <> 'published' THEN
    RAISE EXCEPTION 'academy program % is not published (status=%)',
      NEW.program_slug, v_status;
  END IF;

  -- Program gratis tidak pernah punya tagihan, jadi jangan biarkan default
  -- 'unpaid' membuatnya terbaca seperti tunggakan di laporan.
  IF v_is_free AND NEW.payment_status = 'unpaid' THEN
    NEW.payment_status := 'waived';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_academy_enrollment_guard ON academy_enrollments;
CREATE TRIGGER trg_academy_enrollment_guard
  BEFORE INSERT ON academy_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.academy_enrollment_guard();

-- ---------------------------------------------------------------------------
-- 2. Backfill: pendaftaran kelas gratis yang telanjur tercatat 'unpaid'
-- ---------------------------------------------------------------------------

UPDATE academy_enrollments e
   SET payment_status = 'waived'
  FROM academy_programs p
 WHERE p.slug = e.program_slug
   AND p.is_free
   AND e.payment_status = 'unpaid';

-- ---------------------------------------------------------------------------
-- 3. RPC pendaftaran: field wajib benar-benar diwajibkan
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enroll_in_academy_program(
  p_program_slug text,
  p_answers jsonb DEFAULT '{}'::jsonb,
  p_consent_text text DEFAULT NULL::text,
  p_consent_version text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_candidate_id  UUID;
  v_published     BOOLEAN;
  v_enrollment_id UUID;
  v_missing       TEXT;
  v_answers       JSONB;
BEGIN
  SELECT id INTO v_candidate_id FROM candidates WHERE auth_user_id = auth.uid();
  IF v_candidate_id IS NULL THEN
    RAISE EXCEPTION 'no candidate for caller';
  END IF;

  SELECT (status = 'published') INTO v_published
  FROM academy_programs WHERE slug = p_program_slug;
  IF v_published IS NULL THEN
    RAISE EXCEPTION 'program not found';
  END IF;
  IF NOT v_published THEN
    RAISE EXCEPTION 'program not open for registration';
  END IF;

  v_answers := COALESCE(p_answers, '{}'::jsonb);

  -- Field wajib harus ada dan tidak kosong. Tanpa ini, panggilan langsung ke
  -- RPC bisa melewati seluruh screening (audit 2026-07-21, K1).
  SELECT string_agg(f.field_label, ', ' ORDER BY f.sort_order) INTO v_missing
  FROM program_registration_fields f
  WHERE f.program_slug = p_program_slug
    AND f.required
    AND (
      NOT (v_answers ? f.field_key)
      OR v_answers->>f.field_key IS NULL
      OR btrim(COALESCE(v_answers->>f.field_key, '')) = ''
    );

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'jawaban wajib belum lengkap: %', v_missing;
  END IF;

  -- Jawaban pilihan harus salah satu opsi yang memang ditawarkan program.
  SELECT string_agg(f.field_label, ', ' ORDER BY f.sort_order) INTO v_missing
  FROM program_registration_fields f
  WHERE f.program_slug = p_program_slug
    AND jsonb_typeof(f.options) = 'array'
    AND EXISTS (SELECT 1 FROM jsonb_array_elements(f.options) o WHERE o ? 'value')
    AND v_answers ? f.field_key
    AND jsonb_typeof(v_answers->f.field_key) = 'string'
    AND NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(f.options) o
      WHERE o->>'value' = v_answers->>f.field_key
    );

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'jawaban tidak valid untuk: %', v_missing;
  END IF;

  INSERT INTO academy_enrollments (candidate_id, program_slug, answers, status)
  VALUES (v_candidate_id, p_program_slug, v_answers, 'registered')
  ON CONFLICT (candidate_id, program_slug) DO NOTHING
  RETURNING id INTO v_enrollment_id;

  IF v_enrollment_id IS NOT NULL THEN
    -- newly enrolled -> log PDP consent once
    IF p_consent_text IS NOT NULL THEN
      INSERT INTO consents (candidate_id, purpose, purpose_text, version, granted_at)
      VALUES (v_candidate_id, 'academy_processing', p_consent_text,
              COALESCE(p_consent_version, 'v1'), NOW());
    END IF;
  ELSE
    SELECT id INTO v_enrollment_id FROM academy_enrollments
    WHERE candidate_id = v_candidate_id AND program_slug = p_program_slug;
  END IF;

  RETURN v_enrollment_id;
END;
$function$;
