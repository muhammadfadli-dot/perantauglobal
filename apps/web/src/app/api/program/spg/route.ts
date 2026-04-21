import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabase } from "@/lib/supabase";
import { sendMetaEvent } from "@/lib/meta-capi";
import {
  SCORE_WEIGHTS,
  SCORE_THRESHOLDS,
  isJavaProvince,
  hasVehicle,
} from "@/components/program/spg-form/types";

interface SPGPayload {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  age: string;
  education: string;
  vehicle: string;
  workStatus: string;
  availability: string;
  hasSmartphone: string;
  hasInternet: string;
  fieldWorkWilling: string;
  motivationReason: string;
  motivationDetail: string;
  communicationComfort: string;
  initiativeScenario: string;
  referralSource: string;
  agreedTerms: boolean;
  briefingAvailability: string;
  // Partial submission (stopped)
  stopped?: boolean;
  stoppedAtPage?: number;
  stopReason?: string;
  // Tracking
  eventId?: string;
  fbp?: string;
  fbc?: string;
}

function computeScore(data: SPGPayload): {
  score: number;
  breakdown: Record<string, number>;
  status: "green" | "yellow" | "red";
} {
  const breakdown: Record<string, number> = {};

  // Vehicle
  const vehicleKey = data.vehicle as keyof typeof SCORE_WEIGHTS.vehicle;
  breakdown.vehicle = SCORE_WEIGHTS.vehicle[vehicleKey] ?? 0;

  // Province
  const provinceKey = data.province as keyof typeof SCORE_WEIGHTS.province;
  breakdown.province = SCORE_WEIGHTS.province[provinceKey] ?? 0;

  // Availability
  const availKey = data.availability as keyof typeof SCORE_WEIGHTS.availability;
  breakdown.availability = SCORE_WEIGHTS.availability[availKey] ?? 0;

  // Education
  const eduKey = data.education as keyof typeof SCORE_WEIGHTS.education;
  breakdown.education = SCORE_WEIGHTS.education[eduKey] ?? 0;

  // Motivation
  const motKey = data.motivationReason as keyof typeof SCORE_WEIGHTS.motivationReason;
  breakdown.motivationReason = SCORE_WEIGHTS.motivationReason[motKey] ?? 0;

  // Communication comfort
  const comKey = data.communicationComfort as keyof typeof SCORE_WEIGHTS.communicationComfort;
  breakdown.communicationComfort = SCORE_WEIGHTS.communicationComfort[comKey] ?? 0;

  // Initiative scenario
  const initKey = data.initiativeScenario as keyof typeof SCORE_WEIGHTS.initiativeScenario;
  breakdown.initiativeScenario = SCORE_WEIGHTS.initiativeScenario[initKey] ?? 0;

  const score = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

  let status: "green" | "yellow" | "red";
  if (score >= SCORE_THRESHOLDS.green) {
    status = "green";
  } else if (score >= SCORE_THRESHOLDS.yellow) {
    status = "yellow";
  } else {
    status = "red";
  }

  return { score, breakdown, status };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SPGPayload;

    // Handle partial (stopped) submissions
    if (body.stopped) {
      const { error } = await supabase.from("spg_applicants").insert({
        full_name: body.fullName || "Unknown",
        phone: body.phone || "",
        email: body.email || "",
        province: body.province || "",
        city: body.city || "",
        age: body.age ? parseInt(body.age) : null,
        education: body.education || null,
        vehicle: body.vehicle || null,
        stopped_at_page: body.stoppedAtPage,
        stop_reason: body.stopReason,
        status: "red",
        pipeline_stage: "stopped",
      });

      if (error) {
        console.error("[SPG] Stopped submission error:", error.message);
      }

      return NextResponse.json({ success: true });
    }

    // Validate required fields
    const required = [
      "fullName", "phone", "email", "province", "city",
      "age", "education", "vehicle", "workStatus", "availability",
      "hasSmartphone", "hasInternet", "fieldWorkWilling",
      "motivationReason", "communicationComfort", "initiativeScenario",
      "referralSource", "briefingAvailability",
    ] as const;

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

    // Server-side STOP validation
    if (!isJavaProvince(body.province)) {
      return NextResponse.json(
        { error: "Province outside coverage area" },
        { status: 400 }
      );
    }
    if (!hasVehicle(body.vehicle)) {
      return NextResponse.json(
        { error: "Vehicle required" },
        { status: 400 }
      );
    }

    // Compute score
    const { score, breakdown, status } = computeScore(body);

    const { error } = await supabase.from("spg_applicants").insert({
      full_name: body.fullName,
      phone: body.phone,
      email: body.email,
      province: body.province,
      city: body.city,
      age: parseInt(body.age),
      education: body.education,
      vehicle: body.vehicle,
      work_status: body.workStatus,
      availability: body.availability,
      has_smartphone: body.hasSmartphone === "ya",
      has_internet: body.hasInternet === "ya",
      field_work_willing: body.fieldWorkWilling === "ya",
      motivation_reason: body.motivationReason,
      motivation_detail: body.motivationDetail || null,
      communication_comfort: parseInt(body.communicationComfort),
      initiative_scenario: body.initiativeScenario,
      referral_source: body.referralSource,
      agreed_terms: body.agreedTerms,
      briefing_availability: body.briefingAvailability,
      score,
      score_breakdown: breakdown,
      status,
      pipeline_stage: "applied",
    });

    if (error) {
      console.error("[SPG] Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to submit. Please try again." },
        { status: 500 }
      );
    }

    // Send to Meta CAPI (non-blocking)
    if (body.eventId) {
      waitUntil(
        sendMetaEvent({
          eventName: "Lead",
          eventId: body.eventId,
          sourceUrl: request.headers.get("referer") || "https://perantauglobal.com/program/spg",
          ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "",
          userAgent: request.headers.get("user-agent") || "",
          fbp: body.fbp,
          fbc: body.fbc,
          userData: {
            email: body.email,
            phone: body.phone,
            firstName: body.fullName,
            city: body.city,
          },
          customData: { content_name: "spg", content_category: "program" },
        })
      );
    }

    return NextResponse.json({ success: true, status });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
