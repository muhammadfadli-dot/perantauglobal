-- 0091: let a candidate read the CV-to-position fit for their OWN applications.
--
-- application_cv_fit was admin-only (application_cv_fit_admin_all via is_admin()),
-- so the position-specific fit_score + requirement_checks the grader computes
-- never reached the candidate — the value was trapped in the admin CRM. The
-- candidate already re-fits their own CV (applications/[id]/actions triggerRefit
-- → grade-cv, which is ownership-scoped), they just couldn't read the result.
--
-- Add an owner-read SELECT policy scoped through applications → candidates →
-- auth_user_id. The admin ALL policy is unchanged. Uses (select auth.uid()) so
-- the predicate is evaluated once per query, not per row.

create policy application_cv_fit_owner_read
  on public.application_cv_fit
  for select
  to authenticated
  using (
    application_id in (
      select a.id
      from public.applications a
      join public.candidates c on c.id = a.candidate_id
      where c.auth_user_id = (select auth.uid())
    )
  );
