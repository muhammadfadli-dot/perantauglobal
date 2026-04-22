"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@perantauglobal/db";

let _client: SupabaseClient<Database> | null = null;

/**
 * Browser Supabase client for the NEW perantauglobal project (web side).
 *
 * Configured with `flowType: 'implicit'` because magic-link emailRedirectTo
 * points at `app.perantauglobal.com/auth/confirm` — cross-subdomain. PKCE
 * would break because the code_verifier stored in www localStorage is not
 * readable from app.*. Implicit flow puts tokens directly in the URL hash
 * fragment, which the platform confirm page captures and sets as session.
 *
 * Singleton — only one client per browser tab.
 *
 * Called from:
 * - LowonganForm.tsx / GTHForm.tsx after pending_submission POST (sends magic-link)
 */
export function supabaseBrowserV2(): SupabaseClient<Database> {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_V2;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_V2;

  if (!url || !anonKey) {
    throw new Error(
      "supabase-browser-v2: NEXT_PUBLIC_SUPABASE_URL_V2 or NEXT_PUBLIC_SUPABASE_ANON_KEY_V2 missing",
    );
  }

  _client = createClient<Database>(url, anonKey, {
    auth: {
      flowType: "implicit",
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return _client;
}
