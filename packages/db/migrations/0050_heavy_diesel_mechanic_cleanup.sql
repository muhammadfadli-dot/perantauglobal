-- Migration 0050: heavy-diesel-mechanic-saudi-arabia qualification cleanup
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-27.
--
-- Content for this position is already aligned with the poster
-- (PG_SA_heavy-diesel-mechanic-saudi-arabia_260409.png). The only fix
-- needed is dropping two duplicate qualification fields that survived
-- the legacy migration:
--   - sort 1002 `english_level`     duplicates `english_self` at sort 2
--   - sort 1003 `experience_years`  duplicates `exp_heavy_diesel` at sort 1
--
-- Final flow:
--   sort 1  exp_heavy_diesel  required radio  Pengalaman mechanic
--   sort 2  english_self      required radio  Bahasa Inggris
--   sort 3  cat_engine_exp    optional radio  Pengalaman engine CAT
--
-- Note: poster printed URL `/lowongan/diesel-mechanic-saudi-arabia` but
-- the actual slug is `heavy-diesel-mechanic-saudi-arabia`. A redirect is
-- added in apps/web/next.config.ts in this same PR so the printed URL
-- still resolves.

DELETE FROM position_application_fields
  WHERE position_slug = 'heavy-diesel-mechanic-saudi-arabia'
    AND sort_order IN (1002, 1003)
    AND field_key IN ('english_level', 'experience_years');
