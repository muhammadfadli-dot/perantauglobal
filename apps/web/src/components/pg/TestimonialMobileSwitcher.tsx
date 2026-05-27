"use client";

import { useState } from "react";
import type { Testimonial } from "@/data/testimonials";
import { TestimonialCard } from "./TestimonialCard";
import { Icon } from "./Icon";

/**
 * Mobile-only single-card switcher. Shows one testimonial at a time with
 * prev/next buttons + dot position indicator. Wraps around at both ends.
 *
 * Used in the testimonials section's mobile layout (md:hidden). On desktop,
 * the page renders all cards directly in a 3-col grid.
 */
export function TestimonialMobileSwitcher({ items }: { items: Testimonial[] }) {
  const [idx, setIdx] = useState(0);
  const total = items.length;
  if (total === 0) return null;
  const current = items[idx];

  const goPrev = () => setIdx((idx - 1 + total) % total);
  const goNext = () => setIdx((idx + 1) % total);

  return (
    <div className="md:hidden flex flex-col gap-5">
      <TestimonialCard t={current} />

      {/* Controls: prev arrow · dots · next arrow */}
      <div className="flex items-center justify-between gap-3 px-1">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Cerita sebelumnya"
          className="w-11 h-11 rounded-full grid place-items-center bg-white border border-pg-ink-200 text-pg-ink-700 transition-colors hover:bg-pg-ink-50 active:bg-pg-ink-100 flex-shrink-0"
          style={{
            boxShadow: "0 1px 0 rgba(20,20,20,0.04), 0 2px 6px rgba(20,20,20,0.05)",
          }}
        >
          <Icon name="arrow_left" size={18} stroke={2.5} />
        </button>

        {/* Dots + counter */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          <div className="flex items-center gap-1.5">
            {items.map((item, i) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Cerita ${i + 1}: ${item.name}`}
                aria-current={i === idx ? "true" : undefined}
                className="rounded-full transition-all"
                style={{
                  width: i === idx ? 22 : 8,
                  height: 8,
                  background:
                    i === idx ? "var(--pg-red-600)" : "var(--pg-overlay-black-18)",
                }}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold tracking-widest uppercase font-mono text-pg-ink-500 tabular-nums">
            {idx + 1} / {total}
          </span>
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Cerita berikutnya"
          className="w-11 h-11 rounded-full grid place-items-center text-white transition-opacity hover:opacity-90 active:opacity-80 flex-shrink-0"
          style={{
            background: "var(--pg-red-600)",
            boxShadow: "var(--shadow-cta-red)",
          }}
        >
          <Icon name="arrow_right" size={18} stroke={2.5} />
        </button>
      </div>
    </div>
  );
}
