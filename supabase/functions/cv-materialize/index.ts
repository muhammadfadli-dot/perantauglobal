// cv-materialize - pindahkan CV staged anon (Fase 2 CV grader) ke folder kandidat
// lalu trigger grading. Dipanggil dari apps/platform /auth/callback SETELAH email
// kandidat diverifikasi (session kandidat). verify_jwt=true.
//
// Kenapa edge fn service-role (bukan move langsung di callback pakai session kandidat):
// bucket `pending-cv` cuma punya policy anon-INSERT + admin. Kandidat authenticated
// (bukan admin) TIDAK punya SELECT/DELETE di pending-cv -> storage.move bakal ditolak
// RLS. Service-role bypass RLS. Fungsi ini = satu-satunya yang nyentuh pending-cv
// dengan service-role, auditable, dan TIDAK naruh service key di surface Next.js.
//
// Flow:
//   1. auth: candidate dari JWT sub (auth_user_id). Cuma materialize CV MILIK dia.
//   2. cari candidate_documents doc_type='cv' file_path LIKE 'pending/%' terbaru.
//   3. move pending-cv/pending/<id>/cv.* -> candidate-documents/<cid>/cv/cv-<ts>.<ext>.
//   4. UPDATE candidate_documents.file_path -> path baru.
//   5. invoke grade-cv { document_id } (engine existing, ZERO change).
// Idempotent + best-effort: kalau gak ada CV staged -> 200 noop. Gagal -> non-fatal.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function subFromJwt(req: Request): string | null {
  try {
    return JSON.parse(atob((req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").split(".")[1])).sub ?? null;
  } catch {
    return null;
  }
}

const svc = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const SAFE_EXT = new Set(["pdf", "jpg", "jpeg", "png", "heic", "heif", "webp"]);

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  // 1. AUTH: hanya kandidat sendiri yang boleh materialize CV-nya.
  const sub = subFromJwt(req);
  if (!sub) return json({ error: "unauthorized" }, 401);
  // Authorization kandidat di-forward ke grade-cv nanti: grade-cv nolak service-role
  // (403) tapi nerima JWT kandidat lewat owner-check (candidate = own CV), persis
  // pola portal. Pakai token caller, bukan service key, buat invoke grade-cv.
  const authHeader = req.headers.get("Authorization") ?? "";

  const { data: candidate } = await svc
    .from("candidates")
    .select("id")
    .eq("auth_user_id", sub)
    .maybeSingle();
  if (!candidate) return json({ error: "candidate not found" }, 404);
  const candidateId = candidate.id as string;

  // 2. CV staged milik kandidat ini (file masih di bucket pending-cv).
  const { data: doc } = await svc
    .from("candidate_documents")
    .select("id, candidate_id, file_path, mime_type")
    .eq("candidate_id", candidateId)
    .eq("doc_type", "cv")
    .like("file_path", "pending/%")
    .order("uploaded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Gak ada CV staged (kandidat tanpa CV / sudah ke-materialize) -> noop sukses.
  if (!doc) return json({ ok: true, materialized: false, reason: "no staged cv" }, 200);

  // 3. MOVE lintas-bucket pending-cv -> candidate-documents (service-role bypass RLS).
  //    Dest path ikut konvensi 0010: <candidate_id>/cv/<filename>.
  const rawExt = (doc.file_path.split(".").pop() ?? "").toLowerCase();
  const ext = SAFE_EXT.has(rawExt) ? rawExt : "pdf";
  const dest = `${candidateId}/cv/cv-${Date.now()}.${ext}`;

  try {
    const mv = await svc.storage
      .from("pending-cv")
      .move(doc.file_path, dest, { destinationBucket: "candidate-documents" });
    if (mv.error) {
      return json({ ok: false, materialized: false, error: `move: ${mv.error.message}` }, 200);
    }
  } catch (e) {
    return json({ ok: false, materialized: false, error: `move-throw: ${String(e).slice(0, 200)}` }, 200);
  }

  // 4. UPDATE pointer ke path baru (di bucket candidate-documents).
  const { error: upErr } = await svc
    .from("candidate_documents")
    .update({ file_path: dest })
    .eq("id", doc.id);
  if (upErr) {
    return json({ ok: false, materialized: true, graded: false, error: `update path: ${upErr.message}` }, 200);
  }

  // 5. Trigger grading (engine existing, ZERO change). Pakai Authorization KANDIDAT
  //    (bukan service key -> grade-cv 403). grade-cv owner-check: candidate = own CV.
  //    Fire-and-forget: kegagalan grading TIDAK nge-fail materialize.
  try {
    await svc.functions.invoke("grade-cv", {
      body: { document_id: doc.id },
      headers: authHeader ? { Authorization: authHeader } : undefined,
    });
  } catch (e) {
    return json({ ok: true, materialized: true, graded: false, error: `grade-invoke: ${String(e).slice(0, 200)}`, document_id: doc.id }, 200);
  }

  return json({ ok: true, materialized: true, graded: true, document_id: doc.id, file_path: dest }, 200);
});
