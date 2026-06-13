-- Migration 0077: application_completeness_view — candidate-facing "is there
-- anything left for the candidate to do?" signal. PRESENCE-based, NOT qualifying.
--
-- Why this exists SEPARATELY from application_readiness_view:
--
--   application_readiness_view.hard_pass is QUALIFYING-aware — it answers the
--   ADMIN question "does this candidate meet the hard gate?". An honest
--   "Belum punya SSW" / "Belum belajar bahasa Jepang" correctly yields
--   hard_pass = FALSE, forever (that's the whole point of the qualifying flag).
--
--   The bug: the CANDIDATE-facing surfaces (dashboard S2/S3, /lengkapi, lamaran
--   detail, welcome) were ALSO keyed off hard_pass. So a candidate who answered
--   every required field HONESTLY but doesn't qualify was parked on
--   "Lengkapi syarat lamaran" forever — nothing left to fill, no way out, and an
--   implicit nudge to lie (pick the qualifying option) just to clear the screen.
--   As of 2026-06-13 this hit 234 applications that had answered everything and
--   561 total stuck in the "belum lengkap" state.
--
--   This view answers the CANDIDATE question instead: "have you ANSWERED every
--   required field?" (presence). Once all required fields are filled, the
--   candidate is done from their side → the app leaves the "lengkapi" state.
--   Admin still triages real eligibility via application_readiness_view.hard_pass.
--
-- Mirrors application_readiness_view's shape + security posture (migration 0056):
-- security_invoker = true so RLS on the underlying tables is honoured; granted to
-- authenticated only (never anon — same IDOR/PII-enumeration concern as 0056).

CREATE VIEW application_completeness_view
WITH (security_invoker = true)
AS
SELECT
  a.id            AS application_id,
  a.candidate_id,
  a.position_slug,
  COALESCE(
    (
      SELECT BOOL_AND(field_filled)
      FROM (
        SELECT
          CASE
            -- File fields: a document of the matching type is linked to this app.
            WHEN paf.field_type = 'file' AND paf.document_type IS NOT NULL THEN
              EXISTS (
                SELECT 1 FROM candidate_documents cd
                WHERE cd.application_id = a.id
                  AND cd.doc_type = paf.document_type
              )
            -- Everything else: a non-empty answer exists. PRESENCE only — we do
            -- NOT look at the option's `qualifying` flag here (that's hard_pass).
            ELSE
              (a.answers ->> paf.field_key) IS NOT NULL
              AND (a.answers ->> paf.field_key) NOT IN ('', '[]', 'null')
          END AS field_filled
        FROM position_application_fields paf
        WHERE paf.position_slug = a.position_slug
          AND paf.importance    = 'required'
      ) AS field_checks
    ),
    TRUE  -- no required fields → trivially complete
  ) AS all_required_filled
FROM applications a;

COMMENT ON VIEW application_completeness_view IS
  'Candidate-facing presence check: all_required_filled = every REQUIRED '
  'position_application_field has an answer/doc. NOT qualifying-aware (that is '
  'application_readiness_view.hard_pass, admin-only). Drives dashboard S2/S3, '
  '/lengkapi, and lamaran detail so an answered-but-non-qualifying candidate is '
  'shown "diproses" instead of being dead-ended on "Lengkapi syarat lamaran".';

REVOKE ALL    ON application_completeness_view FROM PUBLIC;
REVOKE ALL    ON application_completeness_view FROM anon;
GRANT  SELECT ON application_completeness_view TO authenticated;
