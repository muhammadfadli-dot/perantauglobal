/**
 * Portal-side tracking utilities. Mirrors apps/web/src/lib/tracking.ts +
 * adds helpers for cross-domain `_fbc` / `_fbp` handoff from apps/web.
 *
 * Flow on first portal hit (e.g., user clicks email verification link):
 *   1. apps/web embedded `fbp=...&fbc=...` in the magic-link redirect URL
 *   2. apps/platform auth/callback reads them via `readMetaParamsFromRequest`
 *   3. We set first-party cookies `_fbp` and `_fbc` on app.perantauglobal.com
 *      using `metaCookieSetters`, with Meta's recommended 90-day TTL
 *   4. Browser Pixel (loaded via GTM in layout) will use these cookies on
 *      subsequent pageviews — no further forwarding needed
 *   5. Server-side CAPI calls read the cookies from request headers and
 *      include them in the `user_data` payload
 *
 * Dedup discipline: every server-side `sendMetaEvent` should match a
 * browser-side event with the same `event_id` when possible. CompleteRegistration
 * has no browser counterpart (server-only milestone), so we generate fresh IDs.
 */
import type { NextRequest, NextResponse } from "next/server";

/**
 * Generate a unique event ID for deduplication between browser pixel and CAPI.
 * Format: {prefix}_{timestamp}_{random} — guaranteed unique per event instance.
 */
export function generateEventId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Read Meta's cookies from the browser (client side only).
 * - _fbp: Browser ID — set by Meta Pixel JS on first visit
 * - _fbc: Click ID — set when user arrives via FB ad (contains fbclid)
 */
export function getMetaCookies(): { fbp: string; fbc: string } {
  if (typeof document === "undefined") return { fbp: "", fbc: "" };

  const fbp = document.cookie.match(/_fbp=([^;]+)/)?.[1] || "";
  const fbc = document.cookie.match(/_fbc=([^;]+)/)?.[1] || "";
  return { fbp, fbc };
}

/**
 * Read fbp / fbc values that came across cross-domain via URL params (sent
 * by apps/web when constructing the magic-link emailRedirectTo). Use in
 * a Next route handler for `auth/callback`.
 */
export function readMetaParamsFromRequest(request: NextRequest): {
  fbp: string | null;
  fbc: string | null;
} {
  const url = new URL(request.url);
  return {
    fbp: url.searchParams.get("fbp"),
    fbc: url.searchParams.get("fbc"),
  };
}

/**
 * Read existing _fbp / _fbc from request cookies. Use server-side before
 * firing CAPI events to attribute correctly when user is already
 * cookie'd from a prior visit.
 */
export function readMetaCookiesFromRequest(request: NextRequest): {
  fbp?: string;
  fbc?: string;
} {
  return {
    fbp: request.cookies.get("_fbp")?.value,
    fbc: request.cookies.get("_fbc")?.value,
  };
}

/**
 * Set _fbp / _fbc as first-party cookies on the current host so the browser
 * Pixel picks them up. Pass values forwarded from the LP via URL params.
 *
 * Meta's convention: 90-day TTL, host-scoped (no Domain= attribute — the
 * Pixel matches on cookie name, not domain). Both apps/web and apps/platform
 * set their own copies; that's intentional, not a leak.
 */
export function writeMetaCookies(
  response: NextResponse,
  values: { fbp?: string | null; fbc?: string | null },
): void {
  const ninetyDaysSec = 60 * 60 * 24 * 90;
  const opts = {
    httpOnly: false,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ninetyDaysSec,
  };
  if (values.fbp) response.cookies.set("_fbp", values.fbp, opts);
  if (values.fbc) response.cookies.set("_fbc", values.fbc, opts);
}
