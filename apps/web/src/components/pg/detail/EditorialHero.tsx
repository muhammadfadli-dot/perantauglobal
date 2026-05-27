import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import type { CountryMeta } from "@/lib/lowonganCountries";
import { waLink } from "@/lib/contact";

/**
 * Editorial hero — full-bleed image with country-tinted CSS filter, overlay
 * gradient, glass back button + tool buttons (share + WA), bottom-left chip
 * (country + city) + role h1.
 *
 * No meta box — meta lives in QuickFacts (floating card overlapping hero
 * bottom).
 */
export function EditorialHero({
  role,
  country,
  city,
  heroImg,
  waMessage,
}: {
  role: string;
  country: CountryMeta;
  city: string;
  heroImg: string;
  waMessage: string;
}) {
  return (
    <section
      className="relative overflow-hidden bg-pg-ink-900 text-white isolate flex flex-col justify-between"
      style={{ minHeight: 520, paddingBottom: 80 }}
      data-country={country.key}
    >
      {/* BG image with country tint */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImg})`,
          filter: country.imgFilter,
        }}
      />
      {/* Overlay gradient */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,20,20,0.48) 0%, rgba(20,20,20,0.18) 30%, rgba(20,20,20,0.32) 60%, rgba(20,20,20,0.78) 100%)",
        }}
      />

      {/* Top bar — back + share/WA tools */}
      <div className="relative z-[3] px-5 md:px-8 pt-6 pb-6 flex items-center justify-between gap-4">
        <Link
          href="/lowongan"
          className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full no-underline text-white/92 text-[13px] font-semibold transition-colors hover:bg-white/20"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.22)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <Icon name="arrow_left" size={14} stroke={2.6} />
          Lowongan
        </Link>
        <div className="inline-flex gap-2">
          <a
            href="#share"
            className="inline-grid place-items-center w-[38px] h-[38px] rounded-full no-underline text-white/92 transition-colors hover:bg-white/20"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.22)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            aria-label="Bagikan"
          >
            <Icon name="share" size={16} stroke={2.2} />
          </a>
          <a
            href={waLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-grid place-items-center w-[38px] h-[38px] rounded-full no-underline text-white/92 transition-colors hover:bg-white/20"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.22)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            aria-label="Tanya via WhatsApp"
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: "#25D366" }} />
          </a>
        </div>
      </div>

      {/* Body — chip + role */}
      <div className="relative z-[2] px-5 md:px-8 pt-6 pb-6">
        <div className="max-w-6xl mx-auto">
          <span
            className="inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-white"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <span
              aria-hidden
              className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white text-[13px] leading-none"
            >
              {country.flag}
            </span>
            {country.name} · {city}
          </span>
          <h1
            className="mt-4 font-extrabold tracking-[-0.035em] leading-[0.98] text-balance m-0"
            style={{ fontSize: "clamp(36px, 6vw, 72px)" }}
          >
            {role}
          </h1>
        </div>
      </div>
    </section>
  );
}
