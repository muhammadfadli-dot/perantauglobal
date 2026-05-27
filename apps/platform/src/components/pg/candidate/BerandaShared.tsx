import Link from "next/link";
import { Icon } from "@/components/pg/Icon";

/**
 * BerandaTopBar — slim brand + title + notif bell.
 *
 * Different from the regular TopBarApp: this is the home-tab specific top bar
 * that anchors the journey-style Beranda. Brand mark left, page title center,
 * info/notif right.
 */
export function BerandaTopBar({ notif = 0 }: { notif?: number }) {
  return (
    <div
      className="sticky top-0 z-30 flex items-center justify-between gap-3 px-5 pt-2 pb-3"
      style={{
        background:
          "linear-gradient(180deg, #fffefa 0%, var(--pg-paper) 100%)",
      }}
    >
      <Link
        href="/dashboard"
        className="w-9 h-9 rounded-[11px] grid place-items-center text-white no-underline shrink-0"
        style={{
          background:
            "linear-gradient(135deg, var(--pg-red-600) 0%, var(--pg-red-700) 100%)",
          boxShadow:
            "0 2px 6px rgba(215,38,47,0.30), inset 0 1px 0 rgba(255,255,255,0.25)",
          fontWeight: 900,
          fontSize: 12,
          letterSpacing: "-0.02em",
        }}
      >
        PG
      </Link>
      <span
        className="flex-1 text-left font-semibold text-[13px] tracking-[-0.005em]"
        style={{ color: "var(--pg-ink-500)" }}
      >
        Perantau Global
      </span>
      <button
        type="button"
        className="relative w-9 h-9 rounded-[11px] grid place-items-center bg-pg-white text-pg-ink-700"
        style={{
          border: "1px solid var(--pg-ink-100)",
          boxShadow: "0 1px 2px rgba(20,20,20,0.04)",
        }}
        aria-label="Informasi"
      >
        <Icon name="info" size={18} />
        {notif > 0 && (
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{
              background: "var(--pg-red-600)",
              boxShadow: "0 0 0 2px #fff",
            }}
          />
        )}
      </button>
    </div>
  );
}

/**
 * BerandaHeader — greeting eyebrow + member ID pill + headline h1 + optional sub.
 * Shared across all S1-S5 Beranda states.
 */
export function BerandaHeader({
  greeting,
  memberId,
  headline,
  sub,
}: {
  greeting: string;
  memberId?: string;
  headline: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="px-5 pb-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span
          className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-pg-ink-500"
        >
          {greeting}
        </span>
        {memberId && (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold tracking-[0.04em] text-pg-ink-700"
            style={{
              background: "var(--pg-white)",
              border: "1px solid var(--pg-ink-100)",
              boxShadow: "0 1px 2px rgba(20,20,20,0.04)",
            }}
          >
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--pg-red-600)" }}
            />
            {memberId}
          </span>
        )}
      </div>
      <h1
        className="font-extrabold tracking-[-0.025em] text-pg-ink-900 m-0 leading-[1.1] text-balance"
        style={{ fontSize: "clamp(22px, 6vw, 28px)" }}
      >
        {headline}
      </h1>
      {sub && (
        <p className="text-[13px] text-pg-ink-500 mt-1 leading-snug m-0">
          {sub}
        </p>
      )}
    </div>
  );
}

/**
 * SectionHead — heading + optional sub + optional "Semua ›" link.
 * Used between Beranda card groups.
 */
export function SectionHead({
  title,
  sub,
  allHref,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  allHref?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-2.5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[16px] font-extrabold tracking-[-0.015em] text-pg-ink-900 m-0">
          {title}
        </h2>
        {sub && (
          <span className="text-[12px] text-pg-ink-500">{sub}</span>
        )}
      </div>
      {allHref && (
        <Link
          href={allHref}
          className="font-mono text-[11px] font-bold text-pg-ink-700 no-underline tracking-[0.04em] shrink-0"
        >
          Semua ›
        </Link>
      )}
    </div>
  );
}

/**
 * Profile completeness ring — circular progress around a center number.
 * Used in S1 ProgressNudge + Saya tab header.
 */
export function ProfileRing({
  pct,
  size = 56,
  children,
}: {
  pct: number;
  size?: number;
  children?: React.ReactNode;
}) {
  const safe = Math.max(0, Math.min(100, pct));
  return (
    <div
      className="relative grid place-items-center rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--pg-red-600) ${safe * 3.6}deg, var(--pg-ink-100) 0)`,
      }}
    >
      <div
        className="grid place-items-center rounded-full bg-pg-white"
        style={{ width: size - 8, height: size - 8 }}
      >
        {children}
      </div>
    </div>
  );
}
