-- ============================================================================
-- Migration 0016 — Seed DTG team into admin_users allowlist
-- ============================================================================
-- Adds the core DTG/Dayadimensi team so that signing in via the platform
-- routes them straight to /admin (see apps/platform/src/app/page.tsx).
-- ============================================================================

INSERT INTO admin_users (email, added_by, notes) VALUES
  ('martin.william@dayalima.id',     'migration 0016', 'DTG team'),
  ('aseel.faez@dayalima.id',         'migration 0016', 'DTG team'),
  ('siti.lathifah@dayalima.id',      'migration 0016', 'DTG team'),
  ('ramadhan.salim@dayadimensi.id',  'migration 0016', 'DTG team'),
  ('nadiawan.hizbullah@dayalima.id', 'migration 0016', 'DTG team'),
  ('indria.dwiyana@dayalima.id',     'migration 0016', 'DTG team'),
  ('zalfa.salsabilla@dayalima.id',   'migration 0016', 'DTG team'),
  ('ai.lestari@dayalima.id',         'migration 0016', 'DTG team'),
  ('deru.albar@dayalima.id',         'migration 0016', 'DTG team')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- DONE — migration 0016
-- ============================================================================
