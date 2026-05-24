-- =========================================================================
-- MIGRATION 0034: handle_new_auth_user — stop writing profile_data.credentials
-- =========================================================================
-- Per Fase 5 of the position-model rework: each application is self-contained
-- (per-apply answers in applications.answers JSONB). No cross-application
-- bleed via candidates.profile_data.credentials.
--
-- This migration drops the trigger's two credentials-merge paths:
--   1. Initial UPSERT candidate from first pending → no more merging
--      v_role_data into credentials key
--   2. Inside the per-pending loop → drop the UPDATE candidates SET
--      profile_data.credentials = ...
--
-- All other trigger logic stays: name/phone/city/etc. mapping from form,
-- applications insert with answers = pending.form_data.role_data, consents
-- linking, pending consumed_at marking.
--
-- The credentials key remains on profile_data as an empty object — old
-- readers (legacy readiness path) won't crash, they'll just see no data.
-- Full sunset of credentials happens in Fase 5D migration along with
-- positions.requirements drop.
-- =========================================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_candidate_id UUID;
  v_pending      RECORD;
  v_latest_form  JSONB;
  v_existing     UUID;
  v_meta_name    TEXT;
  v_meta_source  TEXT;
  v_fallback     TEXT;
BEGIN
  SELECT form_data INTO v_latest_form
  FROM pending_submissions
  WHERE lower(email) = lower(NEW.email)
    AND consumed_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  -- Case 1: No pending — direct signup (no form). Link existing candidate
  -- by email if present; else create minimal stub. profile_data stays
  -- empty (no credentials, no onboarding writes).
  IF v_latest_form IS NULL THEN
    UPDATE candidates
    SET auth_user_id = NEW.id, updated_at = NOW()
    WHERE lower(email) = lower(NEW.email)
      AND auth_user_id IS NULL
    RETURNING id INTO v_candidate_id;

    IF v_candidate_id IS NOT NULL THEN
      RETURN NEW;
    END IF;

    v_meta_name   := NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), '');
    v_meta_source := NULLIF(NEW.raw_user_meta_data->>'source', '');

    IF v_meta_name IS NULL THEN
      v_fallback := COALESCE(NULLIF(split_part(NEW.email, '@', 1), ''), 'Kandidat baru');
      IF length(v_fallback) < 2 THEN
        v_fallback := 'Kandidat baru';
      ELSIF length(v_fallback) > 200 THEN
        v_fallback := substring(v_fallback from 1 for 200);
      END IF;
      v_meta_name := v_fallback;
    ELSIF length(v_meta_name) > 200 THEN
      v_meta_name := substring(v_meta_name from 1 for 200);
    END IF;

    INSERT INTO candidates (auth_user_id, email, full_name, profile_data, source)
    VALUES (
      NEW.id,
      lower(NEW.email),
      v_meta_name,
      jsonb_build_object(
        'schema_version', 2,
        'onboarding', '{}'::jsonb
      ),
      COALESCE(v_meta_source, 'direct_signup')
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
    RETURN NEW;
  END IF;

  -- Case 2: Form-apply pending exists. Upsert candidate without merging
  -- form_data.role_data into profile_data.credentials. role_data lands in
  -- applications.answers per pending (Fase 5 model).
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
      profile_data = jsonb_build_object(
        'schema_version', 2,
        'onboarding', COALESCE(profile_data->'onboarding', '{}'::jsonb)
      ),
      updated_at = NOW()
    WHERE id = v_existing;
    v_candidate_id := v_existing;
  ELSE
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
        'schema_version', 2,
        'onboarding', '{}'::jsonb
      ),
      'form_apply',
      v_latest_form->>'utm_source',
      v_latest_form->>'utm_campaign',
      v_latest_form->>'source_url'
    )
    RETURNING id INTO v_candidate_id;
  END IF;

  -- Materialize one application per pending (role_data → answers).
  -- No credentials merge on the candidate row (Fase 5).
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
      COALESCE(v_pending.form_data->'role_data', '{}'::jsonb),
      'applied'
    )
    ON CONFLICT (candidate_id, position_slug) DO NOTHING;

    UPDATE consents
    SET candidate_id = v_candidate_id
    WHERE pending_id = v_pending.id
      AND candidate_id IS NULL;

    UPDATE pending_submissions
    SET consumed_at = NOW()
    WHERE id = v_pending.id;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Update profile_schema_version default for new candidates inserted via this
-- trigger to v2 (no credentials). Existing rows untouched.
ALTER TABLE candidates ALTER COLUMN profile_schema_version SET DEFAULT 'v2';
