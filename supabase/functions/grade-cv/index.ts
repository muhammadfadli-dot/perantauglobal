// grade-cv — AI CV grader (extraction + fit scoring).
//
// Modes (POST JSON): { document_id } extract one CV + the candidate's credential
// docs (+ auto-fit non-terminal apps); { backfill, limit } extract N;
// { application_id } fit one (privileged OR own application); { fit_backfill, limit } fit N.
// Auth (verify_jwt=true): service_role/admin = anything; candidate = own CV / own fit.
//
// Extraction reads the CV PLUS uploaded credential documents (sertifikat, ijazah,
// SIM, dst) so the parsed result reflects real evidence. Fit is grounded in the
// position's actual requirements (positions.content), not just the form fields.

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  CV_SCHEMA_VERSION, PROMPT_VERSION, EXTRACT_MODEL, EXTRACTION_JSON_SCHEMA, EXTRACTION_PROMPT,
  FIT_PROMPT_VERSION, FIT_MODEL, FIT_JSON_SCHEMA, buildFitPrompt,
  computeUmur, computeTotalPengalaman,
} from "./schema.ts";

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GATEWAY_KEY = Deno.env.get("AI_GATEWAY_API_KEY") ?? "";

// CORS — required so browser-side `supabase.functions.invoke('grade-cv')`
// (e.g. auto-grade on CV upload) survives the preflight. Without an OPTIONS
// responder + ACAO header the preflight 405s and the POST is silently blocked.
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...CORS } });

function roleFromJwt(req: Request): string | null {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try { return JSON.parse(atob(token.split(".")[1])).role ?? null; } catch { return null; }
}
function subFromJwt(req: Request): string | null {
  try { return JSON.parse(atob((req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").split(".")[1])).sub ?? null; } catch { return null; }
}
function toBase64(bytes: Uint8Array): string {
  let bin = ""; const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(bin);
}

const svc = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// deno-lint-ignore no-explicit-any
async function callGateway(model: string, content: any, schema: unknown) {
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${GATEWAY_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "user", content }], response_format: { type: "json_schema", json_schema: schema }, reasoning_effort: "none" }),
  });
  const payload = await res.json().catch(() => null);
  return { res, payload };
}

// ── Credential documents (merged into extraction + surfaced in fit) ───────

// Credential doc types that carry hireability signal. KTP / passport / photos
// / medical are identity/logistics, not skills — excluded.
const CRED_DOC_TYPES = [
  "certificate", "str_certificate", "language_certificate",
  "professional_certificate", "education_certificate", "work_certificate",
  "driving_license",
];
const MAX_CRED_DOCS = 6; // bound latency/cost per extraction

const DOC_TYPE_LABEL: Record<string, string> = {
  cv: "CV",
  certificate: "Sertifikat",
  str_certificate: "STR (Surat Tanda Registrasi)",
  language_certificate: "Sertifikat Bahasa",
  professional_certificate: "Sertifikat Profesi",
  education_certificate: "Ijazah / Sertifikat Pendidikan",
  work_certificate: "Surat Pengalaman Kerja",
  driving_license: "SIM",
};
function docLabel(t: string): string { return DOC_TYPE_LABEL[t] ?? t; }

// deno-lint-ignore no-explicit-any
function metaSummary(meta: any): string {
  if (!meta || typeof meta !== "object") return "";
  const keys = ["cert_name", "language", "system", "level", "class", "issuer", "employer", "role", "status", "graduation_year", "school"];
  const parts: string[] = [];
  for (const k of keys) { const v = meta[k]; if (v !== undefined && v !== null && v !== "") parts.push(String(v)); }
  return parts.length ? ` — ${parts.join(" · ")}` : "";
}

type CredDoc = { file_path: string; mime_type: string | null; doc_type: string; metadata: unknown };

async function candidateCredDocs(candidateId: string): Promise<CredDoc[]> {
  const { data } = await svc.from("candidate_documents")
    .select("file_path, mime_type, doc_type, metadata")
    .eq("candidate_id", candidateId)
    .in("doc_type", CRED_DOC_TYPES)
    .order("uploaded_at", { ascending: true })
    .limit(MAX_CRED_DOCS);
  return (data ?? []) as CredDoc[];
}

