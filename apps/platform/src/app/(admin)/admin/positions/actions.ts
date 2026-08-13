"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  createServerClient,
  createServiceRoleClient,
  requireAdmin,
} from "@/lib/supabase-server";
import { logAdminAction } from "@/lib/audit-log";
import { getCountryRegistry } from "@perantauglobal/db/country";
import type { PositionContent, ContentMedia, ContentSeo } from "@/lib/position-content";
import {
  validateContentForWrite,
  validateFieldInput,
} from "@/lib/position-write-validation";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function assertAdmin() {
  await requireAdmin("Forbidden");
}

/** How long a minted preview link stays usable. Long enough to review a draft,
 * short enough that a link pasted into chat doesn't outlive the conversation. */
const PREVIEW_TTL_MINUTES = 60;

export type PreviewLinkResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Mint a draft-preview link for apps/web (Fase 3.1, closes D4).
 *
 * Replaces the old "Preview tab baru" anchor, which pointed straight at
 * https://perantauglobal.com/lowongan/<slug> - the LIVE page. With a pending
 * draft it showed the previous content, and on a never-published position it
 * simply 404'd, which is the worst moment to lose the preview: first authoring.
 *
 * One token per position (PK on slug), so minting again rotates it and any
 * previously shared link dies immediately. Service-role because
 * position_preview_tokens has no RLS policies by design: the only read path is
 * the SECURITY DEFINER function, which demands the token.
 */
export async function createPreviewLink(slug: string): Promise<PreviewLinkResult> {
  await assertAdmin();

  if (!SLUG_RE.test(slug)) return { ok: false, error: "Slug invalid." };

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + PREVIEW_TTL_MINUTES * 60_000).toISOString();

  const admin = createServiceRoleClient() as unknown as {
    from(table: "position_preview_tokens"): {
      upsert(
        row: Record<string, unknown>,
        opts: { onConflict: string },
      ): Promise<{ error: { message: string } | null }>;
    };
  };
  const { error } = await admin.from("position_preview_tokens").upsert(
    { slug, token, expires_at: expiresAt },
    { onConflict: "slug" },
  );
  if (error) {
    // Most likely cause: migration 0105 not applied yet on this environment.
    console.warn(`[preview] mint failed slug=${slug}: ${error.message}`);
    return { ok: false, error: "Gagal bikin link preview. Coba lagi." };
  }

  await logAdminAction("create_preview_link", "position", slug, {
    expires_at: expiresAt,
  });

  // Env-overridable so a non-production deploy previews itself instead of
  // sending the admin to the live site (the old anchor always did the latter).
  const webUrl = process.env.WEB_PUBLIC_URL || "https://perantauglobal.com";
  return {
    ok: true,
    url: `${webUrl}/api/preview?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}`,
  };
}

/**
 * Fire-and-forget POST to apps/web's /api/revalidate endpoint to trigger
 * on-demand cache busting after admin changes form fields. Skipped silently
 * if env is missing (dev / non-prod).
 *
 * Required env (production):
 *   - WEB_REVALIDATE_URL      e.g. https://perantauglobal.com/api/revalidate
 *   - REVALIDATE_SECRET       same shared secret as the web endpoint
 */
