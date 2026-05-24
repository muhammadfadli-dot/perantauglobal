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

/**
 * Per-position custom field rendered as Step 2 of the apply form on web.
 * Loaded from `position_application_fields WHERE section = 'syarat_utama'`
 * post-Fase 3 (was `position_form_fields WHERE collect_at_stage = 'applied'`
 * pre-flip — same semantics, new table).
 *
 * Answers flow into applications.answers JSONB on apply. Per the Fase 3
 * model, answers do NOT merge into candidates.profile_data.credentials —
 * each application stands on its own (no cross-application bleed).
 */
export type AppliedFormField = {
  id: string;
  field_key: string;
  field_label: string;
  field_help: string | null;
  field_type: string;
  options: { value: string; label: string }[] | null;
  required: boolean;
  sort_order: number;
};

/**
 * Position landing-page content (jobDescription, benefits, fee, etc.)
 * authored by admin via /admin/positions/[slug] and stored in
 * positions.content JSONB. Returned as `unknown` — the caller parses to
 * its preferred shape (lib/positionDetails.ts mirrors the type).
 */
export type PositionContentBlob = unknown;

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

/**
 * Returns custom apply-stage form fields for a position. Empty array if
 * none seeded — caller should treat that as "render single-step form".
 *
 * Reads from position_application_fields (the canonical post-Fase 1 source).
 * Filters by section='syarat_utama' since those are the LP-visible questions.
 * Maps importance='required' → required boolean for the existing ApplyForm
 * client component shape.
 */
export async function fetchAppliedFields(slug: string): Promise<AppliedFormField[]> {
  try {
    const sb = supabaseV2();
    const { data, error } = await sb
      .from("position_application_fields")
      .select("id, field_key, field_label, field_help, field_type, options, importance, sort_order")
      .eq("position_slug", slug)
      .eq("section", "syarat_utama")
      .order("sort_order");
    if (error || !data) return [];
    return (data as Array<{
      id: string;
      field_key: string;
      field_label: string;
      field_help: string | null;
      field_type: string;
      options: { value: string; label: string }[] | null;
      importance: "required" | "optional";
      sort_order: number;
    }>).map((row) => ({
      id: row.id,
      field_key: row.field_key,
      field_label: row.field_label,
      field_help: row.field_help,
      field_type: row.field_type,
      options: row.options,
      required: row.importance === "required",
      sort_order: row.sort_order,
    }));
  } catch {
    return [];
  }
}

/**
 * Returns the admin-authored positions.content JSONB for a slug. Empty
 * object if not set (legacy position) — caller falls back to
 * lib/positionDetails.ts.
 */
export async function fetchPositionContent(slug: string): Promise<PositionContentBlob> {
  try {
    const sb = supabaseV2();
    const { data, error } = await sb
      .from("positions")
      .select("content")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return (data as { content: unknown }).content ?? null;
  } catch {
    return null;
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
