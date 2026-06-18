import { NextResponse, type NextRequest } from "next/server";
import {
  createServerClient as createSSRClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { Database } from "@perantauglobal/db";
import { sendMetaEvent } from "@/lib/meta-capi";
import { generateEventId, writeMetaCookies } from "@/lib/tracking";

type CookieSetter = Array<{ name: string; value: string; options?: CookieOptions }>;

/**
 * Post-confirm side effects, called by /auth/callback (client) AFTER the
 * session is established in cookies.
 *
 * Previously these ran inside the auth/callback route handler, but that handler
 * could only see the PKCE `?code=` flow. signUp-confirm actually returns the
 * session in the URL hash (implicit), which only the client can read — so the
 * handler never ran and CompleteRegistration never fired. The client now sets
 * the session and calls this route, which reads the session from cookies.
 *
 * Does two things, both best-effort (never block / error the caller):
 *   1. Fire CompleteRegistration CAPI (with cross-domain fbp/fbc attribution)
 *   2. Invoke cv-materialize edge fn (move staged anon CV → candidate + grade)
 * Also persists forwarded fbp/fbc as first-party cookies for the browser Pixel.
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });

  let bodyFbp: string | null = null;
  let bodyFbc: string | null = null;
  try {
    const body = (await request.json()) as { fbp?: string | null; fbc?: string | null };
    bodyFbp = body?.fbp ?? null;
    bodyFbc = body?.fbc ?? null;
  } catch {
    // empty / non-JSON body is fine
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return response; // not authenticated → nothing to do

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

  // Resolve attribution most-reliable first: user_metadata (stamped at signup,
  // survives the email round trip) → forwarded body params → existing cookie.
  const metaFbp = typeof meta.fbp === "string" ? meta.fbp : undefined;
  const metaFbc = typeof meta.fbc === "string" ? meta.fbc : undefined;
  const fbp = metaFbp ?? bodyFbp ?? request.cookies.get("_fbp")?.value ?? undefined;
  const fbc = metaFbc ?? bodyFbc ?? request.cookies.get("_fbc")?.value ?? undefined;
  writeMetaCookies(response, { fbp, fbc });

  const origin = new URL(request.url).origin;

  // 1. CompleteRegistration CAPI (sendMetaEvent never throws).
  const positionSlug = typeof meta.position_slug === "string" ? meta.position_slug : undefined;
  const fullName = typeof meta.full_name === "string" ? meta.full_name : undefined;
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

  // 2. Materialize a staged anon CV (no-op when there's none).
  try {
    const { error: mErr } = await supabase.functions.invoke("cv-materialize", { body: {} });
    if (mErr) console.error("[post-confirm] cv-materialize failed:", mErr.message);
  } catch (err) {
    console.error("[post-confirm] cv-materialize threw:", err);
  }

  return response;
}
