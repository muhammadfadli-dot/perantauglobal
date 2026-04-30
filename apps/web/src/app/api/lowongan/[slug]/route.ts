import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { sendMetaEvent } from "@/lib/meta-capi";
import { writePendingSubmission } from "@/lib/pending-write";
import { supabaseV2 } from "@/lib/supabase-v2";

// Map slug → role + country. Kept as a whitelist so we reject unknown slugs
// before touching the DB. Kept in sync with src/lib/positions.ts.
const SLUG_MAP: Record<string, { role: string; country: string }> = {
  // Saudi Arabia
  "perawat-saudi-arabia": { role: "nurse", country: "saudi_arabia" },
  "barista-saudi-arabia": { role: "barista", country: "saudi_arabia" },
  "waiter-saudi-arabia": { role: "waiter", country: "saudi_arabia" },
  "waitress-saudi-arabia": { role: "waitress", country: "saudi_arabia" },
  "chef-bakery-saudi-arabia": { role: "chef_bakery", country: "saudi_arabia" },
  "head-barista-saudi-arabia": { role: "head_barista", country: "saudi_arabia" },
  "roaster-saudi-arabia": { role: "roaster", country: "saudi_arabia" },
  "chef-pastry-saudi-arabia": { role: "chef_pastry", country: "saudi_arabia" },
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
  password: string;
  role: string;
  country: string;
  source_url?: string;
  eventId?: string;
  fbp?: string;
  fbc?: string;
}

function validatePasswordServer(pw: string): boolean {
  return (
    pw.length >= 10 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /[0-9]/.test(pw)
  );
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
        { error: "Lowongan tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = (await request.json()) as CandidatePayload;

    const required = ["full_name", "whatsapp", "email", "city", "education", "password"] as const;
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field ${field} wajib diisi.` },
          { status: 400 }
        );
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (!validatePasswordServer(body.password)) {
      return NextResponse.json(
        {
          error:
            "Password minimal 10 karakter dengan huruf besar, huruf kecil, dan angka.",
        },
        { status: 400 }
      );
    }

    const email = body.email.toLowerCase().trim();

    // Step 1: stage the form payload. The DB trigger
    // (handle_new_auth_user in migration 0015) reads this on email_confirmed_at
    // flip to materialize candidate + application.
    const writeResult = await writePendingSubmission(
      {
        position_slug: slug,
        email,
        phone: body.whatsapp,
        form_data: {
          full_name: body.full_name,
          whatsapp: body.whatsapp,
          email,
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
      console.error("[lowongan] pending write failed:", writeResult.error);
      return NextResponse.json(
        { error: "Gagal menyimpan data. Coba lagi sebentar." },
        { status: 500 }
      );
    }

    // Step 2: create auth user with password. Supabase sends the verification
    // email. Redirect lands on the platform domain (cross-subdomain) where
    // PKCE code exchange sets the session cookie; the trigger fires on the
    // email_confirmed_at flip and materializes the candidate from the pending
    // staged above.
    const platformBase =
      process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";
    const db = supabaseV2();
    const { error: signUpError } = await db.auth.signUp({
      email,
      password: body.password,
      options: {
        emailRedirectTo: `${platformBase}/auth/callback`,
        data: {
          full_name: body.full_name,
          source: "form_apply",
          position_slug: slug,
        },
      },
    });

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      // Duplicate email: user already has an account. Keep the pending row
      // (trigger will materialize the new application on their next verify
      // event or on direct login via requireCandidate equivalent at the
      // platform). Tell the form to route them to sign-in.
      if (msg.includes("already") || msg.includes("registered")) {
        return NextResponse.json(
          {
            error:
              "Email sudah terdaftar. Masuk ke Talent Hub pakai password kamu untuk lanjutkan lamaran.",
            code: "email_exists",
          },
          { status: 409 }
        );
      }
      if (msg.includes("weak password") || msg.includes("pwned")) {
        return NextResponse.json(
          {
            error:
              "Password terlalu umum atau pernah bocor di database publik. Pilih yang lain.",
          },
          { status: 400 }
        );
      }
      if (msg.includes("rate limit") || msg.includes("too many requests")) {
        return NextResponse.json(
          { error: "Terlalu banyak percobaan. Coba lagi dalam beberapa menit." },
          { status: 429 }
        );
      }
      console.error("[lowongan] signUp failed:", signUpError.message);
      return NextResponse.json(
        { error: "Gagal membuat akun. Coba lagi sebentar." },
        { status: 500 }
      );
    }

    if (body.eventId) {
      waitUntil(
        sendMetaEvent({
          eventName: "Lead",
          eventId: body.eventId,
          sourceUrl:
            body.source_url ||
            request.headers.get("referer") ||
            `https://perantauglobal.com/lowongan/${slug}`,
          ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "",
          userAgent: request.headers.get("user-agent") || "",
          fbp: body.fbp,
          fbc: body.fbc,
          userData: {
            email,
            phone: body.whatsapp,
            firstName: body.full_name,
            city: body.city,
          },
          customData: {
            content_name: `lowongan_${mapping.role}`,
            content_category: "lowongan",
          },
        })
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[lowongan] unexpected error:", err);
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }
}
