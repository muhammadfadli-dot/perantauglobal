-- =========================================================================
-- MIGRATION 0007: drop candidates.phone UNIQUE constraint
-- =========================================================================
-- The `candidates_phone_key` UNIQUE constraint was originally added as a
-- soft de-duplication signal, but in a talent pool model it causes trigger
-- failures:
--
--   - Backfilled candidate already has phone `08xxx` (from gt-tools)
--   - Same person (or family sharing a device) registers with a new email
--   - Trigger `handle_new_auth_user` INSERTs a new candidate row with the
--     same phone → UNIQUE violation → transaction aborts → auth.users
--     INSERT rolls back → no magic-link email ever sent, silent failure
--
-- Observed in prod auth logs 2026-04-22T14:21:42Z and 14:23:11Z:
--   "duplicate key value violates unique constraint candidates_phone_key"
--   "500: Database error saving new user" on /otp
--
-- Phone stays indexed for lookup but no longer unique. Email remains the
-- authoritative de-dup key (`candidates_email_key` UNIQUE).
-- =========================================================================

ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_phone_key;

-- Keep phone searchable (e.g., admin CRM lookup by WA number).
CREATE INDEX IF NOT EXISTS idx_candidates_phone ON candidates (phone);
