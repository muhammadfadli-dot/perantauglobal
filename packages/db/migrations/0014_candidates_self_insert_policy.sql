-- =========================================================================
-- MIGRATION 0014: allow authenticated users to self-insert their candidate row
-- =========================================================================
-- Why:
--   `requireCandidate()` in apps/platform self-heals missing candidate rows
--   by inserting a skeleton. Without this policy, it has to use the service
--   role (which requires SUPABASE_SERVICE_ROLE_KEY env var — missing in the
--   platform Vercel env, causing server-side exceptions).
--
--   Principle of least privilege: a user inserting their *own* candidate row
--   (auth_user_id = auth.uid()) is a safe, scoped action. No reason to escalate
--   to service role for it. Matches the existing self_update / self_read
--   pattern in 0001.
--
-- Safety:
--   - Still ONE row per auth user (enforced by UNIQUE auth_user_id in 0001).
--   - WITH CHECK `auth_user_id = auth.uid()` prevents impersonation — user
--     can only insert a row tied to their own JWT.
--   - Email UNIQUE constraint still prevents collision with backfilled
--     candidates (in which case requireCandidate falls back to service-role
--     link-by-email if available).
-- =========================================================================

CREATE POLICY "candidates_self_insert"
  ON candidates FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Backfill: materialize candidate rows for any already-verified auth.users
-- that don't have one yet (e.g. users who signed up before migration 0013).
-- Uses the same placeholder logic as handle_new_auth_user() and
-- requireCandidate(): email prefix, bounded 2-200 chars.
INSERT INTO candidates (auth_user_id, email, full_name, profile_data, source)
SELECT
  au.id,
  lower(au.email),
  CASE
    WHEN length(split_part(au.email, '@', 1)) BETWEEN 2 AND 200
      THEN split_part(au.email, '@', 1)
    ELSE 'Kandidat baru'
  END,
  jsonb_build_object(
    'schema_version', 1,
    'credentials', '{}'::jsonb,
    'onboarding', '{}'::jsonb
  ),
  'direct_signup'
FROM auth.users au
LEFT JOIN candidates c ON c.auth_user_id = au.id
WHERE au.email_confirmed_at IS NOT NULL
  AND c.id IS NULL
  AND NOT EXISTS (
    -- Skip if a backfilled candidate exists by email (someone else will link it)
    SELECT 1 FROM candidates c2 WHERE lower(c2.email) = lower(au.email)
  )
ON CONFLICT (auth_user_id) DO NOTHING;
