-- =========================================================================
-- MIGRATION 0030: lamaran page becomes a talent-pool view
-- =========================================================================
-- Conceptual shift:
--   - applications = talent pool (no pipeline stage display in admin/lamaran)
--   - job_orders   = pipeline tracker (kanban lives here)
--   - admin moves a candidate from pool → job_order, advancing stage
--
-- This migration updates `list_applications_for_admin` to:
--   - Drop the p_stage filter (lamaran page no longer surfaces stages)
--   - Add p_pool filter: 'pool' (default) | 'in_job_order' | 'all'
--   - Return job_order_id + job_order_intake_label so the row can show
--     "currently in [JO name]" when applicable
--
-- The applications.pipeline_stage column itself is NOT touched. Other surfaces
-- (job order kanban, candidate detail, candidate-facing dashboard) continue
-- to read it. Only the lamaran admin page changes its semantics.
-- =========================================================================

-- Drop old signature (return type change).
DROP FUNCTION IF EXISTS public.list_applications_for_admin(TEXT, TEXT, TEXT, TEXT, INT, INT);

CREATE OR REPLACE FUNCTION public.list_applications_for_admin(
  p_position TEXT  DEFAULT NULL,
  p_search   TEXT  DEFAULT NULL,
  p_sort     TEXT  DEFAULT 'newest',  -- 'newest' | 'readiness'
  p_pool     TEXT  DEFAULT 'pool',    -- 'pool' | 'in_job_order' | 'all'
  p_limit    INT   DEFAULT 40,
  p_offset   INT   DEFAULT 0
) RETURNS TABLE (
  id                       UUID,
  candidate_id             UUID,
  position_slug            TEXT,
  pipeline_stage           pipeline_stage,
  reached_out              BOOLEAN,
  score                    INT,
  created_at               TIMESTAMPTZ,
  candidate_name           TEXT,
  candidate_phone          TEXT,
  candidate_city           TEXT,
  position_name            TEXT,
  position_country         TEXT,
  job_order_id             UUID,
  job_order_intake_label   TEXT,
  readiness                JSONB,
  total_count              BIGINT
)
LANGUAGE sql STABLE AS $$
  WITH filtered AS (
    SELECT
      a.id,
      a.candidate_id,
      a.position_slug,
      a.pipeline_stage,
      a.reached_out,
      a.score,
      a.created_at,
      c.full_name AS candidate_name,
      c.phone     AS candidate_phone,
      c.city      AS candidate_city,
      p.name      AS position_name,
      p.country::text AS position_country,
      a.job_order_id,
      jo.intake_label AS job_order_intake_label,
      compute_readiness_v3(a.candidate_id, a.position_slug) AS readiness,
      COUNT(*) OVER() AS total_count
    FROM applications a
    LEFT JOIN candidates c ON c.id = a.candidate_id
    LEFT JOIN positions  p ON p.slug = a.position_slug
    LEFT JOIN job_orders jo ON jo.id = a.job_order_id
    WHERE
      (p_position IS NULL OR p_position = '' OR a.position_slug = p_position)
      AND (
        p_pool = 'all'
        OR (p_pool = 'pool'         AND a.job_order_id IS NULL)
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
    job_order_id, job_order_intake_label, readiness, total_count
  FROM filtered
  ORDER BY
    CASE WHEN p_sort = 'readiness' THEN (readiness->>'hard_pass')::boolean END DESC NULLS LAST,
    CASE WHEN p_sort = 'readiness' THEN (readiness->>'score_pct')::int    END DESC NULLS LAST,
    created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$$;

ALTER FUNCTION public.list_applications_for_admin(TEXT, TEXT, TEXT, TEXT, INT, INT)
  SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.list_applications_for_admin(TEXT, TEXT, TEXT, TEXT, INT, INT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.list_applications_for_admin(TEXT, TEXT, TEXT, TEXT, INT, INT) TO authenticated;

-- applications_stage_counts is no longer used by the lamaran page. Leave it
-- in place in case other surfaces need it; future migration can drop it
-- once we confirm no callers remain.
