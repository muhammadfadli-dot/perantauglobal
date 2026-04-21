import { createServerClient } from "@perantauglobal/db";

/**
 * Server-side Supabase client for the NEW perantauglobal project.
 *
 * Use this for dual-write shadow inserts into `pending_submissions` + `consents`
 * while the legacy gt-tools project remains source of truth.
 *
 * Anon key only — all writes must satisfy RLS policies in migration 0001.
 */
export function supabaseV2() {
  const url = process.env.SUPABASE_URL_V2;
  const anonKey = process.env.SUPABASE_ANON_KEY_V2;
  if (!url || !anonKey) {
    throw new Error(
      "supabase-v2: missing SUPABASE_URL_V2 or SUPABASE_ANON_KEY_V2 env",
    );
  }
  return createServerClient(url, anonKey);
}

/**
 * True when both env vars are present. Use to skip shadow-write gracefully
 * in dev environments that haven't been configured yet.
 */
export function isV2Configured(): boolean {
  return Boolean(process.env.SUPABASE_URL_V2 && process.env.SUPABASE_ANON_KEY_V2);
}
