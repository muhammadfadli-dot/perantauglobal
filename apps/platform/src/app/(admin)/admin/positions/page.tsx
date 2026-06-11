import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import { Icon } from "@/components/pg/Icon";
import { Sparkline } from "@/components/admin/Sparkline";
import { jakartaDayKey } from "@/lib/datetime";
import {
  countryLabelFromDb,
  countryInitialsFromDb,
} from "@perantauglobal/db/country";

/**
 * Compute days-ago index in Asia/Jakarta time (most recent = 0, 6 days ago = 6).
 * Server runs UTC on sin1, so bucketing must use the WIB calendar day to avoid
 * mis-attributing evening/midnight WIB applies to the wrong day.
 */
function daysAgoLocal(ts: Date, now: Date): number {
  const tsMid = Date.parse(`${jakartaDayKey(ts)}T00:00:00Z`);
  const nowMid = Date.parse(`${jakartaDayKey(now)}T00:00:00Z`);
  return Math.round((nowMid - tsMid) / (24 * 60 * 60 * 1000));
}

export const dynamic = "force-dynamic";

type PositionRow = {
  slug: string;
  name: string;
  country: string;
  active: boolean;
  updated_at: string;
};

type Search = { tab?: string };

export default async function AdminPositionsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const tab = sp.tab ?? "all";

  const supabase = await createServerClient();

  const now = new Date();
  const sevenDaysAgoIso = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [
    { data: positionsData },
    { data: jobOrdersData },
    { data: appsData },
    { data: weekAppsData },
    { data: readinessData },
    { count: candidateCount },
    { count: weekApps },
  ] = await Promise.all([
    supabase
      .from("positions")
      .select("slug, name, country, active, updated_at")
      .order("active", { ascending: false })
      .order("country")
      .order("name"),
    supabase.from("job_orders").select("position_slug, status, slot_count, slot_filled").eq("status", "open"),
    supabase.from("applications").select("position_slug"),
    supabase
      .from("applications")
      .select("position_slug, created_at")
      .gte("created_at", sevenDaysAgoIso),
    supabase.from("application_readiness_view").select("position_slug, hard_pass"),
    supabase.from("candidates").select("*", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgoIso),
  ]);

  // Bucket weekly inflow per position — index 0 = 6 days ago, index 6 = today
  const weeklyByPosition = new Map<string, number[]>();
  for (const a of (weekAppsData ?? []) as {
    position_slug: string;
    created_at: string;
  }[]) {
    const idx = 6 - daysAgoLocal(new Date(a.created_at), now);
    if (idx < 0 || idx > 6) continue;
    const arr = weeklyByPosition.get(a.position_slug) ?? [0, 0, 0, 0, 0, 0, 0];
    arr[idx] += 1;
    weeklyByPosition.set(a.position_slug, arr);
  }
  const ZERO_WEEK: number[] = [0, 0, 0, 0, 0, 0, 0];

  const positions = (positionsData ?? []) as PositionRow[];

  const openJOByPosition = new Map<string, number>();
  let totalSlots = 0;
  let filledSlots = 0;
  for (const jo of (jobOrdersData ?? []) as {
    position_slug: string;
    slot_count: number;
    slot_filled: number;
  }[]) {
    openJOByPosition.set(jo.position_slug, (openJOByPosition.get(jo.position_slug) ?? 0) + 1);
    totalSlots += jo.slot_count;
    filledSlots += jo.slot_filled;
  }

  const appsByPosition = new Map<string, number>();
  for (const a of (appsData ?? []) as { position_slug: string }[]) {
    appsByPosition.set(a.position_slug, (appsByPosition.get(a.position_slug) ?? 0) + 1);
  }

  const readyByPosition = new Map<string, { ready: number; total: number }>();
  for (const r of (readinessData ?? []) as {
    position_slug: string;
    hard_pass: boolean;
  }[]) {
    const cur = readyByPosition.get(r.position_slug) ?? { ready: 0, total: 0 };
    cur.total += 1;
    if (r.hard_pass) cur.ready += 1;
    readyByPosition.set(r.position_slug, cur);
  }

  const totalReady = [...readyByPosition.values()].reduce((s, v) => s + v.ready, 0);

  const totalActive = positions.filter((p) => p.active).length;
  const totalInactive = positions.length - totalActive;
  const slotsAvail = Math.max(0, totalSlots - filledSlots);

  const filtered = positions.filter((p) =>
    tab === "active" ? p.active : tab === "inactive" ? !p.active : true
  );

  return (
    <>
      <AdminTopBar
        crumbs={[
          { label: "Operasi" },
          { label: "Catalog posisi", emphasis: true },
        ]}
      />
      <main className="px-8 py-7 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <Eyebrow>Catalog</Eyebrow>
            <h1 className="text-[32px] font-extrabold leading-[36px] tracking-[-0.025em] text-pg-ink-primary">
              Catalog posisi
            </h1>
            <p className="text-[14px] text-pg-ink-tertiary leading-[22px]">
              Template posisi dengan persyaratan default. Buat <b className="text-pg-ink-secondary">job order</b>{" "}
              dari sini saat ada employer baru yang request batch.
            </p>
          </div>
          <Link
            href="/admin/positions/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pg-red-600 text-white font-bold text-[14px] no-underline hover:bg-pg-red-700"
          >
            <Icon name="plus" size={16} stroke={2.4} />
            Tambah Posisi
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total posisi"
            value={positions.length}
            sub={`${totalActive} aktif · ${totalInactive} nonaktif`}
            subTone="info"
          />
          <StatCard
            label="Job orders open"
            value={jobOrdersData?.length ?? 0}
            sub={`${slotsAvail} slot tersedia`}
          />
          <StatCard
            label="Lamaran masuk"
            value={appsByPosition.size > 0 ? [...appsByPosition.values()].reduce((s, n) => s + n, 0) : 0}
            sub={`+${weekApps ?? 0} minggu ini`}
            subTone="ok"
          />
          <StatCard
            label="Talent pool"
            value={candidateCount ?? 0}
            sub={`${totalReady} ready (hard-pass)`}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <FilterTab href="/admin/positions" label="Semua" count={positions.length} active={tab === "all"} />
            <FilterTab
              href="/admin/positions?tab=active"
              label="Aktif"
              count={totalActive}
              active={tab === "active"}
            />
            <FilterTab
              href="/admin/positions?tab=inactive"
              label="Nonaktif"
              count={totalInactive}
              active={tab === "inactive"}
            />
          </div>
        </div>

        {/* Table */}
        <div
          className="bg-pg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--pg-border)" }}
        >
          <div
            className="grid items-center px-5 py-3 text-[10px] font-semibold tracking-[0.1em] uppercase"
            style={{
              gridTemplateColumns:
                "minmax(0,2.4fr) 1fr 0.9fr 0.9fr 1fr 1.4fr 0.9fr 1.4fr",
              color: "var(--pg-ink-tertiary)",
              fontFamily: "var(--font-mono)",
              borderBottom: "1px solid var(--pg-border)",
            }}
          >
            <span>Posisi</span>
            <span>Negara</span>
            <span>JO Open</span>
            <span>Lamaran</span>
            <span>Apply / minggu</span>
            <span>Talent ready</span>
            <span>Status</span>
            <span></span>
          </div>
          {filtered.map((p) => {
            const openCount = openJOByPosition.get(p.slug) ?? 0;
            const appCount = appsByPosition.get(p.slug) ?? 0;
            const ready = readyByPosition.get(p.slug);
            const weekly = weeklyByPosition.get(p.slug) ?? ZERO_WEEK;
            const weeklyTotal = weekly.reduce((s, n) => s + n, 0);
            return (
              <div
                key={p.slug}
                className="grid items-center px-5 py-3.5 hover:bg-pg-paper transition-colors"
                style={{
                  gridTemplateColumns:
                    "minmax(0,2.4fr) 1fr 0.9fr 0.9fr 1fr 1.4fr 0.9fr 1.4fr",
                  borderBottom: "1px solid var(--pg-border-soft)",
                }}
              >
                <Link
                  href={`/admin/positions/${p.slug}`}
                  className="flex items-center gap-3 min-w-0 no-underline"
                >
                  <div
                    className="w-9 h-9 rounded-lg grid place-items-center text-white font-bold shrink-0"
                    style={{
                      background: "var(--pg-ink-primary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                    }}
                  >
                    {countryInitialsFromDb(p.country)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-pg-ink-primary leading-tight truncate">
                      {p.name}
                    </div>
                    <div
                      className="text-[11px] mt-0.5 leading-tight truncate"
                      style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                    >
                      {p.slug}
                    </div>
                  </div>
                </Link>
                <span className="text-[13px] text-pg-ink-secondary">
                  {countryLabelFromDb(p.country, p.country)}
                </span>
                <span className="flex items-center gap-1.5 text-[13px] text-pg-ink-secondary">
                  {openCount > 0 ? (
                    <>
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ background: "var(--pg-ok-soft-fg)" }}
                      />
                      {openCount}
                    </>
                  ) : (
                    <span className="text-pg-ink-quaternary">—</span>
                  )}
                </span>
                <span className="text-[13px] font-semibold text-pg-ink-secondary">{appCount}</span>
                <span
                  className="flex items-center gap-2 pr-3"
                  title={`${weeklyTotal} lamaran 7 hari terakhir`}
                >
                  <Sparkline data={weekly} width={64} height={20} />
                  <span
                    className="text-[11px] tabular-nums"
                    style={{
                      color:
                        weeklyTotal > 0
                          ? "var(--pg-ink-secondary)"
                          : "var(--pg-ink-quaternary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {weeklyTotal > 0 ? `+${weeklyTotal}` : "—"}
                  </span>
                </span>
                <ReadinessBar ready={ready?.ready ?? 0} total={ready?.total ?? 0} />
                <span>
                  {p.active ? (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-[0.06em] uppercase"
                      style={{
                        background: "var(--pg-ok-soft-bg)",
                        color: "var(--pg-ok-soft-fg)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Aktif
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-[0.06em] uppercase"
                      style={{
                        background: "var(--pg-ink-50)",
                        color: "var(--pg-ink-tertiary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Nonaktif
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-3 justify-end">
                  <Link
                    href={`/admin/positions/${p.slug}`}
                    className="text-[13px] font-semibold text-pg-ink-secondary no-underline hover:text-pg-red-600"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/job-orders/new?position=${p.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-white no-underline"
                    style={{ background: "var(--pg-ink-primary)" }}
                  >
                    <Icon name="plus" size={12} stroke={2.4} />
                    Buat JO
                  </Link>
                </span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-[13px] text-pg-ink-tertiary">
              Belum ada posisi di filter ini.
            </div>
          )}
        </div>
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

function StatCard({
  label,
  value,
  sub,
  subTone,
}: {
  label: string;
  value: number;
  sub?: string;
  subTone?: "ok" | "info";
}) {
  const subColor =
    subTone === "ok"
      ? "var(--pg-ok-soft-fg)"
      : subTone === "info"
      ? "var(--pg-info)"
      : "var(--pg-ink-tertiary)";
  return (
    <div
      className="bg-pg-white rounded-2xl p-5"
      style={{ border: "1px solid var(--pg-border)" }}
    >
      <div
        className="text-[10px] font-semibold tracking-[0.1em] uppercase leading-[12px]"
        style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
      <div className="text-[32px] font-extrabold leading-[40px] mt-1.5 text-pg-ink-primary">
        {value.toLocaleString("id-ID")}
      </div>
      {sub && (
        <div
          className="text-[12px] font-semibold mt-1"
          style={{ color: subColor }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function FilterTab({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-bold no-underline"
      style={{
        background: active ? "var(--pg-ink-primary)" : "transparent",
        color: active ? "var(--pg-white)" : "var(--pg-ink-secondary)",
      }}
    >
      {label}
      <span
        className="text-[10px] font-semibold opacity-80"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {count}
      </span>
    </Link>
  );
}

function ReadinessBar({ ready, total }: { ready: number; total: number }) {
  if (total === 0) {
    return <span className="text-[12px] text-pg-ink-quaternary">—</span>;
  }
  const pct = Math.round((ready / total) * 100);
  return (
    <div className="flex items-center gap-2 min-w-0 pr-4">
      <div
        className="h-1.5 rounded-full flex-1 overflow-hidden"
        style={{ background: "var(--pg-ink-50)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: pct >= 50 ? "var(--pg-ok-soft-fg)" : "var(--pg-warn-soft-fg)",
          }}
        />
      </div>
      <span
        className="text-[11px] font-semibold shrink-0 tabular-nums"
        style={{ color: "var(--pg-ink-secondary)", fontFamily: "var(--font-mono)" }}
      >
        {ready} / {total}
      </span>
    </div>
  );
}
