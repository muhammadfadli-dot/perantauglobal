/**
 * Boarding-pass styled trust strip — establishes legitimacy in a way that
 * mirrors the journey our audience is taking (boarding a plane abroad).
 *
 * Two layouts:
 *  - Mobile (<md): marquee that auto-scrolls left, content duplicated for a
 *    seamless loop. Users don't have to swipe to see all fields.
 *  - Desktop (md+): original static layout — fields spread evenly across a
 *    max-w-6xl container with justify-between, edge notches visible.
 *
 * Respects prefers-reduced-motion (marquee freezes).
 */

const FIELDS: { label: string; value: string }[] = [
  { label: "Lisensi", value: "P3MI Kemnaker" },
  { label: "Biaya di awal", value: "Bebas / Rp 0" },
  { label: "Grup", value: "DayaLima · 1998" },
  { label: "Hotline", value: "WhatsApp 24/7" },
];

function TicketStamp({ withBorder = false }: { withBorder?: boolean }) {
  return (
    <div
      className="flex items-center gap-2 flex-shrink-0 px-4 md:px-0 md:pr-6"
      style={withBorder ? { borderLeft: "1px dashed #d6c184" } : undefined}
    >
      <span
        className="grid place-items-center flex-shrink-0"
        style={{ width: 26, height: 26 }}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
          <path
            d="M3.5 7.5c0-1.1.9-2 2-2h13c1.1 0 2 .9 2 2v2.2c0 .3-.2.5-.5.6a1.7 1.7 0 0 0 0 3.4c.3.1.5.3.5.6v2.2c0 1.1-.9 2-2 2h-13c-1.1 0-2-.9-2-2v-2.2c0-.3.2-.5.5-.6a1.7 1.7 0 0 0 0-3.4c-.3-.1-.5-.3-.5-.6V7.5Z"
            fill="#0e0e0e"
          />
          <path
            d="M9.25 6v12"
            stroke="#faf3df"
            strokeWidth="1.2"
            strokeDasharray="1.5 1.5"
            strokeLinecap="round"
          />
          <circle cx="14.5" cy="9.5" r="0.9" fill="#faf3df" />
          <circle cx="14.5" cy="12" r="0.9" fill="#faf3df" />
          <circle cx="14.5" cy="14.5" r="0.9" fill="#faf3df" />
        </svg>
      </span>
      <div className="flex flex-col leading-tight">
        <span
          className="font-mono font-bold uppercase"
          style={{ fontSize: 8.5, letterSpacing: "0.18em", color: "#7a6020" }}
        >
          Boarding pass
        </span>
        <span
          className="font-extrabold tracking-tight"
          style={{ fontSize: 10.5, color: "#0e0e0e" }}
        >
          Perantau Global
        </span>
      </div>
    </div>
  );
}

function FieldItem({
  label,
  value,
  desktopPad = false,
}: {
  label: string;
  value: string;
  desktopPad?: boolean;
}) {
  return (
    <div
      className={
        desktopPad
          ? "flex flex-col flex-shrink-0 px-3 md:px-5 leading-tight"
          : "flex flex-col flex-shrink-0 px-4 leading-tight"
      }
      style={{ borderLeft: "1px dashed #d6c184" }}
    >
      <span
        className="font-mono font-bold uppercase"
        style={{ fontSize: 8.5, letterSpacing: "0.18em", color: "#7a6020" }}
      >
        {label}
      </span>
      <span
        className="font-extrabold tracking-tight"
        style={{
          fontSize: 12.5,
          color: "#0e0e0e",
          letterSpacing: "-0.01em",
          marginTop: 2,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function CodeStub({ inMarquee = false }: { inMarquee?: boolean }) {
  return (
    <div
      className={
        inMarquee
          ? "flex items-center flex-shrink-0 pl-5 pr-2"
          : "hidden lg:flex items-center flex-shrink-0 pl-5"
      }
      style={{ borderLeft: "1px dashed #d6c184" }}
    >
      <div className="flex flex-col leading-tight">
        <span
          className="font-mono font-bold uppercase"
          style={{ fontSize: 8.5, letterSpacing: "0.18em", color: "#7a6020" }}
        >
          Kode
        </span>
        <span
          className="font-mono font-bold"
          style={{ fontSize: 11, color: "#0e0e0e", letterSpacing: "0.05em" }}
        >
          PG-PMI/2026
        </span>
      </div>
      <div className="flex items-center gap-[1px] ml-3" aria-hidden>
        {[3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 3].map((w, k) => (
          <span
            key={k}
            style={{
              display: "inline-block",
              width: w,
              height: 18,
              background: "#0e0e0e",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** Marquee track — used on mobile only. Content is duplicated twice so the
 *  CSS transform from 0 → -50% creates a seamless loop. */
function MarqueeTrack({ k }: { k: string }) {
  return (
    <>
      <TicketStamp withBorder />
      {FIELDS.map((f, i) => (
        <FieldItem key={`${k}-${i}`} label={f.label} value={f.value} />
      ))}
      <CodeStub inMarquee />
    </>
  );
}

export function TrustStrip() {
  return (
    <div
      className="relative py-2.5 md:py-3 md:px-8 overflow-hidden"
      style={{
        background: "#faf3df",
        borderBottom: "1px dashed #d6c184",
      }}
    >
      <style>{`
        @keyframes pg-trust-marquee {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        .pg-trust-marquee-track {
          animation: pg-trust-marquee 28s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .pg-trust-marquee-track {
            animation: none;
            transform: none !important;
          }
        }
      `}</style>

      {/* Left edge notch (desktop only) */}
      <span
        aria-hidden
        className="hidden md:block absolute pointer-events-none"
        style={{
          left: -8,
          top: "50%",
          transform: "translateY(-50%)",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "var(--pg-paper)",
          border: "1px dashed #d6c184",
          zIndex: 2,
        }}
      />
      {/* Right edge notch (desktop only) */}
      <span
        aria-hidden
        className="hidden md:block absolute pointer-events-none"
        style={{
          right: -8,
          top: "50%",
          transform: "translateY(-50%)",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "var(--pg-paper)",
          border: "1px dashed #d6c184",
          zIndex: 2,
        }}
      />

      {/* Mobile: marquee */}
      <div
        className="md:hidden pg-trust-marquee-track flex items-center w-max"
        aria-label="Perantau Global — lisensi P3MI Kemnaker, bebas biaya di awal, bagian DayaLima Group sejak 1998, WhatsApp 24/7"
      >
        <MarqueeTrack k="a" />
        <MarqueeTrack k="b" />
      </div>

      {/* Desktop: original static layout */}
      <div className="hidden md:flex items-center justify-between max-w-6xl mx-auto">
        <TicketStamp />
        {FIELDS.map((f, i) => (
          <FieldItem key={i} label={f.label} value={f.value} desktopPad />
        ))}
        <CodeStub />
      </div>
    </div>
  );
}
