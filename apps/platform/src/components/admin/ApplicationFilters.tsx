"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/pg/Icon";
import {
  COUNTRY_OPTIONS,
  COUNTRY_META,
  normalizeCountryKey,
} from "@perantauglobal/db/country";

const SELECT_CLASS =
  "bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3 py-2 text-sm text-pg-ink-900 outline-none focus:border-pg-red-600 transition-colors";
const INPUT_CLASS =
  "bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3 py-2 text-sm text-pg-ink-900 outline-none focus:border-pg-red-600 transition-colors w-full sm:w-64";

type SortKey = "newest" | "readiness" | "fit";
type PoolKey = "pool" | "in_job_order" | "all";

type PositionEntry = {
  slug: string;
  name: string;
  country: string;
  active: boolean;
  app_count: number;
};

// Filter labels/flags/order derived from the shared country source (incl. europe).
const COUNTRY_LABEL_BY_DB: Record<string, string> = Object.fromEntries(
  COUNTRY_OPTIONS.map((o) => [o.value, o.label]),
);
const COUNTRY_ORDER = COUNTRY_OPTIONS.map((o) => o.value);

function countryLabel(c: string) {
  return COUNTRY_LABEL_BY_DB[c] ?? c;
}

function countryFlag(c: string) {
  const k = normalizeCountryKey(c);
  return k ? COUNTRY_META[k].flag : "🌐";
}

