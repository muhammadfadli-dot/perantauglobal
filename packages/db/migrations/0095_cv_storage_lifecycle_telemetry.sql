-- 0095_cv_storage_lifecycle_telemetry.sql
--
-- Bagian dari "CV Grader Hygiene & Hardening" plan (2026-07-13). Additive, nol
-- perubahan tabel destruktif. Tiga hal:
--
--   1. list_orphan_pending_cv (WS-2a): JANGAN ikut purge file pending-cv yang
--      MASIH direferensikan candidate_documents. Kandidat yang verify email
--      telat (> 48 jam) sebelumnya kehilangan CV-nya karena purge harian
--      menghapus semua file > 48 jam tanpa cek referensi -> cv-materialize gagal
--      MOVE (file hilang) -> row candidate_documents dangling. Exclusion ini
--      nutup sumbernya.
--
--   2. cv_preview_events (WS-6a): dari sekadar (ip, created_at) buat rate limit
--      jadi SUMBER DATA tuning threshold gate. Tambah pending_id, position_slug,
--      fit_score, outcome. IP tetap disimpan singkat (dianonimkan 24 jam oleh
--      hygiene fn, migration 0096) — window rate-limit cuma 10 menit.
--
--   3. check_cv_preview_rate_limit v2 (WS-6a/6b) + record_cv_preview_outcome:
--      rate limit sekarang cap per-IP DAN per-pending, lalu RETURN id event biar
--      caller (route.ts) bisa merekam fit_score + outcome-nya setelah LLM balas.
--
-- Housekeeping baris tua cv_preview_events DIPINDAH dari fungsi rate-limit ke
-- hygiene fn harian (0096). Di sini fungsi rate-limit murni cek + rekam.

-- =====================================================================
-- 1. WS-2a — purge orphan TAPI kecualikan yang masih direferensikan.
--    Signature + grant identik 0079 (edge fn cv-purge-orphans manggilnya apa
--    adanya, nggak perlu redeploy). Cuma body yg nambah NOT EXISTS.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.list_orphan_pending_cv(p_hours INT DEFAULT 48)
  RETURNS SETOF TEXT
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, storage
AS $$
  SELECT o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'pending-cv'
    AND o.created_at < NOW() - make_interval(hours => GREATEST(p_hours, 1))
    AND NOT EXISTS (
      SELECT 1 FROM public.candidate_documents cd WHERE cd.file_path = o.name
    );
$$;

REVOKE EXECUTE ON FUNCTION public.list_orphan_pending_cv(INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_orphan_pending_cv(INT) TO service_role;

-- =====================================================================
-- 2. WS-6a — perluas cv_preview_events jadi sumber data tuning.
--    Semua kolom baru NULLABLE (baris lama & jalur fail-open tetap valid).
-- =====================================================================
ALTER TABLE public.cv_preview_events
  ADD COLUMN IF NOT EXISTS pending_id    uuid,
  ADD COLUMN IF NOT EXISTS position_slug text,
  ADD COLUMN IF NOT EXISTS fit_score     int,
  ADD COLUMN IF NOT EXISTS outcome       text;

CREATE INDEX IF NOT EXISTS cv_preview_events_pending
  ON public.cv_preview_events (pending_id);

-- =====================================================================
-- 3a. WS-6a/6b — rate limit v2. Cap per-IP (8/10 mnt, sama seperti 0094) DAN
--     per-pending (5/24 jam: kandidat wajar re-upload 2-3x, bot yg muter di satu
--     pending mentok). Merekam event (INSERT) + RETURN id-nya (bukan boolean)
--     supaya outcome bisa distempel belakangan. NULL = BLOCK. Fail-open di caller.
--     Return type berubah (boolean->bigint) + arg nambah, jadi DROP dulu.
-- =====================================================================
DROP FUNCTION IF EXISTS public.check_cv_preview_rate_limit(inet);

CREATE OR REPLACE FUNCTION public.check_cv_preview_rate_limit(
  p_ip            INET DEFAULT NULL,
  p_pending_id    UUID DEFAULT NULL,
  p_position_slug TEXT DEFAULT NULL
)
  RETURNS BIGINT
  LANGUAGE plpgsql
  VOLATILE
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  v_ip_count      INT;
  v_pending_count INT;
  v_id            BIGINT;
BEGIN
  -- Per-IP: 8 / 10 menit.
  IF p_ip IS NOT NULL THEN
    SELECT count(*) INTO v_ip_count
    FROM cv_preview_events
    WHERE ip = p_ip AND created_at > NOW() - INTERVAL '10 minutes';
    IF v_ip_count >= 8 THEN
      RETURN NULL;  -- BLOCK
    END IF;
  END IF;

  -- Per-pending: 5 / 24 jam. NULL pending_id = nggak bisa di-cap (fail-open).
  IF p_pending_id IS NOT NULL THEN
    SELECT count(*) INTO v_pending_count
    FROM cv_preview_events
    WHERE pending_id = p_pending_id AND created_at > NOW() - INTERVAL '24 hours';
    IF v_pending_count >= 5 THEN
      RETURN NULL;  -- BLOCK
    END IF;
  END IF;

  INSERT INTO cv_preview_events (ip, pending_id, position_slug)
  VALUES (p_ip, p_pending_id, left(p_position_slug, 128))
  RETURNING id INTO v_id;

  RETURN v_id;  -- OK: id event, buat direkam outcome-nya
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_cv_preview_rate_limit(inet, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_cv_preview_rate_limit(inet, uuid, text) TO anon, authenticated;

-- =====================================================================
-- 3b. WS-6a — rekam hasil penilaian ke row event yg tadi dibuat. Dipanggil
--     route.ts fire-and-forget setelah LLM balas. Idempotent + defensif: cuma
--     update row yg outcome-nya masih NULL & umur < 10 menit (nggak bisa dipakai
--     nimpa event lama / event orang lain sembarangan), clamp skor, whitelist
--     outcome.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.record_cv_preview_outcome(
  p_event_id  BIGINT,
  p_fit_score INT  DEFAULT NULL,
  p_outcome   TEXT DEFAULT NULL
)
  RETURNS void
  LANGUAGE plpgsql
  VOLATILE
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  UPDATE cv_preview_events
  SET fit_score = CASE WHEN p_fit_score IS NULL THEN fit_score
                       ELSE GREATEST(0, LEAST(100, p_fit_score)) END,
      outcome   = CASE WHEN p_outcome IN ('scored','no_fit','error','rate_limited','unreadable')
                       THEN p_outcome ELSE outcome END
  WHERE id = p_event_id
    AND outcome IS NULL
    AND created_at > NOW() - INTERVAL '10 minutes';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_cv_preview_outcome(bigint, int, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_cv_preview_outcome(bigint, int, text) TO anon, authenticated;

-- =====================================================================
-- DONE - 0095. Tabel pending_submissions / candidate_documents / consents TIDAK
-- disentuh. grade-cv & trigger handle_new_auth_user TIDAK disentuh.
-- =====================================================================
