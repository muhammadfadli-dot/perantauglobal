import Image from "next/image";
import type { CountryMeta } from "@/lib/lowonganCountries";

/**
 * Full-bleed country chapter band — image hero with overlay gradient,
 * facts pills top-right, tagline + title bottom-left.
 *
 * Image is country-tinted via CSS filter (saturate/brightness/sepia/hue-rotate)
 * per country — keeps red as the only UI accent, while imagery gets a feel.
 */
export function ChapterBand({
  country,
  openCount,
}: {
  country: CountryMeta;
  openCount: number;
}) {
  return (
    <div
      className="relative overflow-hidden mb-6 md:mb-9 isolate aspect-[4/3] md:aspect-[21/7] rounded-[18px] md:rounded-[24px]"
      style={{
        minHeight: 220,
        background: "var(--pg-ink-900)",
      }}
      data-country={country.key}
    >
      <Image
        src={country.img}
        alt={country.name}
        fill
        sizes="(min-width:1280px) 1280px, 100vw"
        className="object-cover z-0"
        style={{ filter: country.imgFilter }}
        priority={false}
      />
      <div
        aria-hidden
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,20,20,0.05) 0%, rgba(20,20,20,0.30) 45%, rgba(20,20,20,0.75) 100%)",
        }}
      />

      {/* Facts pills */}
      <div
        className="absolute top-5 right-6 z-[2] flex flex-wrap gap-1.5 justify-end"
        style={{ maxWidth: "60%" }}
      >
        {country.facts.map((f) => (
          <span
            key={f}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-mono text-[11px] font-semibold text-white"
            style={{
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.22)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              letterSpacing: "0.02em",
            }}
          >
            {f}
          </span>
        ))}
      </div>

      {/* Bottom content */}
      <div className="absolute inset-0 z-[2] flex flex-col justify-end p-6 md:p-8 text-white">
        <div
          className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] mb-2 flex items-center gap-2.5"
          style={{ color: "rgba(255,255,255,0.78)" }}
        >
          <span
            className="inline-grid place-items-center w-[22px] h-[16px] rounded-[3px] bg-white text-[12px] leading-none"
            aria-hidden
          >
            {country.flag}
          </span>
          Chapter · {country.short}
        </div>
        <h2
          className="font-extrabold tracking-[-0.03em] leading-none m-0 text-balance"
          style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
        >
          {country.name}
        </h2>
        <p
          className="mt-2 leading-relaxed max-w-[50ch] text-balance"
          style={{
            fontSize: "clamp(14px, 1.3vw, 17px)",
            color: "rgba(255,255,255,0.88)",
          }}
        >
          {country.tagline}
        </p>
        {openCount > 0 && (
          <span
            className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full self-start font-mono font-bold uppercase text-[12px] tracking-[0.06em]"
            style={{ background: "var(--pg-ok)", color: "#fff" }}
          >
            <span
              aria-hidden
              className="w-[7px] h-[7px] rounded-full bg-white animate-pulse"
            />
            {openCount} batch sedang buka
          </span>
        )}
      </div>
    </div>
  );
}
