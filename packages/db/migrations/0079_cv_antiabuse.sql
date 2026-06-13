-- 0079_cv_antiabuse.sql
--
-- Anti-abuse buat jalur CV depan-funnel (Fase 2 CV grader). Ship BARENGAN fitur,
-- bukan future work. NOL anti-abuse existing (pending_anon_insert WITH CHECK true).
--
--   1. check_apply_rate_limit(email, ip) - rate limit DB-level di jalur submit
--      pending_submissions (dipanggil route.ts SEBELUM insert). DB-level, BUKAN
--      middleware in-memory Vercel (per-instance, cold-start reset, unreliable).
--   2. list_orphan_pending_cv(hours)   - daftar path CV staged nyangkut > N jam,
--      dipakai edge fn cron cv-purge-orphans (hapus file fisik via Storage API;
--      DELETE row storage.objects bakal ninggalin binary orphan di S3).
--
-- Additive. Tidak ubah tabel.

-- =====================================================================
-- 1. Rate limit: cap submit per-email + per-IP dalam window 10 menit.
--    Pakai pending_submissions.ip_address/email yang sudah distempel route.ts.
--    true = OK (di bawah limit), false = BLOCK. STABLE + SECURITY DEFINER.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.check_apply_rate_limit(p_email TEXT, p_ip INET DEFAULT NULL)
  RETURNS boolean
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  v_email_count INT;
  v_ip_count    INT;
BEGIN
  -- Per-email: maks 5 submit / 10 menit (orang normal apply beberapa posisi, bukan puluhan).
  SELECT count(*) INTO v_email_count
  FROM pending_submissions
  WHERE lower(email) = lower(btrim(COALESCE(p_email, '')))
    AND created_at > NOW() - INTERVAL '10 minutes';
  IF v_email_count >= 5 THEN
    RETURN false;
  END IF;

  -- Per-IP: maks 15 submit / 10 menit (longgar buat warnet/sharing IP, ketat buat flood).
  IF p_ip IS NOT NULL THEN
    SELECT count(*) INTO v_ip_count
    FROM pending_submissions
    WHERE ip_address = p_ip
      AND created_at > NOW() - INTERVAL '10 minutes';
    IF v_ip_count >= 15 THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_apply_rate_limit(TEXT, INET) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_apply_rate_limit(TEXT, INET) TO anon, authenticated;

-- =====================================================================
-- 2. Orphan pending-cv list (buat cron purge). Baca storage.objects
--    (SECURITY DEFINER + search_path storage). Cuma BACA path; hapus fisik
--    dilakukan edge fn via Storage API. service-role only (edge fn cron).
-- =====================================================================
CREATE OR REPLACE FUNCTION public.list_orphan_pending_cv(p_hours INT DEFAULT 48)
  RETURNS SETOF TEXT
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, storage
AS $$
  SELECT name
  FROM storage.objects
  WHERE bucket_id = 'pending-cv'
    AND created_at < NOW() - make_interval(hours => GREATEST(p_hours, 1));
$$;

-- Supabase DEFAULT PRIVILEGES auto-grant EXECUTE ke anon/authenticated buat
-- fungsi schema public, jadi REVOKE FROM PUBLIC aja nggak cukup -> revoke
-- eksplisit dari anon + authenticated (cuma cron edge fn service-role yang butuh).
REVOKE EXECUTE ON FUNCTION public.list_orphan_pending_cv(INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_orphan_pending_cv(INT) TO service_role;

-- =====================================================================
-- DONE - migration 0079.
-- =====================================================================
