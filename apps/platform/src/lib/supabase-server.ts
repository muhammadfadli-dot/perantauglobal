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
 * Returns current session + role claim. Role comes from the JWT's custom
 * `role` claim (see Supabase Auth hooks in Phase 2 for admin elevation).
 * For now, everyone is a candidate by default.
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
  const role =
    ((data.user.app_metadata as Record<string, unknown> | null)?.role as
      | "admin"
      | "candidate"
      | undefined) ?? "candidate";
  return {
    session: { userId: data.user.id, email: data.user.email ?? null },
    role,
  };
}
