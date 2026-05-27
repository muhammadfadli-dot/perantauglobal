import Link from "next/link";
import { Icon } from "@/components/pg/Icon";

/**
 * PasporInviteCard — amber gradient promo card for Paspor Perantau Global.
 *
 * Variants:
 *  - compact: smaller padding + icon, used in S1 secondary placement
 *  - default: medium, used in S2 "Sambil nunggu" section
 *  - primary: lifted shadow, used in S3 as the headline card
 */
export function PasporInviteCard({
  variant = "default",
  countryLabel = "Jepang",
}: {
  variant?: "compact" | "default" | "primary";
  countryLabel?: string;
}) {
  const compact = variant === "compact";
  const primary = variant === "primary";

  return (
    <Link
      href="/paspor"
      className="block no-underline rounded-[18px] relative overflow-hidden transition-transform hover:-translate-y-0.5"
      style={{
        padding: compact ? 12 : 16,
        background:
          "linear-gradient(135deg, #fffaef 0%, var(--pa-amber-100) 50%, #fbecc3 100%)",
        border: "1px solid var(--pa-amber-200)",
        boxShadow: primary
          ? "0 6px 18px rgba(201,138,20,0.15), 0 12px 36px rgba(201,138,20,0.08)"
          : undefined,
      }}
    >
      <span
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: -28,
          right: -28,
          width: 110,
          height: 110,
          background:
            "radial-gradient(circle, var(--pa-amber-500), transparent 70%)",
          opacity: 0.2,
        }}
      />
      <div className="relative flex items-center gap-3.5">
        <div
          className="rounded-[12px] grid place-items-center text-white shrink-0"
          style={{
            width: compact ? 40 : 48,
            height: compact ? 40 : 48,
            background:
              "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))",
            boxShadow: "0 2px 6px rgba(201,138,20,0.40)",
          }}
        >
          <Icon name="passport" size={compact ? 18 : 22} stroke={2} />
        </div>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span
            className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--pa-amber-700)" }}
          >
            Paspor {countryLabel}
          </span>
          <span
            className="font-extrabold tracking-[-0.015em] leading-tight"
            style={{
              fontSize: compact ? 14 : 16,
              color: "var(--pa-amber-700)",
            }}
          >
            Mulai persiapan keberangkatan
          </span>
          <span className="text-[11px] text-pg-ink-500 mt-1 font-mono tracking-[0.02em]">
            Sertifikat di akhir · ~5 jam · gratis
          </span>
        </div>
        <span
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] font-bold text-[12px] text-white shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))",
            boxShadow: "0 2px 6px rgba(201,138,20,0.30)",
          }}
        >
          Lihat
          <Icon name="arrow_right" size={13} stroke={2.4} />
        </span>
      </div>
    </Link>
  );
}
