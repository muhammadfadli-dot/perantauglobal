-- 0118_dtg_team_write_tier.sql
-- Tier TULIS ber-audit untuk agent (Codex) tim DTG. Lanjutan dari 0117 (tier baca).
--
-- LATAR: sesi kerja 28 Jul 2026 mengukur bahwa memperbarui status di aplikasi butuh
--   7 langkah lebih dari satu menit, sementara di spreadsheet 5 langkah sekitar 15 detik.
--   Akibatnya orang memilih spreadsheet, dan data aplikasi jadi tertinggal. Tier ini
--   memberi jalur ketiga yang lebih cepat dari keduanya, tanpa mengorbankan jejak.
--
-- KENAPA RPC, BUKAN GRANT LANGSUNG KE TABEL:
--   `grant update on applications` berarti satu perintah tanpa WHERE bisa mengubah 2.114
--   baris sekaligus. Agent yang salah menyusun query bisa melakukannya tanpa niat buruk.
--   Semua fungsi di bawah bekerja SATU BARIS PER PANGGILAN, dikunci lewat primary key.
--   Mass update secara struktural mustahil, bukan sekadar dilarang di dokumen.
--
-- KENAPA TIDAK MENAMBAH KEWENANGAN:
--   keenam orang ini sudah terdaftar di admin_users, artinya lewat aplikasi admin mereka
--   sudah bisa menulis semua ini. Yang berubah cuma kecepatan jalurnya. Yang dibatasi di
--   sini adalah AGENT-nya, bukan orangnya.
--
-- JEJAK: tiap panggilan menulis satu baris ke admin_audit_log atas nama auth user orangnya
--   (bukan nama role database), jadi riwayat dari Codex dan dari aplikasi admin bercampur
--   di satu tempat dan bisa dibaca berurutan. Perpindahan tahap juga tetap tercatat di
--   application_status_history lewat trigger yang sudah ada, karena fungsi ini mengisi
--   reviewed_by dengan auth user orang yang memanggil.
--
-- TIDAK ADA DELETE di seluruh berkas ini. Yang perlu "dihapus" dinonaktifkan lewat status,
--   kecuali satu pengecualian yang dijelaskan di tempatnya (field screening).
--
-- PASSWORD tidak ada di berkas ini. Berkas ini masuk git.

-- ---------------------------------------------------------------------------
-- 1. Peta identitas: role database -> manusia + auth user
-- ---------------------------------------------------------------------------
-- Tanpa tabel ini, tulisan dari Codex akan tercatat sebagai "ro_zalfa" dan terputus dari
-- riwayat aplikasi. Dengan tabel ini, tercatat sebagai orangnya.

create table if not exists public.dtg_agent_identity (
  db_role      name        primary key,
  auth_user_id uuid        not null,
  email        text        not null,
  display_name text        not null,
  created_at   timestamptz not null default now()
);

comment on table public.dtg_agent_identity is
  'Peta role login database ke auth user, supaya tulisan lewat agent tercatat atas nama orangnya di admin_audit_log.';

alter table public.dtg_agent_identity enable row level security;

-- Data ini berisi email dan auth user id, jadi tidak boleh terjangkau publik.
revoke all on public.dtg_agent_identity from public;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on public.dtg_agent_identity from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on public.dtg_agent_identity from authenticated';
  end if;
end $$;

grant select on public.dtg_agent_identity to dtg_ro;

drop policy if exists dtg_ro_read on public.dtg_agent_identity;
create policy dtg_ro_read on public.dtg_agent_identity
  for select to dtg_ro using (true);

insert into public.dtg_agent_identity (db_role, auth_user_id, email, display_name) values
  ('ro_martin', 'ef92960b-b2fe-46c3-a915-f4a378d78081', 'martin.william@dayalima.id',    'Martin William'),
  ('ro_zalfa',  '848588d5-00f1-45e2-82f6-c9c5e537a07a', 'zalfa.salsabilla@dayalima.id',  'Zalfa Salsabilla Widdy'),
  ('ro_ifa',    '8ddee226-7f4f-4c5d-a5eb-5bb881656cd0', 'siti.lathifah@dayalima.id',     'Siti Nur Lathifah'),
  ('ro_ririn',  '7b2ea703-b129-4ccf-8381-f0c58557d1c2', 'libriena.iskandar@dayalima.id', 'Libriena Iskandar'),
  ('ro_indria', '5a6983d0-708d-48e6-90fa-37da314cbc70', 'indria.dwiyana@dayalima.id',    'Indria Dwiyana'),
  ('ro_ai',     '9abaf155-f6f4-48cd-ad1b-c0c29b17dcd1', 'ai.lestari@dayalima.id',        'Ai Ingga Lestari')
on conflict (db_role) do update
  set auth_user_id = excluded.auth_user_id,
      email        = excluded.email,
      display_name = excluded.display_name;

-- ---------------------------------------------------------------------------
-- 2. Kapabilitas sebagai group role
-- ---------------------------------------------------------------------------
-- Satu kapabilitas = satu pintu. Menambah atau mencabut hak seseorang cukup satu baris
-- GRANT atau REVOKE, tanpa menyentuh fungsi apa pun.

do $$
declare r text;
begin
  foreach r in array array[
    'dtg_rw_funnel',     -- tahap kandidat, penanda outreach, catatan, penempatan ke Job Order
    'dtg_rw_interview',  -- jadwal interview
    'dtg_rw_joborder',   -- pesanan employer
    'dtg_rw_referral',   -- agen dan kode referral
    'dtg_rw_screening'   -- pertanyaan penyaring di form posisi
  ] loop
    if not exists (select 1 from pg_roles where rolname = r) then
      execute format('create role %I nologin', r);
    end if;
  end loop;
