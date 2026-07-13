-- 0096_pending_retention_cv_fit_stamp.sql
--
-- CV Grader Hygiene plan — WS-3 (retention pending_submissions) + WS-6d (stamp
-- fit ke pending yg disubmit). Additive.
--
--   1. pending_purge_daily: agregat harian drop-off SEBELUM row PII dihapus,
--      biar sejarah funnel nggak ikut hilang pas purge.
--   2. purge_stale_pending_submissions(days): erase pending unconsumed tua +
--      consent-nya (data-minimization PDP; file CV udah dipurge 48 jam, PII form
--      juga harus punya batas). service_role only (dipanggil hygiene cron).
--   3. stamp_pending_cv_fit(pending_id): server-trusted, ambil fit_score dari
--      telemetry preview (cv_preview_events) lalu stempel ke form_data.cv_fit
--      pending yg baru disubmit. Fit dari SERVER, bukan dari client.

-- =====================================================================
-- 1. Agregat drop-off. RLS on tanpa policy = cuma service_role/definer yg akses
--    (admin baca lewat service role / view terpisah nanti). Nyimpen: berapa
--    pending unconsumed di-purge per hari per posisi + berapa yg bawa CV.
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.pending_purge_daily (
  day           date NOT NULL,
  position_slug text NOT NULL,
  purged        int  NOT NULL DEFAULT 0,
  with_cv       int  NOT NULL DEFAULT 0,
  PRIMARY KEY (day, position_slug)
);
ALTER TABLE public.pending_purge_daily ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 2. Purge pending unconsumed > N hari + consent-nya. Agregat dulu, baru hapus.
--    Cuma unconsumed yg dihapus; consumed (udah termaterialisasi) DIBIARIN
--    (audit trail; revisit 180 hari). Return laporan jumlah.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.purge_stale_pending_submissions(p_days INT DEFAULT 30)
  RETURNS jsonb
  LANGUAGE plpgsql
  VOLATILE
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  v_cutoff   timestamptz := NOW() - make_interval(days => GREATEST(p_days, 1));
  v_pending  int;
  v_consents int;
BEGIN
  -- 2a. Agregat drop-off yg mau dihapus ke pending_purge_daily (idempotent tambah).
  INSERT INTO pending_purge_daily (day, position_slug, purged, with_cv)
  SELECT date_trunc('day', created_at)::date,
         COALESCE(position_slug, '(non-job)'),
         count(*),
         count(*) FILTER (WHERE form_data ? 'cv')
  FROM pending_submissions
  WHERE consumed_at IS NULL AND created_at < v_cutoff
  GROUP BY 1, 2
  ON CONFLICT (day, position_slug) DO UPDATE
    SET purged  = pending_purge_daily.purged  + EXCLUDED.purged,
        with_cv = pending_purge_daily.with_cv + EXCLUDED.with_cv;

  -- 2b. Hapus consent yg nempel ke pending yg mau dihapus. FK pending_id = SET
  --     NULL, jadi kalau nggak dihapus eksplisit dia jadi row yatim ber-IP/UA
  --     (consent atas data yg di-erase harus ikut di-erase).
  DELETE FROM consents
  WHERE pending_id IN (
    SELECT id FROM pending_submissions WHERE consumed_at IS NULL AND created_at < v_cutoff
  );
  GET DIAGNOSTICS v_consents = ROW_COUNT;

  -- 2c. Hapus pending unconsumed tua.
  DELETE FROM pending_submissions WHERE consumed_at IS NULL AND created_at < v_cutoff;
  GET DIAGNOSTICS v_pending = ROW_COUNT;

  RETURN jsonb_build_object(
    'purged_pendings', v_pending,
    'purged_consents', v_consents,
    'cutoff_days',     GREATEST(p_days, 1)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.purge_stale_pending_submissions(INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_stale_pending_submissions(INT) TO service_role;

-- =====================================================================
-- 3. WS-6d — stempel fit ke pending yg disubmit. Ambil fit_score TERBARU yg
--    'scored' dari telemetry preview (cv_preview_events, yg direkam SERVER pas
--    preview), taruh di form_data.cv_fit. Fit dari server, BUKAN dari client.
--    Cuma pending baru (< 1 jam) yg boleh distempel (anon nggak bisa nimpa row
--    lama). Admin/BD bisa liat fit pra-verifikasi + analisis konversi per band.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.stamp_pending_cv_fit(p_pending_id UUID)
  RETURNS void
  LANGUAGE plpgsql
  VOLATILE
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  v_fit int;
BEGIN
  IF p_pending_id IS NULL THEN
    RETURN;
  END IF;

  SELECT fit_score INTO v_fit
  FROM cv_preview_events
  WHERE pending_id = p_pending_id
    AND outcome = 'scored'
    AND fit_score IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_fit IS NULL THEN
    RETURN;
  END IF;

  UPDATE pending_submissions
  SET form_data = jsonb_set(COALESCE(form_data, '{}'::jsonb), '{cv_fit}', to_jsonb(v_fit), true)
  WHERE id = p_pending_id
    AND created_at > NOW() - INTERVAL '1 hour';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.stamp_pending_cv_fit(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.stamp_pending_cv_fit(UUID) TO anon, authenticated;

-- =====================================================================
-- DONE - 0096. handle_new_auth_user & grade-cv TIDAK disentuh.
-- =====================================================================
