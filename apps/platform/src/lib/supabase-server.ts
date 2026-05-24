import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createServerClient as createSSRClient,
  type CookieOptions,
} from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
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

/**
 * Returns `candidates.id` for the current session, self-healing if missing.
 *
 * Normal case: the DB trigger `handle_new_auth_user()` (migration 0015) always
 * creates a candidate row on email verification — whether the user came from
 * the form-apply flow (pending_submissions present) or direct sign-up
 * (raw_user_meta_data.full_name). So the lookup below usually succeeds on the
 * first query.
 *
 * Safety net: if the trigger didn't run (legacy rows from before 0015, or a
 * backfilled candidate with NULL auth_user_id that needs to be linked), fall
 * back to self-insert via RLS `candidates_self_insert` (migration 0014) then
 * service-role link-by-email. Idempotent, safe to call on every request.
 */
export async function requireCandidate(): Promise<{
  session: { userId: string; email: string | null };
  candidateId: string;
}> {
  const { session, role } = await getSessionAndRole();
  if (!session) redirect("/auth/sign-in");
  if (role === "admin") redirect("/admin");

  const supabase = await createServerClient();
  const { data: existing } = await supabase
    .from("candidates")
    .select("id")
    .eq("auth_user_id", session.userId)
    .maybeSingle();
  if (existing) return { session, candidateId: (existing as { id: string }).id };

  const email = session.email ?? "";
  const prefix = email ? email.split("@")[0]!.slice(0, 200) : "";
  const placeholderName = prefix.length >= 2 ? prefix : "Kandidat baru";

  const { data: created, error: insertError } = await supabase
    .from("candidates")
    .insert({
      auth_user_id: session.userId,
      email: email ? email.toLowerCase() : null,
      full_name: placeholderName,
      profile_data: { schema_version: 1, onboarding: {} },
      source: "direct_signup",
    } as never)
    .select("id")
    .single();
  if (created) return { session, candidateId: (created as { id: string }).id };

  // UNIQUE email collision with a backfilled candidate (auth_user_id IS NULL).
  // Service-role link-by-email if available.
  if (email && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createServiceRoleClient();
    const { data: linked } = await admin
      .from("candidates")
      .update({ auth_user_id: session.userId, updated_at: new Date().toISOString() })
      .eq("email", email.toLowerCase())
      .is("auth_user_id", null)
      .select("id")
      .maybeSingle();
    if (linked) return { session, candidateId: (linked as { id: string }).id };
  }

  throw new Error(
    `requireCandidate: could not materialize candidate for auth_user ${session.userId}: ${insertError?.message ?? "unknown"}`,
  );
}

/**
 * Service-role client — bypasses RLS. Use only for admin server actions
 * that need to do things RLS forbids (e.g. generate signed URLs for storage,
 * elevate file access). Caller MUST authenticate the admin first.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "supabase-server: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing",
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
