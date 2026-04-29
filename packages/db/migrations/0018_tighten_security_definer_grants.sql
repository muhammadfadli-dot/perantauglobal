-- =========================================================================
-- MIGRATION 0018: tighten EXECUTE on SECURITY DEFINER functions
-- =========================================================================
-- Closes Supabase advisor warnings:
--   * `anon_security_definer_function_executable` (lint 0028)
--   * `authenticated_security_definer_function_executable` (lint 0029)
--
-- Functions retain their internal `is_admin()` / `auth.uid()` checks — this
-- migration is defense-in-depth, not a behavioral fix. Removing PUBLIC and
-- (where unused) anon access reduces information disclosure to attackers
-- probing `/rest/v1/rpc/*` and aligns with principle of least privilege.
--
-- Caller impact:
--   * Candidates / form submitters (anon)  → unchanged. No code path calls these.
--   * Authenticated candidates             → unchanged. Server actions use admin
--                                            paths only.
--   * Admins (DTG team)                    → unchanged. Server actions still call
--                                            `is_admin()` via authenticated RPC
--                                            and `log_admin_action()` via the
--                                            authenticated grant retained below.
--   * `handle_new_auth_user()`             → unchanged. It runs as a trigger on
--                                            auth.users, not via RPC.
-- =========================================================================

-- -------------------------------------------------------------------------
-- log_admin_action: only authenticated callers (gated by internal is_admin())
-- -------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.log_admin_action(TEXT, TEXT, TEXT, JSONB, INET, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_admin_action(TEXT, TEXT, TEXT, JSONB, INET, TEXT) FROM anon;
-- authenticated grant from migration 0017 retained.

-- -------------------------------------------------------------------------
-- handle_new_auth_user: trigger function only — no API caller ever needs it
-- -------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM authenticated;
-- Trigger continues to fire as the table owner via SECURITY DEFINER.

-- -------------------------------------------------------------------------
-- is_admin: keep authenticated (used by `supabase.rpc('is_admin')` in server
-- code), revoke from anon — anon never needs to check admin status.
-- -------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
-- authenticated grant from migration 0004 retained.
