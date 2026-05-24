-- =========================================================================
-- MIGRATION 0032: positions.content JSONB (landing page body)
-- =========================================================================
-- Moves landing-page body (jobDescription, details, benefits, qualifications,
-- fee, process, trustSignals) from hardcoded apps/web/src/lib/positionDetails.ts
-- into the DB so admins can author + edit without engineer involvement.
--
-- Shape (TypeScript-mirrored):
--   {
--     hero?: { metaLine?: string },
--     jobDescription?: string[],
--     details?: Array<{ label: string, value: string }>,
--     benefits?: Array<{ icon: string, label: string, value: string }>,
--     qualifications?: string[],
--     fee?: { amount: string, breakdown?: string[], note?: string },
--     process?: string[],
--     trustSignals?: {
--       pic?: { name: string, photo?: string, wa?: string, role?: string },
--       employer?: { name?: string, verified?: boolean, bp2miLicense?: string, photo?: string }
--     }
--   }
--
-- Schema version is implicit (positions.profile_schema_version is for
-- candidate profile, not content). If content shape evolves, embed
-- "schema_version" key in JSONB itself.
-- =========================================================================

ALTER TABLE positions
  ADD COLUMN IF NOT EXISTS content JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN positions.content IS
  'Landing page body authored by admin. Shape: { hero, jobDescription, details, benefits, qualifications, fee, process, trustSignals }. Read by apps/web /lowongan/[slug] with fallback to positionDetails.ts during transition.';

-- Size guard — same convention as candidates.profile_data
ALTER TABLE positions
  ADD CONSTRAINT positions_content_size CHECK (pg_column_size(content) < 100000);

-- =========================================================================
-- DONE — migration 0032
-- =========================================================================
-- Backfill from positionDetails.ts runs as separate Node script
-- (packages/db/scripts/backfill-position-content.ts) per slug — keeps SQL
-- file dependency-free.
-- =========================================================================
