import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import {
  COUNTRY_META,
  COUNTRY_TINT_FILTER,
  normalizeCountryKey,
} from "@perantauglobal/db/country";
import { positionHeroUrl, countryImageUrl } from "@perantauglobal/db/media";

const PIPELINE_STAGES = [
  { key: "applied", label: "Daftar" },
  { key: "lengkapi", label: "Lengkapi" },
  { key: "review", label: "Review" },
  { key: "wawancara", label: "Wawancara" },
  { key: "hasil", label: "Hasil" },
];

/**
 * JourneyHero — photo-tile hero with country tint + status panel.
 *
 * Two modes:
 *  - "applying" (S2): "Dokumen kamu" amber dot status, CTA "Lanjut" → lengkapi
 *  - "processing" (S3): "Diproses tim" cool-blue dot status, no CTA, "Hasil 3-5 hari lagi"
 */
export function JourneyHero({
  mode,
  countrySlug,
  employer,
  positionName,
  applicationId,
  positionSlug,
  ctaLabel = "Lanjut",
  ctaHref,
}: {
  mode: "applying" | "processing";
  countrySlug: string;
  employer?: string | null;
  positionName: string;
  applicationId: string;
  positionSlug: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  // No silent "jepang" fallback — an unmapped country (e.g. "any") shows a
  // neutral eyebrow rather than the wrong flag/label.
  const key = normalizeCountryKey(countrySlug);
  const meta = key ? COUNTRY_META[key] : null;
  const flag = meta?.flag ?? "";
  const label = meta?.label ?? "";
  const tint = key ? COUNTRY_TINT_FILTER[key] : "none";
  // Layered fallback: position photo → country photo (when known) → ink-900.
  const heroBg = key
    ? `url(${positionHeroUrl(positionSlug)}), url(${countryImageUrl(key)})`
    : `url(${positionHeroUrl(positionSlug)})`;

  const stageIdx = mode === "applying" ? 1 : 2; // applying=lengkapi, processing=review
  const dotColor = mode === "processing" ? "#7ad7ff" : "#ffd166";
  const stageBadge = mode === "processing" ? "Diproses tim" : "Dokumen kamu";
  const statusTitle =
    mode === "processing"
      ? "Hasil 3-5 hari lagi"
      : "Lengkapi lamaran kamu";
  const statusSub =
    mode === "processing"
      ? "Pendamping kabari segera"
      : "Setelah itu masuk proses review";

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-[22px] text-white isolate"
      style={{
        minHeight: 310,
        boxShadow:
          "0 2px 6px rgba(20,16,12,0.06), 0 18px 42px rgba(20,16,12,0.10)",
      }}
    >
      {/* Country-tinted hero photo */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: heroBg, filter: tint }}
      />
      {/* Fallback color when image missing */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-pg-ink-900" />
      {/* Dark scrim for legibility */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,16,12,0.30) 0%, rgba(20,16,12,0.10) 35%, rgba(20,16,12,0.55) 100%)",
        }}
      />

      {/* Top — country eyebrow + position name */}
      <div className="relative z-[2] px-[18px] pt-[18px]">
        <div
          className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/95"
        >
          {flag} {label}
          {employer && (
            <span className="opacity-90"> · {employer}</span>
          )}
        </div>
        <div
          className="mt-2 font-extrabold leading-[1.05] tracking-[-0.025em]"
          style={{
            fontSize: 26,
            textShadow: "0 2px 6px rgba(0,0,0,0.35), 0 0 18px rgba(0,0,0,0.20)",
          }}
        >
          {positionName}
        </div>
      </div>

      {/* Spacer pushes status panel to bottom */}
      <div className="flex-1 min-h-[28px]" />

      {/* Bottom — status glass panel */}
      <div className="relative z-[2] px-3 pb-3">
        <div
          className="rounded-[14px] px-3.5 pt-[13px] pb-3.5"
          style={{
            background: "rgba(20,16,12,0.55)",
            backdropFilter: "blur(14px) saturate(140%)",
            WebkitBackdropFilter: "blur(14px) saturate(140%)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow:
              "0 6px 20px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center justify-between gap-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] mb-2.5">
            <span className="text-white/78">Status sekarang</span>
            <span
              className="inline-flex items-center gap-1.5"
              style={{ color: dotColor }}
            >
              <span
                className="inline-block w-[7px] h-[7px] rounded-full"
                style={{
                  background: dotColor,
                  boxShadow: `0 0 8px ${dotColor}`,
                }}
              />
              {stageBadge}
            </span>
          </div>

          {/* 5-stage progress */}
          <div className="grid grid-cols-5 gap-1">
            {PIPELINE_STAGES.map((s, i) => {
              const done = i < stageIdx;
              const current = i === stageIdx;
              return (
                <span
                  key={s.key}
                  className="h-1 rounded-full"
                  style={{
                    background: done
                      ? "rgba(255,255,255,0.92)"
                      : current
                      ? dotColor
                      : "rgba(255,255,255,0.18)",
                  }}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 mt-3">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[14px] font-extrabold tracking-[-0.01em] text-white">
                {statusTitle}
              </span>
              <span className="text-[11px] text-white/74 mt-0.5">
                {statusSub}
              </span>
            </div>
            {mode === "applying" && (
              <Link
                href={
                  ctaHref ?? `/applications/${applicationId}/lengkapi`
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] font-bold text-[12px] text-pg-ink-900 no-underline bg-pg-white"
                style={{
                  boxShadow: "0 4px 12px rgba(0,0,0,0.30)",
                }}
              >
                {ctaLabel}
                <Icon name="arrow_right" size={14} stroke={2.4} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
