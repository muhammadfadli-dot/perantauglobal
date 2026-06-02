-- =========================================================================
-- MIGRATION 0060: Akademi Perantau — learning-platform foundation
-- =========================================================================
-- Umbrella learning brand "Akademi Perantau" (facilitated by Daya Skill).
-- Supersedes draft 0040 (paspor_courses) — that file is removed.
--
-- Builds the foundation to (1) receive course registrations tied to a PG
-- account and (2) deliver in-app guided learning (reading + quiz w/ scoring),
-- with a security model where quiz answer keys never reach the client.
--
-- Tables:
--   academy_programs              — catalog (slug PK), delivery_mode-aware
--   program_registration_fields   — per-program intake questions
--   academy_modules               — ordered units within a program
--   academy_lessons               — leaf content: reading | quiz (no answer keys)
--   academy_lesson_keys           — admin-only quiz answer keys
--   academy_enrollments           — candidate × program registration + progress
--   academy_lesson_progress       — per-lesson completion + quiz score
--
-- pending_submissions gains: intent ('job'|'academy'), nullable position_slug,
-- program_slug. Trigger handle_new_auth_user routes academy pendings to
-- academy_enrollments instead of applications.
--
-- RPCs (SECURITY DEFINER, owner-run): enroll_in_academy_program (logged-in
-- enroll + consent atomic), complete_academy_reading, grade_academy_quiz,
-- _recompute_academy_enrollment, _assert_academy_enrollment_owner.
--
-- Hardened per 0060 adversarial review (2026-06-02): NULL-candidate deny in
-- ownership check; cert cleared when no longer earned + gated on output_type;
-- logged-in enroll routed through an RPC (consent atomic, publish-gated) instead
-- of a broad self-insert policy; anon EXECUTE revoked on public RPCs; per-lesson
-- pass_threshold; per-enrollment external link; program_slug RESTRICT (archive,
-- don't hard-delete); idempotent re-run guards.
--
-- FOUNDATION SCOPE NOTES:
--   - enrollment.score = unweighted average of quiz lesson scores (display).
--     Pass/fail is decided per-lesson (all quizzes must individually pass), NOT
--     by the average. Weighted/last-quiz scoring deferred.
--   - webinar/offline are single-session (program.starts_at) + free-text
--     enrollment.external_status attendance for the foundation. Multi-session
--     cohorts (academy_sessions/attendance) deferred until a real cohort needs it.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. academy_programs
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS academy_programs (
  slug                TEXT PRIMARY KEY,
  title               TEXT NOT NULL CHECK (length(title) BETWEEN 2 AND 200),
  subtitle            TEXT,

  -- taxonomy
  category            TEXT NOT NULL DEFAULT 'masterclass'
                        CHECK (category IN ('paspor', 'masterclass', 'sertifikasi', 'vokasi')),
  delivery_mode       TEXT NOT NULL DEFAULT 'in_app'
                        CHECK (delivery_mode IN ('in_app', 'webinar', 'offline', 'external')),
  facilitated_by      TEXT NOT NULL DEFAULT 'Daya Skill',
  country             TEXT,                       -- optional destination-country link

  -- pricing
  is_free             BOOLEAN NOT NULL DEFAULT true,
  price               INTEGER CHECK (price IS NULL OR price >= 0),  -- IDR; null/0 = free

  -- output / credential (every program has a defined output)
  output_type         TEXT NOT NULL DEFAULT 'certificate'
                        CHECK (output_type IN ('certificate', 'psikotes_result', 'completion', 'none')),
  credential_issuer   TEXT DEFAULT 'Daya Skill',
  credential_delivery TEXT NOT NULL DEFAULT 'in_app'
                        CHECK (credential_delivery IN ('in_app', 'emailed', 'external', 'physical')),

  -- scheduling (webinar / offline cohort — single-session for foundation)
  starts_at           TIMESTAMPTZ,
  location            TEXT,
  capacity            INTEGER CHECK (capacity IS NULL OR capacity > 0),
  external_url        TEXT,                       -- shared external link (catalog-level)

  -- learning config + display content
  duration_label      TEXT,                       -- "~5 jam" (display only)
  pass_threshold      INTEGER NOT NULL DEFAULT 70 CHECK (pass_threshold BETWEEN 0 AND 100),
  content             JSONB NOT NULL DEFAULT '{}'::jsonb
                        CHECK (pg_column_size(content) < 100000),
  cover_image         TEXT,

  -- lifecycle
  status              TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'published', 'closed')),
  sort_order          INTEGER NOT NULL DEFAULT 0,
  published_at        TIMESTAMPTZ,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academy_programs_status
  ON academy_programs (status, sort_order);

