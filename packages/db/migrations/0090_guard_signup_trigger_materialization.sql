-- 0090: Guard handle_new_auth_user against malformed pending rows.
--
-- The affiliate + CV-materialize blocks were already wrapped in BEGIN/EXCEPTION,
-- but the main FOR loop (materializing academy_enrollments / event_registrations /
-- applications + consents + marking consumed_at) was NOT. Because pending_submissions
-- is anon-writable, one poisoned row (bad FK, bad enum, etc.) would propagate out of
-- the trigger and fail the auth.users email_confirmed_at UPDATE itself -> the candidate
-- could not confirm their email at all, and the remaining good rows were skipped.
--
-- This rebuild (authored from the LIVE pg_get_functiondef, per the 0081 lesson):
--   1. wraps each loop iteration in its own BEGIN/EXCEPTION WHEN OTHERS -> a failed
--      row is skipped (and stays unconsumed, so it's visible to a materialization-miss
--      monitor) instead of aborting the whole trigger.
--   2. pre-computes birth_date in a guarded block so a malformed date string becomes
--      NULL instead of aborting the candidate INSERT.
-- No happy-path behaviour changes; the change strictly reduces failure modes.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_candidate_id  UUID;
  v_pending       RECORD;
  v_latest_form   JSONB;
  v_latest_intent TEXT;
  v_existing      UUID;
  v_meta_name     TEXT;
  v_meta_source   TEXT;
  v_fallback      TEXT;
  v_src           TEXT;
  v_utm_source    TEXT;
  v_utm_campaign  TEXT;
  v_birth_date    DATE;
BEGIN
  SELECT form_data, intent INTO v_latest_form, v_latest_intent
  FROM pending_submissions
  WHERE lower(email) = lower(NEW.email)
    AND consumed_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

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

  v_src          := v_latest_form->>'source_url';
  v_utm_source   := left(COALESCE(
                      NULLIF(v_latest_form->>'utm_source', ''),
                      (regexp_match(v_src, '[?&]utm_source=([^&#]+)'))[1]
                    ), 128);
  v_utm_campaign := left(COALESCE(
                      NULLIF(v_latest_form->>'utm_campaign', ''),
                      (regexp_match(v_src, '[?&]utm_campaign=([^&#]+)'))[1]
                    ), 128);

  -- Guarded birth_date parse: a malformed date in (anon-writable) pending
  -- form_data must not abort the trigger / block email confirmation.
  BEGIN
    v_birth_date := CASE
      WHEN COALESCE(v_latest_form->>'birth_date', '') <> ''
      THEN (v_latest_form->>'birth_date')::DATE
      ELSE NULL
    END;
  EXCEPTION WHEN OTHERS THEN
    v_birth_date := NULL;
  END;

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
      utm_source   = COALESCE(utm_source, v_utm_source),
      utm_campaign = COALESCE(utm_campaign, v_utm_campaign),
      referrer_url = COALESCE(referrer_url, v_src),
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
      v_birth_date,
      v_latest_form->>'gender',
      v_latest_form->>'education',
      jsonb_build_object('schema_version', 2, 'onboarding', '{}'::jsonb),
      CASE WHEN v_latest_intent = 'event' THEN 'event_register' ELSE 'form_apply' END,
      v_utm_source,
      v_utm_campaign,
      v_src
    )
    RETURNING id INTO v_candidate_id;
  END IF;

  BEGIN
    PERFORM public._attribute_candidate_referral(v_candidate_id, v_latest_form->>'ref');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'affiliate attribution skipped for candidate %: %', v_candidate_id, SQLERRM;
  END;

  IF v_latest_form ? 'cv'
     AND v_latest_form->'cv'->>'path' IS NOT NULL THEN
    BEGIN
      INSERT INTO candidate_documents (
        candidate_id, doc_type, file_path, mime_type, file_size, display_name
      )
      SELECT
        v_candidate_id,
        'cv',
        v_latest_form->'cv'->>'path',
        NULLIF(v_latest_form->'cv'->>'mime', ''),
        NULLIF(v_latest_form->'cv'->>'size', '')::BIGINT,
        'CV'
      WHERE NOT EXISTS (
        SELECT 1 FROM candidate_documents
        WHERE candidate_id = v_candidate_id AND doc_type = 'cv'
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'pending CV materialize skipped for candidate %: %', v_candidate_id, SQLERRM;
    END;
  END IF;

  FOR v_pending IN
    SELECT id, intent, position_slug, program_slug, event_slug, form_data
    FROM pending_submissions
    WHERE lower(email) = lower(NEW.email)
      AND consumed_at IS NULL
    ORDER BY created_at ASC
  LOOP
    -- Guard each materialization independently: one poisoned pending row must
    -- not abort the trigger (which would block email confirmation) or skip the
    -- remaining good rows. A failed row stays unconsumed (so a materialization-
    -- miss monitor can catch it) rather than being silently dropped.
    BEGIN
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
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'signup materialize skipped pending % (candidate %): %',
        v_pending.id, v_candidate_id, SQLERRM;
    END;
  END LOOP;

  RETURN NEW;
END;
$function$;
