import type { NextConfig } from "next";

/**
 * apps/demand — Daya Talenta Global demand-side marketing site
 * (dayatalentaglobal.com). English-only, no i18n, no auth, no middleware.
 *
 * Security headers mirror the other apps. CSP starts in Report-Only so design
 * iteration is never silently blocked; flip CSP_ENFORCE=true before the
 * production domain cutover. Third-party origins (GTM / GA / Meta / Vercel /
 * Supabase) are pre-whitelisted so analytics can be wired without a CSP edit.
 */
const CSP_ENFORCE = false;

const cspDirectives = [
  "default-src 'self'",
  // 'unsafe-inline' required by Next.js hydration runtime + Tailwind inline styles.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  // Self-hosted fonts via next/font (no external font CDN).
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://www.facebook.com",
  "connect-src 'self' https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://graph.facebook.com https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
