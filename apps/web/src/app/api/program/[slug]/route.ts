import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { validateRequired, validateEmail } from "@/lib/form-utils";
import { sendMetaEvent } from "@/lib/meta-capi";
import { writePendingSubmission } from "@/lib/pending-write";

// Program slug → positions.slug mapping. After Phase C strip, program forms
// are bio-only; only global-talent-hub still uses this endpoint (SPG has its
// own route, truck-driver moved to /lowongan/truck-driver-jepang).
const PROGRAM_TO_POSITION_SLUG: Record<string, string> = {
  "global-talent-hub": "global-talent-hub",
};

// Shared required fields per Phase C bio-only shape.
const REQUIRED = ["fullName", "whatsapp", "email", "city", "education"] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const positionSlug = PROGRAM_TO_POSITION_SLUG[slug];

    if (!positionSlug) {
      return NextResponse.json(
        { error: "Unknown program" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    const reqErr = validateRequired(body, Array.from(REQUIRED));
    if (reqErr) return reqErr;

    const emailErr = validateEmail(body.email as string);
    if (emailErr) return emailErr;

    const writeResult = await writePendingSubmission(
      {
        position_slug: positionSlug,
        email: body.email as string,
        phone: (body.whatsapp || body.phone) as string | undefined,
        form_data: {
          full_name: body.fullName,
          whatsapp: body.whatsapp,
          email: body.email,
          city: body.city,
          education: body.education,
        },
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

    if (!writeResult.ok) {
      console.error(`[${slug} Registration] write failed:`, writeResult.error);
      return NextResponse.json(
        { error: "Failed to submit. Please try again." },
        { status: 500 }
      );
    }

    const eventId = body.eventId as string | undefined;
    if (eventId) {
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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
