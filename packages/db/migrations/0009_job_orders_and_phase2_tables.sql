-- =========================================================================
-- MIGRATION 0009: Phase 2 — job_orders + custom form fields + tier scoring + status history
-- =========================================================================
-- Adds the four tables needed for Phase 2 admin CRM (per SPEC.md §3):
--   1. job_orders                  — concrete employer × position × batch instance
--   2. position_form_fields        — admin-defined custom Q per position with tier weights
--   3. application_tiers           — A/B/C/D scoring per applicant per job_order
--   4. application_status_history  — audit log + backing for user-visible timeline
--
-- All additive — no destructive changes to existing tables.
-- applications.job_order_id is nullable so legacy applications keep working.
-- =========================================================================

-- =========================================================================
-- ENUMS
-- =========================================================================

CREATE TYPE job_order_status AS ENUM ('open', 'closed', 'filled', 'cancelled');

CREATE TYPE form_field_type AS ENUM ('select', 'radio', 'number', 'text', 'textarea', 'file', 'multiselect');

CREATE TYPE tier_label AS ENUM ('A', 'B', 'C', 'D', 'rejected');

-- =========================================================================
-- JOB_ORDERS — instance of a position with employer + batch + slot
-- =========================================================================

CREATE TABLE job_orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_slug        TEXT NOT NULL REFERENCES positions(slug) ON DELETE RESTRICT,

  -- Employer (can be confidential — public_employer_name shown on www, internal_employer_name admin-only)
  internal_employer_name TEXT NOT NULL,
  public_employer_name   TEXT,                 -- nullable; if null, fallback to "Employer di [country]"
  employer_city          TEXT,                 -- optional, public

  -- Batch info
  intake_label           TEXT NOT NULL,        -- e.g. "Batch Juni 2026"
  slot_count             INTEGER NOT NULL CHECK (slot_count > 0),
  slot_filled            INTEGER NOT NULL DEFAULT 0 CHECK (slot_filled >= 0),
  deadline               DATE,

  -- Lifecycle
  status                 job_order_status NOT NULL DEFAULT 'open',

  -- Public-facing override (overrides position.description on /lowongan/[slug])
  public_description     TEXT,

  -- Admin
  notes                  TEXT,                 -- internal-only
  created_by             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT slot_filled_lte_count CHECK (slot_filled <= slot_count)
);

CREATE INDEX idx_job_orders_position ON job_orders (position_slug);
CREATE INDEX idx_job_orders_status ON job_orders (status, created_at DESC);
CREATE INDEX idx_job_orders_open_active ON job_orders (position_slug, deadline)
  WHERE status = 'open';

CREATE TRIGGER trg_job_orders_updated_at
  BEFORE UPDATE ON job_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================================
-- APPLICATIONS: link to job_order (nullable for legacy talent-pool flow)
-- =========================================================================

ALTER TABLE applications ADD COLUMN job_order_id UUID REFERENCES job_orders(id) ON DELETE SET NULL;
CREATE INDEX idx_applications_job_order ON applications (job_order_id) WHERE job_order_id IS NOT NULL;

-- =========================================================================
-- POSITION_FORM_FIELDS — admin-defined custom Q per position
-- =========================================================================

CREATE TABLE position_form_fields (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_slug   TEXT NOT NULL REFERENCES positions(slug) ON DELETE CASCADE,

  field_key       TEXT NOT NULL,              -- snake_case, used as JSONB key in applications.answers
  field_label     TEXT NOT NULL,              -- shown to user
  field_help      TEXT,                       -- "kenapa diisi"
  field_type      form_field_type NOT NULL,
  options         JSONB,                      -- for select/radio/multiselect: [{value, label}]
  required        BOOLEAN NOT NULL DEFAULT false,
  tier_weight     INTEGER NOT NULL DEFAULT 0, -- 0 = info only, >0 contributes to tier score
  sort_order      INTEGER NOT NULL DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uniq_position_field_key UNIQUE (position_slug, field_key)
);

CREATE INDEX idx_form_fields_position ON position_form_fields (position_slug, sort_order);

CREATE TRIGGER trg_form_fields_updated_at
  BEFORE UPDATE ON position_form_fields
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================================
-- APPLICATION_TIERS — admin scoring per applicant
-- =========================================================================

