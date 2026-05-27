-- Migration 0053: application_readiness_view becomes qualifying-aware
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-28.
--
-- Before: hard_pass = TRUE if every required field has SOME answer stored.
-- Misleading — a candidate who answered "SSW Belum punya" still showed as
-- hard_pass = TRUE because the field was answered.
--
-- After: hard_pass = TRUE only when each required field's selected option
-- has qualifying = true (or, for multiselect, at least one chosen option
-- is qualifying). Fields whose options don't carry a `qualifying` flag
-- fall back to the legacy presence check (so older positions keep working).
--
-- File fields (document uploads) remain a presence check.

DROP VIEW IF EXISTS application_readiness_view;

CREATE VIEW application_readiness_view AS
SELECT
  a.id           AS application_id,
  a.candidate_id,
  a.position_slug,
  COALESCE(
    (
      SELECT BOOL_AND(field_pass)
      FROM (
        SELECT
          CASE
            -- File fields: presence check only
            WHEN paf.field_type = 'file' AND paf.document_type IS NOT NULL THEN
              EXISTS (
                SELECT 1 FROM candidate_documents cd
                WHERE cd.application_id = a.id
                  AND cd.doc_type = paf.document_type
              )

            -- Multiselect: at least one selected value must be qualifying
            -- (if any option carries a qualifying flag); otherwise fall
            -- back to presence.
            WHEN paf.field_type = 'multiselect' THEN
              CASE
                WHEN EXISTS (
                  SELECT 1 FROM jsonb_array_elements(paf.options) opt
                  WHERE opt ? 'qualifying'
                ) THEN
                  EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements_text(
                      COALESCE(a.answers -> paf.field_key, '[]'::jsonb)
                    ) AS selected(val)
                    JOIN jsonb_array_elements(paf.options) opt
                      ON opt->>'value' = selected.val
                    WHERE COALESCE((opt->>'qualifying')::boolean, false) = true
                  )
                ELSE
                  (a.answers ->> paf.field_key) IS NOT NULL
                  AND (a.answers ->> paf.field_key) NOT IN ('', '[]', 'null')
              END

            -- Single-value (radio/select/text): if options carry a qualifying
            -- flag, the answer must map to a qualifying option. Otherwise
            -- presence check.
            ELSE
              CASE
                WHEN paf.options IS NOT NULL AND EXISTS (
                  SELECT 1 FROM jsonb_array_elements(paf.options) opt
                  WHERE opt ? 'qualifying'
                ) THEN
                  EXISTS (
                    SELECT 1 FROM jsonb_array_elements(paf.options) opt
                    WHERE opt->>'value' = (a.answers ->> paf.field_key)
                      AND COALESCE((opt->>'qualifying')::boolean, false) = true
                  )
                ELSE
                  (a.answers ->> paf.field_key) IS NOT NULL
                  AND (a.answers ->> paf.field_key) NOT IN ('', '[]', 'null')
              END
          END AS field_pass
        FROM position_application_fields paf
        WHERE paf.position_slug = a.position_slug
          AND paf.importance    = 'required'
      ) AS field_checks
    ),
    TRUE  -- no required fields → trivially pass
  ) AS hard_pass
FROM applications a;

COMMENT ON VIEW application_readiness_view IS
  'Per-application hard_pass: TRUE when every required field is satisfied by a QUALIFYING answer (option.qualifying=true) or, for fields without qualifying-tagged options, by any answer / uploaded doc. Replaces presence-only logic from migration 0037.';

REVOKE ALL    ON application_readiness_view FROM PUBLIC;
GRANT  SELECT ON application_readiness_view TO authenticated;
