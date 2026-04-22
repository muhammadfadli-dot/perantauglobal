-- =========================================================================
-- MIGRATION 0005: requirements v2 (hard/soft) + readiness function rewrite
-- =========================================================================
-- Transforms positions.requirements from v1 flat {required:true, label}
-- to v2 typed {type:"hard"|"soft", label, allowed_values?}.
-- Rewrites compute_readiness() to return JSONB breakdown.
-- Backfills candidates.profile_data with schema_version=1 and nests
-- existing flat fields under `credentials`.
--
-- Hand-tuned hard/soft per position (locked 2026-04-22, talent-pool MVP
-- intuition; detailed tuning after program PIC sessions).
-- =========================================================================

-- Step 1: Drop readiness_view first (depends on compute_readiness)
DROP VIEW IF EXISTS readiness_view;
DROP FUNCTION IF EXISTS compute_readiness(JSONB, JSONB);

-- Step 2: New compute_readiness returning JSONB breakdown
CREATE OR REPLACE FUNCTION compute_readiness(
  profile JSONB,
  requirements JSONB
) RETURNS JSONB
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  per_field JSONB := '{}'::jsonb;
  req_key TEXT;
  req_value JSONB;
  req_type TEXT;
  req_allowed JSONB;
  passed BOOLEAN;
  total_count INT := 0;
  passed_count INT := 0;
  hard_pass BOOLEAN := TRUE;
  score_pct INT := 100;
  profile_creds JSONB;
  profile_value JSONB;
BEGIN
  IF requirements IS NULL OR requirements = '{}'::jsonb THEN
    RETURN jsonb_build_object(
      'per_field', '{}'::jsonb,
      'hard_pass', true,
      'score_pct', 100
    );
  END IF;

  -- profile_data v1 (pre-0005): flat — keys at root
  -- profile_data v2 (0005+): nested — keys under `credentials`
  -- Function handles both; prefer `credentials` if present
  profile_creds := COALESCE(profile -> 'credentials', profile, '{}'::jsonb);

  FOR req_key IN SELECT jsonb_object_keys(requirements) LOOP
    req_value := requirements -> req_key;
    req_type := COALESCE(req_value ->> 'type', 'hard');
    req_allowed := req_value -> 'allowed_values';
    profile_value := profile_creds -> req_key;
    total_count := total_count + 1;

    IF req_allowed IS NOT NULL AND jsonb_typeof(req_allowed) = 'array' THEN
      -- Check if profile value is in allowed_values list
      passed := profile_value IS NOT NULL
                AND jsonb_typeof(profile_value) != 'null'
                AND req_allowed @> to_jsonb(profile_creds ->> req_key);
    ELSE
      -- Presence check: any non-null value passes
      passed := profile_value IS NOT NULL
                AND jsonb_typeof(profile_value) != 'null'
                AND (jsonb_typeof(profile_value) != 'string' OR profile_creds ->> req_key != '');
    END IF;

    IF passed THEN
      passed_count := passed_count + 1;
    ELSIF req_type = 'hard' THEN
      hard_pass := FALSE;
    END IF;

    per_field := per_field || jsonb_build_object(
      req_key,
      jsonb_build_object(
        'passed', passed,
        'type', req_type,
        'label', COALESCE(req_value ->> 'label', req_key)
      )
    );
  END LOOP;

  IF total_count > 0 THEN
    score_pct := (passed_count * 100) / total_count;
  END IF;

  RETURN jsonb_build_object(
    'per_field', per_field,
    'hard_pass', hard_pass,
    'score_pct', score_pct
  );
END;
$$;

-- Step 3: Recreate readiness_view with new signature
CREATE OR REPLACE VIEW readiness_view AS
SELECT
  c.id AS candidate_id,
  p.slug AS position_slug,
  p.name AS position_name,
  p.country,
  compute_readiness(c.profile_data, p.requirements) AS readiness,
  (compute_readiness(c.profile_data, p.requirements) ->> 'score_pct')::int AS completion_pct,
  ((compute_readiness(c.profile_data, p.requirements) ->> 'hard_pass')::boolean) AS hard_pass
