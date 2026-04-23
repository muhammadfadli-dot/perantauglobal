-- ============================================================================
-- Migration 0008 — contact_submissions + employer_inquiries
-- ============================================================================
-- Ports two legacy gt-tools tables into the new Supabase so apps/web can
-- drop `SUPABASE_SERVICE_ROLE_KEY`. Both are public-facing forms (kontak,
-- mitra/employer) that don't belong in the candidate/application graph —
-- they're inbound leads for Panji/ops, not talent-pool data.
--
-- RLS: anon INSERT (form submit), admin SELECT/UPDATE (triage).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- contact_submissions — from /kontak form
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_submissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  -- ops triage
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'spam')),
  notes      TEXT
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON contact_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status
  ON contact_submissions (status) WHERE status != 'resolved';

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY contact_anon_insert
  ON contact_submissions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY contact_admin_read
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY contact_admin_update
  ON contact_submissions FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ----------------------------------------------------------------------------
-- employer_inquiries — from /mitra (EN employer landing) form
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employer_inquiries (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_name             TEXT NOT NULL,
  contact_person           TEXT NOT NULL,
  email                    TEXT NOT NULL,
  phone                    TEXT NOT NULL,
  country                  TEXT NOT NULL,
  industry                 TEXT NOT NULL,
  workers_needed           TEXT NOT NULL,
  timeline                 TEXT NOT NULL,
  additional_requirements  TEXT,
  -- ops triage
  status                   TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'qualified', 'disqualified', 'closed')),
  notes                    TEXT
);

CREATE INDEX IF NOT EXISTS idx_employer_inquiries_created_at
  ON employer_inquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_employer_inquiries_status
  ON employer_inquiries (status) WHERE status NOT IN ('closed', 'disqualified');

ALTER TABLE employer_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY employer_anon_insert
  ON employer_inquiries FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY employer_admin_read
  ON employer_inquiries FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY employer_admin_update
  ON employer_inquiries FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
