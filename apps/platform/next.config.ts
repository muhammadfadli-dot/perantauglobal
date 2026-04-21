import type { NextConfig } from "next";

/**
 * apps/platform serves two audiences via route groups:
 * - (candidate) at / — mobile-first candidate portal (app.perantauglobal.com)
 * - (admin)     at /admin — data-dense CRM
 *
 * Production rewrite rule (future): admin.perantauglobal.com → /admin/*
 * handled at the Vercel project level.
 */
const nextConfig: NextConfig = {
  // Host allowlist for server components / server actions
  // (empty until platform actions start talking to external services)
};

export default nextConfig;
