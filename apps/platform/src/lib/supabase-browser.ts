"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@perantauglobal/db";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Singleton browser-side Supabase client (cookie-based session). */
export function supabaseBrowser() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("supabase-browser: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing");
  }
  client = createBrowserClient<Database>(url, key);
  return client;
}
