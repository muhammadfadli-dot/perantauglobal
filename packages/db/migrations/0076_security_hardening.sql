-- 0076: DB integrity + security hardening (Batch 9, non-destructive subset).
--
-- 1. consents anon-insert forgery: the policy was WITH CHECK (true), so anon
--    could POST a consent attributed to ANY candidate_id (PDP ledger forgery).
--    The legitimate web LP path (pending-write.ts) only ever sets pending_id —
--    candidate_id is always NULL pre-auth — so restricting anon inserts to
--    candidate_id IS NULL closes the forgery without touching the real flow.
--    (Authenticated candidates write via consents_candidate_insert_own.)
DROP POLICY IF EXISTS consents_anon_insert ON public.consents;
CREATE POLICY consents_anon_insert ON public.consents
  FOR INSERT TO anon
  WITH CHECK (candidate_id IS NULL);

-- 2. Covering indexes for unindexed foreign keys (get_advisors performance).
CREATE INDEX IF NOT EXISTS idx_academy_lesson_progress_lesson
  ON public.academy_lesson_progress (lesson_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_agents_created_by
  ON public.affiliate_agents (created_by);
CREATE INDEX IF NOT EXISTS idx_affiliate_commission_events_application
  ON public.affiliate_commission_events (application_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commission_events_approved_by
  ON public.affiliate_commission_events (approved_by);
CREATE INDEX IF NOT EXISTS idx_application_cv_fit_assessment
  ON public.application_cv_fit (assessment_id);
CREATE INDEX IF NOT EXISTS idx_candidates_referred_by_code
  ON public.candidates (referred_by_code_id);
CREATE INDEX IF NOT EXISTS idx_pending_submissions_program
  ON public.pending_submissions (program_slug);

-- 3. Remove junk test positions (verified inactive, 0 applications, 0 job orders).
DELETE FROM public.positions
  WHERE slug IN ('test', 'tester') AND active = false;