async function downloadDataUrl(filePath: string, mime: string | null): Promise<string | null> {
  const dl = await svc.storage.from("candidate-documents").download(filePath);
  if (dl.error || !dl.data) return null;
  const bytes = new Uint8Array(await dl.data.arrayBuffer());
  return `data:${mime || "application/pdf"};base64,${toBase64(bytes)}`;
}

type DocRow = { id: string; candidate_id: string; file_path: string; mime_type: string | null };

async function persistDocError(doc: DocRow, status: string, error: string) {
  await svc.from("cv_assessments").upsert({ candidate_id: doc.candidate_id, document_id: doc.id, status, error, model: EXTRACT_MODEL, prompt_version: PROMPT_VERSION, updated_at: new Date().toISOString() }, { onConflict: "document_id" });
  return { ok: false, status, error };
}

async function gradeOne(doc: DocRow): Promise<{ ok: boolean; status: string; error?: string }> {
  const cvUrl = await downloadDataUrl(doc.file_path, doc.mime_type);
  if (!cvUrl) return await persistDocError(doc, "unreadable", "download: CV file not readable");

  // Build a multi-document message: CV first, then credential docs (labelled).
  // deno-lint-ignore no-explicit-any
  const content: any[] = [
    { type: "text", text: EXTRACTION_PROMPT },
    { type: "text", text: "=== DOKUMEN 1: CV utama ===" },
    { type: "image_url", image_url: { url: cvUrl } },
  ];
  let docN = 1;
  for (const c of await candidateCredDocs(doc.candidate_id)) {
    const url = await downloadDataUrl(c.file_path, c.mime_type);
    if (!url) continue;
    docN++;
    content.push({ type: "text", text: `=== DOKUMEN ${docN}: ${docLabel(c.doc_type)}${metaSummary(c.metadata)} ===` });
    content.push({ type: "image_url", image_url: { url } });
  }

  let res: Response, payload: Record<string, unknown> | null;
  try {
    ({ res, payload } = await callGateway(EXTRACT_MODEL, content, EXTRACTION_JSON_SCHEMA));
  } catch (e) { return await persistDocError(doc, "error", `gateway fetch: ${String(e).slice(0, 200)}`); }

  // deno-lint-ignore no-explicit-any
  const choice = (payload as any)?.choices?.[0]?.message?.content;
  // deno-lint-ignore no-explicit-any
  if (!res.ok || !choice) return await persistDocError(doc, "error", `gateway: ${String((payload as any)?.error?.message ?? `http ${res.status}`).slice(0, 200)}`);

  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(choice); } catch { return await persistDocError(doc, "needs_review", "model output not valid JSON"); }
  parsed.schema_version = CV_SCHEMA_VERSION;

  const kualitas = (parsed.kualitas as { skor_kelengkapan?: number; kekurangan?: string[] }) ?? {};
  const qualityScore = typeof kualitas.skor_kelengkapan === "number" ? Math.max(0, Math.min(100, Math.round(kualitas.skor_kelengkapan))) : null;

  const now = new Date();
  const derived = {
    umur: computeUmur((parsed.tanggal_lahir as string | null) ?? null, now),
    total_pengalaman_tahun: computeTotalPengalaman((parsed.pengalaman as Array<{ mulai: string | null; selesai: string | null }>) ?? [], now),
    dokumen_pendukung_dibaca: docN - 1,
    computed_at: now.toISOString(),
  };
  // deno-lint-ignore no-explicit-any
  const usage = (payload as any)?.usage ?? {};
  const cost = usage.cost ?? null;

  const { error } = await svc.from("cv_assessments").upsert({ candidate_id: doc.candidate_id, document_id: doc.id, parsed, derived, quality: { skor_kelengkapan: qualityScore, kekurangan: kualitas.kekurangan ?? [] }, quality_score: qualityScore, status: "ok", error: null, model: EXTRACT_MODEL, prompt_version: PROMPT_VERSION, tokens_in: usage.prompt_tokens ?? null, tokens_out: usage.completion_tokens ?? null, cost_usd: cost, updated_at: now.toISOString() }, { onConflict: "document_id" });
  if (error) return { ok: false, status: "error", error: `db upsert: ${error.message}` };
  return { ok: true, status: "ok" };
}

