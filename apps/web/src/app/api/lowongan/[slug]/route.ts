import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabase } from "@/lib/supabase";
import { sendMetaEvent } from "@/lib/meta-capi";
import { shadowPendingSubmission } from "@/lib/shadow-write";

// Map slug → role + country
const SLUG_MAP: Record<string, { role: string; country: string }> = {
  "perawat-saudi-arabia": { role: "nurse", country: "saudi_arabia" },
  "dental-nurse-saudi-arabia": { role: "dental_nurse", country: "saudi_arabia" },
  "barista-saudi-arabia": { role: "barista", country: "saudi_arabia" },
  "waiter-saudi-arabia": { role: "waiter", country: "saudi_arabia" },
  "spa-therapist-saudi-arabia": { role: "spa_therapist", country: "saudi_arabia" },
  "kaigo-jepang": { role: "kaigo", country: "japan" },
  "food-service-jepang": { role: "food_service", country: "japan" },
  "truck-driver-jepang": { role: "truck_driver", country: "japan" },
  "caregiver-taiwan": { role: "caregiver", country: "taiwan" },
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
  role_data?: Record<string, unknown>;
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

    // Validate required fields
    const required = ["full_name", "whatsapp", "email", "city", "education"] as const;
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("candidate_applications").insert({
      role: mapping.role,
      country: mapping.country,
      source_url: body.source_url || null,
      full_name: body.full_name,
      whatsapp: body.whatsapp,
      email: body.email,
      city: body.city,
      birth_date: body.birth_date || null,
      gender: body.gender || null,
      education: body.education,
      role_data: body.role_data || {},
    });

    if (error) {
      console.error("[Candidate Application] Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to submit. Please try again." },
        { status: 500 }
      );
    }

    // Dual-write shadow: mirror into new Supabase pending_submissions.
    // Fire-and-forget; never blocks the user-facing response.
    waitUntil(
      shadowPendingSubmission(
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
            role_data: body.role_data ?? {},
            source_url: body.source_url ?? null,
          },
          consents: [
            {
              purpose: "application_processing",
              purpose_text:
                "Memproses lamaran kerja (verifikasi data, komunikasi via WhatsApp/email, pencocokan lowongan).",
              version: "2026-04-22",
              granted: true,
            },
          ],
        },
        request,
      ),
    );

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
