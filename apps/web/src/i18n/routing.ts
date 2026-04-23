import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["id", "en"],
  defaultLocale: "id",
  localePrefix: "as-needed",
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/layanan": {
      id: "/layanan",
      en: "/services",
    },
    "/layanan/[slug]": {
      id: "/layanan/[slug]",
      en: "/services/[slug]",
    },
    "/tentang": {
      id: "/tentang",
      en: "/about",
    },
    "/kontak": {
      id: "/kontak",
      en: "/contact",
    },
    // Job-seeker only routes (id only, guarded with notFound for en)
    "/proses": "/proses",
    "/destinasi": "/destinasi",
    "/destinasi/[slug]": "/destinasi/[slug]",
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/mitra": "/mitra",
    "/faq": "/faq",
    "/cerita-sukses": "/cerita-sukses",
    "/tim": "/tim",
    "/program/spg": "/program/spg",
    "/program/global-talent-hub": "/program/global-talent-hub",
    "/lowongan/perawat-saudi-arabia": "/lowongan/perawat-saudi-arabia",
    "/lowongan/barista-saudi-arabia": "/lowongan/barista-saudi-arabia",
    "/lowongan/waiter-saudi-arabia": "/lowongan/waiter-saudi-arabia",
    "/lowongan/kaigo-jepang": "/lowongan/kaigo-jepang",
    "/lowongan/food-service-jepang": "/lowongan/food-service-jepang",
    "/lowongan/truck-driver-jepang": "/lowongan/truck-driver-jepang",
  },
});
