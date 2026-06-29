import Link from "next/link";
import { Icon } from "./Icon";
import type { Position } from "@/lib/positions";
import { COUNTRY_META, countryKeyFromName, cityForSlug } from "@/lib/lowonganCountries";

type Variant = "themed" | "featured" | "row";

type Props = {
  p: Position;
  variant?: Variant;
};

const FALLBACK_TINT: Record<ReturnType<typeof countryKeyFromName>, string> = {
  saudi: "#b89358",
  jepang: "#36598c",
  taiwan: "#3a8567",
  indonesia: "#c4452f",
  europe: "#4f6d7a",
  mexico: "#9c5a2a",
  bulgaria: "#5a6b8c",
  kuwait: "#b0843f",
};

function heroImgSrc(slug: string): string {
  return `/images/lowongan/${slug}.jpg`;
}

function FlagPill({ countryKey, country }: { countryKey: ReturnType<typeof countryKeyFromName>; country: string }) {
  return (
    <span
      className="absolute top-3 left-3 inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full font-mono text-[11px] font-bold tracking-[0.04em] text-pg-ink-900"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      <span
        aria-hidden
        className="inline-grid place-items-center w-[18px] h-[18px] rounded-full bg-pg-white text-[11px] leading-none"
      >
        {COUNTRY_META[countryKey].flag}
      </span>
      {country}
    </span>
  );
}

function StatusChip({ status, inline }: { status: Position["status"]; inline?: boolean }) {
  if (status === "open") {
    return (
      <span
        className={`${
          inline ? "" : "absolute top-3 right-3"
        } inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] font-bold tracking-[0.04em] uppercase text-white`}
        style={{ background: "var(--pg-ok)" }}
      >
        <span aria-hidden className="w-[7px] h-[7px] rounded-full bg-white animate-pulse" />
        Lagi buka
      </span>
    );
  }
  return (
    <span
      className={`${
        inline ? "" : "absolute top-3 right-3"
      } inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] font-bold tracking-[0.04em] uppercase text-white/95`}
      style={{
        background: "rgba(20,20,20,0.65)",
        backdropFilter: "blur(8px)",
      }}
    >
      Daftar antrian
    </span>
  );
}

