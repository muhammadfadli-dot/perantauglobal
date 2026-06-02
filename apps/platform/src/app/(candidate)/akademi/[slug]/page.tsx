import { notFound } from "next/navigation";
import Link from "next/link";
import { BottomNav, TopBarApp } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import { requireCandidate } from "@/lib/supabase-server";
import {
  getPublishedProgram,
  getProgramOutline,
  getMyEnrollment,
  getLessonProgress,
  getRegistrationFields,
  flattenLessons,
  type ProgramContent,
} from "@/lib/academy-db";
import { EnrollPanel } from "@/components/pg/academy/EnrollPanel";
import type { AcademyEnrollment } from "@perantauglobal/db";

export const dynamic = "force-dynamic";

const MODE_LABEL: Record<string, string> = {
  in_app: "Belajar di aplikasi",
  webinar: "Webinar live",
  offline: "Tatap muka",
  external: "Tes eksternal",
};
const OUTPUT_LABEL: Record<string, string> = {
  certificate: "Sertifikat",
  psikotes_result: "Hasil psikotes",
  completion: "Bukti penyelesaian",
  none: "—",
};

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { candidateId } = await requireCandidate();

  const program = await getPublishedProgram(slug);
  if (!program) notFound();

  const [outline, enrollment, fields] = await Promise.all([
    getProgramOutline(slug),
    getMyEnrollment(candidateId, slug),
    getRegistrationFields(slug),
  ]);
  const progress = enrollment ? await getLessonProgress(enrollment.id) : [];
  const content = (program.content ?? {}) as ProgramContent;

  const flat = flattenLessons(outline);
  // A failed quiz is NOT "done" for navigation — it must remain reachable as the
  // current lesson so the retry CTA shows (otherwise a failed last quiz looks
  // finished with no way forward).
  const doneIds = new Set(
    progress.filter((p) => p.status !== "failed").map((p) => p.lesson_id),
  );
  const failedIds = new Set(
    progress.filter((p) => p.status === "failed").map((p) => p.lesson_id),
  );
  const firstIncomplete = flat.findIndex((f) => !doneIds.has(f.lesson.id));
  const currentIdx = firstIncomplete === -1 ? flat.length : firstIncomplete;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <TopBarApp title="Akademi" back backHref="/akademi" />
      <main className="flex-1 pb-10">
        {/* Hero */}
        <div
          className="px-5 pt-5 pb-6 text-white"
          style={{
            background: program.cover_image
              ? `linear-gradient(135deg, rgba(110,73,6,0.55), rgba(110,73,6,0.80)), url(${program.cover_image})`
              : "linear-gradient(135deg, var(--pa-amber-600), var(--pa-amber-700))",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] opacity-90">
            {MODE_LABEL[program.delivery_mode] ?? program.delivery_mode} · {program.facilitated_by}
          </span>
          <h1 className="font-extrabold tracking-[-0.02em] leading-[1.12] text-[22px] mt-1.5 mb-0" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.25)" }}>
            {program.title}
          </h1>
          {program.subtitle && (
            <p className="text-[13px] opacity-90 mt-1.5 mb-0">{program.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <HeroChip>{program.is_free ? "Gratis" : program.price ? `Rp${program.price.toLocaleString("id-ID")}` : "Berbayar"}</HeroChip>
            {program.duration_label && <HeroChip>{program.duration_label}</HeroChip>}
            <HeroChip>Output: {OUTPUT_LABEL[program.output_type] ?? program.output_type}</HeroChip>
          </div>
        </div>

        <div className="px-5 -mt-3">
          {/* Progress / status card when enrolled */}
          {enrollment && <StatusCard enrollment={enrollment} />}
        </div>

        {/* Intro + benefits */}
        {content.intro && (
          <Section>
            <p className="text-[14px] text-pg-ink-700 leading-relaxed m-0">{content.intro}</p>
          </Section>
        )}
        {content.benefits && content.benefits.length > 0 && (
          <Section title="Yang kamu dapat">
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">
              {content.benefits.map((b, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] text-pg-ink-700">
                  <span style={{ color: "var(--pa-amber-600)", marginTop: 1 }}>
                    <Icon name="check" size={16} stroke={2.6} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </Section>
        )}
        {content.doc_checklist && content.doc_checklist.length > 0 && (
          <Section title="Siapin dokumen ini">
            <div className="flex flex-col gap-2">
              {content.doc_checklist.map((d, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-[12px]"
                  style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)" }}
                >
                  <span style={{ color: "var(--pg-ink-400)", marginTop: 1 }}>
                    <Icon name="doc" size={16} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-pg-ink-800">{d.label}</span>
                    {d.note && <span className="text-[11.5px] text-pg-ink-500">{d.note}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Outline (visible to everyone; lessons open only when enrolled) */}
        {outline.length > 0 && (
          <Section title={`Materi · ${flat.length} pelajaran`}>
            <div className="flex flex-col gap-4">
              {outline.map((m) => (
                <div key={m.id}>
                  <div className="text-[12px] font-bold uppercase tracking-[0.06em] text-pg-ink-500 mb-1.5">
                    Modul {m.module_num} · {m.title}
                  </div>
                  <div className="flex flex-col gap-2">
                    {m.lessons.map((lesson) => {
                      const idx = flat.findIndex((f) => f.lesson.id === lesson.id);
                      const isDone = doneIds.has(lesson.id);
                      const isFailed = failedIds.has(lesson.id);
                      const isCurrent = idx === currentIdx;
                      const locked = !enrollment || (idx > currentIdx && !isDone);
                      return (
                        <LessonRow
                          key={lesson.id}
                          slug={slug}
                          lessonId={lesson.id}
                          title={lesson.title}
                          type={lesson.lesson_type}
                          minutes={lesson.estimated_minutes}
                          done={isDone}
                          failed={isFailed}
                          current={isCurrent && Boolean(enrollment)}
                          locked={locked}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Enroll panel (not enrolled) */}
        {!enrollment && (
          <Section title="Daftar kelas ini">
            <EnrollPanel
              slug={slug}
              fields={fields.map((f) => ({
                key: f.field_key,
                label: f.field_label,
                help: f.field_help,
                type: f.field_type,
                options: (f.options as { value: string; label: string }[] | null) ?? null,
                required: f.required,
              }))}
              isFree={program.is_free}
            />
          </Section>
        )}

        {/* Continue CTA (enrolled, in progress) */}
        {enrollment && currentIdx < flat.length && (
          <div className="px-5 pt-2">
            <Link
              href={`/akademi/${slug}/lesson/${flat[currentIdx]!.lesson.id}`}
              className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-base font-bold rounded-xl text-white no-underline"
              style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
            >
              {currentIdx === 0 ? "Mulai belajar" : "Lanjutkan belajar"}
              <Icon name="arrow_right" size={18} />
            </Link>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function StatusCard({ enrollment }: { enrollment: AcademyEnrollment }) {
  const passed = enrollment.status === "passed";
  const completed = enrollment.status === "completed";
  const failed = enrollment.status === "failed";
  return (
    <div
      className="rounded-[16px] p-4"
      style={{
        background: "var(--pg-white)",
        border: "1px solid var(--pg-ink-100)",
        boxShadow: "0 8px 24px rgba(20,16,12,0.06)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-pg-ink-500">
          {passed ? "Lulus" : completed ? "Selesai" : failed ? "Belum lulus" : "Progress kamu"}
        </span>
        <span className="font-mono text-[12px] font-bold" style={{ color: "var(--pa-amber-700)" }}>
          {enrollment.progress_pct}%
        </span>
      </div>
      <div className="mt-2 h-2 bg-pg-ink-50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${enrollment.progress_pct}%`,
            background: failed
              ? "var(--pg-err)"
              : "linear-gradient(90deg, var(--pa-amber-500), var(--pa-amber-600))",
          }}
        />
      </div>
      {(passed || completed) && enrollment.certificate_id && (
        <div className="mt-3 flex items-center gap-2 text-[12.5px] text-pg-ink-700">
          <span style={{ color: "var(--pa-amber-700)", display: "inline-flex" }}>
            <Icon name="sparkle" size={15} />
          </span>
          Sertifikat terbit · <span className="font-mono font-bold">{enrollment.certificate_id}</span>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="px-5 pt-6">
      {title && (
        <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-pg-ink-900 m-0 mb-2.5">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function HeroChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded font-mono text-[10.5px] font-bold tracking-[0.03em]"
      style={{ background: "rgba(255,255,255,0.22)", color: "#fff" }}
    >
      {children}
    </span>
  );
}

function LessonRow({
  slug,
  lessonId,
  title,
  type,
  minutes,
  done,
  failed,
  current,
  locked,
}: {
  slug: string;
  lessonId: string;
  title: string;
  type: string;
  minutes: number | null;
  done: boolean;
  failed: boolean;
  current: boolean;
  locked: boolean;
}) {
  const icon = done ? "check" : failed ? "warn" : type === "quiz" ? "sparkle" : "doc";
  const inner = (
    <>
      <span
        className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0 text-white"
        style={{
          background: done
            ? "var(--pg-ok)"
            : failed
              ? "var(--pg-err)"
              : locked
                ? "var(--pg-ink-200)"
                : "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))",
        }}
      >
        <Icon name={locked ? "lock" : icon} size={16} stroke={done ? 3 : 2} />
      </span>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[13.5px] font-semibold text-pg-ink-800 truncate">{title}</span>
        <span className="text-[11px] text-pg-ink-500">
          {type === "quiz" ? "Kuis" : "Bacaan"}
          {minutes ? ` · ${minutes} mnt` : ""}
          {failed ? " · belum lulus, coba lagi" : current ? " · lanjut di sini" : ""}
        </span>
      </div>
      {!locked && !done && <Icon name="chevron_right" size={16} className="text-pg-ink-400" />}
      {locked && (
        <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] text-pg-ink-400">
          Terkunci
        </span>
      )}
    </>
  );

  const cls =
    "flex items-center gap-3 p-3 rounded-[12px] bg-pg-white text-pg-ink-900";
  const style = {
    border: failed
      ? "1px solid var(--pg-err)"
      : current
        ? "1px solid var(--pa-amber-300)"
        : "1px solid var(--pg-ink-100)",
    opacity: locked ? 0.65 : 1,
  };

  if (locked) {
    return (
      <div className={cls} style={style}>
        {inner}
      </div>
    );
  }
  return (
    <Link href={`/akademi/${slug}/lesson/${lessonId}`} className={`${cls} no-underline`} style={style}>
      {inner}
    </Link>
  );
}
