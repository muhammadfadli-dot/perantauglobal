import Link from "next/link";
import { BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import { BerandaTopBar, SectionHead } from "@/components/pg/candidate/BerandaShared";
import { requireCandidate } from "@/lib/supabase-server";
import {
  listPublishedPrograms,
  listMyEnrollments,
  progressLabel,
} from "@/lib/academy-db";
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
  const myPrograms = enrollments
    .map((e) => ({ enrollment: e, program: programs.find((p) => p.slug === e.program_slug) }))
    .filter((x): x is { enrollment: AcademyEnrollment; program: AcademyProgram } => Boolean(x.program));

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
            <div className="flex flex-col gap-2.5">
              {myPrograms.map(({ enrollment, program }) => (
                <EnrolledRow key={program.slug} program={program} enrollment={enrollment} />
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
                <ProgramCard
                  key={p.slug}
                  program={p}
                  enrolled={enrolledBySlug.has(p.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
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

function EnrolledRow({
  program,
  enrollment,
}: {
  program: AcademyProgram;
  enrollment: AcademyEnrollment;
}) {
  const done = enrollment.status === "passed" || enrollment.status === "completed";
  return (
    <Link
      href={`/akademi/${program.slug}`}
      className="flex items-center gap-3 p-3.5 rounded-[14px] bg-pg-white no-underline text-pg-ink-900"
      style={{
        border: "1px solid var(--pg-ink-100)",
        boxShadow: "0 1px 2px rgba(20,16,12,0.04), 0 4px 12px rgba(20,16,12,0.04)",
      }}
    >
      <span
        className="w-11 h-11 rounded-[12px] grid place-items-center shrink-0 text-white"
        style={{
          background: done
            ? "var(--pg-ok)"
            : "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))",
        }}
      >
        <Icon name={done ? "check" : "passport"} size={20} stroke={done ? 3 : 2} />
      </span>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-[14px] font-extrabold tracking-[-0.01em] truncate">
          {program.title}
        </span>
        <span className="text-[11px] text-pg-ink-500">{progressLabel(enrollment)}</span>
        {enrollment.status === "in_progress" && (
          <div className="mt-1.5 h-1 bg-pg-ink-50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${enrollment.progress_pct}%`,
                background: "linear-gradient(90deg, var(--pa-amber-500), var(--pa-amber-600))",
              }}
            />
          </div>
        )}
      </div>
      <Icon name="chevron_right" size={16} className="text-pg-ink-400" />
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