async function notifyWebRevalidate(slug: string): Promise<void> {
  const url = process.env.WEB_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) {
    // Observability: make the silent-in-dev skip explicit in logs.
    console.info(`[revalidate-web] skipped (env not configured) slug=${slug}`);
    return;
  }
  let ok = false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, slug }),
      // Don't block admin UI on this — best effort, ISR fallback covers it
      // within 60s if the call fails.
      signal: AbortSignal.timeout(3000),
    });
    // fetch only rejects on transport errors - a 403 (bad secret) / 500 resolves
    // as "success" unless we inspect the status. That was the truly-silent
    // failure mode (E2). Check it.
    ok = res.ok;
    if (!ok) {
      console.warn(`[revalidate-web] non-OK ${res.status} from ${url} slug=${slug}`);
    } else {
      // res.ok is necessary but NOT sufficient. When apps/web has no
      // REVALIDATE_SECRET of its own it deliberately answers 200 with
      // {ok:true, skipped:"env not configured"} - a success status for a call
      // that revalidated nothing. Stamping that would make the editor's "Web
      // ter-update" row report a cache-bust that never happened: a worse lie
      // than the silence this check was written to end.
      const body = (await res.json().catch(() => null)) as { skipped?: string } | null;
      if (body?.skipped) {
        ok = false;
        console.warn(
          `[revalidate-web] 200 but skipped (${body.skipped}) slug=${slug} - apps/web needs REVALIDATE_SECRET too`,
        );
      }
    }
  } catch (err) {
    console.warn(
      `[revalidate-web] failed to notify ${url} slug=${slug}:`,
      err instanceof Error ? err.message : String(err),
    );
    return;
  }
  if (!ok) return;

  // Record the confirmed cache-bust so the admin editor can show
  // "web ter-update HH:MM" and a webhook that stops working becomes visible.
  // Stamp via service-role (this UPDATE touches only last_revalidated_at, so the
  // activation trigger's false->true guard never fires). Best-effort - never fail
  // the admin action over observability.
  try {
    const admin = createServiceRoleClient();
    await admin
      .from("positions")
      .update({ last_revalidated_at: new Date().toISOString() } as never)
      .eq("slug", slug);
    console.info(`[revalidate-web] ok slug=${slug}`);
  } catch (err) {
    console.warn(
      `[revalidate-web] stamp failed slug=${slug}:`,
      err instanceof Error ? err.message : String(err),
    );
  }
}

export type UpdatePositionMetaResult = { ok: true } | { ok: false; error: string };

export async function updatePositionMeta(
  slug: string,
  patch: { name?: string; description?: string; active?: boolean }
): Promise<UpdatePositionMetaResult> {
  await assertAdmin();
  const supabase = await createServerClient();

  // Guard: refuse to activate a position that can't actually serve candidates.
  // A live-but-empty position (never published, empty content, zero screening
  // fields) is the machine-operator leak — candidates apply with no screening
  // and show as 100% ready. Activation requires: published at least once +
  // non-empty content + >=1 syarat_utama field.
  if (patch.active === true) {
    // Mirror the DB activation trigger (migration 0104) exactly: a position may
    // only go live if it's been published, has non-empty content, AND actually
    // screens applicants. Effective-screening resolves through the same SQL
    // predicate the trigger uses (position_has_effective_screening, 0103) so app
    // and DB never disagree. The old check merely counted syarat_utama rows,
    // which let non-screening free-text questions satisfy activation (finding C1).
    const db = supabase as unknown as {
      rpc(
        fn: "position_has_effective_screening",
        args: { p_slug: string },
      ): Promise<{ data: boolean | null; error: { message: string } | null }>;
    };
    const [{ data: pos }, { data: screens }] = await Promise.all([
      supabase
        .from("positions")
        .select("published_at, content")
        .eq("slug", slug)
        .maybeSingle(),
      db.rpc("position_has_effective_screening", { p_slug: slug }),
    ]);
    const row = pos as { published_at: string | null; content: unknown } | null;
    const published = row?.published_at != null;
    const hasContent =
      !!row?.content &&
      typeof row.content === "object" &&
      Object.keys(row.content as object).length > 0;
    const hasScreening = screens === true;
    if (!published || !hasContent || !hasScreening) {
      const missing: string[] = [];
      if (!published) missing.push("belum pernah di-publish");
      if (!hasContent) missing.push("konten masih kosong");
      if (!hasScreening)
        missing.push(
          "belum ada pertanyaan screening yang menyaring (butuh >=1 pertanyaan wajib dengan opsi Lolos)",
        );
      return {
        ok: false,
        error: `Belum bisa diaktifkan: ${missing.join(", ")}. Lengkapi lalu Publish dulu.`,
      };
    }
  }

  await logAdminAction("update_position_meta", "position", slug, {
    ...(patch.active !== undefined ? { active: patch.active } : {}),
    changed_name: patch.name !== undefined,
    changed_description: patch.description !== undefined,
  });
  const { error } = await supabase
    .from("positions")
    .update({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.active !== undefined ? { active: patch.active } : {}),
    } as never)
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/positions");
  revalidatePath(`/admin/positions/${slug}`);
  // Visibility/name changes affect the public catalog — bust apps/web cache so
  // a deactivated position disappears immediately instead of lingering ~60s.
  if (patch.active !== undefined || patch.name !== undefined) {
    await notifyWebRevalidate(slug);
  }
  return { ok: true };
}

