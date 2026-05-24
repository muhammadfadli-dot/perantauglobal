-- =========================================================================
-- MIGRATION 0036: drop application_tiers table
-- =========================================================================
-- Fase 6A: tier feature sunset. application_tiers table had 0 rows in prod
-- (TierPicker UI was removed in Phase 4 talent-pool restructure; no code
-- has been writing to it since). All readers (admin candidates/[id],
-- job-orders/[id], kanban, analytics) updated in this same PR to drop the
-- tier display.
--
-- CASCADE drops the FK + RLS policies + indexes attached.
-- =========================================================================

DROP TABLE IF EXISTS application_tiers CASCADE;
DROP TYPE IF EXISTS tier_label CASCADE;
