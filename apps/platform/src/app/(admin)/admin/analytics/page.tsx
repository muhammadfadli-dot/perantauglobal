import { createServerClient } from "@/lib/supabase-server";
import { Icon } from "@/components/pg/Icon";

export const dynamic = "force-dynamic";

type Range = "7d" | "30d" | "90d" | "all";

const RANGE_LABEL: Record<Range, string> = {
  "7d": "7 hari terakhir",
  "30d": "30 hari terakhir",
  "90d": "90 hari terakhir",
  all: "Semua waktu",
};

function rangeToDate(range: Range): string | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
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

  // Funnel: pending → candidates → applications → placed
  const sinceFilter = since ? `.gte("created_at", "${since}")` : "";
  void sinceFilter;

  const [
    { count: pendingTotal },
    { count: candidateTotal },
    { count: applicationTotal },
    { count: placedTotal },
    { data: utmData },
    { data: countryData },
    { data: stageData },
    { data: openJobOrders },
  ] = await Promise.all([
    since
      ? supabase.from("pending_submissions").select("*", { count: "exact", head: true }).gte("created_at", since)
      : supabase.from("pending_submissions").select("*", { count: "exact", head: true }),
    since
      ? supabase.from("candidates").select("*", { count: "exact", head: true }).gte("created_at", since)
      : supabase.from("candidates").select("*", { count: "exact", head: true }),
    since
      ? supabase.from("applications").select("*", { count: "exact", head: true }).gte("created_at", since)
      : supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }).in("pipeline_stage", ["selected", "training", "deployed", "active"]),
    since
      ? supabase.from("candidates").select("utm_source, source").gte("created_at", since)
      : supabase.from("candidates").select("utm_source, source"),
    supabase.from("candidates").select("city"),
    supabase.from("applications").select("pipeline_stage"),
    supabase.from("job_orders").select("id, intake_label, slot_count, slot_filled, status, position_slug, positions (name)").eq("status", "open").order("created_at", { ascending: false }),
  ]);

  // Source attribution
  const sources = (utmData ?? []) as Array<{ utm_source: string | null; source: string | null }>;
  const sourceCounts = new Map<string, number>();
  for (const s of sources) {
    const key = s.utm_source || s.source || "direct";
    sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1);
  }
  const topSources = Array.from(sourceCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Top cities
  const cities = (countryData ?? []) as Array<{ city: string | null }>;
  const cityCounts = new Map<string, number>();
  for (const c of cities) {
    const key = c.city || "Tidak diisi";
    cityCounts.set(key, (cityCounts.get(key) ?? 0) + 1);
  }
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Stage breakdown
  const stages = (stageData ?? []) as Array<{ pipeline_stage: string }>;
  const stageCounts = new Map<string, number>();
  for (const s of stages) {
    stageCounts.set(s.pipeline_stage, (stageCounts.get(s.pipeline_stage) ?? 0) + 1);
  }
  const stageRanked = Array.from(stageCounts.entries()).sort((a, b) => b[1] - a[1]);

  type JOStat = { id: string; intake_label: string; slot_count: number; slot_filled: number; positions: { name: string } | null };
  const jos = (openJobOrders ?? []) as unknown as JOStat[];

  // Funnel rates
  const funnel = [
    { label: "Form submit", value: pendingTotal ?? 0 },
    { label: "Candidate created", value: candidateTotal ?? 0 },
    { label: "Lamaran dibuat", value: applicationTotal ?? 0 },
    { label: "Diterima", value: placedTotal ?? 0 },
  ];
  const funnelMax = Math.max(...funnel.map((f) => f.value), 1);

  return (
    <main className="p-6 lg:p-10 max-w-6xl">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            Admin / Analytics
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">Analytics</h1>
        </div>
        <div className="flex gap-1.5 bg-pg-ink-100 rounded-full p-1">
          {(["7d", "30d", "90d", "all"] as const).map((r) => {
            const active = range === r;
            return (
              <a
                key={r}
                href={`/admin/analytics?range=${r}`}
                className={`inline-flex items-center justify-center min-h-[32px] px-3 text-[12px] font-bold rounded-full no-underline transition-colors ${
                  active ? "bg-pg-white text-pg-ink-900 shadow-sm" : "text-pg-ink-500"
                }`}
              >
                {RANGE_LABEL[r]}
              </a>
            );
          })}
        </div>
      </div>

      {/* Funnel */}
      <section className="mt-8">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-3">
          Funnel — {RANGE_LABEL[range]}
        </div>
        <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
          <div className="grid gap-3">
            {funnel.map((f, i) => {
              const pct = (f.value / funnelMax) * 100;
              const conv = i > 0 && funnel[i - 1].value > 0
                ? Math.round((f.value / funnel[i - 1].value) * 100)
                : null;
              return (
                <div key={f.label} className="grid grid-cols-[160px_1fr_60px_60px] gap-4 items-center">
                  <div className="text-sm font-bold">{f.label}</div>
                  <div className="h-7 bg-pg-ink-50 rounded-md overflow-hidden">
                    <div
                      className="h-full"
                      style={{ width: `${pct}%`, background: "var(--pg-red-600)" }}
                    />
                  </div>
                  <div className="text-base font-extrabold tabular-nums text-right">{f.value}</div>
                  <div className="text-[12px] text-pg-ink-500 text-right tabular-nums">
                    {conv !== null ? `${conv}%` : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Source attribution */}
        <section>
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-2.5">
            Source attribution (top 8)
          </div>
          <DataList items={topSources} />
        </section>

        {/* Top cities */}
        <section>
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-2.5">
            Top kota kandidat (top 8)
          </div>
          <DataList items={topCities} />
        </section>

        {/* Stage breakdown */}
        <section>
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-2.5">
            Distribusi pipeline stage
          </div>
          <DataList items={stageRanked} />
        </section>

      </div>

      {/* Open job orders performance */}
      <section className="mt-6">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-2.5">
          Job orders aktif — slot fill rate
        </div>
        <div className="bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
          {jos.length === 0 ? (
            <div className="p-5 text-center text-sm text-pg-ink-500">Tidak ada job order aktif.</div>
          ) : (
            jos.map((jo, i) => {
              const pct = jo.slot_count > 0 ? Math.round((jo.slot_filled / jo.slot_count) * 100) : 0;
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
                      <div className="text-[12px] text-pg-ink-500 mt-0.5">{jo.intake_label}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-extrabold tabular-nums">
                        {jo.slot_filled}/{jo.slot_count}
                      </div>
                      <div className="text-[11px] text-pg-ink-500 tabular-nums">{pct}%</div>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-pg-ink-100 rounded-full overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 100 ? "var(--pg-info)" : "var(--pg-ok)",
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <div
        className="mt-6 px-4 py-3.5 rounded-xl flex items-start gap-3"
        style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
      >
        <Icon name="info" size={18} className="shrink-0 mt-0.5" />
        <div className="text-[13px] leading-relaxed">
          Charts ini dihitung server-side dari raw data. Untuk dashboard lebih advanced (cohort
          analysis, time-in-stage avg, conversion by source), bisa pipe data ke tool BI di phase
          berikutnya.
        </div>
      </div>
    </main>
  );
}

function DataList({ items }: { items: [string, number][] }) {
  const max = Math.max(...items.map((i) => i[1]), 1);
  return (
    <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-3">
      {items.length === 0 ? (
        <div className="py-5 text-center text-sm text-pg-ink-500">Belum ada data</div>
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
                    style={{ width: `${pct}%`, background: "var(--pg-red-600)" }}
                  />
                </div>
              </div>
              <div className="text-[13px] font-extrabold tabular-nums text-right">{value}</div>
            </div>
          );
        })
      )}
    </div>
  );
}
