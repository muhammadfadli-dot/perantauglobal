-- =========================================================================
-- Perantau Global — Initial schema (user-centric, JSONB hybrid)
-- Migration: 0001_initial_schema
-- Created: 2026-04-21
-- =========================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- ENUMS
-- =========================================================================

CREATE TYPE pipeline_stage AS ENUM (
  'applied',
  'screening',
  'voice_screen',
  'interview',
  'document_check',
  'briefing',
  'trial',
  'selected',
  'training',
  'deployed',
  'active',
  'rejected',
  'exit'
);

CREATE TYPE doc_type AS ENUM (
  'ktp',
  'passport',
  'cv',
  'certificate',
  'medical',
  'photo',
  'other'
);

CREATE TYPE user_role AS ENUM (
  'candidate',
  'admin',
  'recruiter'
);

-- =========================================================================
-- POSITIONS (registry — 16 slots, seeded via 0002)
-- =========================================================================

CREATE TABLE positions (
  slug          TEXT PRIMARY KEY,
  role          TEXT NOT NULL,
  country       TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  requirements  JSONB NOT NULL DEFAULT '{}',
  scoring       JSONB NOT NULL DEFAULT '{}',
  pipeline      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_positions_active ON positions(active);
CREATE INDEX idx_positions_country ON positions(country) WHERE active = true;
CREATE INDEX idx_positions_role ON positions(role);

-- =========================================================================
-- CANDIDATES (canonical identity)
-- =========================================================================

CREATE TABLE candidates (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id           UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Core bio (normalized, always queryable)
  full_name              TEXT NOT NULL CHECK (length(full_name) BETWEEN 2 AND 200),
  email                  TEXT UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone                  TEXT UNIQUE CHECK (phone ~ '^\+?[0-9]{8,15}$'),
  city                   TEXT,
  province               TEXT,
  birth_date             DATE CHECK (birth_date > '1950-01-01' AND birth_date < CURRENT_DATE),
  gender                 TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  education              TEXT,

  -- Shared credentials (JLPT, SIM, certs, languages, experience)
  profile_data           JSONB NOT NULL DEFAULT '{}' CHECK (pg_column_size(profile_data) < 50000),
  profile_schema_version TEXT NOT NULL DEFAULT 'v1',

  -- Audit
  source                 TEXT,              -- 'landing', 'referral', 'import', 'manual'
  referrer_url           TEXT,
  utm_source             TEXT,
  utm_campaign           TEXT,

  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- At least one contact required
  CONSTRAINT candidate_has_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE UNIQUE INDEX idx_candidates_email_lower ON candidates (lower(email)) WHERE email IS NOT NULL;
CREATE INDEX idx_candidates_phone ON candidates (phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_candidates_auth_user_id ON candidates (auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX idx_candidates_province ON candidates (province);
CREATE INDEX idx_candidates_created_at ON candidates (created_at DESC);
-- GIN index untuk query credentials (WHERE profile_data @> '{"jlpt":"N4"}')
CREATE INDEX idx_candidates_profile_data_gin ON candidates USING GIN (profile_data);

-- =========================================================================
-- APPLICATIONS (candidate × position, pipeline)
-- =========================================================================

CREATE TABLE applications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id      UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  position_slug     TEXT NOT NULL REFERENCES positions(slug) ON DELETE RESTRICT,

  pipeline_stage    pipeline_stage NOT NULL DEFAULT 'applied',

  -- Apply-time answers (motivation, availability, referral — NOT shared credentials)
  answers           JSONB NOT NULL DEFAULT '{}' CHECK (pg_column_size(answers) < 20000),

  -- Scoring (position-specific, computed at apply or on-demand)
  score             INTEGER,
  score_breakdown   JSONB,

  -- PO workflow
  po_notes          TEXT,
  reviewed_at       TIMESTAMPTZ,
  reviewed_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reached_out       BOOLEAN NOT NULL DEFAULT false,
  reached_out_at    TIMESTAMPTZ,

  -- Rejection / exit tracking
  status            TEXT,
  status_reason     TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent double-apply same candidate × same active position
  CONSTRAINT uniq_candidate_position UNIQUE (candidate_id, position_slug)
);

CREATE INDEX idx_applications_candidate ON applications (candidate_id, created_at DESC);
CREATE INDEX idx_applications_position_stage ON applications (position_slug, pipeline_stage, created_at DESC);
CREATE INDEX idx_applications_stage ON applications (pipeline_stage) WHERE pipeline_stage != 'exit';
CREATE INDEX idx_applications_reached_out ON applications (reached_out, created_at DESC) WHERE reached_out = false;
CREATE INDEX idx_applications_created_at ON applications (created_at DESC);
CREATE INDEX idx_applications_answers_gin ON applications USING GIN (answers);

-- =========================================================================
-- CANDIDATE_DOCUMENTS (file URLs — actual files in Supabase Storage)
-- =========================================================================

CREATE TABLE candidate_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id  UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  doc_type      doc_type NOT NULL,
  file_path     TEXT NOT NULL,       -- Supabase Storage path
  file_size     BIGINT,
  mime_type     TEXT,
  verified      BOOLEAN NOT NULL DEFAULT false,
  verified_at   TIMESTAMPTZ,
  verified_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes         TEXT,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_docs_candidate ON candidate_documents (candidate_id, doc_type);
CREATE INDEX idx_docs_verification_queue ON candidate_documents (verified, uploaded_at) WHERE verified = false;

-- =========================================================================
-- PENDING_SUBMISSIONS (nonce-based staging — email-squat defense)
-- =========================================================================

CREATE TABLE pending_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nonce         TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  email         TEXT NOT NULL,
  phone         TEXT,
  position_slug TEXT NOT NULL REFERENCES positions(slug) ON DELETE CASCADE,
  form_data     JSONB NOT NULL,          -- full form payload, materialized on verify
  consent_ids   UUID[] DEFAULT '{}',     -- pointers to consents recorded at submit time
  ip_address    INET,
  user_agent    TEXT,
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
  consumed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pending_nonce ON pending_submissions (nonce) WHERE consumed_at IS NULL;
CREATE INDEX idx_pending_email ON pending_submissions (email) WHERE consumed_at IS NULL;
CREATE INDEX idx_pending_expires ON pending_submissions (expires_at) WHERE consumed_at IS NULL;

-- =========================================================================
-- CONSENTS (PDP UU 27/2022 — per-purpose logging)
-- =========================================================================

CREATE TABLE consents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id   UUID REFERENCES candidates(id) ON DELETE CASCADE,
  pending_id     UUID REFERENCES pending_submissions(id) ON DELETE SET NULL,
  purpose        TEXT NOT NULL,      -- 'data_processing', 'marketing', 'employer_share', 'bp2mi_submit'
  purpose_text   TEXT NOT NULL,      -- actual consent text shown to user
  version        TEXT NOT NULL,      -- e.g. 'v1.0-2026-04-21'
  granted_at     TIMESTAMPTZ,
  withdrawn_at   TIMESTAMPTZ,
  ip_address     INET,
  user_agent     TEXT,
  CONSTRAINT consent_either_candidate_or_pending CHECK (
    candidate_id IS NOT NULL OR pending_id IS NOT NULL
  )
);

CREATE INDEX idx_consents_candidate ON consents (candidate_id, purpose, granted_at DESC);
CREATE INDEX idx_consents_pending ON consents (pending_id);
CREATE INDEX idx_consents_active ON consents (candidate_id, purpose) WHERE withdrawn_at IS NULL;

-- =========================================================================
-- TRIGGERS
-- =========================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================================
-- RLS: enable + base policies
-- =========================================================================

ALTER TABLE candidates            ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_documents   ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_submissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents              ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- POSITIONS: public read for active, admin write
-- -------------------------------------------------------------------------
CREATE POLICY "positions_anon_read_active"
  ON positions FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "positions_admin_all"
  ON positions FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- -------------------------------------------------------------------------
-- PENDING_SUBMISSIONS: anon can INSERT; edge function (service role) handles verify
-- -------------------------------------------------------------------------
CREATE POLICY "pending_anon_insert"
  ON pending_submissions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "pending_admin_read"
  ON pending_submissions FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- -------------------------------------------------------------------------
-- CONSENTS: anon can INSERT (at submit time); authenticated can read own + admin all
-- -------------------------------------------------------------------------
CREATE POLICY "consents_anon_insert"
  ON consents FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "consents_candidate_read_own"
  ON consents FOR SELECT
  TO authenticated
  USING (
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "consents_candidate_withdraw_own"
  ON consents FOR UPDATE
  TO authenticated
  USING (
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
  );

-- -------------------------------------------------------------------------
-- CANDIDATES: candidate sees own, admin sees all, no anon direct access
-- (candidates created via edge function after magic link verify — service role)
-- -------------------------------------------------------------------------
CREATE POLICY "candidates_self_read"
  ON candidates FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "candidates_self_update"
  ON candidates FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "candidates_admin_all"
  ON candidates FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- -------------------------------------------------------------------------
-- APPLICATIONS: candidate sees/manages own, admin sees all
-- -------------------------------------------------------------------------
CREATE POLICY "applications_self_read"
  ON applications FOR SELECT
  TO authenticated
  USING (
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "applications_self_insert"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "applications_admin_write"
  ON applications FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- -------------------------------------------------------------------------
-- CANDIDATE_DOCUMENTS: candidate manages own, admin all
-- -------------------------------------------------------------------------
CREATE POLICY "docs_self_read"
  ON candidate_documents FOR SELECT
  TO authenticated
  USING (
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "docs_self_insert"
  ON candidate_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "docs_admin_all"
  ON candidate_documents FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- =========================================================================
-- READINESS VIEW (derived, not materialized initially)
-- =========================================================================

-- Simple readiness score: 0-100% based on requirements keys matched
CREATE OR REPLACE FUNCTION compute_readiness(
  profile JSONB,
  requirements JSONB
) RETURNS INTEGER
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  total_reqs INTEGER := 0;
  met_reqs INTEGER := 0;
  req_key TEXT;
  req_value JSONB;
BEGIN
  IF requirements IS NULL OR requirements = '{}'::jsonb THEN
    RETURN 100;
  END IF;

  FOR req_key IN SELECT jsonb_object_keys(requirements) LOOP
    total_reqs := total_reqs + 1;
    req_value := requirements->req_key;

    -- Simple presence check; app layer handles complex rules via Zod
    IF profile ? req_key AND profile->req_key IS NOT NULL THEN
      met_reqs := met_reqs + 1;
    END IF;
  END LOOP;

  IF total_reqs = 0 THEN
    RETURN 100;
  END IF;

  RETURN (met_reqs * 100) / total_reqs;
END;
$$;

CREATE OR REPLACE VIEW readiness_view AS
SELECT
  c.id AS candidate_id,
  p.slug AS position_slug,
  p.name AS position_name,
  p.country,
  compute_readiness(c.profile_data, p.requirements) AS completion_pct
FROM candidates c
CROSS JOIN positions p
WHERE p.active = true;

-- Note: if this view gets slow at scale, materialize it with
-- REFRESH on candidate profile_data UPDATE trigger.

-- =========================================================================
-- AUTH TRIGGER: link auth.users to candidates by email on first sign-in
-- (service role function — runs on auth.users INSERT/UPDATE)
-- =========================================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Link existing candidate by email if present
  UPDATE candidates
  SET auth_user_id = NEW.id
  WHERE lower(email) = lower(NEW.email)
    AND auth_user_id IS NULL;

  RETURN NEW;
END;
$$;

-- Note: This trigger runs AFTER pending_submissions has been consumed + candidates row created
-- by the edge function (which is triggered by the magic link click).
-- The trigger is a safety net for cases where the edge function already linked, or imports.
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- =========================================================================
-- DONE — migration 0001
-- =========================================================================
