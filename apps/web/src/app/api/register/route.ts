import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabase } from "@/lib/supabase";
import { sendMetaEvent } from "@/lib/meta-capi";

interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  address: string;
  education: string;
  major?: string;
  experience: string;
  skills?: string;
  destination: string;
  language?: string;
  hasPassport: string;
  motivation?: string;
  eventId?: string;
  fbp?: string;
  fbc?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterPayload;

    // Validate required fields
    const required = ["fullName", "email", "phone", "birthDate", "gender", "address", "education", "experience", "destination", "hasPassport"] as const;
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

    const { error } = await supabase.from("registrations").insert({
      full_name: body.fullName,
      email: body.email,
      phone: body.phone,
      birth_date: body.birthDate,
      gender: body.gender,
      address: body.address,
      education: body.education,
      major: body.major || null,
      experience: body.experience,
      skills: body.skills || null,
      destination: body.destination,
      language: body.language || null,
      has_passport: body.hasPassport,
      motivation: body.motivation || null,
    });

    if (error) {
      console.error("[Registration Form] Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to submit. Please try again." },
        { status: 500 }
      );
    }

    if (body.eventId) {
      waitUntil(
        sendMetaEvent({
          eventName: "CompleteRegistration",
          eventId: body.eventId,
          sourceUrl: request.headers.get("referer") || "https://perantauglobal.com/daftar",
          ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "",
          userAgent: request.headers.get("user-agent") || "",
          fbp: body.fbp,
          fbc: body.fbc,
          userData: {
            email: body.email,
            phone: body.phone,
            firstName: body.fullName,
          },
          customData: { content_name: "registration", content_category: "registration" },
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
