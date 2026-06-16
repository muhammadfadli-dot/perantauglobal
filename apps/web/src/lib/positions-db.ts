/**
 * Server-side: position list and detail data for apps/web.
 *
 * Post-structural-refactor (Fase 5b): the position LIST is now DB-driven.
 * Source of truth = positions table (active=true) joined with optional
 * job_orders for batch info. Card meta is read from positions.content.cardMeta
 * (authored by admin via /admin/positions/[slug]), falling back to the
 * legacy static catalog (lib/positions.ts) for positions that haven't yet
 * had cardMeta authored, and finally to sensible defaults so brand-new
 * admin-created positions still render with a complete card.
 *
 * Status semantic:
 *   - "open"  → an active job_order exists for this slug; show "Lagi buka"
 *   - "queue" → catalog only; user registers interest, gets emailed when
 *     a batch opens
 *
 * Static catalog remains a code-level fallback for backward compatibility
 * but is no longer the primary source. New positions appear without a code
 * deploy as soon as admin saves them.
 */

import { supabaseV2 } from "./supabase-v2";
import { POSITIONS, getPosition as getStaticPosition, type Position, type PositionCountry } from "./positions";
import type { IconName } from "@/components/pg/Icon";

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
 * its preferred shape (lib/positionContent.ts mirrors the type).
 */
export type PositionContentBlob = unknown;