end $$;

-- Kapabilitas butuh USAGE schema public untuk bisa memanggil fungsi di dalamnya.
grant usage on schema public to
  dtg_rw_funnel, dtg_rw_interview, dtg_rw_joborder, dtg_rw_referral, dtg_rw_screening;

-- ---------------------------------------------------------------------------
-- 3. Penolong: siapa yang memanggil, apakah dia berhak, dan bagaimana mencatatnya
-- ---------------------------------------------------------------------------

-- Menentukan pemanggil. Di produksi tiap orang konek dengan kredensial pribadi, jadi
-- session_user sudah cukup. Parameter p_as_role ada supaya perilaku fungsi ini bisa
-- DIUJI dari sesi operator platform; parameter itu ditolak keras untuk role biasa.
-- Ini bukan lubang: role operator sudah punya BYPASSRLS, jadi dia memang bisa apa saja.
create or replace function public.dtg_actor(p_as_role text default null)
returns public.dtg_agent_identity
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $$
declare
  v_role     name;
  v_operator boolean;
  v_row      public.dtg_agent_identity;
begin
  select exists (
    select 1 from pg_roles r
    where r.rolname = session_user and (r.rolsuper or r.rolbypassrls)
  ) into v_operator;

  if p_as_role is not null and p_as_role <> '' then
    if not v_operator then
      raise exception 'Parameter _as_role hanya boleh dipakai sesi operator platform'
        using errcode = '42501';
    end if;
    v_role := p_as_role::name;
  else
    v_role := session_user;
  end if;

  select * into v_row from public.dtg_agent_identity i where i.db_role = v_role;

  if not found then
    raise exception 'Role % tidak terdaftar sebagai agent tim DTG. Sambungan harus memakai kredensial pribadi.', v_role
      using errcode = '28000';
  end if;

  return v_row;
end;
$$;

create or replace function public.dtg_require_capability(p_role name, p_capability text)
returns void
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $$
begin
  if not exists (select 1 from pg_roles where rolname = p_capability) then
    raise exception 'Kapabilitas % tidak ada di database', p_capability using errcode = '42501';
  end if;
  if not pg_has_role(p_role, p_capability::name, 'member') then
    raise exception 'Akses ditolak. % tidak punya kapabilitas %. Minta ke Panji kalau memang perlu.', p_role, p_capability
      using errcode = '42501';
  end if;
end;
$$;

-- Menolak field yang tidak dikenal. Postgres mengabaikan key jsonb asing tanpa error,
-- jadi salah ketik nama field akan terlihat "berhasil" padahal tidak mengubah apa pun.
-- Ini penyebab kelas bug paling licin di jalur RPC, jadi ditutup di depan.
create or replace function public.dtg_reject_unknown_keys(p jsonb, p_allowed text[])
returns void
language plpgsql
immutable
as $$
declare v_bad text;
begin
  select string_agg(k, ', ' order by k) into v_bad
  from jsonb_object_keys(p) k
  where k <> all (p_allowed);

  if v_bad is not null then
    raise exception 'Field tidak dikenal: %. Yang diterima: %', v_bad, array_to_string(p_allowed, ', ')
      using errcode = '22023';
  end if;
end;
$$;

create or replace function public.dtg_diff(p_before jsonb, p_after jsonb, p_fields text[])
returns jsonb
language sql
immutable
as $$
  select coalesce(
    jsonb_object_agg(f, jsonb_build_object('dari', p_before -> f, 'jadi', p_after -> f)),
    '{}'::jsonb
  )
  from unnest(p_fields) f
  where p_before -> f is distinct from p_after -> f;
$$;