-- -------------------------------------------------------------------------
-- 2. program_registration_fields — per-program intake questions
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS program_registration_fields (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_slug  TEXT NOT NULL REFERENCES academy_programs(slug) ON DELETE CASCADE,
  sort_order    INTEGER NOT NULL DEFAULT 0,

  field_key     TEXT NOT NULL,
  field_label   TEXT NOT NULL,
  field_help    TEXT,
  field_type    form_field_type NOT NULL,     -- reuse existing enum
  options       JSONB,
  required      BOOLEAN NOT NULL DEFAULT false,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uniq_prf_program_field_key UNIQUE (program_slug, field_key)
);

CREATE INDEX IF NOT EXISTS idx_prf_program
  ON program_registration_fields (program_slug, sort_order);

-- -------------------------------------------------------------------------
-- 3. academy_modules
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS academy_modules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_slug  TEXT NOT NULL REFERENCES academy_programs(slug) ON DELETE CASCADE,
  module_num    INTEGER NOT NULL CHECK (module_num > 0),
  title         TEXT NOT NULL,
  summary       TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (program_slug, module_num)
);

CREATE INDEX IF NOT EXISTS idx_academy_modules_program
  ON academy_modules (program_slug, sort_order);

-- -------------------------------------------------------------------------
-- 4. academy_lessons — reading | quiz. content has NO answer keys.
-- -------------------------------------------------------------------------
-- content shapes (safe to expose to enrolled candidates):
--   reading: { "blocks": [ { "type": "heading|paragraph|list|callout", ... } ] }
--   quiz:    { "questions": [ { "id": "q1", "prompt": "...",
--                              "options": [ { "key": "a", "label": "..." } ],
--                              "multiple": false } ] }
-- Correct keys + explanations + weights live in academy_lesson_keys (admin-only).
-- pass_threshold (nullable) overrides program.pass_threshold for THIS quiz.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS academy_lessons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id         UUID NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,
  lesson_num        INTEGER NOT NULL CHECK (lesson_num > 0),
  title             TEXT NOT NULL,
  lesson_type       TEXT NOT NULL DEFAULT 'reading'
                      CHECK (lesson_type IN ('reading', 'quiz', 'video')),
  estimated_minutes INTEGER CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0),
  pass_threshold    INTEGER CHECK (pass_threshold IS NULL OR pass_threshold BETWEEN 0 AND 100),
  content           JSONB NOT NULL DEFAULT '{}'::jsonb
                      CHECK (pg_column_size(content) < 200000),
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, lesson_num)
);

CREATE INDEX IF NOT EXISTS idx_academy_lessons_module
  ON academy_lessons (module_id, sort_order);

-- -------------------------------------------------------------------------
-- 5. academy_lesson_keys — admin-only quiz answer keys
-- -------------------------------------------------------------------------
-- keys shape:
--   { "q1": { "correct": ["a"], "weight": 1, "explanation": "..." }, ... }
-- One row per quiz lesson. Never selectable by candidates (RLS admin-only).
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS academy_lesson_keys (
  lesson_id     UUID PRIMARY KEY REFERENCES academy_lessons(id) ON DELETE CASCADE,
  keys          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 6. academy_enrollments — candidate × program
-- -------------------------------------------------------------------------
-- program_slug is ON DELETE RESTRICT: a program with enrollments cannot be
-- hard-deleted (archive via status='closed'). Protects learning/CRM records.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS academy_enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id    UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  program_slug    TEXT NOT NULL REFERENCES academy_programs(slug) ON DELETE RESTRICT,

  status          TEXT NOT NULL DEFAULT 'registered'
                    CHECK (status IN ('registered', 'in_progress', 'completed',
                                      'passed', 'failed', 'cancelled')),
  answers         JSONB NOT NULL DEFAULT '{}'::jsonb,   -- registration field answers
  progress_pct    INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  score           NUMERIC(5,2) CHECK (score IS NULL OR (score >= 0 AND score <= 100)),

  -- external / offline CRM tracking
  external_status TEXT,                                 -- link_sent | scheduled | attended | result_received
  external_url    TEXT,                                 -- per-candidate external test/link
  external_ref    TEXT,                                 -- vendor candidate id / token
  certificate_id  TEXT,
  certificate_url TEXT,

  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (candidate_id, program_slug)
);

