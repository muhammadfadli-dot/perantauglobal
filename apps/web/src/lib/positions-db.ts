/**
 * Server-side: fetch open job_orders from DB to overlay onto the static
 * positions catalog (lib/positions.ts).
 *
 * The catalog (lib/positions.ts) provides static copy + display config (icon,
 * salary line, age, gender) — these are stable. Job orders provide live
 * batch info (slot count, deadline) and are the source of truth for "Lagi
 * buka" status.
 */

import { supabaseV2 } from "./supabase-v2";
import { POSITIONS, type Position } from "./positions";

export type ActiveJobOrder = {
  id: string;
  position_slug: string;
  intake_label: string;
  slot_count: number;
  slot_filled: number;
  deadline: string | null;
  public_employer_name: string | null;
  employer_city: string | null;
  public_description: string | null;
};

const REVALIDATE_SECONDS = 60;

/**
 * Returns map of position_slug → most recent open job_order.
 * Empty map if DB unreachable / no open orders. Catalog still renders.
 */
export async function fetchOpenJobOrders(): Promise<Map<string, ActiveJobOrder>> {
  try {
    const sb = supabaseV2();
    const { data, error } = await sb
      .from("job_orders")
      .select(
        "id, position_slug, intake_label, slot_count, slot_filled, deadline, public_employer_name, employer_city, public_description"
      )
      .eq("status", "open")
      .order("created_at", { ascending: false });
    if (error || !data) return new Map();

    const map = new Map<string, ActiveJobOrder>();
    for (const jo of data as ActiveJobOrder[]) {
      // Most recent wins (data already ordered desc by created_at)
      if (!map.has(jo.position_slug)) {
        map.set(jo.position_slug, jo);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

/** Augments static catalog with live batch data. Falls back to "queue" if no JO. */
export function mergePositionsWithJobOrders(
  jobOrdersBySlug: Map<string, ActiveJobOrder>
): Position[] {
  return POSITIONS.map((p) => {
    const jo = jobOrdersBySlug.get(p.slug);
    if (!jo) return { ...p, status: "queue" };
    return {
      ...p,
      status: "open",
      batch: {
        label: jo.intake_label,
        slotsFilled: jo.slot_filled,
        slotsTotal: jo.slot_count,
        deadline: jo.deadline
          ? new Date(jo.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
          : "—",
      },
    };
  });
}

export const POSITIONS_REVALIDATE = REVALIDATE_SECONDS;
