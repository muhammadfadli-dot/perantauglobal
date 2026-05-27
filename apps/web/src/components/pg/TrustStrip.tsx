/**
 * Static trust strip — permit number prominent, audit-aligned.
 *
 * Replaces the previous auto-scrolling marquee. Familiar > clever for the
 * low-literacy / scam-fearful PMI audience. The permit number is the strongest
 * trust signal we have — make it readable and 1-tap verifiable.
 *
 * Layout:
 *  - Mobile: 2-row stacked. Permit line + 3 supporting checks below dashed border.
 *  - Desktop: 1-row inline. Permit on left, supporting checks on right.
 */

const PERMIT_VERIFY_URL = "https://sipptki.kemnaker.go.id";
const PERMIT_NO = "1810240237512001";

const SUPPORTING: { label: string }[] = [
  { label: "Bebas biaya awal" },
  { label: "Anggota Asosiasi P3MI" },
  { label: "WhatsApp 24/7" },
];

function VerifiedTick() {
  return (
    <div
      aria-hidden
      className="w-7 h-7 md:w-8 md:h-8 rounded-md grid place-items-center shrink-0"
      style={{ background: "var(--pg-ink-900)" }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--pg-gold-200)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

function PermitBlock() {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <VerifiedTick />
      <div className="flex flex-col leading-tight min-w-0">
        <span
          className="font-mono font-bold uppercase tracking-[0.14em] text-pg-gold-700"
          style={{ fontSize: 9 }}
        >
          Izin Resmi P3MI Kemnaker
        </span>
        <a
          href={PERMIT_VERIFY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono font-extrabold text-pg-ink-900 hover:text-pg-red-600 no-underline inline-flex items-center gap-1 mt-0.5 transition-colors"
          style={{ fontSize: 12, letterSpacing: "0.02em" }}
        >
          No. {PERMIT_NO}
          <span
            className="text-pg-red-600 font-bold inline-flex items-center"
            style={{ fontSize: 11 }}
            aria-label="Cek di Kemnaker"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
}

function SupportingChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] md:text-[11px] font-bold text-pg-ink-700 whitespace-nowrap">
      <span className="text-pg-ok font-extrabold" aria-hidden>
        ✓
      </span>
      {children}
    </span>
  );
}

export function TrustStrip() {
  return (
    <div
      className="relative md:px-8 overflow-hidden bg-pg-gold-100"
      style={{ borderBottom: "1px dashed var(--pg-gold-border)" }}
      aria-label="Perantau Global — Izin resmi P3MI Kemnaker No. 1810240237512001. Bebas biaya awal. Anggota Asosiasi P3MI. WhatsApp 24/7."
    >
      {/* Edge notches (boarding-pass aesthetic, desktop only) */}
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
          border: "1px dashed var(--pg-gold-border)",
          zIndex: 2,
        }}
      />
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
          border: "1px dashed var(--pg-gold-border)",
          zIndex: 2,
        }}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-0">
        {/* Mobile: 2-row stacked */}
        <div className="md:hidden flex flex-col py-2.5">
          <div className="flex items-center justify-center">
            <PermitBlock />
          </div>
          <div
            className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 mt-2 pt-2"
            style={{ borderTop: "1px dashed var(--pg-gold-border)" }}
          >
            {SUPPORTING.map((s, i) => (
              <span key={s.label} className="inline-flex items-center gap-x-3">
                <SupportingChip>{s.label}</SupportingChip>
                {i < SUPPORTING.length - 1 && (
                  <span className="text-pg-gold-border" aria-hidden>
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Desktop: 1-row inline */}
        <div className="hidden md:flex items-center justify-between gap-6 py-2.5">
          <PermitBlock />
          <div className="flex items-center gap-4 lg:gap-6">
            {SUPPORTING.map((s) => (
              <SupportingChip key={s.label}>{s.label}</SupportingChip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
