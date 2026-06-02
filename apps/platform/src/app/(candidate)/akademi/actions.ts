"use server";

import { revalidatePath } from "next/cache";
import type { Json } from "@perantauglobal/db";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
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

/** Logged-in enroll: enrollment + PDP consent atomic, publish-gated. */
export async function enrollAction(
  slug: string,
  answers: Record<string, string | string[]> = {},
): Promise<ActionResult<{ enrollmentId: string }>> {
  await requireCandidate();
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

export interface QuizGrade {
  score: number;
  lesson_passed: boolean;
  pass_threshold: number;
  per_question: Record<string, boolean>;
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
