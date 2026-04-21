import { NextResponse, type NextRequest } from "next/server";
import {
  createServerClient as createSSRClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { Database } from "@perantauglobal/db";

type CookieSetter = Array<{ name: string; value: string; options?: CookieOptions }>;

/**
 * Refreshes Supabase session cookies on every request so server components
 * see the signed-in user reliably. Does NOT enforce auth — pages handle
 * redirects themselves via getSessionAndRole() so they can render the
 * marketing-site fallback for anonymous users.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
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

  // Refresh session — writes updated cookies onto the response
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    /*
     * Skip static assets, favicon, and the Next internal routes.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