export default function ApplicationFilters({
  positions,
  initialPool,
  initialPosition,
  initialSearch,
  initialSort,
}: {
  positions: PositionEntry[];
  initialPool: PoolKey;
  initialPosition: string;
  initialSearch: string;
  initialSort: SortKey;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [lastInitial, setLastInitial] = useState(initialSearch);
  if (initialSearch !== lastInitial) {
    setLastInitial(initialSearch);
    setSearch(initialSearch);
  }

  // Group positions by country.
  const grouped = new Map<string, PositionEntry[]>();
  for (const p of positions) {
    const arr = grouped.get(p.country) ?? [];
    arr.push(p);
    grouped.set(p.country, arr);
  }
  const countryKeys = Array.from(grouped.keys()).sort((a, b) => {
    const ai = COUNTRY_ORDER.indexOf(a);
    const bi = COUNTRY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  // Auto-expand the country of the active position; otherwise let user pick.
  const initialActiveCountry = initialPosition
    ? positions.find((p) => p.slug === initialPosition)?.country ?? null
    : null;
  const [expandedCountry, setExpandedCountry] = useState<string | null>(
    initialActiveCountry,
  );
  const [lastInitialCountry, setLastInitialCountry] = useState<string | null>(
    initialActiveCountry,
  );
  // Resync expanded country when nav lands with different ?position
  if (initialActiveCountry !== lastInitialCountry) {
    setLastInitialCountry(initialActiveCountry);
    setExpandedCountry(initialActiveCountry);
  }

  function build(overrides: {
    pool?: PoolKey;
    position?: string;
    q?: string;
    sort?: SortKey;
  }) {
    const sp = new URLSearchParams();
    const pool = overrides.pool ?? initialPool;
    const position = overrides.position ?? initialPosition;
    const q = overrides.q ?? search;
    const sort = overrides.sort ?? initialSort;
    if (pool !== "pool") sp.set("pool", pool);
    if (position) sp.set("position", position);
    if (q) sp.set("q", q);
    if (sort !== "newest") sp.set("sort", sort);
    const qs = sp.toString();
    return `/admin/applications${qs ? `?${qs}` : ""}`;
  }

  function apply(overrides: Parameters<typeof build>[0]) {
    router.push(build(overrides));
  }

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    apply({ q: search });
  }

  const hasFilter = !!(
    initialPool !== "pool" ||
    initialPosition ||
    initialSearch ||
    initialSort !== "newest"
  );

  const totalApps = positions.reduce((acc, p) => acc + p.app_count, 0);

  function toggleCountry(country: string) {
    setExpandedCountry((prev) => (prev === country ? null : country));
  }

  function clickAll() {
    setExpandedCountry(null);
    if (initialPosition) {
      router.push(build({ position: "" }));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <section>
        {/* Section header */}
        <div className="flex items-center justify-between gap-3 pb-2 mb-3 border-b border-pg-ink-100">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[11px] font-bold tracking-[0.12em] uppercase text-pg-ink-500">
              Posisi
            </h2>
            {initialPosition && (
              <span className="text-[11px] font-mono text-pg-ink-400">
                ·{" "}
                {positions.find((p) => p.slug === initialPosition)?.name ??
                  initialPosition}
              </span>
            )}
          </div>
          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setExpandedCountry(null);
                router.push("/admin/applications");
              }}
              className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase text-pg-red-600 hover:text-pg-red-700"
            >
              <Icon name="x" size={13} stroke={2.4} />
              Reset filter
            </button>
          )}
        </div>

        {/* Country cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <CountryCard
            label="Semua posisi"
            globe
            count={totalApps}
            active={!initialPosition && expandedCountry === null}
            onClick={clickAll}
          />
          {countryKeys.map((country) => {
            const positionsForCountry = grouped.get(country)!;
            const countryCount = positionsForCountry.reduce(
              (acc, p) => acc + p.app_count,
              0,
            );
            const isExpanded = expandedCountry === country;
            const isActiveCountry = initialActiveCountry === country;
            return (
              <CountryCard
                key={country}
                flag={countryFlag(country)}
                label={countryLabel(country)}
                count={countryCount}
                positionCount={positionsForCountry.length}
                active={isExpanded || isActiveCountry}
                expanded={isExpanded}
                onClick={() => toggleCountry(country)}
              />
            );
          })}
        </div>

        {/* Expandable position pills — only the expanded country */}
        <div
          className={`grid transition-all duration-300 ease-out ${
            expandedCountry
              ? "grid-rows-[1fr] opacity-100 mt-3"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            {expandedCountry && grouped.get(expandedCountry) && (
              <div className="rounded-xl bg-pg-ink-50 p-3 border border-pg-ink-100">
                <div className="flex flex-wrap gap-1.5">
                  {grouped.get(expandedCountry)!.map((p) => (
                    <PositionPill
                      key={p.slug}
                      label={p.name.replace(
                        ` — ${countryLabel(expandedCountry)}`,
                        "",
                      )}
                      count={p.app_count}
                      active={initialPosition === p.slug}
                      inactive={!p.active}
                      href={build({ position: p.slug })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Secondary filters: search, status (pool), sort */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Cari nama / HP…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={INPUT_CLASS}
          />
        </form>

        <select
          value={initialPool}
          onChange={(e) => apply({ pool: e.target.value as PoolKey })}
          className={SELECT_CLASS}
        >
          <option value="pool">Talent pool (belum di JO)</option>
          <option value="in_job_order">Sudah di job order</option>
          <option value="all">Semua</option>
        </select>

        <select
          value={initialSort}
          onChange={(e) => apply({ sort: e.target.value as SortKey })}
          className={SELECT_CLASS}
        >
          <option value="newest">Terbaru</option>
          <option value="readiness">Paling qualified</option>
          <option value="fit">CV paling cocok</option>
        </select>
      </div>
    </div>
  );
}

function CountryCard({
  flag,
  globe,
  label,
  count,
  positionCount,
  active,
  expanded,
  onClick,
}: {
  flag?: string;
  globe?: boolean;
  label: string;
  count: number;
  positionCount?: number;
  active: boolean;
  expanded?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-start gap-1 rounded-xl border-[1.5px] p-3 text-left transition-all duration-200 ${
        active
          ? "bg-pg-red-600 text-pg-white border-pg-red-600 shadow-md"
          : "bg-pg-white text-pg-ink-900 border-pg-ink-200 hover:border-pg-red-200 hover:bg-pg-red-50 hover:-translate-y-0.5"
      }`}
    >
      <div className="text-[24px] leading-none">
        {globe ? (
          <span aria-hidden>🌍</span>
        ) : (
          <span aria-hidden>{flag}</span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5 w-full">
        <span className="text-[12px] font-bold tracking-tight truncate">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-mono">
        <span
          className={`tabular-nums font-bold ${
            active ? "text-pg-white" : "text-pg-ink-900"
          }`}
        >
          {count}
        </span>
        <span className={active ? "opacity-70" : "text-pg-ink-400"}>
          lamaran
        </span>
        {typeof positionCount === "number" && (
          <span className={active ? "opacity-70" : "text-pg-ink-400"}>
            · {positionCount} posisi
          </span>
        )}
      </div>
      {expanded !== undefined && !globe && (
        <span
          className={`absolute right-2.5 top-2.5 transition-transform duration-200 ${
            expanded ? "rotate-180" : "rotate-0"
          } ${active ? "text-pg-white" : "text-pg-ink-400"}`}
          aria-hidden
        >
          <Icon name="chevron_down" size={14} stroke={2.4} />
        </span>
      )}
    </button>
  );
}

function PositionPill({
  label,
  count,
  active,
  inactive,
  href,
}: {
  label: string;
  count: number;
  active: boolean;
  inactive?: boolean;
  href: string;
}) {
  const base =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-semibold no-underline transition-all border";
  let style: string;
  if (active) {
    style = "bg-pg-red-600 text-pg-white border-pg-red-600 shadow-sm";
  } else if (inactive) {
    style =
      "bg-pg-white text-pg-ink-500 border-pg-ink-200 hover:border-pg-ink-400 italic opacity-75";
  } else {
    style =
      "bg-pg-white text-pg-ink-900 border-pg-ink-200 hover:border-pg-red-200 hover:bg-pg-red-50";
  }
  return (
    <Link href={href} className={`${base} ${style}`}>
      <span>{label}</span>
      {inactive && (
        <span className="text-[9px] font-bold tracking-wide uppercase opacity-60">
          arsip
        </span>
      )}
      <span
        className={`font-mono text-[11px] tabular-nums ${
          active ? "opacity-80" : "text-pg-ink-400"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}
