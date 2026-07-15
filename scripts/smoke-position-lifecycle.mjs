#!/usr/bin/env node
/**
 * Position lifecycle smoke test (Fase 2.5) - the CI/canary guard for the
 * visibility + activation-invariant contract that used to only be caught by a
 * manual audit (findings A1/A2/C1/E1).
 *
 * It drives a throwaway position end-to-end against the LIVE database and
 * asserts the contract holds, then cleans up after itself:
 *
 *   1. create a draft (active=false) with full content + published_at
 *   2. add one effectively-screening field (required radio + a Lolos option)
 *   3. activate it            -> MUST succeed (ready position)
 *   4. anon read              -> MUST see it (RLS active=true)
 *   5. activate a no-screening twin -> MUST be rejected by the DB trigger (0104)
 *   6. deactivate #1          -> anon read MUST NOT see it (nonaktif = hilang)
 *   7. cleanup                -> delete both + any fields/aliases
 *
 * Step 5 only passes once migration 0104 (enforce_position_activation_invariant)
 * is applied - before that the DB has no trigger and the twin activates. Run
 * this AFTER the Fase 2 rollout. Everything else passes on 0103 already.
 *
 * Env (process.env first for CI, then PG_ENV_FILE / apps/web/.env.local locally):
 *   SUPABASE_URL_V2 (or NEXT_PUBLIC_SUPABASE_URL) - the V2 project URL
 *   SUPABASE_SERVICE_ROLE_KEY_V2 (or SUPABASE_SERVICE_ROLE_KEY) - write client
 *   SUPABASE_ANON_KEY_V2 (or NEXT_PUBLIC_SUPABASE_ANON_KEY) - anon read client
 *
 * Usage: node scripts/smoke-position-lifecycle.mjs   (exit 0 = pass, 1 = fail)
 */
import { readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "..");
const V2_REF = "jeadtvxgxmqnsqwxjmhj";

function fileEnv() {
  try {
    const envPath = process.env.PG_ENV_FILE || join(REPO, "apps/web/.env.local");
    const raw = readFileSync(envPath, "utf8");
    const env = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      env[m[1]] = v;
    }
    return env;
  } catch {
    return {};
  }
}

const fe = fileEnv();
const pick = (...keys) => {
  for (const k of keys) {
    if (process.env[k]) return process.env[k];
    if (fe[k]) return fe[k];
  }
  return undefined;
};

const SUPABASE_URL =
  pick("SUPABASE_URL_V2", "NEXT_PUBLIC_SUPABASE_URL_V2", "NEXT_PUBLIC_SUPABASE_URL") ||
  `https://${V2_REF}.supabase.co`;
const SERVICE_KEY = pick("SUPABASE_SERVICE_ROLE_KEY_V2", "SUPABASE_SERVICE_ROLE_KEY");
const ANON_KEY = pick("SUPABASE_ANON_KEY_V2", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY");

if (!SERVICE_KEY || !ANON_KEY) {
  console.error("Missing SERVICE_ROLE and/or ANON key for the V2 project.");
  process.exit(1);
}

/** Fail fast on a service key pointed at the wrong project. */
function keyRef(jwt) {
  try {
    const payload = JSON.parse(
      Buffer.from(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(),
    );
    return payload.ref ?? null;
  } catch {
    return null;
  }
}
const urlRef = new URL(SUPABASE_URL).host.split(".")[0];
const ref = keyRef(SERVICE_KEY);
if (ref && ref !== urlRef) {
  console.error(`Service key is for "${ref}" but URL is "${urlRef}". Aborting.`);
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anon = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const stamp = Date.now();
const LIVE = `zzz-smoke-live-${stamp}`;
const TWIN = `zzz-smoke-noscreen-${stamp}`;

const READY_CONTENT = {
  hero: { metaLine: "Smoke test" },
  cardMeta: {
    icon: "briefcase",
    salary: "Rp 0",
    salaryNote: "smoke",
    gender: "L/P",
    age: "20-40",
  },
  jobDescription: ["a", "b", "c"],
  qualifications: ["x", "y"],
  process: ["step"],
  fee: { amount: "0", breakdown: [] },
  media: { heroUrl: "https://example.com/x.jpg" },
};

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` - ${detail}` : ""}`);
  if (!ok) failures++;
}

async function insertDraft(slug) {
  return admin.from("positions").insert({
    slug,
    name: `Smoke ${slug}`,
    role: slug,
    country: "indonesia", // valid registry db_value (country FK, 0104)
    active: false,
    content: READY_CONTENT,
    published_at: new Date().toISOString(),
  });
}

async function cleanup() {
  await admin.from("position_application_fields").delete().in("position_slug", [LIVE, TWIN]);
  await admin.from("position_slug_aliases").delete().in("new_slug", [LIVE, TWIN]);
  await admin.from("positions").delete().in("slug", [LIVE, TWIN]);
}

async function main() {
  await cleanup(); // in case a prior run died mid-way

  // 1) draft with full content
  const { error: e1 } = await insertDraft(LIVE);
  check("create draft #1", !e1, e1?.message);

  // 2) one effectively-screening field
  const { error: e2 } = await admin.from("position_application_fields").insert({
    position_slug: LIVE,
    field_key: "smoke_gate",
    field_label: "Smoke gate",
    field_type: "radio",
    importance: "required",
    section: "syarat_utama",
    options: [
      { value: "ya", label: "Ya", qualifying: true },
      { value: "tidak", label: "Tidak" },
    ],
    collect_at_stage: "applied",
  });
  check("add screening field", !e2, e2?.message);

  // 3) activate ready position -> must succeed
  const { error: e3 } = await admin.from("positions").update({ active: true }).eq("slug", LIVE);
  check("activate ready position", !e3, e3?.message);

  // 4) anon must see it
  const { data: seen } = await anon
    .from("positions")
    .select("slug")
    .eq("slug", LIVE)
    .eq("active", true);
  check("anon sees active position", (seen?.length ?? 0) === 1);

  // 5) no-screening twin must be REJECTED at activation (0104 trigger)
  await insertDraft(TWIN); // content + published_at, but no screening field
  const { error: e5 } = await admin.from("positions").update({ active: true }).eq("slug", TWIN);
  check(
    "activation blocked without screening (needs 0104)",
    !!e5,
    e5 ? `rejected: ${e5.message}` : "TWIN activated - invariant NOT enforced",
  );

  // 6) deactivate #1 -> anon must NOT see it
  await admin.from("positions").update({ active: false }).eq("slug", LIVE);
  const { data: gone } = await anon
    .from("positions")
    .select("slug")
    .eq("slug", LIVE)
    .eq("active", true);
  check("anon does not see inactive position", (gone?.length ?? 0) === 0);
}

main()
  .catch((e) => {
    console.error("smoke crashed:", e);
    failures++;
  })
  .finally(async () => {
    await cleanup();
    console.log(`\n${failures === 0 ? "SMOKE OK" : `SMOKE FAILED (${failures})`}`);
    process.exit(failures === 0 ? 0 : 1);
  });
