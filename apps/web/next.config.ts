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
      // Generic /daftar retired — funnel to GTH talent hub
      { source: "/daftar", destination: "/program/global-talent-hub", permanent: true },
      { source: "/id/daftar", destination: "/program/global-talent-hub", permanent: true },
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
