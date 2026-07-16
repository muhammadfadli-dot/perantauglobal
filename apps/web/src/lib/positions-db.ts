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
import { getPosition as getStaticPosition, type Position } from "./positions";
import { getCountries } from "./countries";
import type { CountryRegistry } from "@perantauglobal/db/country";
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
    // A job order only counts as "open" to the public if its deadline hasn't
    // passed. Batches with no deadline (deadline IS NULL) stay open until an
    // admin closes them. Excludes stale batches whose deadline is in the past
    // so candidates never see "LAGI BUKA · deadline 5 Juni" weeks later.
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await sb
      .from("job_orders")
      .select(
        "id, position_slug, intake_label, slot_count, slot_filled, deadline, public_employer_name, employer_city, public_description"
      )
      .eq("status", "open")
      .or(`deadline.is.null,deadline.gte.${today}`)
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
export type PositionContentResult = {
  content: PositionContentBlob;
  publishedAt: string | null;
  updatedAt: string | null;
};

/** One round-trip for the position content blob + dates (dates feed JobPosting datePosted). */
export async function fetchPositionContent(slug: string): Promise<PositionContentResult> {
  try {
    const sb = supabaseV2();
    const { data, error } = await sb
      .from("positions")
      .select("content, published_at, updated_at")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return { content: null, publishedAt: null, updatedAt: null };
    const row = data as {
      content: unknown;
      published_at: string | null;
      updated_at: string | null;
    };
    return {
      content: (row.content as PositionContentBlob) ?? null,
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
    };
  } catch {
    return { content: null, publishedAt: null, updatedAt: null };
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
  /** Optional: only the catalog select asks for these (the detail select has
   * its own date read via fetchPositionContent). */
  published_at?: string | null;
  updated_at?: string | null;
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
function resolveCard(
  row: DbPositionRow,
  staticEntry: Position | undefined,
  registry: CountryRegistry,
): Omit<Position, "status" | "batch"> {
  const cardMeta = pickCardMeta(row.content);
  // Registry resolves every seeded country + normalizes aliases; an unrecognized
  // value falls back to "Global" instead of silently vanishing (old behavior).
  const country = registry.resolveOrGlobal(row.country).label;

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
  const rawSalaryNote =
    nonEmpty(cardMeta.salaryNote) ??
    staticEntry?.salaryNote ??
    derivedFromHero?.salaryNote ??
    "";
  const salaryNote = dedupSalaryNote(salary, rawSalaryNote);

  const gender = nonEmpty(cardMeta.gender) ?? staticEntry?.gender ?? "L/P";
  const age = normalizeAge(nonEmpty(cardMeta.age) ?? staticEntry?.age ?? "—");
  const contractLabel = nonEmpty(cardMeta.contractLabel) ?? staticEntry?.contractLabel;

  // Admin-uploaded hero (bucket URL) when present; the card falls back to the
  // static per-slug asset otherwise. Rendered as a CSS background-image, so a
  // bucket URL needs no next/image remotePatterns.
  const mediaObj =
    row.content && typeof row.content === "object"
      ? (row.content as { media?: { heroUrl?: unknown } }).media
      : undefined;
  const heroUrl =
    typeof mediaObj?.heroUrl === "string" && mediaObj.heroUrl.trim()
      ? mediaObj.heroUrl.trim()
      : undefined;

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
    ...(heroUrl ? { heroUrl } : {}),
  };
}

function nonEmpty(v: string | undefined): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Strip a trailing age unit from an authored age value so renderers can append
 * their own ("th" on cards, "tahun" in QuickFacts) without doubling it.
 * "25 - 35 tahun" → "25 - 35"; "20-35 years old" → "20-35"; "21–30" → "21–30".
 */
function normalizeAge(age: string): string {
  return age.replace(/\s*((tahun|thn|years?|yrs?|yo)(\s+old)?|old)\.?$/i, "").trim() || age;
}

/**
 * Drop a salary note that merely repeats a unit already present in the salary
 * string, so cards/detail don't render "¥300,000/bulan /bulan". Notes that add
 * real information ("+ makan SAR 300") are kept.
 */
function dedupSalaryNote(salary: string, note: string): string {
  if (!note) return "";
  const s = salary.toLowerCase().replace(/\s+/g, "");
  const n = note.toLowerCase().replace(/\s+/g, "");
  if (!n) return "";
  // Note fully duplicated at the tail of salary ("¥300,000/bulan" + "/bulan").
  if (s.endsWith(n)) return "";
  // Note is a bare period unit whose word already appears in the salary.
  const bareUnit = /^\/?(per)?(bulan|month|mo|jam|hour|hr|tahun|year|thn|hari|day|minggu|week)$/i.test(
    note.trim(),
  );
  if (bareUnit && s.includes(n.replace(/^\//, "").replace(/^per/, ""))) return "";
  return note;
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
 * Fetch active positions from DB and shape into Position[]. Each card's meta is
 * resolved through the chain: positions.content.cardMeta → static catalog
 * (lib/positions.ts, per-field enrichment only) → defaults. Job orders overlay
 * status/batch.
 *
 * The DB (RLS: active=true visible to anon) is the ONLY source of which
 * positions exist. The static catalog is NOT backfilled as a list source:
 * an admin-deactivated position must stay hidden, and resurrecting it from the
 * static catalog produced live cards whose apply form 404s on submit. On DB
 * failure the list is empty (ISR serves the last good render); the static
 * catalog is no longer a render-time list fallback.
 */
export async function fetchPositionsForCatalog(): Promise<Position[]> {
  try {
    const sb = supabaseV2();
    const [posResult, jobOrders, registry] = await Promise.all([
      // RLS (positions_anon_read_active) already filters to active=true, so the
      // anon client never sees inactive rows — hence no static backfill below.
      sb.from("positions").select("slug, name, role, country, active, content, published_at, updated_at"),
      fetchOpenJobOrders(),
      getCountries(),
    ]);
    if (posResult.error || !posResult.data) {
      return [];
    }

    const rows = posResult.data as DbPositionRow[];
    const out: Position[] = [];

    for (const row of rows) {
      if (!row.active) continue; // defensive: RLS should already exclude these
      const staticEntry = getStaticPosition(row.slug);
      const card = resolveCard(row, staticEntry, registry);
      // Skip positions that have no authored cardMeta AND no static fallback —
      // they'd render as broken cards (no salary, no age). Admin needs to
      // fill in the "Card di katalog" section in the editor first.
      const cardMeta = pickCardMeta(row.content);
      const hasCardMeta = Boolean(nonEmpty(cardMeta.salary) && nonEmpty(cardMeta.age));
      if (!hasCardMeta && !staticEntry) continue;
      // Real content dates, so the sitemap can report a lastModified that means
      // something instead of "now" on every crawl.
      const dates = {
        publishedAt: row.published_at ?? null,
        updatedAt: row.updated_at ?? null,
      };
      const jo = jobOrders.get(row.slug);
      if (jo) {
        out.push({
          ...card,
          ...dates,
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
        out.push({ ...card, ...dates, status: "queue" });
      }
    }

    // Stable ordering: country (registry sort_order) then slug, so the page
    // isn't reshuffled every time admin saves a position.
    const orderOf = (label: string) => registry.resolve(label)?.sortOrder ?? 999;
    out.sort((a, b) => {
      const ai = orderOf(a.country);
      const bi = orderOf(b.country);
      if (ai !== bi) return ai - bi;
      return a.slug.localeCompare(b.slug);
    });

    return out;
  } catch {
    // Hard failure → empty list; ISR keeps serving the last good render and the
    // catalog shows its empty state rather than resurrecting stale positions.
    return [];
  }
}

/**
 * Resolve a single Position for the detail page (status="queue" — caller
 * overlays job_orders separately). Returns undefined when the slug doesn't
 * exist or is inactive, so the page 404s.
 *
 * Because RLS (positions_anon_read_active) hides inactive rows from the anon
 * client, a null row means the position is inactive OR nonexistent — both 404.
 * We NEVER fall back to the static catalog here: doing so resurrected
 * deactivated positions into a live page whose apply form 404s on submit. The
 * static catalog is still used for per-field card enrichment on ACTIVE rows.
 */
export async function fetchPositionForDetail(slug: string): Promise<Position | undefined> {
  try {
    const sb = supabaseV2();
    const { data, error } = await sb
      .from("positions")
      .select("slug, name, role, country, active, content")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return undefined;
    if (!(data as DbPositionRow).active) return undefined; // defensive; RLS already hides
    const registry = await getCountries();
    const card = resolveCard(data as DbPositionRow, getStaticPosition(slug), registry);
    return { ...card, status: "queue" };
  } catch {
    // Transient DB error → 404 on a cold miss; ISR serves the last good render
    // for already-cached active pages.
    return undefined;
  }
}

export type PositionDraftPreview = {
  position: Position;
  content: PositionContentBlob;
  publishedAt: string | null;
  updatedAt: string | null;
  /** Live visibility of the previewed position - drives the banner's "this one
   * isn't even public yet" note. Not on Position, which resolveCard strips. */
  active: boolean;
};

/**
 * Resolve a position from its DRAFT blob for admin preview (Fase 3.1, D4).
 *
 * Everything the detail page renders descends from resolvePositionDetail(slug,
 * content), so handing it the draft blob renders the draft through the real
 * page - no parallel preview renderer to drift out of sync.
 *
 * Authorization is the token, checked in the DB by get_position_draft_preview
 * (SECURITY DEFINER, migration 0105). The anon key is enough on this path: web
 * gets no blanket read on unpublished rows, only on the one slug it holds a
 * live token for. Unlike the public fetchers, this deliberately resolves
 * INACTIVE positions too - previewing a not-yet-activated position is the whole
 * point (the old "Preview tab baru" just 404'd there).
 */
export async function fetchPositionDraftPreview(
  slug: string,
  token: string,
): Promise<PositionDraftPreview | undefined> {
  try {
    const sb = supabaseV2();
    const { data, error } = await (
      sb as unknown as {
        rpc(
          fn: "get_position_draft_preview",
          args: { p_slug: string; p_token: string },
        ): Promise<{ data: unknown; error: { message: string } | null }>;
      }
    ).rpc("get_position_draft_preview", { p_slug: slug, p_token: token });

    if (error || !data || typeof data !== "object") return undefined;
    const row = data as DbPositionRow & {
      published_at: string | null;
      updated_at: string | null;
    };
    if (!row.slug) return undefined;

    const registry = await getCountries();
    const card = resolveCard(row, getStaticPosition(slug), registry);
    return {
      position: { ...card, status: "queue" },
      content: (row.content as PositionContentBlob) ?? null,
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
      active: Boolean(row.active),
    };
  } catch {
    return undefined;
  }
}

/**
 * Resolve a retired slug to its current one via position_slug_aliases. Lets the
 * detail route permanently redirect an old (renamed) URL so live ads pointing at
 * the previous slug never 404. Returns undefined when the slug was never renamed.
 */
export async function fetchSlugAlias(slug: string): Promise<string | undefined> {
  try {
    // position_slug_aliases is newer than the generated Database types; type the
    // single query locally rather than regenerate (which drops hand-added exports).
    const sb = supabaseV2() as unknown as {
      from(table: "position_slug_aliases"): {
        select(cols: string): {
          eq(
            col: string,
            val: string,
          ): {
            maybeSingle(): Promise<{
              data: { new_slug: string } | null;
              error: unknown;
            }>;
          };
        };
      };
    };
    const { data, error } = await sb
      .from("position_slug_aliases")
      .select("new_slug")
      .eq("old_slug", slug)
      .maybeSingle();
    if (error || !data) return undefined;
    return data.new_slug;
  } catch {
    return undefined;
  }
}

/**
 * Returns slugs of all active positions for generateStaticParams (DB active=true
 * only). Inactive/unknown slugs render on demand via dynamicParams and 404.
 */
export async function fetchPositionSlugsForBuild(): Promise<string[]> {
  const slugs = new Set<string>();
  try {
    const sb = supabaseV2();
    const { data, error } = await sb.from("positions").select("slug").eq("active", true);
    if (!error && data) {
      for (const row of data as { slug: string }[]) slugs.add(row.slug);
    }
  } catch {
    // ignore; dynamicParams renders any missing slug on demand
  }
  return Array.from(slugs);
}

export const POSITIONS_REVALIDATE = REVALIDATE_SECONDS;
