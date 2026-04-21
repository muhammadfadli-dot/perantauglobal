import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Server-side anon client (per-request).
 *
 * Use this in:
 * - Next.js route handlers / server components for anonymous reads + writes gated by RLS
 * - API routes that accept public form submissions
 *
 * Pass the incoming user's JWT (via Authorization header or cookies) for
 * authenticated operations. Without a JWT this behaves as the anon role.
 */
export function createServerClient(
  url: string,
  anonKey: string,
  opts: { accessToken?: string } = {},
): SupabaseClient<Database> {
  if (!url || !anonKey) {
    throw new Error(
      "createServerClient: missing SUPABASE_URL or SUPABASE_ANON_KEY",
    );
  }
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: opts.accessToken
      ? { headers: { Authorization: `Bearer ${opts.accessToken}` } }
      : undefined,
  });
}

/**
 * Service-role client — bypasses RLS. USE WITH EXTREME CAUTION.
 *
 * Allowed contexts:
 * - Supabase Edge Functions (handle-magic-link-verify, etc.)
 * - CLI scripts (migrations, backfill)
 * - Internal DB triggers wrapping this logic
 *
 * NEVER import this from `apps/web/` or any browser-shipped code.
 * The service role key must only exist in server-only env (.env.local
 * for CLI, Edge Function secrets for deployed functions).
 */
export function createServiceRoleClient(
  url: string,
  serviceRoleKey: string,
): SupabaseClient<Database> {
  if (!url || !serviceRoleKey) {
    throw new Error(
      "createServiceRoleClient: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export type { SupabaseClient };
