import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import ApplicationFilters from "@/components/admin/ApplicationFilters";
import {
  ApplicationsTable,
  type AppRow,
  type OpenJobOrder,
} from "@/components/admin/ApplicationsTable";
import { Icon } from "@/components/pg/Icon";

type PositionEntry = {
  slug: string;
  name: string;
  country: string;
  active: boolean;
  app_count: number;
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;
type SortKey = "newest" | "readiness" | "fit";
type PoolKey = "pool" | "in_job_order" | "all";

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
  // Plain object (not a Map) so it can cross the server→client boundary.
  const jobOrdersByPosition: Record<string, OpenJobOrder[]> = {};
  for (const jo of openJobOrders) {
    (jobOrdersByPosition[jo.position_slug] ??= []).push(jo);
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
            seleksi. Centang beberapa sekaligus buat aksi massal.
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

      <ApplicationsTable
        rows={rows}
        jobOrdersByPosition={jobOrdersByPosition}
        activePosition={position ?? ""}
      />

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
