import Image from "next/image";
import type { Testimonial } from "@/data/testimonials";

/**
 * Single testimonial card. Used by:
 *  - Desktop: rendered 3-up in a grid by the page.
 *  - Mobile: rendered one at a time by TestimonialMobileSwitcher with prev/next controls.
 *
 * Renders a hero photo (or gradient fallback if no photoPath) with city + sejak-year
 * pills overlaid, then name/role/quote/origin in the body.
 */
export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article
      className="flex flex-col bg-white border border-pg-ink-100 rounded-3xl overflow-hidden"
      style={{
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="relative h-56 md:h-64 overflow-hidden">
        {t.photoPath ? (
          <Image
            src={t.photoPath}
            alt={`${t.name}, ${t.role} di ${t.city}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            quality={85}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                t.accent === "amber"
                  ? "linear-gradient(135deg,var(--pg-ok) 0%,var(--pg-ok) 100%)"
                  : t.accent === "blue"
                    ? "linear-gradient(135deg,var(--pg-red-600) 0%,var(--pg-red-800) 100%)"
                    : "linear-gradient(135deg,var(--pg-ink-700) 0%,var(--pg-ink-900) 100%)",
            }}
          />
        )}
        {/* Subtle top gradient for pill legibility over photos */}
        {t.photoPath && (
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, var(--pg-overlay-black-30) 0%, rgba(0,0,0,0) 100%)",
            }}
          />
        )}
        <div
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-white text-[10px] font-bold tracking-widest uppercase font-mono backdrop-blur-sm"
          style={{
            background: "rgba(0,0,0,0.42)",
            border: "1px solid var(--pg-overlay-white-strong)",
          }}
        >
          {t.country === "Saudi Arabia"
            ? "🇸🇦"
            : t.country === "Jepang"
              ? "🇯🇵"
              : t.country === "Taiwan"
                ? "🇹🇼"
                : "🇮🇩"}{" "}
          {t.city}
        </div>
        <div
          className="absolute top-4 right-4 inline-flex items-center px-2.5 py-1.5 rounded-full bg-white/95 text-[10px] font-bold tracking-wider uppercase font-mono backdrop-blur-sm"
          style={{ color: "var(--pg-ok)" }}
        >
          Sejak {t.sinceYear} · {t.contractYears} thn
        </div>
      </div>
      <div className="flex flex-col gap-3 p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 md:w-12 md:h-12 rounded-full grid place-items-center text-white font-extrabold text-base flex-shrink-0"
            style={{
              background:
                t.accent === "amber"
                  ? "linear-gradient(135deg,var(--pg-gold-500),var(--pg-gold-900))"
                  : t.accent === "blue"
                    ? "linear-gradient(135deg,var(--pg-ink-700),var(--pg-ink-900))"
                    : "linear-gradient(135deg,var(--pg-red-600),var(--pg-red-800))",
              border: "3px solid #fff",
              boxShadow: "0 2px 6px rgba(20,20,20,0.12)",
            }}
          >
            {t.name[0]}
          </div>
          <div className="min-w-0">
            <div className="text-[15px] md:text-[16px] font-extrabold tracking-[-0.01em]">
              {t.name}, {t.age} th
            </div>
            <div className="text-[12.5px] md:text-[13px] text-pg-ink-500">
              {t.role} · {t.workplace}
            </div>
          </div>
        </div>
        <p className="text-[13.5px] md:text-[15px] text-pg-ink-700 leading-relaxed">
          “{t.quote}”
        </p>
        <div className="mt-auto pt-3 border-t border-pg-ink-100 flex items-center justify-between gap-2">
          <div className="text-[9.5px] md:text-[10px] font-bold tracking-widest uppercase font-mono text-pg-ink-500">
            {t.origin} → {t.city}
          </div>
        </div>
      </div>
    </article>
  );
}
