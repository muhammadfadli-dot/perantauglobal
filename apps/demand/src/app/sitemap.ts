import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const corporateRoutes = ["/about", "/services", "/resources", "/regions", "/articles", "/contact", "/for-candidates"];
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
    ...corporateRoutes.map((route) => ({
      url: `https://${SITE.domain}${route}`,
      changeFrequency: "monthly" as const,
      priority: route === "/contact" ? 0.8 : 0.7,
    })),
  ];
}
