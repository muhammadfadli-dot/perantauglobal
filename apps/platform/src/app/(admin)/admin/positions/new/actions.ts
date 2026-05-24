"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

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

/**
 * Create an empty position shell. Admin lands in the unified editor at
 * /admin/positions/[slug] after this returns to fill content + add
 * application fields. The previous 4-step wizard is sunset — content +
 * fields belong in the live-preview editor, not a separate create flow.
 *
 * REQUIREMENT_LIBRARY (the catalog of common requirement templates) is no
 * longer auto-applied; it can still be exposed inside ApplicationFieldsEditor
 * as a per-field "add from library" affordance in a follow-up.
 */
export async function createPosition(input: CreatePositionInput) {
  await assertAdmin();

  if (!input.name || input.name.trim().length < 2) {
    throw new Error("Nama posisi minimum 2 karakter.");
  }
  if (!SLUG_RE.test(input.slug)) {
    throw new Error("Slug invalid (hanya huruf kecil, angka, tanda hubung).");
  }
  if (!input.country) throw new Error("Pilih negara penempatan.");

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
      throw new Error(
        `Slug "${input.slug}" sudah dipakai posisi lain. Pilih slug lain.`,
      );
    }
    throw new Error(error.message);
  }

  revalidatePath("/admin/positions");
  return { ok: true, slug: input.slug };
}
