#!/usr/bin/env tsx
/**
 * Backfill positions.content JSONB from the hardcoded apps/web catalogs
 * (positions.ts + positionDetails.ts) so the new admin-authored landing page
 * content lives in DB rather than code (per Fase 1 of the position-model
 * rework).
 *
 * Run ONCE after migration 0032 has been applied:
 *   SUPABASE_URL=https://jeadtvxgxmqnsqwxjmhj.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
 *   pnpm --filter @perantauglobal/db backfill-content -- --apply
 *
 * Default is --dry-run. Pass --apply to actually write.
 *
 * Idempotent: re-running with --apply overwrites positions.content for each
 * slug. Will preserve any keys not produced here (admin edits made after
 * backfill stay intact since UPDATE uses jsonb || merge semantics? No —
 * for safety we replace the whole content blob. Admin should not edit
 * positions.content between backfill runs.)
 */

import { createClient } from "@supabase/supabase-js";
// Cross-package import. tsx handles TS compilation at runtime; tsc strict
// mode complains but it's not a build artifact, just a one-shot script.
// @ts-expect-error tsx resolves cross-package TS imports at runtime
import { POSITIONS } from "../../../apps/web/src/lib/positions";
// @ts-expect-error tsx resolves cross-package TS imports at runtime
import { POSITION_DETAILS } from "../../../apps/web/src/lib/positionDetails";

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const apply = argv.includes("--apply");
const limit = (() => {
  const hit = argv.find((a) => a.startsWith("--limit="));
  return hit ? parseInt(hit.split("=")[1] ?? "0", 10) : 0;
})();

// ---------------------------------------------------------------------------
// Build content blob per slug
// ---------------------------------------------------------------------------

type Position = (typeof POSITIONS)[number];

type ContentBlob = {
  hero?: { metaLine?: string };
  jobDescription?: string[];
  details?: Array<{ label: string; value: string }>;
  benefits?: Array<{ icon: string; label: string; value: string }>;
  qualifications?: string[];
  fee?: { amount: string; breakdown: string[]; note?: string };
  process?: string[];
  trustSignals?: Record<string, unknown>;
};

function buildContent(p: Position): ContentBlob {
  const detail = POSITION_DETAILS[p.slug as keyof typeof POSITION_DETAILS] as
    | {
        details?: Array<{ label: string; value: string }>;
        benefits?: Array<{ icon: string; label: string; value: string }>;
        qualifications?: string[];
        fee?: { amount: string; breakdown: string[]; note?: string };
        process?: string[];
        jobDescription?: string[];
      }
    | undefined;

  if (!detail) return {};

  const blob: ContentBlob = {
    hero: {
      metaLine: `${p.salary}/bulan${p.contractLabel ? " · " + p.contractLabel : ""}`,
    },
    ...(detail.jobDescription ? { jobDescription: detail.jobDescription } : {}),
    ...(detail.details ? { details: detail.details } : {}),
    ...(detail.benefits ? { benefits: detail.benefits } : {}),
    ...(detail.qualifications ? { qualifications: detail.qualifications } : {}),
    ...(detail.fee ? { fee: detail.fee } : {}),
    ...(detail.process ? { process: detail.process } : {}),
    trustSignals: {}, // empty for now — admin fills via editor
  };

  return blob;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const positions = (limit > 0 ? POSITIONS.slice(0, limit) : POSITIONS) as Position[];
  console.log(
    `Mode: ${apply ? "APPLY" : "DRY-RUN"} · slugs: ${positions.length}`,
  );

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const p of positions) {
    const content = buildContent(p);
    if (Object.keys(content).length === 0) {
      console.log(`  - ${p.slug}: no detail in positionDetails.ts, skip`);
      skipped++;
      continue;
    }

    if (!apply) {
      const keys = Object.keys(content).join(", ");
      console.log(`  - ${p.slug}: would update content (keys: ${keys})`);
      ok++;
      continue;
    }

    const { error } = await supabase
      .from("positions")
      .update({ content })
      .eq("slug", p.slug);

    if (error) {
      console.error(`  ✗ ${p.slug}: ${error.message}`);
      failed++;
    } else {
      console.log(`  ✓ ${p.slug}: content updated`);
      ok++;
    }
  }

  console.log(
    `\nDone. ok=${ok} skipped=${skipped} failed=${failed}${apply ? "" : " (dry-run — pass --apply to write)"}`,
  );
  process.exit(failed > 0 ? 2 : 0);
}

void main();
