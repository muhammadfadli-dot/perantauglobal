import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import { KpiStat, Sparkline } from "@/components/admin/Sparkline";
import { isAcceptedStage } from "@/lib/applicationStatus";
import { jakartaDayKey } from "@/lib/datetime";
import { countryLabelFromDb } from "@perantauglobal/db/country";

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

// Day-bucket key in Asia/Jakarta (WIB) — server runs UTC on sin1, so naive local
// keys would mis-bucket evening/midnight WIB activity by up to 7 hours.
const dayKey = jakartaDayKey;

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

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: Range }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range: Range = rangeParam ?? "30d";
  const since = rangeToDate(range);
  const supabase = await createServerClient();

  // Paginate past PostgREST's 1000-row cap for full-table fetches.
  async function fetchAllRows<T>(
    run: (from: number, to: number) => PromiseLike<{ data: T[] | null }>,
  ): Promise<T[]> {
    const out: T[] = [];
    for (let f = 0; ; f += 1000) {
      const { data } = await run(f, f + 999);
      const batch = data ?? [];
      out.push(...batch);
      if (batch.length < 1000) break;
    }
    return out;
  }

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
  ] = await Promise.all([
    // Apps in selected range — for KPIs, leaderboard, sparklines.
    // Paginated past the 1000-row cap so total/stage/city KPIs don't silently
    // plateau as the pool grows (apps already ~973).
    fetchAllRows((f, t) =>
      since
        ? supabase
            .from("applications")
            .select("created_at, pipeline_stage, position_slug")
            .gte("created_at", since)
            .range(f, t)
        : supabase
            .from("applications")
            .select("created_at, pipeline_stage, position_slug")
            .range(f, t),
    ).then((data) => ({ data })),
    // Apps in last 12 weeks — for historical trend (always 12 weeks)
    fetchAllRows((f, t) =>
      supabase
        .from("applications")
        .select("created_at")
        .gte("created_at", twelveWeeksAgoIso)
        .range(f, t),
    ).then((data) => ({ data })),
    supabase
      .from("candidate_documents")
      .select("*", { count: "exact", head: true })
      .eq("verified", false)
      .is("rejected_at", null),
    supabase
      .from("job_orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    fetchAllRows((f, t) =>
      since
        ? supabase
            .from("candidates")
            .select("utm_source, source")
            .gte("created_at", since)
            .range(f, t)
        : supabase.from("candidates").select("utm_source, source").range(f, t),
    ).then((data) => ({ data })),
    fetchAllRows((f, t) => supabase.from("candidates").select("city").range(f, t)).then(
      (data) => ({ data }),
    ),
    fetchAllRows((f, t) =>
      supabase.from("applications").select("pipeline_stage").range(f, t),
    ).then((data) => ({ data })),
    supabase
      .from("job_orders")
      .select(
        "id, intake_label, slot_count, slot_filled, status, position_slug, positions (name)",
      )
      .eq("status", "open")
      .order("created_at", { ascending: false }),
  ]);

  // Advancement + pool-aging are fetched paginated (these grow with the pool and
  // would silently undercount past PostgREST's 1000-row cap).
  const [advancedRows, poolAging] = await Promise.all([
    fetchAllRows<{ application_id: string; changed_at: string }>((f, t) => {
      const q = supabase
        .from("application_status_history")
        .select("application_id, from_stage, changed_at")
        .eq("from_stage", "applied");
      return (since ? q.gte("changed_at", since) : q).range(f, t);
    }),
    fetchAllRows<{ created_at: string }>((f, t) =>
      supabase
        .from("applications")
        .select("created_at")
        .eq("pipeline_stage", "applied")
        .range(f, t),
    ),
  ]);

  // === Range-bound aggregates ===
  const rangeApps = (rangeAppsData ?? []) as Array<{
    created_at: string;
    pipeline_stage: string;
    position_slug: string;
  }>;

  const totalApps = rangeApps.length;
  let acceptedCount = 0;
  const positionApplyCount = new Map<string, number>();

  for (const a of rangeApps) {
    if (isAcceptedStage(a.pipeline_stage)) {
      acceptedCount++;
    }
    positionApplyCount.set(
      a.position_slug,
      (positionApplyCount.get(a.position_slug) ?? 0) + 1,
    );
  }

  // Daily sparkline span matches the KPI's counting window so the trend visual can't
  // silently omit days (90d previously rendered only the last 30). "all" uses a 90-day
  // recent-trend window since an unbounded daily series isn't meaningful in a sparkline.
  const sparklineDays =
    range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 90;
  const sparklineTimestamps = rangeApps.map((a) => a.created_at);
  const inflowSpark = bucketDaily(sparklineTimestamps, sparklineDays, now);
  const acceptedSpark = bucketDaily(
    rangeApps
      .filter((a) => isAcceptedStage(a.pipeline_stage))
      .map((a) => a.created_at),
    sparklineDays,
    now,
  );

  // === Real advancement (from history, by transition time) ===
  // One application can leave 'applied' more than once (re-open) — count distinct.
  const advancedIds = new Set(advancedRows.map((r) => r.application_id));
  const advancedCount = advancedIds.size;
  // Spark: first move-out per application, bucketed by when it happened.
  const firstMoveByApp = new Map<string, string>();
  for (const r of advancedRows) {
    const prev = firstMoveByApp.get(r.application_id);
    if (!prev || new Date(r.changed_at) < new Date(prev)) {
      firstMoveByApp.set(r.application_id, r.changed_at);
    }
  }
  const advancedSpark = bucketDaily([...firstMoveByApp.values()], sparklineDays, now);

  // === Pool aging — how long current 'applied' candidates have waited ===
  let agingFresh = 0; // ≤ 7 days
  let agingWeek = 0; // 8–14 days
  let agingStale = 0; // > 14 days
  for (const a of poolAging) {
    const ageDays = (now.getTime() - new Date(a.created_at).getTime()) / 86_400_000;
    if (ageDays <= 7) agingFresh++;
    else if (ageDays <= 14) agingWeek++;
    else agingStale++;
  }
  const agingTotal = poolAging.length;

  // === 12-week historical trend ===
  const trendTimestamps = ((trendAppsData ?? []) as { created_at: string }[]).map(
    (a) => a.created_at,
  );
  const weeklyTrend = bucketWeekly(trendTimestamps, now);

  // === Funnel (range-bound) ===
  // Starts at "Lamaran dibuat" so every step is a true subset of the prior — a
  // "Candidate created" first step let conv% exceed 100% (one candidate can file
  // multiple lamaran, so lamaran/candidate is not a funnel conversion).
  const funnel = [
    { label: "Lamaran dibuat", value: totalApps },
    { label: "Maju dari pool", value: advancedCount },
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
            label="Maju dari pool"
            value={advancedCount}
            sparkline={advancedSpark}
            caption="Diproses dari pool (by transition)"
          />
          <KpiStat
            label="Diterima"
            value={acceptedCount}
            sparkline={acceptedSpark}
            deltaTone={acceptedCount > 0 ? "ok" : "mute"}
            caption={acceptedCount > 0 ? "selected→active" : "Belum ada penempatan"}
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

        {/* Pool aging — how long current applied candidates have waited */}
        <section>
          <Eyebrow>Antrian pool — usia lamaran belum ditindak</Eyebrow>
          <div
            className="mt-3 grid gap-3 sm:grid-cols-3"
          >
            <AgingCard label="≤ 7 hari" value={agingFresh} total={agingTotal} tone="ok" />
            <AgingCard label="8–14 hari" value={agingWeek} total={agingTotal} tone="warn" />
            <AgingCard
              label="> 14 hari (basi)"
              value={agingStale}
              total={agingTotal}
              tone="err"
            />
          </div>
          <p className="mt-2 text-[12px] text-pg-ink-tertiary">
            {agingTotal} lamaran masih di pool (stage <span className="font-mono">applied</span>, belum ditarik ke job order).
            {agingStale > 0
              ? ` ${agingStale} sudah > 14 hari — prioritaskan triage atau tolak.`
              : ""}
          </p>
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
                          {countryLabelFromDb(p.country, p.country)}
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

function AgingCard({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "ok" | "warn" | "err";
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const fg =
    tone === "ok"
      ? "var(--pg-ok-soft-fg)"
      : tone === "warn"
      ? "var(--pg-warn-soft-fg)"
      : "var(--pg-err)";
  return (
    <div
      className="bg-pg-white rounded-2xl p-5"
      style={{ border: "1px solid var(--pg-border)" }}
    >
      <div
        className="text-[10px] font-semibold tracking-[0.1em] uppercase"
        style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
      <div className="text-[32px] font-extrabold leading-[40px] mt-1.5" style={{ color: fg }}>
        {value}
      </div>
      <div className="text-[12px] font-semibold mt-0.5" style={{ color: "var(--pg-ink-tertiary)" }}>
        {pct}% dari antrian
      </div>
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
