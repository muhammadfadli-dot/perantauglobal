import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import {
  COUNTRY_FLAG,
  COUNTRY_LABEL,
  COUNTRY_TINT,
  normalizeCountryKey,
  type CountryKey,
} from "@perantauglobal/db/country";
import { positionHeroUrl, countryImageUrl } from "@perantauglobal/db/media";

/**
 * Lowongan tab UI: country filter tiles + featured/row job cards.
 * Mirrors web's /lowongan but mobile-first.
 *
 * Country lookups come from the shared @perantauglobal/db/country source so
 * web, portal, and admin can't drift (e.g. the europe gap).
 */

/** Map a raw positions.country value to a CountryKey (null when unmapped, e.g. "any"). */
function normalizeCountry(s: string): CountryKey | null {
  return normalizeCountryKey(s);
}

export { normalizeCountry, COUNTRY_FLAG, COUNTRY_LABEL, COUNTRY_TINT };
export type { CountryKey };

/**
 * CountryFilterTile — horizontal-scroll photo tile that filters the list.
 * Active state: ink-900 ring + check mark badge.
 */
export function CountryFilterTile({
  kind,
  countryKey,
  count,
  active,
  href,
}: {
  kind: "all" | "country";
  countryKey?: CountryKey;
  count: number;
  active: boolean;
  href: string;
}) {
  const isAll = kind === "all";
  return (
    <Link
      href={href}
      className="relative shrink-0 rounded-[14px] overflow-hidden no-underline text-white transition-transform hover:-translate-y-0.5"
      style={{
        width: 140,
        height: 88,
        background: isAll
          ? "linear-gradient(135deg, var(--pg-ink-700), var(--pg-ink-900))"
          : `url(${countryImageUrl(countryKey!)}) center/cover`,
        outline: active ? "2.5px solid var(--pg-ink-900)" : "1px solid var(--pg-ink-100)",
        outlineOffset: active ? 2 : 0,
        boxShadow: active
          ? "0 4px 16px rgba(20,16,12,0.18)"
          : "0 1px 2px rgba(20,16,12,0.04)",
      }}
    >
      {!isAll && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      )}
      {active && (
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 inline-grid place-items-center w-5 h-5 rounded-full bg-pg-white text-pg-ink-900"
          style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.20)" }}
        >
          <Icon name="check" size={11} stroke={3} />
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 z-[2] p-2.5 flex items-end justify-between">
        <div className="flex flex-col gap-0">
          <span className="text-[14px] font-extrabold tracking-[-0.012em] leading-none text-white">
            {isAll ? "Semua" : COUNTRY_LABEL[countryKey!]}
          </span>
          <span className="font-mono text-[10px] tracking-[0.02em] text-white/82 mt-1">
            {count} posisi
          </span>
        </div>
        {!isAll && (
          <span
            aria-hidden
            className="inline-grid place-items-center w-6 h-6 rounded-full bg-pg-white text-[12px] leading-none"
          >
            {COUNTRY_FLAG[countryKey!]}
          </span>
        )}
      </div>
    </Link>
  );
}

export type JobCardData = {
  slug: string;
  name: string;
  country: CountryKey;
  salary: string;
  salaryNote?: string;
  city?: string;
  status: "open" | "queue";
  batch?: {
    label: string;
    slotsFilled: number;
    slotsTotal: number;
    deadline?: string;
  };
  appliedHref?: string;
};

/**
 * FeaturedJobCard — full-bleed photo card for OPEN positions.
 * Country-tinted hero + batch pill + role/salary stack + slot meter.
 */
