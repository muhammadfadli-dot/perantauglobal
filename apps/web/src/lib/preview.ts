/**
 * Draft-preview session plumbing (Fase 3.1, closes D4).
 *
 * Next's Draft Mode is the mechanism on purpose: it is built to bypass the
 * static/ISR cache for one visitor holding the cookie, while everyone else
 * keeps getting the cached public page. The alternative — force-dynamic on the
 * detail route — would have de-optimised the single most-trafficked page on the
 * site (the one ads point at) just to serve admin previews.
 */
import { draftMode, cookies } from "next/headers";
import { fetchPositionDraftPreview, type PositionDraftPreview } from "./positions-db";

export const PREVIEW_COOKIE = "pg_preview";

/**
 * Returns the draft for `slug` when the caller is in a valid preview session
 * for that exact slug, else undefined (so the caller renders the live page).
 *
 * Re-verifies the token against the DB on every render rather than trusting the
 * cookie: revoking a preview is then just rotating/expiring the token, with no
 * lingering session to chase.
 */
export async function getPreviewForSlug(
  slug: string,
): Promise<PositionDraftPreview | undefined> {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return undefined;

  const raw = (await cookies()).get(PREVIEW_COOKIE)?.value;
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw) as { slug?: unknown; token?: unknown };
    // Scope check: a preview session for one position must not unlock another.
    if (typeof parsed.slug !== "string" || parsed.slug !== slug) return undefined;
    if (typeof parsed.token !== "string" || !parsed.token) return undefined;
    return await fetchPositionDraftPreview(slug, parsed.token);
  } catch {
    return undefined;
  }
}
