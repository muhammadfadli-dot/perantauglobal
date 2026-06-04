import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { sendMetaEvent } from "@/lib/meta-capi";
import { writePendingSubmission } from "@/lib/pending-write";
import { supabaseV2 } from "@/lib/supabase-v2";

/**
 * Resolve a slug to its role + country via the positions table. Replaces the
 * old hardcoded SLUG_MAP (which drifted out of sync every time we shipped a
 * new position — half of the 2026-05 ad rollout had broken submit URLs because
 * 4 new slugs were never added to the whitelist).
 *
 * Anon read of `positions` where active=true is allowed by RLS policy
 * `positions_anon_read_active`. Inactive or unknown slugs return null so the
 * caller can 404.
 */
async function lookupPositionMapping(
  slug: string,
): Promise<{ role: string; country: string } | null> {
  const { data, error } = await supabaseV2()
    .from("positions")
    .select("role, country")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) {
    console.error("[lowongan] position lookup failed:", error.message);
    return null;
  }
  return data ? { role: data.role, country: data.country } : null;
}

interface CandidatePayload {
  full_name: string;
  whatsapp: string;
  email: string;
  // City + birth_date + gender + education are optional post-Fase 3 trim;
  // they're now collected in /onboarding at the portal instead.
  city?: string;
  birth_date?: string | null;
  gender?: string | null;
  education?: string;
  password: string;
  role: string;
  country: string;
  source_url?: string;
  /**
   * Apply-stage qualifying answers. Keys must match
   * `position_application_fields.field_key` (section='syarat_utama') for the
   * slug; values are string (radio/select/text/number) or string[]
   * (multiselect). Materialized into `applications.answers` only — no longer
   * mirrored to `candidates.profile_data` (per-app fresh-start model post-Fase 5).
   */
  role_data?: Record<string, string | string[]>;
  /**
   * Optional affiliate referral code typed by the candidate ("kode agen").
   * Persisted to pending_submissions.form_data.ref; the materialization trigger
   * (handle_new_auth_user → _attribute_candidate_referral) resolves it to an
   * agent and logs the registration commission event. A bad/empty code is a
   * no-op and never blocks registration.
   */
  ref?: string;
  eventId?: string;
  fbp?: string;
  fbc?: string;
}

/**
 * Normalize a candidate-typed referral code to the canonical stored shape:
 * uppercase, whitespace-trimmed, charset [A-Z0-9-], 1–32 chars. Returns null
 * for anything that can't be a code (empty, too long, illegal chars) so we only
 * ever stage a clean token — the DB trigger does the authoritative resolution.
 */
function normalizeRef(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim().toUpperCase();
  // Mirror the DB CHECK / validate RPC (4–32 chars, [A-Z0-9-]) so only
  // canonically-shaped codes are staged; anything shorter can never resolve to
  // an agent anyway, so don't persist unresolvable noise to form_data.ref.
  if (!/^[A-Z0-9-]{4,32}$/.test(v)) return null;
  return v;
}

/**
 * Extract the `fbclid` query param from the submitted source URL. Used to
 * reconstruct an `_fbc` value when the Pixel cookie hasn't been written yet
 * (race between page load and a fast form submit) so CAPI match quality — and
 * the downstream CompleteRegistration attribution — don't silently depend on
 * the cookie being present.
 */
function parseFbclid(sourceUrl?: string): string | undefined {
  if (!sourceUrl) return undefined;
  try {
    return new URL(sourceUrl).searchParams.get("fbclid") ?? undefined;
  } catch {
    return undefined;
  }
}

function validatePasswordServer(pw: string): boolean {
  return (
    pw.length >= 10 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /[0-9]/.test(pw)
  );
}

/**
 * Defensive: only accept role_data that matches our expected shape
 * (string keys, string|string[] values). Drop anything weird so we never
 * stuff arbitrary objects into pending_submissions.form_data.role_data.
 */
