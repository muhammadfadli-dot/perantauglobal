import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import { requireCandidate } from "@/lib/supabase-server";
import {
  getPublishedProgram,
  getProgramOutline,
  getMyEnrollment,
  getLessonProgress,
  hasPaidAccess,
  deriveCaps,
  capsEarned,
  psikotesStatus,
} from "@/lib/academy-db";
import { PassportProgress, ModuleStamp } from "@/components/pg/academy/PassportProgress";

export const dynamic = "force-dynamic";

/** Short, stamp-friendly module title (text before the first colon/dash). */
function shortTitle(title: string): string {
  const head = title.split(/[:—–-]/)[0]?.trim() ?? title;
  return head.length > 26 ? head.slice(0, 24).trim() + "…" : head;
}

export default async function CapModulPage({
  params,
}: {
  params: Promise<{ slug: string; n: string }>;
}) {
  const { slug, n } = await params;
  const moduleNum = Number(n);
  const { candidateId } = await requireCandidate();

  const program = await getPublishedProgram(slug);
  if (!program) notFound();

  const enrollment = await getMyEnrollment(candidateId, slug);
  if (!enrollment) redirect(`/akademi/${slug}`);
  if (!hasPaidAccess(program, enrollment)) redirect(`/akademi/${slug}?bayar=perlu`);

  const [outline, progress] = await Promise.all([
    getProgramOutline(slug),
    getLessonProgress(enrollment.id),
  ]);

  const mod = outline.find((m) => m.module_num === moduleNum);
  if (!mod) notFound();

  const doneIds = new Set(progress.filter((p) => p.status !== "failed").map((p) => p.lesson_id));

  // Only celebrate a module that is genuinely complete (guards direct nav).
  const moduleComplete = mod.lessons.length > 0 && mod.lessons.every((l) => doneIds.has(l.id));
  if (!moduleComplete) redirect(`/akademi/${slug}/modul/${moduleNum}`);

  const caps = deriveCaps(outline, doneIds);
  const earned = capsEarned(caps);
  const total = outline.length;
  const courseDone = outline.every((m) => m.lessons.every((l) => doneIds.has(l.id)));
  const moduleIdx = outline.findIndex((m) => m.module_num === moduleNum);
  const nextModule = outline[moduleIdx + 1];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <main className="flex-1 px-5 pt-12 pb-10 max-w-[640px] mx-auto w-full">
        <div className="text-center">
          <span
            className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--pa-amber-700)" }}
          >
            Cap ke-{earned} dari {total}
          </span>

          <div className="mt-6 pg-stamp-in">
            <ModuleStamp moduleNum={moduleNum} title={shortTitle(mod.title)} caption="LULUS" earned size={158} />
          </div>

          <h1 className="font-extrabold tracking-[-0.02em] text-[24px] text-pg-ink-900 mt-7 mb-0">
            Modul {moduleNum} selesai.
          </h1>
          {mod.summary && (
            <p className="text-[14px] text-pg-ink-600 leading-relaxed mt-2 max-w-[34ch] mx-auto">
              {mod.summary}
            </p>
          )}
        </div>

        <div className="mt-7">
          <PassportProgress
            caps={caps}
            pct={enrollment.progress_pct}
            psikotes={psikotesStatus(enrollment)}
            courseDone={courseDone}
            showPath={false}
          />
        </div>

        <div className="pt-7 flex flex-col gap-2.5">
          {courseDone ? (
            <Link
              href={`/akademi/${slug}`}
              className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-[15px] font-bold rounded-xl text-white no-underline"
              style={{ background: "var(--pg-ok)" }}
            >
              Paspormu penuh — lihat sertifikat
              <Icon name="arrow_right" size={18} />
            </Link>
          ) : nextModule ? (
            <Link
              href={`/akademi/${slug}/modul/${nextModule.module_num}`}
              className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-[15px] font-bold rounded-xl text-white no-underline"
              style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
            >
              Lanjut ke Modul {nextModule.module_num}
              <Icon name="arrow_right" size={18} />
            </Link>
          ) : null}
          <Link
            href={`/akademi/${slug}`}
            className="inline-flex items-center justify-center gap-2 w-full min-h-[48px] px-5 text-[14.5px] font-bold rounded-xl no-underline"
            style={{ background: "var(--pg-white)", border: "1.5px solid var(--pg-ink-200)", color: "var(--pg-ink-800)" }}
          >
            Nanti dulu — balik ke kelas
          </Link>
        </div>
      </main>

      <style>{`
        .pg-stamp-in { animation: pg-stamp-press 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes pg-stamp-press {
          0% { transform: scale(1.6) rotate(-18deg); opacity: 0; }
          60% { transform: scale(0.94) rotate(-5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) { .pg-stamp-in { animation: none; } }
      `}</style>
    </div>
  );
}