type AppRow = { id: string; candidate_id: string; position_slug: string; answers: Record<string, unknown> | null };
// deno-lint-ignore no-explicit-any
type FieldRow = { field_key: string; field_label: string; field_type: string; importance: string; options: any };

const fieldsCache = new Map<string, FieldRow[]>();
async function positionFields(slug: string): Promise<FieldRow[]> {
  if (fieldsCache.has(slug)) return fieldsCache.get(slug)!;
  const { data } = await svc.from("position_application_fields").select("field_key, field_label, field_type, importance, options").eq("position_slug", slug).order("sort_order", { ascending: true });
  const rows = (data ?? []) as FieldRow[];
  fieldsCache.set(slug, rows);
  return rows;
}

// Format the REAL position requirements (positions.content) for grounding the
// fit score — this is far richer than the application form screeners.
// deno-lint-ignore no-explicit-any
function formatPositionContent(content: any): string {
  if (!content || typeof content !== "object") return "";
  const parts: string[] = [];
  const bullets = (arr: unknown): string =>
    Array.isArray(arr) ? arr.filter((s) => typeof s === "string" && s.trim()).map((s) => `- ${s}`).join("\n") : "";
  const pairs = (arr: unknown): string =>
    Array.isArray(arr)
      ? (arr as Array<{ label?: unknown; value?: unknown }>)
          .filter((d) => d && typeof d.label === "string" && typeof d.value === "string")
          .map((d) => `- ${String(d.label)}: ${String(d.value)}`).join("\n")
      : "";
  const qual = bullets(content.qualifications);
  if (qual) parts.push(`Kualifikasi dibutuhkan:\n${qual}`);
  const job = bullets(content.jobDescription);
  if (job) parts.push(`Deskripsi pekerjaan:\n${job}`);
  const det = pairs(content.details);
  if (det) parts.push(`Detail posisi:\n${det}`);
  const ben = pairs(content.benefits);
  if (ben) parts.push(`Benefit:\n${ben}`);
  return parts.join("\n\n");
}

const posContextCache = new Map<string, string>();
async function positionContextText(slug: string): Promise<string> {
  if (posContextCache.has(slug)) return posContextCache.get(slug)!;
  const { data } = await svc.from("positions").select("content").eq("slug", slug).maybeSingle();
  const text = formatPositionContent((data as { content?: unknown } | null)?.content);
  posContextCache.set(slug, text);
  return text;
}

function optionLabel(field: FieldRow, val: string): string {
  const opts = Array.isArray(field.options) ? field.options : [];
  const o = opts.find((x: Record<string, unknown>) => String(x.value) === String(val));
  return o ? String(o.label ?? o.value) : String(val);
}
function renderAnswer(field: FieldRow, ans: unknown): string {
  if (Array.isArray(ans)) return ans.map((v) => optionLabel(field, String(v))).join(", ");
  return optionLabel(field, String(ans));
}

async function persistFitError(app: AppRow, status: string, error: string) {
  await svc.from("application_cv_fit").upsert({ application_id: app.id, position_slug: app.position_slug, status, model: FIT_MODEL, prompt_version: FIT_PROMPT_VERSION, reasons: { error }, updated_at: new Date().toISOString() }, { onConflict: "application_id" });
  return { ok: false, status, error };
}

