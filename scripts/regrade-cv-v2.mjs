#!/usr/bin/env node
// regrade-cv-v2.mjs — one-off backfill to bring the CV grader pool to v2.
//
// Phase 1: extraction backfill — grade every ungraded CV (status != ok).
//          grade-cv auto-fits the candidate's non-terminal apps after extraction,
//          so newly-graded candidates get v2 fit (with requirement_checks) too.
// Phase 2: re-fit EVERY non-terminal application with v2. Idempotent: apps whose
//          candidate has no graded CV self-skip (status='skipped', cheap, no AI
//          call); apps with a CV get re-scored against the position's real
//          requirements + a requirement_checks checklist. This is the reliable
//          alternative to grade-cv's fit_backfill mode, which truncates at the
//          oldest 800 apps (known bug) and skips already-ok fits.
//
// Auth: needs the JWT-format service_role key (eyJ...), NOT an sb_secret_ key —
// grade-cv reads the role claim from the JWT, so sb_secret_ -> 403.
//
// Run (from anywhere, Node 18+):
//   SUPABASE_SERVICE_ROLE_KEY="eyJ..." node regrade-cv-v2.mjs
//   # optional: SUPABASE_URL=... (defaults to the prod project)
//   # optional: ONLY_EXTRACT=1 (Phase 1 only)  |  ONLY_FIT=1 (Phase 2 only)
//
// Safe to re-run. ~30–45 min for the full pool; run in a screen/background shell.

const URL = process.env.SUPABASE_URL || "https://jeadtvxgxmqnsqwxjmhj.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!KEY.startsWith("eyJ")) {
  console.error("ERROR: set SUPABASE_SERVICE_ROLE_KEY to the JWT-format service_role key (eyJ...), not sb_secret_.");
  process.exit(1);
}
const FN = `${URL}/functions/v1/grade-cv`;
const REST = `${URL}/rest/v1`;
const H = { Authorization: `Bearer ${KEY}`, apikey: KEY, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callFn(body) {
  const r = await fetch(FN, { method: "POST", headers: H, body: JSON.stringify(body) });
  const json = await r.json().catch(() => null);
  return { status: r.status, json };
}

async function phaseExtract() {
  console.log("\n=== Phase 1: extraction backfill (ungraded CVs) ===");
  // SMALL batch: v2 multi-doc extraction is ~15s/CV and the edge fn caps at 150s,
  // so >~8 per call risks IDLE_TIMEOUT. 6 keeps each call ~30-45s. Resilient: a
  // 504 still made server-side progress (backfill is idempotent), so keep looping.
  const LIMIT = Number(process.env.EXTRACT_LIMIT) || 6;
  let prev = Infinity, stuck = 0, softFail = 0;
  for (let round = 1; round <= 80; round++) {
    const { status, json } = await callFn({ backfill: true, limit: LIMIT });
    if (status !== 200) {
      console.log(`  round ${round}: HTTP ${status} ${json?.code || ""} — server likely still graded some, continuing`);
      if (++softFail >= 5) { console.log("  too many consecutive errors, stopping"); break; }
      await sleep(1500);
      continue;
    }
    softFail = 0;
    console.log(`  round ${round}: processed=${json.processed} ok=${json.ok} failed=${json.failed} remaining=${json.remaining}`);
    if (json.remaining === 0 || !json.processed) break;
    if (json.remaining >= prev) { if (++stuck >= 3) { console.log("  no progress 3x, stopping"); break; } } else stuck = 0;
    prev = json.remaining;
    await sleep(500);
  }
}

async function phaseFit() {
  console.log("\n=== Phase 2: fit applications that still need it (v2) ===");
  // PAGINATE: PostgREST caps each response at ~1000 rows. The old single
  // `limit=5000` fetch silently returned only the first 1000 of 1173 apps, so
  // ~173 (incl graded-CV ones) were never re-fit and stayed "Belum dinilai".
  // Embed the fit status so we only (re)fit apps WITHOUT an ok fit — this also
  // avoids re-shifting the scores of apps already fitted (LLM run-to-run drift).
  const all = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const r = await fetch(
      `${REST}/applications?pipeline_stage=not.in.(rejected,exit)&select=id,application_cv_fit(status)&order=created_at.asc&offset=${from}&limit=${PAGE}`,
      { headers: H }
    );
    const page = await r.json().catch(() => []);
    if (!Array.isArray(page) || page.length === 0) break;
    all.push(...page);
    if (page.length < PAGE) break;
  }
  const pending = all.filter((a) => {
    const f = a.application_cv_fit;
    const arr = Array.isArray(f) ? f : f ? [f] : [];
    return !(arr.length && arr[0].status === "ok");
  });
  console.log(`  ${all.length} non-terminal apps; ${pending.length} need a fit`);
  let done = 0, ok = 0, skipped = 0, failed = 0;
  const CONC = 3;
  for (let i = 0; i < pending.length; i += CONC) {
    await Promise.all(
      pending.slice(i, i + CONC).map(async (a) => {
        const { status, json } = await callFn({ application_id: a.id });
        done++;
        if (status === 200 && json?.ok) (json.status === "skipped" ? skipped++ : ok++);
        else failed++;
        if (done % 25 === 0 || done === pending.length)
          console.log(`  ${done}/${pending.length}  (fit=${ok} skip=${skipped} fail=${failed})`);
      })
    );
  }
  console.log(`  Phase 2 done: fit=${ok} skipped=${skipped} failed=${failed}`);
}

const onlyExtract = process.env.ONLY_EXTRACT === "1";
const onlyFit = process.env.ONLY_FIT === "1";
if (!onlyFit) await phaseExtract();
if (!onlyExtract) await phaseFit();
console.log("\nAll done.");
