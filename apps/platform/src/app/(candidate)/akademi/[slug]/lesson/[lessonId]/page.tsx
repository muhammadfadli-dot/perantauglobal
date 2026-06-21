import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import { requireCandidate } from "@/lib/supabase-server";
import { waLink } from "@/lib/contact";
import {
  getPublishedProgram,
  getProgramOutline,
  getMyEnrollment,
  getLessonProgress,
  getLesson,
  flattenLessons,
  hasPaidAccess,
  chunkBlocks,
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
  // Paid programs: no lesson access until payment settles (or admin waives).
  if (!hasPaidAccess(program, enrollment)) redirect(`/akademi/${slug}?bayar=perlu`);

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

  // Module the lesson belongs to → drives cap ceremony + "last in module".
  const curModule = outline.find((m) => m.lessons.some((l) => l.id === lessonId));
  const moduleNum = curModule?.module_num ?? moduleInfo.moduleNum;
  // The passport "cap" ceremony is a Paspor-product moment; other courses simply
  // advance to the next lesson at a module boundary.
  const isPaspor = program.category === "paspor";
  const isLastInModule =
    isPaspor && curModule
      ? curModule.lessons[curModule.lessons.length - 1]?.id === lessonId
      : false;
  const capHref = `/akademi/${slug}/modul/${moduleNum}/selesai`;

  // First reading lesson of THIS module — fallback target of the "Baca lagi" CTA.
  const moduleFirstReadingId =
    (curModule?.lessons.find((l) => l.lesson_type === "reading") ?? curModule?.lessons[0])?.id ??
    null;

  const isQuiz = lesson.lesson_type === "quiz";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      {/* Sticky header: back · spatial anchor · in-lesson WhatsApp help (weak-spot #9) */}
      <header
        className="sticky top-0 z-30 px-4"
        style={{
          background: "linear-gradient(180deg, #fffefa 0%, var(--pg-paper) 100%)",
          boxShadow: "0 1px 0 rgba(20,20,20,0.04), 0 4px 12px rgba(20,20,20,0.04)",
        }}
      >
        <div
          className="min-h-[60px] py-3"
          style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", alignItems: "center", gap: 8 }}
        >
          <Link
            href={`/akademi/${slug}`}
            className="w-10 h-10 rounded-[12px] grid place-items-center text-pg-ink-900 no-underline"
            style={{ background: "var(--pg-white)", border: "1px solid var(--pg-border)" }}
            aria-label="Kembali ke kelas"
          >
            <Icon name="arrow_left" size={20} />
          </Link>
          <div className="text-center font-extrabold text-[14px] tracking-[-0.01em] text-pg-ink-900">
            {isQuiz ? "Kuis · " : ""}Pelajaran {idx + 1} / {flat.length}
          </div>
          <a
            href={waLink("Halo Perantau Global, saya butuh bantuan saat belajar di Akademi.")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-full no-underline shrink-0"
            style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
            aria-label="Bantuan lewat WhatsApp"
          >
            <Icon name="phone" size={14} />
            <span className="text-[11px] font-bold">Bantuan</span>
          </a>
        </div>
      </header>

      <main className="flex-1 pb-10">
        <div className="px-5 pt-4 pb-2 max-w-[640px] mx-auto">
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
          lessonType={isQuiz ? "quiz" : "reading"}
          readingCards={
            !isQuiz ? chunkBlocks((lesson.content as unknown as ReadingContent).blocks) : null
          }
          quizContent={isQuiz ? (lesson.content as unknown as QuizContent) : null}
          alreadyDone={alreadyDone}
          nextLessonId={nextLessonId}
          moduleFirstReadingId={moduleFirstReadingId}
          isLastInModule={isLastInModule}
          capHref={capHref}
        />
      </main>
    </div>
  );
}
