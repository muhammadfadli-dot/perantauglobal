import type { MetadataRoute } from "next";
import { POSITIONS } from "@/lib/positions";

const SITE_URL = "https://perantauglobal.com";

const STATIC_PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "lowongan", priority: 0.95, changeFrequency: "weekly" },
  { path: "talent-hub", priority: 0.9, changeFrequency: "monthly" },
  { path: "tentang", priority: 0.7, changeFrequency: "monthly" },
  { path: "tim", priority: 0.5, changeFrequency: "monthly" },
  { path: "layanan", priority: 0.7, changeFrequency: "monthly" },
  { path: "proses", priority: 0.7, changeFrequency: "monthly" },
  { path: "faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "kontak", priority: 0.7, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const entries: MetadataRoute.Sitemap = [];

  for (const page of STATIC_PAGES) {
    entries.push({
      url: page.path ? `${SITE_URL}/${page.path}` : SITE_URL,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  for (const p of POSITIONS) {
    entries.push({
      url: `${SITE_URL}/lowongan/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: p.status === "open" ? 0.9 : 0.7,
    });
  }

  return entries;
}
