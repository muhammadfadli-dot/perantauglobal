-- =========================================================================
-- MIGRATION 0013: materialize skeleton candidate when no pending_submission
-- =========================================================================
-- Why:
--   PR #11 introduced direct email+password signup (apps/platform /auth/sign-up).
--   That flow does NOT go through the legacy "fill marketing form → magic link"
--   path, so `pending_submissions` stays empty for these users. The trigger
--   body (last rewritten in 0006) then falls through the `v_latest_form IS NULL`
--   branch and returns without creating a candidate row when no pre-existing
--   candidate matches the email.
--
--   Result: authenticated user with no `candidates` row. Protected pages
--   (/explore, /applications, /profile) used to silently redirect home
--   (dead-end redirect anti-pattern). That's now fixed at the edge via
--   `requireCandidate()` in apps/platform/src/lib/supabase-server.ts, but the
--   trigger should still be the canonical source — avoids race + keeps the DB
--   invariant "every verified auth user has a candidate row".
--
-- Fix:
--   When there's no pending_submission AND no pre-existing candidate to link
--   by email, INSERT a skeleton candidate with:
--     - full_name   = split_part(email, '@', 1) (2-200 chars, required)
--     - source      = 'direct_signup'
--     - profile_data in v2 shape (schema_version + credentials + onboarding)
--
--   This mirrors what requireCandidate() does at the edge.
--
-- Function body fully replaces the 0006 version (only the "no pending" branch
-- and the "no candidate + no pending" insert differ — documented inline).
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
  v_placeholder  TEXT;
BEGIN
  SELECT form_data INTO v_latest_form
  FROM pending_submissions
  WHERE lower(email) = lower(NEW.email)
    AND consumed_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_latest_form IS NULL THEN
    -- No pending submission. Try to link an existing backfilled candidate by email.
    UPDATE candidates
    SET auth_user_id = NEW.id, updated_at = NOW()
    WHERE lower(email) = lower(NEW.email)
      AND auth_user_id IS NULL
    RETURNING id INTO v_candidate_id;

    IF v_candidate_id IS NOT NULL THEN
      RETURN NEW;
    END IF;

    -- Direct email+password signup path: no pending, no existing candidate.
    -- Materialize a skeleton so the invariant "verified auth user = candidate row"
    -- always holds. User will flesh out full_name etc. via /profile.
    v_placeholder := COALESCE(NULLIF(split_part(NEW.email, '@', 1), ''), 'Kandidat baru');
    IF length(v_placeholder) < 2 THEN
      v_placeholder := 'Kandidat baru';
    ELSIF length(v_placeholder) > 200 THEN
      v_placeholder := substring(v_placeholder from 1 for 200);
    END IF;

    INSERT INTO candidates (auth_user_id, email, full_name, profile_data, source)
    VALUES (
      NEW.id,
      lower(NEW.email),
      v_placeholder,
      jsonb_build_object(
        'schema_version', 1,
        'credentials', '{}'::jsonb,
        'onboarding', '{}'::jsonb
      ),
      'direct_signup'
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
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
      profile_data = jsonb_build_object(
        'schema_version', 1,
        'credentials', COALESCE(profile_data->'credentials', '{}'::jsonb) || v_role_data,
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
