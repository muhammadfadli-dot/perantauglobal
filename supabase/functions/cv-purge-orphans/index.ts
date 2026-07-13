// cv-purge-orphans — daily CV-grader HYGIENE function (dijalanin GitHub Action
// cron, karena pg_cron TIDAK terinstall di project ini). Dulu cuma hapus file CV
// orphan; sekarang jadi satu-pintu hygiene harian. Semua langkah best-effort +
// independen: satu gagal nggak nge-block yg lain, semua dilaporin di response.
//
// Langkah:
//   1. Orphan pending-cv (> 48 jam, TIDAK direferensikan) -> hapus file fisik.
//      (list_orphan_pending_cv 0095 udah exclude yg direferensikan.)
//   2. Dangling backstop (WS-2d): file pending-cv direferensikan TAPI > 14 hari
//      (cv-materialize gagal transient, nyangkut) -> hapus file + metadata.
//   3. Retention (WS-3): purge pending_submissions unconsumed > 30 hari + consent-
//      nya (data-minimization PDP; agregat drop-off disimpen dulu di RPC).
//   4. Telemetry hygiene (WS-6a): anonimkan IP cv_preview_events > 24 jam, hapus
//      row > 90 hari.
//
// Proteksi: FAIL-CLOSED. Wajib PURGE_CRON_SECRET ke-set + header X-Purge-Secret
// cocok, kalau nggak -> 403 (fungsi destruktif terkunci sampai dikonfigurasi).

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PURGE_SECRET = Deno.env.get("PURGE_CRON_SECRET") ?? "";

const PURGE_HOURS = 48;   // orphan pending-cv
const DANGLING_DAYS = 14; // referenced-but-stale pending-cv
const RETENTION_DAYS = 30; // unconsumed pending_submissions
const EVENT_IP_HOURS = 24; // anonymize cv_preview_events IP
const EVENT_KEEP_DAYS = 90; // delete cv_preview_events

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const svc = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (!PURGE_SECRET || req.headers.get("X-Purge-Secret") !== PURGE_SECRET) {
    return json({ error: "forbidden" }, 403);
  }

  const report: Record<string, unknown> = {
    ok: true,
    purged_orphan_files: 0,
    dangling_cleaned: 0,
    purged_pendings: 0,
    purged_consents: 0,
    preview_ip_anonymized: 0,
    preview_events_deleted: 0,
    errors: [] as string[],
  };
  const errors = report.errors as string[];

  // 1. Orphan pending-cv (> 48h, unreferenced) -> hapus file fisik.
  try {
    const { data: paths, error } = await svc.rpc("list_orphan_pending_cv", { p_hours: PURGE_HOURS });
    if (error) throw new Error(error.message);
    const list = (paths ?? []) as string[];
    if (list.length) {
      const { data: removed, error: rmErr } = await svc.storage.from("pending-cv").remove(list);
      if (rmErr) throw new Error(rmErr.message);
      report.purged_orphan_files = removed?.length ?? list.length;
    }
  } catch (e) {
    errors.push(`orphan: ${String(e).slice(0, 160)}`);
  }

  // 2. Dangling backstop: referenced BUT > 14 days -> hapus file + metadata row.
  try {
    const { data: paths, error } = await svc.rpc("list_stale_referenced_pending_cv", { p_days: DANGLING_DAYS });
    if (error) throw new Error(error.message);
    const list = (paths ?? []) as string[];
    if (list.length) {
      const { error: rmErr } = await svc.storage.from("pending-cv").remove(list);
      if (rmErr) throw new Error(rmErr.message);
      const { error: delErr } = await svc.from("candidate_documents").delete().in("file_path", list);
      if (delErr) throw new Error(delErr.message);
      report.dangling_cleaned = list.length;
    }
  } catch (e) {
    errors.push(`dangling: ${String(e).slice(0, 160)}`);
  }

  // 3. Retention: purge unconsumed pending_submissions > 30 days + their consents.
  try {
    const { data, error } = await svc.rpc("purge_stale_pending_submissions", { p_days: RETENTION_DAYS });
    if (error) throw new Error(error.message);
    const r = (data ?? {}) as { purged_pendings?: number; purged_consents?: number };
    report.purged_pendings = r.purged_pendings ?? 0;
    report.purged_consents = r.purged_consents ?? 0;
  } catch (e) {
    errors.push(`retention: ${String(e).slice(0, 160)}`);
  }

  // 4. Telemetry hygiene: anonymize IP > 24h, delete rows > 90 days.
  try {
    const ipCutoff = new Date(Date.now() - EVENT_IP_HOURS * 3600_000).toISOString();
    const { count: anonCount, error: anonErr } = await svc
      .from("cv_preview_events")
      .update({ ip: null }, { count: "exact" })
      .lt("created_at", ipCutoff)
      .not("ip", "is", null);
    if (anonErr) throw new Error(anonErr.message);
    report.preview_ip_anonymized = anonCount ?? 0;

    const delCutoff = new Date(Date.now() - EVENT_KEEP_DAYS * 86_400_000).toISOString();
    const { count: delCount, error: delErr } = await svc
      .from("cv_preview_events")
      .delete({ count: "exact" })
      .lt("created_at", delCutoff);
    if (delErr) throw new Error(delErr.message);
    report.preview_events_deleted = delCount ?? 0;
  } catch (e) {
    errors.push(`telemetry: ${String(e).slice(0, 160)}`);
  }

  report.ok = errors.length === 0;
  return json(report, 200);
});