create or replace function public.dtg_audit(
  p_actor        public.dtg_agent_identity,
  p_action       text,
  p_resource_type text,
  p_resource_id  text,
  p_changes      jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare v_id uuid;
begin
  insert into admin_audit_log (admin_user_id, admin_email, action, resource_type, resource_id, metadata)
  values (
    p_actor.auth_user_id,
    p_actor.email,
    p_action,
    p_resource_type,
    p_resource_id,
    jsonb_build_object('via', 'agent-mcp', 'db_role', p_actor.db_role, 'perubahan', p_changes)
  )
  returning id into v_id;
  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. dtg_application_write: tahap kandidat, outreach, catatan, Job Order
-- ---------------------------------------------------------------------------
-- Inilah yang menutup dua titik friksi yang diukur Zalfa. Satu panggilan, satu lamaran.

create or replace function public.dtg_application_write(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  a          public.dtg_agent_identity;
  v_id       uuid;
  v_before   applications;
  v_after    applications;
  v_jo       job_orders;
  v_note     text;
  v_changes  jsonb;
  v_hist_id  uuid;
begin
  perform public.dtg_reject_unknown_keys(p, array[
    'application_id','pipeline_stage','reached_out','po_notes','job_order_id','note','_as_role'
  ]);

  a := public.dtg_actor(p ->> '_as_role');
  perform public.dtg_require_capability(a.db_role, 'dtg_rw_funnel');

  v_id := nullif(p ->> 'application_id', '')::uuid;
  if v_id is null then
    raise exception 'application_id wajib diisi' using errcode = '22023';
  end if;

  if not (p ?| array['pipeline_stage','reached_out','po_notes','job_order_id']) then
    raise exception 'Tidak ada yang diubah. Isi minimal satu dari: pipeline_stage, reached_out, po_notes, job_order_id'
      using errcode = '22023';
  end if;

  select * into v_before from applications where id = v_id;
  if not found then
    raise exception 'Lamaran % tidak ditemukan', v_id using errcode = '02000';
  end if;

  v_note := nullif(btrim(coalesce(p ->> 'note', '')), '');
  if length(coalesce(v_note, '')) > 2000 then
    raise exception 'note maksimal 2000 karakter' using errcode = '22023';
  end if;
  if length(coalesce(p ->> 'po_notes', '')) > 5000 then
    raise exception 'po_notes maksimal 5000 karakter' using errcode = '22023';
  end if;

  -- Job Order harus milik posisi yang sama. Tanpa cek ini, satu salah tempel id bisa
  -- menaruh kandidat Jepang di pesanan employer Saudi, dan hitungan slot ikut salah.
  if p ? 'job_order_id' and nullif(p ->> 'job_order_id', '') is not null then
    select * into v_jo from job_orders where id = (p ->> 'job_order_id')::uuid;
    if not found then
      raise exception 'Job Order % tidak ditemukan', p ->> 'job_order_id' using errcode = '02000';
    end if;
    if v_jo.position_slug is distinct from v_before.position_slug then
      raise exception 'Job Order itu milik posisi %, sedangkan lamaran ini posisi %',
        v_jo.position_slug, v_before.position_slug using errcode = '23514';
    end if;
    if v_jo.status <> 'open' then
      raise exception 'Job Order % berstatus %, hanya yang open yang bisa diisi',
        v_jo.intake_label, v_jo.status using errcode = '23514';
    end if;
  end if;

  update applications set
    pipeline_stage  = case when p ? 'pipeline_stage'
                        then (p ->> 'pipeline_stage')::pipeline_stage
                        else pipeline_stage end,
    reached_out     = case when p ? 'reached_out'
                        then (p ->> 'reached_out')::boolean
                        else reached_out end,
    reached_out_at  = case
                        when p ? 'reached_out' and (p ->> 'reached_out')::boolean = true
                             and coalesce(reached_out, false) = false then now()
                        when p ? 'reached_out' and (p ->> 'reached_out')::boolean = false then null
                        else reached_out_at end,
    po_notes        = case when p ? 'po_notes' then nullif(p ->> 'po_notes', '') else po_notes end,
    job_order_id    = case when p ? 'job_order_id' then nullif(p ->> 'job_order_id', '')::uuid
                        else job_order_id end,
    -- reviewed_by inilah yang membuat trigger riwayat mencatat nama orangnya
    reviewed_by     = case when p ? 'pipeline_stage'
                             and (p ->> 'pipeline_stage')::pipeline_stage is distinct from pipeline_stage
                        then a.auth_user_id else reviewed_by end,
    reviewed_at     = case when p ? 'pipeline_stage'
                             and (p ->> 'pipeline_stage')::pipeline_stage is distinct from pipeline_stage
                        then now() else reviewed_at end,
    updated_at      = now()
  where id = v_id
  returning * into v_after;

  -- Alasan pindah tahap ditempelkan ke baris riwayat yang baru saja dibuat trigger.
  if v_note is not null and v_after.pipeline_stage is distinct from v_before.pipeline_stage then
    select id into v_hist_id
    from application_status_history
    where application_id = v_id
    order by changed_at desc, id desc
    limit 1;
    if v_hist_id is not null then
      update application_status_history set internal_note = v_note where id = v_hist_id;
    end if;
  end if;

  v_changes := public.dtg_diff(to_jsonb(v_before), to_jsonb(v_after),
    array['pipeline_stage','reached_out','po_notes','job_order_id']);

  if v_note is not null then
    v_changes := v_changes || jsonb_build_object('alasan', v_note);
  end if;

  perform public.dtg_audit(a, 'agent_application_write', 'application', v_id::text, v_changes);

  return jsonb_build_object(
    'application_id', v_id,
    'position_slug',  v_after.position_slug,
    'pipeline_stage', v_after.pipeline_stage,
    'reached_out',    v_after.reached_out,
    'job_order_id',   v_after.job_order_id,
    'perubahan',      v_changes,
    'oleh',           a.display_name
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. dtg_interview_write: jadwal interview
-- ---------------------------------------------------------------------------

create or replace function public.dtg_interview_write(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  a         public.dtg_agent_identity;
  v_id      uuid;
  v_app     applications;
  v_before  interview_scheduled;
  v_after   interview_scheduled;
  v_changes jsonb;
  v_fields  text[] := array['scheduled_at','duration_minutes','platform','meeting_url',
                            'meeting_location','status','admin_note','candidate_note',
                            'cancellation_reason'];
begin
  perform public.dtg_reject_unknown_keys(p, array[
    'interview_id','application_id','scheduled_at','duration_minutes','platform','meeting_url',
    'meeting_location','status','admin_note','candidate_note','cancellation_reason','_as_role'
  ]);

  a := public.dtg_actor(p ->> '_as_role');
  perform public.dtg_require_capability(a.db_role, 'dtg_rw_interview');

  v_id := nullif(p ->> 'interview_id', '')::uuid;

  if p ? 'platform' and (p ->> 'platform') <> all (array['whatsapp','zoom','google_meet','phone','in_person']) then
    raise exception 'platform harus salah satu dari: whatsapp, zoom, google_meet, phone, in_person'
      using errcode = '22023';
  end if;
  if p ? 'status' and (p ->> 'status') <> all (array['scheduled','completed','cancelled','rescheduled','no_show']) then
    raise exception 'status harus salah satu dari: scheduled, completed, cancelled, rescheduled, no_show'
      using errcode = '22023';
  end if;

  if v_id is null then
    -- Jadwal baru
    if nullif(p ->> 'application_id', '') is null then
      raise exception 'application_id wajib diisi saat membuat jadwal baru' using errcode = '22023';
    end if;
    select * into v_app from applications where id = (p ->> 'application_id')::uuid;
    if not found then
      raise exception 'Lamaran % tidak ditemukan', p ->> 'application_id' using errcode = '02000';
    end if;
    if nullif(p ->> 'scheduled_at', '') is null then
      raise exception 'scheduled_at wajib diisi saat membuat jadwal baru' using errcode = '22023';
    end if;

    insert into interview_scheduled (
      application_id, scheduled_at, duration_minutes, platform, meeting_url, meeting_location,
      status, admin_note, candidate_note, scheduled_by
    ) values (
      v_app.id,
      (p ->> 'scheduled_at')::timestamptz,
      coalesce(nullif(p ->> 'duration_minutes', '')::int, 30),
      coalesce(nullif(p ->> 'platform', ''), 'whatsapp'),
      nullif(p ->> 'meeting_url', ''),
      nullif(p ->> 'meeting_location', ''),
      coalesce(nullif(p ->> 'status', ''), 'scheduled'),
      nullif(p ->> 'admin_note', ''),
      nullif(p ->> 'candidate_note', ''),
      a.auth_user_id
    ) returning * into v_after;

    v_changes := public.dtg_diff('{}'::jsonb, to_jsonb(v_after), v_fields);
    perform public.dtg_audit(a, 'agent_interview_create', 'interview', v_after.id::text, v_changes);
  else
    select * into v_before from interview_scheduled where id = v_id;
    if not found then
      raise exception 'Jadwal interview % tidak ditemukan', v_id using errcode = '02000';
    end if;
    if p ? 'application_id' and nullif(p ->> 'application_id', '')::uuid is distinct from v_before.application_id then
      raise exception 'Jadwal tidak bisa dipindah ke lamaran lain. Batalkan yang ini, lalu buat jadwal baru.'
        using errcode = '23514';
    end if;
    if (p ->> 'status') = 'cancelled' and nullif(p ->> 'cancellation_reason', '') is null then
      raise exception 'cancellation_reason wajib diisi kalau status cancelled' using errcode = '22023';
    end if;

    update interview_scheduled set
      scheduled_at        = case when p ? 'scheduled_at' then (p ->> 'scheduled_at')::timestamptz else scheduled_at end,
      duration_minutes    = case when p ? 'duration_minutes' then (p ->> 'duration_minutes')::int else duration_minutes end,
      platform            = case when p ? 'platform' then (p ->> 'platform') else platform end,
      meeting_url         = case when p ? 'meeting_url' then nullif(p ->> 'meeting_url', '') else meeting_url end,
      meeting_location    = case when p ? 'meeting_location' then nullif(p ->> 'meeting_location', '') else meeting_location end,
      status              = case when p ? 'status' then (p ->> 'status') else status end,
      cancelled_at        = case when (p ->> 'status') = 'cancelled' then now() else cancelled_at end,
      cancellation_reason = case when p ? 'cancellation_reason' then nullif(p ->> 'cancellation_reason', '') else cancellation_reason end,
      admin_note          = case when p ? 'admin_note' then nullif(p ->> 'admin_note', '') else admin_note end,
      candidate_note      = case when p ? 'candidate_note' then nullif(p ->> 'candidate_note', '') else candidate_note end,
      updated_at          = now()
    where id = v_id
    returning * into v_after;

    v_changes := public.dtg_diff(to_jsonb(v_before), to_jsonb(v_after), v_fields);
    perform public.dtg_audit(a, 'agent_interview_update', 'interview', v_id::text, v_changes);
  end if;

  return jsonb_build_object(
    'interview_id',   v_after.id,
    'application_id', v_after.application_id,
    'scheduled_at',   v_after.scheduled_at,
    'status',         v_after.status,
    'perubahan',      v_changes,
    'oleh',           a.display_name
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. dtg_job_order_write: pesanan employer
-- ---------------------------------------------------------------------------

create or replace function public.dtg_job_order_write(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  a         public.dtg_agent_identity;
  v_id      uuid;
  v_before  job_orders;
  v_after   job_orders;
  v_changes jsonb;
  v_fields  text[] := array['position_slug','internal_employer_name','public_employer_name',
                            'employer_city','intake_label','slot_count','deadline','status',
                            'public_description','notes'];
begin
  perform public.dtg_reject_unknown_keys(p, array[
    'job_order_id','position_slug','internal_employer_name','public_employer_name','employer_city',
    'intake_label','slot_count','deadline','status','public_description','notes','_as_role'
  ]);

  a := public.dtg_actor(p ->> '_as_role');
  perform public.dtg_require_capability(a.db_role, 'dtg_rw_joborder');

  v_id := nullif(p ->> 'job_order_id', '')::uuid;

  if p ? 'status' and (p ->> 'status') <> all (array['open','closed','filled','cancelled']) then
    raise exception 'status harus salah satu dari: open, closed, filled, cancelled' using errcode = '22023';
  end if;
  if p ? 'position_slug' and not exists (select 1 from positions where slug = p ->> 'position_slug') then
    raise exception 'Posisi % tidak ada', p ->> 'position_slug' using errcode = '02000';
  end if;

  if v_id is null then
    if nullif(p ->> 'position_slug', '') is null or nullif(p ->> 'intake_label', '') is null then
      raise exception 'position_slug dan intake_label wajib diisi saat membuat Job Order baru' using errcode = '22023';
    end if;
    if coalesce(nullif(p ->> 'slot_count', '')::int, 0) < 1 then
      raise exception 'slot_count minimal 1' using errcode = '22023';
    end if;

    insert into job_orders (
      position_slug, internal_employer_name, public_employer_name, employer_city, intake_label,
      slot_count, deadline, status, public_description, notes, created_by
    ) values (
      p ->> 'position_slug',
      nullif(p ->> 'internal_employer_name', ''),
      nullif(p ->> 'public_employer_name', ''),
      nullif(p ->> 'employer_city', ''),
      p ->> 'intake_label',
      (p ->> 'slot_count')::int,
      nullif(p ->> 'deadline', '')::date,
      coalesce(nullif(p ->> 'status', ''), 'open')::job_order_status,
      nullif(p ->> 'public_description', ''),
      nullif(p ->> 'notes', ''),
      a.auth_user_id
    ) returning * into v_after;

    v_changes := public.dtg_diff('{}'::jsonb, to_jsonb(v_after), v_fields);
    perform public.dtg_audit(a, 'agent_job_order_create', 'job_order', v_after.id::text, v_changes);
  else
    select * into v_before from job_orders where id = v_id;
    if not found then
      raise exception 'Job Order % tidak ditemukan', v_id using errcode = '02000';
    end if;
    if p ? 'position_slug' and (p ->> 'position_slug') is distinct from v_before.position_slug then
      raise exception 'Job Order tidak bisa dipindah ke posisi lain, sudah ada kandidat yang tergantung padanya'
        using errcode = '23514';
    end if;
    if p ? 'slot_count' and (p ->> 'slot_count')::int < v_before.slot_filled then
      raise exception 'slot_count tidak bisa lebih kecil dari slot yang sudah terisi (%)', v_before.slot_filled
        using errcode = '23514';
    end if;

    update job_orders set
      internal_employer_name = case when p ? 'internal_employer_name' then nullif(p ->> 'internal_employer_name', '') else internal_employer_name end,
      public_employer_name   = case when p ? 'public_employer_name' then nullif(p ->> 'public_employer_name', '') else public_employer_name end,
      employer_city          = case when p ? 'employer_city' then nullif(p ->> 'employer_city', '') else employer_city end,
      intake_label           = case when p ? 'intake_label' then p ->> 'intake_label' else intake_label end,
      slot_count             = case when p ? 'slot_count' then (p ->> 'slot_count')::int else slot_count end,
      deadline               = case when p ? 'deadline' then nullif(p ->> 'deadline', '')::date else deadline end,
      status                 = case when p ? 'status' then (p ->> 'status')::job_order_status else status end,
      public_description     = case when p ? 'public_description' then nullif(p ->> 'public_description', '') else public_description end,
      notes                  = case when p ? 'notes' then nullif(p ->> 'notes', '') else notes end,
      updated_at             = now()
    where id = v_id
    returning * into v_after;

    v_changes := public.dtg_diff(to_jsonb(v_before), to_jsonb(v_after), v_fields);
    perform public.dtg_audit(a, 'agent_job_order_update', 'job_order', v_id::text, v_changes);
  end if;

  return jsonb_build_object(
    'job_order_id',  v_after.id,
    'position_slug', v_after.position_slug,
    'intake_label',  v_after.intake_label,
    'slot',          v_after.slot_filled || '/' || v_after.slot_count,
    'status',        v_after.status,
    'perubahan',     v_changes,
    'oleh',          a.display_name
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. dtg_referral_write: agen mitra dan kodenya
-- ---------------------------------------------------------------------------
-- Kode referral TIDAK BISA DIHAPUS, hanya dinonaktifkan. Kode yang sudah beredar
-- menempel di kandidat yang sudah masuk; menghapusnya memutus atribusi dan
-- perhitungan komisi jadi tidak bisa dipertanggungjawabkan.

create or replace function public.dtg_referral_write(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  a         public.dtg_agent_identity;
  v_op      text;
  v_id      uuid;
  v_agent   affiliate_agents;
  v_code    referral_codes;
  v_before  jsonb;
  v_changes jsonb;
  v_codetxt text;
begin
  perform public.dtg_reject_unknown_keys(p, array[
    'op','agent_id','name','email','phone','city','status','notes',
    'code_id','code','label','_as_role'
  ]);

  a := public.dtg_actor(p ->> '_as_role');
  perform public.dtg_require_capability(a.db_role, 'dtg_rw_referral');

  v_op := coalesce(nullif(p ->> 'op', ''), 'agent');
  if v_op <> all (array['agent','code']) then
    raise exception 'op harus agent atau code' using errcode = '22023';
  end if;

  if v_op = 'agent' then
    if p ? 'status' and (p ->> 'status') <> all (array['active','inactive','suspended']) then
      raise exception 'status agen harus active, inactive, atau suspended' using errcode = '22023';
    end if;
    v_id := nullif(p ->> 'agent_id', '')::uuid;

    if v_id is null then
      if nullif(btrim(coalesce(p ->> 'name', '')), '') is null then
        raise exception 'name wajib diisi saat mendaftarkan agen baru' using errcode = '22023';
      end if;
      insert into affiliate_agents (name, email, phone, city, status, notes, created_by)
      values (
        btrim(p ->> 'name'),
        nullif(lower(btrim(coalesce(p ->> 'email', ''))), ''),
        nullif(btrim(coalesce(p ->> 'phone', '')), ''),
        nullif(btrim(coalesce(p ->> 'city', '')), ''),
        coalesce(nullif(p ->> 'status', ''), 'active'),
        nullif(p ->> 'notes', ''),
        a.auth_user_id
      ) returning * into v_agent;
      v_changes := public.dtg_diff('{}'::jsonb, to_jsonb(v_agent), array['name','email','phone','city','status','notes']);
      perform public.dtg_audit(a, 'agent_affiliate_create', 'affiliate_agent', v_agent.id::text, v_changes);
    else
      select * into v_agent from affiliate_agents where id = v_id;
      if not found then
        raise exception 'Agen % tidak ditemukan', v_id using errcode = '02000';
      end if;
      v_before := to_jsonb(v_agent);
      update affiliate_agents set
        name    = case when p ? 'name'   then btrim(p ->> 'name') else name end,
        email   = case when p ? 'email'  then nullif(lower(btrim(p ->> 'email')), '') else email end,
        phone   = case when p ? 'phone'  then nullif(btrim(p ->> 'phone'), '') else phone end,
        city    = case when p ? 'city'   then nullif(btrim(p ->> 'city'), '') else city end,
        status  = case when p ? 'status' then (p ->> 'status') else status end,
        notes   = case when p ? 'notes'  then nullif(p ->> 'notes', '') else notes end,
        updated_at = now()
      where id = v_id
      returning * into v_agent;
      v_changes := public.dtg_diff(v_before, to_jsonb(v_agent), array['name','email','phone','city','status','notes']);
      perform public.dtg_audit(a, 'agent_affiliate_update', 'affiliate_agent', v_id::text, v_changes);
    end if;

    return jsonb_build_object('op', 'agent', 'agent_id', v_agent.id, 'name', v_agent.name,
                              'status', v_agent.status, 'perubahan', v_changes, 'oleh', a.display_name);
  end if;

  -- op = code
  if p ? 'status' and (p ->> 'status') <> all (array['active','inactive']) then
    raise exception 'status kode harus active atau inactive' using errcode = '22023';
  end if;
  v_id := nullif(p ->> 'code_id', '')::uuid;

  if v_id is null then
    if nullif(p ->> 'agent_id', '') is null then
      raise exception 'agent_id wajib diisi saat membuat kode baru' using errcode = '22023';
    end if;
    if not exists (select 1 from affiliate_agents where id = (p ->> 'agent_id')::uuid) then
      raise exception 'Agen % tidak ditemukan, daftarkan agennya dulu', p ->> 'agent_id' using errcode = '02000';
    end if;
    v_codetxt := upper(btrim(coalesce(p ->> 'code', '')));
    if v_codetxt !~ '^[A-Z0-9-]{4,32}$' then
      raise exception 'Kode harus 4 sampai 32 karakter, hanya huruf, angka, dan tanda hubung. Dapat: %', v_codetxt
        using errcode = '22023';
    end if;
    if exists (select 1 from referral_codes where code = v_codetxt) then
      raise exception 'Kode % sudah dipakai', v_codetxt using errcode = '23505';
    end if;

    insert into referral_codes (agent_id, code, label, status)
    values ((p ->> 'agent_id')::uuid, v_codetxt, nullif(p ->> 'label', ''), coalesce(nullif(p ->> 'status', ''), 'active'))
    returning * into v_code;
    v_changes := public.dtg_diff('{}'::jsonb, to_jsonb(v_code), array['code','label','status','agent_id']);
    perform public.dtg_audit(a, 'agent_referral_code_create', 'referral_code', v_code.id::text, v_changes);
  else
    select * into v_code from referral_codes where id = v_id;
    if not found then
      raise exception 'Kode % tidak ditemukan', v_id using errcode = '02000';
    end if;
    if p ? 'code' and upper(btrim(p ->> 'code')) is distinct from v_code.code then
      raise exception 'Teks kode tidak bisa diubah karena sudah menempel di kandidat yang masuk. Nonaktifkan kode ini, lalu buat kode baru.'
        using errcode = '23514';
    end if;
    v_before := to_jsonb(v_code);
    update referral_codes set
      label  = case when p ? 'label'  then nullif(p ->> 'label', '') else label end,
      status = case when p ? 'status' then (p ->> 'status') else status end
    where id = v_id
    returning * into v_code;
    v_changes := public.dtg_diff(v_before, to_jsonb(v_code), array['code','label','status','agent_id']);
    perform public.dtg_audit(a, 'agent_referral_code_update', 'referral_code', v_id::text, v_changes);
  end if;

  return jsonb_build_object('op', 'code', 'code_id', v_code.id, 'code', v_code.code,
                            'status', v_code.status, 'perubahan', v_changes, 'oleh', a.display_name);
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. dtg_screening_field_write: pertanyaan penyaring di form posisi
-- ---------------------------------------------------------------------------
-- Ini satu-satunya fungsi yang mengizinkan penghapusan baris, karena pertanyaan yang
-- salah pasang memang harus bisa dicabut. Jawaban kandidat TIDAK ikut hilang: jawaban
-- disimpan di applications.answers, bukan di tabel ini.
--
-- Pengaman utamanya: kalau posisinya sedang tayang, setelah perubahan posisi itu WAJIB
-- masih punya penyaring yang benar-benar menyaring. Kalau tidak, seluruh transaksi
-- dibatalkan. Ini persis kondisi yang bikin 7 posisi menerima 266 pelamar tanpa saringan.

create or replace function public.dtg_screening_field_write(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  a         public.dtg_agent_identity;
  v_op      text;
  v_id      uuid;
  v_slug    text;
  v_before  position_application_fields;
  v_after   position_application_fields;
  v_active  boolean;
  v_changes jsonb;
  v_opt     jsonb;
  v_fields  text[] := array['position_slug','section','field_key','field_label','field_help',
                            'field_type','options','importance','tier_weight','sort_order',
                            'collect_at_stage','document_type'];
begin
  perform public.dtg_reject_unknown_keys(p, array[
    'op','field_id','position_slug','section','field_key','field_label','field_help','field_type',
    'options','importance','tier_weight','sort_order','collect_at_stage','document_type','_as_role'
  ]);

  a := public.dtg_actor(p ->> '_as_role');
  perform public.dtg_require_capability(a.db_role, 'dtg_rw_screening');

  v_op := coalesce(nullif(p ->> 'op', ''), 'upsert');
  if v_op <> all (array['upsert','delete']) then
    raise exception 'op harus upsert atau delete' using errcode = '22023';
  end if;

  v_id := nullif(p ->> 'field_id', '')::uuid;

  if v_id is not null then
    select * into v_before from position_application_fields where id = v_id;
    if not found then
      raise exception 'Field % tidak ditemukan', v_id using errcode = '02000';
    end if;
    v_slug := v_before.position_slug;
  else
    v_slug := nullif(p ->> 'position_slug', '');
    if v_slug is null then
      raise exception 'position_slug wajib diisi kalau field_id tidak diberikan' using errcode = '22023';
    end if;
    -- upsert berdasarkan kunci alami (position_slug, field_key)
    if nullif(p ->> 'field_key', '') is not null then
      select * into v_before from position_application_fields
      where position_slug = v_slug and field_key = p ->> 'field_key';
      if found then v_id := v_before.id; end if;
    end if;
  end if;

  select coalesce(active, false) into v_active from positions where slug = v_slug;
  if not found then
    raise exception 'Posisi % tidak ada', v_slug using errcode = '02000';
  end if;

  if v_op = 'delete' then
    if v_id is null then
      raise exception 'field_id atau pasangan position_slug + field_key wajib diisi untuk menghapus' using errcode = '22023';
    end if;
    delete from position_application_fields where id = v_id;
    v_changes := jsonb_build_object('dihapus', to_jsonb(v_before) - 'id');
    perform public.dtg_audit(a, 'agent_screening_delete', 'position_field', v_id::text, v_changes);
  else
    -- Validasi bentuk options. Salah bentuk di sini bikin form publik gagal render.
    if p ? 'options' and p -> 'options' <> 'null'::jsonb then
      v_opt := p -> 'options';
      if jsonb_typeof(v_opt) <> 'array' then
        raise exception 'options harus array' using errcode = '22023';
      end if;
      if exists (
        select 1 from jsonb_array_elements(v_opt) o
        where jsonb_typeof(o) <> 'object' or o ->> 'value' is null or o ->> 'label' is null
      ) then
        raise exception 'Tiap opsi wajib punya value dan label. Tambahkan qualifying: true pada opsi yang meloloskan.'
          using errcode = '22023';
      end if;
    end if;
    if p ? 'section' and (p ->> 'section') <> all (array['syarat_utama','kualifikasi','screening']) then
      raise exception 'section harus syarat_utama, kualifikasi, atau screening' using errcode = '22023';
    end if;
    if p ? 'importance' and (p ->> 'importance') <> all (array['required','optional']) then
      raise exception 'importance harus required atau optional' using errcode = '22023';
    end if;

    if v_id is null then
      if nullif(p ->> 'field_key', '') is null or nullif(p ->> 'field_label', '') is null
         or nullif(p ->> 'field_type', '') is null then
        raise exception 'field_key, field_label, dan field_type wajib diisi untuk field baru' using errcode = '22023';
      end if;
      insert into position_application_fields (
        position_slug, sort_order, section, field_key, field_label, field_help, field_type,
        options, importance, tier_weight, collect_at_stage, document_type
      ) values (
        v_slug,
        coalesce(nullif(p ->> 'sort_order', '')::int, 0),
        coalesce(nullif(p ->> 'section', ''), 'syarat_utama')::application_field_section,
        p ->> 'field_key',
        p ->> 'field_label',
        nullif(p ->> 'field_help', ''),
        (p ->> 'field_type')::form_field_type,
        case when p ? 'options' then p -> 'options' else null end,
        coalesce(nullif(p ->> 'importance', ''), 'optional')::application_field_importance,
        coalesce(nullif(p ->> 'tier_weight', '')::int, 0),
        coalesce(nullif(p ->> 'collect_at_stage', ''), 'applied')::pipeline_stage,
        nullif(p ->> 'document_type', '')::doc_type
      ) returning * into v_after;
      v_changes := public.dtg_diff('{}'::jsonb, to_jsonb(v_after), v_fields);
      perform public.dtg_audit(a, 'agent_screening_create', 'position_field', v_after.id::text, v_changes);
    else
      update position_application_fields set
        sort_order       = case when p ? 'sort_order' then (p ->> 'sort_order')::int else sort_order end,
        section          = case when p ? 'section' then (p ->> 'section')::application_field_section else section end,
        field_label      = case when p ? 'field_label' then p ->> 'field_label' else field_label end,
        field_help       = case when p ? 'field_help' then nullif(p ->> 'field_help', '') else field_help end,
        field_type       = case when p ? 'field_type' then (p ->> 'field_type')::form_field_type else field_type end,
        options          = case when p ? 'options' then (case when p -> 'options' = 'null'::jsonb then null else p -> 'options' end) else options end,
        importance       = case when p ? 'importance' then (p ->> 'importance')::application_field_importance else importance end,
        tier_weight      = case when p ? 'tier_weight' then (p ->> 'tier_weight')::int else tier_weight end,
        collect_at_stage = case when p ? 'collect_at_stage' then (p ->> 'collect_at_stage')::pipeline_stage else collect_at_stage end,
        document_type    = case when p ? 'document_type' then nullif(p ->> 'document_type', '')::doc_type else document_type end,
        updated_at       = now()
      where id = v_id
      returning * into v_after;
      v_changes := public.dtg_diff(to_jsonb(v_before), to_jsonb(v_after), v_fields);
      perform public.dtg_audit(a, 'agent_screening_update', 'position_field', v_id::text, v_changes);
    end if;
  end if;

  -- Invarian: posisi yang sedang tayang tidak boleh kehilangan penyaring efektifnya.
  if v_active and not public.position_has_effective_screening(v_slug) then
    raise exception 'Dibatalkan. Posisi % sedang tayang, dan setelah perubahan ini tidak ada lagi pertanyaan wajib di syarat_utama yang punya opsi qualifying. Semua pelamar akan lolos.', v_slug
      using errcode = '23514';
  end if;

  return jsonb_build_object(
    'op',            v_op,
    'position_slug', v_slug,
    'field_id',      coalesce(v_after.id, v_id),
    'field_key',     coalesce(v_after.field_key, v_before.field_key),
    'menyaring',     public.position_has_effective_screening(v_slug),
    'perubahan',     v_changes,
    'oleh',          a.display_name
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. Hak akses fungsi
-- ---------------------------------------------------------------------------
-- PENTING: Postgres memberi EXECUTE ke PUBLIC secara default untuk fungsi baru, dan
-- fungsi di schema public terekspos lewat PostgREST. Tanpa REVOKE di bawah, siapa pun
-- pengunjung situs bisa memanggil fungsi tulis ini. Jadi dicabut dulu, baru diberikan
-- ke kapabilitas yang berhak.

do $$
declare
  f text;
begin
  foreach f in array array[
    'public.dtg_application_write(jsonb)',
    'public.dtg_interview_write(jsonb)',
    'public.dtg_job_order_write(jsonb)',
    'public.dtg_referral_write(jsonb)',
    'public.dtg_screening_field_write(jsonb)',
    'public.dtg_actor(text)',
    'public.dtg_require_capability(name, text)',
    'public.dtg_audit(public.dtg_agent_identity, text, text, text, jsonb)',
    'public.dtg_reject_unknown_keys(jsonb, text[])',
    'public.dtg_diff(jsonb, jsonb, text[])'
  ] loop
    execute format('revoke all on function %s from public', f);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on function %s from anon', f);
    end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then
      execute format('revoke all on function %s from authenticated', f);
    end if;
  end loop;
end $$;

-- Penolong dipanggil dari dalam fungsi tulis (yang security definer, jalan sebagai
-- pemilik), jadi role tim tidak perlu EXECUTE ke penolongnya. Yang diberikan hanya
-- lima pintu utama.
grant execute on function public.dtg_application_write(jsonb)     to dtg_rw_funnel;
grant execute on function public.dtg_interview_write(jsonb)       to dtg_rw_interview;
grant execute on function public.dtg_job_order_write(jsonb)       to dtg_rw_joborder;
grant execute on function public.dtg_referral_write(jsonb)        to dtg_rw_referral;
grant execute on function public.dtg_screening_field_write(jsonb) to dtg_rw_screening;

-- Agar tim bisa membaca jejaknya sendiri lewat SQL biasa.
grant select on public.admin_audit_log to dtg_ro;

-- ---------------------------------------------------------------------------
-- 10. Pembagian kapabilitas per orang
-- ---------------------------------------------------------------------------
-- Dasarnya keputusan kepemilikan dari sesi 28 Jul 2026 (kode K di REKAP-FINAL-28JUL.md).
-- Mengubah pembagian ini cukup satu GRANT atau REVOKE, tidak perlu migration baru.
--
--            funnel  interview  joborder  referral  screening
--   martin      v        v          v         v         v      Head, memutus dan mereview
--   zalfa       v        v          v         .         .      PO Saudi, PIC sinkronisasi A1 (K13)
--   ifa         v        v          v         .         v      PO Jepang, pemilik kriteria penyaring
--   ririn       v        v          v         v         .      PM Recruitment, pemilik kanal LPK dan Agent (K10)
--   indria      v        v          .         .         .      Akademi dan jalur Need Development (K12)
--   ai          v        .          v         .         .      Ops deployment dan visa (K4)

grant dtg_rw_funnel to ro_martin, ro_zalfa, ro_ifa, ro_ririn, ro_indria, ro_ai;
grant dtg_rw_interview to ro_martin, ro_zalfa, ro_ifa, ro_ririn, ro_indria;
grant dtg_rw_joborder to ro_martin, ro_zalfa, ro_ifa, ro_ririn, ro_ai;
grant dtg_rw_referral to ro_martin, ro_ririn;
grant dtg_rw_screening to ro_martin, ro_ifa;
