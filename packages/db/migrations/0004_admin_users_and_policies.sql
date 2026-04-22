-- ============================================================================
-- Migration 0004 — Admin allowlist + is_admin() + expanded RLS policies
-- ============================================================================
-- Adds an `admin_users` table that serves as the source of truth for admin
-- elevation. Avoids the complexity of Supabase Auth hooks at MVP; admins
-- are any signed-in user whose email is seeded here.
--
-- New `is_admin()` helper centralizes the check. Existing RLS policies that
-- hardcoded `auth.jwt() ->> 'role' = 'admin'` are superseded by policies
-- that call `is_admin()` so both JWT-claim-based AND table-based elevation
-- work (forward-compatible with Auth hook adoption later).
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  email      TEXT PRIMARY KEY,
  added_at   TIMESTAMPTZ DEFAULT NOW(),
  added_by   TEXT,
  notes      TEXT
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- A signed-in user can SELECT their own row to check if they're an admin.
-- Writes only via service role (migrations, CLI).
CREATE POLICY admin_users_read_self
  ON admin_users FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- ----------------------------------------------------------------------------
-- Helper: is_admin() — true when caller is in admin_users OR has JWT role=admin
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  SELECT
    coalesce(auth.jwt() ->> 'role' = 'admin', false)
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;

-- Make it callable by authenticated users (doesn't leak admin list since
-- the function runs SECURITY DEFINER and only returns a boolean).
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

-- ----------------------------------------------------------------------------
-- Replace hardcoded admin policies with is_admin() calls
-- ----------------------------------------------------------------------------

-- candidates
DROP POLICY IF EXISTS candidates_admin_all ON candidates;
CREATE POLICY candidates_admin_all
  ON candidates FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- applications
DROP POLICY IF EXISTS applications_admin_all ON applications;
CREATE POLICY applications_admin_all
  ON applications FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- candidate_documents
DROP POLICY IF EXISTS documents_admin_all ON candidate_documents;
CREATE POLICY documents_admin_all
  ON candidate_documents FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- positions — admin write (read is public already in 0001)
DROP POLICY IF EXISTS positions_admin_write ON positions;
CREATE POLICY positions_admin_write
  ON positions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- consents — admin read (keep candidate self-read + anon insert from 0001)
DROP POLICY IF EXISTS consents_admin_read ON consents;
CREATE POLICY consents_admin_read
  ON consents FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
  );

-- pending_submissions — admin read
DROP POLICY IF EXISTS pending_admin_read ON pending_submissions;
CREATE POLICY pending_admin_read
  ON pending_submissions FOR SELECT
  TO authenticated
  USING (is_admin());

-- ----------------------------------------------------------------------------
-- Seed initial admin (Panji)
-- ----------------------------------------------------------------------------
INSERT INTO admin_users (email, added_by, notes)
VALUES ('panjifrmansyah@gmail.com', 'migration 0004', 'Solo founder — initial admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- DONE — migration 0004
-- ============================================================================
