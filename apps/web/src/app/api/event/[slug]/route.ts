import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { sendMetaEvent } from "@/lib/meta-capi";
import { supabaseV2 } from "@/lib/supabase-v2";
import { sendEmail, buildEventThankYouEmail } from "@/lib/email";

/**
 * Event registration endpoint.
 *
 * Unlike /api/lowongan/[slug] (job apply → magic-link → candidate account),
 * this is a single-step, frictionless capture: anon INSERT into
 * event_registrations, then fire a Meta CAPI `CompleteRegistration` so paid
 * traffic to the event LP is measurable. No auth, no email verification — a
 * free webinar can't afford that friction (Zoom link goes out via email + WA).
 */

interface EventRegPayload {
  full_name?: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  profession?: string;
  interest?: string;
  consent_marketing?: boolean;
  source_url?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  eventId?: string;
  fbp?: string;
  fbc?: string;
  website?: string; // honeypot — humans never fill this
}

/** Trim + cap a free-text field; returns null for empty so we don't store "". */
function clean(value: unknown, max = 200): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  return v.slice(0, max);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const db = supabaseV2();

    // Only published events accept registrations (anon read policy enforces this
    // too, but checking lets us 404/410 cleanly + grab the join_url to return).
    const { data: event, error: lookupErr } = await db
      .from("events")
      .select("slug, title, status, join_url, starts_at, timezone, platform")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (lookupErr) {
      console.error("[event] lookup failed:", lookupErr.message);
      return NextResponse.json(
        { error: "Gagal memuat event. Coba lagi sebentar." },
        { status: 500 },
      );
    }
    if (!event) {
      return NextResponse.json(
        { error: "Pendaftaran event ini sudah ditutup atau tidak ditemukan." },
        { status: 404 },
      );
    }

    const body = (await request.json()) as EventRegPayload;

    // Honeypot: bots fill the hidden `website` field. Return a clean 200 (so the
    // bot thinks it succeeded) WITHOUT inserting a row or firing Meta CAPI.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    const full_name = clean(body.full_name, 120);
    const whatsapp = clean(body.whatsapp, 32);
    const emailRaw = clean(body.email, 160);

    if (!full_name || !whatsapp || !emailRaw) {
      return NextResponse.json(
        { error: "Nama, WhatsApp, dan email wajib diisi." },
        { status: 400 },
      );
    }
    const email = emailRaw.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 },
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;
    const userAgent = request.headers.get("user-agent") || null;
    const referrer = clean(body.source_url, 500) || request.headers.get("referer");

    // Rate limit (DB-level, mirrors apply flow): cap per-email + per-IP in a 10-min
    // window so a script can't flood event_registrations or manufacture Meta CAPI
    // conversions. Fail-open: if the RPC errors (e.g. malformed IP), let it through.
    try {
      // RPC from migration 0080; generated DB types include it only after a regen,
      // so cast to a generic signature (not `any`) — mirrors the apply flow.
      const rpc = db.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: boolean | null; error: { message: string } | null }>;
      const { data: allowed, error: rlErr } = await rpc("check_event_reg_rate_limit", {
        p_email: email,
        p_ip: ip,
      });
      if (!rlErr && allowed === false) {
        return NextResponse.json(
          { error: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." },
          { status: 429 },
        );
      }
    } catch {
      // fail-open — never block a legit registration on a rate-limit hiccup
    }

    const { error: insertErr } = await db.from("event_registrations").insert({
      event_slug: slug,
      full_name,
      whatsapp,
      email,
      city: clean(body.city, 80),
      profession: clean(body.profession, 80),
      interest: clean(body.interest, 200),
      consent_marketing: body.consent_marketing === true,
      source: clean(body.utm?.source) ?? "event_lp",
      utm_source: clean(body.utm?.source),
      utm_medium: clean(body.utm?.medium),
      utm_campaign: clean(body.utm?.campaign),
      utm_content: clean(body.utm?.content),
      utm_term: clean(body.utm?.term),
      referrer_url: referrer ? referrer.slice(0, 500) : null,
      fbp: clean(body.fbp, 256),
      fbc: clean(body.fbc, 256),
      meta_event_id: clean(body.eventId, 128),
      ip_address: ip ?? undefined,
      user_agent: userAgent,
    });

    if (insertErr) {
      // Duplicate (event_slug, email): treat as success — they're already in.
      if (insertErr.code === "23505") {
        return NextResponse.json({
          success: true,
          duplicate: true,
          joinUrl: event.join_url ?? null,
        });
      }
      console.error("[event] insert failed:", insertErr.message);
      return NextResponse.json(
        { error: "Gagal menyimpan pendaftaran. Coba lagi sebentar." },
        { status: 500 },
      );
    }

    // Server-side conversion event — survives ad blockers / iOS privacy.
    // Browser pixel fires the same eventId (dataLayer) for dedup.
    if (body.eventId) {
      waitUntil(
        sendMetaEvent({
          eventName: "CompleteRegistration",
          eventId: body.eventId,
          sourceUrl:
            referrer || `https://perantauglobal.com/event/${slug}`,
          ip: ip || "",
          userAgent: userAgent || "",
          fbp: body.fbp,
          fbc: body.fbc,
          userData: {
            email,
            phone: whatsapp,
            firstName: full_name,
            city: clean(body.city, 80) ?? undefined,
          },
          customData: {
            content_name: `event_${slug}`,
            content_category: "event",
          },
        }),
      );
    }

    // Thank-you email (NOT an auth email) — branded confirmation that states
    // the Zoom link goes out H-1. Best-effort, fire-and-forget; a mail hiccup
    // must never fail a registration. Only on fresh insert (duplicate returns
    // earlier), so we don't re-spam re-submitters.
    waitUntil(
      (async () => {
        try {
          const tz = event.timezone || "Asia/Jakarta";
          const whenLabel = event.starts_at
            ? `${new Intl.DateTimeFormat("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: tz,
              }).format(new Date(event.starts_at))} · ${new Intl.DateTimeFormat("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: tz,
              }).format(new Date(event.starts_at))} WIB`
            : "Jadwal menyusul";
          const { subject, html } = buildEventThankYouEmail({
            firstName: full_name,
            eventTitle: event.title,
            whenLabel,
            platform: event.platform || "Zoom",
          });
          await sendEmail({ to: email, subject, html });
        } catch (err) {
          console.error("[event] thank-you email failed:", err);
        }
      })(),
    );

    return NextResponse.json({
      success: true,
      joinUrl: event.join_url ?? null,
    });
  } catch (err) {
    console.error("[event] unexpected error:", err);
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }
}
