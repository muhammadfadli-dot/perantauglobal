import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `https://${SITE.domain}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
