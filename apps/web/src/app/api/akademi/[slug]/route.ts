import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { sendMetaEvent } from "@/lib/meta-capi";
import { writePendingSubmission } from "@/lib/pending-write";
import { signUpErrorResponse } from "@/lib/signup-error";
import { supabaseV2 } from "@/lib/supabase-v2";
import {
  ACADEMY_CONSENT_PURPOSE,
  ACADEMY_CONSENT_TEXT,
  ACADEMY_CONSENT_VERSION,
  ACADEMY_CONSENT_REQUIRED_MSG,
} from "@/lib/academy-consent";

/**
 * Akademi Perantau registration endpoint. Mirror of /api/lowongan/[slug] but
 * stages an `intent='academy'` pending (migration 0060) so the
 * handle_new_auth_user trigger materializes an academy_enrollment (not an
 * application) on email verification.
 *
 * Contract (enforced here): form_data carries TOP-LEVEL bio (full_name,
 * whatsapp, optional city/gender/education/birth_date) PLUS nested `answers`
 * (the program's registration-field responses). The trigger's candidate upsert
 * reads the top-level bio; the academy branch reads form_data.answers. We reject
 * submissions missing full_name/whatsapp so no 'Unknown'/NULL candidate is ever
 * materialized (see 0060 review, journey-edge HIGH finding).
 */
async function lookupPublishedProgram(
  slug: string,
): Promise<{ title: string; category: string; is_free: boolean } | null> {
  const { data, error } = await supabaseV2()
    .from("academy_programs")
    .select("title, category, is_free")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) {
    console.error("[akademi] program lookup failed:", error.message);
    return null;
  }
  return data ?? null;
}

interface RegistrationField {
  field_key: string;
  field_label: string;
  field_type: string;
  required: boolean;
  options: { value?: string; label?: string }[] | null;
}

async function lookupRegistrationFields(
  slug: string,
): Promise<RegistrationField[]> {
  const { data, error } = await supabaseV2()
    .from("program_registration_fields")
    .select("field_key, field_label, field_type, required, options")
    .eq("program_slug", slug)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[akademi] registration fields lookup failed:", error.message);
    return [];
  }
  return (data ?? []) as RegistrationField[];
}

/**
 * Screening contract. `sanitizeAnswers` only bounds types and lengths; it has no
 * idea which fields the program actually declares. Without this second pass a
 * POST straight to the endpoint produced a valid certification enrollment with
 * ZERO screening answers, and radio/select values were never matched against
 * their own option list. Audit 2026-07-21, finding K1.
 *
 * Returns the whitelisted answer set, or an error message for the registrant.
 */
function validateAnswers(
  fields: RegistrationField[],
  raw: Record<string, string | string[]>,
): { ok: true; answers: Record<string, string | string[]> } | { ok: false; error: string } {
  if (fields.length === 0) return { ok: true, answers: {} };

  const answers: Record<string, string | string[]> = {};

  for (const field of fields) {
    const value = raw[field.field_key];
    const missing =
      value === undefined ||
      (typeof value === "string" && value.trim().length === 0) ||
      (Array.isArray(value) && value.length === 0);

    if (missing) {
      if (field.required) {
        return { ok: false, error: `Pertanyaan "${field.field_label}" wajib diisi.` };
      }
      continue;
    }

    // Choice fields must resolve to an option the program actually offers.
    const allowed = (field.options ?? [])
      .map((o) => o?.value)
      .filter((v): v is string => typeof v === "string" && v.length > 0);

    if (allowed.length > 0) {
      const picked = Array.isArray(value) ? value : [value];
      const bad = picked.filter((v) => !allowed.includes(v));
      if (bad.length > 0) {
        return {
          ok: false,
          error: `Jawaban untuk "${field.field_label}" tidak valid.`,
        };
      }
    }

    answers[field.field_key] = value;
  }

  // Anything the program does not declare is dropped, not stored.
  return { ok: true, answers };
}

/**
 * Nilai sah `candidates.gender` (CHECK di migration 0001).
 *
 * Trigger `handle_new_auth_user` menulis `form_data->>'gender'` LANGSUNG ke
 * kolom itu tanpa blok EXCEPTION, jadi nilai di luar daftar ini menggagalkan
 * seluruh materialisasi kandidat pada saat verifikasi email, jauh setelah
 * pendaftar melihat layar sukses. Divalidasi di sini, bukan cuma di form.
 */
const GENDER_VALUES = new Set(["male", "female", "other", "prefer_not_to_say"]);

/** Tanggal lahir dicast ke DATE oleh trigger yang sama, dengan risiko sama. */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const BIRTH_MIN = "1950-01-01";
const BIRTH_MAX = "2010-12-31";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Pointer CV yang di-stage anon sebelum akun ada. */
interface StagedCv {
  path?: string;
  mime?: string;
  size?: number;
}

/**
 * Terima pointer CV hanya kalau pathnya benar-benar milik pending ini.
 *
 * Tanpa pengikatan path ke `pending_id`, sebuah POST bisa menunjuk folder
 * pending orang lain dan menempelkan CV milik kandidat lain ke kandidat sendiri.
 */
