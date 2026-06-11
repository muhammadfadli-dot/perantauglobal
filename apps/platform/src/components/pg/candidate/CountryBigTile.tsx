import Link from "next/link";
import type { CountryKey } from "@perantauglobal/db/country";
import { countryImageUrl } from "@perantauglobal/db/media";

/**
 * CountryBigTile — large country picker tile used in S1 (no-application) Beranda.
 *
 * Aspect 4/5 photo + bottom gradient + flag emoji top-left + country name bold
 * white on bottom + count line. Horizontal scroll friendly with `shrink-0`.
 */
export function CountryBigTile({
  slug,
  flag,
  name,
  count,
  href,
}: {
  slug: CountryKey;
  flag: string;
  name: string;
  count: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-col justify-end shrink-0 overflow-hidden rounded-[18px] text-white no-underline transition-transform hover:-translate-y-1"
      style={{
        width: 168,
        aspectRatio: "4/5",
        backgroundImage: `url(${countryImageUrl(slug)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "0 4px 16px rgba(20,16,12,0.10)",
      }}
    >
      {/* Bottom dark scrim */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 30%, rgba(20,16,12,0.62) 70%, rgba(20,16,12,0.88) 100%)",
        }}
      />
      {/* Flag emoji top-left */}
      <span
        aria-hidden
        className="absolute top-3 left-3 inline-grid place-items-center w-9 h-9 rounded-full text-[20px] leading-none"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        {flag}
      </span>
      {/* Bottom content */}
      <div className="relative z-[2] p-3.5 flex flex-col gap-0.5">
        <span className="text-[18px] font-extrabold tracking-[-0.018em] leading-none text-white">
          {name}
        </span>
        <span className="font-mono text-[11px] tracking-[0.02em] text-white/85 mt-1">
          {count}
        </span>
      </div>
    </Link>
  );
}
