import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

// Search indexing is controlled per deployment environment. Production sets
// NEXT_PUBLIC_ALLOW_INDEX=true; previews remain blocked unless explicitly
// enabled, so pre-release content is not indexed by search engines.
const ALLOW = process.env.NEXT_PUBLIC_ALLOW_INDEX === "true";

export default function robots(): MetadataRoute.Robots {
  if (!ALLOW) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `https://${SITE.domain}/sitemap.xml`,
    host: `https://${SITE.domain}`,
  };
}
