import type { NextConfig } from "next";

/**
 * apps/platform serves two audiences via route groups:
 * - (candidate) at / — mobile-first candidate portal (app.perantauglobal.com)
 * - (admin)     at /admin — data-dense CRM
 *
 * Production rewrite rule (future): admin.perantauglobal.com → /admin/*
 * handled at the Vercel project level.
 */

// CSP enforce mode for the platform app.
// Scope: Supabase auth/storage/REST + first-party Next.js + the SAME GTM container
// as apps/web. The portal loads GoogleTagManager (see layout.tsx) so the browser
// Meta Pixel fires here too, completing the cross-domain _fbc/_fbp attribution — so
// the GTM / Meta origins MUST be whitelisted (mirrors apps/web's directives) or the
// enforced CSP silently blocks gtm.js and the pixel never loads. Vercel Analytics
// (va.vercel-scripts.com / vitals.vercel-insights.com) is whitelisted alongside.
//
// To soften temporarily for debugging (e.g. adding a new third-party):
//   set CSP_ENFORCE=false → switches to Content-Security-Policy-Report-Only
const CSP_ENFORCE = true;

const cspDirectives = [
  "default-src 'self'",
  // 'unsafe-inline' is required by Next.js for hydration markers/runtime.
  // Migrate to nonce-based CSP when Next.js App Router fully supports it.
  // GTM/GA/FB pixel + va.vercel-scripts.com for the Vercel Analytics script.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://va.vercel-scripts.com",
  // Tailwind 4 + inline style attributes from React components.
  "style-src 'self' 'unsafe-inline'",
  // Self-hosted fonts via next/font (no external font CDN).
  "font-src 'self' data:",
  // Supabase Storage signed URLs serve images from *.supabase.co.
  // data:/blob: needed for client-side file preview before upload.
  // GTM/GA/FB pixel beacons load tracking images from their origins.
  "img-src 'self' data: blob: https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://www.facebook.com",
  // Supabase Auth (token refresh), REST, Realtime, Storage all on *.supabase.co.
  // GTM/GA/Meta CAPI browser beacons + vitals.vercel-insights.com for Vercel Analytics.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://graph.facebook.com https://vitals.vercel-insights.com",
  // Block all framing — admin tool, no legitimate embed use case.
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // HSTS: 2-year max-age + subdomains. NO `preload` directive yet —
  // adding `preload` is a 2-year one-way commitment (browser hard-codes the
  // domain into the HSTS preload list). Add `; preload` once the team is
  // confident HTTPS is permanently stable, then submit to hstspreload.org.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  // Clickjacking defense: redundant with frame-ancestors in CSP, kept for
  // older browsers that don't honor CSP's frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  // Block MIME-sniffing: forces browsers to honor declared Content-Type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to third parties; same-origin gets the path.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features we don't use. If a future flow needs camera
  // (e.g. live KTP capture), add `camera=(self)` here.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: CSP_ENFORCE ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
    value: cspDirectives,
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
