import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

// Keep the site out of search indexes until the public launch is explicitly
// enabled (set NEXT_PUBLIC_ALLOW_INDEX=true on the production project). This
// prevents pre-launch / preview deploys and unverified content from being
// indexed before the domain cutover is signed off.
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
