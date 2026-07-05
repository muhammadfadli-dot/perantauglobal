-- 0093: reuse the shared set_updated_at() for interview_scheduled.
--
-- 0092 created a bespoke interview_scheduled_set_updated_at() that (a) duplicates
-- the generic public.set_updated_at() already backing 16 other triggers and
-- (b) shipped without a fixed search_path, tripping the function_search_path_mutable
-- linter. Fix both: re-point the trigger at the shared helper (which sets
-- search_path TO 'public') and drop the duplicate.

DROP TRIGGER IF EXISTS interview_scheduled_updated_at_trigger ON interview_scheduled;

CREATE TRIGGER interview_scheduled_updated_at_trigger
  BEFORE UPDATE ON interview_scheduled
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP FUNCTION IF EXISTS interview_scheduled_set_updated_at();