async function scoreFit(app: AppRow): Promise<{ ok: boolean; status: string; error?: string }> {
  const { data: asmt } = await svc.from("cv_assessments").select("id, parsed").eq("candidate_id", app.candidate_id).eq("status", "ok").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!asmt) {
    await svc.from("application_cv_fit").upsert({ application_id: app.id, position_slug: app.position_slug, assessment_id: null, fit_score: null, status: "skipped", reasons: {}, verification: [], has_flags: false, model: FIT_MODEL, prompt_version: FIT_PROMPT_VERSION, updated_at: new Date().toISOString() }, { onConflict: "application_id" });
    return { ok: true, status: "skipped" };
  }

  const fields = await positionFields(app.position_slug);
  const fieldsText = fields.length
    ? fields.map((f) => {
        const opts = Array.isArray(f.options) && f.options.length
          ? ` (pilihan: ${f.options.map((o: Record<string, unknown>) => String(o.label ?? o.value)).join(" / ")})` : "";
        return `- [${f.importance}] ${f.field_label}${opts}`;
      }).join("\n")
    : "(tidak ada syarat terstruktur)";
  const answers = app.answers ?? {};
  const answersText = fields.filter((f) => answers[f.field_key] !== undefined && answers[f.field_key] !== "" && answers[f.field_key] !== null).map((f) => `- ${f.field_label}: ${renderAnswer(f, answers[f.field_key])}`).join("\n");

  const credDocs = await candidateCredDocs(app.candidate_id);
  const docsText = credDocs.map((c) => `- ${docLabel(c.doc_type)}${metaSummary(c.metadata)}`).join("\n");

  const cvJson = JSON.stringify(asmt.parsed);
  const prompt = buildFitPrompt(await positionName(app.position_slug), await positionContextText(app.position_slug), fieldsText, answersText, docsText, cvJson);

  let res: Response, payload: Record<string, unknown> | null;
  try { ({ res, payload } = await callGateway(FIT_MODEL, [{ type: "text", text: prompt }], FIT_JSON_SCHEMA)); } catch (e) { return await persistFitError(app, "error", `gateway fetch: ${String(e).slice(0, 200)}`); }

  // deno-lint-ignore no-explicit-any
  const choice = (payload as any)?.choices?.[0]?.message?.content;
  // deno-lint-ignore no-explicit-any
  if (!res.ok || !choice) return await persistFitError(app, "error", `gateway: ${String((payload as any)?.error?.message ?? `http ${res.status}`).slice(0, 200)}`);

  let out: {
    fit_score?: number; alasan?: string; yang_kurang?: string[];
    requirement_checks?: Array<{ syarat: string; status: string; bukti: string | null }>;
    verification?: Array<{ verdict: string }>;
  };
  try { out = JSON.parse(choice); } catch { return await persistFitError(app, "error", "model output not valid JSON"); }

  const fitScore = typeof out.fit_score === "number" ? Math.max(0, Math.min(100, Math.round(out.fit_score))) : null;
  const requirementChecks = Array.isArray(out.requirement_checks) ? out.requirement_checks : [];
  const verification = Array.isArray(out.verification) ? out.verification : [];
  const hasFlags = verification.some((v) => v.verdict === "contradicted");
  // deno-lint-ignore no-explicit-any
  const usage = (payload as any)?.usage ?? {};

  const { error } = await svc.from("application_cv_fit").upsert({ application_id: app.id, assessment_id: asmt.id, position_slug: app.position_slug, fit_score: fitScore, reasons: { alasan: out.alasan ?? "", yang_kurang: out.yang_kurang ?? [], requirement_checks: requirementChecks }, verification, has_flags: hasFlags, status: "ok", model: FIT_MODEL, prompt_version: FIT_PROMPT_VERSION, cost_usd: usage.cost ?? null, updated_at: new Date().toISOString() }, { onConflict: "application_id" });
  if (error) return { ok: false, status: "error", error: `db upsert: ${error.message}` };
  return { ok: true, status: "ok" };
}

const posNameCache = new Map<string, string>();
async function positionName(slug: string): Promise<string> {
  if (posNameCache.has(slug)) return posNameCache.get(slug)!;
  const { data } = await svc.from("positions").select("name").eq("slug", slug).maybeSingle();
  const name = (data?.name as string) ?? slug;
  posNameCache.set(slug, name);
  return name;
}

