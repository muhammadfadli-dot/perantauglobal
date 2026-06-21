-- 0085_academy_module_intro_and_quiz_rationale.sql
-- Akademi learning-experience redesign (passport metaphor). Two additive changes:
--   1. academy_modules.content JSONB — drives the new "Intro Modul" screen
--      ({ outcomes: text[], est_minutes: int }). module.summary already exists for
--      the one-liner; this adds the "what you'll be able to do" + duration.
--   2. grade_academy_quiz now also returns `feedback` — per WRONG question, the
--      rationale for each option the candidate ACTUALLY PICKED (from the admin-only
--      keys jsonb). This powers the "⚠ Pikir lagi" per-option explanation on a
--      failed quiz WITHOUT ever revealing the correct answer (only picked options
--      get a rationale; correct answers are never marked) — so retry stays
--      meaningful. Rationale is OPTIONAL: keys without a `rationale` map → empty
--      feedback, so existing quizzes (free finansial course) keep working.
-- Additive + re-runnable. Reading "chunk"/"media"/"anchor" need NO DDL — they are
-- conventions inside the existing academy_lessons.content.blocks[] jsonb.

BEGIN;

-- 1. Module intro content -----------------------------------------------------
ALTER TABLE academy_modules
  ADD COLUMN IF NOT EXISTS content JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. grade_academy_quiz: add per-option rationale feedback for wrong picks ----
CREATE OR REPLACE FUNCTION public.grade_academy_quiz(
  p_enrollment_id uuid,
  p_lesson_id uuid,
  p_answers jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  v_feedback       JSONB := '{}'::jsonb;
  v_rationale_all  JSONB;
  v_rationale_pick JSONB;
  v_pick           TEXT;
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
    ELSE
      -- Build feedback for THIS wrong question: only the rationale for options the
      -- candidate actually picked that are NOT correct. Never reveals the correct
      -- option (we only echo back the learner's own wrong choices).
      v_rationale_all  := v_qkey->'rationale';
      v_rationale_pick := '{}'::jsonb;
      IF v_rationale_all IS NOT NULL AND jsonb_typeof(v_rationale_all) = 'object' THEN
        FOREACH v_pick IN ARRAY COALESCE(v_given_set, ARRAY[]::text[])
        LOOP
          IF NOT (v_pick = ANY (COALESCE(v_correct_set, ARRAY[]::text[])))
             AND v_rationale_all ? v_pick THEN
            v_rationale_pick := v_rationale_pick
              || jsonb_build_object(v_pick, v_rationale_all->v_pick);
          END IF;
        END LOOP;
      END IF;
      v_feedback := v_feedback || jsonb_build_object(
        v_qid,
        jsonb_build_object(
          'rationale', v_rationale_pick,
          'reread_anchor', v_qkey->'reread_anchor'
        )
      );
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
    'per_question', v_per_question,
    'feedback', v_feedback
  );
END;
$function$;

COMMIT;
