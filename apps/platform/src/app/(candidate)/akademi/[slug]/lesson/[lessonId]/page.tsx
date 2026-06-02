import { notFound, redirect } from "next/navigation";
import { TopBarApp } from "@/components/pg/AppChrome";
import { requireCandidate } from "@/lib/supabase-server";
import {
  getPublishedProgram,
  getProgramOutline,
  getMyEnrollment,
  getLessonProgress,
  getLesson,
  flattenLessons,
  type ReadingContent,
  type QuizContent,
} from "@/lib/academy-db";
import { LessonPlayer } from "@/components/pg/academy/LessonPlayer";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const { candidateId } = await requireCandidate();

  const program = await getPublishedProgram(slug);
  if (!program) notFound();

  const enrollment = await getMyEnrollment(candidateId, slug);
  if (!enrollment) redirect(`/akademi/${slug}`);

  const [lesson, outline, progress] = await Promise.all([
    getLesson(lessonId),
    getProgramOutline(slug),
    getLessonProgress(enrollment.id),
  ]);
  if (!lesson || lesson.lesson_type === "video") notFound();

  const flat = flattenLessons(outline);
  const idx = flat.findIndex((f) => f.lesson.id === lessonId);
  if (idx === -1) notFound();
  const nextLessonId = idx + 1 < flat.length ? flat[idx + 1]!.lesson.id : null;
  const alreadyDone = progress.some((p) => p.lesson_id === lessonId);
  const moduleInfo = flat[idx]!;

  // First reading lesson of THIS module — target of the quiz "Baca lagi materi" CTA.
  const curModule = outline.find((m) => m.lessons.some((l) => l.id === lessonId));
  const moduleFirstReadingId =
    (curModule?.lessons.find((l) => l.lesson_type === "reading") ?? curModule?.lessons[0])?.id ??
    null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <TopBarApp title="Akademi" back backHref={`/akademi/${slug}`} />
      <main className="flex-1 pb-10">
        <div className="px-5 pt-4 pb-2">
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-pg-ink-500">
            Modul {moduleInfo.moduleNum} · {moduleInfo.moduleTitle}
          </span>
          <h1 className="font-extrabold tracking-[-0.02em] leading-[1.15] text-[20px] text-pg-ink-900 mt-1 mb-0">
            {lesson.title}
          </h1>
        </div>

        <LessonPlayer
          slug={slug}
          enrollmentId={enrollment.id}
          lessonId={lessonId}
          lessonType={lesson.lesson_type === "quiz" ? "quiz" : "reading"}
          readingContent={lesson.lesson_type !== "quiz" ? (lesson.content as unknown as ReadingContent) : null}
          quizContent={lesson.lesson_type === "quiz" ? (lesson.content as unknown as QuizContent) : null}
          alreadyDone={alreadyDone}
          nextLessonId={nextLessonId}
          moduleFirstReadingId={moduleFirstReadingId}
        />
      </main>
    </div>
  );
}
