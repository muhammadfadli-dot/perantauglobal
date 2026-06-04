-- 0068_affiliate_revoke_internal_grants.sql
--
-- Security hardening for the 0067 affiliate functions, surfaced by the Supabase
-- security advisor (lint 0028/0029) right after applying 0067.
--
-- `_attribute_candidate_referral(uuid,text)` and `log_affiliate_departure_event()`
-- are INTERNAL — the first is called only by the handle_new_auth_user
-- materialization trigger, the second is a row trigger. 0067 did
-- `REVOKE EXECUTE ... FROM PUBLIC`, but Supabase grants EXECUTE on new public
-- functions to `anon` + `authenticated` via ALTER DEFAULT PRIVILEGES, so the
-- PUBLIC revoke left them callable as anon/authenticated RPCs
-- (`/rest/v1/rpc/_attribute_candidate_referral`). Since `_attribute_candidate_referral`
-- is SECURITY DEFINER, an anon caller could forge candidate attribution + commission
-- rows. Revoke EXECUTE from both roles explicitly.
--
-- The materialization trigger keeps working: it PERFORMs the helper inside a
-- SECURITY DEFINER function owned by postgres, which executes as the owner
-- regardless of role grants. validate_referral_code stays anon-callable on
-- purpose (boolean-only public check, same posture as is_admin / log_admin_action).

REVOKE EXECUTE ON FUNCTION public._attribute_candidate_referral(uuid, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_affiliate_departure_event() FROM anon, authenticated;
