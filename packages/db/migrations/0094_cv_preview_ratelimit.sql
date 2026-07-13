-- 0094_cv_preview_ratelimit.sql
--
-- Anti-abuse buat jalur CV PREVIEW ("CV di depan" di step apply). Ship BARENGAN
-- fitur. Preview jalan SEBELUM submit (belum ada pending_submissions row), jadi
-- check_apply_rate_limit (0079, ngitung pending_submissions) nggak bisa dipakai.
-- Tiap preview = 2 LLM call (extract gemini-flash-lite + fit gemini-flash), jadi
-- perlu batas per-IP biar nggak jadi bahan flood/burn budget.
--
-- Additive. 1 tabel event ringan + 1 fungsi check-and-record.

CREATE TABLE IF NOT EXISTS public.cv_preview_events (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip         inet,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cv_preview_events_ip_time
  ON public.cv_preview_events (ip, created_at DESC);

-- Log ini cuma disentuh SECURITY DEFINER fn di bawah + service role. Nyalain RLS
-- tanpa policy = nol akses langsung anon/authenticated (default deny).
ALTER TABLE public.cv_preview_events ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- check_cv_preview_rate_limit(ip): cap 8 preview / 10 menit / IP. Sekaligus
-- MEREKAM percobaan (INSERT) kalau di bawah limit, + opportunistic cleanup
-- baris tua. true = OK (boleh lanjut preview), false = BLOCK. Fail-open di
-- caller (route.ts) kalau RPC error / belum di-apply.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.check_cv_preview_rate_limit(p_ip INET DEFAULT NULL)
  RETURNS boolean
  LANGUAGE plpgsql
  VOLATILE
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  -- Tanpa IP nggak bisa di-rate-limit; jangan blokir (fail-open).
  IF p_ip IS NULL THEN
    RETURN true;
  END IF;

  SELECT count(*) INTO v_count
  FROM cv_preview_events
  WHERE ip = p_ip
    AND created_at > NOW() - INTERVAL '10 minutes';

  IF v_count >= 8 THEN
    RETURN false;
  END IF;

  INSERT INTO cv_preview_events (ip) VALUES (p_ip);
  -- Opportunistic housekeeping (tabel ini murni ephemeral, aman dihapus tua).
  DELETE FROM cv_preview_events WHERE created_at < NOW() - INTERVAL '1 hour';
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_cv_preview_rate_limit(INET) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_cv_preview_rate_limit(INET) TO anon, authenticated;
