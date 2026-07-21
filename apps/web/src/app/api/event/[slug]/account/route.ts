import { NextRequest, NextResponse } from "next/server";
import { writePendingSubmission } from "@/lib/pending-write";
import { supabaseV2 } from "@/lib/supabase-v2";
import {
  EVENT_ACCOUNT_CONSENT_PURPOSE,
  EVENT_ACCOUNT_CONSENT_TEXT,
  EVENT_ACCOUNT_CONSENT_VERSION,
  EVENT_ACCOUNT_CONSENT_REQUIRED_MSG,
} from "@/lib/event-consent";

/**
 * Event → talent-pool account bridge (migration 0081).
 *
 * An event registrant (anon row in event_registrations) opts to ALSO create an
 * app account from the registration success screen. We stage an `intent='event'`
 * pending + signUp(email, password); on email confirmation, handle_new_auth_user
 * materializes a `candidates` row and links event_registrations.candidate_id.
 *
 * No Meta CAPI here — CompleteRegistration already fired at event registration.
 * This is a post-conversion account upsell, not a new lead.
 */

interface EventAccountPayload {
  full_name?: string;
  whatsapp?: string;
  email?: string;
  password?: string;
  city?: string;
  /**
   * PDP UU 27/2022 Pasal 20: affirmative consent ticked in EventAccountUpsell.
   * Must be exactly `true`. Until 2026-07-21 this route logged an
   * `event_account_processing` consent the registrant had never been shown, with
   * `granted: true` hardcoded - implied consent for a heavier processing (auth
   * user + candidate record) than the event registration itself.
   */
  consent_granted?: boolean;
  source_url?: string;
  website?: string; // honeypot
}

function validatePasswordServer(pw: string): boolean {
  return (
    pw.length >= 10 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw)
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const db = supabaseV2();

    // Only published events accept account creation (matches registration).
    const { data: event } = await db
      .from("events")
      .select("slug, status")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (!event) {
      return NextResponse.json(
        { error: "Event tidak ditemukan atau sudah ditutup." },
        { status: 404 },
      );
    }

    const body = (await request.json()) as EventAccountPayload;

    // Honeypot — silent success, no account.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    const full_name = (body.full_name ?? "").trim();
    const whatsapp = (body.whatsapp ?? "").trim();
    const email = (body.email ?? "").toLowerCase().trim();
    const password = body.password ?? "";

    if (!full_name || !whatsapp || !email || !password) {
      return NextResponse.json(
        { error: "Nama, WhatsApp, email, dan password wajib diisi." },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }
    if (!validatePasswordServer(password)) {
      return NextResponse.json(
        {
          error:
            "Password minimal 10 karakter dengan huruf besar, huruf kecil, dan angka.",
        },
        { status: 400 },
      );
    }

    // PDP UU 27/2022 Pasal 20: consent must be affirmative. Re-checked here so a
    // client that skips the checkbox (or posts straight to the API) cannot have
    // a consent row written on its behalf.
    if (body.consent_granted !== true) {
      return NextResponse.json(
        { error: EVENT_ACCOUNT_CONSENT_REQUIRED_MSG },
        { status: 400 },
      );
    }

    // Stage the event pending. Trigger links event_registrations.candidate_id on
    // email confirmation (migration 0081).
    const writeResult = await writePendingSubmission(
      {
        intent: "event",
        event_slug: slug,
        email,
        phone: whatsapp,
        form_data: {
          full_name,
          whatsapp,
          email,
          city: body.city ?? null,
          event_slug: slug,
          source_url: body.source_url ?? null,
        },
        consents: [
          {
            // SoT import keeps shown-text (EventAccountUpsell checkbox) ==
            // logged-text. `granted` mirrors the ticked box, not a hardcoded
            // true - the guard above already rejected anything else, so this is
            // always an affirmative record with a real user action behind it.
            purpose: EVENT_ACCOUNT_CONSENT_PURPOSE,
            purpose_text: EVENT_ACCOUNT_CONSENT_TEXT,
            version: EVENT_ACCOUNT_CONSENT_VERSION,
            granted: body.consent_granted === true,
          },
        ],
      },
      request,
    );
    if (!writeResult.ok) {
      console.error("[event/account] pending write failed:", writeResult.error);
      return NextResponse.json(
        { error: "Gagal menyimpan data. Coba lagi sebentar." },
        { status: 500 },
      );
    }

    const platformBase =
      process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";
    const { error: signUpError } = await db.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${platformBase}/auth/callback`,
        data: { full_name, source: "event_register", event_slug: slug },
      },
    });

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        return NextResponse.json(
          {
            error:
              "Email ini sudah punya akun Perantau Global. Langsung masuk aja di app.perantauglobal.com.",
            code: "email_exists",
          },
          { status: 409 },
        );
      }
      if (msg.includes("weak password") || msg.includes("pwned")) {
        return NextResponse.json(
          {
            error:
              "Password terlalu umum atau pernah bocor di database publik. Pilih yang lain.",
          },
          { status: 400 },
        );
      }
      if (msg.includes("rate limit") || msg.includes("too many requests")) {
        return NextResponse.json(
          { error: "Terlalu banyak percobaan. Coba lagi dalam beberapa menit." },
          { status: 429 },
        );
      }
      console.error("[event/account] signUp failed:", signUpError.message);
      return NextResponse.json(
        { error: "Gagal membuat akun. Coba lagi sebentar." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[event/account] unexpected error:", err);
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }
}
