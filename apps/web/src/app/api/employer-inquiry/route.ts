import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabase } from "@/lib/supabase";
import { sendMetaEvent } from "@/lib/meta-capi";

interface EmployerInquiryPayload {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  country: string;
  industry: string;
  workers_needed: string;
  timeline: string;
  additional_requirements?: string;
  eventId?: string;
  fbp?: string;
  fbc?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EmployerInquiryPayload;

    // Validate required fields
    if (
      !body.company_name ||
      !body.contact_person ||
      !body.email ||
      !body.phone ||
      !body.country ||
      !body.industry ||
      !body.workers_needed ||
      !body.timeline
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("employer_inquiries").insert({
      company_name: body.company_name,
      contact_person: body.contact_person,
      email: body.email,
      phone: body.phone,
      country: body.country,
      industry: body.industry,
      workers_needed: body.workers_needed,
      timeline: body.timeline,
      additional_requirements: body.additional_requirements || null,
    });

    if (error) {
      console.error("[Employer Inquiry] Supabase error:", error.message);
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
          sourceUrl: request.headers.get("referer") || "https://perantauglobal.com/en/contact",
          ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "",
          userAgent: request.headers.get("user-agent") || "",
          fbp: body.fbp,
          fbc: body.fbc,
          userData: {
            email: body.email,
            phone: body.phone,
            firstName: body.contact_person,
          },
          customData: { content_name: "employer_inquiry", content_category: "employer" },
        })
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
