import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Removed EN pages → redirect to closest equivalent
      { source: "/en/register", destination: "/en/contact", permanent: true },
      { source: "/en/process", destination: "/en", permanent: true },
      { source: "/en/faq", destination: "/en", permanent: true },
      { source: "/en/success-stories", destination: "/en", permanent: true },
      { source: "/en/partners", destination: "/en", permanent: true },
      { source: "/en/team", destination: "/en/about", permanent: true },
      { source: "/en/destinations", destination: "/en", permanent: true },
      { source: "/en/destinations/:slug", destination: "/en", permanent: true },
      { source: "/en/blog", destination: "/en", permanent: true },
      { source: "/en/blog/:slug", destination: "/en", permanent: true },
      { source: "/en/services/:slug", destination: "/en/services", permanent: true },
      // Taxonomy restructure: program → lowongan
      { source: "/program/truck-driver", destination: "/lowongan/truck-driver-jepang", permanent: true },
      { source: "/id/program/truck-driver", destination: "/lowongan/truck-driver-jepang", permanent: true },
      { source: "/en/program/truck-driver", destination: "/lowongan/truck-driver-jepang", permanent: true },
      // Global Nurse removed — redirect to specific nurse lowongan
      { source: "/program/global-nurse", destination: "/lowongan/perawat-saudi-arabia", permanent: true },
      { source: "/id/program/global-nurse", destination: "/lowongan/perawat-saudi-arabia", permanent: true },
      { source: "/en/program/global-nurse", destination: "/lowongan/perawat-saudi-arabia", permanent: true },
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
