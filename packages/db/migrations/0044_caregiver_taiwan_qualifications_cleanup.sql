-- Migration 0044: caregiver-taiwan qualification field cleanup
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-27.
--
-- Cleans up a leftover duplicate qualification field on the caregiver-taiwan
-- position and reorders the questions so the cheapest binary filter
-- (physical requirements) runs first.
--
-- Before:
--   sort 1    exp_caregiving       (required radio, 4-tier experience buckets)
--   sort 2    physical_meets_min   (required radio, binary 155cm+/55kg+)
--   sort 3    mandarin_self        (optional radio)
--   sort 1001 care_certification   (optional text, screening stage)
--   sort 1002 experience_years     (required radio, DUPLICATE of #1) ← drop
--
-- After:
--   sort 1    physical_meets_min   (binary disqualifier first — cheapest filter)
--   sort 2    exp_caregiving       (experience tier — recruiter signal)
--   sort 3    mandarin_self        (optional)
--   sort 1001 care_certification   (optional, screening stage)

delete from position_application_fields
  where position_slug = 'caregiver-taiwan'
    and sort_order   = 1002
    and field_key    = 'experience_years';

update position_application_fields set sort_order = 1
  where position_slug = 'caregiver-taiwan' and field_key = 'physical_meets_min';

update position_application_fields set sort_order = 2
  where position_slug = 'caregiver-taiwan' and field_key = 'exp_caregiving';

update position_application_fields set sort_order = 3
  where position_slug = 'caregiver-taiwan' and field_key = 'mandarin_self';
