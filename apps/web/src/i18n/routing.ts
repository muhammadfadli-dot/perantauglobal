import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["id", "en"],
  defaultLocale: "id",
  localePrefix: "as-needed",
  localeDetection: false,
  // Site is ID-only (job-seeker audience). Non-id locales are guarded with
  // notFound; /en/* is redirected to / in next.config. Only routes that
  // actually exist are mapped here.
  pathnames: {
    "/": "/",
    "/lowongan": "/lowongan",
    "/lowongan/[slug]": "/lowongan/[slug]",
    "/akademi": "/akademi",
    "/akademi/[slug]": "/akademi/[slug]",
    "/akademi/kelas/[slug]": "/akademi/kelas/[slug]",
    "/tentang": {
      id: "/tentang",
      en: "/about",
    },
    "/layanan": {
      id: "/layanan",
      en: "/services",
    },
    "/kontak": {
      id: "/kontak",
      en: "/contact",
    },
    "/proses": "/proses",
    "/faq": "/faq",
    "/tim": "/tim",
  },
});
