-- =========================================================================
-- MIGRATION 0015: unified password-first auth — trigger reads metadata fallback
-- =========================================================================
-- Why:
--   As of this migration the platform has standardized on a single auth
--   mechanism: email + password. Magic-link sign-in, cross-subdomain implicit
--   flow, and the "shadow signInWithOtp" from apps/web form are retired.
--
--   New reality (one of two paths, both converge at email verification):
--     A. Form apply (apps/web): user fills data + picks password →
--        server creates pending_submission, then signUp(email, password)
--        → Supabase sends verification email. On click, email_confirmed_at
--        moves NULL→NOT NULL, trigger fires, pending is materialized into
--        candidates + applications. User then logs in at apps/platform with
--        password.
--     B. Direct sign-up (apps/platform /auth/sign-up): user gives
--        full_name + email + password → signUp with
--        options.data = { full_name } → Supabase sends verification email
--        → trigger fires on confirm → materializes candidate from
--        raw_user_meta_data.full_name (no pending_submission exists).
--
--   Before 0015 the "no pending" branch fell back to `split_part(email, '@', 1)`
--   as the candidate's full_name — always a garbage placeholder. Now we prefer
--   the real name captured at sign-up (raw_user_meta_data -> 'full_name'),
--   falling back to the email prefix only when neither is available.
--
-- Behavior changes vs 0013:
--   - "No pending" branch: read full_name from raw_user_meta_data first.
--     Email-prefix fallback is kept as the last resort.
--   - `source` in the "no pending" branch is lifted from
--     raw_user_meta_data->>'source' when present (e.g. 'direct_signup')
--     so the trigger path and requireCandidate() label rows consistently.
--
-- Unchanged vs 0013:
--   - Trigger timing: still AFTER UPDATE OF email_confirmed_at (NULL→NOT NULL).
--   - The "pending_submissions present" branches (existing, new).
--   - profile_data v2 shape (schema_version / credentials / onboarding).
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

  IF v_latest_form IS NULL THEN
    -- No pending submission. Try linking a backfilled candidate row by email.
    UPDATE candidates
    SET auth_user_id = NEW.id, updated_at = NOW()
    WHERE lower(email) = lower(NEW.email)
      AND auth_user_id IS NULL
    RETURNING id INTO v_candidate_id;

    IF v_candidate_id IS NOT NULL THEN
      RETURN NEW;
    END IF;

    -- Direct password signup path: materialize from auth.users.raw_user_meta_data.
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
        'schema_version', 1,
        'credentials', '{}'::jsonb,
        'onboarding', '{}'::jsonb
      ),
      COALESCE(v_meta_source, 'direct_signup')
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
      'form_apply',
      v_latest_form->>'utm_source',
      v_latest_form->>'utm_campaign',
      v_latest_form->>'source_url'
    )
    RETURNING id INTO v_candidate_id;
  END IF;

  -- Per-pending: create application + link consents + merge role_data.
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
