/**
 * Dark trust strip — matches the redesign (ink-900 bg, mono font, white text).
 *
 * Replaces the previous gold permit-prominent band. Per Panji review
 * (2026-05-27): follow design file's header treatment exactly.
 *
 * Layout: continuous left-scrolling marquee — track contains the item sequence
 * twice, animation runs from 0 to -50% so the second copy slides into place
 * seamlessly. No manual horizontal scroll needed; respect for reduced-motion
 * lives in globals.css.
 */

const PERMIT_NO = "1810240237512001";

const ITEMS = [
  `Resmi P3MI Kemnaker · No. ${PERMIT_NO}`,
  "Bagian dari Dayalima Group, sejak 1998",
  "Bebas biaya sebelum offering letter",
];

function MarqueeItem({ text, ariaHidden }: { text: string; ariaHidden: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-white/92 shrink-0"
      aria-hidden={ariaHidden || undefined}
    >
      <span
        aria-hidden
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: "var(--pg-red-500)" }}
      />
      {text}
    </span>
  );
}

function MarqueeDot({ ariaHidden = true }: { ariaHidden?: boolean }) {
  return (
    <span aria-hidden={ariaHidden} className="text-white/45 shrink-0 mx-3 md:mx-4">
      ·
    </span>
  );
}

export function TrustStrip() {
  // Render the sequence (with separator after every item) twice — the loop
  // -50% → 0% snap stays seamless because the second copy looks identical
  // to the first at its starting position.
  const sequence = ITEMS.flatMap((text, i) => [
    <MarqueeItem key={`a-${i}-item`} text={text} ariaHidden={false} />,
    <MarqueeDot key={`a-${i}-dot`} />,
  ]);
  const sequenceCopy = ITEMS.flatMap((text, i) => [
    <MarqueeItem key={`b-${i}-item`} text={text} ariaHidden />,
    <MarqueeDot key={`b-${i}-dot`} />,
  ]);

  return (
    <div
      className="bg-pg-ink-900 text-white/92 overflow-hidden"
      aria-label={`Perantau Global — Izin resmi P3MI Kemnaker No. ${PERMIT_NO}. Bagian dari Dayalima Group sejak 1998. Bebas biaya sebelum offering letter.`}
    >
      <div
        className="flex items-center h-9 font-mono text-[11px] md:text-[12px] tracking-[0.04em] whitespace-nowrap"
        style={{
          width: "max-content",
          animation: "pg-marquee 32s linear infinite",
          willChange: "transform",
        }}
      >
        {sequence}
        {sequenceCopy}
      </div>
    </div>
  );
}
