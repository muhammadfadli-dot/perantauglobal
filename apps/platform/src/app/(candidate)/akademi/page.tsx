import Link from "next/link";
import { BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import { BerandaTopBar, SectionHead } from "@/components/pg/candidate/BerandaShared";
import { requireCandidate } from "@/lib/supabase-server";
import {
  listPublishedPrograms,
  listMyEnrollments,
  getProgramOutline,
  getLessonProgress,
  deriveCaps,
  resumeTarget,
  psikotesStatus,
  hasPaidAccess,
  isScreenedProgram,
} from "@/lib/academy-db";
import { PassportProgress } from "@/components/pg/academy/PassportProgress";
import type { AcademyProgram, AcademyEnrollment } from "@perantauglobal/db";

export const dynamic = "force-dynamic";

const MODE_LABEL: Record<string, string> = {
  in_app: "Belajar di aplikasi",
  webinar: "Webinar live",
  offline: "Tatap muka",
  external: "Tes eksternal",
};

export default async function AkademiPage() {
  const { candidateId } = await requireCandidate();
  const [programs, enrollments] = await Promise.all([
    listPublishedPrograms(),
    listMyEnrollments(candidateId),
  ]);

  const enrolledBySlug = new Map(enrollments.map((e) => [e.program_slug, e]));
  const mine = enrollments
    .map((e) => ({ enrollment: e, program: programs.find((p) => p.slug === e.program_slug) }))
    .filter((x): x is { enrollment: AcademyEnrollment; program: AcademyProgram } => Boolean(x.program));

  // Enrich each enrolled program with passport caps + resume target.
  const myPrograms = await Promise.all(
    mine.map(async ({ enrollment, program }) => {
      const [outline, progress] = await Promise.all([
        getProgramOutline(program.slug),
        getLessonProgress(enrollment.id),
      ]);
      const doneIds = new Set(
        progress.filter((p) => p.status !== "failed").map((p) => p.lesson_id),
      );
      const caps = deriveCaps(outline, doneIds);
      const resume = resumeTarget(outline, doneIds);
      const paid = hasPaidAccess(program, enrollment);
      const courseDone =
        outline.length > 0 && outline.every((m) => m.lessons.every((l) => doneIds.has(l.id)));
      return { enrollment, program, caps, resume, paid, courseDone };
    }),
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <BerandaTopBar />
      <main className="flex-1 pb-8 pt-1">
        <div className="px-5 pb-2">
          <h1
            className="font-extrabold tracking-[-0.025em] leading-[1.1] text-pg-ink-900 m-0"
            style={{ fontSize: "clamp(22px, 6vw, 28px)" }}
          >
            Akademi Perantau
          </h1>
          <p className="text-[13px] text-pg-ink-500 mt-1 m-0">
            Kelas persiapan kerja ke luar negeri · facilitated by Daya Skill
          </p>
        </div>

        {myPrograms.length > 0 && (
          <div className="px-5 pt-4">
            <SectionHead title="Kelas saya" sub={`${myPrograms.length} kelas`} />
            <div className="flex flex-col gap-3.5">
              {myPrograms.map((x) => (
                <EnrolledCard key={x.program.slug} {...x} />
              ))}
            </div>
          </div>
        )}

        <div className="px-5 pt-6">
          <SectionHead title="Semua kelas" sub="Pilih kelas buat persiapan kamu" />
          {programs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-3">
              {programs.map((p) => (
                <ProgramCard key={p.slug} program={p} enrolled={enrolledBySlug.has(p.slug)} />
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function EnrolledCard({
  program,
  enrollment,
  caps,
  resume,
  paid,
  courseDone,
}: {
  program: AcademyProgram;
  enrollment: AcademyEnrollment;
  caps: ReturnType<typeof deriveCaps>;
  resume: ReturnType<typeof resumeTarget>;
  paid: boolean;
  courseDone: boolean;
}) {
  const hasCaps = caps.length > 0;
  const ctaHref = !paid
    ? `/akademi/${program.slug}`
    : courseDone || !resume
      ? `/akademi/${program.slug}`
      : `/akademi/${program.slug}/lesson/${resume.lessonId}`;
  const ctaLabel = isScreenedProgram(program)
    ? "Lihat status pendaftaran"
    : !paid
    ? "Selesaikan pembayaran"
    : courseDone
      ? "Lihat sertifikat"
      : resume && resume.lessonIndex > 1
        ? "Lanjutkan belajar"
        : "Mulai belajar";

  return (
    <div
      className="rounded-[16px] bg-pg-white p-4"
      style={{ border: "1px solid var(--pg-ink-100)", boxShadow: "var(--pa-shadow-card)" }}
    >
      <Link href={`/akademi/${program.slug}`} className="no-underline">
        <div className="text-[14.5px] font-extrabold tracking-[-0.01em] text-pg-ink-900 leading-snug">
          {program.title}
        </div>
        {resume && (
          <div className="text-[11.5px] text-pg-ink-500 mt-0.5">
            {courseDone
              ? "Selesai · paspor penuh"
              : `Modul ${resume.moduleNum} · Pelajaran ${resume.lessonIndex} dari ${resume.totalLessons}`}
          </div>
        )}
      </Link>

      {hasCaps && !program.is_free && (
        <div className="mt-3">
          <PassportProgress
            caps={caps}
            pct={enrollment.progress_pct}
            psikotes={psikotesStatus(enrollment)}
            courseDone={courseDone}
            showPath={false}
          />
        </div>
      )}
      {hasCaps && program.is_free && (
        <div className="mt-2.5 h-2 bg-pg-ink-50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${enrollment.progress_pct}%`,
              background: "linear-gradient(90deg, var(--pa-amber-500), var(--pa-amber-600))",
            }}
          />
        </div>
      )}

      <Link
        href={ctaHref}
        className="inline-flex items-center justify-center gap-2 w-full min-h-[46px] px-5 mt-3 text-[14px] font-bold rounded-xl text-white no-underline"
        style={{
          background: !paid
            ? "var(--pg-ink-900)"
            : "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))",
        }}
      >
        {ctaLabel}
        <Icon name="arrow_right" size={16} />
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-[14px] p-5 text-center"
      style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)" }}
    >
      <span style={{ color: "var(--pa-amber-700)", display: "inline-flex" }}>
        <Icon name="sparkle" size={24} />
      </span>
      <p className="text-[13px] text-pg-ink-600 mt-2 m-0">
        Belum ada kelas yang dibuka. Kelas pertama lagi disiapin tim Akademi Perantau.
      </p>
    </div>
  );
}

function priceLabel(p: AcademyProgram): string {
  if (p.is_free) return "Gratis";
  if (p.price && p.price > 0) return `Rp${p.price.toLocaleString("id-ID")}`;
  return "Berbayar";
}

function ProgramCard({ program: p, enrolled }: { program: AcademyProgram; enrolled: boolean }) {
  return (
    <Link
      href={`/akademi/${p.slug}`}
      className="block rounded-[16px] overflow-hidden bg-pg-white no-underline text-pg-ink-900 transition-transform hover:-translate-y-0.5"
      style={{
        border: "1px solid var(--pg-ink-100)",
        boxShadow: "0 1px 2px rgba(20,16,12,0.04), 0 8px 24px rgba(20,16,12,0.06)",
      }}
    >
      <div
        className="relative h-[96px] p-4 flex flex-col text-white"
        style={{
          background: "var(--pa-amber-700)",
          backgroundImage: p.cover_image
            ? `linear-gradient(135deg, rgba(110,73,6,0.40), rgba(110,73,6,0.70)), url(${p.cover_image})`
            : "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-700))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] opacity-90">
          {MODE_LABEL[p.delivery_mode] ?? p.delivery_mode}
        </span>
        <span
          className="mt-auto font-extrabold tracking-[-0.015em] text-[16px] leading-tight"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.30)" }}
        >
          {p.title}
        </span>
      </div>
      <div className="flex items-center gap-2 p-3.5">
        <Badge>{priceLabel(p)}</Badge>
        {p.duration_label && <Badge muted>{p.duration_label}</Badge>}
        {enrolled && <Badge tone="ok">Sudah daftar</Badge>}
        <Icon name="chevron_right" size={16} className="text-pg-ink-400 ml-auto" />
      </div>
    </Link>
  );
}

function Badge({
  children,
  muted,
  tone,
}: {
  children: React.ReactNode;
  muted?: boolean;
  tone?: "ok";
}) {
  const style =
    tone === "ok"
      ? { background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }
      : muted
        ? { background: "var(--pg-ink-50)", color: "var(--pg-ink-500)" }
        : { background: "var(--pa-amber-100)", color: "var(--pa-amber-700)" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase tracking-[0.04em]"
      style={style}
    >
      {children}
    </span>
  );
}
