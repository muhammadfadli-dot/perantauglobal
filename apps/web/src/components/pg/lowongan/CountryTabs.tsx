"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { COUNTRY_META, COUNTRY_KEYS, type CountryMeta } from "@/lib/lowonganCountries";

type Props = {
  initialActive: "all" | CountryMeta["key"];
  counts: Record<CountryMeta["key"], number>;
  total: number;
};

/**
 * Sticky country tabs with scroll-spy. Click → scroll to chapter section.
 * Scroll: when chapter enters viewport, update active.
 */
export function CountryTabs({ initialActive, counts, total }: Props) {
  const [active, setActive] = useState<"all" | CountryMeta["key"]>(initialActive);

  // Scroll-spy via IntersectionObserver — update active as chapters enter view
  useEffect(() => {
    const sections: { key: "all" | CountryMeta["key"]; el: Element }[] = [];
    for (const k of COUNTRY_KEYS) {
      const el = document.getElementById(`chapter-${k}`);
      if (el) sections.push({ key: k, el });
    }
    if (sections.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length === 0) return;
        const top = visible[0].target.id.replace("chapter-", "") as CountryMeta["key"];
        setActive(top);
      },
      { rootMargin: "-140px 0px -50% 0px", threshold: 0 },
    );
    for (const s of sections) io.observe(s.el);
    return () => io.disconnect();
  }, []);

  const handleClick = (k: "all" | CountryMeta["key"]) => {
    setActive(k);
    if (k === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(`chapter-${k}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className="sticky z-20 border-b border-pg-ink-100"
      style={{
        top: 64, // below TopBarWWW
        background: "var(--pg-paper-blur)",
        backdropFilter: "saturate(140%) blur(8px)",
        WebkitBackdropFilter: "saturate(140%) blur(8px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div
          className="flex gap-2 py-3 overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: "none" as const }}
        >
          <button
            type="button"
            onClick={() => handleClick("all")}
            className={`flex items-center gap-2 min-h-[48px] md:min-h-[56px] px-4 rounded-full border-[1.5px] transition-all whitespace-nowrap shrink-0 ${
              active === "all"
                ? "bg-pg-ink-900 text-white border-pg-ink-900"
                : "bg-pg-white text-pg-ink-900 border-pg-ink-100 hover:border-pg-ink-300"
            }`}
          >
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[13.5px] md:text-[15px] font-bold tracking-[-0.01em]">
                Semua negara
              </span>
              <span
                className={`hidden md:inline font-mono text-[11px] mt-0.5 ${
                  active === "all" ? "text-white/65" : "text-pg-ink-500"
                }`}
              >
                Lihat seluruh chapter
              </span>
            </div>
            <span
              className={`ml-1.5 px-2 py-0.5 font-mono text-[10.5px] md:text-[11px] font-bold rounded-full ${
                active === "all"
                  ? "bg-white/16 text-white/95"
                  : "bg-pg-ink-50 text-pg-ink-700"
              }`}
            >
              {total}
            </span>
          </button>

          {COUNTRY_KEYS.map((k) => {
            const c = COUNTRY_META[k];
            const isActive = active === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => handleClick(k)}
                className={`flex items-center gap-2.5 md:gap-3 min-h-[48px] md:min-h-[56px] pl-1.5 pr-3.5 py-1 rounded-full border-[1.5px] transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-pg-ink-900 text-white border-pg-ink-900"
                    : "bg-pg-white text-pg-ink-900 border-pg-ink-100 hover:border-pg-ink-300"
                }`}
              >
                <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={c.img}
                    alt={c.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-pg-white grid place-items-center text-[11px] leading-none"
                    style={{ boxShadow: `0 0 0 2px ${isActive ? "var(--pg-ink-900)" : "var(--pg-paper)"}` }}
                  >
                    {c.flag}
                  </span>
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[13.5px] md:text-[15px] font-bold tracking-[-0.01em]">
                    {c.name}
                  </span>
                  <span
                    className={`hidden md:inline font-mono text-[11px] mt-0.5 ${
                      isActive ? "text-white/65" : "text-pg-ink-500"
                    }`}
                  >
                    {c.currency} · {c.contract.split("·")[0].trim()}
                  </span>
                </div>
                <span
                  className={`ml-1 px-2 py-0.5 font-mono text-[10.5px] md:text-[11px] font-bold rounded-full ${
                    isActive
                      ? "bg-white/16 text-white/95"
                      : "bg-pg-ink-50 text-pg-ink-700"
                  }`}
                >
                  {counts[k] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
