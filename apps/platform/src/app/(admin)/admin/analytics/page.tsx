import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import { KpiStat, Sparkline } from "@/components/admin/Sparkline";

export const dynamic = "force-dynamic";

type Range = "7d" | "30d" | "90d" | "all";

const RANGE_LABEL: Record<Range, string> = {
  "7d": "7 hari terakhir",
  "30d": "30 hari terakhir",
  "90d": "90 hari terakhir",
  all: "Semua waktu",
};

const RANGE_DAYS: Record<Range, number | null> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  all: null,
};

function rangeToDate(range: Range): string | null {
  const days = RANGE_DAYS[range];
  if (days == null) return null;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Drop-in helper to bucket a series of timestamps into N daily slots,
 *  most-recent on the right (Sparkline's expected order). */
function bucketDaily(timestamps: string[], days: number, now: Date): number[] {
  const counts = new Map<string, number>();
  for (const ts of timestamps) {
    const d = new Date(ts);
    counts.set(dayKey(d), (counts.get(dayKey(d)) ?? 0) + 1);
  }
  const series: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    series.push(counts.get(dayKey(d)) ?? 0);
  }
  return series;
}

/** Bucket timestamps into 12 weekly slots ending today (most-recent on right). */
function bucketWeekly(timestamps: string[], now: Date): number[] {
  const series = new Array(12).fill(0) as number[];
  const cutoff = now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000;
  for (const ts of timestamps) {
    const t = new Date(ts).getTime();
    if (t < cutoff) continue;
    const weeksAgo = Math.floor((now.getTime() - t) / (7 * 24 * 60 * 60 * 1000));
    const idx = 11 - weeksAgo;
    if (idx < 0 || idx > 11) continue;
    series[idx] += 1;
  }
  return series;
}

const COUNTRY_LABEL: Record<string, string> = {
  saudi_arabia: "Saudi Arabia",
  japan: "Jepang",
  taiwan: "Taiwan",
  indonesia: "Indonesia",
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: Range }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range: Range = rangeParam ?? "30d";
  const since = rangeToDate(range);
  const supabase = await createServerClient();

  // eslint-disable-next-line react-hooks/purity -- per-request time anchor for daily/weekly buckets
  const now = new Date();
  const twelveWeeksAgoIso = new Date(
    now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  // === Parallel data fetch ===
  const [
    { data: rangeAppsData },
    { data: trendAppsData },
    { count: pendingDocs },
    { count: openJobOrdersCount },
    { data: utmData },
    { data: countryData },
    { data: stageData },
    { data: openJobOrders },
    { count: candidateRange },
  ] = await Promise.all([
    // Apps in selected range — for KPIs, leaderboard, sparklines
    since
      ? supabase
          .from("applications")
          .select("created_at, pipeline_stage, position_slug")
          .gte("created_at", since)
      : supabase
          .from("applications")
          .select("created_at, pipeline_stage, position_slug"),
    // Apps in last 12 weeks — for historical trend (always 12 weeks)
    supabase
      .from("applications")
      .select("created_at")
      .gte("created_at", twelveWeeksAgoIso),
    supabase
      .from("candidate_documents")
      .select("*", { count: "exact", head: true })
      .eq("verified", false)
      .is("rejected_at", null),
    supabase
      .from("job_orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    since
      ? supabase
          .from("candidates")
          .select("utm_source, source")
          .gte("created_at", since)
      : supabase.from("candidates").select("utm_source, source"),
    supabase.from("candidates").select("city"),
    supabase.from("applications").select("pipeline_stage"),
    supabase
      .from("job_orders")
      .select(
        "id, intake_label, slot_count, slot_filled, status, position_slug, positions (name)",
      )
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    since
      ? supabase
          .from("candidates")
          .select("*", { count: "exact", head: true })
          .gte("created_at", since)
      : supabase.from("candidates").select("*", { count: "exact", head: true }),
  ]);

  // === Range-bound aggregates ===
  const rangeApps = (rangeAppsData ?? []) as Array<{
    created_at: string;
    pipeline_stage: string;
    position_slug: string;
  }>;

  const totalApps = rangeApps.length;
  let screeningCount = 0;
  let acceptedCount = 0;
  const positionApplyCount = new Map<string, number>();

  for (const a of rangeApps) {
    if (a.pipeline_stage === "screening") screeningCount++;
    if (
      a.pipeline_stage === "selected" ||
      a.pipeline_stage === "training" ||
      a.pipeline_stage === "deployed" ||
      a.pipeline_stage === "active"
    ) {
      acceptedCount++;
    }
    positionApplyCount.set(
      a.position_slug,
      (positionApplyCount.get(a.position_slug) ?? 0) + 1,
    );
  }

  const conversionPct = totalApps > 0 ? Math.round((screeningCount / totalApps) * 100) : null;

  // Daily sparkline series (capped at 30 daily slots for visual sanity; longer ranges get weekly resolution elsewhere)
  const sparklineDays =
    range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 30 : 30;
  const sparklineTimestamps = rangeApps.map((a) => a.created_at);
  const inflowSpark = bucketDaily(sparklineTimestamps, sparklineDays, now);
  const screeningSpark = bucketDaily(
    rangeApps.filter((a) => a.pipeline_stage === "screening").map((a) => a.created_at),
    sparklineDays,
    now,
  );
  const acceptedSpark = bucketDaily(
    rangeApps
      .filter(
        (a) =>
          a.pipeline_stage === "selected" ||
          a.pipeline_stage === "training" ||
          a.pipeline_stage === "deployed" ||
          a.pipeline_stage === "active",
      )
      .map((a) => a.created_at),
    sparklineDays,
    now,
  );

  // === 12-week historical trend ===
  const trendTimestamps = ((trendAppsData ?? []) as { created_at: string }[]).map(
    (a) => a.created_at,
  );
  const weeklyTrend = bucketWeekly(trendTimestamps, now);

  // === Funnel (entire database, not range-bound — matches existing semantics) ===
  // For range-bound funnel use the rangeApps + pendingTotal vs candidateRange
  const funnel = [
    { label: "Candidate created", value: candidateRange ?? 0 },
    { label: "Lamaran dibuat", value: totalApps },
    { label: "Maju ke screening", value: screeningCount },
    { label: "Diterima", value: acceptedCount },
  ];
  const funnelMax = Math.max(...funnel.map((f) => f.value), 1);

  // === Leaderboard — top 5 positions by apply count in range ===
  const topSlugs = [...positionApplyCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  type PosMeta = { slug: string; name: string; country: string };
  let leaderboard: { slug: string; name: string; country: string; count: number }[] = [];
  if (topSlugs.length > 0) {
    const { data: meta } = await supabase
      .from("positions")
      .select("slug, name, country")
      .in(
        "slug",
        topSlugs.map(([s]) => s),
      );
    const metaMap = new Map(((meta ?? []) as PosMeta[]).map((m) => [m.slug, m]));
    leaderboard = topSlugs.map(([slug, count]) => {
      const m = metaMap.get(slug);
      return {
        slug,
        name: m?.name ?? slug,
        country: m?.country ?? "—",
        count,
      };
    });
  }
  const leaderboardMax = Math.max(...leaderboard.map((l) => l.count), 1);

  // === Source attribution ===
  const sources = (utmData ?? []) as Array<{
    utm_source: string | null;
    source: string | null;
  }>;
  const sourceCounts = new Map<string, number>();
  for (const s of sources) {
    const key = s.utm_source || s.source || "direct";
    sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1);
  }
  const topSources = Array.from(sourceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // === Top cities ===
  const cities = (countryData ?? []) as Array<{ city: string | null }>;
  const cityCounts = new Map<string, number>();
  for (const c of cities) {
    const key = c.city || "Tidak diisi";
    cityCounts.set(key, (cityCounts.get(key) ?? 0) + 1);
  }
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // === Stage breakdown ===
  const stages = (stageData ?? []) as Array<{ pipeline_stage: string }>;
  const stageCounts = new Map<string, number>();
  for (const s of stages) {
    stageCounts.set(s.pipeline_stage, (stageCounts.get(s.pipeline_stage) ?? 0) + 1);
  }
  const stageRanked = Array.from(stageCounts.entries()).sort((a, b) => b[1] - a[1]);

  type JOStat = {
    id: string;
    intake_label: string;
    slot_count: number;
    slot_filled: number;
    positions: { name: string } | null;
  };
  const jos = (openJobOrders ?? []) as unknown as JOStat[];

  return (
    <>
      <AdminTopBar
        crumbs={[{ label: "Operasi" }, { label: "Analytics", emphasis: true }]}
      />
      <main className="px-8 py-7 flex flex-col gap-6 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <Eyebrow>Analytics</Eyebrow>
            <h1 className="text-[32px] font-extrabold leading-[36px] tracking-[-0.025em] text-pg-ink-primary">
              Performa pipeline
            </h1>
            <p className="text-[14px] text-pg-ink-tertiary leading-[22px]">
              KPI rentang waktu, trend 12 minggu, top performer posisi, dan distribusi
              source. Filter rentang waktu di kanan — trend historis tetap 12 minggu.
            </p>
          </div>
          <RangeFilter range={range} />
        </div>

        {/* KPI hero */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <KpiStat
            label="Lamaran"
            value={totalApps}
            sparkline={inflowSpark}
            caption={RANGE_LABEL[range]}
          />
          <KpiStat
            label="Maju ke screening"
            value={screeningCount}
            sparkline={screeningSpark}
            caption={
              conversionPct != null ? `${conversionPct}% conv` : "Belum ada data"
            }
          />
          <KpiStat
            label="Diterima"
            value={acceptedCount}
            sparkline={acceptedSpark}
            deltaTone="ok"
            caption="selected/training/deployed/active"
          />
          <KpiStat
            label="Job orders open"
            value={openJobOrdersCount ?? 0}
            caption="snapshot saat ini"
          />
          <KpiStat
            label="Doc pending"
            value={pendingDocs ?? 0}
            delta={(pendingDocs ?? 0) > 5 ? "Perlu review" : undefined}
            deltaTone={(pendingDocs ?? 0) > 5 ? "warn" : "mute"}
            caption="snapshot saat ini"
          />
        </div>

        {/* 12-week historical trend */}
        <section
          className="bg-pg-white rounded-2xl p-6 flex flex-col gap-3.5"
          style={{ border: "1px solid var(--pg-border)" }}
        >
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex flex-col gap-0.5">
              <Eyebrow>12 minggu terakhir</Eyebrow>
              <div className="text-[18px] font-extrabold leading-[22px] tracking-[-0.01em] text-pg-ink-primary">
                Trend lamaran historis
              </div>
              <div className="text-[12px] text-pg-ink-tertiary">
                Total {weeklyTrend.reduce((s, n) => s + n, 0)} lamaran · puncak{" "}
                {Math.max(...weeklyTrend, 0)}/minggu
              </div>
            </div>
          </div>
          <Sparkline data={weeklyTrend} width={1200} height={84} barGap={6} />
          <div className="flex justify-between text-[10px] tabular-nums" style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}>
            <span>12mg lalu</span>
            <span>8mg lalu</span>
            <span>4mg lalu</span>
            <span>Minggu ini</span>
          </div>
        </section>

        {/* Funnel — range-bound */}
        <section>
          <Eyebrow>Funnel · {RANGE_LABEL[range]}</Eyebrow>
          <div
            className="mt-3 bg-pg-white border rounded-2xl p-5"
            style={{ borderColor: "var(--pg-border)" }}
          >
            <div className="grid gap-3">
              {funnel.map((f, i) => {
                const pct = (f.value / funnelMax) * 100;
                const conv =
                  i > 0 && funnel[i - 1].value > 0
                    ? Math.round((f.value / funnel[i - 1].value) * 100)
                    : null;
                return (
                  <div
                    key={f.label}
                    className="grid grid-cols-[160px_1fr_60px_60px] gap-4 items-center"
                  >
                    <div className="text-sm font-bold">{f.label}</div>
                    <div className="h-7 bg-pg-ink-50 rounded-md overflow-hidden">
                      <div
                        className="h-full"
                        style={{ width: `${pct}%`, background: "var(--pg-red-600)" }}
                      />
                    </div>
                    <div className="text-base font-extrabold tabular-nums text-right">
                      {f.value}
                    </div>
                    <div className="text-[12px] text-pg-ink-tertiary text-right tabular-nums">
                      {conv !== null ? `${conv}%` : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Leaderboard */}
          <section>
            <Eyebrow>Top performer · {RANGE_LABEL[range]}</Eyebrow>
            <div
              className="mt-3 bg-pg-white border rounded-2xl p-2"
              style={{ borderColor: "var(--pg-border)" }}
            >
              {leaderboard.length === 0 ? (
                <div className="py-8 text-center text-[13px] text-pg-ink-tertiary">
                  Belum ada lamaran di rentang waktu ini.
                </div>
              ) : (
                leaderboard.map((p, i) => {
                  const pct = (p.count / leaderboardMax) * 100;
                  return (
                    <Link
                      key={p.slug}
                      href={`/admin/positions/${p.slug}`}
                      className="grid grid-cols-[28px_1fr_64px] gap-3 items-center px-3 py-2.5 rounded-xl no-underline hover:bg-pg-paper"
                    >
                      <span
                        className="font-mono text-[11px] font-bold text-pg-ink-tertiary text-center"
                      >
                        #{i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-pg-ink-primary truncate">
                          {p.name}
                        </div>
                        <div
                          className="text-[10.5px] mt-0.5"
                          style={{
                            color: "var(--pg-ink-tertiary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {COUNTRY_LABEL[p.country] ?? p.country}
                        </div>
                        <div className="mt-1.5 h-1 bg-pg-ink-100 rounded-full overflow-hidden">
                          <div
                            className="h-full"
                            style={{
                              width: `${pct}%`,
                              background: "var(--pg-red-600)",
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[18px] font-extrabold tabular-nums leading-none">
                          {p.count}
                        </div>
                        <div className="text-[10px] text-pg-ink-tertiary mt-0.5">
                          lamaran
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>

          {/* Source attribution */}
          <section>
            <Eyebrow>Source attribution · {RANGE_LABEL[range]}</Eyebrow>
            <DataList items={topSources} />
          </section>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section>
            <Eyebrow>Top kota kandidat</Eyebrow>
            <DataList items={topCities} />
          </section>

          <section>
            <Eyebrow>Distribusi pipeline stage</Eyebrow>
            <DataList items={stageRanked} />
          </section>
        </div>

        {/* Open job orders performance */}
        <section>
          <Eyebrow>Job orders aktif — slot fill rate</Eyebrow>
          <div
            className="mt-3 bg-pg-white border rounded-2xl overflow-hidden"
            style={{ borderColor: "var(--pg-border)" }}
          >
            {jos.length === 0 ? (
              <div className="p-5 text-center text-sm text-pg-ink-tertiary">
                Tidak ada job order aktif.
              </div>
            ) : (
              jos.map((jo, i) => {
                const pct =
                  jo.slot_count > 0
                    ? Math.round((jo.slot_filled / jo.slot_count) * 100)
                    : 0;
                return (
                  <div
                    key={jo.id}
                    className={`px-5 py-3.5 ${i ? "border-t border-pg-ink-100" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[14px] font-bold truncate">
                          {jo.positions?.name ?? "—"}
                        </div>
                        <div className="text-[12px] text-pg-ink-tertiary mt-0.5">
                          {jo.intake_label}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[14px] font-extrabold tabular-nums">
                          {jo.slot_filled}/{jo.slot_count}
                        </div>
                        <div className="text-[11px] text-pg-ink-tertiary tabular-nums">
                          {pct}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 bg-pg-ink-100 rounded-full overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${pct}%`,
                          background:
                            pct >= 100 ? "var(--pg-info)" : "var(--pg-ok)",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[11px] font-semibold tracking-[0.12em] leading-[14px] uppercase"
      style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
    >
      {children}
    </div>
  );
}

function RangeFilter({ range }: { range: Range }) {
  const ranges: Range[] = ["7d", "30d", "90d", "all"];
  return (
    <div
      className="inline-flex gap-0.5 rounded-full p-0.5"
      style={{ background: "var(--pg-paper)" }}
    >
      {ranges.map((r) => {
        const active = range === r;
        return (
          <Link
            key={r}
            href={`/admin/analytics?range=${r}`}
            scroll={false}
            className="inline-flex items-center justify-center min-h-[28px] px-3 text-[11px] font-bold rounded-full no-underline tabular-nums transition-colors"
            style={{
              background: active ? "var(--pg-white)" : "transparent",
              color: active ? "var(--pg-ink-primary)" : "var(--pg-ink-tertiary)",
              boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              fontFamily: "var(--font-mono)",
            }}
          >
            {RANGE_LABEL[r]}
          </Link>
        );
      })}
    </div>
  );
}

function DataList({ items }: { items: [string, number][] }) {
  const max = Math.max(...items.map((i) => i[1]), 1);
  return (
    <div
      className="mt-3 bg-pg-white border rounded-2xl p-3"
      style={{ borderColor: "var(--pg-border)" }}
    >
      {items.length === 0 ? (
        <div className="py-5 text-center text-sm text-pg-ink-tertiary">
          Belum ada data
        </div>
      ) : (
        items.map(([label, value], i) => {
          const pct = (value / max) * 100;
          return (
            <div
              key={label}
              className={`grid grid-cols-[1fr_60px] gap-3 items-center px-2 py-2 ${
                i ? "border-t border-pg-ink-100" : ""
              }`}
            >
              <div>
                <div className="text-[13px] font-semibold">{label}</div>
                <div className="mt-1 h-1.5 bg-pg-ink-100 rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${pct}%`,
                      background: "var(--pg-red-600)",
                    }}
                  />
                </div>
              </div>
              <div className="text-[13px] font-extrabold tabular-nums text-right">
                {value}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
