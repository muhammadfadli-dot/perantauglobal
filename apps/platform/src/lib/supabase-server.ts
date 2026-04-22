import { cookies } from "next/headers";
import {
  createServerClient as createSSRClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { Database } from "@perantauglobal/db";

type CookieSetter = Array<{ name: string; value: string; options?: CookieOptions }>;

/**
 * Per-request Supabase client with cookie-based auth.
 *
 * Uses @supabase/ssr which manages PKCE + session refresh via cookies,
 * so server components and route handlers see the signed-in user.
 *
 * Platform env vars are named without the `_V2` suffix — this app is
 * native to the new project (no legacy gt-tools codepath).
 */
export async function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "supabase-server: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing",
    );
  }
  const cookieStore = await cookies();
  return createSSRClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list: CookieSetter) => {
        for (const { name, value, options } of list) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Server Components can't write cookies — middleware handles refresh.
          }
        }
      },
    },
  });
}

/**
 * Returns current session + elevated role.
 *
 * Role elevation sources (checked in order):
 *   1. `app_metadata.role = 'admin'` on the JWT (set via Supabase Auth hook —
 *      not yet wired; forward-compatible)
 *   2. Email listed in `admin_users` table (source of truth at MVP —
 *      checked via `is_admin()` RPC which combines both signals)
 *
 * Defaults to `candidate` for any signed-in user without admin elevation.
 */
export async function getSessionAndRole(): Promise<{
  session: { userId: string; email: string | null } | null;
  role: "candidate" | "admin" | null;
}> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { session: null, role: null };
  }

  // Call the is_admin() DB function. Runs under the user's JWT context so it
  // compares against their own email in admin_users (or JWT role claim).
  const { data: isAdmin } = await supabase.rpc("is_admin");

  return {
    session: { userId: data.user.id, email: data.user.email ?? null },
    role: isAdmin === true ? "admin" : "candidate",
  };
}