function CardImg({ slug, icon, countryKey }: { slug: string; icon: Position["icon"]; countryKey: ReturnType<typeof countryKeyFromName> }) {
  // 3-layer stack (bottom → top):
  // 1. Country tint + icon — shows when nothing else loads
  // 2. Country photo (always exists per countryKey) — shows when position photo missing
  // 3. Position-specific photo — top layer, only renders if file exists
  //
  // Using background-image (not next/image) so missing files degrade silently.
  return (
    <>
      <div
        className="absolute inset-0 grid place-items-center"
        style={{
          background:
            `repeating-linear-gradient(135deg, rgba(255,255,255,.08) 0 12px, transparent 12px 24px), ${FALLBACK_TINT[countryKey]}`,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        <div
          className="w-[72px] h-[72px] rounded-full grid place-items-center text-white"
          style={{ background: "rgba(255,255,255,0.16)" }}
        >
          <Icon name={icon} size={32} stroke={1.8} />
        </div>
      </div>
      {/* Country photo fallback — always present at /images/countries/<key>.jpg */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(/images/countries/${countryKey}.jpg)`,
          filter: "saturate(0.95) contrast(1.05) brightness(0.85)",
        }}
      />
      {/* Position-specific photo — top layer; transparent if file missing */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImgSrc(slug)})`,
          filter: "saturate(1.05) contrast(1.02)",
        }}
      />
    </>
  );
}

// ─── Themed (default) ───────────────────────────────────────────────────────
function ThemedCard({ p }: { p: Position }) {
  const countryKey = countryKeyFromName(p.country);
  const city = cityForSlug(p.slug, countryKey);
  return (
    <Link
      href={`/lowongan/${p.slug}`}
      className="group flex flex-col bg-pg-white border border-pg-ink-100 rounded-[18px] overflow-hidden no-underline text-pg-ink-900 transition-all hover:-translate-y-1 hover:border-pg-ink-200"
      style={{ boxShadow: "var(--pg-shadow-1)" }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-pg-ink-50">
        <CardImg slug={p.slug} icon={p.icon} countryKey={countryKey} />
        <FlagPill countryKey={countryKey} country={p.country} />
        <StatusChip status={p.status} />
      </div>
      <div className="flex flex-col gap-2 p-4 md:p-[18px] flex-1">
        <div className="text-[18px] font-extrabold leading-tight tracking-[-0.018em] text-pg-ink-900">
          {p.role}
        </div>
        <div className="flex items-center gap-1 text-[13px] text-pg-ink-500">
          <Icon name="pin" size={13} stroke={2.2} />
          {city}
        </div>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="font-mono text-[22px] font-extrabold tracking-[-0.02em] text-pg-ink-900">
            {p.salary}
          </span>
          <span className="text-[13px] text-pg-ink-500">{p.salaryNote}</span>
        </div>
        <div className="flex gap-3 mt-0.5 flex-wrap text-[12.5px] text-pg-ink-500">
          <span className="inline-flex items-center gap-1">
            <Icon name="user" size={13} />
            {p.gender}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" size={13} />
            {p.age} th
          </span>
        </div>
        {p.batch && (
          <div className="mt-1">
            <div className="h-[6px] bg-pg-ink-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-pg-ok rounded-full transition-all"
                style={{
                  width: `${Math.round((p.batch.slotsFilled / p.batch.slotsTotal) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between font-mono text-[11.5px] text-pg-ink-500 mt-1.5 tracking-[0.02em]">
              <span>
                {p.batch.slotsFilled}/{p.batch.slotsTotal} slot
              </span>
              <span>Tutup {p.batch.deadline}</span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-pg-ink-100 text-[13.5px] font-bold text-pg-red-600">
          <span>{p.contractLabel ?? "Detail"}</span>
          <span className="inline-flex items-center gap-1">
            Detail
            <Icon name="chevron_right" size={14} stroke={2.4} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Featured ───────────────────────────────────────────────────────────────
function FeaturedCard({ p }: { p: Position }) {
  if (!p.batch) return <ThemedCard p={p} />;
  const countryKey = countryKeyFromName(p.country);
  const city = cityForSlug(p.slug, countryKey);
  const pct = Math.round((p.batch.slotsFilled / p.batch.slotsTotal) * 100);
  const slotsLeft = p.batch.slotsTotal - p.batch.slotsFilled;
  return (
    <Link
      href={`/lowongan/${p.slug}`}
      className="group grid md:grid-cols-[1.1fr_1fr] grid-cols-1 bg-pg-white border border-pg-ink-100 rounded-[22px] overflow-hidden no-underline text-pg-ink-900 transition-all hover:-translate-y-1 hover:border-pg-ink-200"
      style={{ boxShadow: "var(--pg-shadow-2)" }}
    >
      <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px] overflow-hidden bg-pg-ink-50">
        <CardImg slug={p.slug} icon={p.icon} countryKey={countryKey} />
        <FlagPill countryKey={countryKey} country={p.country} />
        <StatusChip status={p.status} />
      </div>
      <div className="flex flex-col gap-3 p-6 md:p-8 justify-center">
        <span
          className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full font-mono text-[11px] font-bold tracking-[0.06em] uppercase"
          style={{
            background: "var(--pg-red-50)",
            color: "var(--pg-red-700)",
            border: "1px solid var(--pg-red-100)",
          }}
        >
          <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-pg-red-600" />
          {p.batch.label}
        </span>
        <div className="text-[28px] md:text-[32px] font-extrabold tracking-[-0.025em] leading-tight">
          {p.role}
        </div>
        <div className="flex items-center gap-1.5 text-[14px] text-pg-ink-500">
          <Icon name="pin" size={14} stroke={2.2} />
          {city}, {p.country} · {p.contractLabel ?? ""}
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-mono text-[28px] md:text-[32px] font-extrabold tracking-[-0.02em]">
            {p.salary}
          </span>
          <span className="text-[14px] text-pg-ink-500">{p.salaryNote}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 pt-3 mt-1 border-t border-pg-ink-100">
          <div className="md:col-span-1 col-span-2 flex flex-col gap-1">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-pg-ink-500">
              Slot
            </span>
            <span className="text-[15px] md:text-[16px] font-bold text-pg-ink-900">
              {slotsLeft} dari {p.batch.slotsTotal} sisa
            </span>
            <div className="h-[6px] bg-pg-ink-50 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-pg-ok" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-pg-ink-500">
              Kandidat
            </span>
            <span className="text-[15px] md:text-[16px] font-bold text-pg-ink-900">
              {p.gender}, {p.age} th
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-pg-ink-500">
              Tutup pendaftaran
            </span>
            <span className="text-[15px] md:text-[16px] font-bold text-pg-ink-900">
              {p.batch.deadline}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-pg-ink-100 text-[14px]">
          <span className="text-pg-ink-500 font-medium">Bebas biaya sebelum offering letter</span>
          <span className="inline-flex items-center gap-1.5 text-pg-red-600 font-bold">
            Lihat &amp; lamar
            <Icon name="arrow_right" size={14} stroke={2.4} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Row (compact for queue in mixed mode) ──────────────────────────────────
function RowCard({ p }: { p: Position }) {
  const countryKey = countryKeyFromName(p.country);
  const city = cityForSlug(p.slug, countryKey);
  return (
    <Link
      href={`/lowongan/${p.slug}`}
      className="group flex items-center gap-4 p-3 md:p-4 bg-pg-white border border-pg-ink-100 rounded-[16px] no-underline text-pg-ink-900 transition-all hover:-translate-y-0.5 hover:border-pg-ink-200"
      style={{ boxShadow: "var(--pg-shadow-1)" }}
    >
      <div
        className="relative w-[72px] h-[72px] md:w-[88px] md:h-[88px] rounded-[12px] overflow-hidden shrink-0 bg-pg-ink-50"
        aria-hidden
      >
        <CardImg slug={p.slug} icon={p.icon} countryKey={countryKey} />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="font-mono text-[10px] md:text-[10.5px] font-bold uppercase tracking-[0.04em] text-pg-ink-500">
          {COUNTRY_META[countryKey].flag} {p.country} · {city}
        </div>
        <div className="text-[14.5px] md:text-[15.5px] font-extrabold leading-tight text-pg-ink-900 tracking-[-0.018em]">
          {p.role}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[16px] md:text-[17px] font-extrabold text-pg-ink-900">
            {p.salary}
          </span>
          <span className="text-[12px] text-pg-ink-500">{p.salaryNote}</span>
        </div>
        <div className="flex gap-2 text-[11.5px] md:text-[12px] text-pg-ink-500">
          <span>{p.contractLabel ?? ""}</span>
          <span>· {p.gender}, {p.age} th</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <StatusChip status={p.status} inline />
        <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-pg-red-600">
          <span className="hidden md:inline">Detail</span>
          <Icon name="chevron_right" size={14} stroke={2.4} />
        </span>
      </div>
    </Link>
  );
}

// ─── Picker ─────────────────────────────────────────────────────────────────
export function PositionCard({ p, variant = "themed" }: Props) {
  if (variant === "featured") return <FeaturedCard p={p} />;
  if (variant === "row") return <RowCard p={p} />;
  return <ThemedCard p={p} />;
}
