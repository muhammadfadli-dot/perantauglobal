// cv-purge-orphans - hapus CV staged anon (bucket pending-cv) yang nyangkut > 48 jam.
//
// Kenapa perlu (PDP data-minimization): ~50% pelamar dropout sebelum verifikasi
// email. CV mereka ke-stage anon di pending-cv tapi gak pernah di-materialize
// (cv-materialize cuma jalan SETELAH verify, dan move ngehapus file dari source).
// Jadi sisa di pending-cv = CV orphan (dropout/bot) -> WAJIB di-purge biar gak
// numpuk PII + storage cost. pg_cron TIDAK terinstall, jadi dijadwalin lewat
// Supabase scheduled function / GitHub Action cron (mis. harian).
//
// Catatan: penghapusan FILE FISIK lewat Storage API (svc.storage.remove), BUKAN
// DELETE row storage.objects (itu bakal ninggalin binary orphan di S3). RPC
// list_orphan_pending_cv (SECURITY DEFINER, 0079) cuma BACA daftar path > p_hours.
//
// Proteksi: butuh header X-Purge-Secret == env PURGE_CRON_SECRET (kalau di-set).

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PURGE_SECRET = Deno.env.get("PURGE_CRON_SECRET") ?? "";
const PURGE_HOURS = 48;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const svc = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (PURGE_SECRET && req.headers.get("X-Purge-Secret") !== PURGE_SECRET) {
    return json({ error: "forbidden" }, 403);
  }

  // 1. Daftar path orphan (> PURGE_HOURS) via RPC service-role.
  const { data: paths, error } = await svc.rpc("list_orphan_pending_cv", { p_hours: PURGE_HOURS });
  if (error) return json({ ok: false, error: `list: ${error.message}` }, 200);

  const list = (paths ?? []) as string[];
  if (!list.length) return json({ ok: true, purged: 0 });

  // 2. Hapus file fisik via Storage API (batch). remove() nerima array path.
  const { data: removed, error: rmErr } = await svc.storage.from("pending-cv").remove(list);
  if (rmErr) return json({ ok: false, purged: 0, error: `remove: ${rmErr.message}` }, 200);

  return json({ ok: true, purged: removed?.length ?? list.length, hours: PURGE_HOURS });
});
