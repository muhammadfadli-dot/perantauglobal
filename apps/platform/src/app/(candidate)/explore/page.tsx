import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import { BerandaTopBar, SectionHead } from "@/components/pg/candidate/BerandaShared";
import {
  CountryFilterTile,
  FeaturedJobCard,
  RowJobCard,
  normalizeCountry,
  type CountryKey,
  type JobCardData,
} from "@/components/pg/candidate/LowonganTiles";
import {
  COUNTRY_META,
  COUNTRY_KEYS,
  COUNTRY_DB_VALUE,
  cityForSlug,
} from "@perantauglobal/db/country";

export const dynamic = "force-dynamic";

type PositionRow = {
  slug: string;
  name: string;
  country: string;
  created_at: string;
  content: unknown;
};

type JobOrderRow = {
  position_slug: string;
  intake_label: string;
  slot_count: number;
  slot_filled: number;
  deadline: string | null;
};

interface PageProps {
  searchParams: Promise<{ country?: string; position?: string }>;
}

const NEW_DAYS = 14;

function pickCardMeta(content: unknown): {
  salary?: string;
  salaryNote?: string;
} {
  if (!content || typeof content !== "object" || Array.isArray(content)) return {};
  const obj = content as Record<string, unknown>;
  if (!obj.cardMeta || typeof obj.cardMeta !== "object" || Array.isArray(obj.cardMeta)) return {};
  const meta = obj.cardMeta as Record<string, unknown>;
  return {
    salary: typeof meta.salary === "string" ? meta.salary : undefined,
    salaryNote: typeof meta.salaryNote === "string" ? meta.salaryNote : undefined,
  };
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const { country: countryParam } = await searchParams;
  const activeCountry = countryParam ? normalizeCountry(countryParam) : null;

  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const [positionsRes, appsRes, joRes] = await Promise.all([
    supabase
      .from("positions")
      .select("slug, name, country, created_at, content")
      .eq("active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("applications")
      .select("id, position_slug")
      .eq("candidate_id", candidateId),
    supabase
      .from("job_orders")
      .select("position_slug, intake_label, slot_count, slot_filled, deadline")
      .eq("status", "open")
      .order("created_at", { ascending: false }),
  ]);

  const positions = (positionsRes.data ?? []) as PositionRow[];
  const applied = (appsRes.data ?? []) as Array<{ id: string; position_slug: string }>;
  const jobOrders = (joRes.data ?? []) as JobOrderRow[];

  const appliedMap = new Map(applied.map((a) => [a.position_slug, a.id]));
  const joBySlug = new Map<string, JobOrderRow>();
  for (const jo of jobOrders) {
    if (!joBySlug.has(jo.position_slug)) joBySlug.set(jo.position_slug, jo);
  }

  // Shape positions → JobCardData with status + batch + applied
  const all: JobCardData[] = [];
  for (const p of positions) {
    const country = normalizeCountry(p.country);
    if (!country) continue;
    const jo = joBySlug.get(p.slug);
    const meta = pickCardMeta(p.content);
    const appliedId = appliedMap.get(p.slug);
    all.push({
      slug: p.slug,
      name: p.name,
      country,
      city: cityForSlug(p.slug, country),
      salary: meta.salary ?? "—",
      salaryNote: meta.salaryNote,
      status: jo ? "open" : "queue",
      batch: jo
        ? {
            label: jo.intake_label,
            slotsFilled: jo.slot_filled,
            slotsTotal: jo.slot_count,
            deadline: jo.deadline
              ? new Date(jo.deadline).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })
              : undefined,
          }
        : undefined,
      appliedHref: appliedId ? `/applications/${appliedId}` : undefined,
    });
  }

  // Per-country counts (all, pre-filter) — derived over every known country.
  const counts = Object.fromEntries(
    COUNTRY_KEYS.map((k) => [k, 0]),
  ) as Record<CountryKey, number>;
  for (const j of all) counts[j.country]++;
  // Only surface tiles for countries that actually have active positions, so a
  // newly-advertised country (e.g. europe) appears automatically and an empty
  // one never shows a dead filter.
  const presentKeys = COUNTRY_KEYS.filter((k) => counts[k] > 0);

  const filtered = activeCountry ? all.filter((j) => j.country === activeCountry) : all;
  const open = filtered.filter((j) => j.status === "open");
  const queue = filtered.filter((j) => j.status === "queue");

  // eslint-disable-next-line react-hooks/purity -- per-request "baru" cutoff; non-idempotent by design in this RSC
  const cutoff = Date.now() - NEW_DAYS * 24 * 60 * 60 * 1000;
  const posByCreated = new Map(positions.map((p) => [p.slug, new Date(p.created_at).getTime()]));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <BerandaTopBar />
      <main className="flex-1 pb-8 pt-1">
        {/* Hero */}
        <div className="px-5 pb-3.5">
          <h1
            className="font-extrabold tracking-[-0.025em] leading-[1.1] text-pg-ink-900 m-0 text-balance"
            style={{ fontSize: "clamp(22px, 6vw, 28px)" }}
          >
            Mau ke mana?
          </h1>
          <p className="text-[13px] text-pg-ink-500 mt-1 m-0">
            {all.length} posisi · {presentKeys.length} negara · resmi P3MI
          </p>
        </div>

        {/* Country picker — horizontal rich tiles */}
        <div className="pt-5">
          <div className="px-5 mb-2">
            <SectionHead title="Negara tujuan" sub="Tap untuk filter" />
          </div>
          <div className="pl-5">
            <div className="flex gap-3 overflow-x-auto pb-1 pr-5 scrollbar-none" style={{ scrollbarWidth: "none" as const }}>
              <CountryFilterTile
                kind="all"
                count={all.length}
                active={!activeCountry}
                href="/explore"
              />
              {presentKeys.map((k) => (
                <CountryFilterTile
                  key={k}
                  kind="country"
                  countryKey={k}
                  count={counts[k]}
                  active={activeCountry === k}
                  href={`/explore?country=${COUNTRY_DB_VALUE[k]}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Active filter chip — reset */}
        {activeCountry && (
          <div className="px-5 pt-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full bg-pg-ink-900 text-white no-underline font-mono text-[11px] font-bold tracking-[0.04em]"
            >
              <span aria-hidden className="text-[12px] leading-none">
                {COUNTRY_META[activeCountry].flag}
              </span>
              {COUNTRY_META[activeCountry].label} · {filtered.length}
              <span aria-hidden className="ml-1 inline-grid place-items-center w-4 h-4 rounded-full bg-white/15">
                <Icon name="x" size={9} stroke={2.5} />
              </span>
            </Link>
          </div>
        )}

        {/* Lagi buka — Featured cards */}
        {open.length > 0 && (
          <div className="px-5 pt-6">
            <SectionHead title="Lagi buka pendaftaran" sub="Batch dengan jadwal jelas" />
            <div className="flex flex-col gap-3.5">
              {open.map((j) => (
                <FeaturedJobCard
                  key={j.slug}
                  job={j}
                  newApplyHref={`/applications/new?position=${j.slug}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Daftar antrian — Row cards */}
        <div className="px-5 pt-6">
          <SectionHead
            title={activeCountry ? "Daftar antrian" : "Daftar antrian aktif"}
            sub={`${queue.length} posisi · daftar untuk masuk queue batch berikutnya`}
          />
          {queue.length === 0 ? (
            <div
              className="px-4 py-8 rounded-[14px] text-center text-[13px] text-pg-ink-500"
              style={{
                background: "var(--pg-white)",
                border: "1px dashed var(--pg-ink-200)",
              }}
            >
              {open.length > 0
                ? "Semua posisi di negara ini sedang lagi buka."
                : "Belum ada posisi antrian aktif."}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {queue.map((j) => {
                const isNew =
                  (posByCreated.get(j.slug) ?? 0) >= cutoff;
                return (
                  <RowJobCard
                    key={j.slug}
                    job={j}
                    newApplyHref={`/applications/new?position=${j.slug}`}
                    isNew={isNew}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
