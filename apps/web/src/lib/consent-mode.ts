/**
 * Cookie consent + Google Consent Mode v2 (UU PDP 27/2022).
 *
 * Why this exists: the privacy policy declares GA4, Google Tag Manager and Meta
 * Pixel, but until 2026-07-21 the site set no consent signal at all - every tag
 * fired on first paint. Having just moved every form to affirmative consent, an
 * implied-consent tracking layer would have been the obvious loose thread for
 * anyone auditing us.
 *
 * How it is wired:
 *   1. `CONSENT_DEFAULT_SNIPPET` runs as a RAW inline <script> at the very top of
 *      <head>, so it executes during HTML parse - before the GTM container,
 *      which next/third-parties injects with afterInteractive. Consent Mode only
 *      works if the default lands BEFORE the tags, so the ordering is load-
 *      bearing. Do not convert it to next/script or move it below <head>.
 *   2. It reads a previously-saved choice synchronously and seeds the default
 *      from it, so a returning visitor who already accepted never gets a frame
 *      of denied state (which would drop that pageview).
 *   3. The banner later calls `gtag('consent','update',...)` when the visitor
 *      chooses.
 *
 * Measurement note: denying here suppresses the BROWSER pixel only. Lead
 * conversions are also sent server-side via the Conversions API (see
 * lib/meta-capi.ts), which is unaffected, so conversion counting survives a
 * refusal even though browser-side signal does not.
 *
 * IMPORTANT, not done in code: GA4 honours Consent Mode natively, but the Meta
 * Pixel tag inside the GTM container must be given an "additional consent check"
 * in the GTM UI to actually respect ad_storage. Without that container-side
 * setting the pixel keeps firing regardless of what this file says.
 */

/** Bump when the categories or their meaning change, to re-ask everyone. */
export const CONSENT_VERSION = "2026-07-21";

export const CONSENT_STORAGE_KEY = "pg_cookie_consent";

export type ConsentChoice = {
  /** GA4 + GTM measurement. */
  analytics: boolean;
  /** Meta Pixel + ad personalisation signals. */
  ads: boolean;
  version: string;
  /** ISO timestamp, so we can evidence when the choice was made. */
  decidedAt: string;
};

/**
 * Raw JS injected into <head>. Kept as a string on purpose: it must be inline
 * and synchronous. Sets security/functionality storage to granted (strictly
 * necessary, no consent required) and everything else per the saved choice,
 * defaulting to denied.
 */
export const CONSENT_DEFAULT_SNIPPET = `
(function(){
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = window.gtag || gtag;
  var analytics = 'denied', ads = 'denied';
  try {
    var raw = localStorage.getItem('${CONSENT_STORAGE_KEY}');
    if (raw) {
      var saved = JSON.parse(raw);
      if (saved && saved.version === '${CONSENT_VERSION}') {
        analytics = saved.analytics ? 'granted' : 'denied';
        ads = saved.ads ? 'granted' : 'denied';
      }
    }
  } catch (e) {}
  gtag('consent', 'default', {
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
    analytics_storage: analytics,
    personalization_storage: analytics,
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });
})();
`.trim();

/** Reads the stored choice. Returns null when absent, malformed, or stale. */
export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentChoice>;
    // A version mismatch means the categories changed since they decided, so the
    // old answer no longer covers what we would be doing. Treat it as unasked.
    if (parsed?.version !== CONSENT_VERSION) return null;
    if (typeof parsed.analytics !== "boolean" || typeof parsed.ads !== "boolean") {
      return null;
    }
    return parsed as ConsentChoice;
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// Tiny external store, so the banner can read localStorage through
// useSyncExternalStore instead of a mount effect. localStorage is by definition
// an external source React does not control, and the server cannot see it, so
// this is the idiomatic shape rather than setState-after-mount.
// --------------------------------------------------------------------------

const listeners = new Set<() => void>();

export function subscribeConsent(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** True once the visitor has made a choice. Drives whether the banner shows. */
export function hasDecidedConsent(): boolean {
  return readConsent() !== null;
}

/**
 * Server snapshot. Reports "decided" so the banner renders nothing during SSR:
 * the real answer lives in localStorage, and guessing "undecided" would flash a
 * banner at returning visitors who already chose.
 */
export function hasDecidedConsentServer(): boolean {
  return true;
}

/** Persists the choice and pushes the Consent Mode update to GTM. */
export function writeConsent(analytics: boolean, ads: boolean): ConsentChoice {
  const choice: ConsentChoice = {
    analytics,
    ads,
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
  } catch {
    // Private mode or storage disabled. The update below still applies to this
    // pageview; we simply have to ask again next time.
  }

  const a = analytics ? "granted" : "denied";
  const d = ads ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    ad_storage: d,
    ad_user_data: d,
    ad_personalization: d,
    analytics_storage: a,
    personalization_storage: a,
  });
  // Container-side trigger, so GTM tags that need to fire on acceptance (rather
  // than on the next pageview) have something to listen for.
  window.dataLayer?.push({ event: "cookie_consent_update", analytics, ads });

  for (const listener of listeners) listener();

  return choice;
}
