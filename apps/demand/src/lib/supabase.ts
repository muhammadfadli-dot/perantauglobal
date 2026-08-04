import { createServerClient } from "@perantauglobal/db";

/**
 * Server-side anon Supabase client for the public marketing site.
 *
 * Anon key only. Every write must satisfy RLS. NEVER import the service-role
 * client here - this app ships to the public web. Used by /api/inquiry
 * (employer lead capture, anon INSERT under migration 0008 RLS). The
 * talent-pool counter will also read through here once the live counter
 * (migration 0094) is wired.
 */
export function supabaseAnon() {
  const url = process.env.SUPABASE_URL_V2;
  const anonKey = process.env.SUPABASE_ANON_KEY_V2;
  if (!url || !anonKey) {
    throw new Error("supabase: missing SUPABASE_URL_V2 / SUPABASE_ANON_KEY_V2");
  }
  return createServerClient(url, anonKey);
}
