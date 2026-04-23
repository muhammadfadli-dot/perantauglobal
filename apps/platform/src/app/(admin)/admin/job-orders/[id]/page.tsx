import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { Badge } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";
import StatusControls from "./StatusControls";
import NotesField from "./NotesField";

export const dynamic = "force-dynamic";

type JobOrder = {
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
  public_description: string | null;
  notes: string | null;
  created_at: string;
  positions: { name: string; country: string } | null;
};

type LinkedApplication = {
  id: string;
  candidate_id: string;
  pipeline_stage: string;
  created_at: string;
  candidates: { full_name: string; email: string | null; city: string | null } | null;
};

const STATUS_LABEL: Record<string, string> = {
  open: "Lagi buka", closed: "Ditutup", filled: "Penuh", cancelled: "Dibatalkan",
};
const STATUS_VARIANT: Record<string, "ok" | "warn" | "info" | "err" | "mute"> = {
  open: "ok", closed: "mute", filled: "info", cancelled: "err",
};
const COUNTRY_LABEL: Record<string, string> = {
  saudi_arabia: "Saudi Arabia", japan: "Jepang", taiwan: "Taiwan", indonesia: "Indonesia",
};

export default async function JobOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const [{ data: joData }, { data: appsData }] = await Promise.all([
    supabase.from("job_orders").select("id, position_slug, internal_employer_name, public_employer_name, employer_city, intake_label, slot_count, slot_filled, status, deadline, public_description, notes, created_at, positions (name, country)").eq("id", id).maybeSingle(),
    supabase.from("applications").select("id, candidate_id, pipeline_stage, created_at, candidates (full_name, email, city)").eq("job_order_id", id).order("created_at", { ascending: false }),
  ]);

  const jo = joData as unknown as JobOrder | null;
  if (!jo) return notFound();
  const apps = (appsData ?? []) as unknown as LinkedApplication[];

  const pct = jo.slot_count > 0 ? Math.round((jo.slot_filled / jo.slot_count) * 100) : 0;

  return (
    <main className="p-6 lg:p-10 max-w-6xl">
      <Link
        href="/admin/job-orders"
        className="inline-flex items-center gap-1 text-[12px] font-bold tracking-wide uppercase text-pg-ink-500 hover:text-pg-red-600 no-underline"
      >
        <Icon name="arrow_left" size={14} /> Job Orders
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            {COUNTRY_LABEL[jo.positions?.country ?? ""] ?? jo.positions?.country}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
            {jo.positions?.name ?? jo.position_slug}
          </h1>
          <div className="text-base text-pg-ink-700 mt-1">
            {jo.intake_label} · <Link href={`/admin/positions/${jo.position_slug}`} className="text-pg-red-600 font-semibold no-underline">lihat catalog</Link>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={STATUS_VARIANT[jo.status]}>{STATUS_LABEL[jo.status]}</Badge>
          <Link
            href={`/admin/job-orders/${jo.id}/kanban`}
            className="inline-flex items-center justify-center gap-2 min-h-[40px] px-3.5 text-sm font-semibold rounded-xl border-[1.5px] border-pg-ink-200 text-pg-ink-900 no-underline hover:bg-pg-ink-50"
          >
            <Icon name="filter" size={16} /> Kanban view
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="grid gap-5">
          {/* Slots */}
          <section className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
            <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500">
              Slot
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-4xl font-extrabold tabular-nums tracking-tight">
                {jo.slot_filled}
              </div>
              <div className="text-base text-pg-ink-500">dari {jo.slot_count} slot terisi</div>
            </div>
            <div className="mt-3 h-2 bg-pg-ink-100 rounded-full overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${pct}%`,
                  background: pct >= 100 ? "var(--pg-info)" : "var(--pg-ok)",
                }}
              />
            </div>
          </section>

          {/* Employer info */}
          <section className="bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-pg-ink-100 text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500">
              Detail
            </div>
            {[
              { label: "Employer (internal)", value: jo.internal_employer_name },
              { label: "Employer (public)", value: jo.public_employer_name ?? "—" },
              { label: "Kota", value: jo.employer_city ?? "—" },
              { label: "Deadline", value: jo.deadline ? new Date(jo.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—" },
              { label: "Dibuat", value: new Date(jo.created_at).toLocaleDateString("id-ID") },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`px-5 py-3 flex justify-between items-start gap-3 ${
                  i ? "border-t border-pg-ink-100" : ""
                }`}
              >
                <div className="text-sm text-pg-ink-500 shrink-0">{row.label}</div>
                <div className="text-sm font-semibold text-right">{row.value}</div>
              </div>
            ))}
            {jo.public_description && (
              <div className="px-5 py-3 border-t border-pg-ink-100">
                <div className="text-sm text-pg-ink-500 mb-1.5">Deskripsi public</div>
                <div className="text-[15px] leading-relaxed">{jo.public_description}</div>
              </div>
            )}
          </section>

          {/* Applicants */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500">
                Pelamar di job order ini ({apps.length})
              </div>
            </div>
            {apps.length === 0 ? (
              <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-6 text-center text-sm text-pg-ink-500">
                Belum ada kandidat yang apply ke job order ini.
              </div>
            ) : (
              <div className="grid gap-3">
                {apps.map((a) => (
                  <Link
                    key={a.id}
                    href={`/admin/candidates/${a.candidate_id}`}
                    className="block bg-pg-white border border-pg-ink-100 rounded-2xl p-4 no-underline text-pg-ink-900 hover:border-pg-ink-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-base font-bold">
                          {a.candidates?.full_name ?? "—"}
                        </div>
                        <div className="text-[13px] text-pg-ink-500 mt-0.5">
                          {a.candidates?.city ?? "—"} · {a.candidates?.email ?? "—"}
                        </div>
                      </div>
                      <Badge variant="mute">{a.pipeline_stage}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="grid gap-5 self-start">
          <section className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
            <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500">
              Status
            </div>
            <div className="mt-3">
              <StatusControls id={jo.id} current={jo.status} />
            </div>
          </section>

          <section className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
            <NotesField id={jo.id} initial={jo.notes ?? ""} />
          </section>
        </aside>
      </div>
    </main>
  );
}