/** Subset of positions.content that drives the catalog card. */
type CardMetaBlob = {
  icon?: string;
  salary?: string;
  salaryNote?: string;
  gender?: string;
  age?: string;
  contractLabel?: string;
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

/**
 * Returns custom apply-stage form fields for a position. Empty array if
 * none seeded — caller should treat that as "render single-step form".
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

// ─── DB-driven position list ────────────────────────────────────────────────

type DbPositionRow = {
  slug: string;
  name: string;
  role: string;
  country: string;
  active: boolean;
  content: unknown;
};

/** Map DB country slug ("japan", "saudi_arabia", …) → display label. */
const COUNTRY_LABEL: Record<string, PositionCountry> = {
  japan: "Jepang",
  saudi_arabia: "Saudi Arabia",
  taiwan: "Taiwan",
  indonesia: "Indonesia",
  europe: "Eropa Timur",
  mexico: "Meksiko",
};

const VALID_ICONS = new Set<IconName>([
  "briefcase",
  "stethoscope",
  "heart",
  "coffee",
  "bowl",
  "truck",
  "home",
  "shield",
  "user",
  "sparkle",
  "passport",
]);

function pickCardMeta(content: unknown): CardMetaBlob {
  if (!content || typeof content !== "object" || Array.isArray(content)) return {};
  const obj = content as Record<string, unknown>;
  if (!obj.cardMeta || typeof obj.cardMeta !== "object" || Array.isArray(obj.cardMeta)) return {};
  return obj.cardMeta as CardMetaBlob;
}

/** Pull the metaLine off content.hero, used as a last-resort salary fallback. */
function pickHeroMetaLine(content: unknown): string | null {
  if (!content || typeof content !== "object" || Array.isArray(content)) return null;
  const obj = content as Record<string, unknown>;
  if (!obj.hero || typeof obj.hero !== "object" || Array.isArray(obj.hero)) return null;
  const h = obj.hero as Record<string, unknown>;
  return typeof h.metaLine === "string" ? h.metaLine : null;
}

/**
 * Combine DB cardMeta (authoritative) → static catalog (legacy fallback)
 * → derived defaults (so brand-new positions still render something). The
 * resolution chain runs per-field so a partial cardMeta plus static can
 * coexist.
 */
function resolveCard(row: DbPositionRow, staticEntry: Position | undefined): Omit<Position, "status" | "batch"> | null {
  const cardMeta = pickCardMeta(row.content);
  const country = COUNTRY_LABEL[row.country];
  if (!country) return null; // unknown country → skip

  const heroLine = pickHeroMetaLine(row.content);
  // Try splitting hero "¥244.200/bulan" → salary="¥244.200", note="/bulan"
  // when cardMeta + static don't provide it.
  const derivedFromHero = heroLine ? splitMetaLine(heroLine) : null;

  const icon =
    (cardMeta.icon && VALID_ICONS.has(cardMeta.icon as IconName)
      ? (cardMeta.icon as IconName)
      : undefined) ??
    staticEntry?.icon ??
    "briefcase";

  const salary =
    nonEmpty(cardMeta.salary) ??
    staticEntry?.salary ??
    derivedFromHero?.salary ??
    "—";
  const salaryNote =
    nonEmpty(cardMeta.salaryNote) ??
    staticEntry?.salaryNote ??
    derivedFromHero?.salaryNote ??
    "";

  const gender = nonEmpty(cardMeta.gender) ?? staticEntry?.gender ?? "L/P";
  const age = nonEmpty(cardMeta.age) ?? staticEntry?.age ?? "—";
  const contractLabel = nonEmpty(cardMeta.contractLabel) ?? staticEntry?.contractLabel;

  return {
    slug: row.slug,
    role: row.name || staticEntry?.role || row.role,
    country,
    icon,
    salary,
    salaryNote,
    gender,
    age,
    ...(contractLabel ? { contractLabel } : {}),
  };
}

function nonEmpty(v: string | undefined): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

function splitMetaLine(line: string): { salary: string; salaryNote: string } | null {
  // Common patterns: "¥244.200/bulan", "SAR 3.200 / bulan", "Rp 5.000.000 / bulan".
  // Split at "/" or " / " — first segment = salary, rest = note.
  const idx = line.indexOf("/");
  if (idx === -1) return { salary: line.trim(), salaryNote: "" };
  const salary = line.slice(0, idx).trim();
  const note = line.slice(idx).trim();
  if (!salary) return null;
  return { salary, salaryNote: note };
}

/**
 * Fetch ALL active positions from DB and shape into Position[]. Each card's
 * meta is resolved through the chain: positions.content.cardMeta → static
 * catalog (lib/positions.ts) → defaults. Job orders overlay status/batch.
 *
 * Falls back to the pure-static catalog when the DB is unreachable so the
 * site keeps rendering during incidents.
 */
export async function fetchPositionsForCatalog(): Promise<Position[]> {
  try {
    const sb = supabaseV2();
    const [posResult, jobOrders] = await Promise.all([
      // Fetch ALL positions (incl. inactive) so we know which slugs the DB owns.
      // An inactive slug must be HIDDEN, not resurrected from the static catalog
      // — backfilling it produced a live card whose apply 404s on submit.
      sb.from("positions").select("slug, name, role, country, active, content"),
      fetchOpenJobOrders(),
    ]);
    if (posResult.error || !posResult.data) {
      return mergePositionsWithJobOrders(jobOrders);
    }

    const rows = posResult.data as DbPositionRow[];
    const out: Position[] = [];
    // Every slug the DB owns (active OR inactive) — static backfill skips these.
    const knownInDb = new Set<string>(rows.map((r) => r.slug));

    for (const row of rows) {
      if (!row.active) continue; // known to DB but intentionally hidden
      const staticEntry = getStaticPosition(row.slug);
      const card = resolveCard(row, staticEntry);
      if (!card) continue;
      // Skip positions that have no authored cardMeta AND no static fallback —
      // they'd render as broken cards (no salary, no age). Admin needs to
      // fill in the "Card di katalog" section in the editor first.
      const cardMeta = pickCardMeta(row.content);
      const hasCardMeta = Boolean(nonEmpty(cardMeta.salary) && nonEmpty(cardMeta.age));
      if (!hasCardMeta && !staticEntry) continue;
      const jo = jobOrders.get(row.slug);
      if (jo) {
        out.push({
          ...card,
          status: "open",
          batch: {
            label: jo.intake_label,
            slotsFilled: jo.slot_filled,
            slotsTotal: jo.slot_count,
            deadline: jo.deadline
              ? new Date(jo.deadline).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "—",
          },
        });
      } else {
        out.push({ ...card, status: "queue" });
      }
    }

    // Backfill static-only positions the DB doesn't own yet — e.g. legacy
    // entries not migrated. A slug that exists in the DB as INACTIVE is
    // intentionally hidden, so knownInDb (not just the active ones) gates this.
    for (const p of POSITIONS) {
      if (knownInDb.has(p.slug)) continue;
      const jo = jobOrders.get(p.slug);
      if (jo) {
        out.push({
          ...p,
          status: "open",
          batch: {
            label: jo.intake_label,
            slotsFilled: jo.slot_filled,
            slotsTotal: jo.slot_count,
            deadline: jo.deadline
              ? new Date(jo.deadline).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "—",
          },
        });
      } else {
        out.push({ ...p, status: "queue" });
      }
    }

    // Stable ordering: country group then slug, so the page isn't reshuffled
    // every time admin saves a position.
    const COUNTRY_ORDER: PositionCountry[] = ["Saudi Arabia", "Jepang", "Taiwan", "Eropa Timur", "Meksiko", "Indonesia"];
    out.sort((a, b) => {
      const ai = COUNTRY_ORDER.indexOf(a.country);
      const bi = COUNTRY_ORDER.indexOf(b.country);
      if (ai !== bi) return ai - bi;
      return a.slug.localeCompare(b.slug);
    });

    return out;
  } catch {
    // Hard failure → use static catalog as last resort.
    const jobOrders = await fetchOpenJobOrders().catch(() => new Map<string, ActiveJobOrder>());
    return mergePositionsWithJobOrders(jobOrders);
  }
}

/**
 * Resolve a single Position for the detail page (status="queue" — caller
 * overlays job_orders separately). Used by /lowongan/[slug] when an admin-
 * created position isn't in the static catalog. Returns undefined when the
 * slug doesn't exist or is inactive.
 */
export async function fetchPositionForDetail(slug: string): Promise<Position | undefined> {
  const staticEntry = getStaticPosition(slug);
  try {
    const sb = supabaseV2();
    const { data, error } = await sb
      .from("positions")
      .select("slug, name, role, country, active, content")
      .eq("slug", slug)
      .maybeSingle();
    if (error) {
      // DB error (not a missing row) — fall back to static for resilience.
      return staticEntry;
    }
    if (data) {
      // Row exists in DB. If it's inactive it's intentionally hidden — return
      // undefined so the page 404s instead of resurrecting it from the static
      // catalog (which let candidates fill the form then 404 on submit).
      if (!(data as DbPositionRow).active) return undefined;
      const card = resolveCard(data as DbPositionRow, staticEntry);
      if (!card) return staticEntry;
      return { ...card, status: "queue" };
    }
    // No DB row at all → legacy slug that only lives in the static catalog.
    return staticEntry;
  } catch {
    return staticEntry;
  }
}

/**
 * Returns slugs of all active positions for generateStaticParams. Union
 * of DB (active=true) and the static catalog so detail pages keep building
 * even during DB outages or migrations.
 */
export async function fetchPositionSlugsForBuild(): Promise<string[]> {
  const slugs = new Set<string>();
  for (const p of POSITIONS) slugs.add(p.slug);
  try {
    const sb = supabaseV2();
    const { data, error } = await sb.from("positions").select("slug").eq("active", true);
    if (!error && data) {
      for (const row of data as { slug: string }[]) slugs.add(row.slug);
    }
  } catch {
    // ignore; static catalog already populated
  }
  return Array.from(slugs);
}

/**
 * Legacy: augments static catalog with live batch data. Kept as the offline
 * fallback used when the DB list query fails. New code should call
 * `fetchPositionsForCatalog()` instead.
 */
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
