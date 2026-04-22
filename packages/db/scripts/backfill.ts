#!/usr/bin/env tsx
/**
 * Backfill legacy gt-tools Supabase data → new perantauglobal schema.
 *
 * Reads 3 candidate-producing tables from gt-tools, dedupes by (lowercased
 * email), and inserts into `candidates` + `applications` + synthetic
 * `consents` rows in the new project. auth_user_id stays NULL —
 * trigger `handle_new_auth_user` in migration 0003 will link on first
 * magic-link sign-in.
 *
 * Legacy source tables mapped:
 *   - candidate_applications  (lowongan — role + country + role_data)
 *   - tdp_registrations       (truck-driver-jepang)
 *   - gth_registrations       (global-talent-hub)
 *
 * Not mapped (intentional):
 *   - spg_applicants      — custom scoring; backfill via admin port (Task 10)
 *   - registrations       — generic /daftar; schema unclear, revisit if needed
 *   - contact_submissions — not candidate data
 *   - employer_inquiries  — B2B, different schema domain
 *
 * Idempotent: candidates with `source = 'backfill_gt_tools'` are detected by
 * email and skipped on re-run. Pass `--force` to re-import (dangerous).
 *
 * Usage:
 *   GT_TOOLS_URL=... GT_TOOLS_SERVICE_ROLE_KEY=... \
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   pnpm --filter @perantauglobal/db backfill -- --dry-run
 *
 * Flags:
 *   --dry-run    (default) read + transform but do not write
 *   --apply      actually insert into new Supabase
 *   --force      re-import emails that already exist with source=backfill_gt_tools
 *   --table=X    only process one source table (candidate_applications|tdp|gth)
 *   --limit=N    read max N rows per source table (debugging)
 */

import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "../src/server";
import type { Json } from "../src/types";

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const has = (flag: string) => argv.includes(flag);
const valueOf = (flag: string): string | undefined => {
  const hit = argv.find((a) => a.startsWith(`${flag}=`));
  return hit ? hit.split("=")[1] : undefined;
};

const dryRun = has("--dry-run") || !has("--apply");
const force = has("--force");
const onlyTable = valueOf("--table");
const rowLimit = Number(valueOf("--limit") ?? "0") || undefined;

// ---------------------------------------------------------------------------
// Env + clients
// ---------------------------------------------------------------------------

const LEGACY_URL = process.env.GT_TOOLS_URL;
const LEGACY_KEY = process.env.GT_TOOLS_SERVICE_ROLE_KEY;
const TARGET_URL = process.env.SUPABASE_URL;
const TARGET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!LEGACY_URL || !LEGACY_KEY) {
  console.error("backfill: GT_TOOLS_URL + GT_TOOLS_SERVICE_ROLE_KEY required");
  process.exit(1);
}
if (!TARGET_URL || !TARGET_KEY) {
  console.error("backfill: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required");
  process.exit(1);
}

