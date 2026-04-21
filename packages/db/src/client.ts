import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Browser / edge-safe Supabase client with anon key.
 *
 * Use this for:
 * - Public form submissions (inserts into `pending_submissions`, `consents`)
 * - Client-side reads gated by RLS policies
 *
 * Do NOT use this for service-role operations (use `server.ts` instead).
 */
export function createBrowserClient(
  url: string,
  anonKey: string,
): SupabaseClient<Database> {
  if (!url || !anonKey) {
    throw new Error(
      "createBrowserClient: missing SUPABASE_URL or SUPABASE_ANON_KEY",
    );
  }
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export type { SupabaseClient };
