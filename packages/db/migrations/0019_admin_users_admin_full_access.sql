-- ============================================================================
-- Migration 0019 — admin_users full access for admins
-- ============================================================================
-- 0004 only granted `admin_users_read_self` so a signed-in user could check
-- their own row. That broke the /admin/team UI (only the caller's own row was
-- listed) and silently blocked invite/remove writes done through the user
-- session client.
--
-- This migration grants admins (via is_admin()) full read + write on the
-- allowlist. Non-admins keep self-read only. No service_role needed.
-- ============================================================================

CREATE POLICY admin_users_admin_read
  ON admin_users FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY admin_users_admin_insert
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY admin_users_admin_delete
  ON admin_users FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY admin_users_admin_update
  ON admin_users FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- DONE — migration 0019
-- ============================================================================
