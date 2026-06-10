import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import { Icon } from "@/components/pg/Icon";

export const dynamic = "force-dynamic";

type AgentRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  status: "active" | "inactive" | "suspended";
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  inactive: "Nonaktif",
  suspended: "Suspended",
};

const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
  active: { bg: "var(--pg-ok-soft-bg)", fg: "var(--pg-ok-soft-fg)" },
  inactive: { bg: "var(--pg-ink-50)", fg: "var(--pg-ink-tertiary)" },
  suspended: { bg: "var(--pg-err-bg)", fg: "var(--pg-err)" },
};

export default async function AgentsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createServerClient();

  // Fetch agents + the related counts once. Tab counts must reflect the whole
  // roster regardless of the active filter (pre-filtering made other tabs read
  // 0). The roster is small, so we filter in-memory for display.
  const [{ data: agentsData }, { data: codesData }, { data: refData }, { data: eventsData }] =
    await Promise.all([
      supabase
        .from("affiliate_agents")
        .select("id, name, email, phone, city, status, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("referral_codes").select("agent_id, status"),
      supabase
        .from("candidates")
        .select("referred_by_agent_id")
        .not("referred_by_agent_id", "is", null),
      supabase
        .from("affiliate_commission_events")
        .select("agent_id, event_type, status"),
    ]);

  const allRows = (agentsData ?? []) as AgentRow[];
  const codes = (codesData ?? []) as { agent_id: string; status: string }[];
  const refs = (refData ?? []) as { referred_by_agent_id: string | null }[];
  const events = (eventsData ?? []) as {
    agent_id: string;
    event_type: string;
    status: string;
  }[];

  // Per-agent rollups.
  const activeCodeCount = new Map<string, number>();
  for (const c of codes) {
    if (c.status === "active") {
      activeCodeCount.set(c.agent_id, (activeCodeCount.get(c.agent_id) ?? 0) + 1);
    }
  }
  const referralCount = new Map<string, number>();
  for (const r of refs) {
    if (r.referred_by_agent_id) {
      referralCount.set(
        r.referred_by_agent_id,
        (referralCount.get(r.referred_by_agent_id) ?? 0) + 1,
      );
    }
  }
  const departureCount = new Map<string, number>();
  for (const e of events) {
    if (e.event_type === "departure") {
      departureCount.set(e.agent_id, (departureCount.get(e.agent_id) ?? 0) + 1);
    }
  }

  const counts = {
    all: allRows.length,
    active: allRows.filter((r) => r.status === "active").length,
    inactive: allRows.filter((r) => r.status === "inactive").length,
    suspended: allRows.filter((r) => r.status === "suspended").length,
  };

  // KPI strip metrics (over the whole roster).
  const pendingEvents = events.filter((e) => e.status === "pending").length;
  const totalReferred = refs.filter((r) => r.referred_by_agent_id).length;

  const activeFilter =
    status && ["active", "inactive", "suspended"].includes(status) ? status : null;
  const rows = activeFilter ? allRows.filter((r) => r.status === activeFilter) : allRows;

  return (
    <>
      <AdminTopBar
        crumbs={[{ label: "Operasi" }, { label: "Agen afiliasi", emphasis: true }]}
      />
      <main className="px-8 py-7 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <Eyebrow>Operasi</Eyebrow>
            <h1 className="text-[32px] font-extrabold leading-[36px] tracking-[-0.025em] text-pg-ink-primary">
              Agen afiliasi
            </h1>
            <p className="text-[14px] text-pg-ink-tertiary">
              Agen yang scout talenta. Kandidat daftar pakai{" "}
              <span
                className="px-1.5 py-0.5 rounded text-[11px]"
                style={{ background: "var(--pg-ink-50)", fontFamily: "var(--font-mono)" }}
              >
                kode referral
              </span>{" "}
              agen, lalu ter-attribute otomatis. Komisi dicatat per event, nominal diisi manual.
            </p>
          </div>
          <Link
            href="/admin/agents/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-bold text-white no-underline"
            style={{ background: "var(--pg-red-600)" }}
          >
            <Icon name="plus" size={16} stroke={2.4} /> Buat agen
          </Link>
        </div>

        {/* KPI strip */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Total agen" value={counts.all} />
          <Kpi label="Agen aktif" value={counts.active} tone="ok" />
          <Kpi label="Event komisi pending" value={pendingEvents} tone="warn" />
          <Kpi label="Kandidat ke-refer" value={totalReferred} />
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <FilterTab href="/admin/agents" label="Semua" count={counts.all} active={!status} />
          <FilterTab
            href="/admin/agents?status=active"
            label="Aktif"
            count={counts.active}
            active={status === "active"}
          />
          <FilterTab
            href="/admin/agents?status=inactive"
            label="Nonaktif"
            count={counts.inactive}
            active={status === "inactive"}
          />
          <FilterTab
            href="/admin/agents?status=suspended"
            label="Suspended"
            count={counts.suspended}
            active={status === "suspended"}
          />
        </div>

        <div
          className="bg-pg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--pg-border)" }}
        >
          <div
            className="grid items-center px-5 py-3 text-[10px] font-semibold tracking-[0.1em] uppercase"
            style={{
              gridTemplateColumns: "minmax(0,2fr) 1.2fr 0.9fr 0.9fr 0.9fr 0.8fr 0.9fr",
              color: "var(--pg-ink-tertiary)",
              fontFamily: "var(--font-mono)",
              borderBottom: "1px solid var(--pg-border)",
            }}
          >
            <span>Agen</span>
            <span>Kota</span>
            <span>Kode aktif</span>
            <span>Referral</span>
            <span>Berangkat</span>
            <span>Status</span>
            <span>Dibuat</span>
          </div>
          {rows.length === 0 && (
            <div className="px-5 py-12 text-center">
              <div className="text-[16px] font-bold">Belum ada agen</div>
              <div className="text-[13px] text-pg-ink-tertiary mt-1.5">
                Buat agen afiliasi pertama untuk mulai channel referral.
              </div>
              <Link
                href="/admin/agents/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl mt-4 text-[13px] font-bold text-white no-underline"
                style={{ background: "var(--pg-red-600)" }}
              >
                <Icon name="plus" size={14} stroke={2.4} /> Buat agen
              </Link>
            </div>
          )}
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/admin/agents/${r.id}`}
              className="grid items-center px-5 py-3.5 hover:bg-pg-paper transition-colors no-underline"
              style={{
                gridTemplateColumns: "minmax(0,2fr) 1.2fr 0.9fr 0.9fr 0.9fr 0.8fr 0.9fr",
                borderBottom: "1px solid var(--pg-border-soft)",
              }}
            >
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-pg-ink-primary truncate">
                  {r.name}
                </div>
                <div
                  className="text-[11px] mt-0.5 truncate"
                  style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                >
                  {r.email ?? r.phone ?? "—"}
                </div>
              </div>
              <span className="text-[13px] text-pg-ink-secondary truncate">
                {r.city ?? "—"}
              </span>
              <span className="text-[13px] font-bold text-pg-ink-primary tabular-nums">
                {activeCodeCount.get(r.id) ?? 0}
              </span>
              <span className="text-[13px] font-bold text-pg-ink-primary tabular-nums">
                {referralCount.get(r.id) ?? 0}
              </span>
              <span className="text-[13px] font-bold text-pg-ink-primary tabular-nums">
                {departureCount.get(r.id) ?? 0}
              </span>
              <span
                className="inline-flex w-fit px-2 py-0.5 rounded-md text-[10px] font-bold tracking-[0.06em] uppercase"
                style={{
                  background: STATUS_TONE[r.status]?.bg,
                  color: STATUS_TONE[r.status]?.fg,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {STATUS_LABEL[r.status]}
              </span>
              <span
                className="text-[12px]"
                style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
              >
                {new Date(r.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </Link>
          ))}
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

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "ok" | "warn";
}) {
  const color =
    tone === "ok"
      ? "var(--pg-ok-soft-fg)"
      : tone === "warn"
      ? "var(--pg-warn-soft-fg)"
      : "var(--pg-ink-primary)";
  return (
    <div
      className="bg-pg-white rounded-2xl px-5 py-4 flex flex-col gap-1"
      style={{ border: "1px solid var(--pg-border)" }}
    >
      <span
        className="text-[10px] font-semibold tracking-[0.1em] uppercase"
        style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <span
        className="text-[28px] font-extrabold leading-[32px] tabular-nums"
        style={{ color }}
      >
        {value}
      </span>
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
