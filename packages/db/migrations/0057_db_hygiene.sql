-- Migration 0057: DB hygiene — drop duplicate index, drop dead duplicate RLS policies, add missing FK indexes
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-29.
--
-- Advisor-driven cleanup, all low-risk and reversible:
--
-- 1. DUPLICATE INDEX: candidates has two byte-identical partial indexes on (phone)
--    WHERE phone IS NOT NULL — idx_candidates_phone (tracked, from 0001/0007) and
--    idx_candidates_phone_nn (created directly in prod, untracked). Drop the untracked dup.
--
-- 2. DEAD DUPLICATE ADMIN RLS POLICIES: migration 0001 created admin policies gated on the
--    `auth.jwt()->>'role' = 'admin'` JWT claim. Migration 0004 introduced the is_admin()
--    model under DIFFERENT names but only dropped its own names, leaving the 0001 JWT
--    policies in place as permissive duplicates. The Auth role-claim hook is NOT wired
--    (confirmed in 0004/0055 comments), so the JWT branch is permanently dead — every admin
--    query needlessly evaluates a second always-false PERMISSIVE policy. Drop the dead ones;
--    the is_admin() twins (applications_admin_all / positions_admin_write / documents_admin_all)
--    remain and fully cover admin access.
--
-- 3. UNINDEXED FOREIGN KEYS: add covering btree indexes on the reviewer/creator/FK columns
--    flagged by the performance advisor.

-- 1. duplicate index ----------------------------------------------------------
DROP INDEX IF EXISTS public.idx_candidates_phone_nn;

-- 2. dead duplicate admin RLS policies ----------------------------------------
DROP POLICY IF EXISTS applications_admin_write ON public.applications;     -- dup of applications_admin_all (is_admin())
DROP POLICY IF EXISTS positions_admin_all      ON public.positions;        -- dup of positions_admin_write (is_admin())
DROP POLICY IF EXISTS docs_admin_all           ON public.candidate_documents; -- dup of documents_admin_all (is_admin())

-- 3. missing FK indexes -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_application_status_history_changed_by
  ON public.application_status_history (changed_by);
CREATE INDEX IF NOT EXISTS idx_applications_reviewed_by
  ON public.applications (reviewed_by);
CREATE INDEX IF NOT EXISTS idx_candidate_documents_rejected_by
  ON public.candidate_documents (rejected_by);
CREATE INDEX IF NOT EXISTS idx_candidate_documents_verified_by
  ON public.candidate_documents (verified_by);
CREATE INDEX IF NOT EXISTS idx_job_orders_created_by
  ON public.job_orders (created_by);
CREATE INDEX IF NOT EXISTS idx_pending_submissions_position_slug
  ON public.pending_submissions (position_slug);
