-- 0080_event_reg_antiabuse.sql
--
-- Rate limit for the anon event-registration insert. The event endpoint had ZERO
-- throttle (event_reg_anon_insert WITH CHECK true) and fired a REAL Meta CAPI
-- CompleteRegistration per accepted POST -> scripted floods could both pollute
-- event_registrations and manufacture fake conversions, poisoning ad optimization
-- and burning ad budget. Mirrors check_apply_rate_limit (0079). Called from
-- apps/web/src/app/api/event/[slug]/route.ts BEFORE insert (fail-open on error).
-- true = OK (under limit), false = BLOCK. Additive — no table changes.

CREATE OR REPLACE FUNCTION public.check_event_reg_rate_limit(p_email TEXT, p_ip INET DEFAULT NULL)
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
  -- Per-email: max 5 / 10 min (a person registers once; allow honest retries).
  SELECT count(*) INTO v_email_count
  FROM event_registrations
  WHERE lower(email) = lower(btrim(COALESCE(p_email, '')))
    AND created_at > NOW() - INTERVAL '10 minutes';
  IF v_email_count >= 5 THEN
    RETURN false;
  END IF;

  -- Per-IP: max 30 / 10 min (loose for shared campus/warnet wifi, tight vs floods).
  IF p_ip IS NOT NULL THEN
    SELECT count(*) INTO v_ip_count
    FROM event_registrations
    WHERE ip_address = p_ip
      AND created_at > NOW() - INTERVAL '10 minutes';
    IF v_ip_count >= 30 THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_event_reg_rate_limit(TEXT, INET) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_event_reg_rate_limit(TEXT, INET) TO anon, authenticated;