// Legacy gt-tools has its own unknown schema — use an untyped client so we
// can freely read tables that aren't in our current Database generic.
const legacy = createClient(LEGACY_URL, LEGACY_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const target = createServiceRoleClient(TARGET_URL, TARGET_KEY);

// ---------------------------------------------------------------------------
// Mappings — legacy role+country → new positions.slug
// ---------------------------------------------------------------------------

const ROLE_COUNTRY_TO_SLUG: Record<string, string> = {
  "nurse|saudi_arabia": "perawat-saudi-arabia",
  "barista|saudi_arabia": "barista-saudi-arabia",
  "waiter|saudi_arabia": "waiter-saudi-arabia",
  "kaigo|japan": "kaigo-jepang",
  "food_service|japan": "food-service-jepang",
  "truck_driver|japan": "truck-driver-jepang",
};

// Normalise legacy truck-driver `driving_experience` → new `driving_years` enum.
const MAP_DRIVING = (v: unknown): string | null => {
  const s = String(v ?? "").toLowerCase();
  if (["1-2", "3-5", "5+"].includes(s)) return s;
  if (s.includes("less") || s.includes("<1") || s.includes("<2")) return "1-2";
  if (s.includes("3") || s.includes("4") || s.includes("5")) return "3-5";
  if (s.includes("more") || s.includes(">") || s.includes("10")) return "5+";
  return null;
};

const MAP_JLPT = (v: unknown): string | null => {
  const s = String(v ?? "").toLowerCase().replace(/\s+/g, "");
  if (["n5", "n4", "n3", "n2"].some((n) => s.includes(n))) {
    return s.match(/n[2-5]/)![0];
  }
  if (s.includes("none") || s.includes("no_cert") || s === "") return "no_cert";
  return "no_cert";
};

// ---------------------------------------------------------------------------
// Types (minimal — legacy schemas)
// ---------------------------------------------------------------------------

interface LegacyCandidateApp {
  id: string;
  full_name: string;
  whatsapp: string;
  email: string;
  city: string | null;
  birth_date: string | null;
  gender: string | null;
  education: string | null;
  role: string;
  country: string;
  role_data: Record<string, unknown> | null;
  source_url: string | null;
  created_at: string;
}

interface LegacyTdp {
  id: string;
  full_name: string;
  whatsapp: string;
  email: string;
  city: string | null;
  age: number | null;
  education: string | null;
  sim_type: string | null;
  sim_issued_year: number | null;
  driving_experience: string | null;
  japanese_level: string | null;
  has_ssw_certificate: boolean | null;
  created_at: string;
}

interface LegacyGth {
  id: string;
  full_name: string;
  whatsapp: string;
  email: string;
  city: string | null;
  education: string | null;
  current_status: string | null;
  interested_country: string | null;
  has_lpk: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Sanitize phone to match DB check constraint: ^\+?[0-9]{8,15}$
// Strips spaces, dashes, parens. Preserves leading `+`. Returns null if
// the result doesn't fit the 8-15 digit window (keeps DB insert clean).
// ---------------------------------------------------------------------------

function sanitizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return hasPlus ? `+${digits}` : digits;
}

// ---------------------------------------------------------------------------
// Transform — shared output shape
// ---------------------------------------------------------------------------

interface CandidateImport {
  email: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  birth_date: string | null;
  gender: string | null;
  education: string | null;
  profile_data: Record<string, unknown>;
  legacy_source_table: string;
  legacy_created_at: string;
  applications: Array<{
    position_slug: string;
    answers: Record<string, unknown>;
  }>;
}

function transformLowongan(row: LegacyCandidateApp): CandidateImport | null {
  const slug = ROLE_COUNTRY_TO_SLUG[`${row.role}|${row.country}`];
  if (!slug) return null;
  const roleData = row.role_data ?? {};
  return {
    email: row.email.toLowerCase().trim(),
    full_name: row.full_name,
    phone: sanitizePhone(row.whatsapp),
    city: row.city,
    birth_date: row.birth_date,
    gender: row.gender,
    education: row.education,
    profile_data: roleData,
    legacy_source_table: "candidate_applications",
    legacy_created_at: row.created_at,
    applications: [{ position_slug: slug, answers: roleData }],
  };
}

function transformTdp(row: LegacyTdp): CandidateImport {
  const profile: Record<string, unknown> = {
    sim_type: row.sim_type,
    driving_years: MAP_DRIVING(row.driving_experience),
    jlpt_level: MAP_JLPT(row.japanese_level),
    has_ssw_certificate: row.has_ssw_certificate,
    sim_issued_year: row.sim_issued_year,
  };
  return {
    email: row.email.toLowerCase().trim(),
    full_name: row.full_name,
    phone: sanitizePhone(row.whatsapp),
    city: row.city,
    birth_date: null,
    gender: null,
    education: row.education,
    profile_data: profile,
    legacy_source_table: "tdp_registrations",
    legacy_created_at: row.created_at,
    applications: [{ position_slug: "truck-driver-jepang", answers: profile }],
  };
}

function transformGth(row: LegacyGth): CandidateImport {
  const profile: Record<string, unknown> = {
    current_status: row.current_status,
    interested_country: row.interested_country,
    has_lpk: row.has_lpk,
  };
  return {
    email: row.email.toLowerCase().trim(),
    full_name: row.full_name,
    phone: sanitizePhone(row.whatsapp),
    city: row.city,
    birth_date: null,
    gender: null,
    education: row.education,
    profile_data: profile,
    legacy_source_table: "gth_registrations",
    legacy_created_at: row.created_at,
    applications: [{ position_slug: "global-talent-hub", answers: profile }],
  };
}

// ---------------------------------------------------------------------------
// Dedupe — merge multiple imports for same email into one candidate
// ---------------------------------------------------------------------------

function dedupe(rows: CandidateImport[]): CandidateImport[] {
  const byEmail = new Map<string, CandidateImport>();
  for (const r of rows) {
    if (!r.email || !r.email.includes("@")) continue;
    const prev = byEmail.get(r.email);
    if (!prev) {
      byEmail.set(r.email, r);
      continue;
    }
    byEmail.set(r.email, {
      ...prev,
      full_name: prev.full_name || r.full_name,
      phone: prev.phone || r.phone,
      city: prev.city || r.city,
      birth_date: prev.birth_date || r.birth_date,
      gender: prev.gender || r.gender,
      education: prev.education || r.education,
      profile_data: { ...r.profile_data, ...prev.profile_data },
      applications: [...prev.applications, ...r.applications],
      legacy_source_table: `${prev.legacy_source_table}+${r.legacy_source_table}`,
      legacy_created_at:
        prev.legacy_created_at < r.legacy_created_at
          ? prev.legacy_created_at
          : r.legacy_created_at,
    });
  }
  return [...byEmail.values()];
}

// ---------------------------------------------------------------------------
// Write to target
// ---------------------------------------------------------------------------

async function alreadyImported(email: string): Promise<boolean> {
  const { data } = await target
    .from("candidates")
    .select("id")
    .eq("email", email)
    .eq("source", "backfill_gt_tools")
    .maybeSingle();
  return Boolean(data);
}

async function insertOne(c: CandidateImport): Promise<
  | { ok: true; candidate_id: string; applications_inserted: number }
  | { ok: false; reason: string }
> {
  const { data: candRow, error: candErr } = await target
    .from("candidates")
    .insert({
      email: c.email,
      full_name: c.full_name || "Unknown",
      phone: c.phone,
      city: c.city,
      birth_date: c.birth_date,
      gender: c.gender,
      education: c.education,
      profile_data: c.profile_data as unknown as Json,
      source: "backfill_gt_tools",
    })
    .select("id")
    .single();

  if (candErr || !candRow) {
    return { ok: false, reason: candErr?.message ?? "unknown candidates insert err" };
  }

  // Dedupe applications by position_slug — legacy allowed multiple applies
  // to the same position; new schema enforces uniq_candidate_position. Merge
  // answers (later entries win on overlapping keys).
  const byPosition = new Map<string, Record<string, unknown>>();
  for (const a of c.applications) {
    const prev = byPosition.get(a.position_slug) ?? {};
    byPosition.set(a.position_slug, { ...prev, ...a.answers });
  }
  const appRows = [...byPosition.entries()].map(([position_slug, answers]) => ({
    candidate_id: candRow.id,
    position_slug,
    answers: answers as unknown as Json,
    pipeline_stage: "applied" as const,
    created_at: c.legacy_created_at,
  }));
  const { error: appErr } = await target
    .from("applications")
    .insert(appRows);
  if (appErr) {
    return { ok: false, reason: `applications: ${appErr.message}` };
  }

  // Synthetic consent — marks that backfill preserved the original intent.
  await target.from("consents").insert({
    candidate_id: candRow.id,
    purpose: "application_processing",
    purpose_text:
      "Memproses lamaran kerja (di-import dari sistem sebelumnya, gt-tools).",
    version: "backfill-2026-04-22",
    granted_at: c.legacy_created_at,
  });

  return {
    ok: true,
    candidate_id: candRow.id,
    applications_inserted: appRows.length,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function readLegacy<T>(table: string): Promise<T[]> {
  let query = legacy.from(table).select("*").order("created_at", { ascending: true });
  if (rowLimit) query = query.limit(rowLimit);
  const { data, error } = await query;
  if (error) throw new Error(`legacy.${table}: ${error.message}`);
  return (data ?? []) as T[];
}

async function main() {
  console.log("[backfill] starting");
  console.log(`[backfill] dry-run=${dryRun} force=${force} table=${onlyTable ?? "all"} limit=${rowLimit ?? "none"}`);

  const all: CandidateImport[] = [];

  if (!onlyTable || onlyTable === "candidate_applications") {
    const rows = await readLegacy<LegacyCandidateApp>("candidate_applications");
    console.log(`[backfill] candidate_applications: ${rows.length} rows`);
    for (const r of rows) {
      const c = transformLowongan(r);
      if (c) all.push(c);
    }
  }

  if (!onlyTable || onlyTable === "tdp") {
    const rows = await readLegacy<LegacyTdp>("tdp_registrations");
    console.log(`[backfill] tdp_registrations: ${rows.length} rows`);
    for (const r of rows) all.push(transformTdp(r));
  }

  if (!onlyTable || onlyTable === "gth") {
    const rows = await readLegacy<LegacyGth>("gth_registrations");
    console.log(`[backfill] gth_registrations: ${rows.length} rows`);
    for (const r of rows) all.push(transformGth(r));
  }

  const merged = dedupe(all);
  console.log(`[backfill] merged: ${all.length} rows → ${merged.length} unique candidates`);

  if (dryRun) {
    console.log("[backfill] DRY RUN — no writes. First 3 candidates:");
    console.log(JSON.stringify(merged.slice(0, 3), null, 2));
    console.log(`[backfill] would insert ${merged.length} candidates`);
    return;
  }

  let inserted = 0;
  let skipped = 0;
  let failed = 0;
  for (const c of merged) {
    if (!force && (await alreadyImported(c.email))) {
      skipped += 1;
      continue;
    }
    const result = await insertOne(c);
    if (result.ok) {
      inserted += 1;
      if (inserted % 25 === 0) {
        console.log(`[backfill] inserted ${inserted} so far...`);
      }
    } else {
      failed += 1;
      console.warn(`[backfill] FAIL ${c.email}: ${result.reason}`);
    }
  }

  console.log(`[backfill] done: inserted=${inserted} skipped=${skipped} failed=${failed}`);
}

main().catch((err) => {
  console.error("[backfill] fatal:", err);
  process.exit(1);
});
