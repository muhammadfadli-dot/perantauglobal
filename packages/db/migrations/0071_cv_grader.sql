-- 0071_cv_grader.sql
--
-- AI CV grader foundation (Fase 1). Two tables:
--
--   cv_assessments     — one row per graded CV document. Candidate-level,
--                        position-agnostic. Holds the AI-extracted structured CV
--                        (`parsed`), code-computed facts (`derived`: umur,
--                        total_pengalaman_tahun — accurate because computed in
--                        code from dates, not guessed by the model), and an
--                        intrinsic completeness score (`quality`).
--
--   application_cv_fit — one row per application (candidate × position). Holds
--                        the position-fit score + reasons, plus a `verification`
--                        hook (CV-vs-qualifying-answer consistency) filled in a
--                        later batch.
--
-- The grader runs server-side in the `grade-cv` Edge Function (service role) and
-- is the ONLY writer — service role bypasses RLS, so no insert policy is needed.
-- RLS grants admin full access on both tables, and lets a candidate read their
-- OWN assessments (for the "CV kamu X% lengkap" nudge). Fit rows are admin-only.
--
-- Decision (2026-06-10): CV is a SCORING signal, not a hard gate. A contradiction
-- between the CV and a self-reported qualifying answer is FLAGGED for admin
-- (`verification` + `has_flags`), never auto-applied to the score — the CV may
-- simply be an outdated copy. See project memory project_cv_grader.

-- ============================================================================
-- 1. cv_assessments — per CV document (candidate-level, position-agnostic)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cv_assessments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id   UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  document_id    UUID NOT NULL REFERENCES candidate_documents(id) ON DELETE CASCADE,
  parsed         JSONB NOT NULL DEFAULT '{}'::jsonb,  -- structured CV (incl. schema_version)
  derived        JSONB NOT NULL DEFAULT '{}'::jsonb,  -- code-computed: umur, total_pengalaman_tahun
  quality        JSONB NOT NULL DEFAULT '{}'::jsonb,  -- { skor_kelengkapan, kekurangan[] }
  quality_score  INT CHECK (quality_score IS NULL OR quality_score BETWEEN 0 AND 100),  -- denorm for sort
  status         TEXT NOT NULL DEFAULT 'ok'
                   CHECK (status IN ('ok', 'needs_review', 'unreadable', 'error')),
  error          TEXT,
  model          TEXT,
  prompt_version TEXT,
  tokens_in      INT,
  tokens_out     INT,
  cost_usd       NUMERIC(10, 6),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One assessment per document; re-grading upserts in place (ON CONFLICT document_id).
CREATE UNIQUE INDEX IF NOT EXISTS uq_cv_assessments_document ON cv_assessments (document_id);
CREATE INDEX IF NOT EXISTS idx_cv_assessments_candidate ON cv_assessments (candidate_id);
CREATE INDEX IF NOT EXISTS idx_cv_assessments_quality ON cv_assessments (quality_score DESC NULLS LAST);

-- ============================================================================
-- 2. application_cv_fit — per application (candidate × position)
-- ============================================================================

CREATE TABLE IF NOT EXISTS application_cv_fit (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  assessment_id  UUID REFERENCES cv_assessments(id) ON DELETE SET NULL,
  position_slug  TEXT NOT NULL,
  fit_score      INT CHECK (fit_score IS NULL OR fit_score BETWEEN 0 AND 100),
  reasons        JSONB NOT NULL DEFAULT '{}'::jsonb,  -- { alasan, yang_kurang[] }
  verification   JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{ field_key, claim, evidence, verdict }] (later)
  has_flags      BOOLEAN NOT NULL DEFAULT FALSE,      -- true if any contradiction flagged for admin
  status         TEXT NOT NULL DEFAULT 'ok'
                   CHECK (status IN ('ok', 'skipped', 'error')),
  model          TEXT,
  prompt_version TEXT,
  cost_usd       NUMERIC(10, 6),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_application_cv_fit_application ON application_cv_fit (application_id);
CREATE INDEX IF NOT EXISTS idx_application_cv_fit_position ON application_cv_fit (position_slug);
CREATE INDEX IF NOT EXISTS idx_application_cv_fit_score ON application_cv_fit (fit_score DESC NULLS LAST);

-- ============================================================================
-- 3. updated_at maintenance (reuses existing set_updated_at() helper)
-- ============================================================================

DROP TRIGGER IF EXISTS trg_cv_assessments_updated ON cv_assessments;
CREATE TRIGGER trg_cv_assessments_updated
  BEFORE UPDATE ON cv_assessments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_application_cv_fit_updated ON application_cv_fit;
CREATE TRIGGER trg_application_cv_fit_updated
  BEFORE UPDATE ON application_cv_fit
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 4. RLS — admin full; candidate reads own assessments; fit is admin-only
-- ============================================================================

ALTER TABLE cv_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_cv_fit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cv_assessments_admin_all ON cv_assessments;
CREATE POLICY cv_assessments_admin_all ON cv_assessments
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS cv_assessments_owner_read ON cv_assessments;
CREATE POLICY cv_assessments_owner_read ON cv_assessments
  FOR SELECT TO authenticated
  USING (candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS application_cv_fit_admin_all ON application_cv_fit;
CREATE POLICY application_cv_fit_admin_all ON application_cv_fit
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
