-- =========================================================================
-- MIGRATION 0006: update handle_new_auth_user to write profile_data v2 shape
-- =========================================================================
-- Post-0005, candidates.profile_data has the nested structure:
--   { schema_version: 1, credentials: {...}, onboarding?: {...} }
--
-- The trigger in 0003 wrote role_data flat at the root via `||`, which:
--   (a) breaks for backfilled/migrated candidates (adds keys at root next
--       to `credentials` rather than merging into it)
--   (b) produces v1-shaped profile_data for brand-new candidates (no
--       schema_version + credentials wrapper)
--
-- The candidate portal (/profile ProfileForm) reads `profile_data.credentials`,
-- so legacy-form submissions post-0005 would show blank profile unless this
-- is fixed.
--
-- This migration rewrites the function body to always write under
-- `credentials`, preserving schema_version + onboarding.
-- =========================================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_candidate_id UUID;
  v_pending      RECORD;
  v_latest_form  JSONB;
  v_existing     UUID;
  v_role_data    JSONB;
BEGIN
  SELECT form_data INTO v_latest_form
  FROM pending_submissions
  WHERE lower(email) = lower(NEW.email)
    AND consumed_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_latest_form IS NULL THEN
    -- No pending — legacy link path: candidate was pre-created (backfill).
    UPDATE candidates
    SET auth_user_id = NEW.id, updated_at = NOW()
    WHERE lower(email) = lower(NEW.email)
      AND auth_user_id IS NULL;
    RETURN NEW;
  END IF;

  v_role_data := COALESCE(v_latest_form->'role_data', '{}'::jsonb);

  -- Existing candidate (by email): merge additively, link auth_user_id.
  SELECT id INTO v_existing
  FROM candidates
  WHERE lower(email) = lower(NEW.email)
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    UPDATE candidates
    SET
      auth_user_id = COALESCE(auth_user_id, NEW.id),
      full_name    = COALESCE(full_name, v_latest_form->>'full_name'),
      phone        = COALESCE(phone, v_latest_form->>'whatsapp', v_latest_form->>'phone'),
      city         = COALESCE(city, v_latest_form->>'city'),
      gender       = COALESCE(gender, v_latest_form->>'gender'),
      education    = COALESCE(education, v_latest_form->>'education'),
      -- v2: ensure schema_version + credentials wrapper; merge role_data INTO credentials.
      profile_data = jsonb_build_object(
        'schema_version', 1,
        'credentials', COALESCE(profile_data->'credentials', '{}'::jsonb) || v_role_data,
        'onboarding', COALESCE(profile_data->'onboarding', '{}'::jsonb)
      ),
      updated_at = NOW()
    WHERE id = v_existing;
    v_candidate_id := v_existing;
  ELSE
    -- New candidate: insert with v2-shaped profile_data from the start.
    INSERT INTO candidates (
      auth_user_id, email, full_name, phone, city, birth_date, gender,
      education, profile_data, source, utm_source, utm_campaign, referrer_url
    ) VALUES (
      NEW.id,
      lower(NEW.email),
      COALESCE(v_latest_form->>'full_name', 'Unknown'),
      COALESCE(v_latest_form->>'whatsapp', v_latest_form->>'phone'),
      v_latest_form->>'city',
      CASE
        WHEN v_latest_form->>'birth_date' IS NOT NULL
          AND v_latest_form->>'birth_date' <> ''
        THEN (v_latest_form->>'birth_date')::DATE
        ELSE NULL
      END,
      v_latest_form->>'gender',
      v_latest_form->>'education',
      jsonb_build_object(
        'schema_version', 1,
        'credentials', v_role_data,
        'onboarding', '{}'::jsonb
      ),
      'magic_link',
      v_latest_form->>'utm_source',
      v_latest_form->>'utm_campaign',
      v_latest_form->>'source_url'
    )
    RETURNING id INTO v_candidate_id;
  END IF;

  -- Per-pending: create application + link consents + merge role_data into credentials.
  FOR v_pending IN
    SELECT id, position_slug, form_data
    FROM pending_submissions
    WHERE lower(email) = lower(NEW.email)
      AND consumed_at IS NULL
    ORDER BY created_at ASC
  LOOP
    INSERT INTO applications (
      candidate_id, position_slug, answers, pipeline_stage
    ) VALUES (
      v_candidate_id,
      v_pending.position_slug,
      -- For now, role_data flows into answers too (legacy form behaviour).
      -- Phase C will strip the form to bio-only, then answers becomes {}.
      COALESCE(v_pending.form_data->'role_data', '{}'::jsonb),
      'applied'
    )
    ON CONFLICT (candidate_id, position_slug) DO NOTHING;

    UPDATE consents
    SET candidate_id = v_candidate_id
    WHERE pending_id = v_pending.id
      AND candidate_id IS NULL;

    UPDATE candidates
    SET
      profile_data = jsonb_set(
        profile_data,
        '{credentials}',
        COALESCE(profile_data->'credentials', '{}'::jsonb) ||
          COALESCE(v_pending.form_data->'role_data', '{}'::jsonb)
      ),
      updated_at = NOW()
    WHERE id = v_candidate_id;

    UPDATE pending_submissions
    SET consumed_at = NOW()
    WHERE id = v_pending.id;
  END LOOP;

  RETURN NEW;
END;
$$;
