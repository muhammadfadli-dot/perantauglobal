import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import { Icon } from "@/components/pg/Icon";

export const dynamic = "force-dynamic";

type JobOrderRow = {
  id: string;
  position_slug: string;
  internal_employer_name: string;
  public_employer_name: string | null;
  employer_city: string | null;
  intake_label: string;
  slot_count: number;
  slot_filled: number;
  status: "open" | "closed" | "filled" | "cancelled";
  deadline: string | null;
  created_at: string;
  positions: { name: string; country: string } | null;
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  closed: "Closed",
  filled: "Filled",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
  open: { bg: "var(--pg-ok-soft-bg)", fg: "var(--pg-ok-soft-fg)" },
  filled: { bg: "var(--pg-info-bg)", fg: "var(--pg-info)" },
  closed: { bg: "var(--pg-ink-50)", fg: "var(--pg-ink-tertiary)" },
  cancelled: { bg: "var(--pg-err-bg)", fg: "var(--pg-err)" },
};

export default async function JobOrdersListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createServerClient();

  // Fetch the full list once: tab counts must reflect the whole catalog regardless of
  // the active filter (a pre-filtered query made the other tab badges read 0). The table
  // is small, so we filter in-memory for display rather than re-querying.
  const { data } = await supabase
    .from("job_orders")
    .select(
      "id, position_slug, internal_employer_name, public_employer_name, employer_city, intake_label, slot_count, slot_filled, status, deadline, created_at, positions (name, country)"
    )
    .order("created_at", { ascending: false });

  const allRows = (data ?? []) as unknown as JobOrderRow[];

  const counts = {
    all: allRows.length,
    open: allRows.filter((r) => r.status === "open").length,
    filled: allRows.filter((r) => r.status === "filled").length,
    closed: allRows.filter((r) => r.status === "closed").length,
    cancelled: allRows.filter((r) => r.status === "cancelled").length,
  };

  const activeFilter =
    status && ["open", "closed", "filled", "cancelled"].includes(status) ? status : null;
  const rows = activeFilter
    ? allRows.filter((r) => r.status === activeFilter)
    : allRows;

  return (
    <>
      <AdminTopBar
        crumbs={[
          { label: "Operasi" },
          { label: "Job orders", emphasis: true },
        ]}
      />
      <main className="px-8 py-7 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <Eyebrow>Operasi</Eyebrow>
            <h1 className="text-[32px] font-extrabold leading-[36px] tracking-[-0.025em] text-pg-ink-primary">
              Job orders
            </h1>
            <p className="text-[14px] text-pg-ink-tertiary">
              Instance konkret dari posisi catalog dengan employer, slot, dan deadline. Saat status{" "}
              <span
                className="px-1.5 py-0.5 rounded text-[11px]"
                style={{ background: "var(--pg-ink-50)", fontFamily: "var(--font-mono)" }}
              >
                open
              </span>
              , muncul di www <span style={{ fontFamily: "var(--font-mono)" }}>/lowongan</span>.
            </p>
          </div>
          <Link
            href="/admin/job-orders/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-bold text-white no-underline"
            style={{ background: "var(--pg-red-600)" }}
          >
            <Icon name="plus" size={16} stroke={2.4} /> Buat job order
          </Link>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <FilterTab href="/admin/job-orders" label="Semua" count={counts.all} active={!status} />
          <FilterTab
            href="/admin/job-orders?status=open"
            label="Open"
            count={counts.open}
            active={status === "open"}
          />
          <FilterTab
            href="/admin/job-orders?status=filled"
            label="Filled"
            count={counts.filled}
            active={status === "filled"}
          />
          <FilterTab
            href="/admin/job-orders?status=closed"
            label="Closed"
            count={counts.closed}
            active={status === "closed"}
          />
          <FilterTab
            href="/admin/job-orders?status=cancelled"
            label="Cancelled"
            count={counts.cancelled}
            active={status === "cancelled"}
          />
        </div>

        <div
          className="bg-pg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--pg-border)" }}
        >
          <div
            className="grid items-center px-5 py-3 text-[10px] font-semibold tracking-[0.1em] uppercase"
            style={{
              gridTemplateColumns: "minmax(0,2fr) 1.4fr 1.5fr 1fr 0.8fr 0.9fr",
              color: "var(--pg-ink-tertiary)",
              fontFamily: "var(--font-mono)",
              borderBottom: "1px solid var(--pg-border)",
            }}
          >
            <span>Posisi & Batch</span>
            <span>Employer</span>
            <span>Slot</span>
            <span>Deadline</span>
            <span>Status</span>
            <span>Dibuat</span>
          </div>
          {rows.length === 0 && (
            <div className="px-5 py-12 text-center">
              <div className="text-[16px] font-bold">Belum ada job order</div>
              <div className="text-[13px] text-pg-ink-tertiary mt-1.5">
                Buat job order baru untuk mulai terima lamaran kandidat.
              </div>
              <Link
                href="/admin/job-orders/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl mt-4 text-[13px] font-bold text-white no-underline"
                style={{ background: "var(--pg-red-600)" }}
              >
                <Icon name="plus" size={14} stroke={2.4} /> Buat job order
              </Link>
            </div>
          )}
          {rows.map((r) => {
            const pct =
              r.slot_count > 0 ? Math.round((r.slot_filled / r.slot_count) * 100) : 0;
            return (
              <Link
                key={r.id}
                href={`/admin/job-orders/${r.id}`}
                className="grid items-center px-5 py-3.5 hover:bg-pg-paper transition-colors no-underline"
                style={{
                  gridTemplateColumns: "minmax(0,2fr) 1.4fr 1.5fr 1fr 0.8fr 0.9fr",
                  borderBottom: "1px solid var(--pg-border-soft)",
                }}
              >
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-pg-ink-primary truncate">
                    {r.positions?.name ?? r.position_slug}
                  </div>
                  <div
                    className="text-[11px] mt-0.5 truncate"
                    style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                  >
                    {r.intake_label}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-pg-ink-secondary truncate">
                    {r.public_employer_name ?? r.internal_employer_name}
                  </div>
                  {r.employer_city && (
                    <div
                      className="text-[11px] mt-0.5"
                      style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                    >
                      {r.employer_city}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pr-4">
                  <span className="text-[13px] font-bold text-pg-ink-primary tabular-nums shrink-0">
                    {r.slot_filled}/{r.slot_count}
                  </span>
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--pg-ink-50)" }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 100 ? "var(--pg-info)" : "var(--pg-ok-soft-fg)",
                      }}
                    />
                  </div>
                </div>
                <span
                  className="text-[12px]"
                  style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                >
                  {r.deadline
                    ? new Date(r.deadline).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })
                    : "—"}
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
                  {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </span>
              </Link>
            );
          })}
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
      <span className="text-[10px] font-semibold opacity-80" style={{ fontFamily: "var(--font-mono)" }}>
        {count}
      </span>
    </Link>
  );
}
