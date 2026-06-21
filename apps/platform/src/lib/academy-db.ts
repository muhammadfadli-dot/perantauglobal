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

/** Per-card illustration/audio slot (redesign). Image optional + lazy; audio menyusul. */
export interface LessonMedia {
  image_url?: string;
  alt?: string;
  audio_url?: string;
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
  /** redesign: per-card illustration/audio slot (usually on a card's lead block). */
  media?: LessonMedia;
  /** redesign: explicit card grouping; overrides heading-based chunking when present. */
  chunk?: number;
  /** redesign: stable deep-link target for the quiz "Baca lagi" jump. */
  anchor?: string;
}
export interface ReadingContent {
  blocks: ReadingBlock[];
}

/** Module intro content (redesign) — drives the new Intro Modul screen. */
export interface ModuleContent {
  outcomes?: string[];
  est_minutes?: number;
}

/**
 * A reading lesson split into tap-next "cards" (one idea per screen). Splits on
 * explicit `chunk` markers when present, else on `heading` blocks, so EXISTING
 * un-chunked content (e.g. the free finansial course) still chunks sensibly —
 * never breaks, always returns at least one card for non-empty input.
 */
export interface ReadingCard {
  blocks: ReadingBlock[];
  media: LessonMedia | null;
  anchor: string | null;
}
export function chunkBlocks(blocks: ReadingBlock[] | null | undefined): ReadingCard[] {
  const all = blocks ?? [];
  if (all.length === 0) return [];

  const toCard = (bs: ReadingBlock[]): ReadingCard => ({
    blocks: bs,
    media: bs.find((b) => b.media)?.media ?? null,
    anchor: bs.find((b) => b.anchor)?.anchor ?? null,
  });

  // Explicit chunk markers win (fine-grained authoring control).
  if (all.some((b) => typeof b.chunk === "number")) {
    const groups = new Map<number, ReadingBlock[]>();
    let last = 0;
    for (const b of all) {
      const c = typeof b.chunk === "number" ? b.chunk : last;
      last = c;
      const g = groups.get(c);
      if (g) g.push(b);
      else groups.set(c, [b]);
    }
    return [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([, bs]) => toCard(bs));
  }

  // Default: a new card starts at each heading (blocks before the first heading
  // form a lead card).
  const cards: ReadingBlock[][] = [];
  let cur: ReadingBlock[] = [];
  for (const b of all) {
    if (b.type === "heading" && cur.length > 0) {
      cards.push(cur);
      cur = [];
    }
    cur.push(b);
  }
  if (cur.length > 0) cards.push(cur);
  return cards.length > 0 ? cards.map(toCard) : [toCard(all)];
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

/**
 * Whether the candidate may access lesson content. Free programs are always open;
 * paid programs require a settled payment (or an admin waiver). Keep ALL candidate
 * access decisions keyed off this — never trust the client.
 */
export function hasPaidAccess(
  program: Pick<AcademyProgram, "is_free">,
  enrollment: Pick<AcademyEnrollment, "payment_status"> | null,
): boolean {
  if (program.is_free) return true;
  if (!enrollment) return false;
  return (
    enrollment.payment_status === "paid" || enrollment.payment_status === "waived"
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

// ---- redesign: passport caps + psikotes + resume --------------------------

export type CapStatus = "done" | "current" | "future";
export interface ModuleCap {
  moduleNum: number;
  title: string;
  status: CapStatus;
  doneLessons: number;
  totalLessons: number;
}

/**
 * Per-module "stamps" for the passport-progress UI, derived purely from
 * lesson_progress (no extra column). A module is `done` when all its lessons are
 * complete, `current` when it holds the first incomplete lesson, else `future`.
 * `doneIds` = lesson ids the candidate has completed (failed quizzes excluded —
 * same set the outline uses so caps and lesson rows never disagree).
 */
export function deriveCaps(
  outline: ModuleWithLessons[],
  doneIds: Set<string>,
): ModuleCap[] {
  const flat = flattenLessons(outline);
  const firstIncomplete = flat.findIndex((f) => !doneIds.has(f.lesson.id));
  const currentModuleNum =
    firstIncomplete === -1 ? null : flat[firstIncomplete]!.moduleNum;
  return outline.map((m) => {
    const total = m.lessons.length;
    const done = m.lessons.filter((l) => doneIds.has(l.id)).length;
    let status: CapStatus;
    if (total > 0 && done === total) status = "done";
    else if (currentModuleNum != null && m.module_num < currentModuleNum) status = "done";
    else if (m.module_num === currentModuleNum) status = "current";
    else status = "future";
    return {
      moduleNum: m.module_num,
      title: m.title,
      status,
      doneLessons: done,
      totalLessons: total,
    };
  });
}

export function capsEarned(caps: ModuleCap[]): number {
  return caps.filter((c) => c.status === "done").length;
}

/** External psikotes leg of the Paspor (reuses enrollment.external_status). */
export type PsikotesStatus = "not_started" | "scheduled" | "done";
export function psikotesStatus(
  e: Pick<AcademyEnrollment, "external_status"> | null,
): PsikotesStatus {
  const s = (e?.external_status ?? "").toLowerCase();
  if (s === "done" || s === "completed" || s === "passed") return "done";
  if (s === "scheduled" || s === "in_progress" || s === "pending") return "scheduled";
  return "not_started";
}

/**
 * The candidate's single best "lanjutkan belajar" card for the Beranda — the
 * most recent in-progress (else registered) enrollment, enriched with caps +
 * resume target. Returns null when there's nothing to resume (→ show the invite
 * card instead). Does the extra outline/progress fetch ONLY when there's an
 * active enrollment, so the common "no class yet" path stays cheap.
 */
export interface AcademyResume {
  slug: string;
  programTitle: string;
  isFree: boolean;
  paid: boolean;
  pct: number;
  caps: ModuleCap[];
  resume: ResumeTarget | null;
  courseDone: boolean;
}
export async function getActiveAcademyResume(
  candidateId: string,
): Promise<AcademyResume | null> {
  const enrollments = await listMyEnrollments(candidateId);
  const active =
    enrollments.find((e) => e.status === "in_progress") ??
    enrollments.find((e) => e.status === "registered");
  if (!active) return null;

  const program = await getPublishedProgram(active.program_slug);
  if (!program) return null;

  const [outline, progress] = await Promise.all([
    getProgramOutline(active.program_slug),
    getLessonProgress(active.id),
  ]);
  const doneIds = new Set(progress.filter((p) => p.status !== "failed").map((p) => p.lesson_id));
  const courseDone =
    outline.length > 0 && outline.every((m) => m.lessons.every((l) => doneIds.has(l.id)));
  return {
    slug: program.slug,
    programTitle: program.title,
    isFree: program.is_free,
    paid: hasPaidAccess(program, active),
    pct: active.progress_pct,
    caps: deriveCaps(outline, doneIds),
    resume: resumeTarget(outline, doneIds),
    courseDone,
  };
}

/** "Lanjut dari terakhir" target: first incomplete lesson (or last when done). */
export interface ResumeTarget {
  lessonId: string;
  lessonTitle: string;
  moduleNum: number;
  moduleTitle: string;
  lessonIndex: number; // 1-based, across the whole course
  totalLessons: number;
  courseDone: boolean;
}
export function resumeTarget(
  outline: ModuleWithLessons[],
  doneIds: Set<string>,
): ResumeTarget | null {
  const flat = flattenLessons(outline);
  if (flat.length === 0) return null;
  const idx = flat.findIndex((f) => !doneIds.has(f.lesson.id));
  const courseDone = idx === -1;
  const useIdx = courseDone ? flat.length - 1 : idx;
  const f = flat[useIdx]!;
  return {
    lessonId: f.lesson.id,
    lessonTitle: f.lesson.title,
    moduleNum: f.moduleNum,
    moduleTitle: f.moduleTitle,
    lessonIndex: useIdx + 1,
    totalLessons: flat.length,
    courseDone,
  };
}
