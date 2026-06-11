import Link from "next/link";
import { Icon } from "@/components/pg/Icon";

/**
 * Candidate-portal 404. Covers e.g. an unmapped/old lamaran URL — a friendly
 * dead-end with a way back, not Next's default page.
 */
export default function CandidateNotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--pg-paper)" }}
    >
      <span
        className="w-14 h-14 rounded-2xl grid place-items-center mb-4"
        style={{ background: "var(--pg-ink-50)", color: "var(--pg-ink-400)" }}
      >
        <Icon name="search" size={26} stroke={2} />
      </span>
      <h1 className="text-[20px] font-extrabold tracking-[-0.01em] text-pg-ink-900">
        Halaman nggak ketemu
      </h1>
      <p className="text-[14px] text-pg-ink-500 mt-2 max-w-xs leading-relaxed">
        Halaman yang kamu cari mungkin sudah pindah atau nggak ada lagi.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl font-bold text-[14px] text-white no-underline mt-6"
        style={{ background: "var(--pg-red-600)" }}
      >
        Ke beranda
      </Link>
    </div>
  );
}
