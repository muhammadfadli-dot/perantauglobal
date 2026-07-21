import type { MetadataRoute } from "next";
import { fetchPositionsForCatalog } from "@/lib/positions-db";
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
  // Legal pages are low priority but must be crawlable: the consent copy on
  // every form points at them, so they need to be reachable and indexable
  // rather than only linkable.
  { path: "privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "terms", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // DB-driven so admin-created positions are crawlable, not just the static seed.
  const positions = await fetchPositionsForCatalog();
  for (const p of positions) {
    entries.push({
      url: `${SITE_URL}/lowongan/${p.slug}`,
      // A real content date, not `now`. publishedAt is the true "this page
      // changed" signal (publishPosition stamps it); updatedAt is the fallback
      // for rows edited but never republished. Stamping every entry with the
      // crawl time told Google "everything changed" on every fetch, which is
      // the same as telling it nothing.
      lastModified: p.publishedAt ?? p.updatedAt ?? now,
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
