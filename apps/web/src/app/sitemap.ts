import type { MetadataRoute } from "next";
import { POSITIONS } from "@/lib/positions";
import { CERTIFICATIONS } from "@/lib/certifications";
import { SITE_URL } from "@/lib/site";

const STATIC_PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "lowongan", priority: 0.95, changeFrequency: "weekly" },
  { path: "akademi", priority: 0.9, changeFrequency: "weekly" },
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

  for (const c of CERTIFICATIONS) {
    entries.push({
      url: `${SITE_URL}/akademi/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: c.status === "live" ? 0.85 : 0.5,
    });
  }

  return entries;
}
