/**
 * Client-side tracking utilities.
 *
 * Two responsibilities:
 * 1. Push events to GTM dataLayer (browser pixel picks these up)
 * 2. Provide helpers for CAPI integration (event_id generation, cookie reading)
 *
 * The event_id is the KEY to deduplication:
 * - Same event_id goes to both browser pixel (via dataLayer) and CAPI (via API route)
 * - Meta sees both, matches on event_id, counts as ONE event
 * - Without this, conversions would be double-counted
 */

/**
 * Generate a unique event ID for deduplication between browser pixel and CAPI.
 * Format: {prefix}_{timestamp}_{random} — guaranteed unique per event instance.
 */
export function generateEventId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Read Meta's cookies from the browser.
 * - _fbp: Browser ID — set by Meta Pixel JS on first visit, identifies the browser
 * - _fbc: Click ID — set when user arrives via a Facebook ad click (contains fbclid)
 *
 * These are sent to our API routes, which forward them to CAPI.
 * Meta uses these to match server-side events to browser sessions.
 */
export function getMetaCookies(): { fbp: string; fbc: string } {
  if (typeof document === "undefined") return { fbp: "", fbc: "" };

  const fbp = document.cookie.match(/_fbp=([^;]+)/)?.[1] || "";
  const fbc = document.cookie.match(/_fbc=([^;]+)/)?.[1] || "";
  return { fbp, fbc };
}

/**
 * Push an event to the GTM dataLayer.
 * The browser-side Meta Pixel (configured in GTM) picks up these events.
 *
 * eventId is passed so GTM can forward it to the pixel for deduplication with CAPI.
 */
export function trackEvent(
  event: string,
  params?: Record<string, string>,
  eventId?: string
) {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event,
      ...params,
      ...(eventId && { eventId }),
    });
  }
}
