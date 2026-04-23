import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
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
