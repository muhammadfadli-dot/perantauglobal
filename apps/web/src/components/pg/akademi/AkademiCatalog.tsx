"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/pg/Icon";

export interface CatalogCard {
  slug: string;
  title: string;
  /** Subtitle: the one-line reason to take this class. */
  value: string;
  /** "Gratis" / "Berbayar" / "Rp1.500.000" */
  price: string;
  /** Small line under the price: reassurance for paid, duration for free. */
  priceSub: string;
  kindLabel: string;
  isFree: boolean;
  cta: string;
  /** Marks the product marketing is pushing first. */
  featured: boolean;
  image: string | null;
  imageAlt: string;
}

const CARD_GAP = 16;
const SCROLL_MS = 420;

/**
 * Horizontal shelf for the whole Akademi catalog.
 *
 * A shelf rather than a grid because the catalog is meant to grow (more roles,
 * more free modules) and a grid of twelve cards turns the hub into a wall.
 * Scroll-snap keeps it thumb-friendly on the phones most candidates use; the
 * arrows and progress bar exist so desktop users get an affordance that a bare
 * overflow container does not give them.
 */
export function AkademiCatalog({ cards }: { cards: CatalogCard[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const settle = useRef<number | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [index, setIndex] = useState(1);
  const [progress, setProgress] = useState(0);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const stepWidth = card ? card.offsetWidth + CARD_GAP : 1;
    const max = el.scrollWidth - el.clientWidth;
    const ended = el.scrollLeft >= max - 2;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(ended);
    // The counter tracks the leftmost visible card, which is right on a phone
    // (one card per screen) but reads as stalled on desktop, where the last
    // few cards share the viewport: the shelf stops at "3 dari 6" with the
    // next arrow greyed out. Snap to the total once there is nothing further.
    setIndex(ended ? cards.length : Math.min(cards.length, Math.round(el.scrollLeft / stepWidth) + 1));
    setProgress(max > 0 ? Math.min(100, (el.scrollLeft / max) * 100) : 100);
  }, [cards.length]);

  useEffect(() => {
    sync();
    return () => {
      if (settle.current) window.clearTimeout(settle.current);
    };
  }, [sync]);

  /**
   * Advance one card.
   *
   * Two hazards are handled explicitly. Mandatory scroll-snap fights a
   * programmatic scroll, so the snap is lifted for the duration. And the smooth
   * animation itself is frame-driven, so it silently does nothing whenever the
   * document cannot paint; the settle step therefore asserts the final position
   * rather than trusting the animation to have arrived.
   */
  function step(direction: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const stepWidth = card ? card.offsetWidth + CARD_GAP : el.clientWidth * 0.85;
    const max = el.scrollWidth - el.clientWidth;
    const to = Math.max(0, Math.min(max, el.scrollLeft + direction * stepWidth));
    if (Math.abs(to - el.scrollLeft) < 1) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.style.scrollSnapType = "none";
    el.scrollTo({ left: to, behavior: reduced ? "auto" : "smooth" });

    if (settle.current) window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      if (Math.abs(el.scrollLeft - to) > 2) el.scrollLeft = to;
      el.style.scrollSnapType = "";
      settle.current = null;
      sync();
    }, SCROLL_MS);
  }

  return (
    <div className="relative mt-6">
      <div
        ref={scroller}
        onScroll={sync}
        className="pg-noscrollbar pg-snap-x flex gap-4 overflow-x-auto pt-2 pb-2.5 px-0.5"
      >
        {cards.map((card) => (
          <CatalogCardView key={card.slug} card={card} />
        ))}
      </div>

      <ShelfArrow side="left" onClick={() => step(-1)} disabled={atStart} />
      <ShelfArrow side="right" onClick={() => step(1)} disabled={atEnd} />

      <div className="flex items-center gap-3 mt-1.5">
        <div className="flex-1 h-1 rounded-[3px] overflow-hidden" style={{ background: "var(--pg-switch-border)" }}>
          <div
            className="h-full rounded-[3px] transition-[width] duration-200"
            style={{ width: `${Math.max(progress, 100 / cards.length)}%`, background: "var(--pa-amber-600)" }}
          />
        </div>
        <span className="font-mono text-[11px] font-bold text-pg-ink-500 whitespace-nowrap">
          {index} dari {cards.length}
        </span>
      </div>
    </div>
  );
}

function CatalogCardView({ card }: { card: CatalogCard }) {
  return (
    <Link
      href={`/akademi/kelas/${card.slug}`}
      data-card
      className="flex-none w-[82vw] max-w-[300px] sm:w-[250px] bg-pg-white rounded-[18px] overflow-hidden flex flex-col no-underline text-pg-ink-900 transition-transform duration-200 hover:-translate-y-1"
      style={{
        scrollSnapAlign: "start",
        border: card.featured ? "1.5px solid var(--pa-amber-200)" : "1px solid var(--pg-ink-200)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="relative bg-pg-ink-50" style={{ aspectRatio: "3 / 2" }}>
        {card.image && (
          <Image
            src={card.image}
            alt={card.imageAlt}
            fill
            sizes="(max-width: 640px) 82vw, 250px"
            className="object-cover"
          />
        )}
        <span
          className="absolute bottom-2.5 left-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] px-2 py-1 rounded-md text-white"
          style={{ background: card.isFree ? "var(--pg-ok)" : "var(--pa-amber-600)" }}
        >
          {card.kindLabel}
        </span>
        {card.featured && (
          <span className="absolute bottom-2.5 right-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] px-2 py-1 rounded-md bg-pg-ink-900 text-white">
            Dibuka duluan
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[17px] font-extrabold leading-tight tracking-[-0.018em] m-0">{card.title}</h3>
        <p className="text-[13px] leading-relaxed text-pg-ink-700 font-medium mt-2.5 m-0">{card.value}</p>
        <div className="flex items-end justify-between gap-2 mt-auto pt-3.5">
          <div>
            <div className="text-[13.5px] font-extrabold text-pg-ink-900">{card.price}</div>
            <div className="font-mono text-[10px] text-pg-ink-500 mt-px">{card.priceSub}</div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 font-extrabold text-[12.5px] px-3.5 py-2.5 rounded-[11px] text-white whitespace-nowrap"
            style={{ background: "var(--pa-amber-600)" }}
          >
            {card.cta}
            <Icon name="arrow_right" size={14} stroke={2.4} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ShelfArrow({
  side,
  onClick,
  disabled,
}: {
  side: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Kelas sebelumnya" : "Kelas berikutnya"}
      className="hidden sm:grid absolute top-[70px] w-[42px] h-[42px] rounded-full place-items-center cursor-pointer z-[5] p-0 border border-pg-ink-200 bg-pg-white transition-transform hover:enabled:scale-105 disabled:opacity-30 disabled:cursor-default"
      style={{
        [side]: "-6px",
        boxShadow: disabled ? "none" : "0 4px 14px rgba(20,20,20,0.15)",
      }}
    >
      <Icon name={side === "left" ? "arrow_left" : "arrow_right"} size={20} stroke={2.2} />
    </button>
  );
}
