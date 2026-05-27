/**
 * Burgundy passport-style mockup card. Used by SertHero + KamuDapet
 * (the credential stage). Pure visual decoration, no real data.
 *
 * Class `peek` shifts behind/right; `main` is the front card; pure
 * mockup, never rendered with actual user data.
 */
export function PasporCardMockup({
  variant = "main",
  countryName,
  flag,
  serial,
  holderName,
  rotation,
  zIndex,
  offset,
}: {
  variant?: "main" | "peek";
  countryName: string;
  flag: string;
  serial: string;
  holderName: string;
  rotation: number;
  zIndex: number;
  offset?: { top?: string | number; right?: string | number; bottom?: string | number; left?: string | number };
}) {
  return (
    <div
      className={`absolute w-[280px] md:w-[320px] rounded-[18px] p-5 ${
        variant === "peek" ? "opacity-92" : ""
      }`}
      style={{
        background:
          "linear-gradient(155deg, #6e1923 0%, #4b1018 60%, #3a0c12 100%)",
        color: "#f6efe0",
        transform: `rotate(${rotation}deg)`,
        zIndex,
        boxShadow:
          variant === "main"
            ? "0 30px 60px rgba(74,16,24,0.40), 0 0 0 1px rgba(246,239,224,0.10) inset"
            : "0 20px 40px rgba(74,16,24,0.28), 0 0 0 1px rgba(246,239,224,0.08) inset",
        ...offset,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-pg-cream/15">
        <span
          className="inline-grid place-items-center w-7 h-7 rounded-md font-extrabold text-[11px]"
          style={{ background: "var(--pg-cream)", color: "#6e1923" }}
        >
          PG
        </span>
        <div className="flex flex-col leading-tight">
          <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-pg-cream/70">
            Republik Indonesia
          </span>
          <span className="font-extrabold text-[11px] tracking-[0.02em]">
            Paspor Perantau Global
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col items-center gap-1 py-4">
        <div className="text-[44px] leading-none">{flag}</div>
        <div className="font-extrabold text-[18px] tracking-[0.04em] mt-2">{countryName}</div>
        <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-pg-cream/65 mt-0.5">
          Series · A · 2026
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between gap-3 pt-3 border-t border-pg-cream/15">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-pg-cream/60">
            Holder
          </span>
          <span className="font-mono text-[10px] font-bold tracking-[0.02em]">{holderName}</span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-pg-cream/60">
            Serial
          </span>
          <span className="font-mono text-[10px] font-bold tracking-[0.02em]">{serial}</span>
        </div>
      </div>
    </div>
  );
}
