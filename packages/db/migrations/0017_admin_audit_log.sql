-- =========================================================================
-- MIGRATION 0017: admin_audit_log + log_admin_action() helper
-- =========================================================================
-- Adds an immutable audit trail of admin actions for PDP UU 27/2022 Pasal 35
-- compliance ("records of processing activities"). Every admin action that
-- mutates candidate state or accesses PII (KTP, paspor, dokumen) writes a
-- row here.
--
-- Design:
--   - Admins can SELECT (read all logs).
--   - Nobody can UPDATE or DELETE — RLS denies by default with no policy.
--   - INSERT only via SECURITY DEFINER function `log_admin_action()` that
--     verifies the caller is admin and stamps the row with auth.uid() +
--     auth.jwt().email. Admins can't backdate entries or impersonate.
--
-- Coverage (wired in apps/platform/src/lib/audit-log.ts):
--   * candidate_document: view (signed URL gen), verify, reject
--   * application:        stage change, notes, reached_out, tier assign/clear
--   * admin_user:         invite, remove (escalation events)
--   * contact_submission: status update, notes update
-- =========================================================================

CREATE TABLE admin_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email     TEXT NOT NULL,

  action          TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  resource_id     TEXT,

  metadata        JSONB,
  ip_address      INET,
  user_agent      TEXT,

  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Read patterns: by admin (who did what), by resource (who touched this), by action timeline
CREATE INDEX idx_audit_log_admin_time    ON admin_audit_log (admin_user_id, occurred_at DESC);
CREATE INDEX idx_audit_log_resource      ON admin_audit_log (resource_type, resource_id, occurred_at DESC);
CREATE INDEX idx_audit_log_action_time   ON admin_audit_log (action, occurred_at DESC);
CREATE INDEX idx_audit_log_occurred_desc ON admin_audit_log (occurred_at DESC);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can read the full log.
CREATE POLICY admin_audit_log_admin_read
  ON admin_audit_log FOR SELECT
  TO authenticated
  USING (is_admin());

-- No INSERT/UPDATE/DELETE policies — direct mutation by RLS-bound clients
-- is denied. Inserts happen via log_admin_action() (SECURITY DEFINER below).

-- =========================================================================
-- log_admin_action() — single insert path. Validates the caller is admin
-- and stamps the row with auth context. Safe to expose to authenticated
-- role because of the is_admin() gate.
-- =========================================================================
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action        TEXT,
  p_resource_type TEXT,
  p_resource_id   TEXT,
  p_metadata      JSONB DEFAULT NULL,
  p_ip_address    INET DEFAULT NULL,
  p_user_agent    TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_user_id UUID;
  v_email   TEXT;
  v_id      UUID;
BEGIN
  v_user_id := auth.uid();
  v_email   := COALESCE(NULLIF(auth.jwt() ->> 'email', ''), '');

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'log_admin_action: no authenticated user' USING ERRCODE = '28000';
  END IF;

  IF NOT is_admin() THEN
    RAISE EXCEPTION 'log_admin_action: caller is not admin' USING ERRCODE = '42501';
  END IF;

  IF p_action IS NULL OR length(p_action) = 0 OR length(p_action) > 64 THEN
    RAISE EXCEPTION 'log_admin_action: action required, max 64 chars';
  END IF;

  IF p_resource_type IS NULL OR length(p_resource_type) = 0 OR length(p_resource_type) > 64 THEN
    RAISE EXCEPTION 'log_admin_action: resource_type required, max 64 chars';
  END IF;

  INSERT INTO admin_audit_log (
    admin_user_id, admin_email, action, resource_type, resource_id, metadata, ip_address, user_agent
  ) VALUES (
    v_user_id, v_email, p_action, p_resource_type, p_resource_id, p_metadata, p_ip_address, p_user_agent
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION log_admin_action(TEXT, TEXT, TEXT, JSONB, INET, TEXT) TO authenticated;
