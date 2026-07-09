/**
 * Talent-pool counter data seam.
 *
 * Design-first phase: returns a hardcoded, floored snapshot (audited 2026-07-04).
 * A rounded public number is visually identical whether constant or live, so we
 * avoid dragging a prod migration + RLS into the design build.
 *
 * Going live is a single-function swap: apply migration 0094
 * (public.get_talent_pool_stats, anon-safe floored aggregates) and replace the
 * body of getTalentPoolStats() with the DB call (see the commented version
 * below). The async signature never changes, so no call site churns.
 */
export type TalentPoolStats = {
  total: number; // floored, e.g. 1300
  totalDisplay: string; // "1,300+"
  gcc: number; // Gulf region bucket, floored
  gccDisplay: string; // "550+"
  byRegion: { key: string; label: string; count: number }[];
  asOf: string; // ISO date of the snapshot
  source: "placeholder" | "live";
};

// Snapshot audited 2026-07-04, floored down for public display (never overstates).
const PLACEHOLDER: TalentPoolStats = {
  total: 1300,
  totalDisplay: "1,300+",
  gcc: 550,
  gccDisplay: "550+",
  byRegion: [
    { key: "gcc", label: "Gulf (Saudi, Kuwait)", count: 550 },
    { key: "japan", label: "Japan", count: 380 },
    { key: "europe", label: "Europe", count: 120 },
    { key: "mexico", label: "Mexico", count: 80 },
    { key: "taiwan", label: "Taiwan", count: 10 },
  ],
  asOf: "2026-07-04",
  source: "placeholder",
};

export async function getTalentPoolStats(): Promise<TalentPoolStats> {
  return PLACEHOLDER;
}

/*
// LIVE version: swap in after migration 0094 is applied, once the *_V2 env is set.
import { supabaseAnon } from "./supabase";

const REGION_LABELS: Record<string, string> = {
  gcc: "Gulf (Saudi, Kuwait)", japan: "Japan", europe: "Europe", mexico: "Mexico", taiwan: "Taiwan",
};

export async function getTalentPoolStats(): Promise<TalentPoolStats> {
  try {
    const sb = supabaseAnon();
    const { data, error } = await sb.rpc("get_talent_pool_stats");
    if (error || !data) return PLACEHOLDER;
    const d = data as { total: number; gcc: number; by_region: Record<string, number>; as_of: string };
    return {
      total: d.total,
      totalDisplay: `${d.total.toLocaleString("en-US")}+`,
      gcc: d.gcc,
      gccDisplay: `${d.gcc.toLocaleString("en-US")}+`,
      byRegion: Object.entries(d.by_region)
        .filter(([k]) => k !== "other")
        .map(([key, count]) => ({ key, label: REGION_LABELS[key] ?? key, count })),
      asOf: d.as_of.slice(0, 10),
      source: "live",
    };
  } catch {
    return PLACEHOLDER; // missing env / unapplied migration degrades gracefully
  }
}
*/
