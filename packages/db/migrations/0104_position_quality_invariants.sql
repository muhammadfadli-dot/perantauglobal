-- 0104_position_quality_invariants.sql
-- Fase 2 of the position-flow audit - ENFORCING invariants.
--
-- Applied at ROLLOUT together with the app code that surfaces friendly errors
-- before these raw DB errors (RC4/E1/E3/B4/A2 permanent closure). Every clause
-- was validated against live data on 2026-07-15 (see the audit project memo):
--   * 0 positions have an off-registry country            -> country FK is safe
--   * scoring/pipeline are '{}' in every row               -> safe to drop
--   * barista + heavy-diesel each have 2 open JOs           -> consolidated below
--     before the "one open JO per position" unique index
--   * 10 active positions lack effective screening          -> GRANDFATHERED: the
--     activation trigger guards only the transition INTO active, never touches
--     rows that are already active, so those 10 stay live until their screening
--     is fixed (they cannot, however, be re-activated after a deactivation).

begin;

-- ── 1) Activation invariant trigger ─────────────────────────────────────────
-- The app guard in updatePositionMeta already refuses to activate an unready
-- position, but it can be bypassed via raw SQL / service-role / seed scripts -
-- exactly how the machine-operator leak (0074) happened. Push the invariant to
-- the DB so NO write path can create a live-but-unready position.
--
-- Fires on the moment of activation only:
--   * INSERT with active=true            -> always rejected. A brand-new slug has
--     no application fields yet (they FK to positions.slug), so it can never
--     have screening; an active-at-birth row is the leak. Forces the correct
--     draft -> publish -> activate flow (createPosition already inserts active=false).
--   * UPDATE false -> true               -> requires published_at + non-empty
--     content + effective screening.
--   * UPDATE true -> true (any edit to a live row) -> untouched (grandfathered).
create or replace function public.enforce_position_activation_invariant()
returns trigger
language plpgsql
as $$
begin
  if new.active = true
     and (tg_op = 'INSERT' or coalesce(old.active, false) = false) then

    if tg_op = 'INSERT' then
      raise exception
        'Posisi baru harus dibuat sebagai draft (active=false), lalu diaktifkan setelah publish + screening'
        using errcode = 'check_violation';
    end if;

    if new.published_at is null then
      raise exception 'Tidak bisa aktifkan %: belum pernah dipublish', new.slug
        using errcode = 'check_violation';
    end if;

    if new.content is null or new.content = '{}'::jsonb then
      raise exception 'Tidak bisa aktifkan %: konten masih kosong', new.slug
        using errcode = 'check_violation';
    end if;

    if not public.position_has_effective_screening(new.slug) then
      raise exception
        'Tidak bisa aktifkan %: belum ada pertanyaan screening yang menyaring (butuh >=1 pertanyaan wajib dengan opsi Lolos)', new.slug
        using errcode = 'check_violation';
    end if;

  end if;
  return new;
end;
$$;

drop trigger if exists trg_position_activation_invariant on public.positions;
create trigger trg_position_activation_invariant
  before insert or update on public.positions
  for each row
  execute function public.enforce_position_activation_invariant();

-- ── 2) Country referential integrity (deferred from 0101 by design) ─────────
-- positions.country was free text; an unknown value silently 404s the public
-- landing page (A2). Validated: 0 current rows violate. ON UPDATE CASCADE keeps
-- positions in sync if a country's db_value is ever renamed; ON DELETE RESTRICT
-- refuses to delete a country that still has positions.
alter table public.positions
  add constraint positions_country_fk
  foreign key (country) references public.countries (db_value)
  on update cascade on delete restrict;

-- ── 3) One open job order per position ──────────────────────────────────────
-- The web renders only the most-recent open JO per position, so duplicate open
-- JOs are pure noise (B4). First consolidate the known duplicates by keeping the
-- newest open JO per position and closing the rest (zero public effect - the
-- older ones were already being ignored by the render), then enforce structurally.
with ranked as (
  select id,
         row_number() over (
           partition by position_slug
           order by created_at desc, id desc
         ) as rn
  from public.job_orders
  where status = 'open'
)
update public.job_orders j
set status = 'closed'
from ranked r
where j.id = r.id
  and r.rn > 1;

-- Replace the non-unique partial index (position_slug, deadline) WHERE open with
-- a UNIQUE one on position_slug WHERE open. Still supports the web's
-- status=open + position_slug lookup; now also forbids a second open JO.
drop index if exists public.idx_job_orders_open_active;
create unique index idx_job_orders_one_open_per_position
  on public.job_orders (position_slug)
  where status = 'open';

-- ── 4) Tighten paf_anon_read to active positions only ───────────────────────
-- Screening questions of draft / inactive positions shouldn't be world-readable
-- (E5). The candidate apply flow only reaches fields of ACTIVE positions (web +
-- portal both block inactive), and admin reads via service-role, so this removes
-- exposure with no functional regression.
drop policy if exists paf_anon_read on public.position_application_fields;
create policy paf_anon_read
  on public.position_application_fields
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.positions p
      where p.slug = position_slug and p.active
    )
  );

-- ── 5) Drop dead columns ────────────────────────────────────────────────────
-- positions.scoring + positions.pipeline are NOT NULL jsonb seeded '{}' and read
-- by nothing (E6) - they imply a per-position scoring/pipeline config that never
-- existed. Validated: 0 rows carry a non-'{}' value. (The generated types are
-- updated in the same PR.)
alter table public.positions drop column if exists scoring;
alter table public.positions drop column if exists pipeline;

commit;
