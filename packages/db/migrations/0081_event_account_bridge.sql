-- 0081_event_account_bridge.sql
--
-- Bridge: turn an event registrant into an app talent-pool candidate, reusing the
-- existing magic-link (signUp + email-confirm) materialization. Mirrors how 0060
-- added intent='academy'. An 'event' pending links the event_registration to the
-- candidate (no application, no enrollment) on email confirmation.
--
-- Additive. The handle_new_auth_user CREATE OR REPLACE preserves the job + academy
-- branches verbatim; only adds: v_latest_intent, event_slug in the loop, an
-- intent='event' branch, and source='event_register' for event-origin candidates.

-- 1. Back-link column: which candidate this lead became (NULL until claimed).
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_event_reg_candidate ON event_registrations(candidate_id);

-- 2. pending_submissions: event intent + target.
ALTER TABLE pending_submissions
  ADD COLUMN IF NOT EXISTS event_slug TEXT REFERENCES events(slug) ON DELETE RESTRICT;

ALTER TABLE pending_submissions DROP CONSTRAINT IF EXISTS pending_submissions_intent_check;
ALTER TABLE pending_submissions
  ADD CONSTRAINT pending_submissions_intent_check
    CHECK (intent IN ('job', 'academy', 'event'));

ALTER TABLE pending_submissions DROP CONSTRAINT IF EXISTS pending_intent_target;
ALTER TABLE pending_submissions
  ADD CONSTRAINT pending_intent_target CHECK (
    (intent = 'job'     AND position_slug IS NOT NULL) OR
    (intent = 'academy' AND program_slug  IS NOT NULL) OR
    (intent = 'event'   AND event_slug    IS NOT NULL)
  );

-- 3. handle_new_auth_user — add the 'event' branch (links event_registrations).
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_candidate_id  UUID;
  v_pending       RECORD;
  v_latest_form   JSONB;
  v_latest_intent TEXT;
  v_existing      UUID;
  v_meta_name     TEXT;
  v_meta_source   TEXT;
  v_fallback      TEXT;
BEGIN
  SELECT form_data, intent INTO v_latest_form, v_latest_intent
  FROM pending_submissions
  WHERE lower(email) = lower(NEW.email)
    AND consumed_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  -- Case 1: No pending — direct signup. Link existing candidate or create stub.
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
      jsonb_build_object('schema_version', 2, 'onboarding', '{}'::jsonb),
      COALESCE(v_meta_source, 'direct_signup')
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
    RETURN NEW;
  END IF;

  -- Case 2: pending(s) exist. Upsert candidate bio from latest form.
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
      jsonb_build_object('schema_version', 2, 'onboarding', '{}'::jsonb),
      CASE WHEN v_latest_intent = 'event' THEN 'event_register' ELSE 'form_apply' END,
      v_latest_form->>'utm_source',
      v_latest_form->>'utm_campaign',
      v_latest_form->>'source_url'
    )
    RETURNING id INTO v_candidate_id;
  END IF;

  -- Materialize each pending by intent.
  FOR v_pending IN
    SELECT id, intent, position_slug, program_slug, event_slug, form_data
    FROM pending_submissions
    WHERE lower(email) = lower(NEW.email)
      AND consumed_at IS NULL
    ORDER BY created_at ASC
  LOOP
    IF v_pending.intent = 'academy' THEN
      INSERT INTO academy_enrollments (
        candidate_id, program_slug, answers, status
      ) VALUES (
        v_candidate_id,
        v_pending.program_slug,
        COALESCE(v_pending.form_data->'answers', '{}'::jsonb),
        'registered'
      )
      ON CONFLICT (candidate_id, program_slug) DO NOTHING;
    ELSIF v_pending.intent = 'event' THEN
      -- Link the anon event lead to its freshly-materialized candidate.
      UPDATE event_registrations
      SET candidate_id = v_candidate_id
      WHERE event_slug = v_pending.event_slug
        AND lower(email) = lower(NEW.email)
        AND candidate_id IS NULL;
    ELSE
      INSERT INTO applications (
        candidate_id, position_slug, answers, pipeline_stage
      ) VALUES (
        v_candidate_id,
        v_pending.position_slug,
        COALESCE(v_pending.form_data->'role_data', '{}'::jsonb),
        'applied'
      )
      ON CONFLICT (candidate_id, position_slug) DO NOTHING;
    END IF;

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
