-- 0126_scalar_guard_remaining_callers.sql
--
-- Menutup tiga lubang tersisa yang bentuknya PERSIS sama dengan bug yang
-- mematikan halaman Lamaran (migrasi 0122): jsonb_array_elements / 
-- jsonb_array_elements_text / jsonb_object_keys dipanggil di atas nilai yang
-- bentuknya belum dipastikan, dengan penjaga yang tidak menjaga apa-apa.
--
-- Ditemukan lewat sapuan menyeluruh seluruh schema public sesudah 0122, bukan
-- lewat laporan. Ketiganya belum pernah meledak di produksi. Itu justru
-- alasannya diperbaiki sekarang: bug pertama juga belum pernah meledak selama
-- enam minggu, sampai satu sesi edit rutin di admin membuatnya meledak dan
-- menghentikan pekerjaan satu tim.
--
-- Pola salah yang berulang, ditulis di sini supaya gampang dikenali lain kali:
--
--   COALESCE(x, '[]'::jsonb)   -- cuma menangkap SQL NULL
--   x IS NOT NULL              -- JSON null lolos
--
-- Keduanya BUKAN penjaga bentuk. Penjaganya jsonb_typeof(x) = 'array', yang
-- sejak 0122 tersedia sebagai public.jsonb_is_array(x).
--
-- ---------------------------------------------------------------------------
-- 1. grade_academy_quiz  (paling mendesak dari ketiganya)
-- ---------------------------------------------------------------------------
-- p_answers datang LANGSUNG dari browser peserta akademi. Fungsi ini memanggil
--
--   jsonb_array_elements_text(COALESCE(p_answers->v_qid, '[]'::jsonb))
--
-- sehingga satu peserta yang mengirim {"q1": "a"} alih-alih {"q1": ["a"]} sudah
-- cukup membuat penilaian kuisnya gagal dengan error 22023. Jalur ini juga
-- SECURITY DEFINER dan EXECUTE-nya terbuka ke role authenticated.
--
-- Tempat kedua, COALESCE(v_qkey->'correct', ...), membaca kunci jawaban yang
-- ditulis admin. Belum ada baris yang salah bentuk hari ini (9 dari 9 kunci
-- sudah array), tapi tidak ada satu pun constraint yang menjaminnya tetap
-- begitu.
--
-- Perubahannya sengaja sekecil mungkin: DUA baris, keduanya diganti panggilan
-- ke helper baru di bawah. Sisa fungsi disalin apa adanya secara programatik
-- dari definisi yang berlaku (migrasi 0085), tidak diketik ulang.

CREATE OR REPLACE FUNCTION public.jsonb_text_array(p_value jsonb)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT CASE
    WHEN p_value IS NULL                  THEN ARRAY[]::text[]
    WHEN jsonb_typeof(p_value) = 'null'   THEN ARRAY[]::text[]
    WHEN jsonb_typeof(p_value) = 'array'  THEN
      COALESCE((SELECT array_agg(v ORDER BY v) FROM jsonb_array_elements_text(p_value) v), ARRAY[]::text[])
    WHEN jsonb_typeof(p_value) = 'object' THEN ARRAY[]::text[]
    -- scalar: perlakukan sebagai satu pilihan tunggal, bukan error
    ELSE ARRAY[p_value #>> '{}']
  END;
$$;

COMMENT ON FUNCTION public.jsonb_text_array(jsonb) IS
  'Mengubah nilai jsonb apa pun jadi text[] tanpa pernah melempar. Array jadi elemennya (terurut), scalar jadi array satu elemen, NULL / JSON null / object jadi array kosong. Pengganti aman untuk jsonb_array_elements_text(COALESCE(x, ''[]'')), yang meledak pada JSON scalar.';

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

    v_correct_set := public.jsonb_text_array(v_qkey->'correct');

    v_given_set   := public.jsonb_text_array(p_answers->v_qid);

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

-- ---------------------------------------------------------------------------
-- 2. position_has_effective_screening
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER, EXECUTE terbuka ke anon dan authenticated, dan dipanggil
-- invariant aktivasi posisi (migrasi 0104). Kalau meledak, yang gagal bukan cuma
-- satu halaman melainkan kemampuan mengaktifkan posisi. Penjaganya cuma
-- `f.options is not null`. Sama persis dengan bug 0122.
--
-- Selain penjaga, search_path juga dikunci: fungsi SECURITY DEFINER tanpa
-- search_path tetap adalah lubang, dan yang ini berjalan dengan hak pemilik.

CREATE OR REPLACE FUNCTION public.position_has_effective_screening(p_slug text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  select exists (
    select 1
    from position_application_fields f
    where f.position_slug = p_slug
      and f.section = 'syarat_utama'
      and f.importance = 'required'
      and public.jsonb_is_array(f.options)
      and exists (
        select 1
        from jsonb_array_elements(f.options) o
        where coalesce((o ->> 'qualifying')::boolean, false) = true
      )
  );
$function$;

-- ---------------------------------------------------------------------------
-- 3. dtg_reject_unknown_keys
-- ---------------------------------------------------------------------------
-- Dipakai lima RPC tulis tim DTG (migrasi 0118) sebagai validator payload.
-- jsonb_object_keys melempar "cannot call jsonb_object_keys on a scalar" kalau
-- payload-nya bukan object. Ironisnya ini FUNGSI VALIDASI: seharusnya ia
-- menolak dengan pesan jelas, bukan pecah dengan error internal. Sekarang
-- payload yang bukan object ditolak sebagai kesalahan input biasa.

CREATE OR REPLACE FUNCTION public.dtg_reject_unknown_keys(p jsonb, p_allowed text[])
RETURNS void
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_bad text;
begin
  if p is null then
    return;
  end if;

  if jsonb_typeof(p) <> 'object' then
    raise exception 'Payload harus berupa object, bukan %', jsonb_typeof(p)
      using errcode = '22023';
  end if;

  select string_agg(k, ', ' order by k) into v_bad
  from jsonb_object_keys(p) k
  where k <> all (p_allowed);

  if v_bad is not null then
    raise exception 'Field tidak dikenal: %. Yang diterima: %', v_bad, array_to_string(p_allowed, ', ')
      using errcode = '22023';
  end if;
end;
$function$;
