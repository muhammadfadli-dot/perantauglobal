import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import ApplicationFilters from "@/components/admin/ApplicationFilters";
import { ReadinessBadge } from "@/components/admin/ReadinessBadge";
import { JobOrderPicker } from "@/components/admin/JobOrderPicker";
import ReachOutToggle from "@/components/admin/ReachOutToggle";
import QuickReject from "@/components/admin/QuickReject";
import { Icon } from "@/components/pg/Icon";
import { isRejectedStage, stageLabel } from "@/lib/applicationStatus";

type PositionEntry = {
  slug: string;
  name: string;
  country: string;
  active: boolean;
  app_count: number;
};

type OpenJobOrder = {
  id: string;
  intake_label: string;
  internal_employer_name: string;
  position_slug: string;
  slot_count: number;
  slot_filled: number;
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;
type SortKey = "newest" | "readiness" | "fit";
type PoolKey = "pool" | "in_job_order" | "all";

type AppRow = {
  id: string;
  candidate_id: string;
  position_slug: string;
  pipeline_stage: string;
  reached_out: boolean;
  score: number | null;
  created_at: string;
  candidate_name: string | null;
  candidate_phone: string | null;
  candidate_city: string | null;
  position_name: string | null;
  position_country: string | null;
  job_order_id: string | null;
  job_order_intake_label: string | null;
  readiness: unknown;
  cv_fit_score: number | null;
  cv_fit_status: string | null;
  cv_has_flags: boolean;
  total_count: number;
};

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    pool?: string;
    position?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const {
    pool: poolParam,
    position,
    q,
    sort: sortParam,
    page: pageParam,
  } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const pool: PoolKey =
    poolParam === "in_job_order" || poolParam === "all" ? poolParam : "pool";

  // Smart default: when filtering by position, sort by readiness; else newest.
  const sort: SortKey =
    sortParam === "readiness" || sortParam === "newest" || sortParam === "fit"
      ? sortParam
      : position
      ? "readiness"
      : "newest";

  const supabase = await createServerClient();

  const [posRes, listRes, joRes] = await Promise.all([
    supabase
      .from("positions")
      .select("slug, name, country, active, applications(count)")
      .order("name"),
    supabase.rpc("list_applications_for_admin", {
      p_position: position ?? "",
      p_search: q ?? "",
      p_sort: sort,
      p_pool: pool,
      p_limit: PAGE_SIZE,
      p_offset: offset,
    }),
    // Open job orders, indexed by position_slug for the per-row picker.
    supabase
      .from("job_orders")
      .select(
        "id, intake_label, internal_employer_name, position_slug, slot_count, slot_filled",
      )
      .eq("status", "open")
      .order("created_at", { ascending: false }),
  ]);

  type PosRow = {
    slug: string;
    name: string;
    country: string;
    active: boolean;
    applications: { count: number }[] | null;
  };
  const positions: PositionEntry[] = ((posRes.data ?? []) as PosRow[])
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      country: p.country,
      active: p.active,
      app_count: p.applications?.[0]?.count ?? 0,
    }))
    .filter((p) => p.active || p.app_count > 0);

  const openJobOrders = (joRes.data ?? []) as OpenJobOrder[];
  const jobOrdersByPosition = new Map<string, OpenJobOrder[]>();
  for (const jo of openJobOrders) {
    const arr = jobOrdersByPosition.get(jo.position_slug) ?? [];
    arr.push(jo);
    jobOrdersByPosition.set(jo.position_slug, arr);
  }

  if (listRes.error) {
    return (
      <main className="p-10">
        <p className="text-sm text-pg-err">Query gagal: {listRes.error.message}</p>
      </main>
    );
  }

  const rows = (listRes.data ?? []) as AppRow[];
  const total = rows[0]?.total_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="p-6 lg:p-10 max-w-6xl">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            Admin / Lamaran
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
            Talent pool
          </h1>
          <p className="text-[13px] text-pg-ink-500 mt-2 max-w-xl">
            Daftar kandidat yang melamar ke posisi.{" "}
            <span className="font-semibold text-pg-ink-700">
              Pipeline (screening, interview, dst) terjadi di job order
            </span>{" "}
            — pindahkan kandidat ke job order yang sedang open buat mulai proses
            seleksi.
          </p>
        </div>
        <div className="text-[12px] font-bold tracking-[0.1em] uppercase text-pg-ink-500 whitespace-nowrap">
          {total} hasil · halaman {page} / {totalPages}
        </div>
      </div>

      <div className="mt-6">
        <ApplicationFilters
          positions={positions}
          initialPool={pool}
          initialPosition={position ?? ""}
          initialSearch={q ?? ""}
          initialSort={sort}
        />
      </div>

      <div className="mt-6 bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="border-b border-pg-ink-100 bg-pg-ink-50">
            <tr className="text-left text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">
              <th className="px-4 py-3">Kandidat</th>
              <th className="px-4 py-3">Posisi</th>
              <th className="px-4 py-3">Readiness</th>
              <th className="px-4 py-3">Fit CV</th>
              <th className="px-4 py-3">Outreach</th>
              <th className="px-4 py-3">Masuk</th>
              <th className="px-4 py-3 text-right">Job order</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-pg-ink-500">
                  Tidak ada lamaran yang cocok.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const posJOs = jobOrdersByPosition.get(r.position_slug) ?? [];
              return (
                <tr
                  key={r.id}
                  className="border-b border-pg-ink-100 last:border-b-0 hover:bg-pg-ink-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/candidates/${r.candidate_id}`}
                      className="font-bold text-pg-ink-900 hover:text-pg-red-600 no-underline"
                    >
                      {r.candidate_name ?? "—"}
                    </Link>
                    <div className="text-[11px] text-pg-ink-500 font-mono">
                      {r.candidate_city ?? "—"} · {r.candidate_phone ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px]">
                    <div className="font-semibold">
                      {r.position_name ?? r.position_slug}
                    </div>
                    <div className="text-[11px] text-pg-ink-500 font-mono">
                      {r.position_country ?? ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ReadinessBadge readiness={r.readiness} />
                  </td>
                  <td className="px-4 py-3">
                    <FitCell score={r.cv_fit_score} status={r.cv_fit_status} hasFlags={r.cv_has_flags} />
                  </td>
                  <td className="px-4 py-3 text-[13px]">
                    <ReachOutToggle
                      applicationId={r.id}
                      reachedOut={r.reached_out}
                      reachedOutAt={null}
                    />
                  </td>
                  <td className="px-4 py-3 text-[12px] text-pg-ink-500 font-mono">
                    {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.job_order_id ? (
                      <Link
                        href={`/admin/job-orders/${r.job_order_id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg no-underline text-[12px] font-bold whitespace-nowrap transition-colors"
                        style={{
                          border: "1px solid var(--pg-info)",
                          background: "var(--pg-info-bg)",
                          color: "var(--pg-info)",
                        }}
                        title={`Pipeline stage: ${r.pipeline_stage}`}
                      >
                        <Icon name="arrow_right" size={12} stroke={2.4} />
                        <span className="truncate max-w-[160px]">
                          {r.job_order_intake_label ?? "in JO"}
                        </span>
                      </Link>
                    ) : isRejectedStage(r.pipeline_stage) ? (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold"
                        style={{ background: "var(--pg-ink-50)", color: "var(--pg-ink-tertiary)" }}
                        title={`Stage: ${r.pipeline_stage}`}
                      >
                        <Icon name="x" size={11} stroke={2.4} /> {stageLabel(r.pipeline_stage)}
                      </span>
                    ) : (
                      <div className="inline-flex flex-col items-end gap-1.5">
                        <JobOrderPicker
                          applicationId={r.id}
                          candidateName={r.candidate_name ?? "kandidat"}
                          openJobOrders={posJOs}
                        />
                        <QuickReject
                          applicationId={r.id}
                          candidateName={r.candidate_name ?? "kandidat"}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        pool={pool}
        position={position}
        q={q}
        sort={sort}
      />
    </main>
  );
}

function Pagination({
  page,
  totalPages,
  pool,
  position,
  q,
  sort,
}: {
  page: number;
  totalPages: number;
  pool: PoolKey;
  position?: string;
  q?: string;
  sort: SortKey;
}) {
  if (totalPages <= 1) return null;
  const build = (p: number) => {
    const sp = new URLSearchParams();
    if (pool !== "pool") sp.set("pool", pool);
    if (position) sp.set("position", position);
    if (q) sp.set("q", q);
    if (sort !== "newest") sp.set("sort", sort);
    sp.set("page", String(p));
    return `/admin/applications?${sp.toString()}`;
  };
  return (
    <nav className="mt-6 flex items-center justify-between text-[13px] font-semibold">
      {page > 1 ? (
        <Link
          href={build(page - 1)}
          className="inline-flex items-center gap-1 text-pg-ink-700 no-underline hover:text-pg-red-600"
        >
          <Icon name="arrow_left" size={16} /> Prev
        </Link>
      ) : (
        <span className="text-pg-ink-300 inline-flex items-center gap-1">
          <Icon name="arrow_left" size={16} /> Prev
        </span>
      )}
      <span className="text-pg-ink-500">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={build(page + 1)}
          className="inline-flex items-center gap-1 text-pg-ink-700 no-underline hover:text-pg-red-600"
        >
          Next <Icon name="arrow_right" size={16} />
        </Link>
      ) : (
        <span className="text-pg-ink-300 inline-flex items-center gap-1">
          Next <Icon name="arrow_right" size={16} />
        </span>
      )}
    </nav>
  );
}

function FitCell({
  score,
  status,
  hasFlags,
}: {
  score: number | null;
  status: string | null;
  hasFlags: boolean;
}) {
  if (score === null) {
    // Distinguish "no CV yet" (skipped) from "errored" from "not graded".
    const label = status === "skipped" ? "Belum CV" : status === "error" ? "Gagal" : "—";
    const title =
      status === "skipped"
        ? "Kandidat belum punya CV"
        : status === "error"
        ? "Penilaian CV gagal — buka kandidat"
        : "CV belum dinilai";
    return (
      <span className="text-[11px] text-pg-ink-400" title={title}>
        {label}
      </span>
    );
  }
  const fg =
    score >= 75 ? "var(--pg-ok-soft-fg)" : score >= 50 ? "var(--pg-warn-soft-fg)" : "var(--pg-err)";
  const bg =
    score >= 75 ? "var(--pg-ok-soft-bg)" : score >= 50 ? "var(--pg-warn-soft-bg)" : "var(--pg-err-bg)";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] font-bold tabular-nums"
      style={{ background: bg, color: fg }}
      title={hasFlags ? "Ada klaim yang perlu dikonfirmasi vs CV" : "Kecocokan CV dengan posisi (AI)"}
    >
      {score}%
      {hasFlags && <Icon name="warn" size={11} />}
    </span>
  );
}