// ─── Identity edits: country + slug rename (Fase 1.3) ────────────────────

export type UpdatePositionCountryResult = { ok: true } | { ok: false; error: string };

/**
 * Change a position's placement country. The value must resolve against the
 * live country registry (public.countries) — an unknown value would drop the
 * position out of the public /lowongan grouping (silent-404 class). We store
 * the canonical db_value so downstream resolution is exact.
 */
export async function updatePositionCountry(
  slug: string,
  dbValue: string,
): Promise<UpdatePositionCountryResult> {
  await assertAdmin();
  const supabase = await createServerClient();
  const registry = await getCountryRegistry(supabase);
  const meta = registry.resolve(dbValue);
  if (!meta) {
    return { ok: false, error: `Negara "${dbValue}" tidak ada di registry.` };
  }
  const { error } = await supabase
    .from("positions")
    .update({ country: meta.dbValue } as never)
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  await logAdminAction("update_position_country", "position", slug, {
    country: meta.dbValue,
  });
  revalidatePath(`/admin/positions/${slug}`);
  revalidatePath("/admin/positions");
  await notifyWebRevalidate(slug);
  return { ok: true };
}

export type RenameSlugResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

/**
 * Rename a position's slug (its public URL). Delegates to the SECURITY DEFINER
 * `admin_rename_position_slug` DB function, which — in one transaction — renames
 * the row (cascading to applications / job_orders / pending_submissions /
 * application_fields via ON UPDATE CASCADE) and records old→new in
 * position_slug_aliases so the web permanently redirects the old URL. This is
 * what makes a slug fix safe while an ad points at the old link.
 */
export async function renamePositionSlug(
  oldSlug: string,
  newSlug: string,
): Promise<RenameSlugResult> {
  await assertAdmin();
  const clean = newSlug.trim().toLowerCase();
  if (!SLUG_RE.test(clean)) {
    return { ok: false, error: "Slug invalid (huruf kecil, angka, tanda hubung)." };
  }
  if (clean === oldSlug) {
    return { ok: true, slug: oldSlug };
  }

  const supabase = await createServerClient();
  // The RPC isn't in the generated Database types (added post-generation), so
  // type it locally rather than regenerate (which drops hand-added exports).
  const db = supabase as unknown as {
    rpc(
      fn: "admin_rename_position_slug",
      args: { p_old: string; p_new: string },
    ): Promise<{ error: { message: string } | null }>;
  };
  const { error } = await db.rpc("admin_rename_position_slug", {
    p_old: oldSlug,
    p_new: clean,
  });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("slug already taken")) {
      return { ok: false, error: `Slug "${clean}" sudah dipakai posisi lain. Pilih lain.` };
    }
    if (msg.includes("position not found")) {
      return { ok: false, error: "Posisi tidak ditemukan." };
    }
    if (msg.includes("invalid slug")) {
      return { ok: false, error: "Format slug tidak valid." };
    }
    if (msg.includes("forbidden")) {
      return { ok: false, error: "Tidak diizinkan." };
    }
    throw new Error(`Rename gagal: ${error.message}`);
  }

  await logAdminAction("rename_position_slug", "position", clean, {
    from: oldSlug,
    to: clean,
  });
  revalidatePath("/admin/positions");
  revalidatePath(`/admin/positions/${clean}`);
  // Old URL now 301s + new page is canonical — bust web cache for both so the
  // redirect and the renamed page are live within the ISR window.
  await notifyWebRevalidate(oldSlug);
  await notifyWebRevalidate(clean);
  return { ok: true, slug: clean };
}

/**
 * Hard delete a position. Refuses if any applications or job orders exist
 * for this slug — those carry candidate / employer history we don't want
 * to orphan. Admin should nonaktifkan via PositionMetaEditor in that case.
 *
 * Cascading effects on hard delete (handled by FK constraints):
 *   - position_application_fields rows are auto-removed (ON DELETE CASCADE)
 *   - pending_submissions for this slug are auto-removed (ON DELETE CASCADE)
 *   - applications.position_slug + job_orders.position_slug are RESTRICT,
 *     so the DB itself would refuse the delete — we pre-check for a
 *     friendlier error than the raw Postgres FK violation.
 */
