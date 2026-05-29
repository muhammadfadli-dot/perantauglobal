/**
 * Meta Conversions API (CAPI) — portal-side.
 *
 * Mirror of apps/web/src/lib/meta-capi.ts. Same Pixel ID + access token (set
 * via env), so events from both domains land in the same Pixel and Meta
 * dedupes via `event_id`.
 *
 * Cross-domain context: ads land on perantauglobal.com (apps/web) where `_fbc`
 * cookie is created from `fbclid`. The user then verifies email and lands on
 * app.perantauglobal.com (apps/platform). The cookie does NOT auto-share
 * between subdomains, so apps/web forwards `_fbc` + `_fbp` as URL params on
 * the magic-link redirect; this app reads them in auth/callback and sets its
 * own first-party cookies. Portal CAPI events then carry the original click
 * attribution all the way through to CompleteRegistration / Lead at portal
 * milestones (apply, profile, etc.).
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api/
 */
import crypto from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
// Hard production guard: even if META_TEST_EVENT_CODE is mis-scoped to "All
// Environments" in Vercel, it must NEVER tag production CAPI events (that routes real
// conversions to Meta's Test Events tab and excludes them from ad optimization).
const TEST_EVENT_CODE =
  process.env.VERCEL_ENV === "production" ? undefined : process.env.META_TEST_EVENT_CODE;
const API_VERSION = "v21.0";

/** SHA-256 hash a value (lowercase, trimmed). Meta requires PII hashed. */
function sha256(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

/** Standard Meta event names used by the portal */
export type MetaEventName =
  | "Lead"
  | "Contact"
  | "CompleteRegistration"
  | "Subscribe"
  | "SubmitApplication";

export interface MetaEventParams {
  eventName: MetaEventName;
  /** Unique ID — match browser pixel's eventID for dedupe */
  eventId: string;
  /** Full URL where the event happened (server-side: best-effort from request) */
  sourceUrl: string;
  /** Client IP from x-forwarded-for (NOT hashed) */
  ip: string;
  /** Client user-agent (NOT hashed) */
  userAgent: string;
  /** Meta's browser ID cookie value (server reads from request cookies) */
  fbp?: string;
  /** Meta's click ID cookie value (forwarded cross-domain via URL on first portal hit) */
  fbc?: string;
  /** PII — SHA-256 hashed before send */
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    city?: string;
  };
  /** Free-form context: position slug, content category, etc. */
  customData?: Record<string, string>;
}

/**
 * Send a conversion event to Meta CAPI. Never throws — failure must not
 * break the user flow (auth callback, application submit, etc.). Errors
 * are logged to console for Vercel log inspection.
 */
export async function sendMetaEvent(params: MetaEventParams): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("[Meta CAPI platform] Skipped — META_PIXEL_ID or META_CAPI_ACCESS_TOKEN not set");
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

  const user_data: Record<string, unknown> = {
    client_ip_address: ip,
    client_user_agent: userAgent,
  };

  if (userData.email) user_data.em = [sha256(userData.email)];
  if (userData.phone) {
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
      console.error("[Meta CAPI platform] Error:", response.status, error);
    }
  } catch (error) {
    console.error("[Meta CAPI platform] Network error:", error);
  }
}
