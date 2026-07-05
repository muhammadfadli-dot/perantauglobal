-- 0092: interview scheduling (supersedes the never-applied 0041 draft).
--
-- Closes the audit's #1 pipeline gap: advancing a candidate to "interview" was a
-- bare pipeline_stage label with no data. One row per scheduled interview per
-- application (reschedule history kept). candidate_note is candidate-visible
-- (Beranda S4); admin_note is private. Corrections vs the 0041 draft: RLS uses
-- (select auth.uid()); the interview_current SECURITY-DEFINER view is dropped
-- (apps query the table directly under RLS, avoiding an IDOR-prone view).

CREATE TABLE IF NOT EXISTS interview_scheduled (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id      uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  scheduled_at        timestamptz NOT NULL,
  duration_minutes    integer NOT NULL DEFAULT 30,
  platform            text NOT NULL DEFAULT 'whatsapp'
                      CHECK (platform IN ('whatsapp','zoom','google_meet','phone','in_person')),
  meeting_url         text,
  meeting_location    text,
  status              text NOT NULL DEFAULT 'scheduled'
                      CHECK (status IN ('scheduled','completed','cancelled','rescheduled','no_show')),
  cancelled_at        timestamptz,
  cancellation_reason text,
  admin_note          text,
  candidate_note      text,
  scheduled_by        uuid REFERENCES auth.users(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS interview_scheduled_app_idx
  ON interview_scheduled(application_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS interview_scheduled_upcoming_idx
  ON interview_scheduled(scheduled_at) WHERE status = 'scheduled';

ALTER TABLE interview_scheduled ENABLE ROW LEVEL SECURITY;

-- Candidate reads their own interviews (Beranda S4); admin reads/writes all.
CREATE POLICY interview_scheduled_own_read ON interview_scheduled
  FOR SELECT TO authenticated
  USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      WHERE a.id = application_id AND c.auth_user_id = (select auth.uid())
    )
  );

CREATE POLICY interview_scheduled_admin_write ON interview_scheduled
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

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
