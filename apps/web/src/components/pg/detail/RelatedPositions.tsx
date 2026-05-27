import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import type { Position } from "@/lib/positions";
import { COUNTRY_META, countryKeyFromName, cityForSlug } from "@/lib/lowonganCountries";

/**
 * Related positions — 4 mini cards of other open/queue positions in the same
 * country. Auto-generated from catalog (zero admin overhead).
 */
export function RelatedPositions({
  current,
  allPositions,
}: {
  current: Position;
  allPositions: Position[];
}) {
  const others = allPositions
    .filter((p) => p.country === current.country && p.slug !== current.slug)
    .slice(0, 4);
  if (others.length === 0) return null;
  const countryKey = countryKeyFromName(current.country);
  const country = COUNTRY_META[countryKey];

  return (
    <section className="px-5 md:px-8 py-12 md:py-14 bg-pg-paper border-t border-pg-ink-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-pg-red-600">
              Posisi lain
            </span>
            <h2 className="text-[22px] md:text-[28px] font-extrabold tracking-[-0.02em] text-pg-ink-900 m-0">
              Lowongan di <span className="text-pg-red-600">{country.name}.</span>
            </h2>
          </div>
          <Link
            href={`/lowongan?country=${encodeURIComponent(country.name)}`}
            className="inline-flex items-center gap-1.5 font-bold text-[13px] text-pg-red-600 no-underline whitespace-nowrap"
          >
            Lihat semua
            <Icon name="arrow_right" size={14} stroke={2.4} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {others.map((p) => {
            const city = cityForSlug(p.slug, countryKey);
            return (
              <Link
                key={p.slug}
                href={`/lowongan/${p.slug}`}
                className="group flex flex-col rounded-[16px] overflow-hidden bg-pg-white border border-pg-ink-100 no-underline transition-all hover:-translate-y-1 hover:border-pg-ink-200"
                style={{ boxShadow: "var(--pg-shadow-1)" }}
              >
                <div
                  className="relative h-32 bg-cover bg-center bg-pg-ink-100"
                  style={{ backgroundImage: `url(/images/lowongan/${p.slug}.jpg)` }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 50%, rgba(20,20,20,0.5) 100%)",
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1 p-3.5">
                  <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.04em] text-pg-ink-500">
                    {country.flag} {city}
                  </span>
                  <span className="text-[15px] font-extrabold tracking-[-0.018em] text-pg-ink-900 leading-tight">
                    {p.role}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="font-mono text-[14px] font-extrabold text-pg-ink-900">
                      {p.salary}
                    </span>
                    {p.status === "open" && (
                      <span className="inline-flex items-center gap-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] text-pg-ok ml-auto">
                        <span
                          aria-hidden
                          className="w-1.5 h-1.5 rounded-full bg-pg-ok"
                        />
                        Buka
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
