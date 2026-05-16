import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// CSP for the marketing site.
// Starts in REPORT-ONLY mode because GTM container can load arbitrary tags
// added by the marketing team (LinkedIn Pixel, TikTok Pixel, etc.) without
// touching this code. Report-only lets us monitor violations in production
// for ~1-2 weeks, then flip CSP_ENFORCE = true once we know the full set
// of tag-served origins.
//
// Once enforced, every new GTM tag origin must be added to script-src /
// connect-src / img-src below. That's the price of a strict CSP — a feature,
// not a bug.
const CSP_ENFORCE = false;

const cspDirectives = [
  "default-src 'self'",
  // 'unsafe-inline' for Next.js hydration; 'unsafe-eval' kept off until we see
  // a violation report needing it (some GA tags use eval, but the modern ones
  // shouldn't).
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://www.googletagmanager.com https://www.google-analytics.com https://www.facebook.com https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://graph.facebook.com https://www.googletagmanager.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
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
    // Allow higher quality for graphic illustrations (wireframe globe, etc.)
    // Default Next 16 only allows q=75. Listing additional values whitelists them.
    qualities: [60, 75, 90],
    // Prefer AVIF (smaller) → WebP → JPEG. AVIF can be 30-50% smaller than JPEG
    // at same visual quality, important for mobile users on slow connections.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // EN locale retired — all /en/* → homepage. Site is now ID-only,
      // focused on PMI (Indonesian worker) audience. Employer/mitra
      // portal deferred; restore when employer re-entry is planned.
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/", permanent: true },
      // ID-only: /mitra retired (employer portal deferred)
      { source: "/mitra", destination: "/", permanent: true },
      { source: "/id/mitra", destination: "/", permanent: true },
      // Taxonomy restructure: program → lowongan
      { source: "/program/truck-driver", destination: "/lowongan/truck-driver-jepang", permanent: true },
      { source: "/id/program/truck-driver", destination: "/lowongan/truck-driver-jepang", permanent: true },
      { source: "/en/program/truck-driver", destination: "/lowongan/truck-driver-jepang", permanent: true },
      // Global Nurse removed — redirect to specific nurse lowongan
      { source: "/program/global-nurse", destination: "/lowongan/perawat-saudi-arabia", permanent: true },
      { source: "/id/program/global-nurse", destination: "/lowongan/perawat-saudi-arabia", permanent: true },
      { source: "/en/program/global-nurse", destination: "/lowongan/perawat-saudi-arabia", permanent: true },
      // Generic /daftar retired — funnel to talent hub
      { source: "/daftar", destination: "/talent-hub", permanent: true },
      { source: "/id/daftar", destination: "/talent-hub", permanent: true },
      // GTH program → /talent-hub (THE app, not a separate program)
      { source: "/program/global-talent-hub", destination: "/talent-hub", permanent: true },
      { source: "/id/program/global-talent-hub", destination: "/talent-hub", permanent: true },
      // SPG program → /lowongan/spg-indonesia (treated as a domestic lowongan now)
      { source: "/program/spg", destination: "/lowongan/spg-indonesia", permanent: true },
      { source: "/id/program/spg", destination: "/lowongan/spg-indonesia", permanent: true },
      // /destinasi retired — info merged into individual lowongan pages
      { source: "/destinasi", destination: "/lowongan", permanent: true },
      { source: "/destinasi/:path*", destination: "/lowongan", permanent: true },
      { source: "/id/destinasi", destination: "/lowongan", permanent: true },
      { source: "/id/destinasi/:path*", destination: "/lowongan", permanent: true },
      // /blog retired — Panji handles content manually for now
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:path*", destination: "/", permanent: true },
      { source: "/id/blog", destination: "/", permanent: true },
      { source: "/id/blog/:path*", destination: "/", permanent: true },
      // /cerita-sukses retired — testimonials need to be real & legal-cleared
      { source: "/cerita-sukses", destination: "/", permanent: true },
      { source: "/id/cerita-sukses", destination: "/", permanent: true },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default withNextIntl(nextConfig);