CREATE INDEX IF NOT EXISTS idx_academy_enrollments_candidate
  ON academy_enrollments (candidate_id);
CREATE INDEX IF NOT EXISTS idx_academy_enrollments_program
  ON academy_enrollments (program_slug, status);

-- -------------------------------------------------------------------------
-- 7. academy_lesson_progress — enrollment × lesson
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS academy_lesson_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
  lesson_id     UUID NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'completed'
                  CHECK (status IN ('completed', 'passed', 'failed')),
  score         NUMERIC(5,2) CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  answers       JSONB,                                  -- quiz answers submitted
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_academy_lesson_progress_enrollment
  ON academy_lesson_progress (enrollment_id);

-- -------------------------------------------------------------------------
-- 8. updated_at triggers (reuse existing set_updated_at(); re-runnable)
-- -------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_academy_programs_updated_at
  BEFORE UPDATE ON academy_programs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE OR REPLACE TRIGGER trg_prf_updated_at
  BEFORE UPDATE ON program_registration_fields
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE OR REPLACE TRIGGER trg_academy_modules_updated_at
  BEFORE UPDATE ON academy_modules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE OR REPLACE TRIGGER trg_academy_lessons_updated_at
  BEFORE UPDATE ON academy_lessons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE OR REPLACE TRIGGER trg_academy_lesson_keys_updated_at
  BEFORE UPDATE ON academy_lesson_keys
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE OR REPLACE TRIGGER trg_academy_enrollments_updated_at
  BEFORE UPDATE ON academy_enrollments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================================
-- 9. RLS (re-runnable: DROP POLICY IF EXISTS before CREATE)
-- =========================================================================
ALTER TABLE academy_programs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_registration_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_modules             ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lesson_keys         ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_enrollments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lesson_progress     ENABLE ROW LEVEL SECURITY;

-- programs: public read published; admin all
DROP POLICY IF EXISTS "academy_programs_read_published" ON academy_programs;
CREATE POLICY "academy_programs_read_published" ON academy_programs
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR is_admin());
DROP POLICY IF EXISTS "academy_programs_admin_all" ON academy_programs;
CREATE POLICY "academy_programs_admin_all" ON academy_programs
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- registration fields: readable when parent program published; admin all
DROP POLICY IF EXISTS "prf_read_published" ON program_registration_fields;
CREATE POLICY "prf_read_published" ON program_registration_fields
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM academy_programs p
            WHERE p.slug = program_slug AND (p.status = 'published' OR is_admin()))
  );
DROP POLICY IF EXISTS "prf_admin_all" ON program_registration_fields;
CREATE POLICY "prf_admin_all" ON program_registration_fields
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- modules: readable when parent program published; admin all
DROP POLICY IF EXISTS "academy_modules_read" ON academy_modules;
CREATE POLICY "academy_modules_read" ON academy_modules
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM academy_programs p
            WHERE p.slug = program_slug AND (p.status = 'published' OR is_admin()))
  );
DROP POLICY IF EXISTS "academy_modules_admin_all" ON academy_modules;
CREATE POLICY "academy_modules_admin_all" ON academy_modules
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- lessons: readable when parent program published; admin all.
-- (No answer keys in this table — safe to expose to enrolled candidates.)
DROP POLICY IF EXISTS "academy_lessons_read" ON academy_lessons;
CREATE POLICY "academy_lessons_read" ON academy_lessons
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM academy_modules m
      JOIN academy_programs p ON p.slug = m.program_slug
      WHERE m.id = module_id AND (p.status = 'published' OR is_admin())
    )
  );
