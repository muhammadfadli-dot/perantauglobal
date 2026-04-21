"use client";

import { createBrowserClient } from "@perantauglobal/db";
import type { SupabaseClient } from "@perantauglobal/db";

let _client: SupabaseClient | null = null;

/**
 * Browser Supabase client for the NEW perantauglobal project.
 *
 * Singleton — only one client per browser tab so auth state (PKCE verifier
 * in localStorage) stays coherent between `signInWithOtp` and the callback
 * page.
 *
 * Called from:
 * - LowonganForm.tsx after successful pending_submission (sends magic link)
 * - /auth/callback page (exchanges code / detects session from URL)
 */
export function supabaseBrowserV2(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_V2;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_V2;

  if (!url || !anonKey) {
    throw new Error(
      "supabase-browser-v2: NEXT_PUBLIC_SUPABASE_URL_V2 or NEXT_PUBLIC_SUPABASE_ANON_KEY_V2 missing",
    );
  }

  _client = createBrowserClient(url, anonKey);
  return _client;
}
