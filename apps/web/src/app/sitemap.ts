import type { MetadataRoute } from "next";
import { getAllContent } from "@/lib/mdx";

const SITE_URL = "https://dayatalentaglobal.id";

// Pages that exist in both locales (with hreflang alternates)
const SHARED_PAGES = [
  { idPath: "", enPath: "", priority: 1.0 },
  { idPath: "layanan", enPath: "services", priority: 0.9 },
  { idPath: "tentang", enPath: "about", priority: 0.8 },
  { idPath: "kontak", enPath: "contact", priority: 0.7 },
];

// Pages that only exist in ID locale (job-seeker only)
const ID_ONLY_PAGES = [
  { path: "proses", priority: 0.8 },
  { path: "destinasi", priority: 0.9 },
  { path: "blog", priority: 0.9 },
  { path: "daftar", priority: 0.8 },
  { path: "mitra", priority: 0.7 },
  { path: "faq", priority: 0.7 },
  { path: "cerita-sukses", priority: 0.7 },
  { path: "tim", priority: 0.6 },
  { path: "lowongan/perawat-saudi-arabia", priority: 0.9 },
  { path: "lowongan/barista-saudi-arabia", priority: 0.9 },
  { path: "lowongan/waiter-saudi-arabia", priority: 0.9 },
  { path: "lowongan/kaigo-jepang", priority: 0.9 },
  { path: "lowongan/food-service-jepang", priority: 0.9 },
  { path: "lowongan/truck-driver-jepang", priority: 0.9 },
  { path: "program/spg", priority: 0.8 },
  { path: "program/global-talent-hub", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const entries: MetadataRoute.Sitemap = [];

  // Shared pages — both locales with hreflang alternates
  for (const page of SHARED_PAGES) {
    const idUrl = page.idPath ? `/${page.idPath}` : "";
    const enUrl = page.enPath ? `/${page.enPath}` : "";

    entries.push({
      url: `${SITE_URL}/id${idUrl}`,
      lastModified: now,
      changeFrequency: page.idPath === "" ? "weekly" : "monthly",
      priority: page.priority,
      alternates: {
        languages: {
          id: `${SITE_URL}/id${idUrl}`,
          en: `${SITE_URL}/en${enUrl}`,
        },
      },
    });

    entries.push({
      url: `${SITE_URL}/en${enUrl}`,
      lastModified: now,
      changeFrequency: page.idPath === "" ? "weekly" : "monthly",
      priority: page.priority,
      alternates: {
        languages: {
          id: `${SITE_URL}/id${idUrl}`,
          en: `${SITE_URL}/en${enUrl}`,
        },
      },
    });
  }

  // ID-only static pages — no alternates
  for (const page of ID_ONLY_PAGES) {
    entries.push({
      url: `${SITE_URL}/id/${page.path}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: page.priority,
    });
  }

  // Dynamic content pages — ID only (EN content deleted)
  const contentTypes = [
    { type: "services" as const, prefix: "layanan" },
    { type: "destinations" as const, prefix: "destinasi" },
    { type: "blog" as const, prefix: "blog" },
  ];

  for (const { type, prefix } of contentTypes) {
    const idContent = getAllContent(type, "id");

    for (const item of idContent) {
      const slug = item.slug as string;
      const date = (item as Record<string, unknown>).date as string | undefined;

      entries.push({
        url: `${SITE_URL}/id/${prefix}/${slug}`,
        lastModified: date || now,
        changeFrequency: type === "blog" ? "weekly" : "monthly",
        priority: type === "blog" ? 0.8 : 0.7,
      });
    }
  }

  return entries;
}