export async function deletePosition(slug: string): Promise<void> {
  await assertAdmin();
  await logAdminAction("delete_position", "position", slug);
  const supabase = await createServerClient();

  const [{ count: appCount, error: appCountErr }, { count: joCount, error: joCountErr }] =
    await Promise.all([
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("position_slug", slug),
      supabase
        .from("job_orders")
        .select("*", { count: "exact", head: true })
        .eq("position_slug", slug),
    ]);
  if (appCountErr) throw new Error(`Gagal cek lamaran: ${appCountErr.message}`);
  if (joCountErr) throw new Error(`Gagal cek job order: ${joCountErr.message}`);

  if ((appCount ?? 0) > 0) {
    throw new Error(
      `Posisi ini punya ${appCount} lamaran. Hapus permanen tidak diizinkan — nonaktifkan aja kalau ga mau muncul di listing publik.`,
    );
  }
  if ((joCount ?? 0) > 0) {
    throw new Error(
      `Posisi ini punya ${joCount} job order. Hapus permanen tidak diizinkan — tutup / cancel JO-nya dulu.`,
    );
  }

  const { error } = await supabase.from("positions").delete().eq("slug", slug);
  if (error) {
    // Defense in depth: in case a record slipped in between our count check
    // and the DELETE, Postgres FK RESTRICT would surface as a "violates
    // foreign key constraint" error here. Translate to a friendly message.
    if (error.message.toLowerCase().includes("foreign key")) {
      throw new Error(
        "Tidak bisa hapus — ada data lain (lamaran / job order) yang masih mereferensikan posisi ini.",
      );
    }
    throw new Error(error.message);
  }

  revalidatePath("/admin/positions");
  await notifyWebRevalidate(slug);
}

// =========================================================================
// Removed in Fase 4 sunset (2026-05-25):
//   - updatePositionRequirements (raw JSON textarea for positions.requirements)
//   - addRequirementToPosition / removeRequirementFromPosition
//     (library catalog add/remove on positions.requirements JSONB)
//   - createFormField / updateFormField / deleteFormField / reorderFormField
//     (CRUD on position_form_fields)
// All replaced by the position_application_fields editor + positions.content
// JSONB editor. The legacy positions.requirements column + position_form_fields
// table have since been DROPPED (migrations 0035 + 0037) — no live code references
// them; the candidate lengkapi flow reads position_application_fields.
// =========================================================================


// =========================================================================
// Fase 2: position content + position_application_fields
// =========================================================================

/**
 * Save editor changes to positions.draft_content (NOT live).
 *
 * Phase 8b: the editor now writes to a working draft instead of the live
 * content. The public /lowongan page keeps reading positions.content until
 * admin explicitly clicks "Publish ke live" (publishPosition action below).
 *
 * - Whole-blob replacement (safer than jsonb merge for this editor).
 * - Size guard enforced at DB layer (positions content_size_check, 100KB).
 * - Does NOT revalidate apps/web — draft is invisible to the public.
 */
