/**
 * Meta Conversions API (CAPI) utility.
 *
 * Sends server-side events to Meta for accurate conversion tracking.
 * Used alongside the browser-side Meta Pixel (via GTM) for dual tracking.
 *
 * Why dual? Browser pixel misses ~30% of events (ad blockers, iOS privacy).
 * CAPI sends from our server — can't be blocked. Meta deduplicates using event_id.
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api/
 */
import crypto from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE; // optional, dev only
const API_VERSION = "v21.0";

/**
 * SHA-256 hash a value (lowercase, trimmed).
 * Meta requires all user data to be hashed before sending — never sent in plain text.
 */
function sha256(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

/** Standard Meta event names we use */
export type MetaEventName = "Lead" | "Contact" | "CompleteRegistration";

/** Parameters for sending an event to Meta CAPI */
export interface MetaEventParams {
  /** Standard event name — Meta uses this for ad optimization */
  eventName: MetaEventName;
  /** Unique ID — must match the eventID sent by the browser pixel for deduplication */
  eventId: string;
  /** Full URL of the page where the event occurred */
  sourceUrl: string;
  /** User's IP address (from request headers, NOT hashed) */
  ip: string;
  /** User's browser User-Agent (from request headers, NOT hashed) */
  userAgent: string;
  /** Meta's browser ID cookie — set by the pixel JS, forwarded from client */
  fbp?: string;
  /** Meta's click ID cookie — set when user arrives via Facebook ad click */
  fbc?: string;
  /** User data — will be SHA-256 hashed before sending */
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    city?: string;
  };
  /** Custom data — program name, category, etc. */
  customData?: Record<string, string>;
}

/**
 * Send a conversion event to Meta Conversions API.
 *
 * This function NEVER throws — CAPI failure must not break form submissions.
 * Errors are logged to console for debugging via Vercel logs.
 */
export async function sendMetaEvent(params: MetaEventParams): Promise<void> {
  // Skip if not configured (e.g., local dev without env vars)
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("[Meta CAPI] Skipped — META_PIXEL_ID or META_CAPI_ACCESS_TOKEN not set");
    return;
  }

  const {
    eventName,
    eventId,
    sourceUrl,
    ip,
    userAgent,
    fbp,
    fbc,
    userData,
    customData,
  } = params;

  // Build user_data with hashed PII
  const user_data: Record<string, unknown> = {
    client_ip_address: ip,
    client_user_agent: userAgent,
  };

  if (userData.email) user_data.em = [sha256(userData.email)];
  if (userData.phone) {
    // Remove non-digit characters, then hash
    const cleanPhone = userData.phone.replace(/\D/g, "");
    user_data.ph = [sha256(cleanPhone)];
  }
  if (userData.firstName) user_data.fn = [sha256(userData.firstName)];
  if (userData.city) user_data.ct = [sha256(userData.city)];
  if (fbp) user_data.fbp = fbp;
  if (fbc) user_data.fbc = fbc;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: sourceUrl,
        user_data,
        ...(customData && { custom_data: customData }),
      },
    ],
  };

  // Include test event code in dev/preview for Meta's Test Events tab
  if (TEST_EVENT_CODE) {
    payload.test_event_code = TEST_EVENT_CODE;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[Meta CAPI] Error:", response.status, error);
    }
  } catch (error) {
    // Network error — log but never throw
    console.error("[Meta CAPI] Network error:", error);
  }
}