export function FeaturedJobCard({
  job,
  newApplyHref,
}: {
  job: JobCardData;
  newApplyHref: string;
}) {
  const tint = job.country;
  // Layered fallback: position photo → country photo → solid tint (parent bg).
  const heroBg = `url(${positionHeroUrl(job.slug)}), url(${countryImageUrl(job.country)})`;
  const pct = job.batch
    ? Math.round((job.batch.slotsFilled / job.batch.slotsTotal) * 100)
    : 0;
  return (
    <Link
      href={job.appliedHref ?? newApplyHref}
      className="relative flex flex-col overflow-hidden rounded-[18px] no-underline text-white isolate"
      style={{
        minHeight: 240,
        background: COUNTRY_TINT[tint],
        boxShadow:
          "0 2px 6px rgba(20,16,12,0.06), 0 18px 42px rgba(20,16,12,0.10)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: heroBg }}
      />
      <div
        aria-hidden
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,16,12,0.20) 0%, rgba(20,16,12,0.10) 35%, rgba(20,16,12,0.62) 100%)",
        }}
      />
      {/* Top: country chip + status pill */}
      <div className="relative z-[2] flex items-center justify-between p-3.5">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10.5px] font-bold tracking-[0.04em]"
          style={{ background: "rgba(255,255,255,0.94)", color: "var(--pg-ink-900)" }}
        >
          <span aria-hidden className="text-[12px] leading-none">{COUNTRY_FLAG[tint]}</span>
          {COUNTRY_LABEL[tint]}
        </span>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-white"
          style={{ background: "var(--pg-ok)" }}
        >
          <span
            aria-hidden
            className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse"
          />
          Lagi buka
        </span>
      </div>

      <div className="flex-1 min-h-0" />

      {/* Bottom: role + salary + batch */}
      <div className="relative z-[2] p-3.5 pt-2 flex flex-col gap-2.5">
        <div className="flex flex-col">
          <span
            className="text-[20px] font-extrabold tracking-[-0.022em] leading-tight"
            style={{ textShadow: "0 2px 6px rgba(0,0,0,0.30)" }}
          >
            {job.name}
          </span>
          {job.city && (
            <span className="font-mono text-[11px] tracking-[0.02em] text-white/85 mt-1">
              {job.city}
            </span>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-[18px] font-extrabold tracking-[-0.018em] leading-none">
              {job.salary}
            </span>
            {job.salaryNote && (
              <span className="text-[11.5px] text-white/82">{job.salaryNote}</span>
            )}
          </div>
          {job.appliedHref ? (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] font-mono text-[10.5px] font-bold uppercase tracking-[0.06em]"
              style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
            >
              ✓ Dilamar
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] font-bold text-[12px] text-pg-ink-900 bg-pg-white"
              style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.25)" }}
            >
              Daftar
              <Icon name="arrow_right" size={13} stroke={2.4} />
            </span>
          )}
        </div>
        {job.batch && (
          <div
            className="rounded-[10px] px-3 py-2 grid grid-cols-3 gap-2"
            style={{
              background: "rgba(20,16,12,0.55)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/65">
                Batch
              </span>
              <span className="text-[11.5px] font-extrabold text-white truncate">
                {job.batch.label}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/65">
                Slot
              </span>
              <span className="text-[11.5px] font-extrabold text-white">
                {job.batch.slotsTotal - job.batch.slotsFilled} sisa
              </span>
              <div className="h-1 mt-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-pg-ok rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
            {job.batch.deadline && (
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/65">
                  Tutup
                </span>
                <span className="text-[11.5px] font-extrabold text-white truncate">
                  {job.batch.deadline}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * RowJobCard — compact horizontal card for queue positions.
 * 56px thumb + role + salary + applied/baru badge + chevron.
 */
export function RowJobCard({
  job,
  newApplyHref,
  isNew,
}: {
  job: JobCardData;
  newApplyHref: string;
  isNew?: boolean;
}) {
  const tint = job.country;
  return (
    <Link
      href={job.appliedHref ?? newApplyHref}
      className="flex items-center gap-3 p-2.5 rounded-[14px] bg-pg-white no-underline text-pg-ink-900 transition-transform hover:-translate-y-0.5"
      style={{
        border: "1px solid var(--pg-ink-100)",
        boxShadow: "0 1px 2px rgba(20,16,12,0.04), 0 4px 12px rgba(20,16,12,0.04)",
      }}
    >
      <div
        className="relative w-14 h-14 rounded-[10px] overflow-hidden shrink-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${positionHeroUrl(job.slug)}), url(${countryImageUrl(tint)})`,
          backgroundColor: COUNTRY_TINT[tint],
          backgroundSize: "cover, cover",
        }}
        aria-hidden
      />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-pg-ink-500">
          {COUNTRY_FLAG[tint]} {COUNTRY_LABEL[tint]}
          {job.city ? <span className="opacity-70"> · {job.city}</span> : null}
        </span>
        <span className="text-[14.5px] font-extrabold tracking-[-0.01em] text-pg-ink-900 truncate">
          {job.name}
        </span>
        <span className="flex items-baseline gap-1.5">
          <span className="font-mono text-[13px] font-extrabold tracking-[-0.01em] text-pg-ink-900">
            {job.salary}
          </span>
          {job.salaryNote && (
            <span className="text-[11px] text-pg-ink-500">{job.salaryNote}</span>
          )}
        </span>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {job.appliedHref ? (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold uppercase tracking-[0.06em]"
            style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
          >
            Dilamar
          </span>
        ) : isNew ? (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold uppercase tracking-[0.06em]"
            style={{ background: "var(--pg-red-50)", color: "var(--pg-red-600)" }}
          >
            Baru
          </span>
        ) : null}
        <Icon name="chevron_right" size={14} className="text-pg-ink-400" />
      </div>
    </Link>
  );
}