export async function saveDraft(slug: string, content: PositionContent) {
  await assertAdmin();
  // Reject a malformed content blob before it lands in the DB (E3) - the editor
  // is a trusted client, so this fires only on a genuine shape bug, not on
  // normal autosaves. NOTE: autosave is intentionally NOT audit-logged (it fires
  // on a debounce; the substance is captured by publish_position). media/seo
  // saves ARE logged (saveDraftMediaSeo) since they're deliberate, low-frequency.
  const invalid = validateContentForWrite(content);
  if (invalid) throw new Error(invalid);
  const supabase = await createServerClient();

  // media/seo are owned exclusively by the Media & SEO tab (saveDraftMediaSeo).
  // The Konten editor's in-memory content carries only the load-time media/seo, so
  // writing it verbatim would clobber any newer media/seo the Media tab saved to the
  // draft. Preserve the draft's existing media/seo (the authoritative copy) on every
  // Konten save. First save (no draft yet) seeds from the incoming load-time values.
  const { data: existing } = await supabase
    .from("positions")
    .select("draft_content")
    .eq("slug", slug)
    .maybeSingle();
  const prevDraft =
    (existing as { draft_content: PositionContent | null } | null)?.draft_content ?? null;
  const next: PositionContent = prevDraft
    ? { ...content, media: prevDraft.media, seo: prevDraft.seo }
    : content;

  const { error } = await supabase
    .from("positions")
    .update({ draft_content: next as never } as never)
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${slug}`);
}

/**
 * Save ONLY the media + seo keys into positions.draft_content, merging into the
 * current draft (or live content if no draft exists). Used by the Media & SEO tab.
 *
 * Disjoint-key ownership with saveDraft: the Konten editor owns every other key and
 * preserves media/seo; this owns media/seo and preserves everything else. That makes
 * the two tabs' independent auto-saves order-independent — neither can clobber the
 * other regardless of which saved last.
 */
export async function saveDraftMediaSeo(
  slug: string,
  media: ContentMedia | undefined,
  seo: ContentSeo | undefined,
) {
  await assertAdmin();
  // Media/SEO edits are deliberate + low-frequency (unlike the Konten autosave),
  // so they're worth an audit trail (E4) - the old gap meant a hero/OG swap left
  // no record. Logged before the write, per the audit-log contract.
  await logAdminAction("save_position_media_seo", "position", slug, {
    changed_media: media !== undefined,
    changed_seo: seo !== undefined,
  });
  const supabase = await createServerClient();

  const { data: existing } = await supabase
    .from("positions")
    .select("draft_content, content")
    .eq("slug", slug)
    .maybeSingle();
  const row = existing as
    | { draft_content: PositionContent | null; content: PositionContent | null }
    | null;
  const base = (row?.draft_content ?? row?.content ?? {}) as PositionContent;
  const next: PositionContent = { ...base, media, seo };

  const { error } = await supabase
    .from("positions")
    .update({ draft_content: next as never } as never)
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${slug}`);
}

// ─── Media upload (admin → Supabase Storage) ─────────────────────────────

const MEDIA_BUCKET = "position-media";
/** Accepted image MIME → file extension. Kept tight; employers send JPG/PNG. */
const ALLOWED_MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_MEDIA_BYTES = 6 * 1024 * 1024; // 6 MB

export type MediaSlot = "hero" | "logo" | "og";
export type UploadMediaResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const MEDIA_SLOT_KEY: Record<MediaSlot, keyof ContentMedia> = {
  hero: "heroUrl",
  logo: "employerLogoUrl",
  og: "ogImageUrl",
};

/**
 * Upload a position image straight from the admin's machine to the public
 * `position-media` bucket (service-role, RLS-bypassing) and record its public
 * URL in draft_content.media[slot]. This retires BOTH legacy media paths:
 * the "paste a URL" MVP and the engineer-commits-a-file-to-apps/web/public +
 * deploy path. Photos become data — live within ~60s of publish, zero deploy,
 * and the same object is read by web + portal.
 *
 * Stored at a stable per-slot path (lowongan/<slug>-<slot>.<ext>) with upsert;
 * the returned URL carries a ?v=<ts> cache-buster so a re-upload to the same
 * path busts the CDN/browser cache immediately instead of serving the old copy.
 *
 * Errors that are the admin's fault (bad type/size) are RETURNED as data (same
 * Next.js production-stripping reason as publishPosition); infra failures throw.
 */
