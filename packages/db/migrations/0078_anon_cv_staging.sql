-- 0078_anon_cv_staging.sql
--
-- Fase 2 CV Grader: tarik upload CV ke DEPAN funnel + auto-grade.
--
-- Konteks: sebelum ini CV cuma bisa di-upload post-account (di portal), jadi cuma
-- ~21% akun punya CV + Meta "Lead" = sinyal lemah. Migration ini bikin jalur CV
-- staged ANON di ApplyForm (sebelum akun jadi), lalu materialize jadi
-- candidate_documents saat email diverifikasi, lalu reuse engine grade-cv (ZERO change).
--
-- Yang DI SINI (Postgres):
--   1. Bucket Storage `pending-cv` (private, anon INSERT-only, scoped pending/<uuid>/).
--   2. Recreate handle_new_auth_user() = VERBATIM 0067 + 1 blok CV best-effort
--      (INSERT metadata candidate_documents; file fisik MASIH di pending-cv).
--
-- Yang BUKAN di sini (karena pg_net + pg_cron TIDAK terinstall; trigger tak bisa
-- mindahin file fisik object):
--   - MOVE file pending-cv -> candidate-documents + invoke grade-cv: dilakukan
--     edge fn service-role `cv-materialize` yang dipanggil dari /auth/callback.
--   - Cron purge orphan (>48h, consumed_at NULL): Supabase scheduled edge fn / GH Action.
--
-- Additive + non-destructive. Pointer CV masuk pending_submissions.form_data->'cv'
-- = {path, mime, size} (NOL kolom baru, konsisten pola form_data->>'ref'/utm).

-- =====================================================================
-- 1. Bucket pending-cv (PRIVATE; cap + mime identik candidate-documents 0010).
--    TERPISAH dari candidate-documents biar blast-radius anon-write terisolasi:
--    kalau policy salah-scope, cuma staging yang ke-expose, BUKAN seluruh CV
--    kandidat authenticated.
-- =====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pending-cv', 'pending-cv', false,
  5242880,  -- 5MB, identik candidate-documents
  ARRAY['image/jpeg','image/png','image/heic','image/heif','image/webp','application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================================
-- 2. Storage RLS pending-cv:
--    - anon: INSERT-only, scoped KETAT ke pending/<uuid>/ (tepat 2 segmen folder).
--      Anon TIDAK punya SELECT/UPDATE/DELETE -> blind write-only (gak bisa
--      enumerasi/baca/timpa CV orang lain). pendingId = UUIDv4 unguessable.
--    - admin: full (debug/manual).
--    - MOVE saat verify dilakukan service-role (cv-materialize) -> bypass RLS,
--      jadi TIDAK perlu policy buat authenticated candidate di sini (sengaja:
--      itu yang bikin bucket ini nggak bisa di-enumerasi siapa pun selain admin).
-- =====================================================================
DROP POLICY IF EXISTS pending_cv_anon_insert ON storage.objects;
CREATE POLICY pending_cv_anon_insert ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'pending-cv'
    AND (storage.foldername(name))[1] = 'pending'
    AND array_length(storage.foldername(name), 1) = 2
  );

DROP POLICY IF EXISTS pending_cv_admin_all ON storage.objects;
CREATE POLICY pending_cv_admin_all ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'pending-cv' AND public.is_admin())
  WITH CHECK (bucket_id = 'pending-cv' AND public.is_admin());

-- =====================================================================
-- 3. Recreate handle_new_auth_user() - VERBATIM dari 0067 + 1 blok CV.
--    Blok CV ditaruh SEKALI per kandidat (pakai v_latest_form, bukan di loop)
--    karena CV = dokumen candidate-level (bukan per-application). Best-effort:
--    BEGIN/EXCEPTION WHEN OTHERS -> RAISE WARNING, JANGAN pernah abort signup
--    (mirror pola blok AFFILIATE existing).
--    candidate_documents TIDAK punya kolom application_id (CV = identity doc,
--    candidate-level). file_path masih nunjuk pending/<id>/cv.* sampai di-move.
-- =====================================================================
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

  -- Case 1: No pending - direct signup. Link existing candidate or create stub.
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

  -- AFFILIATE: resolve a manually-typed referral code (form_data.ref) -> agent,
  -- attribute the candidate (first-touch), and log the registration event.
  -- Best-effort: referral attribution must NEVER abort a candidate signup, so any
  -- failure (e.g. the helper missing under a partial apply) degrades to a warning.
  BEGIN
    PERFORM public._attribute_candidate_referral(v_candidate_id, v_latest_form->>'ref');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'affiliate attribution skipped for candidate %: %', v_candidate_id, SQLERRM;
  END;

  -- CV (Fase 2): kalau form depan-funnel nyertain CV staged (form_data.cv),
  -- materialize METADATA candidate_documents (doc_type='cv'). File fisik MASIH
  -- di bucket pending-cv (path pending/<pendingId>/cv.*); /auth/callback -> edge fn
  -- cv-materialize yang MOVE ke candidate-documents + invoke grade-cv (service-role).
  -- SEKALI per kandidat (CV = candidate-level). Best-effort: JANGAN abort signup.
  IF v_latest_form ? 'cv'
     AND v_latest_form->'cv'->>'path' IS NOT NULL THEN
    BEGIN
      INSERT INTO candidate_documents (
        candidate_id, doc_type, file_path, mime_type, file_size, display_name
      ) VALUES (
        v_candidate_id,
        'cv',
        v_latest_form->'cv'->>'path',                       -- masih pending/<id>/cv.*
        NULLIF(v_latest_form->'cv'->>'mime', ''),
        NULLIF(v_latest_form->'cv'->>'size', '')::BIGINT,
        'CV'
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'pending CV materialize skipped for candidate %: %', v_candidate_id, SQLERRM;
    END;
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

-- =====================================================================
-- DONE - migration 0078. Trigger pada auth.users TIDAK diubah (cuma body fungsi
-- di-replace). cv_assessments / application_cv_fit / grade-cv TIDAK disentuh.
-- =====================================================================
