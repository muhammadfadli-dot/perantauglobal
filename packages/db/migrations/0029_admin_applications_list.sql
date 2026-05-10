-- =========================================================================
-- MIGRATION 0029: list_applications_for_admin — paginated admin pipeline
-- =========================================================================
-- Backs the admin Lamaran page with a single RPC that:
--   - Joins candidates + positions for display fields
--   - Computes per-row readiness via compute_readiness_v3
--   - Supports filter by stage, position, free-text search (name/phone)
--   - Supports sort by 'newest' (default) or 'readiness'
--   - Returns total_count via window function for pagination
--
-- Replaces the prior pattern of fetching applications + N+1 readiness RPCs
-- from the app layer. One round-trip per page render.
--
-- Security: SECURITY INVOKER — RLS on applications/candidates/positions
-- still applies, so non-admin callers see only their own rows. Admin role
-- bypasses via existing policies (PR #24).
-- =========================================================================

CREATE OR REPLACE FUNCTION public.list_applications_for_admin(
  p_stage    TEXT  DEFAULT NULL,
  p_position TEXT  DEFAULT NULL,
  p_search   TEXT  DEFAULT NULL,
  p_sort     TEXT  DEFAULT 'newest',  -- 'newest' | 'readiness'
  p_limit    INT   DEFAULT 40,
  p_offset   INT   DEFAULT 0
) RETURNS TABLE (
  id                UUID,
  candidate_id      UUID,
  position_slug     TEXT,
  pipeline_stage    pipeline_stage,
  reached_out       BOOLEAN,
  score             INT,
  created_at        TIMESTAMPTZ,
  candidate_name    TEXT,
  candidate_phone   TEXT,
  candidate_city    TEXT,
  position_name     TEXT,
  position_country  TEXT,
  readiness         JSONB,
  total_count       BIGINT
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
      compute_readiness_v3(a.candidate_id, a.position_slug) AS readiness,
      COUNT(*) OVER() AS total_count
    FROM applications a
    LEFT JOIN candidates c ON c.id = a.candidate_id
    LEFT JOIN positions  p ON p.slug = a.position_slug
    WHERE
      (p_stage    IS NULL OR p_stage    = '' OR a.pipeline_stage::text = p_stage)
      AND (p_position IS NULL OR p_position = '' OR a.position_slug    = p_position)
      AND (
        p_search IS NULL OR p_search = ''
        OR c.full_name ILIKE '%' || p_search || '%'
        OR c.phone     ILIKE '%' || p_search || '%'
      )
  )
  SELECT
    id, candidate_id, position_slug, pipeline_stage, reached_out, score, created_at,
    candidate_name, candidate_phone, candidate_city, position_name, position_country,
    readiness, total_count
  FROM filtered
  ORDER BY
    CASE WHEN p_sort = 'readiness' THEN (readiness->>'hard_pass')::boolean END DESC NULLS LAST,
    CASE WHEN p_sort = 'readiness' THEN (readiness->>'score_pct')::int    END DESC NULLS LAST,
    created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$$;

-- Pin search_path (per migration 0019 pattern)
ALTER FUNCTION public.list_applications_for_admin(TEXT, TEXT, TEXT, TEXT, INT, INT)
  SET search_path = public, pg_temp;

-- Restrict execute to authenticated (admins use RLS; anons can't reach admin UI)
REVOKE EXECUTE ON FUNCTION public.list_applications_for_admin(TEXT, TEXT, TEXT, TEXT, INT, INT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.list_applications_for_admin(TEXT, TEXT, TEXT, TEXT, INT, INT) TO authenticated;

-- =========================================================================
-- Stage counts — separate RPC for the summary header
-- =========================================================================
-- Returns map of pipeline_stage -> count, applying the same position/search
-- filters. Stage filter is intentionally ignored so the header always shows
-- the full breakdown for the current position+search context.

CREATE OR REPLACE FUNCTION public.applications_stage_counts(
  p_position TEXT DEFAULT NULL,
  p_search   TEXT DEFAULT NULL
) RETURNS TABLE (
  pipeline_stage pipeline_stage,
  count          BIGINT
)
LANGUAGE sql STABLE AS $$
  SELECT a.pipeline_stage, COUNT(*)::BIGINT AS count
  FROM applications a
  LEFT JOIN candidates c ON c.id = a.candidate_id
  WHERE
    (p_position IS NULL OR p_position = '' OR a.position_slug = p_position)
    AND (
      p_search IS NULL OR p_search = ''
      OR c.full_name ILIKE '%' || p_search || '%'
      OR c.phone     ILIKE '%' || p_search || '%'
    )
  GROUP BY a.pipeline_stage;
$$;

ALTER FUNCTION public.applications_stage_counts(TEXT, TEXT)
  SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.applications_stage_counts(TEXT, TEXT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.applications_stage_counts(TEXT, TEXT) TO authenticated;
