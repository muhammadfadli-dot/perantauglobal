import { createServerClient } from "@perantauglobal/db";

/**
 * Server-side anon Supabase client for the public marketing site.
 *
 * Anon key only. Every read must satisfy RLS. NEVER import the service-role
 * client here - this app ships to the public web. Used by the talent-pool
 * counter once the live counter (migration 0094) is wired; until then the
 * counter runs on a placeholder and this file is unused-but-ready.
 */
export function supabaseAnon() {
  const url = process.env.SUPABASE_URL_V2;
  const anonKey = process.env.SUPABASE_ANON_KEY_V2;
  if (!url || !anonKey) {
    throw new Error("supabase: missing SUPABASE_URL_V2 / SUPABASE_ANON_KEY_V2");
  }
  return createServerClient(url, anonKey);
}
