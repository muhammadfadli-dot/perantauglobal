-- 0066_candidate_utm_attribution.sql
--
-- Fix #2 from the 2026-06-03 conversion-gap diagnosis: candidate-level Meta
-- attribution was lost. `candidates.utm_source` / `utm_campaign` were NULL for
-- every applicant even though `pending_submissions.form_data.source_url` carries
-- `utm_source` / `utm_campaign` / `fbclid` for ~75-80% of ad-driven submits.
--
-- Root cause: the materialization trigger read `form_data->>'utm_source'` /
-- `'utm_campaign'` — keys the apply route never wrote — so they always resolved
-- NULL, and the UPDATE branch (existing/cross-position candidate) didn't touch
-- utm at all.
--
-- Fix: recreate `handle_new_auth_user` so it DERIVES utm from `source_url`
-- (always present) via regex, preferring any explicit `form_data.utm_*` key if a
-- future caller sets one. Both the INSERT (new candidate) and UPDATE (existing
-- candidate) branches now populate utm + referrer_url, COALESCE-guarded so
-- first-touch attribution is never overwritten.
--
-- Then backfill existing candidates from their earliest (first-touch) pending
-- submission's source_url.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_candidate_id UUID;
  v_pending      RECORD;
  v_latest_form  JSONB;
  v_existing     UUID;
  v_meta_name    TEXT;
  v_meta_source  TEXT;
  v_fallback     TEXT;
  v_src          TEXT;
  v_utm_source   TEXT;
  v_utm_campaign TEXT;
BEGIN
  SELECT form_data INTO v_latest_form
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

  -- Derive Meta attribution from the staged form. Prefer an explicit
  -- form_data.utm_* key (forward-compat) else parse it out of source_url, which
  -- the apply form always sends as window.location.href.
  -- source_url is user-influenceable (apps/web forwards window.location.href),
  -- so cap the extracted tokens defensively. Legit values are short
  -- (utm_source "fb"/"ig", utm_campaign = numeric campaign ID); 128 is generous.
  v_src          := v_latest_form->>'source_url';
  v_utm_source   := left(COALESCE(
                      NULLIF(v_latest_form->>'utm_source', ''),
                      (regexp_match(v_src, '[?&]utm_source=([^&#]+)'))[1]
                    ), 128);
  v_utm_campaign := left(COALESCE(
                      NULLIF(v_latest_form->>'utm_campaign', ''),
                      (regexp_match(v_src, '[?&]utm_campaign=([^&#]+)'))[1]
                    ), 128);

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
      CASE
        WHEN v_latest_form->>'birth_date' IS NOT NULL
          AND v_latest_form->>'birth_date' <> ''
        THEN (v_latest_form->>'birth_date')::DATE
        ELSE NULL
      END,
      v_latest_form->>'gender',
      v_latest_form->>'education',
      jsonb_build_object('schema_version', 2, 'onboarding', '{}'::jsonb),
      'form_apply',
      v_utm_source,
      v_utm_campaign,
      v_src
    )
    RETURNING id INTO v_candidate_id;
  END IF;

  -- Materialize each pending by intent.
  FOR v_pending IN
    SELECT id, intent, position_slug, program_slug, form_data
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
$function$;

-- ---------------------------------------------------------------------------
-- Backfill existing candidates from their first-touch pending submission's
-- source_url. Only fills NULLs (never overwrites). url-decoding is skipped:
-- utm_source ("fb"/"ig") and utm_campaign (numeric campaign IDs) are clean
-- tokens in practice.
-- ---------------------------------------------------------------------------
WITH first_touch AS (
  SELECT DISTINCT ON (lower(email))
    lower(email)            AS em,
    form_data->>'source_url' AS src
  FROM pending_submissions
  WHERE form_data->>'source_url' ~ '[?&](utm_source|utm_campaign|fbclid)='
  ORDER BY lower(email), created_at ASC
)
UPDATE candidates c
SET
  utm_source   = COALESCE(c.utm_source,   left((regexp_match(ft.src, '[?&]utm_source=([^&#]+)'))[1], 128)),
  utm_campaign = COALESCE(c.utm_campaign, left((regexp_match(ft.src, '[?&]utm_campaign=([^&#]+)'))[1], 128)),
  referrer_url = COALESCE(c.referrer_url, ft.src),
  updated_at   = NOW()
FROM first_touch ft
WHERE lower(c.email) = ft.em
  AND (c.utm_source IS NULL OR c.utm_campaign IS NULL OR c.referrer_url IS NULL);
