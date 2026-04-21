import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import {
  validateRequired,
  validateEmail,
  insertToSupabase,
} from "@/lib/form-utils";
import { sendMetaEvent } from "@/lib/meta-capi";
import { shadowPendingSubmission } from "@/lib/shadow-write";

// Legacy program slugs → new positions.slug.
// Legacy program routes use short aliases; new schema uses canonical slugs.
const PROGRAM_TO_POSITION_SLUG: Record<string, string> = {
  "truck-driver": "truck-driver-jepang",
  "global-talent-hub": "global-talent-hub",
};

// ---------------------------------------------------------------------------
// Program Registry — each entry defines table, required fields, and transform
// ---------------------------------------------------------------------------

interface ProgramDef {
  table: string;
  required: string[];
  /** Extra validation beyond required + email. Return error response or null. */
  validate?: (body: Record<string, unknown>) => NextResponse | null;
  /** Transform camelCase payload → snake_case DB row */
  transform: (body: Record<string, unknown>) => Record<string, unknown>;
}

const PROGRAMS: Record<string, ProgramDef> = {
  "truck-driver": {
    table: "tdp_registrations",
    required: [
      "fullName",
      "whatsapp",
      "email",
      "city",
      "age",
      "education",
      "simType",
      "drivingExperience",
      "japaneseLevel",
      "hasSswCertificate",
    ],
    validate: (b) => {
      const age = Number(b.age);
      if (age < 18 || age > 44) {
        return NextResponse.json(
          { error: "Age must be between 18 and 44" },
          { status: 400 }
        );
      }
      return null;
    },
    transform: (b) => ({
      full_name: b.fullName,
      whatsapp: b.whatsapp,
      email: b.email,
      city: b.city,
      age: Number(b.age),
      education: b.education,
      sim_type: b.simType,
      sim_issued_year: b.simIssuedYear ? Number(b.simIssuedYear) : null,
      driving_experience: b.drivingExperience,
      japanese_level: b.japaneseLevel,
      has_ssw_certificate: b.hasSswCertificate === "yes",
    }),
  },

  "global-talent-hub": {
    table: "gth_registrations",
    required: [
      "fullName",
      "whatsapp",
      "email",
      "city",
      "education",
      "currentStatus",
      "interestedCountry",
      "hasLPK",
    ],
    transform: (b) => ({
      full_name: b.fullName,
      whatsapp: b.whatsapp,
      email: b.email,
      city: b.city,
      education: b.education,
      current_status: b.currentStatus,
      interested_country: b.interestedCountry,
      has_lpk: b.hasLPK,
    }),
  },
};

// ---------------------------------------------------------------------------
// Dynamic POST handler
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const program = PROGRAMS[slug];

    if (!program) {
      return NextResponse.json(
        { error: "Unknown program" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    // 1. Required fields
    const reqErr = validateRequired(body, program.required);
    if (reqErr) return reqErr;

    // 2. Email format
    const emailErr = validateEmail(body.email as string);
    if (emailErr) return emailErr;

    // 3. Program-specific validation
    if (program.validate) {
      const extraErr = program.validate(body);
      if (extraErr) return extraErr;
    }

    // 4. Transform & insert
    const row = program.transform(body);
    const result = await insertToSupabase(
      program.table,
      row,
      `${slug} Registration`
    );

    // 4.5 Dual-write shadow: mirror into new Supabase pending_submissions if
    // this program maps to a seeded position. Fire-and-forget.
    const positionSlug = PROGRAM_TO_POSITION_SLUG[slug];
    if (result.status === 200 && positionSlug) {
      await shadowPendingSubmission(
        {
          position_slug: positionSlug,
          email: body.email as string,
          phone: (body.whatsapp || body.phone) as string | undefined,
          form_data: body,
          consents: [
            {
              purpose: "application_processing",
              purpose_text:
                "Memproses pendaftaran program (verifikasi data, komunikasi via WhatsApp/email, pencocokan lowongan).",
              version: "2026-04-22",
              granted: true,
            },
          ],
        },
        request,
      );
    }

    // 5. Send to Meta CAPI (non-blocking)
    const eventId = body.eventId as string | undefined;
    if (eventId && result.status === 200) {
      waitUntil(
        sendMetaEvent({
          eventName: "Lead",
          eventId,
          sourceUrl: request.headers.get("referer") || `https://perantauglobal.com/program/${slug}`,
          ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "",
          userAgent: request.headers.get("user-agent") || "",
          fbp: (body.fbp as string) || undefined,
          fbc: (body.fbc as string) || undefined,
          userData: {
            email: body.email as string,
            phone: (body.whatsapp || body.phone) as string,
            firstName: body.fullName as string,
            city: body.city as string,
          },
          customData: { content_name: slug, content_category: "program" },
        })
      );
    }

    return result;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
