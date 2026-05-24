-- =========================================================================
-- MIGRATION 0033: candidate_documents.application_id (per-app supporting docs)
-- =========================================================================
-- Splits candidate_documents into two categories:
--   - application_id IS NULL → identity doc owned by candidate (KTP, paspor,
--     formal_photo). Shared across all applications.
--   - application_id IS NOT NULL → per-application supporting doc (cert
--     uploads, surat rekomendasi, etc.). Tied to a specific apply.
--
-- All existing rows have application_id = NULL after this migration. The
-- distinction starts mattering when Fase 3 wires the candidate apply flow
-- to upload supporting docs scoped to an application.
-- =========================================================================

ALTER TABLE candidate_documents
  ADD COLUMN application_id UUID NULL REFERENCES applications(id) ON DELETE CASCADE;

CREATE INDEX idx_docs_application
  ON candidate_documents (application_id)
  WHERE application_id IS NOT NULL;

COMMENT ON COLUMN candidate_documents.application_id IS
  'NULL = identity doc owned by candidate (KTP, paspor, formal_photo) — shared. NOT NULL = per-application supporting doc — scoped to one apply.';

-- =========================================================================
-- DONE — migration 0033
-- =========================================================================
