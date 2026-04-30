-- =========================================================================
-- MIGRATION 0023: backfill candidate_documents.doc_type 'photo' → 'formal_photo'
-- =========================================================================
-- Migration 0021 introduced curated doc_type enum values, including
-- 'formal_photo' as the canonical value for ID-style portrait photos.
-- Legacy rows from Phase 2 still use 'photo'.
--
-- Apps already back-compat both values at the read layer (profile page +
-- DocUploader.tsx). But compute_readiness_v3 does an exact doc_type match
-- against requirements.document_type — so a position that requires
-- 'formal_photo' won't match a candidate's 'photo' upload.
--
-- One-shot rewrite. Idempotent.
-- =========================================================================

UPDATE candidate_documents
SET doc_type = 'formal_photo'
WHERE doc_type = 'photo';

-- =========================================================================
-- DONE — migration 0023
-- =========================================================================
