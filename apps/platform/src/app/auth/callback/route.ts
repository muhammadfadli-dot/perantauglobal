import { NextResponse, type NextRequest } from "next/server";
import { waitUntil } from "@vercel/functions";
import {
  createServerClient as createSSRClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { Database } from "@perantauglobal/db";
import { sendMetaEvent } from "@/lib/meta-capi";
import {
  generateEventId,
  readMetaParamsFromRequest,
  writeMetaCookies,
} from "@/lib/tracking";

type CookieSetter = Array<{ name: string; value: string; options?: CookieOptions }>;

/**
 * Magic-link / email verify callback. PKCE flow — Supabase Auth redirects
 * here with `?code=` after the user clicks the link. We exchange the code
 * for a session (cookies set via @supabase/ssr) and redirect to the
 * role-appropriate surface.
 *
 * Cross-domain attribution handoff:
 *   apps/web embeds `fbp` + `fbc` in the magic-link `emailRedirectTo` URL so
 *   we can persist the original ad-click attribution as portal first-party
 *   cookies, then fire CompleteRegistration CAPI at signup verify. Without
 *   this Meta under-credits portal conversions (subdomains don't auto-share
 *   `_fbc`).
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

  // Persist forwarded _fbp / _fbc from apps/web (if present) as first-party
  // cookies on app.perantauglobal.com. Browser Pixel + future CAPI events
  // on this domain will read these via the standard cookie names.
  const metaParams = readMetaParamsFromRequest(request);
  writeMetaCookies(response, metaParams);

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

  // Fire CompleteRegistration CAPI event — fire-and-forget. Failure must
  // never block the redirect. waitUntil keeps the fn alive on Vercel after
  // response returns.
  waitUntil(
    (async () => {
      try {
        const { data: userResult } = await supabase.auth.getUser();
        const user = userResult?.user;
        if (!user) return;

        const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
        const positionSlug = typeof meta.position_slug === "string" ? meta.position_slug : undefined;
        const fullName = typeof meta.full_name === "string" ? meta.full_name : undefined;

        // Prefer the freshly-forwarded values if any; otherwise fall back
        // to whatever was already on the portal cookie. Don't fire without
        // any attribution — the event still goes to Pixel but match quality
        // would be poor.
        const existingFbp = request.cookies.get("_fbp")?.value;
        const existingFbc = request.cookies.get("_fbc")?.value;
        const fbp = metaParams.fbp ?? existingFbp ?? undefined;
        const fbc = metaParams.fbc ?? existingFbc ?? undefined;

        await sendMetaEvent({
          eventName: "CompleteRegistration",
          eventId: generateEventId("signup_verify"),
          sourceUrl: `${origin}/auth/callback`,
          ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "",
          userAgent: request.headers.get("user-agent") || "",
          fbp,
          fbc,
          userData: {
            email: user.email ?? undefined,
            firstName: fullName,
          },
          customData: {
            ...(positionSlug && { content_name: `signup_${positionSlug}` }),
            content_category: "signup_verify",
          },
        });
      } catch (err) {
        console.error("[auth/callback] CAPI fire failed:", err);
      }
    })(),
  );

  // Success — root page.tsx will route them to /admin or /dashboard.
  return response;
}
