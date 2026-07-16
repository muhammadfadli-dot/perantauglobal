"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, requireAdmin } from "@/lib/supabase-server";
import { logAdminAction } from "@/lib/audit-log";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function assertAdmin() {
  await requireAdmin("Forbidden");
}

export type CreatePositionInput = {
  name: string;
  slug: string;
  country: string;
};

export type CreatePositionResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

/**
 * Create an empty position shell. Admin lands in the unified editor at
 * /admin/positions/[slug] after this returns to fill content + add
 * application fields. The previous 4-step wizard is sunset — content +
 * fields belong in the live-preview editor, not a separate create flow.
 *
 * Returns a discriminated union instead of throwing for user-facing errors.
 * Why: Next.js production builds strip server-action exception messages to
 * avoid leaking sensitive data, which turns our friendly Indonesian copy
 * into the generic "An error occurred in the Server Components render"
 * page-wide error. Returning errors as DATA lets the client show the real
 * message inline. We still `throw` for actual programming errors (auth,
 * unexpected DB failures) so they surface as 500s in logs.
 */
export async function createPosition(
  input: CreatePositionInput,
): Promise<CreatePositionResult> {
  await assertAdmin();

  if (!input.name || input.name.trim().length < 2) {
    return { ok: false, error: "Nama posisi minimum 2 karakter." };
  }
  if (!SLUG_RE.test(input.slug)) {
    return {
      ok: false,
      error: "Slug invalid (hanya huruf kecil, angka, tanda hubung).",
    };
  }
  if (!input.country) {
    return { ok: false, error: "Pilih negara penempatan." };
  }

  const supabase = await createServerClient();

  // positions.role is NOT NULL — historically picked from a fixed list in the
  // old wizard. The new editor doesn't surface it (apps/web reads `role` from
  // the static lib/positions catalog, not from DB), so we seed it from the full
  // slug rather than the first hyphen-segment (which produced garbage like
  // "head"/"assistant" the admin could never see or fix).
  const role = input.slug;

  // Born as a DRAFT, never live: a new shell has empty content + zero screening
  // fields. Going active before publish lets candidates apply with no screening
  // and show as 100% ready (the machine-operator leak). Admin flips active from
  // the editor once content + syarat_utama fields exist (guarded server-side).
  const { error } = await supabase.from("positions").insert({
    slug: input.slug,
    name: input.name.trim(),
    country: input.country,
    role,
    description: null,
    active: false,
  } as never);

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return {
        ok: false,
        error: `Slug "${input.slug}" sudah dipakai posisi lain. Pilih slug lain.`,
      };
    }
    // Unexpected DB error: log via throw so it surfaces in Vercel logs as a
    // 500 + propagate to the client as the generic Server Components error.
    // Worth alerting on; user can retry while we investigate.
    throw new Error(`DB error: ${error.message}`);
  }

  await logAdminAction("create_position", "position", input.slug, {
    name: input.name.trim(),
    country: input.country,
  });

  revalidatePath("/admin/positions");
  return { ok: true, slug: input.slug };
}

export type CreateCountryInput = {
  label: string;
  flag: string;
  defaultCity: string;
};

export type CreateCountryResult =
  | { ok: true; dbValue: string; key: string; label: string; initials: string }
  | { ok: false; error: string };

/**
 * Register a new placement country in the registry (public.countries) so it
 * becomes a first-class option — selectable here, grouped on the public
 * /lowongan chapters, and resolvable everywhere — with NO code deploy. This
 * replaces the old "Negara lain" free-text path, which wrote an unregistered
 * value into positions.country and produced a silently-404'd landing page.
 *
 * Minimal fields only (label, flag, primary city); tint/tagline/hero image use
 * sensible defaults and can be refined later. The public listing shows the new
 * country within the ISR window (~60s); no cross-app revalidation needed.
 */
export async function createCountry(
  input: CreateCountryInput,
): Promise<CreateCountryResult> {
  await assertAdmin();

  const label = input.label.trim();
  if (label.length < 2) {
    return { ok: false, error: "Nama negara minimum 2 karakter." };
  }
  const key = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (key.length < 2) {
    return { ok: false, error: "Nama negara tidak valid." };
  }
  const initials = label.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "GL";

  const supabase = await createServerClient();
  // `countries` was added after the generated Database types (and regenerating
  // them drops the repo's hand-added enum exports), so type this table locally.
  const db = supabase as unknown as {
    from(table: "countries"): {
      select(cols: string): {
        order(
          col: string,
          opts: { ascending: boolean },
        ): {
          limit(n: number): {
            maybeSingle(): Promise<{ data: { sort_order: number } | null }>;
          };
        };
      };
      insert(row: Record<string, unknown>): Promise<{ error: { message: string } | null }>;
    };
  };

  const { data: maxRow } = await db
    .from("countries")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = (maxRow?.sort_order ?? 10) + 1;

  const { error } = await db.from("countries").insert({
    key,
    db_value: key,
    label,
    initials,
    flag: input.flag.trim() || "🌐",
    default_city: input.defaultCity.trim(),
    tint_hex: "#4f6d7a",
    portal_tint_hex: "#4f6d7a",
    aliases: [key, label.toLowerCase()],
    sort_order: sortOrder,
    active: true,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return { ok: false, error: `Negara "${label}" (${key}) sudah terdaftar.` };
    }
    throw new Error(`DB error: ${error.message}`);
  }

  // Registering a country is a catalog-shaping action that used to leave no
  // trail (E4) - log it after the row lands, mirroring createPosition.
  await logAdminAction("create_country", "country", key, { label, db_value: key });

  revalidatePath("/admin/positions/new");
  return { ok: true, dbValue: key, key, label, initials };
}
