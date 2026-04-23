import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { sendMetaEvent } from "@/lib/meta-capi";
import { writePendingSubmission } from "@/lib/pending-write";

// Map slug → role + country. Kept as a whitelist so we reject unknown slugs
// before touching the DB. Kept in sync with src/lib/positions.ts.
const SLUG_MAP: Record<string, { role: string; country: string }> = {
  // Saudi Arabia
  "perawat-saudi-arabia": { role: "nurse", country: "saudi_arabia" },
  "barista-saudi-arabia": { role: "barista", country: "saudi_arabia" },
  "waiter-saudi-arabia": { role: "waiter", country: "saudi_arabia" },
  "waitress-saudi-arabia": { role: "waitress", country: "saudi_arabia" },
  "chef-bakery-saudi-arabia": { role: "chef_bakery", country: "saudi_arabia" },
  "spa-therapist-saudi-arabia": { role: "spa_therapist", country: "saudi_arabia" },
  "laundry-worker-saudi-arabia": { role: "laundry_worker", country: "saudi_arabia" },
  // Jepang
  "truck-driver-jepang": { role: "truck_driver", country: "japan" },
  "food-service-jepang": { role: "food_service", country: "japan" },
  "kaigo-jepang": { role: "kaigo", country: "japan" },
  "pengolahan-makanan-jepang": { role: "pengolahan_makanan", country: "japan" },
  // Lainnya
  "caregiver-taiwan": { role: "caregiver", country: "taiwan" },
  "spg-indonesia": { role: "spg", country: "indonesia" },
};

interface CandidatePayload {
  full_name: string;
  whatsapp: string;
  email: string;
  city: string;
  birth_date?: string | null;
  gender?: string | null;
  education: string;
  role: string;
  country: string;
  source_url?: string;
  eventId?: string;
  fbp?: string;
  fbc?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const mapping = SLUG_MAP[slug];

    if (!mapping) {
      return NextResponse.json(
        { error: "Invalid lowongan slug" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as CandidatePayload;

    const required = ["full_name", "whatsapp", "email", "city", "education"] as const;
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const writeResult = await writePendingSubmission(
      {
        position_slug: slug,
        email: body.email,
        phone: body.whatsapp,
        form_data: {
          full_name: body.full_name,
          whatsapp: body.whatsapp,
          email: body.email,
          city: body.city,
          birth_date: body.birth_date ?? null,
          gender: body.gender ?? null,
          education: body.education,
          role: mapping.role,
          country: mapping.country,
          source_url: body.source_url ?? null,
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
      console.error("[Candidate Application] write failed:", writeResult.error);
      return NextResponse.json(
        { error: "Failed to submit. Please try again." },
        { status: 500 }
      );
    }

    if (body.eventId) {
      waitUntil(
        sendMetaEvent({
          eventName: "Lead",
          eventId: body.eventId,
          sourceUrl: body.source_url || request.headers.get("referer") || `https://perantauglobal.com/lowongan/${slug}`,
          ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "",
          userAgent: request.headers.get("user-agent") || "",
          fbp: body.fbp,
          fbc: body.fbc,
          userData: {
            email: body.email,
            phone: body.whatsapp,
            firstName: body.full_name,
            city: body.city,
          },
          customData: { content_name: `lowongan_${mapping.role}`, content_category: "lowongan" },
        })
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