export async function uploadPositionMedia(
  slug: string,
  slot: MediaSlot,
  formData: FormData,
): Promise<UploadMediaResult> {
  await assertAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Tidak ada file yang diunggah." };
  }
  const ext = ALLOWED_MEDIA_TYPES[file.type];
  if (!ext) {
    return { ok: false, error: "Format tidak didukung. Pakai JPG, PNG, atau WebP." };
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return {
      ok: false,
      error: `Ukuran maksimal 6 MB (file kamu ${(file.size / 1024 / 1024).toFixed(1)} MB). Kompres dulu.`,
    };
  }

  const objectPath = `lowongan/${slug}-${slot}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const admin = createServiceRoleClient();
  const { error: uploadErr } = await admin.storage
    .from(MEDIA_BUCKET)
    .upload(objectPath, buffer, {
      contentType: file.type,
      upsert: true,
      cacheControl: "3600",
    });
  if (uploadErr) throw new Error(`Upload gagal: ${uploadErr.message}`);

  const {
    data: { publicUrl },
  } = admin.storage.from(MEDIA_BUCKET).getPublicUrl(objectPath);
  const url = `${publicUrl}?v=${Date.now()}`;

  // Merge into the working draft's media, preserving other media slots + every
  // other content key (same disjoint-ownership contract as saveDraftMediaSeo:
  // this owns one media slot, Konten owns the rest).
  const supabase = await createServerClient();
  const { data: existing } = await supabase
    .from("positions")
    .select("draft_content, content")
    .eq("slug", slug)
    .maybeSingle();
  const row = existing as
    | { draft_content: PositionContent | null; content: PositionContent | null }
    | null;
  const base = (row?.draft_content ?? row?.content ?? {}) as PositionContent;
  const nextMedia: ContentMedia = { ...(base.media ?? {}), [MEDIA_SLOT_KEY[slot]]: url };
  const next: PositionContent = { ...base, media: nextMedia };

  const { error: writeErr } = await supabase
    .from("positions")
    .update({ draft_content: next as never } as never)
    .eq("slug", slug);
  if (writeErr) throw new Error(writeErr.message);

  await logAdminAction("upload_position_media", "position", slug, {
    slot,
    ext,
    bytes: file.size,
  });
  revalidatePath(`/admin/positions/${slug}`);
  return { ok: true, url };
}

/**
 * Result type for user-facing publish actions. Friendly errors are RETURNED
 * (not thrown) because Next.js production strips server-action exception
 * messages to the generic "Server Components render" overlay. Throwing is
 * reserved for actual programming errors (auth, unexpected DB outage).
 */
export type PublishActionResult = { ok: true } | { ok: false; error: string };

/**
 * Promote the working draft to live: copy positions.draft_content into
 * positions.content, stamp published_at = now(), clear draft_content.
 *
 * After this:
 *   - /lowongan reads the new content
 *   - draft and live are back in sync (draft_content = NULL)
 *   - apps/web ISR is busted via notifyWebRevalidate
 *
 * Refuses (returns ok: false) if there is no draft to publish — returning
 * the friendly message preserves it through Next.js production filtering.
 */
export async function publishPosition(slug: string): Promise<PublishActionResult> {
  await assertAdmin();
  const supabase = await createServerClient();

  // Fetch current draft (cannot publish without one).
  const { data, error: readErr } = await supabase
    .from("positions")
    .select("draft_content")
    .eq("slug", slug)
    .maybeSingle();
  if (readErr) {
    // Unexpected DB read failure — alertable. Throw to log as 500.
    throw new Error(`DB read error: ${readErr.message}`);
  }
  if (!data) {
    return { ok: false, error: "Posisi tidak ditemukan." };
  }
  const draft = (data as { draft_content: unknown }).draft_content;
  if (draft == null) {
    return {
      ok: false,
      error: "Tidak ada draft untuk dipublish. Edit dulu sebelum publish.",
    };
  }
  // Defense in depth: never promote a malformed blob to live content (E3). The
  // draft was written by saveDraft (which validates), but publish is the
  // last gate before the public renderer reads it.
  const invalidDraft = validateContentForWrite(draft);
  if (invalidDraft) {
    return { ok: false, error: `Draft belum bisa dipublish: ${invalidDraft}` };
  }

  await logAdminAction("publish_position", "position", slug);

  const { error: writeErr } = await supabase
    .from("positions")
    .update({
      content: draft as never,
      draft_content: null,
      published_at: new Date().toISOString(),
    } as never)
    .eq("slug", slug);
  if (writeErr) {
    // Unexpected DB write failure — alertable. Throw to log as 500.
    throw new Error(`DB write error: ${writeErr.message}`);
  }

  revalidatePath(`/admin/positions/${slug}`);
  revalidatePath("/admin/positions");
  await notifyWebRevalidate(slug);
  return { ok: true };
}

/**
 * Discard pending draft changes — drops draft_content back to NULL.
 * Live content stays untouched. Useful for "saya batalin perubahan ini".
 *
 * Returns discriminated union for the same reason as publishPosition:
 * keeps user-facing copy intact through Next.js production filtering.
 */
export async function discardDraft(slug: string): Promise<PublishActionResult> {
  await assertAdmin();
  await logAdminAction("discard_position_draft", "position", slug);
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("positions")
    .update({ draft_content: null } as never)
    .eq("slug", slug);
  if (error) {
    // Unexpected DB write failure — alertable. Throw to log as 500.
    throw new Error(`DB write error: ${error.message}`);
  }
  revalidatePath(`/admin/positions/${slug}`);
  return { ok: true };
}

/**
 * @deprecated since Phase 8b — use `saveDraft` directly. Kept as a thin
 * alias so existing callers (PositionEditorShell pre-PR-C) keep working
 * while we migrate them to the explicit draft/publish API.
 */
export async function updatePositionContent(slug: string, content: PositionContent) {
  await saveDraft(slug, content);
}

export type ApplicationFieldInput = {
  field_key: string;
  field_label: string;
  field_help?: string;
  field_type: "select" | "radio" | "number" | "text" | "textarea" | "file" | "multiselect";
  options?: { value: string; label: string; qualifying?: boolean }[] | null;
  importance?: "required" | "optional";
  section?: "syarat_utama" | "kualifikasi" | "screening";
  tier_weight?: number;
  sort_order?: number;
  collect_at_stage?: "applied" | "screening" | "document_check";
};

export async function createApplicationField(positionSlug: string, input: ApplicationFieldInput) {
  await assertAdmin();
  // Reject malformed field/options before write - a bad qualifying flag would
  // silently break the screening predicate (E3/C1).
  const invalidField = validateFieldInput(input);
  if (invalidField) throw new Error(invalidField);
  await logAdminAction("create_application_field", "application_field", positionSlug, {
    field_key: input.field_key,
    field_type: input.field_type,
    // Default to the apply form, not the later "lengkapi" step. Screening
    // questions are the overwhelming majority (170 syarat_utama fields across 39
    // positions vs 7 kualifikasi across 6), so a caller who omits section almost
    // always means "ask this when they apply". The old kualifikasi default put
    // the question somewhere the apply form never renders, which is how
    // trainee-technicians-kuwait went live screening nobody while every gate
    // reported it as screening (see migration 0106).
    section: input.section ?? "syarat_utama",
    importance: input.importance ?? "optional",
    options_count: input.options?.length ?? 0,
  });
  const supabase = await createServerClient();
  const { error } = await supabase.from("position_application_fields").insert({
    position_slug: positionSlug,
    field_key: input.field_key,
    field_label: input.field_label,
    field_help: input.field_help ?? null,
    field_type: input.field_type,
    options: input.options ?? null,
    importance: input.importance ?? "optional",
    // Default to the apply form, not the later "lengkapi" step. Screening
    // questions are the overwhelming majority (170 syarat_utama fields across 39
    // positions vs 7 kualifikasi across 6), so a caller who omits section almost
    // always means "ask this when they apply". The old kualifikasi default put
    // the question somewhere the apply form never renders, which is how
    // trainee-technicians-kuwait went live screening nobody while every gate
    // reported it as screening (see migration 0106).
    section: input.section ?? "syarat_utama",
    tier_weight: input.tier_weight ?? 0,
    sort_order: input.sort_order ?? 0,
    collect_at_stage: input.collect_at_stage ?? "applied",
  } as never);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${positionSlug}`);
  await notifyWebRevalidate(positionSlug);
}

