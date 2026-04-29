-- =========================================================================
-- MIGRATION 0020: pin search_path on functions that left it mutable
-- =========================================================================
-- Closes Supabase advisor lint 0011 (`function_search_path_mutable`) for
-- four pre-existing functions defined without an explicit search_path:
--
--   * set_updated_at()              — trigger, sets NEW.updated_at = NOW()
--   * compute_readiness()           — IMMUTABLE, computes % match score
--   * log_application_stage_change() — trigger, inserts into status_history
--   * update_job_order_slot_filled() — trigger, ±1 to job_orders.slot_filled
--
-- Why pin search_path:
--   Without an explicit setting, the function uses the caller's search_path.
--   An attacker who can create an object (e.g. function `now()`) in a schema
--   that resolves before pg_catalog could shadow built-ins and hijack
--   behavior. Pinning to `public` (with implicit pg_catalog fallback) makes
--   resolution deterministic.
--
-- Caller impact: zero. Triggers continue to fire as before; the IMMUTABLE
-- compute_readiness() returns the same value for the same inputs.
-- =========================================================================

ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.compute_readiness(JSONB, JSONB) SET search_path = public;
ALTER FUNCTION public.log_application_stage_change() SET search_path = public;
ALTER FUNCTION public.update_job_order_slot_filled() SET search_path = public;
