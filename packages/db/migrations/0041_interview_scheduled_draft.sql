-- =============================================================================
-- Migration 0041 — Interview scheduling for Beranda S4 (DRAFT)
--
-- Status: DRAFT — not applied. Apply only when admin UI for scheduling
-- interviews ships (see Phase 7 follow-up planning).
--
-- One row per scheduled interview. Multiple interviews per application
-- allowed (rescheduling history). The "current" interview is the most
-- recent non-cancelled one per application_id.
-- =============================================================================

CREATE TABLE IF NOT EXISTS interview_scheduled (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id      uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  -- Interview meta
  scheduled_at        timestamptz NOT NULL,                 -- when the interview happens
  duration_minutes    integer NOT NULL DEFAULT 30,
  platform            text NOT NULL DEFAULT 'whatsapp'      -- 'whatsapp', 'zoom', 'google_meet', 'phone', 'in_person'
                      CHECK (platform IN ('whatsapp', 'zoom', 'google_meet', 'phone', 'in_person')),
  meeting_url         text,                                 -- Zoom link / Meet link
  meeting_location    text,                                 -- physical address if platform = in_person
  -- Status
  status              text NOT NULL DEFAULT 'scheduled'     -- 'scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show'
                      CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  cancelled_at        timestamptz,
  cancellation_reason text,
  -- Notes
  admin_note          text,                                 -- private admin note
  candidate_note      text,                                 -- visible to candidate via portal
  -- Audit
  scheduled_by        uuid REFERENCES auth.users(id),       -- admin who created
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX interview_scheduled_app_idx
  ON interview_scheduled(application_id, scheduled_at DESC);

CREATE INDEX interview_scheduled_upcoming_idx
  ON interview_scheduled(scheduled_at) WHERE status = 'scheduled';

-- RLS
ALTER TABLE interview_scheduled ENABLE ROW LEVEL SECURITY;

CREATE POLICY interview_scheduled_own_read ON interview_scheduled
  FOR SELECT TO authenticated
  USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      WHERE a.id = application_id AND c.auth_user_id = auth.uid()
    )
  );

CREATE POLICY interview_scheduled_admin_write ON interview_scheduled
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- updated_at trigger
CREATE OR REPLACE FUNCTION interview_scheduled_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER interview_scheduled_updated_at_trigger
  BEFORE UPDATE ON interview_scheduled
  FOR EACH ROW EXECUTE FUNCTION interview_scheduled_set_updated_at();

-- Helper view: most-recent non-cancelled interview per application (used by Beranda S4)
CREATE OR REPLACE VIEW interview_current AS
  SELECT DISTINCT ON (application_id) *
  FROM interview_scheduled
  WHERE status IN ('scheduled', 'completed')
  ORDER BY application_id, scheduled_at DESC;
