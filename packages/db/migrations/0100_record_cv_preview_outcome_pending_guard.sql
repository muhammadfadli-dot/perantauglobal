-- 0100_record_cv_preview_outcome_pending_guard.sql
--
-- Post-review hardening (CV Grader). `record_cv_preview_outcome` is anon-callable
-- and keyed on cv_preview_events.id (bigserial = guessable). On its own that let
-- someone in the 10-minute window stamp a fabricated fit/outcome onto another
-- caller's event row, skewing the tuning distribution. Bind the write to the
-- caller's own pending_id too: the event row always carries pending_id (set by
-- check_cv_preview_rate_limit), and the preview route already validated
-- pending_id against the CV path, so it passes it here. An attacker would now
-- need the victim's RANDOM uuid on top of the sequential id — effectively closed.
--
-- Signature changes (added p_pending_id), so DROP the old 3-arg function first.
-- ROLLBACK: re-create the 3-arg version from migration 0095 and drop this one.

DROP FUNCTION IF EXISTS public.record_cv_preview_outcome(bigint, integer, text);

CREATE OR REPLACE FUNCTION public.record_cv_preview_outcome(
  p_event_id   bigint,
  p_pending_id uuid    DEFAULT NULL,
  p_fit_score  integer DEFAULT NULL,
  p_outcome    text    DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE cv_preview_events
  SET fit_score = CASE WHEN p_fit_score IS NULL THEN fit_score
                       ELSE GREATEST(0, LEAST(100, p_fit_score)) END,
      outcome   = CASE WHEN p_outcome IN ('scored','no_fit','error','rate_limited','unreadable')
                       THEN p_outcome ELSE outcome END
  WHERE id = p_event_id
    -- Must match the caller's own event: the sequential id alone is not enough.
    AND p_pending_id IS NOT NULL
    AND pending_id = p_pending_id
    AND outcome IS NULL
    AND created_at > NOW() - INTERVAL '10 minutes';
END;
$function$;

-- Supabase auto-grants EXECUTE to anon on new functions; make the intent explicit
-- (this is a client-facing telemetry write, same surface as the 0095 original).
REVOKE ALL ON FUNCTION public.record_cv_preview_outcome(bigint, uuid, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_cv_preview_outcome(bigint, uuid, integer, text)
  TO anon, authenticated, service_role;
