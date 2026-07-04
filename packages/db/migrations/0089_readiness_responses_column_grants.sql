-- 0089: Hide sensitive columns of readiness_responses from anon/authenticated reads.
--
-- The public /cek-kesiapan/live event board reads only
--   id, name, persona, sector_interest, created_at  (filtered by session_key).
-- But the row policy "readiness anon read" is USING (true) and anon held a
-- broad table-level SELECT grant, so anyone with the public anon key could also
-- read the self-assessment answers (q1..q6) and the computed score of every
-- submission via /rest/v1/readiness_responses?select=*.
--
-- Replace the table-wide SELECT grant with column-level SELECT on only the
-- board columns. `answers` and `score` are no longer readable through the API.
-- INSERT (the form submit) is unaffected; service_role keeps full access.

revoke select on public.readiness_responses from anon, authenticated;

grant select (id, name, persona, sector_interest, created_at, session_key)
  on public.readiness_responses to anon, authenticated;
