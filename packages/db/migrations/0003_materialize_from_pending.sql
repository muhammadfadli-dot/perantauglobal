-- ============================================================================
-- Migration 0003 — Materialize candidates + applications from pending_submissions
-- ============================================================================
-- Replaces the stub `handle_new_auth_user()` from 0001. Fires on auth.users
-- AFTER INSERT (magic-link first click). Materializes a full candidate +
-- application record from the matching `pending_submissions` rows.
--
-- Flow:
--   1. Candidate submits form → /api/lowongan/[slug] →
--      pending_submissions row inserted + consents logged
--   2. /api/apply or form handler also calls supabase.auth.signInWithOtp(email)
--   3. Email with magic link sent
--   4. Candidate clicks link → Supabase creates auth.users row
--   5. THIS TRIGGER fires:
--        a. Find all unconsumed pending_submissions for this email
--        b. Materialize canonical `candidates` row from latest pending
--        c. Insert `applications` row per pending (UNIQUE candidate_id+position_slug)
--        d. Link orphan `consents.pending_id` → candidates
--        e. Mark each pending.consumed_at = NOW()
--   6. Legacy safety net: if no pending found but a candidate already exists
--      for this email (e.g. imported from gt-tools), link auth_user_id.
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_candidate_id UUID;
  v_pending      RECORD;
  v_latest_form  JSONB;
  v_existing     UUID;
BEGIN
  -- Fetch the most recent unconsumed pending submission for this email.
  -- Used to populate candidate bio (name, city, education, etc.).
  SELECT form_data INTO v_latest_form
  FROM pending_submissions
  WHERE lower(email) = lower(NEW.email)
    AND consumed_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_latest_form IS NULL THEN
    -- No pending submission — legacy link path (existing candidate by email).
    UPDATE candidates
    SET auth_user_id = NEW.id,
        updated_at   = NOW()
    WHERE lower(email) = lower(NEW.email)
      AND auth_user_id IS NULL;
    RETURN NEW;
  END IF;

  -- Check if candidate already exists for this email (e.g. re-verify / legacy import).
  SELECT id INTO v_existing
  FROM candidates
  WHERE lower(email) = lower(NEW.email)
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    -- Existing candidate: merge new data additively and link auth_user_id.
    UPDATE candidates
    SET auth_user_id = COALESCE(auth_user_id, NEW.id),
        full_name    = COALESCE(full_name, v_latest_form->>'full_name'),
        phone        = COALESCE(phone, v_latest_form->>'whatsapp', v_latest_form->>'phone'),
        city         = COALESCE(city, v_latest_form->>'city'),
        gender       = COALESCE(gender, v_latest_form->>'gender'),
        education    = COALESCE(education, v_latest_form->>'education'),
        profile_data = profile_data || COALESCE(v_latest_form->'role_data', '{}'::jsonb),
        updated_at   = NOW()
    WHERE id = v_existing;
    v_candidate_id := v_existing;
  ELSE
    -- New candidate — fresh insert.
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
      COALESCE(v_latest_form->'role_data', '{}'::jsonb),
      'magic_link',
      v_latest_form->>'utm_source',
      v_latest_form->>'utm_campaign',
      v_latest_form->>'source_url'
    )
    RETURNING id INTO v_candidate_id;
  END IF;

  -- For each pending submission for this email, create an application.
  -- UNIQUE constraint on (candidate_id, position_slug) dedupes duplicates.
  FOR v_pending IN
    SELECT id, position_slug, form_data
    FROM pending_submissions
    WHERE lower(email) = lower(NEW.email)
      AND consumed_at IS NULL
    ORDER BY created_at ASC
  LOOP
    INSERT INTO applications (
      candidate_id,
      position_slug,
      answers,
      pipeline_stage
    ) VALUES (
      v_candidate_id,
      v_pending.position_slug,
      COALESCE(v_pending.form_data->'role_data', '{}'::jsonb),
      'applied'
    )
    ON CONFLICT (candidate_id, position_slug) DO NOTHING;

    -- Link orphan consents from this pending to the candidate
    UPDATE consents
    SET candidate_id = v_candidate_id
    WHERE pending_id = v_pending.id
      AND candidate_id IS NULL;

    -- Also merge the pending's role_data into candidate profile_data
    -- (additive — later applications may have different role-specific keys).
    UPDATE candidates
    SET profile_data = profile_data || COALESCE(v_pending.form_data->'role_data', '{}'::jsonb),
        updated_at   = NOW()
    WHERE id = v_candidate_id;

    -- Mark consumed
    UPDATE pending_submissions
    SET consumed_at = NOW()
    WHERE id = v_pending.id;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Trigger already exists from 0001 (trg_on_auth_user_created). CREATE OR
-- REPLACE FUNCTION above updates its body in place — no need to re-create
-- the trigger.

-- ============================================================================
-- DONE — migration 0003
-- ============================================================================