export type FieldChangeImpact = {
  totalAnswered: number;
  shapeBroken: number;
  valueUnknown: number;
};

/**
 * How many ALREADY-SUBMITTED applications a pending field edit would damage.
 *
 * Read-only. The editor calls this right before saving and puts the numbers in
 * a confirm dialog, so the consequence is on screen before the click instead of
 * being discovered days later.
 *
 * Why this exists (2026-08-12): a bulk screening-field cleanup across a dozen
 * positions produced two failures nobody could see from the editor.
 *   - Changing a field's TYPE (radio <-> multiselect) changes the shape answers
 *     are expected to have; answers already stored keep the old shape. Nine such
 *     answers took /admin/applications down completely (migration 0122).
 *   - Renaming an option's `value` code silently orphans every answer holding
 *     the old code. On truck-driver-jepang the SIM options went a / b1 / b2 ->
 *     sim_a / sim_b1 / sim_b2, all three qualifying, and 166 candidates who
 *     genuinely hold that licence flipped to "Belum lolos". The labels on
 *     screen never changed, so nothing looked wrong.
 * The second one is the more dangerous of the two precisely because it breaks
 * nothing visibly: the page still loads, only the numbers are wrong.
 */
export async function previewFieldChangeImpact(
  positionSlug: string,
  fieldKey: string,
  nextType: ApplicationFieldInput["field_type"],
  nextOptions: { value: string; label: string; qualifying?: boolean }[] | null,
): Promise<FieldChangeImpact> {
  await assertAdmin();
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("preview_field_change_impact", {
    p_position_slug: positionSlug,
    p_field_key: fieldKey,
    p_next_type: nextType,
    p_next_options: nextOptions,
  });
  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : data) as
    | {
        total_menjawab: number | string;
        bentuk_tidak_cocok: number | string;
        nilai_tak_dikenal: number | string;
      }
    | undefined;
  return {
    totalAnswered: Number(row?.total_menjawab ?? 0),
    shapeBroken: Number(row?.bentuk_tidak_cocok ?? 0),
    valueUnknown: Number(row?.nilai_tak_dikenal ?? 0),
  };
}

