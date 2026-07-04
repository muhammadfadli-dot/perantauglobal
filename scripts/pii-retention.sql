-- PII retention for pending_submissions — audit 2026-07-04, task F0-6.
--
-- STATUS: NOT run by the autonomous session — the Claude Code classifier
-- (correctly) blocks unattended bulk DELETE of production PII. Review the
-- retention window below, then run this in your own psql / Supabase SQL session.
--
-- Why:
--   pending_submissions stages form PII (name, WhatsApp, DOB, city) until the
--   magic-link email is confirmed. On confirm, handle_new_auth_user materializes
--   the data into `candidates` and sets consumed_at. After that the staged copy
--   is either redundant (consumed → canonical data lives in candidates) or
--   abandoned (never confirmed → a non-customer's PII with no remaining purpose).
--   PDP UU 27/2022 data-minimization: don't retain it indefinitely.
--
-- Safety:
--   consents.pending_id FK is ON DELETE SET NULL, so purging keeps the consent
--   audit rows (their candidate_id is already linked on materialize). No app path
--   reads consumed pending rows (verified via grep 2026-07-05).
--
-- Snapshot at audit time (2026-07-05): 1503 total; 851 older than 30 days
--   (499 consumed + 352 abandoned). Adjust the interval to your policy.

-- ── 1) One-time backlog purge (retention = 30 days) ──────────────────────────
delete from public.pending_submissions
where created_at < now() - interval '30 days';

-- ── 2) Ongoing schedule ──────────────────────────────────────────────────────
-- Option A (DB-native — pg_cron is AVAILABLE on this project, just not yet
-- installed). Recommended for a pure-SQL purge. Runs 02:23 WIB daily.
--
--   create extension if not exists pg_cron;
--   select cron.schedule(
--     'purge-old-pending-submissions',
--     '23 19 * * *',
--     $$delete from public.pending_submissions where created_at < now() - interval '30 days'$$
--   );
--
-- Option B (matches the existing cv-purge-orphans pattern): a GitHub Action that
-- calls a SECURITY DEFINER RPC gated by a repo secret. More moving parts, but
-- keeps every scheduler visible in the Actions tab. Use if you prefer that.
