-- 0098_cv_upload_ratelimit.sql
--
-- CV Grader Hygiene plan — WS-5 (defense-in-depth). Rate limit buat jalur mint
-- signed upload URL. Sebelum ini upload CV = anon INSERT langsung ke pending-cv
-- pakai publishable key (ter-embed di bundle) TANPA batas frekuensi (cuma dibatas
-- 5MB/file + purge 48 jam). Setelah WS-5, upload lewat signed URL yg di-mint
-- server -> bisa di-rate-limit + policy anon INSERT langsung dicabut (0099).
--
-- Additive. 1 tabel event ringan + 1 fungsi check-and-record (pola identik 0094).

CREATE TABLE IF NOT EXISTS public.cv_upload_events (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip         inet,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cv_upload_events_ip_time
  ON public.cv_upload_events (ip, created_at DESC);

-- Cuma disentuh SECURITY DEFINER fn + service role. RLS on tanpa policy = default deny.
ALTER TABLE public.cv_upload_events ENABLE ROW LEVEL SECURITY;

-- cap 10 mint / 10 menit / IP. true = OK (boleh mint URL), false = BLOCK. Merekam
-- percobaan + opportunistic cleanup. Fail-open di caller (route.ts) kalau RPC error.
CREATE OR REPLACE FUNCTION public.check_cv_upload_rate_limit(p_ip INET DEFAULT NULL)
  RETURNS boolean
  LANGUAGE plpgsql
  VOLATILE
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  IF p_ip IS NULL THEN
    RETURN true;
  END IF;

  SELECT count(*) INTO v_count
  FROM cv_upload_events
  WHERE ip = p_ip
    AND created_at > NOW() - INTERVAL '10 minutes';

  IF v_count >= 10 THEN
    RETURN false;
  END IF;

  INSERT INTO cv_upload_events (ip) VALUES (p_ip);
  DELETE FROM cv_upload_events WHERE created_at < NOW() - INTERVAL '1 hour';
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_cv_upload_rate_limit(INET) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_cv_upload_rate_limit(INET) TO anon, authenticated;
