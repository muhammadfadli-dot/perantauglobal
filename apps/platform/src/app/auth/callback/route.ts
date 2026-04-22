import { NextResponse, type NextRequest } from "next/server";
import {
  createServerClient as createSSRClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { Database } from "@perantauglobal/db";

type CookieSetter = Array<{ name: string; value: string; options?: CookieOptions }>;

/**
 * Magic-link callback. PKCE flow — Supabase Auth redirects here with ?code=
 * after the user clicks the link. We exchange the code for a session (cookies
 * set via @supabase/ssr) and redirect to the role-appropriate surface.
 *
 * Uses a route handler (not a page) so cookie writes happen server-side
 * before the redirect — no client bounce needed.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errParam = searchParams.get("error_description") ?? searchParams.get("error");

  if (errParam) {
    return NextResponse.redirect(
      `${origin}/auth/sign-in?error=${encodeURIComponent(errParam)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/sign-in?error=missing_code`);
  }

  const response = NextResponse.redirect(`${origin}/`);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.redirect(`${origin}/auth/sign-in?error=env_missing`);
  }

  const supabase = createSSRClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: CookieSetter) => {
        for (const { name, value, options } of list) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/sign-in?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Success — root page.tsx will route them to /admin or /dashboard.
  return response;
}
