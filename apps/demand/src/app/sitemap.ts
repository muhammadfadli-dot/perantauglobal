import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `https://${SITE.domain}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `https://${SITE.domain}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `https://${SITE.domain}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
