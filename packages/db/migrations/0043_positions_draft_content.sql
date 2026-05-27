-- Migration 0043: positions.draft_content + published_at
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-27.
--
-- Real draft/publish model for the Position Editor (matches design C from
-- ~/Downloads/web redesign perantau global (1)/admin-editor-c.jsx).
--
-- Before:
--   positions.content is the canonical live JSONB blob. Edits go straight to
--   it; there is no concept of a pending draft. The "publish" toggle is just
--   positions.active flipping false→true.
--
-- After:
--   positions.content stays as the LIVE canonical (read by /lowongan).
--   positions.draft_content holds the WORKING DRAFT (nullable; null = no
--     pending changes, draft is in sync with live).
--   positions.published_at tracks last draft → live promotion.
--   positions.active stays as the "is this position visible on /lowongan?"
--     flag; it's orthogonal to draft/publish.
--
-- Editor workflow becomes:
--   1. Admin types into editor → debounced save to draft_content
--   2. PublishBar shows "Draft tersimpan X · live versi <date>"
--   3. Admin clicks "Publish ke live" → server copies draft_content → content,
--      sets published_at = now(), clears draft_content (back in sync)
--   4. Admin clicks "Discard draft" → server clears draft_content

alter table positions
  add column draft_content jsonb,
  add column published_at timestamptz;

-- Backfill: positions that are currently live get a sensible "first
-- published" timestamp = their updated_at. Inactive positions get null
-- (they were never live, so there's no last-published moment).
update positions
   set published_at = updated_at
 where active = true;

comment on column positions.draft_content is
  'Working draft JSONB. NULL = no pending changes (draft is in sync with content). Set by editor auto-save; cleared when admin publishes or discards.';
comment on column positions.published_at is
  'Timestamp of last successful publish (draft_content → content). NULL = never published.';
