-- 0069_slot_filled_means_placements.sql
--
-- Fix slot_filled semantics. The old trigger incremented slot_filled the moment an
-- application was LINKED to a job order (i.e. merely pulled into the pipeline at
-- 'screening'), never decremented on reject/exit, and never tied to acceptance. The
-- result was a meaningless capacity meter: 140 slots "filled" across 34 job orders
-- while 0 candidates had ever reached an accepted stage, and the number matched
-- neither placements nor linked-app count.
--
-- New semantics: slot_filled = number of candidates in this job order who have
-- reached an ACCEPTED stage (selected | training | deployed | active) — i.e. real
-- placements against the slot_count target. The trigger now RECOMPUTES the affected
-- job order(s) from scratch on every applications insert/update/delete (the trigger
-- already fires on all of them), which is drift-proof unlike the old +1/-1 counter.
--
-- ACCEPTED_STAGES here MUST stay in sync with lib/applicationStatus.ts.

create or replace function public.update_job_order_slot_filled()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
declare
  accepted text[] := array['selected', 'training', 'deployed', 'active'];
begin
  -- Recompute the NEW job order (insert / update / stage change).
  if tg_op in ('INSERT', 'UPDATE') and new.job_order_id is not null then
    update job_orders jo
      set slot_filled = (
        select count(*) from applications a
        where a.job_order_id = jo.id
          and a.pipeline_stage::text = any(accepted)
      )
      where jo.id = new.job_order_id;
  end if;

  -- Recompute the OLD job order if the application was unlinked or moved away.
  if tg_op in ('UPDATE', 'DELETE') and old.job_order_id is not null
     and old.job_order_id is distinct from coalesce(new.job_order_id, '00000000-0000-0000-0000-000000000000'::uuid) then
    update job_orders jo
      set slot_filled = (
        select count(*) from applications a
        where a.job_order_id = jo.id
          and a.pipeline_stage::text = any(accepted)
      )
      where jo.id = old.job_order_id;
  end if;

  return coalesce(new, old);
end;
$function$;

-- Backfill every job order to the new definition. (Currently resolves all to the
-- true placement count — 0 for now since no application has reached an accepted
-- stage yet; the meter is now honest and will populate as the fixed pipeline UI
-- advances candidates to selected/deployed/active.)
update job_orders jo
  set slot_filled = (
    select count(*) from applications a
    where a.job_order_id = jo.id
      and a.pipeline_stage in ('selected', 'training', 'deployed', 'active')
  );
