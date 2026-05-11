import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";

export const dynamic = "force-dynamic";

type PositionRow = {
  slug: string;
  name: string;
  country: string;
  created_at: string;
};

interface PageProps {
  searchParams: Promise<{ country?: string }>;
}

const COUNTRIES = [
  { code: "saudi_arabia", short: "Saudi", full: "Arab Saudi", flag: "🇸🇦" },
  { code: "japan", short: "Jepang", full: "Jepang", flag: "🇯🇵" },
  { code: "taiwan", short: "Taiwan", full: "Taiwan", flag: "🇹🇼" },
  { code: "indonesia", short: "Indo", full: "Indonesia", flag: "🇮🇩" },
] as const;

const COUNTRY_FULL: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c.full]),
);
const COUNTRY_FLAG: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c.flag]),
);

const NEW_DAYS = 14;

export default async function ExplorePage({ searchParams }: PageProps) {
  const { country: countryParam } = await searchParams;
  const activeCountry =
    countryParam && COUNTRIES.some((c) => c.code === countryParam)
      ? countryParam
      : null;

  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const [positionsRes, appsRes] = await Promise.all([
    supabase
      .from("positions")
      .select("slug, name, country, created_at")
      .eq("active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("applications")
      .select("id, position_slug")
      .eq("candidate_id", candidateId),
  ]);

  const positions = (positionsRes.data ?? []) as PositionRow[];
  const appliedMap = new Map<string, string>(
    ((appsRes.data ?? []) as Array<{ id: string; position_slug: string }>).map(
      (a) => [a.position_slug, a.id],
    ),
  );

  // Per-country counts (always reflect all positions, not filtered)
  const countByCountry = new Map<string, number>();
  for (const p of positions) {
    countByCountry.set(p.country, (countByCountry.get(p.country) ?? 0) + 1);
  }
  const totalCount = positions.length;

  // Filtered list for display
  const filtered = activeCountry
    ? positions.filter((p) => p.country === activeCountry)
    : positions;

  // "Baru" cutoff
  const newCutoff = Date.now() - NEW_DAYS * 24 * 60 * 60 * 1000;

  // Header copy
  const headerTitle = activeCountry
    ? `Lowongan ${COUNTRY_FULL[activeCountry]}`
    : "Mau ke mana?";
  const headerSub = activeCountry
    ? `${filtered.length} posisi terbuka di ${COUNTRY_FULL[activeCountry]}.`
    : `${totalCount} lowongan terbuka di ${COUNTRIES.length} negara.`;

  return (
    <div className="min-h-screen flex flex-col">
      <TopBarApp title="Jelajah" />

      <main className="flex-1 pb-6">
        {/* Page hero */}
        <section className="px-5 pt-3 pb-1">
          <h1 className="text-[26px] font-extrabold tracking-[-0.025em] leading-tight">
            {headerTitle}
          </h1>
          <p className="text-[13px] text-pg-ink-tertiary mt-1">{headerSub}</p>
        </section>

        {/* Search bar — stub */}
        <section className="px-5 pt-3">
          <div
            className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl"
            style={{
              background: "var(--pg-white)",
              border: "1px solid var(--pg-border)",
              boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 4px 12px rgba(20,20,20,0.04)",
            }}
          >
            <Icon name="search" size={18} className="text-pg-ink-tertiary shrink-0" />
            <span className="text-[14px] text-pg-ink-tertiary">
              Cari posisi (mis. perawat, barista)…
            </span>
          </div>
        </section>

        {/* Country selector — 5-up segmented control */}
        <section className="px-5 pt-4">
          <div
            className="text-[10px] font-bold tracking-[0.12em] uppercase font-mono mb-2.5 pl-1"
            style={{ color: "var(--pg-red-600)" }}
          >
            Negara tujuan
          </div>
          <div
            className="gap-2"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 8,
            }}
          >
            <CountryButton
              href="/explore"
              flag="✦"
              isSpecial
              label="Semua"
              count={totalCount}
              active={!activeCountry}
            />
            {COUNTRIES.map((c) => (
              <CountryButton
                key={c.code}
                href={`/explore?country=${c.code}`}
                flag={c.flag}
                label={c.short}
                count={countByCountry.get(c.code) ?? 0}
                active={activeCountry === c.code}
              />
            ))}
          </div>
        </section>

        {/* Count label */}
        <section className="px-5 pt-5 pb-2 flex justify-between items-baseline">
          <span className="text-[12px] text-pg-ink-tertiary">
            <b
              className="text-pg-ink-primary font-extrabold font-mono"
              style={{ fontSize: 13 }}
            >
              {filtered.length}
            </b>{" "}
            hasil{activeCountry ? ` di ${COUNTRY_FULL[activeCountry]}` : ""}
          </span>
          <span
            className="text-[12px] font-bold"
            style={{ color: "var(--pg-ink-quaternary)" }}
          >
            Terbaru di atas
          </span>
        </section>

        {/* List */}
        <section className="px-5 pt-1 flex flex-col gap-2">
          {filtered.length === 0 ? (
            <div
              className="px-6 py-10 text-center rounded-2xl"
              style={{
                background: "var(--pg-white)",
                border: "1px dashed var(--pg-ink-200)",
              }}
            >
              <div className="text-[14px] font-extrabold text-pg-ink-primary">
                Belum ada posisi
              </div>
              <div className="text-[12px] text-pg-ink-tertiary mt-1 leading-snug">
                {activeCountry
                  ? `Belum ada lowongan ${COUNTRY_FULL[activeCountry]} aktif. Cek negara lain atau coba lagi nanti.`
                  : "Belum ada lowongan aktif. Cek lagi nanti."}
              </div>
            </div>
          ) : (
            filtered.map((p) => {
              const isNew = new Date(p.created_at).getTime() >= newCutoff;
              const existingAppId = appliedMap.get(p.slug);
              const href = existingAppId
                ? `/applications/${existingAppId}`
                : `/applications/new?position=${p.slug}`;
              return (
                <Link
                  key={p.slug}
                  href={href}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl no-underline text-pg-ink-primary"
                  style={{
                    background: "var(--pg-white)",
                    border: "1px solid var(--pg-border)",
                    boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 4px 16px rgba(20,20,20,0.06)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl grid place-items-center shrink-0 text-[18px]"
                    style={{ background: "var(--pg-ink-50)" }}
                  >
                    {COUNTRY_FLAG[p.country] ?? "🌐"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[9px] font-bold tracking-[0.1em] uppercase font-mono"
                      style={{ color: "var(--pg-ink-tertiary)" }}
                    >
                      {COUNTRY_FULL[p.country] ?? p.country}
                    </div>
                    <div className="text-[15px] font-extrabold tracking-[-0.01em] mt-0.5 truncate">
                      {p.name}
                    </div>
                  </div>
                  {existingAppId ? (
                    <span
                      className="text-[9px] font-bold tracking-[0.06em] uppercase px-2 py-0.5 rounded font-mono"
                      style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
                    >
                      Dilamar
                    </span>
                  ) : isNew ? (
                    <span
                      className="text-[9px] font-bold tracking-[0.06em] uppercase px-2 py-0.5 rounded font-mono"
                      style={{
                        background: "var(--pg-red-soft-bg)",
                        color: "var(--pg-red-600)",
                      }}
                    >
                      Baru
                    </span>
                  ) : null}
                  <Icon
                    name="chevron_right"
                    size={16}
                    className="text-pg-ink-quaternary shrink-0"
                  />
                </Link>
              );
            })
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

// ─── Country button (5-up segmented control) ───────────────────────────────

function CountryButton({
  href,
  flag,
  label,
  count,
  active,
  isSpecial,
}: {
  href: string;
  flag: string;
  label: string;
  count: number;
  active: boolean;
  isSpecial?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-1 py-2.5 rounded-2xl no-underline transition-transform"
      style={
        active
          ? {
              background: "var(--pg-ink-primary)",
              border: "1.5px solid var(--pg-ink-primary)",
              boxShadow: "0 4px 12px rgba(20,20,20,0.20), inset 0 1px 0 rgba(255,255,255,0.10)",
            }
          : {
              background: "var(--pg-white)",
              border: "1.5px solid var(--pg-border)",
              boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 4px 12px rgba(20,20,20,0.04)",
            }
      }
    >
      {isSpecial ? (
        <span
          className="w-[22px] h-[22px] rounded-full grid place-items-center text-[13px] font-extrabold"
          style={
            active
              ? { background: "rgba(255,255,255,0.95)", color: "var(--pg-ink-primary)" }
              : {
                  background:
                    "linear-gradient(135deg, var(--pg-red-600), var(--pg-red-700))",
                  color: "#fff",
                }
          }
        >
          {flag}
        </span>
      ) : (
        <span className="text-[22px] leading-none">{flag}</span>
      )}
      <span
        className="text-[11px] font-bold leading-tight"
        style={{ color: active ? "#fff" : "var(--pg-ink-primary)" }}
      >
        {label}
      </span>
      <span
        className="text-[9px] font-bold tracking-[0.04em] font-mono"
        style={{
          color: active ? "rgba(255,255,255,0.7)" : "var(--pg-ink-tertiary)",
        }}
      >
        {count}
      </span>
    </Link>
  );
}
