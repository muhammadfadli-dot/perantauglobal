// grade-cv-preview — apply-step "CV di depan" fit preview.
//
// Powers the position-fit shown on the PUBLIC apply form, where the candidate
// has NO account/application/candidate row yet. Reads the just-uploaded file
// straight from the `pending-cv` bucket, runs extraction + fit IN-MEMORY keyed
// only on position_slug + the apply answers, and returns the candidate-safe fit
// inline. NOTHING is persisted (no cv_assessments / application_cv_fit) and no
// candidate PII is written.
//
// Auth: deployed with verify_jwt=FALSE and gated on a shared CV_PREVIEW_SECRET
// header. Only the apps/web API route (which holds the secret) can reach it, so
// the LLM path is never anon-exposed. It is deliberately SEPARATE from grade-cv:
// grade-cv keeps verify_jwt=true because its privileged branches (backfill/fit)
// authenticate the role claim via the verified JWT — this preview has no
// privileged operation to forge into, so verify_jwt=false is safe here.

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  EXTRACT_MODEL, EXTRACTION_JSON_SCHEMA, EXTRACTION_PROMPT,
  FIT_MODEL, FIT_JSON_SCHEMA, buildFitPrompt,
} from "./schema.ts";

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GATEWAY_KEY = Deno.env.get("AI_GATEWAY_API_KEY") ?? "";
const PREVIEW_SECRET = Deno.env.get("CV_PREVIEW_SECRET") ?? "";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-preview-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...CORS } });

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

async function downloadDataUrl(bucket: string, filePath: string, mime: string | null): Promise<string | null> {
  const dl = await svc.storage.from(bucket).download(filePath);
  if (dl.error || !dl.data) return null;
  const bytes = new Uint8Array(await dl.data.arrayBuffer());
  return `data:${mime || "application/pdf"};base64,${toBase64(bytes)}`;
}

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

const posNameCache = new Map<string, string>();
async function positionName(slug: string): Promise<string> {
  if (posNameCache.has(slug)) return posNameCache.get(slug)!;
  const { data } = await svc.from("positions").select("name").eq("slug", slug).maybeSingle();
  const name = (data?.name as string) ?? slug;
  posNameCache.set(slug, name);
  return name;
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

type PreviewFit = {
  fit_score: number | null;
  alasan: string;
  yang_kurang: string[];
  requirement_checks: Array<{ syarat: string; status: string; bukti: string | null }>;
};

// CV path is the caller's own staged object: pending/<uuid>/cv.<ext> in pending-cv.
const PENDING_CV_PATH_RE = /^pending\/[0-9a-f-]{36}\/cv\.(pdf|jpe?g|png|heic|heif|webp)$/i;

async function previewFit(input: {
  cv_path: string; cv_mime: string | null; position_slug: string; answers: Record<string, unknown> | null;
}): Promise<{ ok: true; fit: PreviewFit } | { ok: false; error: string; unreadable?: boolean }> {
  if (!PENDING_CV_PATH_RE.test(input.cv_path)) return { ok: false, error: "bad cv_path" };
  if (!input.position_slug) return { ok: false, error: "no position" };

  // 1. Extract the CV in-memory from pending-cv (single doc — no credential docs
  //    exist pre-account). Same prompt/model/schema as the persisted path.
  //    unreadable=true marks a genuine "we couldn't read this file" so the apply
  //    form can nudge the candidate to re-upload a clearer one (WS-7a).
  const cvUrl = await downloadDataUrl("pending-cv", input.cv_path, input.cv_mime);
  if (!cvUrl) return { ok: false, error: "cv not readable", unreadable: true };
  // deno-lint-ignore no-explicit-any
  const extractContent: any[] = [
    { type: "text", text: EXTRACTION_PROMPT },
    { type: "text", text: "=== DOKUMEN 1: CV utama ===" },
    { type: "image_url", image_url: { url: cvUrl } },
  ];
  let parsed: Record<string, unknown>;
  try {
    const { res, payload } = await callGateway(EXTRACT_MODEL, extractContent, EXTRACTION_JSON_SCHEMA);
    // deno-lint-ignore no-explicit-any
    const choice = (payload as any)?.choices?.[0]?.message?.content;
    if (!res.ok || !choice) return { ok: false, error: "extract failed", unreadable: true };
    parsed = JSON.parse(choice);
  } catch { return { ok: false, error: "extract error", unreadable: true }; }

  // 2. Fit against the position's REAL requirements + this applicant's answers.
  const slug = input.position_slug;
  const fields = await positionFields(slug);
  const fieldsText = fields.length
    ? fields.map((f) => {
        const opts = Array.isArray(f.options) && f.options.length
          ? ` (pilihan: ${f.options.map((o: Record<string, unknown>) => String(o.label ?? o.value)).join(" / ")})` : "";
        return `- [${f.importance}] ${f.field_label}${opts}`;
      }).join("\n")
    : "(tidak ada syarat terstruktur)";
  const answers = input.answers ?? {};
  const answersText = fields
    .filter((f) => answers[f.field_key] !== undefined && answers[f.field_key] !== "" && answers[f.field_key] !== null)
    .map((f) => `- ${f.field_label}: ${renderAnswer(f, answers[f.field_key])}`).join("\n");
  const prompt = buildFitPrompt(
    await positionName(slug), await positionContextText(slug), fieldsText, answersText, "", JSON.stringify(parsed),
  );
  try {
    const { res, payload } = await callGateway(FIT_MODEL, [{ type: "text", text: prompt }], FIT_JSON_SCHEMA);
    // deno-lint-ignore no-explicit-any
    const choice = (payload as any)?.choices?.[0]?.message?.content;
    if (!res.ok || !choice) return { ok: false, error: "fit failed" };
    const out = JSON.parse(choice) as Partial<PreviewFit> & { fit_score?: number };
    const fitScore = typeof out.fit_score === "number" ? Math.max(0, Math.min(100, Math.round(out.fit_score))) : null;
    return {
      ok: true,
      fit: {
        fit_score: fitScore,
        alasan: out.alasan ?? "",
        yang_kurang: Array.isArray(out.yang_kurang) ? out.yang_kurang : [],
        requirement_checks: Array.isArray(out.requirement_checks) ? out.requirement_checks : [],
      },
    };
  } catch { return { ok: false, error: "fit error" }; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!GATEWAY_KEY) return json({ error: "AI_GATEWAY_API_KEY not set" }, 500);
  // Shared-secret gate — only the apps/web API route can reach this.
  if (!PREVIEW_SECRET || req.headers.get("x-preview-secret") !== PREVIEW_SECRET) {
    return json({ error: "forbidden" }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const r = await previewFit({
    cv_path: String(body.cv_path ?? ""),
    cv_mime: body.cv_mime != null ? String(body.cv_mime) : null,
    position_slug: String(body.position_slug ?? ""),
    answers: (body.answers ?? null) as Record<string, unknown> | null,
  });
  // Always 200 so the same-origin proxy route can read the body (ok flag +
  // unreadable reason). Non-ok is signalled in the JSON, not the HTTP status.
  return json({ mode: "preview", ...r }, 200);
});