async function runPool<T>(items: T[], size: number, fn: (item: T) => Promise<unknown>) {
  for (let i = 0; i < items.length; i += size) await Promise.all(items.slice(i, i + size).map(fn));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!GATEWAY_KEY) return json({ error: "AI_GATEWAY_API_KEY not set" }, 500);

  const role = roleFromJwt(req);
  const privileged = role === "service_role" || role === "admin";
  const body = await req.json().catch(() => ({}));

  if (body.fit_backfill) {
    if (!privileged) return json({ error: "forbidden: requires admin" }, 403);
    const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 40);
    const { data: apps, error } = await svc.from("applications").select("id, candidate_id, position_slug, answers, application_cv_fit(status)").order("created_at", { ascending: true }).limit(800);
    if (error) return json({ error: error.message }, 500);
    const pending = (apps ?? []).filter((a: Record<string, unknown>) => { const f = a.application_cv_fit as Array<{ status: string }> | null; return !f?.length || f[0].status === "error"; });
    const batch = pending.slice(0, limit) as unknown as AppRow[];
    let ok = 0, skipped = 0, failed = 0;
    await runPool(batch, 4, async (app) => { const r = await scoreFit(app); r.ok ? (r.status === "skipped" ? skipped++ : ok++) : failed++; });
    return json({ mode: "fit_backfill", processed: batch.length, ok, skipped, failed, remaining: Math.max(0, pending.length - batch.length) });
  }

  // Single fit — privileged may re-fit any; a candidate may re-fit own.
  if (body.application_id) {
    const { data: app, error } = await svc.from("applications").select("id, candidate_id, position_slug, answers").eq("id", body.application_id).single();
    if (error || !app) return json({ error: "application not found" }, 404);
    if (!privileged) {
      const sub = subFromJwt(req);
      const { data: owner } = await svc.from("candidates").select("id").eq("id", app.candidate_id).eq("auth_user_id", sub).maybeSingle();
      if (!owner) return json({ error: "forbidden" }, 403);
    }
    const result = await scoreFit(app as AppRow);
    return json({ mode: "fit", application_id: body.application_id, ...result }, result.ok ? 200 : 422);
  }

  if (body.backfill) {
    if (!privileged) return json({ error: "forbidden: backfill requires admin" }, 403);
    const limit = Math.min(Math.max(Number(body.limit) || 30, 1), 60);
    const { data: docs, error } = await svc.from("candidate_documents").select("id, candidate_id, file_path, mime_type, cv_assessments(status)").eq("doc_type", "cv").order("uploaded_at", { ascending: true }).limit(500);
    if (error) return json({ error: error.message }, 500);
    const pending = (docs ?? []).filter((d: Record<string, unknown>) => { const a = d.cv_assessments as Array<{ status: string }> | null; return !a?.length || a[0].status === "error"; });
    const batch = pending.slice(0, limit) as unknown as DocRow[];
    let ok = 0, failed = 0;
    await runPool(batch, 4, async (doc) => { const r = await gradeOne(doc); r.ok ? ok++ : failed++; });
    return json({ mode: "backfill", processed: batch.length, ok, failed, remaining: Math.max(0, pending.length - batch.length) });
  }

  const documentId = body.document_id;
  if (!documentId) return json({ error: "document_id, application_id, backfill, or fit_backfill required" }, 400);
  const { data: doc, error } = await svc.from("candidate_documents").select("id, candidate_id, file_path, mime_type, doc_type").eq("id", documentId).single();
  if (error || !doc) return json({ error: "document not found" }, 404);
  if (doc.doc_type !== "cv") return json({ error: "not a CV document" }, 400);
  if (!privileged) {
    const sub = subFromJwt(req);
    const { data: owner } = await svc.from("candidates").select("id").eq("id", doc.candidate_id).eq("auth_user_id", sub).maybeSingle();
    if (!owner) return json({ error: "forbidden" }, 403);
  }
  const result = await gradeOne(doc as DocRow);
  // Auto-fit this candidate's NON-TERMINAL applications once the CV is parsed.
  if (result.ok) {
    const { data: apps } = await svc.from("applications")
      .select("id, candidate_id, position_slug, answers")
      .eq("candidate_id", doc.candidate_id)
      .not("pipeline_stage", "in", "(rejected,exit)");
    await runPool((apps ?? []) as AppRow[], 4, (app) => scoreFit(app));
  }
  return json({ mode: "single", document_id: documentId, ...result }, result.ok ? 200 : 422);
});
