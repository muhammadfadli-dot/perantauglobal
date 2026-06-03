-- 0065_drop_audit_backup_tables.sql
--
-- Drop the 2026-06-02 position-audit safety backups.
--
-- Rationale:
--   1. The audited content/qualifying changes have been live and stable since
--      2026-06-02 — the backups have served their purpose.
--   2. Supabase advisor flagged both tables as RLS-disabled (rls_enabled=false),
--      meaning anyone holding the public anon key (embedded in apps/web) could
--      read or modify every row. Dropping them removes the exposure cleanly
--      (enabling RLS without policies would instead just block all access).
--
-- Approved for drop by Panji on 2026-06-03.
DROP TABLE IF EXISTS public._bak_paf_20260602;
DROP TABLE IF EXISTS public._bak_positions_content_20260602;
