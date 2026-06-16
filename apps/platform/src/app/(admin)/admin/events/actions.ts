"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import { logAdminAction } from "@/lib/audit-log";

async function assertAdmin() {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") throw new Error("Forbidden");
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Fixed UTC offsets for the timezones we support. None observe DST, so a static
// map is correct — we treat the admin's datetime-local input as wall-clock in the
// chosen zone and append the offset to get the right UTC instant.
const TZ_OFFSET: Record<string, string> = {
  "Asia/Jakarta": "+07:00",
  "Asia/Makassar": "+08:00",
  "Asia/Jayapura": "+09:00",
  "Asia/Riyadh": "+03:00",
  "Asia/Tokyo": "+09:00",
  "Asia/Taipei": "+08:00",
};

export type EventInput = {
  title: string;
  kind: string;
  status: "draft" | "published" | "closed";
  starts_at_local: string; // "YYYY-MM-DDTHH:mm" wall-clock in `timezone`
  timezone: string;
  platform: string;
  join_url?: string | null;
  capacity?: number | null;
  tagline?: string | null;
  intro?: string | null;
  benefits?: string[];
};

export type EventActionResult = { ok: true } | { ok: false; error: string };

function toUtcIso(local: string, tz: string): string | null {
  if (!local) return null;
  const offset = TZ_OFFSET[tz] ?? "+07:00";
  // local is "YYYY-MM-DDTHH:mm" — add seconds + the zone offset, then normalize.
  const d = new Date(`${local}:00${offset}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

type EventContent = {
  tagline?: string | null;
  intro?: string | null;
  benefits?: string[];
  [k: string]: unknown;
};

function buildContent(base: EventContent, input: EventInput): EventContent {
  // Preserve any keys the thin form doesn't manage (e.g. speakers) on edit.
  return {
    ...base,
    tagline: input.tagline?.trim() || null,
    intro: input.intro?.trim() || null,
    benefits: (input.benefits ?? [])
      .map((b) => b.trim())
      .filter((b) => b.length > 0),
  };
}

export async function createEvent(
  slug: string,
  input: EventInput,
): Promise<EventActionResult> {
  await assertAdmin();

  const cleanSlug = slug.trim().toLowerCase();
  if (!SLUG_RE.test(cleanSlug)) {
    return { ok: false, error: "Slug invalid (huruf kecil, angka, tanda hubung)." };
  }
  if (input.title.trim().length < 2) {
    return { ok: false, error: "Judul event wajib diisi." };
  }
  const startsAt = toUtcIso(input.starts_at_local, input.timezone);
  if (!startsAt) {
    return { ok: false, error: "Tanggal & jam mulai wajib diisi." };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("events").insert({
    slug: cleanSlug,
    title: input.title.trim(),
    kind: input.kind,
    status: input.status,
    starts_at: startsAt,
    timezone: input.timezone,
    platform: input.platform,
    join_url: input.join_url?.trim() || null,
    capacity: input.capacity ?? null,
    content: buildContent({}, input) as never,
  } as never);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: `Slug "${cleanSlug}" sudah dipakai event lain.` };
    }
    if (error.code === "23514") {
      return { ok: false, error: "Jenis atau status event tidak valid." };
    }
    throw new Error(`DB error: ${error.message}`);
  }

  await logAdminAction("create_event", "event", cleanSlug, {
    title: input.title.trim(),
    status: input.status,
  });
  revalidatePath("/admin/events");
  redirect(`/admin/events/${cleanSlug}`);
}

export async function updateEvent(
  slug: string,
  input: EventInput,
): Promise<EventActionResult> {
  await assertAdmin();

  if (input.title.trim().length < 2) {
    return { ok: false, error: "Judul event wajib diisi." };
  }
  const startsAt = toUtcIso(input.starts_at_local, input.timezone);
  if (!startsAt) {
    return { ok: false, error: "Tanggal & jam mulai wajib diisi." };
  }

  const supabase = await createServerClient();
  const { data: existing } = await supabase
    .from("events")
    .select("content")
    .eq("slug", slug)
    .maybeSingle();
  const base = ((existing as { content: EventContent } | null)?.content ?? {}) as EventContent;

  await logAdminAction("update_event", "event", slug, {
    title: input.title.trim(),
    status: input.status,
  });

  const { error } = await supabase
    .from("events")
    .update({
      title: input.title.trim(),
      kind: input.kind,
      status: input.status,
      starts_at: startsAt,
      timezone: input.timezone,
      platform: input.platform,
      join_url: input.join_url?.trim() || null,
      capacity: input.capacity ?? null,
      content: buildContent(base, input) as never,
    } as never)
    .eq("slug", slug);
  if (error) {
    if (error.code === "23514") {
      return { ok: false, error: "Jenis atau status event tidak valid." };
    }
    throw new Error(`DB error: ${error.message}`);
  }

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${slug}`);
  redirect(`/admin/events/${slug}`);
}

const REG_STATUSES = ["registered", "reminded", "attended", "no_show"] as const;

/** Update a single registration's lifecycle status (attendance tracking). */
export async function setRegistrationStatus(
  slug: string,
  id: string,
  status: string,
): Promise<EventActionResult> {
  await assertAdmin();
  if (!(REG_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "Status tidak valid." };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("event_registrations")
    .update({ status } as never)
    .eq("id", id);
  if (error) {
    throw new Error(`DB error: ${error.message}`);
  }

  await logAdminAction("set_registration_status", "event_registration", id, {
    status,
    event_slug: slug,
  });
  revalidatePath(`/admin/events/${slug}`);
  return { ok: true };
}