function sanitizeCv(raw: unknown, pendingId: string | null): StagedCv | null {
  if (!raw || typeof raw !== "object" || !pendingId) return null;
  const cv = raw as StagedCv;
  const path = typeof cv.path === "string" ? cv.path : "";
  if (!path.startsWith(`pending/${pendingId}/`)) return null;
  const mime = typeof cv.mime === "string" && cv.mime.length <= 100 ? cv.mime : null;
  const size =
    typeof cv.size === "number" && Number.isFinite(cv.size) && cv.size > 0
      ? Math.floor(cv.size)
      : null;
  return { path, ...(mime ? { mime } : {}), ...(size ? { size } : {}) };
}

interface AcademyRegisterPayload {
  full_name: string;
  whatsapp: string;
  email: string;
  city?: string;
  birth_date?: string | null;
  gender?: string | null;
  education?: string;
  password: string;
  /** PK pending_submissions, sama dengan folder tempat CV diunggah. */
  pending_id?: string;
  /** Pointer CV yang sudah di-stage di bucket pending-cv. */
  cv?: StagedCv;
  /** Registration-field answers, keyed by program_registration_fields.field_key. */
  answers?: Record<string, string | string[]>;
  /**
   * PDP UU 27/2022 Pasal 20: affirmative consent ticked by the registrant in
   * AcademyRegisterForm. Must be exactly `true` - the route refuses the submit
   * otherwise, so a consent row can never be logged for someone who did not tick
   * the box.
   */
  consent_granted?: boolean;
  source_url?: string;
  eventId?: string;
  fbp?: string;
  fbc?: string;
}

function validatePasswordServer(pw: string): boolean {
  return (
    pw.length >= 10 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw)
  );
}

