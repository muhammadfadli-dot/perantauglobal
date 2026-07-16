import { NextResponse, type NextRequest } from "next/server";
import { draftMode, cookies } from "next/headers";
import { fetchPositionDraftPreview } from "@/lib/positions-db";
import { PREVIEW_COOKIE } from "@/lib/preview";

/**
 * Draft-preview entry point (Fase 3.1, closes D4).
 *
 * The admin editor's "Preview tab baru" used to open the LIVE public page, so
 * an admin with a pending draft saw the *old* content and a never-published
 * position 404'd. This route trades a one-time token for a draft-mode session,
 * then hands off to the real /lowongan/[slug] page — which renders the draft
 * because the page reads its content through the preview branch. No separate
 * preview renderer exists to drift from the real one.
 *
 *   GET /api/preview?slug=<slug>&token=<token>
 *     → 307 to /id/lowongan/<slug> with draft mode on
 *
 * The token is verified in the DB (get_position_draft_preview, migration 0105),
 * never here — this route cannot be tricked into enabling draft mode for a slug
 * the caller has no token for, because the lookup IS the check.
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const token = request.nextUrl.searchParams.get("token");

  if (!slug || !token) {
    return NextResponse.json({ error: "slug + token wajib" }, { status: 400 });
  }

  // Verifying by actually resolving the draft means a token that is expired,
  // rotated, or for a different slug fails here rather than half-enabling a
  // preview session that renders nothing.
  const preview = await fetchPositionDraftPreview(slug, token);
  if (!preview) {
    console.warn(`[preview] rejected slug=${slug} (bad, expired, or rotated token)`);
    return NextResponse.json(
      { error: "Link preview tidak valid atau sudah kedaluwarsa. Buat ulang dari editor." },
      { status: 403 },
    );
  }

  (await draftMode()).enable();

  // draftMode() only carries a boolean, so the slug+token ride along in their
  // own httpOnly cookie for the page to re-resolve the draft with. Scoped to
  // one slug: a preview session for A must never unlock B.
  (await cookies()).set(PREVIEW_COOKIE, JSON.stringify({ slug, token }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 hour; the token itself expires independently in the DB
  });

  console.info(`[preview] enabled slug=${slug}`);
  return NextResponse.redirect(new URL(`/id/lowongan/${slug}`, request.url));
}
