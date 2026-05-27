-- =============================================================================
-- Migration 0040 — Paspor Perantau Global course schema (DRAFT)
--
-- Status: DRAFT — not applied to production. Apply only after the Phase 5 portal
-- v2 launch stabilizes in prod (1-2 weeks observation) and Panji confirms course
-- content + pricing model finalized.
--
-- Tables:
--   paspor_courses                 — one row per country-specific course
--   paspor_modules                 — sub-units within a course
--   paspor_lessons                 — leaf content (video / quiz / flashcard)
--   candidate_paspor_progress      — per-candidate enrolment + overall progress
--   candidate_paspor_lesson_progress — per-lesson completion + quiz scores
--
-- RLS: all tables enable RLS. Course/module/lesson content is publicly readable
-- (active=true). Progress tables are candidate-private (user_id = auth.uid()).
-- Admin role bypasses via existing `is_admin()` function (in 0030_admin_*).
-- =============================================================================

CREATE TABLE IF NOT EXISTS paspor_courses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,                   -- e.g. "paspor-jepang"
  country         text NOT NULL,                          -- DB country slug: japan, saudi_arabia, taiwan, indonesia
  title           text NOT NULL,                          -- "Paspor Perantau Global — Jepang"
  description     text,
  icon            text DEFAULT 'passport',                -- icon name from components/pg/Icon
  duration_hours  numeric(4,1),                           -- estimate "~5 jam"
  language        text DEFAULT 'id',
  price_cents     integer,                                -- IDR rupiah (cents not used; just int)
  active          boolean NOT NULL DEFAULT false,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX paspor_courses_country_active_idx
  ON paspor_courses(country, active) WHERE active = true;

CREATE TABLE IF NOT EXISTS paspor_modules (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       uuid NOT NULL REFERENCES paspor_courses(id) ON DELETE CASCADE,
  module_num      integer NOT NULL,                       -- 1, 2, 3, ...
  title           text NOT NULL,
  description     text,
  duration_minutes integer,                               -- estimate
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, module_num)
);

CREATE INDEX paspor_modules_course_idx ON paspor_modules(course_id, sort_order);

CREATE TABLE IF NOT EXISTS paspor_lessons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id       uuid NOT NULL REFERENCES paspor_modules(id) ON DELETE CASCADE,
  lesson_num      integer NOT NULL,
  title           text NOT NULL,
  -- Lesson content type drives the renderer:
  --   'video'      → external video URL or self-hosted asset
  --   'flashcard'  → JSON array of {front, back}
  --   'quiz'       → JSON array of {question, options[], correct_index, explanation?}
  --   'reading'    → markdown body
  lesson_type     text NOT NULL CHECK (lesson_type IN ('video', 'flashcard', 'quiz', 'reading')),
  duration_minutes integer,
  content         jsonb NOT NULL DEFAULT '{}'::jsonb,    -- shape depends on lesson_type
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, lesson_num)
);

CREATE INDEX paspor_lessons_module_idx ON paspor_lessons(module_id, sort_order);

CREATE TABLE IF NOT EXISTS candidate_paspor_progress (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id    uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  course_id       uuid NOT NULL REFERENCES paspor_courses(id) ON DELETE CASCADE,
  enrolled_at     timestamptz NOT NULL DEFAULT now(),
  -- Overall progress 0-100; cached + refreshed via trigger on lesson_progress
  progress_pct    integer NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  completed_at    timestamptz,
  certificate_id  text,                                   -- generated on completion
  UNIQUE (candidate_id, course_id)
);

CREATE INDEX candidate_paspor_progress_cand_idx
  ON candidate_paspor_progress(candidate_id, completed_at);

CREATE TABLE IF NOT EXISTS candidate_paspor_lesson_progress (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id    uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  lesson_id       uuid NOT NULL REFERENCES paspor_lessons(id) ON DELETE CASCADE,
  completed_at    timestamptz NOT NULL DEFAULT now(),
  score           numeric(5,2),                           -- quiz score 0-100 (NULL for non-quiz)
  UNIQUE (candidate_id, lesson_id)
);

CREATE INDEX candidate_paspor_lesson_progress_cand_idx
  ON candidate_paspor_lesson_progress(candidate_id);

-- RLS: courses + modules + lessons publicly readable when active. Progress
-- private to the candidate (and admin bypass).
ALTER TABLE paspor_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE paspor_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE paspor_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_paspor_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_paspor_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY paspor_courses_read_active ON paspor_courses
  FOR SELECT TO authenticated, anon USING (active = true OR is_admin());

CREATE POLICY paspor_modules_read ON paspor_modules
  FOR SELECT TO authenticated, anon USING (
    EXISTS (SELECT 1 FROM paspor_courses c WHERE c.id = course_id AND (c.active = true OR is_admin()))
  );

CREATE POLICY paspor_lessons_read ON paspor_lessons
  FOR SELECT TO authenticated, anon USING (
    EXISTS (
      SELECT 1 FROM paspor_modules m
      JOIN paspor_courses c ON c.id = m.course_id
      WHERE m.id = module_id AND (c.active = true OR is_admin())
    )
  );

CREATE POLICY candidate_paspor_progress_own ON candidate_paspor_progress
  FOR ALL TO authenticated
  USING (candidate_id = (SELECT id FROM candidates WHERE auth_user_id = auth.uid()) OR is_admin())
  WITH CHECK (candidate_id = (SELECT id FROM candidates WHERE auth_user_id = auth.uid()) OR is_admin());

CREATE POLICY candidate_paspor_lesson_progress_own ON candidate_paspor_lesson_progress
  FOR ALL TO authenticated
  USING (candidate_id = (SELECT id FROM candidates WHERE auth_user_id = auth.uid()) OR is_admin())
  WITH CHECK (candidate_id = (SELECT id FROM candidates WHERE auth_user_id = auth.uid()) OR is_admin());

-- Admin write policies (admin role can manage courses/modules/lessons content)
CREATE POLICY paspor_courses_admin_write ON paspor_courses
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY paspor_modules_admin_write ON paspor_modules
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY paspor_lessons_admin_write ON paspor_lessons
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- updated_at trigger for paspor_courses
CREATE OR REPLACE FUNCTION paspor_courses_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER paspor_courses_updated_at_trigger
  BEFORE UPDATE ON paspor_courses
  FOR EACH ROW EXECUTE FUNCTION paspor_courses_set_updated_at();
