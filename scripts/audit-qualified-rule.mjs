#!/usr/bin/env node
// audit-qualified-rule.mjs — READ-ONLY dry-run for the "Sudah qualified" rule change
// (bug report Zalfa 2026-08-03: tab qualified di /admin/candidates).
//
// OLD rule: candidate is qualified when ANY application has hard_pass = true
//           (qualifying answers only — CV fit never checked).
// NEW rule: candidate is qualified when at least ONE application has, on the
//           SAME application row: hard_pass = true AND a graded CV fit
//           (application_cv_fit.status = 'ok', fit_score not null) AND
//           fit_score > 60.
//
// Prints: old count, new count, affected count (old - new), plus a per-example
// breakdown for the three candidates named in the bug report. No writes — the
// qualified status is fully derived (view + fit table), so "recalculation" is
// just the rule change taking effect; nothing to backfill.
//
// Run: SUPABASE_SERVICE_ROLE_KEY="eyJ..." node scripts/audit-qualified-rule.mjs
//      # optional: SUPABASE_URL=... (defaults to the prod project)

const URL = process.env.SUPABASE_URL || "https://jeadtvxgxmqnsqwxjmhj.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!KEY) {
  console.error("ERROR: set SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const HEADERS = { apikey: KEY, authorization: `Bearer ${KEY}` };
const PAGE = 1000;

async function fetchAll(path) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await fetch(`${URL}/rest/v1/${path}${sep}limit=${PAGE}&offset=${offset}`, {
      headers: HEADERS,
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()} — ${path}`);
    const batch = await res.json();
    rows.push(...batch);
    if (batch.length < PAGE) break;
  }
  return rows;
}

// 1. All hard-pass applications (the OLD rule's entire universe).
const hardPassApps = await fetchAll(
  "application_readiness_view?select=application_id,candidate_id,position_slug,hard_pass&hard_pass=eq.true&order=application_id.asc",
);

// 2. Applications whose CV fit passes the NEW gate.
const fitPassRows = await fetchAll(
  "application_cv_fit?select=application_id&status=eq.ok&fit_score=gt.60&order=application_id.asc",
);
const fitPassIds = new Set(fitPassRows.map((r) => r.application_id));

const oldQualified = new Set(hardPassApps.map((r) => r.candidate_id));
const newQualified = new Set(
  hardPassApps.filter((r) => fitPassIds.has(r.application_id)).map((r) => r.candidate_id),
);
const affected = [...oldQualified].filter((id) => !newQualified.has(id));

console.log("=== Sudah Qualified — dry-run rule change ===");
console.log(`OLD rule (any hard_pass app)            : ${oldQualified.size} kandidat`);
console.log(`NEW rule (hard_pass + fit>60, same app) : ${newQualified.size} kandidat`);
console.log(`Terdampak (keluar dari tab qualified)   : ${affected.length} kandidat`);

// 3. The three examples from the bug report.
const patterns = ["*pujianto*", "*zahid*", "*febrizky*"];
for (const pat of patterns) {
  const cands = await fetchAll(
    `candidates?select=id,full_name&full_name=ilike.${encodeURIComponent(pat)}`,
  );
  for (const c of cands) {
    const apps = await fetchAll(
      `application_readiness_view?select=application_id,position_slug,hard_pass&candidate_id=eq.${c.id}`,
    );
    const appIds = apps.map((a) => a.application_id);
    const fits = appIds.length
      ? await fetchAll(
          `application_cv_fit?select=application_id,position_slug,fit_score,status&application_id=in.(${appIds.join(",")})`,
        )
      : [];
    const fitByApp = new Map(fits.map((f) => [f.application_id, f]));
    const qualifiesNew = apps.some((a) => {
      const f = fitByApp.get(a.application_id);
      return a.hard_pass && f && f.status === "ok" && f.fit_score !== null && f.fit_score > 60;
    });
    const qualifiesOld = apps.some((a) => a.hard_pass);
    console.log(`\n${c.full_name} (${c.id})`);
    console.log(`  OLD qualified: ${qualifiesOld} | NEW qualified: ${qualifiesNew}`);
    for (const a of apps) {
      const f = fitByApp.get(a.application_id);
      console.log(
        `  - ${a.position_slug}: hard_pass=${a.hard_pass} fit=${f ? `${f.fit_score} (${f.status})` : "belum dinilai"}`,
      );
    }
  }
}
