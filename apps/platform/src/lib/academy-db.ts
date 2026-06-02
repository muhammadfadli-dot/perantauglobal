import { createServerClient } from "./supabase-server";
import type {
  AcademyProgram,
  AcademyModule,
  AcademyLesson,
  AcademyEnrollment,
  AcademyLessonProgress,
  ProgramRegistrationField,
} from "@perantauglobal/db";

/**
 * Akademi Perantau — candidate-side data access (migration 0060).
 *
 * All reads go through the per-request RLS client (createServerClient), so:
 *   - programs/modules/lessons are visible only when published (or admin)
 *   - enrollments / lesson_progress are visible only for the caller's candidate
 *   - academy_lessons NEVER carries answer keys (those live in the admin-only
 *     academy_lesson_keys table), so reading lesson.content client-side is safe.
 */

// ---- content JSONB contracts (display only) ------------------------------

export interface ProgramContent {
  intro?: string;
  benefits?: string[];
  outcomes?: string[];
  for_who?: string[];
  doc_checklist?: { label: string; note?: string }[];
  instructor?: { name: string; role?: string };
}

export interface ReadingBlock {
  type: "heading" | "paragraph" | "list" | "callout" | "steps" | "stat" | "quote";
  text?: string;
  items?: string[];
  /** callout: tone */
  variant?: "tip" | "info" | "warn";
  /** callout / stat: optional bold title or label */
  title?: string;
  /** stat: the big figure + caption */
  value?: string;
  label?: string;
  sub?: string;
}
export interface ReadingContent {
  blocks: ReadingBlock[];
}

export interface QuizOption {
  key: string;
  label: string;
}
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  multiple?: boolean;
}
export interface QuizContent {
  questions: QuizQuestion[];
}

export type ModuleWithLessons = AcademyModule & { lessons: AcademyLesson[] };

// ---- queries -------------------------------------------------------------

export async function listPublishedPrograms(): Promise<AcademyProgram[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("academy_programs")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getPublishedProgram(
  slug: string,
): Promise<AcademyProgram | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("academy_programs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data ?? null;
}

export async function getProgramOutline(
  slug: string,
): Promise<ModuleWithLessons[]> {
  const supabase = await createServerClient();
  const { data: modules } = await supabase
    .from("academy_modules")
    .select("*")
    .eq("program_slug", slug)
    .order("sort_order", { ascending: true })
    .order("module_num", { ascending: true });
  const mods = modules ?? [];
  if (mods.length === 0) return [];

  const { data: lessons } = await supabase
    .from("academy_lessons")
    .select("*")
    .in(
      "module_id",
      mods.map((m) => m.id),
    )
    .order("sort_order", { ascending: true })
    .order("lesson_num", { ascending: true });
  const ls = lessons ?? [];

  return mods.map((m) => ({
    ...m,
    lessons: ls.filter((l) => l.module_id === m.id),
  }));
}

export async function getRegistrationFields(
  slug: string,
): Promise<ProgramRegistrationField[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("program_registration_fields")
    .select("*")
    .eq("program_slug", slug)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getMyEnrollment(
  candidateId: string,
  slug: string,
): Promise<AcademyEnrollment | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("academy_enrollments")
    .select("*")
    .eq("candidate_id", candidateId)
    .eq("program_slug", slug)
    .maybeSingle();
  return data ?? null;
}

export async function listMyEnrollments(
  candidateId: string,
): Promise<AcademyEnrollment[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("academy_enrollments")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("enrolled_at", { ascending: false });
  return data ?? [];
}

export async function getLessonProgress(
  enrollmentId: string,
): Promise<AcademyLessonProgress[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("academy_lesson_progress")
    .select("*")
    .eq("enrollment_id", enrollmentId);
  return data ?? [];
}

export async function getLesson(
  lessonId: string,
): Promise<AcademyLesson | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("academy_lessons")
    .select("*")
    .eq("id", lessonId)
    .maybeSingle();
  return data ?? null;
}

// ---- derived helpers -----------------------------------------------------

/** Flatten an outline into ordered lessons (for prev/next + locking). */
export function flattenLessons(
  outline: ModuleWithLessons[],
): { lesson: AcademyLesson; moduleTitle: string; moduleNum: number }[] {
  return outline.flatMap((m) =>
    m.lessons.map((lesson) => ({
      lesson,
      moduleTitle: m.title,
      moduleNum: m.module_num,
    })),
  );
}

export function progressLabel(e: AcademyEnrollment | null): string {
  if (!e) return "Belum daftar";
  switch (e.status) {
    case "registered":
      return "Belum mulai";
    case "in_progress":
      return `Lagi belajar · ${e.progress_pct}%`;
    case "completed":
      return "Selesai";
    case "passed":
      return "Lulus";
    case "failed":
      return "Belum lulus";
    case "cancelled":
      return "Dibatalkan";
    default:
      return e.status;
  }
}