function sanitizeRoleData(
  raw: unknown,
): Record<string, string | string[]> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof key !== "string" || key.length === 0 || key.length > 64) continue;
    if (typeof value === "string") {
      if (value.length > 0 && value.length <= 500) out[key] = value;
    } else if (Array.isArray(value)) {
      const arr = value
        .filter((v): v is string => typeof v === "string" && v.length > 0 && v.length <= 200)
        .slice(0, 32);
      if (arr.length > 0) out[key] = arr;
    }
  }
  return out;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const mapping = await lookupPositionMapping(slug);

    if (!mapping) {
      return NextResponse.json(
        { error: "Lowongan tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = (await request.json()) as CandidatePayload;

    // Sub-5-field LP capture (Fase 3 trim): only name + WA + email + password
    // are required. City + birth_date + gender + education ditanya post-apply
    // di portal /onboarding biar drop-off di LP minim.
    const required = ["full_name", "whatsapp", "email", "password"] as const;
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field ${field} wajib diisi.` },
          { status: 400 }
        );
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (!validatePasswordServer(body.password)) {
      return NextResponse.json(
        {
          error:
            "Password minimal 10 karakter dengan huruf besar, huruf kecil, dan angka.",
        },
        { status: 400 }
      );
    }

    const email = body.email.toLowerCase().trim();

    // Reconstruct _fbc from fbclid when the Pixel cookie wasn't set in time
    // (Meta accepts `fb.1.<ts>.<fbclid>`). Rescues attribution for the ~25% of
    // ad clicks whose _fbc cookie hadn't been written at submit. Used for both
    // the Lead CAPI fire below and the CompleteRegistration handoff to portal.
    const fbclid = parseFbclid(body.source_url);
    const effectiveFbc =
      body.fbc || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined);

    // Step 1: stage the form payload. The DB trigger
    // (handle_new_auth_user in migration 0015) reads this on email_confirmed_at
    // flip to materialize candidate + application.
    const writeResult = await writePendingSubmission(
      {
        position_slug: slug,
        email,
        phone: body.whatsapp,
        form_data: {
          full_name: body.full_name,
          whatsapp: body.whatsapp,
          email,
          city: body.city ?? null,
          birth_date: body.birth_date ?? null,
          gender: body.gender ?? null,
          education: body.education ?? null,
          role: mapping.role,
          country: mapping.country,
          source_url: body.source_url ?? null,
          role_data: sanitizeRoleData(body.role_data),
          ref: normalizeRef(body.ref),
        },
        consents: [
          {
            purpose: "application_processing",
            purpose_text:
              "Memproses lamaran kerja (verifikasi data, komunikasi via email, pencocokan lowongan).",
            version: "2026-04-23",
            granted: true,
          },
        ],
      },
      request,
    );

    if (!writeResult.ok) {
      console.error("[lowongan] pending write failed:", writeResult.error);
      return NextResponse.json(
        { error: "Gagal menyimpan data. Coba lagi sebentar." },
        { status: 500 }
      );
    }

    // Step 2: create auth user with password. Supabase sends the verification
    // email. Redirect lands on the platform domain (cross-subdomain) where
    // PKCE code exchange sets the session cookie; the trigger fires on the
    // email_confirmed_at flip and materializes the candidate from the pending
    // staged above.
    //
    // Cross-domain attribution: forward `_fbp` / `_fbc` cookies (set on
    // perantauglobal.com by Meta Pixel at ad click) via the redirect URL.
    // The portal's auth/callback persists them as first-party cookies and
    // fires CompleteRegistration CAPI on verify so Meta credits the
    // conversion correctly. Without this, _fbc is silently lost crossing
    // the subdomain boundary.
    const platformBase =
      process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";
    const redirectParams = new URLSearchParams();
    if (body.fbp) redirectParams.set("fbp", body.fbp);
    if (effectiveFbc) redirectParams.set("fbc", effectiveFbc);
    const redirectQuery = redirectParams.toString();
    const emailRedirectTo = redirectQuery
      ? `${platformBase}/auth/callback?${redirectQuery}`
      : `${platformBase}/auth/callback`;

    const db = supabaseV2();
    const { error: signUpError } = await db.auth.signUp({
      email,
      password: body.password,
      options: {
        emailRedirectTo,
        data: {
          full_name: body.full_name,
          source: "form_apply",
          position_slug: slug,
          // Carry Meta attribution in auth user_metadata so the portal
          // /auth/callback can fire CompleteRegistration with good match
          // quality even when the magic link is opened in a different
          // browser/email-client where _fbp/_fbc cookies + URL params are lost.
          ...(body.fbp && { fbp: body.fbp }),
          ...(effectiveFbc && { fbc: effectiveFbc }),
        },
      },
    });

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      // Duplicate email: user already has an account. Keep the pending row
      // (trigger will materialize the new application on their next verify
      // event or on direct login via requireCandidate equivalent at the
      // platform). Tell the form to route them to sign-in.
      if (msg.includes("already") || msg.includes("registered")) {
        return NextResponse.json(
          {
            error:
              "Email sudah terdaftar. Masuk ke Perantau Global pakai password kamu untuk lanjutkan lamaran.",
            code: "email_exists",
          },
          { status: 409 }
        );
      }
      if (msg.includes("weak password") || msg.includes("pwned")) {
        return NextResponse.json(
          {
            error:
              "Password terlalu umum atau pernah bocor di database publik. Pilih yang lain.",
          },
          { status: 400 }
        );
      }
      if (msg.includes("rate limit") || msg.includes("too many requests")) {
        return NextResponse.json(
          { error: "Terlalu banyak percobaan. Coba lagi dalam beberapa menit." },
          { status: 429 }
        );
      }
      console.error("[lowongan] signUp failed:", signUpError.message);
      return NextResponse.json(
        { error: "Gagal membuat akun. Coba lagi sebentar." },
        { status: 500 }
      );
    }

    if (body.eventId) {
      waitUntil(
        sendMetaEvent({
          eventName: "Lead",
          eventId: body.eventId,
          sourceUrl:
            body.source_url ||
            request.headers.get("referer") ||
            `https://perantauglobal.com/lowongan/${slug}`,
          ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "",
          userAgent: request.headers.get("user-agent") || "",
          fbp: body.fbp,
          fbc: effectiveFbc,
          userData: {
            email,
            phone: body.whatsapp,
            firstName: body.full_name,
            city: body.city,
          },
          customData: {
            content_name: `lowongan_${mapping.role}`,
            content_category: "lowongan",
          },
        })
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[lowongan] unexpected error:", err);
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }
}
