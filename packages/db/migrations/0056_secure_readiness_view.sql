-- Migration 0056: close the application_readiness_view IDOR / PII-enumeration hole
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-29.
--
-- PROBLEM (Supabase advisor ERROR security_definer_view; proven via role-simulation):
-- application_readiness_view (created 0037, recreated 0053) is a plain VIEW with no
-- security_invoker, so it executes with the OWNER's (postgres) rights and BYPASSES the
-- row-level security on the underlying `applications` table. It was GRANTed to
-- `authenticated`, and `anon`/`authenticated` also retained ALL privileges from
-- Supabase's default `GRANT ALL ON ALL TABLES`. Result: ANY logged-in candidate (and
-- anyone holding the public anon key) could `select * from application_readiness_view`
-- and read application_id + candidate_id + position_slug + hard_pass for ALL applications
-- — an IDOR / horizontal PII-adjacent enumeration. Proven: as a random authenticated
-- JWT, the view returned all rows while `select from applications` returned 0 (RLS).
--
-- FIX:
--   1. SET (security_invoker = true) — the view now runs with the CALLER's rights, so the
--      existing RLS on applications/candidate_documents/position_application_fields applies:
--        - candidates: applications_self_read scopes to their own rows
--        - admins:     applications_admin_all (is_admin()) still sees every row
--        - anon:       auth.uid() is null -> 0 rows
--   2. Tighten grants: revoke everything from anon (defense-in-depth; it would get 0 rows
--      anyway under security_invoker), reduce `authenticated` to SELECT only. service_role
--      (server-only) keeps full access.
--
-- REVERSIBLE: ALTER VIEW ... SET (security_invoker = false); GRANT ... TO anon; if needed.

ALTER VIEW public.application_readiness_view SET (security_invoker = true);

REVOKE ALL    ON public.application_readiness_view FROM anon;
REVOKE ALL    ON public.application_readiness_view FROM authenticated;
GRANT  SELECT ON public.application_readiness_view TO authenticated;

COMMENT ON VIEW public.application_readiness_view IS
  'Per-application hard_pass. security_invoker=true: honors the caller''s RLS on applications/candidate_documents/position_application_fields. Candidates see only their own rows; admins (is_admin()) see all; anon sees none. Hardened in migration 0056.';