DROP POLICY IF EXISTS "academy_lessons_admin_all" ON academy_lessons;
CREATE POLICY "academy_lessons_admin_all" ON academy_lessons
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- answer keys: ADMIN ONLY (no candidate read, ever)
DROP POLICY IF EXISTS "academy_lesson_keys_admin_all" ON academy_lesson_keys;
CREATE POLICY "academy_lesson_keys_admin_all" ON academy_lesson_keys
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- enrollments: candidate self-read; admin all.
-- NO candidate INSERT/UPDATE policy — logged-in enroll goes through
-- enroll_in_academy_program() (consent atomic + publish-gated), and all progress
-- mutation goes through SECURITY DEFINER RPCs. Pending-path enrollments are
-- materialized by the trigger (also definer). This closes the self-insert
-- spoofing vector (certificate_url/external_status/etc).
DROP POLICY IF EXISTS "academy_enrollments_self_read" ON academy_enrollments;
CREATE POLICY "academy_enrollments_self_read" ON academy_enrollments
  FOR SELECT TO authenticated
  USING (
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
    OR is_admin()
  );
DROP POLICY IF EXISTS "academy_enrollments_admin_all" ON academy_enrollments;
CREATE POLICY "academy_enrollments_admin_all" ON academy_enrollments
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- lesson progress: candidate self-read; admin all. Writes only via RPCs.
DROP POLICY IF EXISTS "academy_lesson_progress_self_read" ON academy_lesson_progress;
CREATE POLICY "academy_lesson_progress_self_read" ON academy_lesson_progress
  FOR SELECT TO authenticated
  USING (
    enrollment_id IN (
      SELECT e.id FROM academy_enrollments e
      JOIN candidates c ON c.id = e.candidate_id
      WHERE c.auth_user_id = auth.uid()
    )
    OR is_admin()
  );
DROP POLICY IF EXISTS "academy_lesson_progress_admin_all" ON academy_lesson_progress;
CREATE POLICY "academy_lesson_progress_admin_all" ON academy_lesson_progress
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- =========================================================================
-- 10. pending_submissions: intent discriminator (job | academy)
-- =========================================================================
ALTER TABLE pending_submissions ALTER COLUMN position_slug DROP NOT NULL;

ALTER TABLE pending_submissions
  ADD COLUMN IF NOT EXISTS intent TEXT NOT NULL DEFAULT 'job'
    CHECK (intent IN ('job', 'academy'));
-- program_slug RESTRICT: don't silently destroy staged submissions / orphan
-- consents when a program is removed (programs are mutable, unlike positions).
ALTER TABLE pending_submissions
  ADD COLUMN IF NOT EXISTS program_slug TEXT
    REFERENCES academy_programs(slug) ON DELETE RESTRICT;

ALTER TABLE pending_submissions DROP CONSTRAINT IF EXISTS pending_intent_target;
ALTER TABLE pending_submissions
  ADD CONSTRAINT pending_intent_target CHECK (
    (intent = 'job'     AND position_slug IS NOT NULL) OR
    (intent = 'academy' AND program_slug  IS NOT NULL)
  );

-- =========================================================================
-- 11. handle_new_auth_user — route academy pendings to academy_enrollments
-- =========================================================================
-- Same as 0034 except the per-pending loop branches on intent: academy pendings
-- create academy_enrollments (answers <- form_data.answers); job pendings keep
-- creating applications (answers <- form_data.role_data).
--
-- CONTRACT: the academy register route MUST stage form_data with top-level bio
-- (full_name, whatsapp/phone, city, optional gender/education/birth_date) — same
-- shape as the job form — plus nested form_data.answers for the program's
-- registration-field responses. The candidate bio upsert below reads top-level
-- keys from the latest pending regardless of intent; the route enforces presence
-- of full_name + whatsapp so no 'Unknown'/NULL identity is ever materialized.
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
      'form_apply',
      v_latest_form->>'utm_source',
      v_latest_form->>'utm_campaign',
      v_latest_form->>'source_url'
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
$$;

-- =========================================================================
-- 12. RPCs (SECURITY DEFINER)
-- =========================================================================

