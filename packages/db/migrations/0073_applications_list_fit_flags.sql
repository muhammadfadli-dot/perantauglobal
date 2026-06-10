-- 0073_applications_list_fit_flags.sql
--
-- Audit fix: the applications-list Fit column collapsed all of
-- skipped/error/null/contradiction into a single ambiguous dash and dropped the
-- has_flags warning. Surface `cv_has_flags` + `cv_fit_status` from
-- application_cv_fit so the list can show a flag badge and distinguish "no CV
-- yet" (skipped) from "not graded" (null) from "errored".
--
-- Same body as 0072 + two columns. DROP first (return type changes).

DROP FUNCTION IF EXISTS public.list_applications_for_admin(text, text, text, text, integer, integer);

CREATE OR REPLACE FUNCTION public.list_applications_for_admin(
  p_position text DEFAULT NULL::text,
  p_search   text DEFAULT NULL::text,
  p_sort     text DEFAULT 'newest'::text,
  p_pool     text DEFAULT 'pool'::text,
  p_limit    integer DEFAULT 40,
  p_offset   integer DEFAULT 0
)
RETURNS TABLE(
  id uuid, candidate_id uuid, position_slug text, pipeline_stage pipeline_stage,
  reached_out boolean, score integer, created_at timestamp with time zone,
  candidate_name text, candidate_phone text, candidate_city text,
  position_name text, position_country text, job_order_id uuid,
  job_order_intake_label text, readiness jsonb,
  cv_fit_score integer, cv_fit_status text, cv_has_flags boolean,
  total_count bigint
)
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $function$
  WITH filtered AS (
    SELECT
      a.id, a.candidate_id, a.position_slug, a.pipeline_stage, a.reached_out,
      a.score, a.created_at,
      c.full_name AS candidate_name, c.phone AS candidate_phone, c.city AS candidate_city,
      p.name AS position_name, p.country::text AS position_country,
      a.job_order_id, jo.intake_label AS job_order_intake_label,
      jsonb_build_object(
        'hard_pass', COALESCE(arv.hard_pass, TRUE),
        'score_pct', CASE
          WHEN COALESCE(par.total_fields, 0) = 0 THEN 100
          ELSE ROUND((par.passed_fields::numeric / par.total_fields) * 100)::int
        END,
        'per_field', jsonb_build_object()
      ) AS readiness,
      acvf.fit_score AS cv_fit_score,
      acvf.status    AS cv_fit_status,
      COALESCE(acvf.has_flags, FALSE) AS cv_has_flags,
      COUNT(*) OVER() AS total_count
    FROM applications a
    LEFT JOIN candidates c ON c.id = a.candidate_id
    LEFT JOIN positions  p ON p.slug = a.position_slug
    LEFT JOIN job_orders jo ON jo.id = a.job_order_id
    LEFT JOIN application_readiness_view arv ON arv.application_id = a.id
    LEFT JOIN application_cv_fit acvf ON acvf.application_id = a.id
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS total_fields,
             COUNT(*) FILTER (WHERE satisfied)::int AS passed_fields
      FROM (
        SELECT CASE
            WHEN paf.field_type = 'file' AND paf.document_type IS NOT NULL THEN EXISTS (
              SELECT 1 FROM candidate_documents cd
              WHERE cd.application_id = a.id AND cd.doc_type = paf.document_type)
            ELSE (a.answers ->> paf.field_key) IS NOT NULL
              AND (a.answers ->> paf.field_key) NOT IN ('', '[]', 'null')
          END AS satisfied
        FROM position_application_fields paf
        WHERE paf.position_slug = a.position_slug
      ) per_field
    ) par ON TRUE
    WHERE
      (p_position IS NULL OR p_position = '' OR a.position_slug = p_position)
      AND (
        p_pool = 'all'
        OR (p_pool = 'pool'         AND a.job_order_id IS NULL AND a.pipeline_stage NOT IN ('rejected','exit'))
        OR (p_pool = 'in_job_order' AND a.job_order_id IS NOT NULL)
      )
      AND (
        p_search IS NULL OR p_search = ''
        OR c.full_name ILIKE '%' || p_search || '%'
        OR c.phone     ILIKE '%' || p_search || '%'
      )
  )
  SELECT
    id, candidate_id, position_slug, pipeline_stage, reached_out, score, created_at,
    candidate_name, candidate_phone, candidate_city, position_name, position_country,
    job_order_id, job_order_intake_label, readiness, cv_fit_score, cv_fit_status, cv_has_flags, total_count
  FROM filtered
  ORDER BY
    CASE WHEN p_sort = 'fit'       THEN cv_fit_score                       END DESC NULLS LAST,
    CASE WHEN p_sort = 'readiness' THEN (readiness->>'hard_pass')::boolean END DESC NULLS LAST,
    CASE WHEN p_sort = 'readiness' THEN (readiness->>'score_pct')::int     END DESC NULLS LAST,
    created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$function$;
