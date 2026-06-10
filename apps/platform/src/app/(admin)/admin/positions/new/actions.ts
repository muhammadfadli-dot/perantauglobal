"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import { logAdminAction } from "@/lib/audit-log";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function assertAdmin() {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") throw new Error("Forbidden");
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
  // the static lib/positions catalog, not from DB), so we seed it as the
  // canonical role-segment of the slug (best-effort: first hyphen-segment, or
  // the whole slug if no hyphen). Admin can revisit if needed.
  const role = input.slug.split("-")[0] || input.slug;

  const { error } = await supabase.from("positions").insert({
    slug: input.slug,
    name: input.name.trim(),
    country: input.country,
    role,
    description: null,
    active: true,
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
