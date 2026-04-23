import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import { Badge } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";

export const dynamic = "force-dynamic";

type JobOrderRow = {
  id: string;
  position_slug: string;
  internal_employer_name: string;
  intake_label: string;
  slot_count: number;
  slot_filled: number;
  status: "open" | "closed" | "filled" | "cancelled";
  deadline: string | null;
  created_at: string;
  positions: { name: string; country: string } | null;
};

const STATUS_LABEL: Record<string, string> = {
  open: "Lagi buka",
  closed: "Ditutup",
  filled: "Penuh",
  cancelled: "Dibatalkan",
};

const STATUS_VARIANT: Record<string, "ok" | "warn" | "info" | "err" | "mute"> = {
  open: "ok",
  closed: "mute",
  filled: "info",
  cancelled: "err",
};

export default async function JobOrdersListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createServerClient();

  let query = supabase
    .from("job_orders")
    .select(
      "id, position_slug, internal_employer_name, intake_label, slot_count, slot_filled, status, deadline, created_at, positions (name, country)"
    )
    .order("created_at", { ascending: false });

  if (status && ["open", "closed", "filled", "cancelled"].includes(status)) {
    query = query.eq("status", status as "open" | "closed" | "filled" | "cancelled");
  }

  const { data, error } = await query;
  if (error) {
    return <main className="p-10"><p className="text-sm text-pg-err">Query gagal: {error.message}</p></main>;
  }
  const rows = (data ?? []) as unknown as JobOrderRow[];

  return (
    <main className="p-6 lg:p-10 max-w-6xl">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            Admin / Job Orders
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
            Job Orders
          </h1>
          <p className="text-base text-pg-ink-700 mt-2 leading-relaxed max-w-2xl">
            Instance konkret dari posisi catalog dengan employer, slot, dan deadline. Saat status
            <code className="px-1.5 py-0.5 bg-pg-ink-50 rounded font-mono text-[12px]">open</code>
            , muncul di www <code className="px-1.5 py-0.5 bg-pg-ink-50 rounded font-mono text-[12px]">/lowongan</code>.
          </p>
        </div>
        <Link
          href="/admin/job-orders/new"
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 text-sm font-semibold rounded-xl bg-pg-red-600 text-white no-underline hover:bg-pg-red-700"
        >
          <Icon name="plus" size={16} stroke={2.4} /> Buat job order
        </Link>
      </div>

      {/* Status filter chips */}
      <div className="mt-6 flex gap-2 flex-wrap">
        {[
          { key: "", label: "Semua" },
          { key: "open", label: "Lagi buka" },
          { key: "filled", label: "Penuh" },
          { key: "closed", label: "Ditutup" },
          { key: "cancelled", label: "Dibatalkan" },
        ].map((c) => {
          const active = (status ?? "") === c.key;
          return (
            <Link
              key={c.key}
              href={c.key ? `/admin/job-orders?status=${c.key}` : "/admin/job-orders"}
              className={`inline-flex items-center h-9 px-3.5 text-sm font-semibold rounded-full no-underline border-[1.5px] transition-colors ${
                active
                  ? "bg-pg-ink-900 text-white border-pg-ink-900"
                  : "bg-pg-white text-pg-ink-700 border-pg-ink-200 hover:border-pg-ink-300"
              }`}
            >
              {c.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="border-b border-pg-ink-100 bg-pg-ink-50">
            <tr className="text-left text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">
              <th className="px-4 py-3">Posisi & Batch</th>
              <th className="px-4 py-3">Employer</th>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Deadline</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="text-base font-bold">Belum ada job order</div>
                  <div className="text-sm text-pg-ink-500 mt-1.5 leading-relaxed">
                    Buat job order baru untuk mulai terima lamaran kandidat.
                  </div>
                  <Link
                    href="/admin/job-orders/new"
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 mt-4 text-sm font-semibold rounded-xl bg-pg-red-600 text-white no-underline"
                  >
                    <Icon name="plus" size={16} stroke={2.4} /> Buat job order
                  </Link>
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const pct = r.slot_count > 0 ? Math.round((r.slot_filled / r.slot_count) * 100) : 0;
              return (
                <tr key={r.id} className="border-b border-pg-ink-100 last:border-b-0 hover:bg-pg-ink-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/job-orders/${r.id}`}
                      className="font-bold text-pg-ink-900 hover:text-pg-red-600 no-underline"
                    >
                      {r.positions?.name ?? r.position_slug}
                    </Link>
                    <div className="text-[12px] text-pg-ink-500 mt-0.5">{r.intake_label}</div>
                  </td>
                  <td className="px-4 py-3 text-[13px]">{r.internal_employer_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="text-[13px] font-bold tabular-nums">
                        {r.slot_filled}/{r.slot_count}
                      </div>
                      <div className="flex-1 max-w-[80px] h-1.5 bg-pg-ink-100 rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 100 ? "var(--pg-info)" : "var(--pg-ok)",
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] font-mono text-pg-ink-500">
                    {r.deadline ? new Date(r.deadline).toLocaleDateString("id-ID") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[12px] font-mono text-pg-ink-500">
                    {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
