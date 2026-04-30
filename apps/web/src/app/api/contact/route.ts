import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";
import { supabaseV2 } from "@/lib/supabase-v2";
import { sendMetaEvent } from "@/lib/meta-capi";

const contactSchema = z.object({
  name: z.string().min(1, "Name required").max(200),
  email: z.string().email("Invalid email").max(254),
  phone: z.string().max(30).optional(),
  subject: z.string().min(1, "Subject required").max(200),
  message: z.string().min(1, "Message required").max(4000),
  eventId: z.string().max(100).optional(),
  fbp: z.string().max(100).optional(),
  fbc: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  let body: z.infer<typeof contactSchema>;
  try {
    const raw = await request.json();
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await supabaseV2().from("contact_submissions").insert({
    name: body.name,
    email: body.email,
    phone: body.phone || null,
    subject: body.subject,
    message: body.message,
  });

  if (error) {
    console.error("[Contact Form] Supabase error:", error.message);
    return NextResponse.json(
      { error: "Failed to submit. Please try again." },
      { status: 500 }
    );
  }

  if (body.eventId) {
    waitUntil(
      sendMetaEvent({
        eventName: "Contact",
        eventId: body.eventId,
        sourceUrl: request.headers.get("referer") || "https://perantauglobal.com/kontak",
        ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "",
        userAgent: request.headers.get("user-agent") || "",
        fbp: body.fbp,
        fbc: body.fbc,
        userData: {
          email: body.email,
          phone: body.phone,
          firstName: body.name,
        },
        customData: { content_name: "contact", content_category: "contact" },
      })
    );
  }

  return NextResponse.json({ success: true });
}
