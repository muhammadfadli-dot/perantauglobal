import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import { capsEarned, type AcademyResume } from "@/lib/academy-db";

/**
 * Beranda "lanjutkan belajar" card — surfaces the candidate's active course right
 * next to their lamaran (weak-spot #10: resume was buried in the akademi tab).
 * Shows passport caps progress + the exact lesson to resume.
 */
export function AkademiResumeCard({ data }: { data: AcademyResume }) {
  const earned = capsEarned(data.caps);
  const total = data.caps.length;
  const href = !data.paid
    ? `/akademi/${data.slug}`
    : data.courseDone || !data.resume
      ? `/akademi/${data.slug}`
      : `/akademi/${data.slug}/lesson/${data.resume.lessonId}`;

  const shortName = data.programTitle.split(/[–—-]/)[0]?.trim() ?? data.programTitle;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3.5 rounded-[14px] bg-pg-white no-underline"
      style={{ border: "1px solid var(--pa-amber-200)", boxShadow: "var(--pa-shadow-card)" }}
    >
      <span
        className="w-11 h-11 rounded-[12px] grid place-items-center shrink-0 text-white"
        style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
      >
        <Icon name="passport" size={20} />
      </span>
      <div className="flex flex-col flex-1 min-w-0">
        <span
          className="font-mono text-[9.5px] font-bold uppercase tracking-[0.07em]"
          style={{ color: "var(--pa-amber-700)" }}
        >
          {total > 0 && !data.isFree
            ? `${shortName} · ${earned}/${total} cap`
            : shortName}
        </span>
        <span className="text-[13.5px] font-extrabold tracking-[-0.01em] text-pg-ink-900 truncate mt-0.5">
          {!data.paid
            ? "Selesaikan pembayaran"
            : data.courseDone
              ? "Paspor penuh — lihat sertifikat"
              : (data.resume?.lessonTitle ?? "Mulai belajar")}
        </span>
        {data.paid && !data.courseDone && data.resume && (
          <span className="text-[11.5px] text-pg-ink-500 mt-0.5">
            Modul {data.resume.moduleNum} · Pelajaran {data.resume.lessonIndex} dari{" "}
            {data.resume.totalLessons}
          </span>
        )}
      </div>
      <Icon name="chevron_right" size={16} className="text-pg-ink-400 shrink-0" />
    </Link>
  );
}
