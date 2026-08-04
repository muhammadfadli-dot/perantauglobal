import { NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabase";
import { INQUIRY_CONSENT_VERSION } from "@/lib/consent";
import { quantityLabel, timelineLabel, type InquiryPayload } from "@/lib/inquiry";
import { sendInquiryNotification } from "@/lib/email";

/**
 * Employer inquiry endpoint — the lead-capture half of the contact form.
 *
 * Contact.tsx opens the prefilled WhatsApp handoff first (that stays the BD
 * conversation channel), then POSTs here so the lead exists even when the
 * visitor never presses send in WhatsApp — previously those inquiries vanished
 * without a trace. Mirrors /api/event/[slug] in apps/web: anon INSERT under
 * RLS (migration 0008 allows exactly that), honeypot, server-side re-check of
 * required fields and consent so a hand-rolled POST can't bypass the browser.
 *
 * Schema note: `employer_inquiries` predates this form (legacy /mitra form,
 * migration 0008). Its `phone`, `workers_needed`, `timeline` columns are
 * NOT NULL, so fields this form doesn't collect (phone) or leaves optional
 * are stored as "". Fields with no column of their own (roles, location,
 * social, notes, consent version) travel in `additional_requirements` as a
 * labeled block. The one-shot column migration is deliberately parked until
 * Aseel confirms the form fields are final — see the project memory.
 */

/** Trim + cap a free-text field; null for empty so "" only means "not collected". */
function clean(value: unknown, max = 200): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  return v.slice(0, max);
}

export async function POST(request: Request) {
  let body: InquiryPayload;
  try {
    body = (await request.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden `website` field. Return a clean 200 (so the
  // bot thinks it succeeded) WITHOUT inserting a row.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ success: true });
  }

  const company = clean(body.company, 160);
  const country = clean(body.country, 80);
  const sector = clean(body.sector, 80);
  const name = clean(body.name, 120);
  const emailRaw = clean(body.email, 160);

  if (!company || !country || !sector || !name || !emailRaw) {
    return NextResponse.json(
      { error: "Company, country, sector, name, and email are required." },
      { status: 400 },
    );
  }
  const email = emailRaw.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  // PDP UU 27/2022 Pasal 20: consent must be affirmative. Re-checked here so a
  // client that skips the checkbox cannot have a row written on its behalf.
  if (body.consent !== true) {
    return NextResponse.json(
      { error: "Consent is required before we can store this inquiry." },
      { status: 400 },
    );
  }

  let db: ReturnType<typeof supabaseAnon>;
  try {
    db = supabaseAnon();
  } catch (err) {
    // Missing env is our misconfiguration, not the visitor's — surface a 500
    // so the client falls back to its WhatsApp-only success copy.
    console.error("[inquiry] supabase env missing:", err);
    return NextResponse.json(
      { error: "Inquiry storage is unavailable." },
      { status: 500 },
    );
  }

  const roles = clean(body.roles, 200);
  const mapsLink = clean(body.mapsLink, 300);
  const social = clean(body.social, 200);
  const notes = clean(body.notes, 1000);

  // Consent ledger lives on the row (version + timestamp; the verbatim text
  // per version is in consent.ts git history). The candidate-side `consents`
  // table can't hold it: its CHECK requires candidate_id OR pending_id.
  const details = [
    "Source: dayatalentaglobal.com inquiry form",
    roles ? `Roles needed: ${roles}` : "",
    mapsLink ? `Location: ${mapsLink}` : "",
    social ? `Website or social: ${social}` : "",
    notes ? `Notes: ${notes}` : "",
    `Consent: v${INQUIRY_CONSENT_VERSION} granted at ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join("\n");

  const workersNeeded = quantityLabel(clean(body.quantity, 32) ?? "");
  const timeline = timelineLabel(clean(body.timeline, 80) ?? "");

  const { error: insertErr } = await db.from("employer_inquiries").insert({
    company_name: company,
    contact_person: name,
    email,
    phone: "", // not collected by this form; NOT NULL column from migration 0008
    country,
    industry: sector,
    workers_needed: workersNeeded,
    timeline,
    additional_requirements: details,
  });

  if (insertErr) {
    console.error("[inquiry] insert failed:", insertErr.message);
    return NextResponse.json(
      { error: "Could not store the inquiry. Please use WhatsApp." },
      { status: 500 },
    );
  }

  // Read path for BD: dormant until RESEND_API_KEY + INQUIRY_NOTIFY_TO exist
  // in this project's env. Awaited (no waitUntil dep here) but best-effort —
  // the lead is already stored, so a mail failure never fails the request.
  await sendInquiryNotification({
    companyName: company,
    contactPerson: name,
    email,
    country,
    industry: sector,
    workersNeeded,
    timeline,
    details,
  });

  return NextResponse.json({ success: true });
}