FROM candidates c
CROSS JOIN positions p
WHERE p.active = true;

-- Step 4: Hand-tuned requirements v2 per position
-- Locked 2026-04-22 via /plan-eng-review. Intuition-based MVP defaults;
-- detailed tuning deferred to program PIC sessions.

UPDATE positions SET requirements = jsonb_build_object(
  'sim_type', jsonb_build_object(
    'type', 'hard',
    'label', 'Jenis SIM',
    'allowed_values', jsonb_build_array('sim_b1', 'sim_b2', 'sim_internasional')
  ),
  'driving_years', jsonb_build_object('type', 'soft', 'label', 'Pengalaman mengemudi'),
  'jlpt_level', jsonb_build_object('type', 'soft', 'label', 'Level JLPT')
) WHERE slug = 'truck-driver-jepang';

UPDATE positions SET requirements = jsonb_build_object(
  'jlpt_level', jsonb_build_object(
    'type', 'hard',
    'label', 'Level JLPT',
    'allowed_values', jsonb_build_array('n4', 'n3', 'n2')
  ),
  'care_certification', jsonb_build_object('type', 'soft', 'label', 'Sertifikasi perawatan'),
  'experience_years', jsonb_build_object('type', 'soft', 'label', 'Pengalaman kerja')
) WHERE slug = 'kaigo-jepang';

UPDATE positions SET requirements = jsonb_build_object(
  'jlpt_level', jsonb_build_object(
    'type', 'hard',
    'label', 'Level JLPT',
    'allowed_values', jsonb_build_array('n4', 'n3', 'n2')
  ),
  'food_certification', jsonb_build_object('type', 'soft', 'label', 'Sertifikasi food service'),
  'experience_type', jsonb_build_object('type', 'soft', 'label', 'Jenis pengalaman kerja')
) WHERE slug = 'food-service-jepang';

UPDATE positions SET requirements = jsonb_build_object(
  'str_active', jsonb_build_object(
    'type', 'hard',
    'label', 'STR aktif',
    'allowed_values', jsonb_build_array('yes', 'inProgress')
  ),
  'experience_years', jsonb_build_object('type', 'soft', 'label', 'Pengalaman kerja'),
  'english_level', jsonb_build_object('type', 'soft', 'label', 'Bahasa Inggris')
) WHERE slug = 'perawat-saudi-arabia';

UPDATE positions SET requirements = jsonb_build_object(
  'experience_type', jsonb_build_object('type', 'soft', 'label', 'Jenis pengalaman kerja'),
  'english_level', jsonb_build_object('type', 'soft', 'label', 'Bahasa Inggris')
) WHERE slug = 'barista-saudi-arabia';

UPDATE positions SET requirements = jsonb_build_object(
  'experience_type', jsonb_build_object('type', 'soft', 'label', 'Jenis pengalaman kerja'),
  'english_level', jsonb_build_object('type', 'soft', 'label', 'Bahasa Inggris')
) WHERE slug = 'waiter-saudi-arabia';

UPDATE positions SET requirements = jsonb_build_object(
  'current_status', jsonb_build_object('type', 'soft', 'label', 'Status saat ini'),
  'interested_country', jsonb_build_object('type', 'soft', 'label', 'Negara tujuan minat')
) WHERE slug = 'global-talent-hub';

-- Step 5: Migrate existing candidates.profile_data to v2 structure
-- v1: flat fields at root (e.g., {sim_type: "sim_b1", jlpt_level: "n4"})
-- v2: { schema_version: 1, credentials: {...}, onboarding?: {...} }
UPDATE candidates
SET profile_data = jsonb_build_object(
  'schema_version', 1,
  'credentials', COALESCE(profile_data, '{}'::jsonb) - 'schema_version' - 'onboarding'
)
WHERE profile_data IS NOT NULL
  AND NOT (profile_data ? 'schema_version');

-- Candidates with NULL profile_data: leave NULL. First save from portal
-- will write new v2 structure directly.
