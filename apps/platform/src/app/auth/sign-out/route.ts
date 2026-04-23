import { NextResponse, type NextRequest } from "next/server";
import {
  createServerClient as createSSRClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { Database } from "@perantauglobal/db";

type CookieSetter = Array<{ name: string; value: string; options?: CookieOptions }>;

/**
 * Sign out — clears the Supabase session cookies and redirects to sign-in.
 * Supports POST (from form) and GET (from a link).
 */
async function handle(request: NextRequest) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/auth/sign-in`);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

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

  await supabase.auth.signOut();
  return response;
}

export const GET = handle;
export const POST = handle;
