import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Cross-app on-demand revalidation endpoint.
 *
 * Called by apps/platform admin actions after editing position metadata or
 * position_form_fields, so that website pages (lowongan list + lowongan/[slug])
 * pick up changes without waiting for the 60s ISR window.
 *
 * Auth: shared secret via REVALIDATE_SECRET env. Required to prevent
 * arbitrary cache invalidation from the public internet.
 *
 * Request body:
 *   { secret: string, slug?: string }
 *     - slug omitted → revalidate the whole /lowongan list page only
 *     - slug present → revalidate /lowongan/[slug] AND /lowongan list
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    // Endpoint disabled when env not configured. Return 200 so callers
    // (admin actions) treat it as a graceful no-op in dev/staging without
    // surfacing scary errors.
    return NextResponse.json({ ok: true, skipped: "env not configured" });
  }

  let body: { secret?: unknown; slug?: unknown };
  try {
    body = (await request.json()) as { secret?: unknown; slug?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.secret !== "string" || body.secret !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const slug = typeof body.slug === "string" && body.slug.length > 0 ? body.slug : null;

  // Always revalidate the list page. The `/lowongan` and `/[locale]/lowongan`
  // routes both render — the locale-prefixed one is what Next renders for
  // perantauglobal.com, but revalidating the unprefixed path covers any
  // residual cache as well.
  revalidatePath("/[locale]/lowongan", "page");
  if (slug) {
    revalidatePath(`/[locale]/lowongan/${slug}`, "page");
  }

  return NextResponse.json({
    ok: true,
    revalidated: slug ? ["lowongan list", `lowongan/${slug}`] : ["lowongan list"],
  });
}
