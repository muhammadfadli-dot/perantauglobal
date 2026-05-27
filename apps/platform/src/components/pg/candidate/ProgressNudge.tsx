import Link from "next/link";
import { ProfileRing } from "./BerandaShared";

/**
 * ProgressNudge — profile completeness ring + CTA to /profile.
 *
 * Soft prompt for incomplete-profile candidates on S1 Beranda.
 */
export function ProgressNudge({
  filled,
  total,
}: {
  filled: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  return (
    <Link
      href="/profile/identitas"
      className="flex items-center gap-3.5 rounded-[16px] p-4 no-underline transition-transform hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(180deg, #fff 0%, var(--pg-paper) 100%)",
        border: "1px solid var(--pg-ink-100)",
        boxShadow:
          "0 1px 2px rgba(20,16,12,0.04), 0 8px 24px rgba(20,16,12,0.06)",
      }}
    >
      <ProfileRing pct={pct} size={56}>
        <span className="font-extrabold text-[13px] tracking-[-0.01em] text-pg-ink-900">
          {pct}%
        </span>
      </ProfileRing>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-[13.5px] font-extrabold tracking-[-0.01em] text-pg-ink-900">
          Lengkapi profil
        </span>
        <span className="text-[11.5px] text-pg-ink-500 leading-tight">
          {filled}/{total} data diri terisi — lamaran lebih cepat diproses.
        </span>
      </div>
      <span
        className="inline-flex items-center justify-center px-3.5 py-2 rounded-[10px] font-bold text-[12px] text-white shrink-0"
        style={{ background: "var(--pg-red-600)" }}
      >
        Mulai
      </span>
    </Link>
  );
}
