-- =========================================================================
-- MIGRATION 0035: drop position_form_fields table
-- =========================================================================
-- Final Fase 5 step. position_application_fields has been the canonical
-- source since Fase 1; Fase 3 flipped apps/web apply form to read it;
-- Fase 5A flipped admin candidates/[id] + candidate /applications/new
-- to read it too. No app code reads position_form_fields anymore.
--
-- CASCADE drops the RLS policies + updated_at trigger + indexes attached.
-- 51 rows of data are lost — they were already mirrored to
-- position_application_fields by the Fase 1 backfill (88 PAF rows from
-- 51 legacy form_fields + ~37 positions.requirements expansions).
--
-- positions.requirements column + compute_readiness_v3 SQL function are
-- NOT dropped in this migration — admin/candidates/[id] still calls
-- getReadinessV3 via RPC. Fase 6 cleanup will drop those.
-- =========================================================================

DROP TABLE IF EXISTS position_form_fields CASCADE;
