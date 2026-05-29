-- Migration 0058: let authenticated candidates log their own PDP consent
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-29.
--
-- Until now `consents` had only an anon INSERT policy (the web LP form path via
-- pending-write.ts). The portal apply flow (submitApplication) runs as the
-- authenticated candidate, so it could not record a per-application consent —
-- the apply consent was neither affirmative (box pre-checked) nor logged.
--
-- This adds an INSERT policy mirroring docs_self_insert: a candidate may write a
-- consent row ONLY for their own candidate_id. auth.uid() is wrapped in a scalar
-- subselect (initplan best-practice). Anon insert + candidate self-read +
-- candidate self-withdraw + admin read policies are unchanged.

CREATE POLICY consents_candidate_insert_own ON public.consents
  FOR INSERT TO authenticated
  WITH CHECK (
    candidate_id IN (
      SELECT id FROM public.candidates WHERE auth_user_id = (select auth.uid())
    )
  );