/** Defensive: accept only string|string[] answer values, bounded length. */
function sanitizeAnswers(raw: unknown): Record<string, string | string[]> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof key !== "string" || key.length === 0 || key.length > 64) continue;
    if (typeof value === "string") {
      if (value.length > 0 && value.length <= 500) out[key] = value;
    } else if (Array.isArray(value)) {
      const arr = value
        .filter(
          (v): v is string =>
            typeof v === "string" && v.length > 0 && v.length <= 200,
        )
        .slice(0, 32);
      if (arr.length > 0) out[key] = arr;
    }
  }
  return out;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const program = await lookupPublishedProgram(slug);

    if (!program) {
      return NextResponse.json(
        { error: "Kelas tidak ditemukan atau belum dibuka." },
        { status: 404 },
      );
    }

    const body = (await request.json()) as AcademyRegisterPayload;

    // Bio contract: full_name + whatsapp + email + password are mandatory so the
    // trigger never materializes an 'Unknown'/NULL candidate.
    const required = ["full_name", "whatsapp", "email", "password"] as const;
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field ${field} wajib diisi.` },
          { status: 400 },
        );
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 },
      );
    }

    if (!validatePasswordServer(body.password)) {
      return NextResponse.json(
        {
          error:
            "Password minimal 10 karakter dengan huruf besar, huruf kecil, dan angka.",
        },
        { status: 400 },
      );
    }

    // Gender + tanggal lahir masuk kolom kandidat yang dijaga CHECK dan cast
    // DATE di trigger, yang tidak punya penanganan error. Nilai buruk yang lolos
    // dari sini tidak gagal sekarang, tapi nanti saat pendaftar mengklik link
    // verifikasi, dan waktu itu tidak ada satu pun layar yang bisa memberitahunya.
    if (body.gender && !GENDER_VALUES.has(body.gender)) {
      return NextResponse.json({ error: "Pilihan jenis kelamin tidak valid." }, { status: 400 });
    }
    if (body.birth_date) {
      const bd = body.birth_date;
      const parsed = new Date(`${bd}T00:00:00Z`);
      if (
        !ISO_DATE_RE.test(bd) ||
        Number.isNaN(parsed.getTime()) ||
        bd < BIRTH_MIN ||
        bd > BIRTH_MAX
      ) {
        return NextResponse.json({ error: "Tanggal lahir tidak valid." }, { status: 400 });
      }
    }

    // PDP UU 27/2022 Pasal 20: consent must be affirmative. Re-checked here so a
    // client that skips the checkbox (or posts straight to the API) cannot have
    // a consent row written on its behalf.
    if (body.consent_granted !== true) {
      return NextResponse.json(
        { error: ACADEMY_CONSENT_REQUIRED_MSG },
        { status: 400 },
      );
    }

    // Screening answers are validated against what the program actually
    // declares, not just shape-checked. See validateAnswers (finding K1).
    const fields = await lookupRegistrationFields(slug);
    const validated = validateAnswers(fields, sanitizeAnswers(body.answers));
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const email = body.email.toLowerCase().trim();

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    // Rate limit. This endpoint writes pending_submissions + consents BEFORE
    // signUp, and every call triggers a Supabase Auth verification email, so an
    // unthrottled loop both bloats those tables and burns the auth email quota
    // shared with the job-application flow. Reuses check_apply_rate_limit, which
    // already counts pending_submissions by email and IP regardless of intent.
    // Audit 2026-07-21, finding K2.
    try {
      // supabase-js swallows a throw here (fail-open), so bind the call the same
      // way the lowongan route does or the limit silently never runs.
      const rlDb = supabaseV2();
      const rpc = rlDb.rpc.bind(rlDb) as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: boolean | null; error: { message: string } | null }>;
      const { data: underLimit, error: rlErr } = await rpc(
        "check_apply_rate_limit",
        { p_email: email, p_ip: clientIp },
      );
      if (!rlErr && underLimit === false) {
        return NextResponse.json(
          { error: "Terlalu banyak percobaan. Coba lagi dalam beberapa menit." },
          { status: 429 },
        );
      }
    } catch {
      // ignore - fail open
    }

    // Step 1: stage the academy pending. Trigger materializes the enrollment on
    // email_confirmed_at flip.
    // CV staged (permintaan Ifa 3 Agu). `pendingId` harus dipakai sebagai PK
    // supaya sama dengan `pending/<id>/` tempat filenya diunggah; kalau tidak,
    // trigger tidak akan pernah menemukan filenya dan purge orphan 48 jam
    // menghapusnya diam-diam.
    const pendingId =
      typeof body.pending_id === "string" && UUID_RE.test(body.pending_id)
        ? body.pending_id
        : null;
    const stagedCv = sanitizeCv(body.cv, pendingId);

    const writeResult = await writePendingSubmission(
      {
        intent: "academy",
        ...(pendingId ? { pendingId } : {}),
        program_slug: slug,
        email,
        phone: body.whatsapp,
        form_data: {
          full_name: body.full_name,
          whatsapp: body.whatsapp,
          email,
          city: body.city ?? null,
          birth_date: body.birth_date ?? null,
          gender: body.gender ?? null,
          education: body.education ?? null,
          program_slug: slug,
          source_url: body.source_url ?? null,
          answers: validated.answers,
          // Kunci 'cv' inilah yang dibaca blok CV di trigger. Blok itu tidak
          // melihat intent, jadi pendaftaran akademi ikut menghasilkan baris
          // candidate_documents seperti lamaran kerja, tanpa perubahan skema.
          ...(stagedCv ? { cv: stagedCv } : {}),
        },
        consents: [
          {
            // SoT import keeps shown-text (AcademyRegisterForm checkbox) ==
            // logged-text. `granted` mirrors the ticked box, not a hardcoded
            // true - the guard above already rejected anything else, so this is
            // always an affirmative record with a real user action behind it.
            purpose: ACADEMY_CONSENT_PURPOSE,
            purpose_text: ACADEMY_CONSENT_TEXT,
            version: ACADEMY_CONSENT_VERSION,
            granted: body.consent_granted === true,
          },
        ],
      },
      request,
    );

    if (!writeResult.ok) {
      console.error("[akademi] pending write failed:", writeResult.error);
      return NextResponse.json(
        { error: "Gagal menyimpan data. Coba lagi sebentar." },
        { status: 500 },
      );
    }

    // Step 2: create auth user. Same cross-subdomain redirect + _fbp/_fbc
    // forwarding as the job flow so Meta attribution survives the boundary.
    const platformBase =
      process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";
    const redirectParams = new URLSearchParams();
    if (body.fbp) redirectParams.set("fbp", body.fbp);
    if (body.fbc) redirectParams.set("fbc", body.fbc);
    const redirectQuery = redirectParams.toString();
    const emailRedirectTo = redirectQuery
      ? `${platformBase}/auth/callback?${redirectQuery}`
      : `${platformBase}/auth/callback`;

    const db = supabaseV2();
    const { error: signUpError } = await db.auth.signUp({
      email,
      password: body.password,
      options: {
        emailRedirectTo,
        data: {
          full_name: body.full_name,
          source: "academy_register",
          program_slug: slug,
        },
      },
    });

    if (signUpError) {
      // NOTE: for an already-confirmed account the trigger never fires (no
      // email_confirmed_at flip), so the staged academy pending won't
      // materialize — an existing user must enroll from inside the app
      // (enroll_in_academy_program). The message reflects that; the future
      // web register form should route this 409 → login → /akademi/[slug].
      return signUpErrorResponse(signUpError, {
        logPrefix: "[akademi]",
        emailExistsMessage:
          "Email sudah terdaftar. Masuk ke aplikasi Perantau Global, buka kelas ini, lalu klik Daftar untuk menyelesaikan pendaftaran.",
      });
    }

    if (body.eventId) {
      waitUntil(
        sendMetaEvent({
          eventName: "CompleteRegistration",
          eventId: body.eventId,
          sourceUrl:
            body.source_url ||
            request.headers.get("referer") ||
            `https://perantauglobal.com/akademi/${slug}`,
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
            content_name: `akademi_${slug}`,
            content_category: "akademi",
          },
        }),
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[akademi] unexpected error:", err);
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }
}
