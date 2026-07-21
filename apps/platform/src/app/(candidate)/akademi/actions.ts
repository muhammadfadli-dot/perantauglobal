"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import type { Json } from "@perantauglobal/db";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { getPublishedProgram, getMyEnrollment, isScreenedProgram } from "@/lib/academy-db";
import { createXenditInvoice } from "@/lib/xendit";
import {
  ACADEMY_CONSENT_TEXT,
  ACADEMY_CONSENT_VERSION,
} from "@/lib/academy-consent";

/**
 * Akademi Perantau — candidate server actions (migration 0060).
 *
 * All mutations go through SECURITY DEFINER RPCs so the DB enforces ownership,
 * publish-gating, consent, and quiz-answer-key secrecy. We surface user-facing
 * failures as a discriminated union (no thrown strings — Next.js strips those in
 * prod) per the project's server-action error pattern.
 */

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function mapError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("not open for registration")) return "Kelas ini belum dibuka untuk pendaftaran.";
  if (m.includes("program not found")) return "Kelas tidak ditemukan.";
  if (m.includes("no candidate")) return "Akun belum siap. Coba muat ulang halaman.";
  if (m.includes("not authorized")) return "Kamu tidak punya akses ke kelas ini.";
  if (m.includes("answer key")) return "Kuis ini belum siap dinilai. Hubungi admin.";
  return "Ada kendala. Coba lagi sebentar.";
}

/**
 * Logged-in enroll: enrollment + PDP consent atomic, publish-gated.
 *
 * `consent` is the candidate's affirmative tick in EnrollPanel (default
 * UNCHECKED). It is re-validated here, not just client-side: a server action is
 * a POST endpoint, so without this guard a direct invocation would enroll AND
 * write a `consents` row carrying the full ACADEMY_CONSENT_TEXT with no user
 * action behind it. Same defence-in-depth as `input.agreed` in the apply action
 * (applications/new/actions.ts). The RPC is only reached once consent is
 * exactly true, so p_consent_text can never be logged for an unticked box.
 */
export async function enrollAction(
  slug: string,
  answers: Record<string, string | string[]> = {},
  consent: boolean = false,
): Promise<ActionResult<{ enrollmentId: string }>> {
  await requireCandidate();
  // Strict === true: over the wire an omitted arg arrives as undefined, and only
  // a genuine tick may produce a consent row (PDP UU 27/2022 Pasal 20).
  if (consent !== true) {
    return { ok: false, error: "Centang persetujuan dulu ya." };
  }
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("enroll_in_academy_program", {
    p_program_slug: slug,
    p_answers: answers as unknown as Json,
    p_consent_text: ACADEMY_CONSENT_TEXT,
    p_consent_version: ACADEMY_CONSENT_VERSION,
  });
  if (error) return { ok: false, error: mapError(error.message) };
  revalidatePath(`/akademi/${slug}`);
  revalidatePath("/akademi");
  return { ok: true, data: { enrollmentId: data as string } };
}

/** Mark a reading lesson complete. */
export async function completeReadingAction(
  slug: string,
  enrollmentId: string,
  lessonId: string,
): Promise<ActionResult<undefined>> {
  await requireCandidate();
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("complete_academy_reading", {
    p_enrollment_id: enrollmentId,
    p_lesson_id: lessonId,
  });
  if (error) return { ok: false, error: mapError(error.message) };
  revalidatePath(`/akademi/${slug}`);
  return { ok: true, data: undefined };
}

export interface QuizFeedback {
  /** Per picked-and-wrong option key → why that choice is risky. Never includes
   *  correct options, so the answer key stays secret + retry stays meaningful. */
  rationale?: Record<string, string>;
  reread_anchor?: string | null;
}
export interface QuizGrade {
  score: number;
  lesson_passed: boolean;
  pass_threshold: number;
  per_question: Record<string, boolean>;
  /** Present only for questions answered wrong. */
  feedback?: Record<string, QuizFeedback>;
}

/** Grade a quiz lesson. Answer keys never leave the DB; only the result returns. */
export async function gradeQuizAction(
  slug: string,
  enrollmentId: string,
  lessonId: string,
  answers: Record<string, string[]>,
): Promise<ActionResult<QuizGrade>> {
  await requireCandidate();
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("grade_academy_quiz", {
    p_enrollment_id: enrollmentId,
    p_lesson_id: lessonId,
    p_answers: answers as unknown as Json,
  });
  if (error) return { ok: false, error: mapError(error.message) };
  revalidatePath(`/akademi/${slug}`);
  return { ok: true, data: data as unknown as QuizGrade };
}

/**
 * Create a Xendit invoice for a PAID program the candidate is already enrolled
 * in, and return the hosted invoice URL to redirect to. We only record the
 * invoice id as 'pending' here — the `xendit-webhook` edge function flips
 * payment_status to 'paid'. Candidates can never self-mark paid.
 */
export async function createPaymentInvoiceAction(
  slug: string,
): Promise<ActionResult<{ invoiceUrl: string }>> {
  const { candidateId, session } = await requireCandidate();

  const program = await getPublishedProgram(slug);
  if (!program) return { ok: false, error: "Kelas tidak ditemukan." };
  // Sertifikat Perantau and friends: the fee is quoted after screening and paid
  // directly to the training partner, so this app must never mint an invoice for
  // them. Guarded explicitly rather than relying on `price` being unset, so that
  // filling in a price later cannot silently open a checkout.
  if (isScreenedProgram(program)) {
    return {
      ok: false,
      error:
        "Program ini tidak dibayar lewat aplikasi. Tim Perantau Global akan menginformasikan biaya dan cara pembayarannya setelah kamu lolos screening.",
    };
  }

  if (program.is_free || !program.price || program.price <= 0) {
    return { ok: false, error: "Kelas ini tidak berbayar." };
  }

  const enrollment = await getMyEnrollment(candidateId, slug);
  if (!enrollment) return { ok: false, error: "Daftar dulu sebelum membayar." };
  if (
    enrollment.payment_status === "paid" ||
    enrollment.payment_status === "waived"
  ) {
    return { ok: false, error: "Pembayaran kamu sudah lunas." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.perantauglobal.com";
  const externalId = `paspor:${enrollment.id}:${randomUUID()}`;

  let invoice;
  try {
    invoice = await createXenditInvoice({
      externalId,
      amount: program.price,
      description: `Paspor Perantau Global — ${program.title}`,
      payerEmail: session.email ?? undefined,
      successRedirectUrl: `${appUrl}/akademi/${slug}?bayar=sukses`,
      failureRedirectUrl: `${appUrl}/akademi/${slug}?bayar=gagal`,
    });
  } catch {
    return { ok: false, error: "Gagal membuat tagihan. Coba lagi sebentar." };
  }

  // Record the invoice as pending (best-effort: the webhook matches by
  // external_id regardless, so a failure here is non-fatal — still redirect).
  const supabase = await createServerClient();
  await supabase.rpc("set_academy_enrollment_payment_pending", {
    p_enrollment_id: enrollment.id,
    p_payment_ref: invoice.id,
  });

  return { ok: true, data: { invoiceUrl: invoice.invoice_url } };
}
