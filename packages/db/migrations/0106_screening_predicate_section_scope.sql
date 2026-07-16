-- 0106 scope the screening predicate to the section the apply form actually asks.
--
-- Bug this closes (found 2026-07-16 while mapping DTG's email backlog):
-- position_has_effective_screening (0103) counted a qualifying field in ANY
-- section. But the public apply form only renders section='syarat_utama'
-- (apps/web positions-db.ts fetchAppliedFields). 'kualifikasi' fields are asked
-- much later, in the candidate portal's "lengkapi" step.
--
-- So a position whose only qualifying field sat in 'kualifikasi' was reported as
-- screening by the DB, the activation trigger, and the admin readiness panel —
-- while its actual apply form asked nothing and passed every applicant. That is
-- finding C1 (the machine-operator leak) surviving inside the very guard written
-- to prevent it.
--
-- Live example: trainee-technicians-kuwait — active, 0 syarat_utama fields, one
-- required+qualifying field in 'kualifikasi'. Reported "screens". Screened nobody.
--
-- Root cause, for the record: BOTH the server action (createApplicationField)
-- and the editor's add-field control default section to 'kualifikasi', so a
-- screening question lands in the wrong place unless a human remembers to move
-- it. Those defaults are flipped to 'syarat_utama' in the same change.
--
-- Blast radius measured before applying: exactly ONE position flips
-- (trainee-technicians-kuwait, true -> false). Every other position's answer is
-- unchanged, so this cannot silently strand anything. The activation trigger
-- only guards the false->true transition, so no live position is deactivated by
-- this; the already-active one simply starts telling the truth in the panel.

create or replace function public.position_has_effective_screening(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from position_application_fields f
    where f.position_slug = p_slug
      -- The apply form renders ONLY this section. A qualifying field anywhere
      -- else is a real question, but not one that gates the application, which
      -- is what this predicate claims to measure.
      and f.section = 'syarat_utama'
      and f.importance = 'required'
      and f.options is not null
      and exists (
        select 1
        from jsonb_array_elements(f.options) o
        where coalesce((o ->> 'qualifying')::boolean, false) = true
      )
  );
$function$;

comment on function public.position_has_effective_screening(text) is
  'Fase 2 (0103), section-scoped in 0106: true iff the position has >=1 required, choice-typed field in section=syarat_utama with an option flagged qualifying:true. Scoped to syarat_utama because that is the only section the public apply form renders - a qualifying field in kualifikasi/screening is asked later and gates nothing at apply time.';

-- Close the last mouth of the same trap. The app-level defaults (server action +
-- editor) now point at syarat_utama, but the COLUMN default still said
-- kualifikasi (0031), so any raw INSERT that omits section - a script, a psql
-- session, a future seeder - would keep parking screening questions where the
-- apply form never renders them. Fixing only the app would leave the bug alive
-- on the path nobody watches.
--
-- Existing rows are untouched: a column default only applies to inserts that
-- omit the column.
alter table public.position_application_fields
  alter column section set default 'syarat_utama';

comment on column public.position_application_fields.section is
  'When the question is asked. syarat_utama = the public apply form (the only section apps/web renders, and the one the screening predicate counts). kualifikasi = later, in the portal "lengkapi" step. screening = later still. Default flipped from kualifikasi to syarat_utama in 0106: the old default silently parked screening questions outside the apply form.';
