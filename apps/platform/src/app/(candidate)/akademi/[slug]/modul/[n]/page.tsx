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
  type ModuleContent,
} from "@/lib/academy-db";
import { ModuleStamp } from "@/components/pg/academy/PassportProgress";

export const dynamic = "force-dynamic";

export default async function ModuleIntroPage({
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

  const moduleIdx = outline.findIndex((m) => m.module_num === moduleNum);
  const content = (mod.content ?? {}) as ModuleContent;
  const doneIds = new Set(progress.filter((p) => p.status !== "failed").map((p) => p.lesson_id));
  const failedIds = new Set(progress.filter((p) => p.status === "failed").map((p) => p.lesson_id));

  const estMinutes =
    content.est_minutes ?? mod.lessons.reduce((s, l) => s + (l.estimated_minutes ?? 0), 0);
  const outcomes = content.outcomes ?? [];

  // CTA target: first not-done lesson in this module (or first lesson).
  const firstIncomplete = mod.lessons.find((l) => !doneIds.has(l.id));
  const ctaLesson = firstIncomplete ?? mod.lessons[0];
  const started = mod.lessons.some((l) => doneIds.has(l.id) || failedIds.has(l.id));
  const allDone = mod.lessons.length > 0 && mod.lessons.every((l) => doneIds.has(l.id));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <header
        className="sticky top-0 z-30 px-4"
        style={{
          background: "linear-gradient(180deg, #fffefa 0%, var(--pg-paper) 100%)",
          boxShadow: "0 1px 0 rgba(20,20,20,0.04), 0 4px 12px rgba(20,20,20,0.04)",
        }}
      >
        <div
          className="min-h-[60px] py-3"
          style={{ display: "grid", gridTemplateColumns: "40px 1fr 40px", alignItems: "center", gap: 8 }}
        >
          <Link
            href={`/akademi/${slug}`}
            className="w-10 h-10 rounded-[12px] grid place-items-center text-pg-ink-900 no-underline"
            style={{ background: "var(--pg-white)", border: "1px solid var(--pg-border)" }}
            aria-label="Kembali ke kelas"
          >
            <Icon name="arrow_left" size={20} />
          </Link>
          <div className="text-center font-extrabold text-[14px] text-pg-ink-900">
            Modul {moduleNum} dari {outline.length}
          </div>
          <div />
        </div>
      </header>

      <main className="flex-1 pb-10 max-w-[640px] mx-auto w-full">
        <div className="px-5 pt-6 pb-2 flex flex-col items-center text-center">
          <ModuleStamp moduleNum={moduleNum} size={118} />
          <h1 className="font-extrabold tracking-[-0.02em] leading-[1.12] text-[22px] text-pg-ink-900 mt-5 mb-0 text-balance">
            {mod.title}
          </h1>
          <div className="font-mono text-[11.5px] text-pg-ink-500 mt-2">
            {mod.lessons.length} pelajaran · ±{estMinutes} menit · bisa dicicil
          </div>
        </div>

        {mod.summary && (
          <p className="px-5 text-[14px] text-pg-ink-700 leading-relaxed text-center mt-2">
            {mod.summary}
          </p>
        )}

        {outcomes.length > 0 && (
          <section className="px-5 pt-6">
            <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-pg-ink-900 m-0 mb-3">
              Selesai modul ini, kamu bisa
            </h2>
            <ul className="flex flex-col gap-2.5 m-0 p-0 list-none">
              {outcomes.map((o, i) => (
                <li key={i} className="flex gap-2.5 text-[14px] text-pg-ink-700 leading-relaxed">
                  <span
                    className="grid place-items-center w-5 h-5 rounded-full shrink-0 mt-0.5"
                    style={{ background: "var(--pa-amber-100)", color: "var(--pa-amber-700)" }}
                  >
                    <Icon name="check" size={12} stroke={3} />
                  </span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="px-5 pt-6">
          <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-pg-ink-900 m-0 mb-3">
            Isi modul
          </h2>
          <div className="flex flex-col gap-2">
            {mod.lessons.map((l, i) => {
              const done = doneIds.has(l.id);
              const failed = failedIds.has(l.id);
              return (
                <div
                  key={l.id}
                  className="flex items-center gap-3 p-3 rounded-[12px] bg-pg-white"
                  style={{ border: "1px solid var(--pg-ink-100)" }}
                >
                  <span
                    className="w-7 h-7 rounded-[9px] grid place-items-center shrink-0 text-white font-mono text-[12px] font-bold"
                    style={{
                      background: done
                        ? "var(--pg-ok)"
                        : failed
                          ? "var(--pg-err)"
                          : "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))",
                    }}
                  >
                    {done ? <Icon name="check" size={14} stroke={3} /> : i + 1}
                  </span>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[13.5px] font-semibold text-pg-ink-800 leading-snug">
                      {l.title}
                    </span>
                    <span className="text-[11px] text-pg-ink-500">
                      {l.lesson_type === "quiz" ? "Kuis" : "Bacaan"}
                      {l.estimated_minutes ? ` · ${l.estimated_minutes} mnt` : ""}
                      {done ? " · selesai" : failed ? " · belum lulus" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {ctaLesson && !allDone && (
          <div className="px-5 pt-7">
            <Link
              href={`/akademi/${slug}/lesson/${ctaLesson.id}`}
              className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-[15px] font-bold rounded-xl text-white no-underline"
              style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
            >
              {started ? "Lanjutkan modul" : "Mulai modul"}
              <Icon name="arrow_right" size={18} />
            </Link>
          </div>
        )}
        {allDone && (
          <div className="px-5 pt-7">
            <div
              className="rounded-[14px] p-4 flex items-center gap-3"
              style={{ background: "var(--pg-ok-bg)", border: "1px solid var(--pg-ok)" }}
            >
              <span className="w-9 h-9 rounded-full grid place-items-center text-white shrink-0" style={{ background: "var(--pg-ok)" }}>
                <Icon name="check" size={18} stroke={3} />
              </span>
              <div className="text-[13px] text-pg-ink-800 font-semibold">
                Modul ini sudah kamu selesaikan.
              </div>
            </div>
            {moduleIdx + 1 < outline.length ? (
              <Link
                href={`/akademi/${slug}/modul/${outline[moduleIdx + 1]!.module_num}`}
                className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 mt-3 text-[15px] font-bold rounded-xl text-white no-underline"
                style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
              >
                Lanjut ke Modul {outline[moduleIdx + 1]!.module_num}
                <Icon name="arrow_right" size={18} />
              </Link>
            ) : (
              <Link
                href={`/akademi/${slug}`}
                className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 mt-3 text-[15px] font-bold rounded-xl text-white no-underline"
                style={{ background: "var(--pg-ok)" }}
              >
                Lihat sertifikat
                <Icon name="arrow_right" size={18} />
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