CREATE TABLE application_tiers (
  application_id   UUID PRIMARY KEY REFERENCES applications(id) ON DELETE CASCADE,
  tier             tier_label NOT NULL,
  score            INTEGER,                   -- 0-100, auto-computed from form_fields tier_weight
  notes            TEXT,
  assigned_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tiers_tier ON application_tiers (tier);

-- =========================================================================
-- APPLICATION_STATUS_HISTORY — audit log + user-visible timeline
-- =========================================================================

CREATE TABLE application_status_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

  from_stage      pipeline_stage,             -- null for first entry
  to_stage        pipeline_stage NOT NULL,

  changed_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Optional admin note shown to user in /applications/[id] timeline
  public_note     TEXT,
  -- Internal-only note (admin can see, candidate cannot)
  internal_note   TEXT
);

CREATE INDEX idx_status_history_app ON application_status_history (application_id, changed_at DESC);

-- Auto-write history entry on pipeline_stage change
CREATE OR REPLACE FUNCTION log_application_stage_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.pipeline_stage IS DISTINCT FROM OLD.pipeline_stage THEN
    INSERT INTO application_status_history (application_id, from_stage, to_stage, changed_by, changed_at)
    VALUES (NEW.id, OLD.pipeline_stage, NEW.pipeline_stage, NEW.reviewed_by, NOW());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_application_stage_history
  AFTER UPDATE OF pipeline_stage ON applications
  FOR EACH ROW EXECUTE FUNCTION log_application_stage_change();

-- Seed history for existing applications: insert "applied" entry from created_at
INSERT INTO application_status_history (application_id, from_stage, to_stage, changed_at)
SELECT id, NULL, 'applied'::pipeline_stage, created_at FROM applications;

-- =========================================================================
-- JOB_ORDER slot counter — auto-increment slot_filled when application links to job_order
-- =========================================================================

CREATE OR REPLACE FUNCTION update_job_order_slot_filled()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.job_order_id IS NOT NULL THEN
    UPDATE job_orders SET slot_filled = slot_filled + 1 WHERE id = NEW.job_order_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Decrement old, increment new on job_order_id change
    IF OLD.job_order_id IS DISTINCT FROM NEW.job_order_id THEN
      IF OLD.job_order_id IS NOT NULL THEN
        UPDATE job_orders SET slot_filled = GREATEST(slot_filled - 1, 0) WHERE id = OLD.job_order_id;
      END IF;
      IF NEW.job_order_id IS NOT NULL THEN
        UPDATE job_orders SET slot_filled = slot_filled + 1 WHERE id = NEW.job_order_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.job_order_id IS NOT NULL THEN
    UPDATE job_orders SET slot_filled = GREATEST(slot_filled - 1, 0) WHERE id = OLD.job_order_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_application_job_order_slot
  AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_job_order_slot_filled();

-- =========================================================================
-- RLS — admin-only writes for new tables; public read for job_orders.status='open'
-- =========================================================================

ALTER TABLE job_orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_form_fields        ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_tiers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history  ENABLE ROW LEVEL SECURITY;

-- JOB_ORDERS: anon read open ones (for /lowongan), admin all
CREATE POLICY "job_orders_anon_read_open"
  ON job_orders FOR SELECT
  TO anon, authenticated
  USING (status = 'open');

CREATE POLICY "job_orders_admin_all"
  ON job_orders FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- POSITION_FORM_FIELDS: anon read (needed for apply form rendering), admin write
CREATE POLICY "form_fields_anon_read"
  ON position_form_fields FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "form_fields_admin_all"
  ON position_form_fields FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- APPLICATION_TIERS: admin only (internal scoring)
CREATE POLICY "tiers_admin_all"
  ON application_tiers FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- APPLICATION_STATUS_HISTORY:
--   - Candidate can read own (for timeline display)
--   - Admin all
CREATE POLICY "status_history_self_read"
  ON application_status_history FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT a.id FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      WHERE c.auth_user_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "status_history_admin_write"
  ON application_status_history FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- =========================================================================
-- DONE — migration 0009
-- =========================================================================
