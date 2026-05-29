/**
 * Canonical site base URL — single source of truth.
 *
 * Imported by seo.ts, jsonld.ts, sitemap.ts, robots.ts, and layout.tsx so the
 * production host can't drift across files (previously split between
 * perantauglobal.com and dayatalentaglobal.id, which split SEO canonicals).
 */
export const SITE_URL = "https://perantauglobal.com";