-- Internal: recompute enrollment progress/status from lesson_progress.
-- Pass/fail = per-lesson (all quizzes must individually pass). score = display
-- average. Cert stamped only for output_type certificate/completion, cleared
-- when no longer earned.
CREATE OR REPLACE FUNCTION _recompute_academy_enrollment(p_enrollment_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_program_slug   TEXT;
  v_output_type    TEXT;
  v_total_lessons  INTEGER;
  v_done_lessons   INTEGER;
  v_quiz_total     INTEGER;
  v_quiz_done      INTEGER;
  v_quiz_failed    INTEGER;
  v_avg_score      NUMERIC(5,2);
  v_progress       INTEGER;
  v_status         TEXT;
  v_cert_eligible  BOOLEAN;
BEGIN
  SELECT e.program_slug, p.output_type
    INTO v_program_slug, v_output_type
  FROM academy_enrollments e
  JOIN academy_programs p ON p.slug = e.program_slug
  WHERE e.id = p_enrollment_id;

  IF v_program_slug IS NULL THEN
    RETURN;
  END IF;

  SELECT count(*) INTO v_total_lessons
  FROM academy_lessons l
  JOIN academy_modules m ON m.id = l.module_id
  WHERE m.program_slug = v_program_slug;

  -- Lesson-less programs (external/offline) are admin-managed — don't clobber.
  IF v_total_lessons = 0 THEN
    RETURN;
  END IF;

  SELECT count(*) INTO v_done_lessons
  FROM academy_lesson_progress lp
  WHERE lp.enrollment_id = p_enrollment_id;

  SELECT count(*) INTO v_quiz_total
  FROM academy_lessons l
  JOIN academy_modules m ON m.id = l.module_id
  WHERE m.program_slug = v_program_slug AND l.lesson_type = 'quiz';

  SELECT
    count(*),
    count(*) FILTER (WHERE lp.status = 'failed'),
    COALESCE(avg(lp.score), 0)
  INTO v_quiz_done, v_quiz_failed, v_avg_score
  FROM academy_lesson_progress lp
  JOIN academy_lessons l ON l.id = lp.lesson_id
  WHERE lp.enrollment_id = p_enrollment_id AND l.lesson_type = 'quiz';

  v_progress := LEAST(100, round(v_done_lessons::numeric / v_total_lessons * 100));

  IF v_done_lessons = 0 THEN
    v_status := 'registered';
  ELSIF v_done_lessons < v_total_lessons THEN
    v_status := 'in_progress';
  ELSIF v_quiz_total = 0 THEN
    v_status := 'completed';
  ELSIF v_quiz_done >= v_quiz_total AND v_quiz_failed = 0 THEN
    v_status := 'passed';
  ELSE
    v_status := 'failed';
  END IF;

  v_cert_eligible := v_status IN ('completed', 'passed')
                     AND v_output_type IN ('certificate', 'completion');

  UPDATE academy_enrollments
  SET
    progress_pct = v_progress,
    score        = CASE WHEN v_quiz_done > 0 THEN v_avg_score ELSE score END,
    status       = v_status,
    started_at   = CASE WHEN v_done_lessons > 0 THEN COALESCE(started_at, NOW()) ELSE started_at END,
    completed_at = CASE
      WHEN v_status IN ('completed', 'passed', 'failed') THEN COALESCE(completed_at, NOW())
      ELSE NULL
    END,
    certificate_id = CASE
      WHEN v_cert_eligible
        THEN COALESCE(certificate_id, 'AP-' || upper(substr(replace(p_enrollment_id::text, '-', ''), 1, 10)))
      ELSE NULL
    END,
    certificate_url = CASE WHEN v_cert_eligible THEN certificate_url ELSE NULL END,
    updated_at = NOW()
  WHERE id = p_enrollment_id;
END;
$$;

-- Helper: assert the caller owns the enrollment (or is admin). NULL candidate
-- (caller not linked to any candidate row) is DENIED. Returns owner candidate id.
CREATE OR REPLACE FUNCTION _assert_academy_enrollment_owner(p_enrollment_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_candidate_id UUID;
  v_owner        UUID;
BEGIN
  SELECT id INTO v_candidate_id FROM candidates WHERE auth_user_id = auth.uid();
  SELECT candidate_id INTO v_owner FROM academy_enrollments WHERE id = p_enrollment_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'enrollment not found';
  END IF;
  IF is_admin() THEN
    RETURN v_owner;
  END IF;
  IF v_candidate_id IS NULL THEN
    RAISE EXCEPTION 'no candidate for caller';
  END IF;
  IF v_owner <> v_candidate_id THEN
    RAISE EXCEPTION 'not authorized for this enrollment';
  END IF;
  RETURN v_owner;
END;
$$;

-- Logged-in enroll: enrollment + PDP consent atomic, publish-gated. Consent is
-- logged once (only on first enroll). Replaces the broad self-insert RLS policy.
CREATE OR REPLACE FUNCTION enroll_in_academy_program(
  p_program_slug    TEXT,
  p_answers         JSONB DEFAULT '{}'::jsonb,
  p_consent_text    TEXT  DEFAULT NULL,
  p_consent_version TEXT  DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_candidate_id  UUID;
  v_published     BOOLEAN;
  v_enrollment_id UUID;
BEGIN
  SELECT id INTO v_candidate_id FROM candidates WHERE auth_user_id = auth.uid();
  IF v_candidate_id IS NULL THEN
    RAISE EXCEPTION 'no candidate for caller';
  END IF;

  SELECT (status = 'published') INTO v_published
  FROM academy_programs WHERE slug = p_program_slug;
  IF v_published IS NULL THEN
    RAISE EXCEPTION 'program not found';
  END IF;
  IF NOT v_published THEN
    RAISE EXCEPTION 'program not open for registration';
  END IF;

  INSERT INTO academy_enrollments (candidate_id, program_slug, answers, status)
  VALUES (v_candidate_id, p_program_slug, COALESCE(p_answers, '{}'::jsonb), 'registered')
  ON CONFLICT (candidate_id, program_slug) DO NOTHING
  RETURNING id INTO v_enrollment_id;

  IF v_enrollment_id IS NOT NULL THEN
    -- newly enrolled → log PDP consent once
    IF p_consent_text IS NOT NULL THEN
      INSERT INTO consents (candidate_id, purpose, purpose_text, version, granted_at)
      VALUES (v_candidate_id, 'academy_processing', p_consent_text,
              COALESCE(p_consent_version, 'v1'), NOW());
    END IF;
  ELSE
    SELECT id INTO v_enrollment_id FROM academy_enrollments
    WHERE candidate_id = v_candidate_id AND program_slug = p_program_slug;
  END IF;

  RETURN v_enrollment_id;
END;
$$;

-- Mark a reading lesson complete.
CREATE OR REPLACE FUNCTION complete_academy_reading(
  p_enrollment_id UUID,
  p_lesson_id     UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_owner       UUID;
  v_lesson_type TEXT;
  v_belongs     BOOLEAN;
BEGIN
  v_owner := _assert_academy_enrollment_owner(p_enrollment_id);

  SELECT l.lesson_type,
         EXISTS (
           SELECT 1
           FROM academy_lessons l2
           JOIN academy_modules m ON m.id = l2.module_id
           JOIN academy_enrollments e ON e.program_slug = m.program_slug
           WHERE l2.id = p_lesson_id AND e.id = p_enrollment_id
         )
    INTO v_lesson_type, v_belongs
  FROM academy_lessons l
  WHERE l.id = p_lesson_id;

  IF NOT COALESCE(v_belongs, false) THEN
    RAISE EXCEPTION 'lesson does not belong to this enrollment program';
  END IF;
  IF v_lesson_type <> 'reading' THEN
    RAISE EXCEPTION 'lesson is not a reading lesson';
  END IF;

  INSERT INTO academy_lesson_progress (enrollment_id, lesson_id, status, score)
  VALUES (p_enrollment_id, p_lesson_id, 'completed', NULL)
  ON CONFLICT (enrollment_id, lesson_id) DO NOTHING;

  PERFORM _recompute_academy_enrollment(p_enrollment_id);
END;
$$;

-- Grade a quiz lesson. p_answers shape: { "q1": ["a"], "q2": ["b","c"], ... }
-- Returns: { "score", "lesson_passed", "pass_threshold", "per_question" }.
CREATE OR REPLACE FUNCTION grade_academy_quiz(
  p_enrollment_id UUID,
  p_lesson_id     UUID,
  p_answers       JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_owner          UUID;
  v_lesson_type    TEXT;
  v_belongs        BOOLEAN;
  v_keys           JSONB;
  v_pass_threshold INTEGER;
  v_qid            TEXT;
  v_qkey           JSONB;
  v_correct_set    TEXT[];
  v_given_set      TEXT[];
  v_weight         NUMERIC;
  v_is_correct     BOOLEAN;
  v_total_weight   NUMERIC := 0;
  v_earned_weight  NUMERIC := 0;
  v_score          NUMERIC(5,2);
  v_lesson_passed  BOOLEAN;
  v_per_question   JSONB := '{}'::jsonb;
BEGIN
  v_owner := _assert_academy_enrollment_owner(p_enrollment_id);

  SELECT l.lesson_type,
         EXISTS (
           SELECT 1
           FROM academy_lessons l2
           JOIN academy_modules m ON m.id = l2.module_id
           JOIN academy_enrollments e ON e.program_slug = m.program_slug
           WHERE l2.id = p_lesson_id AND e.id = p_enrollment_id
         )
    INTO v_lesson_type, v_belongs
  FROM academy_lessons l
  WHERE l.id = p_lesson_id;

  IF NOT COALESCE(v_belongs, false) THEN
    RAISE EXCEPTION 'lesson does not belong to this enrollment program';
  END IF;
  IF v_lesson_type <> 'quiz' THEN
    RAISE EXCEPTION 'lesson is not a quiz lesson';
  END IF;

  SELECT keys INTO v_keys FROM academy_lesson_keys WHERE lesson_id = p_lesson_id;
  IF v_keys IS NULL OR v_keys = '{}'::jsonb THEN
    RAISE EXCEPTION 'quiz has no answer key configured';
  END IF;

  -- per-lesson threshold overrides program threshold
  SELECT COALESCE(l.pass_threshold, p.pass_threshold, 70) INTO v_pass_threshold
  FROM academy_lessons l
  JOIN academy_modules m ON m.id = l.module_id
  JOIN academy_programs p ON p.slug = m.program_slug
  WHERE l.id = p_lesson_id;

  -- score each question by weight (iterate the KEY's questions so a candidate
  -- cannot shrink the denominator by omitting answers)
  FOR v_qid, v_qkey IN SELECT * FROM jsonb_each(v_keys)
  LOOP
    v_weight := COALESCE((v_qkey->>'weight')::numeric, 1);
    v_total_weight := v_total_weight + v_weight;

    SELECT array_agg(value ORDER BY value) INTO v_correct_set
    FROM jsonb_array_elements_text(COALESCE(v_qkey->'correct', '[]'::jsonb));

    SELECT array_agg(value ORDER BY value) INTO v_given_set
    FROM jsonb_array_elements_text(COALESCE(p_answers->v_qid, '[]'::jsonb));

    v_is_correct := COALESCE(v_correct_set, ARRAY[]::text[]) = COALESCE(v_given_set, ARRAY[]::text[]);
    IF v_is_correct THEN
      v_earned_weight := v_earned_weight + v_weight;
    END IF;
    v_per_question := v_per_question || jsonb_build_object(v_qid, v_is_correct);
  END LOOP;

  v_score := CASE WHEN v_total_weight = 0 THEN 0
                  ELSE round(v_earned_weight / v_total_weight * 100, 2) END;
  v_lesson_passed := v_score >= v_pass_threshold;

  INSERT INTO academy_lesson_progress (enrollment_id, lesson_id, status, score, answers)
  VALUES (
    p_enrollment_id, p_lesson_id,
    CASE WHEN v_lesson_passed THEN 'passed' ELSE 'failed' END,
    v_score, p_answers
  )
  ON CONFLICT (enrollment_id, lesson_id) DO UPDATE
  SET status = EXCLUDED.status,
      score = EXCLUDED.score,
      answers = EXCLUDED.answers,
      completed_at = NOW();

  PERFORM _recompute_academy_enrollment(p_enrollment_id);

  RETURN jsonb_build_object(
    'score', v_score,
    'lesson_passed', v_lesson_passed,
    'pass_threshold', v_pass_threshold,
    'per_question', v_per_question
  );
END;
$$;

-- =========================================================================
-- 13. Grants — public RPCs to authenticated only; internals + default PUBLIC
--     grant revoked (mirrors 0018_tighten_security_definer_grants).
-- =========================================================================
REVOKE EXECUTE ON FUNCTION _recompute_academy_enrollment(UUID)        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION _assert_academy_enrollment_owner(UUID)     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION enroll_in_academy_program(TEXT, JSONB, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION complete_academy_reading(UUID, UUID)       FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION grade_academy_quiz(UUID, UUID, JSONB)      FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION enroll_in_academy_program(TEXT, JSONB, TEXT, TEXT) TO authenticated;
GRANT  EXECUTE ON FUNCTION complete_academy_reading(UUID, UUID)       TO authenticated;
GRANT  EXECUTE ON FUNCTION grade_academy_quiz(UUID, UUID, JSONB)      TO authenticated;

-- =========================================================================
-- DONE — migration 0060
-- =========================================================================
