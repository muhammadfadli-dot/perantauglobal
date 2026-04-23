-- =========================================================================
-- MIGRATION 0012: fire handle_new_auth_user() on email verification, not INSERT
-- =========================================================================
-- Why:
--   With password signup (supabase.auth.signUp) and confirm-email enabled,
--   auth.users is INSERTed immediately with email_confirmed_at = NULL and
--   no session. If the materialization trigger fires on INSERT, we spam
--   `candidates` with unverified rows for bots, typos, or abandoned signups.
--
--   The same flaw quietly existed in the magic-link path today: signInWithOtp
--   with shouldCreateUser=true creates auth.users BEFORE the user clicks
--   the link. The AFTER INSERT trigger would fire then — not on click. The
--   comment in 0003 saying "candidate clicks link → Supabase creates auth.users
--   row" describes an older Supabase behavior that no longer matches reality.
--
-- Fix:
--   Move the trigger from AFTER INSERT to AFTER UPDATE OF email_confirmed_at,
--   gated on the transition NULL → NOT NULL. Both magic-link and password
--   signup flows converge here — materialization happens once, at verify time.
--
-- Function body is unchanged (last rewritten in 0006). Only WHEN the trigger
-- fires changes.
-- =========================================================================

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;

CREATE TRIGGER trg_on_auth_user_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_auth_user();
