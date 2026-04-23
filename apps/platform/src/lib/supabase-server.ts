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
 * Why this exists: the DB trigger `handle_new_auth_user()` only materializes a
 * candidate row when there's a matching `pending_submissions` entry (the
 * legacy "fill form → magic link" flow). Users who sign up directly via
 * email+password (PR #11) verify their email but never get a candidate row,
 * causing /explore, /applications, /profile to silently redirect home —
 * classic "dead-end redirect" anti-pattern.
 *
 * This helper is belt-and-braces with the trigger: idempotent, safe to call
 * on every request. It first tries to link-by-email (in case a candidate was
 * imported/backfilled with null auth_user_id), then inserts a skeleton row.
 *
 * Returns:
 *   { session, role, candidateId } on success (redirects internally otherwise)
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

  // Self-heal via service role (RLS would block anon INSERT with a server-chosen
  // auth_user_id, and link-by-email requires bypassing UNIQUE email contention).
  const admin = createServiceRoleClient();
  const email = session.email ?? "";

  if (email) {
    const { data: linked } = await admin
      .from("candidates")
      .update({ auth_user_id: session.userId, updated_at: new Date().toISOString() })
      .eq("email", email.toLowerCase())
      .is("auth_user_id", null)
      .select("id")
      .maybeSingle();
    if (linked) return { session, candidateId: (linked as { id: string }).id };
  }

  const placeholderName = email ? email.split("@")[0]!.slice(0, 200) : "Kandidat baru";
  const { data: created, error } = await admin
    .from("candidates")
    .insert({
      auth_user_id: session.userId,
      email: email ? email.toLowerCase() : null,
      full_name: placeholderName.length >= 2 ? placeholderName : "Kandidat baru",
      profile_data: { schema_version: 1, credentials: {}, onboarding: {} },
      source: "direct_signup",
    })
    .select("id")
    .single();
  if (error || !created) {
    throw new Error(
      `requireCandidate: failed to self-heal candidate for auth_user ${session.userId}: ${error?.message ?? "unknown"}`,
    );
  }
  return { session, candidateId: (created as { id: string }).id };
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
