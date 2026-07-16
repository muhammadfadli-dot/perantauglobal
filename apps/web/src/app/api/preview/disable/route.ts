import { NextResponse, type NextRequest } from "next/server";
import { draftMode, cookies } from "next/headers";
import { PREVIEW_COOKIE } from "@/lib/preview";

/**
 * Leaves draft-preview mode and returns to the real public page.
 *
 * Reachable from the "Keluar dari preview" button in the preview banner. Also
 * the escape hatch if someone forgets they are in a preview session: without
 * this, a stale draft-mode cookie would keep serving them draft content for an
 * hour while everyone else sees live, which is exactly the kind of quiet
 * mismatch this phase is meant to remove.
 */
export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  (await cookies()).delete(PREVIEW_COOKIE);

  const slug = request.nextUrl.searchParams.get("slug");
  const target = slug ? `/id/lowongan/${slug}` : "/id/lowongan";
  return NextResponse.redirect(new URL(target, request.url));
}
