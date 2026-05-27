import Link from "next/link";
import { POSITIONS, type PositionCountry } from "@/lib/positions";

/**
 * Country-first navigation strip — persistent below TrustStrip.
 *
 * Sits in the layout so every page has the country quick-pick visible.
 * Matches the "country-first" mental model of PMI candidates ("I want to
 * go to Japan") instead of forcing them through role-first navigation.
 *
 * Layout:
 *  - Mobile: horizontal scroll, no label.
 *  - Desktop: inline with "Negara tujuan" eyebrow label on the left.
 */

const COUNTRIES: { name: PositionCountry; short: string; flag: string }[] = [
  { name: "Saudi Arabia", short: "Saudi", flag: "🇸🇦" },
  { name: "Jepang", short: "Jepang", flag: "🇯🇵" },
  { name: "Taiwan", short: "Taiwan", flag: "🇹🇼" },
  { name: "Indonesia", short: "Indonesia", flag: "🇮🇩" },
];

export function CountryStrip() {
  return (
    <div
      className="bg-pg-white border-b border-pg-ink-100"
      aria-label="Pilih negara tujuan"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-2 md:py-2.5">
        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto md:overflow-x-visible">
          <span
            aria-hidden
            className="hidden md:inline-flex items-center text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-pg-ink-400 pr-1 shrink-0"
          >
            Negara tujuan
          </span>
          {COUNTRIES.map((c) => {
            const count = POSITIONS.filter((p) => p.country === c.name).length;
            return (
              <Link
                key={c.name}
                href={`/lowongan?country=${encodeURIComponent(c.name)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pg-paper border border-pg-ink-100 hover:border-pg-ink-300 hover:bg-pg-ink-50 transition-colors no-underline shrink-0 group"
              >
                <span className="text-[15px] leading-none" aria-hidden>
                  {c.flag}
                </span>
                <span className="text-[13px] font-bold text-pg-ink-900">{c.short}</span>
                <span className="text-[10.5px] font-mono font-semibold text-pg-ink-500 ml-0.5 px-1.5 py-0.5 rounded-full bg-pg-white border border-pg-ink-100">
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