export async function updateApplicationField(
  id: string,
  positionSlug: string,
  patch: Partial<ApplicationFieldInput>,
) {
  await assertAdmin();
  const invalidField = validateFieldInput(patch);
  if (invalidField) throw new Error(invalidField);
  await logAdminAction("update_application_field", "application_field", positionSlug, {
    field_id: id,
    changed_type: patch.field_type !== undefined,
    changed_options: patch.options !== undefined,
    changed_importance: patch.importance !== undefined,
    ...(patch.field_type !== undefined ? { field_type: patch.field_type } : {}),
  });
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("position_application_fields")
    .update({
      ...(patch.field_label !== undefined ? { field_label: patch.field_label } : {}),
      ...(patch.field_help !== undefined ? { field_help: patch.field_help } : {}),
      ...(patch.field_type !== undefined ? { field_type: patch.field_type } : {}),
      ...(patch.options !== undefined ? { options: patch.options } : {}),
      ...(patch.importance !== undefined ? { importance: patch.importance } : {}),
      ...(patch.section !== undefined ? { section: patch.section } : {}),
      ...(patch.tier_weight !== undefined ? { tier_weight: patch.tier_weight } : {}),
      ...(patch.sort_order !== undefined ? { sort_order: patch.sort_order } : {}),
      ...(patch.collect_at_stage !== undefined ? { collect_at_stage: patch.collect_at_stage } : {}),
    } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${positionSlug}`);
  await notifyWebRevalidate(positionSlug);
}

export async function deleteApplicationField(id: string, positionSlug: string) {
  await assertAdmin();
  await logAdminAction("delete_application_field", "application_field", positionSlug, {
    field_id: id,
  });
  const supabase = await createServerClient();
  const { error } = await supabase.from("position_application_fields").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${positionSlug}`);
  await notifyWebRevalidate(positionSlug);
}

export async function reorderApplicationField(
  id: string,
  positionSlug: string,
  direction: "up" | "down",
) {
  await assertAdmin();
  await logAdminAction("reorder_application_field", "application_field", positionSlug, {
    field_id: id,
    direction,
  });
  const supabase = await createServerClient();
  const { data, error: fetchErr } = await supabase
    .from("position_application_fields")
    .select("id, sort_order")
    .eq("position_slug", positionSlug)
    .order("sort_order", { ascending: true });
  if (fetchErr) throw new Error(fetchErr.message);
  const fields = (data ?? []) as { id: string; sort_order: number }[];
  const idx = fields.findIndex((f) => f.id === id);
  if (idx === -1) throw new Error("Field tidak ditemukan.");
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= fields.length) return;
  const a = fields[idx];
  const b = fields[swapIdx];
  const { error: e1 } = await supabase
    .from("position_application_fields")
    .update({ sort_order: b.sort_order } as never)
    .eq("id", a.id);
  if (e1) throw new Error(e1.message);
  const { error: e2 } = await supabase
    .from("position_application_fields")
    .update({ sort_order: a.sort_order } as never)
    .eq("id", b.id);
  if (e2) throw new Error(e2.message);
  revalidatePath(`/admin/positions/${positionSlug}`);
  await notifyWebRevalidate(positionSlug);
}
