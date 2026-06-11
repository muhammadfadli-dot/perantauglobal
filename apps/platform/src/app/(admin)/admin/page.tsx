import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import { Icon } from "@/components/pg/Icon";
import { KpiStat } from "@/components/admin/Sparkline";
import { ACCEPTED_STAGES, PIPELINE_COLUMNS } from "@/lib/applicationStatus";
import { getTimeOfDayGreeting } from "@/lib/journey";
import { jakartaDayKey, jakartaDayOfMonth } from "@/lib/datetime";
import { fetchAllRows } from "@/lib/fetch-all-rows";

export const dynamic = "force-dynamic";

type Range = "7d" | "14d" | "30d";

const RANGE_DAYS: Record<Range, number> = { "7d": 7, "14d": 14, "30d": 30 };
const RANGE_LABEL: Record<Range, string> = {
  "7d": "7 hari",
  "14d": "14 hari",
  "30d": "30 hari",
};

// Day-bucket key in Asia/Jakarta (WIB), so evening/midnight WIB activity lands on the
// correct calendar day regardless of the server's UTC clock.
const dayKey = jakartaDayKey;

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { session, role } = await getSessionAndRole();
  if (!session) redirect("/");
  if (role !== "admin") redirect("/dashboard");

  const supabase = await createServerClient();

  const sp = await searchParams;
  const range: Range =
    sp.range === "14d" || sp.range === "30d" || sp.range === "7d" ? sp.range : "7d";
  const days = RANGE_DAYS[range];

  const now = new Date();
  const rangeAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const priorAgo = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);
  const priorAgoIso = priorAgo.toISOString();

  const acceptedStages = [...ACCEPTED_STAGES];

  const [
    { count: pendingDocs },
    { count: untriagedPool },
    { count: inPipeline },
    { count: inboxNew },
    { count: openJoCount },
    { data: openJOData },
    { data: acceptedAppRows },
    { data: inflowRows },
    { data: pendingDocsRecent },
    // Pipeline snapshot — current stage distribution grouped into the 4 columns.
    { count: cntSelection },
    { count: cntInterviewDoc },
    { count: cntAccepted },
    { count: cntRejected },
  ] = await Promise.all([
    supabase
      .from("candidate_documents")
      .select("*", { count: "exact", head: true })
      .eq("verified", false)
      .is("rejected_at", null),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("pipeline_stage", "applied")
      .is("job_order_id", null),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .not("job_order_id", "is", null),
    supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    // Exact open-JO count for the KPI (the list below is capped at 1000 rows).
    supabase
      .from("job_orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("job_orders")
      .select(
        "id, position_slug, public_employer_name, internal_employer_name, slot_count, deadline, positions(name, country)",
      )
      .eq("status", "open")
      .order("deadline", { ascending: true, nullsFirst: false }),
    // Linked apps at an accepted stage — used to compute true over-capacity per JO.
    // Paginated: accepted apps + the inflow window both grow past the 1000 cap.
    fetchAllRows((f, t) =>
      supabase
        .from("applications")
        .select("job_order_id")
        .not("job_order_id", "is", null)
        .in("pipeline_stage", acceptedStages)
        .range(f, t),
    ).then((data) => ({ data })),
    fetchAllRows((f, t) =>
      supabase
        .from("applications")
        .select("created_at, position_slug")
        .gte("created_at", priorAgoIso)
        .range(f, t),
    ).then((data) => ({ data })),
    supabase
      .from("candidate_documents")
      .select("doc_type, candidates(full_name)")
      .eq("verified", false)
      .is("rejected_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(2),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("pipeline_stage", [...PIPELINE_COLUMNS[0].stages]),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("pipeline_stage", [...PIPELINE_COLUMNS[1].stages]),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("pipeline_stage", [...PIPELINE_COLUMNS[2].stages]),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("pipeline_stage", [...PIPELINE_COLUMNS[3].stages]),
  ]);

  // ── Job-order capacity / deadline signals ──────────────────────────────────
  type OpenJO = {
    id: string;
    position_slug: string;
    public_employer_name: string | null;
    internal_employer_name: string;
    slot_count: number;
    deadline: string | null;
    positions: { name: string; country: string } | null;
  };
  const openJOs = (openJOData ?? []) as unknown as OpenJO[];
  const openJobOrders = openJoCount ?? openJOs.length;

  // Accepted (placed) count per job order — drives "full" honestly, independent of
  // the slot_filled column (which is being migrated to this same definition in 0069).
  const acceptedByJO = new Map<string, number>();
  for (const r of (acceptedAppRows ?? []) as { job_order_id: string | null }[]) {
    if (r.job_order_id)
      acceptedByJO.set(r.job_order_id, (acceptedByJO.get(r.job_order_id) ?? 0) + 1);
  }
  const overdueJOs = openJOs.filter(
    (jo) => jo.deadline != null && new Date(jo.deadline) < now,
  );
  const fullJOs = openJOs.filter(
    (jo) => jo.slot_count > 0 && (acceptedByJO.get(jo.id) ?? 0) >= jo.slot_count,
  );
  const soonestOverdue = overdueJOs[0];

  // ── Inflow series for the range chart ──────────────────────────────────────
  const inflow = (inflowRows ?? []) as Array<{
    created_at: string;
    position_slug: string;
  }>;
  const dailyCounts = new Map<string, number>();
  const velocityMap = new Map<string, number>();
  let applicationsThisRange = 0;
  let applicationsPriorRange = 0;

  for (const row of inflow) {
    const ts = new Date(row.created_at);
    if (ts >= rangeAgo) {
      applicationsThisRange++;
      const key = dayKey(ts);
      dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
      velocityMap.set(row.position_slug, (velocityMap.get(row.position_slug) ?? 0) + 1);
    } else {
      applicationsPriorRange++;
    }
  }

  const dailySeries: { date: Date; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const k = dayKey(d);
    dailySeries.push({ date: d, count: dailyCounts.get(k) ?? 0 });
  }
  const inflowSeries = dailySeries.map((d) => d.count);
  const dailyMax = Math.max(...dailySeries.map((d) => d.count), 1);
  const dailyAvg =
    dailySeries.length > 0
      ? Math.round((applicationsThisRange / dailySeries.length) * 10) / 10
      : 0;
  const peakDay = dailySeries.reduce(
    (best, d) => (d.count > best.count ? d : best),
    dailySeries[0],
  );

  const topPositionSlugs = [...velocityMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([slug, count]) => ({ slug, count }));

  let topPositions: { slug: string; name: string; country: string; count: number }[] = [];
  if (topPositionSlugs.length > 0) {
    const { data: posMeta } = await supabase
      .from("positions")
      .select("slug, name, country")
      .in(
        "slug",
        topPositionSlugs.map((p) => p.slug),
      );
    const metaMap = new Map((posMeta ?? []).map((p) => [p.slug, p]));
    topPositions = topPositionSlugs.map(({ slug, count }) => {
      const m = metaMap.get(slug);
      return { slug, name: m?.name ?? slug, country: m?.country ?? "—", count };
    });
  }

  const thisRange = applicationsThisRange;
  const priorRange = applicationsPriorRange;
  const wowDelta = thisRange - priorRange;
  const wowPct = priorRange > 0 ? Math.round((wowDelta / priorRange) * 100) : null;

  const greetingName = session.email?.split("@")[0]?.split(".")[0] ?? "admin";
  const greeting = `${getTimeOfDayGreeting()}, ${
    greetingName.charAt(0).toUpperCase() + greetingName.slice(1)
  }`;

  // ── URGENT / NEEDS ACTION TODAY — only items with a real backlog ────────────
  const urgent: AttentionCard[] = [];
  if ((pendingDocs ?? 0) > 0) {
    const samples = (pendingDocsRecent ?? [])
      .map((d) => {
        const c = d.candidates as unknown as { full_name?: string | null } | null;
        return c?.full_name?.split(" ")[0];
      })
      .filter(Boolean) as string[];
    urgent.push({
      tone: "urgent",
      label: "DOKUMEN",
      count: pendingDocs ?? 0,
      title: "Dokumen menunggu verifikasi",
      desc:
        (samples.length > 0 ? `Terbaru dari ${samples.join(", ")}. ` : "") +
        "Verifikasi supaya lamaran bisa dilanjut.",
      href: "/admin/documents",
      ctaLabel: "Verifikasi sekarang",
    });
  }
  if (overdueJOs.length > 0) {
    urgent.push({
      tone: "urgent",
      label: "DEADLINE",
      count: overdueJOs.length,
      title: "Job order lewat deadline",
      desc: soonestOverdue
        ? `${
            soonestOverdue.public_employer_name ??
            soonestOverdue.positions?.name ??
            soonestOverdue.internal_employer_name
          } & lainnya masih open + tayang di www. Tutup atau perpanjang.`
        : "Masih open + tayang di www. Tutup atau perpanjang.",
      href: "/admin/job-orders?status=open",
      ctaLabel: "Tinjau job order",
    });
  }
  if (fullJOs.length > 0) {
    urgent.push({
      tone: "ok",
      label: "KAPASITAS",
      count: fullJOs.length,
      title: "Job order sudah penuh",
      desc: "Slot terisi penuh tapi status masih open. Tandai filled/closed.",
      href: "/admin/job-orders?status=open",
      ctaLabel: "Tutup job order",
    });
  }
  if ((inboxNew ?? 0) > 0) {
    urgent.push({
      tone: "warn",
      label: "INBOX",
      count: inboxNew ?? 0,
      title: "Pesan masuk belum dibalas",
      desc: "Termasuk pertanyaan login/reset yang sering bikin kandidat batal daftar.",
      href: "/admin/inbox",
      ctaLabel: "Buka inbox",
    });
  }

  // ── Pipeline snapshot (all-time current state, grouped into the 4 columns) ──
  const snapshot = [
    { col: PIPELINE_COLUMNS[0], count: cntSelection ?? 0 },
    { col: PIPELINE_COLUMNS[1], count: cntInterviewDoc ?? 0 },
    { col: PIPELINE_COLUMNS[2], count: cntAccepted ?? 0 },
    { col: PIPELINE_COLUMNS[3], count: cntRejected ?? 0 },
  ];
  const snapshotTotal = snapshot.reduce((n, s) => n + s.count, 0) || 1;
  const SNAP_COLOR: Record<string, string> = {
    selection: "var(--pg-warn-soft-fg)",
    interview_doc: "var(--pg-info)",
    accepted: "var(--pg-ok-soft-fg)",
    rejected: "var(--pg-ink-300)",
  };

  return (
    <>
      <AdminTopBar crumbs={[{ label: "Dashboard", emphasis: true }]} />

      <main className="px-8 py-7 flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <Eyebrow>{greeting}</Eyebrow>
          <h1 className="text-[32px] font-extrabold leading-[36px] tracking-[-0.025em] text-pg-ink-primary">
            {urgent.length === 0
              ? "Aman — tidak ada yang mendesak hari ini"
              : `${urgent.length} hal yang butuh ditindak`}
          </h1>
        </div>

        {/* URGENT block — only renders rows with a real backlog */}
        {urgent.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {urgent.map((a, i) => (
              <AttentionCardView key={i} card={a} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl px-5 py-4 flex items-center gap-3"
            style={{ background: "var(--pg-ok-soft-bg)", border: "1.5px solid var(--pg-ok-soft-border)" }}
          >
            <Icon name="check" size={18} className="text-pg-ok-soft-fg" stroke={2.4} />
            <span className="text-[14px] font-semibold text-pg-ink-secondary">
              Tidak ada dokumen pending, job order lewat deadline, atau pesan baru.
            </span>
          </div>
        )}

        {/* KPI hero — honest operational numbers (no permanently-zero "Diterima") */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <KpiStat
            label="Lamaran masuk"
            value={thisRange}
            delta={wowPct != null ? `${wowPct >= 0 ? "+" : ""}${wowPct}%` : undefined}
            deltaTone={wowPct == null ? "mute" : wowPct >= 0 ? "ok" : "warn"}
            sparkline={inflowSeries}
            caption={`vs ${RANGE_LABEL[range]} sebelumnya`}
          />
          <KpiStat
            label="Pool belum ditindak"
            value={untriagedPool ?? 0}
            deltaTone={(untriagedPool ?? 0) > 0 ? "warn" : "mute"}
            caption="Applied, belum masuk job order"
          />
          <KpiStat
            label="Dalam pipeline"
            value={inPipeline ?? 0}
            caption="Sudah ditarik ke job order"
          />
          <KpiStat
            label="Job orders open"
            value={openJobOrders}
            delta={overdueJOs.length > 0 ? `${overdueJOs.length} lewat deadline` : undefined}
            deltaTone={overdueJOs.length > 0 ? "warn" : "mute"}
            caption="Tayang di www /lowongan"
          />
          <KpiStat
            label="Doc pending"
            value={pendingDocs ?? 0}
            delta={(pendingDocs ?? 0) > 5 ? "Perlu review" : undefined}
            deltaTone={(pendingDocs ?? 0) > 5 ? "warn" : "mute"}
            caption="Sertifikat & dokumen baru"
          />
        </div>

        {/* Pipeline snapshot + Top positions */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div
            className="lg:col-span-2 bg-pg-white rounded-2xl p-6 flex flex-col gap-4"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex flex-col gap-0.5">
                <Eyebrow>Seluruh kandidat</Eyebrow>
                <div className="text-[18px] font-extrabold leading-[22px] tracking-[-0.01em] text-pg-ink-primary">
                  Posisi pipeline
                </div>
              </div>
              <Link
                href="/admin/analytics"
                className="text-[12px] font-bold text-pg-red-600 no-underline hover:underline inline-flex items-center gap-1"
              >
                Analytics <Icon name="arrow_right" size={12} />
              </Link>
            </div>

            {/* Stacked bar */}
            <div className="flex h-3 rounded-full overflow-hidden" style={{ background: "var(--pg-ink-50)" }}>
              {snapshot.map((s) =>
                s.count > 0 ? (
                  <div
                    key={s.col.key}
                    style={{
                      width: `${(s.count / snapshotTotal) * 100}%`,
                      background: SNAP_COLOR[s.col.key],
                    }}
                    title={`${s.col.label}: ${s.count}`}
                  />
                ) : null,
              )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {snapshot.map((s) => (
                <div key={s.col.key} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: SNAP_COLOR[s.col.key] }}
                    />
                    <span
                      className="text-[10px] font-semibold tracking-[0.06em] uppercase"
                      style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                    >
                      {s.col.label}
                    </span>
                  </div>
                  <div className="text-[22px] font-extrabold leading-[26px] text-pg-ink-primary tabular-nums">
                    {s.count}
                  </div>
                  {s.col.key === "accepted" && s.count === 0 && (
                    <div className="text-[11px] text-pg-ink-tertiary leading-tight">
                      Belum ada penempatan
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            className="bg-pg-white rounded-2xl p-6 flex flex-col gap-3"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <div className="flex flex-col gap-0.5">
              <Eyebrow>{RANGE_LABEL[range]} terakhir</Eyebrow>
              <div className="text-[18px] font-extrabold leading-[22px] tracking-[-0.01em] text-pg-ink-primary">
                Posisi paling banyak dilamar
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {topPositions.length === 0 ? (
                <div className="text-[13px] text-pg-ink-tertiary py-2">
                  Belum ada lamaran dalam {RANGE_LABEL[range]} terakhir.
                </div>
              ) : (
                topPositions.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/admin/positions/${p.slug}`}
                    className="flex items-center gap-3 px-2.5 py-2.5 rounded-[10px] no-underline"
                    style={{ background: "var(--pg-paper)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg grid place-items-center text-white font-bold shrink-0"
                      style={{ background: "var(--pg-ink-primary)", fontFamily: "var(--font-mono)", fontSize: "10px" }}
                    >
                      {p.country.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-pg-ink-primary truncate leading-tight">
                        {p.name}
                      </div>
                      <div
                        className="text-[10px] mt-0.5 leading-tight"
                        style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                      >
                        {p.count} lamaran / {RANGE_LABEL[range]}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Talent inflow chart */}
        <div
          className="bg-pg-white rounded-2xl p-6 flex flex-col gap-3.5"
          style={{ border: "1px solid var(--pg-border)" }}
        >
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex flex-col gap-0.5">
              <Eyebrow>{RANGE_LABEL[range]} · {rangeDateRange(rangeAgo, now)}</Eyebrow>
              <div className="text-[18px] font-extrabold leading-[22px] tracking-[-0.01em] text-pg-ink-primary">
                Lamaran masuk per hari
              </div>
            </div>
            <RangeFilter range={range} />
          </div>
          <div className="flex flex-wrap gap-6 py-1">
            <Stat
              value={String(thisRange)}
              label="Total range ini"
              delta={wowPct != null ? `${wowPct >= 0 ? "↑" : "↓"} ${Math.abs(wowPct)}%` : undefined}
              deltaPositive={wowPct == null ? undefined : wowPct >= 0}
            />
            <Stat value={`${dailyAvg}`} label="Rata-rata/hari" />
          </div>
          <DailyInflowChart series={dailySeries} max={dailyMax} peak={peakDay} />
        </div>

        {/* Quick actions */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/admin/job-orders/new" icon="plus" title="Buat job order" />
          <QuickAction href="/admin/documents" icon="doc_check" title="Review dokumen" />
          <QuickAction href="/admin/inbox" icon="mail" title="Inbox pesan" />
          <QuickAction href="/admin/positions" icon="doc" title="Catalog posisi" />
        </div>
      </main>
    </>
  );
}

type AttentionCard = {
  tone: "urgent" | "warn" | "ok";
  label: string;
  count: number;
  title: string;
  desc: string;
  href: string;
  ctaLabel: string;
};

function AttentionCardView({ card }: { card: AttentionCard }) {
  const colors =
    card.tone === "urgent"
      ? {
          border: "var(--pg-red-soft-border)",
          pillBg: "var(--pg-red-soft-bg)",
          pillFg: "var(--pg-red-600)",
          countFg: "var(--pg-red-600)",
          ctaFg: "var(--pg-red-600)",
        }
      : card.tone === "warn"
      ? {
          border: "var(--pg-warn-soft-border)",
          pillBg: "var(--pg-warn-soft-bg)",
          pillFg: "var(--pg-warn-soft-fg)",
          countFg: "var(--pg-warn-soft-fg)",
          ctaFg: "var(--pg-warn-soft-fg)",
        }
      : {
          border: "var(--pg-ok-soft-border)",
          pillBg: "var(--pg-ok-soft-bg)",
          pillFg: "var(--pg-ok-soft-fg)",
          countFg: "var(--pg-ok-soft-fg)",
          ctaFg: "var(--pg-ok-soft-fg)",
        };

  return (
    <Link
      href={card.href}
      className="bg-pg-white rounded-2xl p-5 flex flex-col gap-2.5 no-underline"
      style={{ border: `1.5px solid ${colors.border}` }}
    >
      <div className="flex items-center justify-between">
        <span
          className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-[0.04em] leading-[12px]"
          style={{
            background: colors.pillBg,
            color: colors.pillFg,
            fontFamily: "var(--font-mono)",
          }}
        >
          {card.label}
        </span>
        <span
          className="text-[22px] font-extrabold leading-[28px]"
          style={{ color: colors.countFg }}
        >
          {card.count}
        </span>
      </div>
      <div className="text-[16px] font-extrabold leading-[20px] tracking-[-0.005em] text-pg-ink-primary">
        {card.title}
      </div>
      <div className="text-[12px] leading-4" style={{ color: "var(--pg-ink-tertiary)" }}>
        {card.desc}
      </div>
      <div className="flex items-center gap-1.5 pt-2">
        <span className="text-[12px] font-bold leading-4" style={{ color: colors.ctaFg }}>
          {card.ctaLabel} →
        </span>
      </div>
    </Link>
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

function Stat({
  value,
  label,
  delta,
  deltaPositive,
}: {
  value: string;
  label: string;
  delta?: string;
  deltaPositive?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-1.5">
        <div className="text-[32px] font-extrabold leading-[40px] text-pg-ink-primary">
          {value}
        </div>
        {delta && (
          <span
            className="text-[11px] font-semibold leading-[14px]"
            style={{
              color:
                deltaPositive === false
                  ? "var(--pg-ink-tertiary)"
                  : "var(--pg-ok-soft-fg)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {delta}
          </span>
        )}
      </div>
      <div
        className="text-[10px] font-semibold tracking-[0.08em] uppercase leading-[12px]"
        style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
}: {
  href: string;
  icon: Parameters<typeof Icon>[0]["name"];
  title: string;
}) {
  return (
    <Link
      href={href}
      className="bg-pg-white rounded-2xl p-4 flex items-center gap-3 no-underline hover:border-pg-red-200"
      style={{ border: "1px solid var(--pg-border)" }}
    >
      <div
        className="w-10 h-10 rounded-xl grid place-items-center"
        style={{ background: "var(--pg-red-50)", color: "var(--pg-red-600)" }}
      >
        <Icon name={icon} size={18} stroke={2} />
      </div>
      <div className="text-[14px] font-bold text-pg-ink-primary">{title}</div>
      <Icon name="arrow_right" size={16} className="ml-auto text-pg-ink-quaternary" />
    </Link>
  );
}

function rangeDateRange(from: Date, to: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  return `${fmt(from)}–${fmt(to)}`;
}

function RangeFilter({ range }: { range: Range }) {
  const ranges: Range[] = ["7d", "14d", "30d"];
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
            href={`/admin?range=${r}`}
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

function DailyInflowChart({
  series,
  max,
  peak,
}: {
  series: { date: Date; count: number }[];
  max: number;
  peak: { date: Date; count: number };
}) {
  const dayLabel = (d: Date) =>
    d.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", weekday: "short", day: "numeric", month: "short" });
  const shortDay = (d: Date) =>
    d.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "short" });

  const n = series.length;
  const labelEvery = n <= 7 ? 1 : n <= 14 ? 2 : 5;

  return (
    <div className="flex flex-col gap-2 pt-1">
      <div className="flex items-center justify-between">
        <div
          className="text-[10px] font-semibold tracking-[0.08em] uppercase leading-[12px]"
          style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
        >
          Inflow per hari
        </div>
        {peak.count > 0 && (
          <div
            className="text-[10px] tabular-nums"
            style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
          >
            Puncak: {shortDay(peak.date)} · {peak.count}
          </div>
        )}
      </div>
      <div className="flex items-end gap-[3px]" style={{ height: 72 }}>
        {series.map((d, i) => {
          const pct = max > 0 ? d.count / max : 0;
          const heightPx = d.count > 0 ? Math.max(pct * 64, 6) : 2;
          const isPeak = d.count === peak.count && d.count > 0;
          return (
            <div
              key={i}
              className="flex-1 flex items-end justify-center"
              style={{ height: 64 }}
              title={`${dayLabel(d.date)}: ${d.count} lamaran`}
            >
              <div
                className="w-full rounded-[3px]"
                style={{
                  height: `${heightPx}px`,
                  background:
                    d.count === 0
                      ? "var(--pg-ink-100)"
                      : isPeak
                      ? "var(--pg-red-600)"
                      : "var(--pg-red-400, var(--pg-red-600))",
                  opacity: d.count === 0 ? 1 : isPeak ? 1 : 0.7,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-start gap-[3px]">
        {series.map((d, i) => {
          const show = i === 0 || i === series.length - 1 || i % labelEvery === 0;
          return (
            <div
              key={i}
              className="flex-1 text-center text-[9px] tabular-nums leading-[10px]"
              style={{
                color: "var(--pg-ink-tertiary)",
                fontFamily: "var(--font-mono)",
                visibility: show ? "visible" : "hidden",
              }}
            >
              {jakartaDayOfMonth(d.date)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
