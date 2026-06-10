import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import { Icon } from "@/components/pg/Icon";
import StatusControls from "./StatusControls";
import NotesField from "./NotesField";
import JobOrderKanbanBoard from "@/components/admin/JobOrderKanbanBoard";

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

type LinkedApp = {
  id: string;
  candidate_id: string;
  pipeline_stage: string;
  created_at: string;
  candidates: {
    full_name: string;
    email: string | null;
    city: string | null;
  } | null;
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

const COUNTRY_LABEL: Record<string, string> = {
  saudi_arabia: "Arab Saudi",
  japan: "Jepang",
  taiwan: "Taiwan",
  indonesia: "Indonesia",
};

export default async function JobOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const [{ data: joData }, { data: appsData }] = await Promise.all([
    supabase
      .from("job_orders")
      .select(
        "id, position_slug, internal_employer_name, public_employer_name, employer_city, intake_label, slot_count, slot_filled, status, deadline, public_description, notes, created_at, positions (name, country)"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("applications")
      .select(
        "id, candidate_id, pipeline_stage, created_at, candidates (full_name, email, city)"
      )
      .eq("job_order_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const jo = joData as unknown as JobOrder | null;
  if (!jo) return notFound();
  const apps = (appsData ?? []) as unknown as LinkedApp[];

  // Days to deadline
  let daysToDeadline: number | null = null;
  if (jo.deadline) {
    const now = new Date();
    const deadline = new Date(jo.deadline);
    daysToDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <>
      <AdminTopBar
        crumbs={[
          { label: "Operasi" },
          { label: "Job orders", href: "/admin/job-orders" },
          { label: `${jo.public_employer_name ?? jo.internal_employer_name} · ${jo.intake_label}`, emphasis: true },
        ]}
        rightSlot={
          <Link
            href={`/admin/candidates?position=${jo.position_slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-bold text-white no-underline"
            style={{ background: "var(--pg-red-600)" }}
          >
            <Icon name="plus" size={13} stroke={2.4} />
            Pull dari talent pool
          </Link>
        }
      />

      <main className="px-8 py-7 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5 min-w-0 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold tracking-[0.06em] uppercase"
                style={{
                  background: STATUS_TONE[jo.status]?.bg,
                  color: STATUS_TONE[jo.status]?.fg,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {STATUS_LABEL[jo.status]}
              </span>
              <span
                className="text-[11px] font-semibold tracking-[0.06em]"
                style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
              >
                {jo.positions?.name ?? jo.position_slug} —{" "}
                {COUNTRY_LABEL[jo.positions?.country ?? ""] ?? jo.positions?.country}
                {jo.employer_city ? ` · ${jo.employer_city}` : ""}
              </span>
            </div>
            <h1 className="text-[32px] font-extrabold leading-[36px] tracking-[-0.025em] text-pg-ink-primary">
              {jo.public_employer_name ?? jo.internal_employer_name} — {jo.intake_label}
            </h1>
            {jo.public_description && (
              <p className="text-[14px] text-pg-ink-tertiary leading-tight max-w-2xl">
                {jo.public_description}
              </p>
            )}
          </div>
          <div className="flex items-end gap-8">
            <div className="flex flex-col items-start">
              <div className="flex items-baseline gap-1">
                <span className="text-[36px] font-extrabold leading-[40px] text-pg-ink-primary tabular-nums">
                  {jo.slot_filled}
                </span>
                <span className="text-[18px] font-semibold text-pg-ink-tertiary">
                  / {jo.slot_count} slot
                </span>
              </div>
              <div
                className="h-1 rounded-full mt-1.5 w-32 overflow-hidden"
                style={{ background: "var(--pg-ink-50)" }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${jo.slot_count > 0 ? Math.round((jo.slot_filled / jo.slot_count) * 100) : 0}%`,
                    background: "var(--pg-red-600)",
                  }}
                />
              </div>
              <div
                className="text-[10px] mt-1 font-semibold tracking-[0.06em] uppercase"
                style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
              >
                Slot terisi
              </div>
            </div>
            {daysToDeadline != null && (
              <div className="flex flex-col items-start">
                <div
                  className={`text-[36px] font-extrabold leading-[40px] tabular-nums ${
                    daysToDeadline < 7 ? "text-pg-red-600" : "text-pg-ink-primary"
                  }`}
                >
                  {daysToDeadline} <span className="text-[18px] font-semibold">hari</span>
                </div>
                <div
                  className="text-[10px] mt-1 font-semibold tracking-[0.06em] uppercase"
                  style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                >
                  Deadline {new Date(jo.deadline!).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline kanban — interactive: each card carries a stage selector so a
            recruiter can advance candidates from the job order itself. */}
        <JobOrderKanbanBoard apps={apps} slotCount={jo.slot_count} />

        {/* Internal notes / employer info */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div
            className="lg:col-span-2 bg-pg-white rounded-2xl"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <div
              className="px-5 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase"
              style={{
                color: "var(--pg-ink-tertiary)",
                fontFamily: "var(--font-mono)",
                borderBottom: "1px solid var(--pg-border)",
              }}
            >
              Internal info
            </div>
            <dl className="grid grid-cols-2 px-5 py-4 gap-y-2.5 gap-x-6">
              <DRow label="Employer (internal)" value={jo.internal_employer_name} />
              <DRow label="Employer (publik)" value={jo.public_employer_name ?? "—"} />
              <DRow label="Kota" value={jo.employer_city ?? "—"} />
              <DRow label="Dibuat" value={new Date(jo.created_at).toLocaleDateString("id-ID")} />
            </dl>
            <div
              className="px-5 py-4"
              style={{ borderTop: "1px solid var(--pg-border)" }}
            >
              <NotesField id={jo.id} initial={jo.notes ?? ""} />
            </div>
          </div>
          <div
            className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <div
              className="text-[10px] font-semibold tracking-[0.12em] uppercase"
              style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
            >
              Status job order
            </div>
            <StatusControls id={jo.id} current={jo.status} />
            <div
              className="text-[10px] font-semibold tracking-[0.12em] uppercase pt-2"
              style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)", borderTop: "1px solid var(--pg-border)" }}
            >
              Aksi cepat
            </div>
            <Link
              href={`/admin/job-orders/${jo.id}/edit`}
              className="text-[13px] font-bold text-pg-ink-primary no-underline hover:text-pg-red-600 inline-flex items-center gap-1.5"
            >
              <Icon name="edit" size={14} /> Edit job order
            </Link>
            <Link
              href={`/admin/positions/${jo.position_slug}`}
              className="text-[13px] font-bold text-pg-ink-primary no-underline hover:text-pg-red-600 inline-flex items-center gap-1.5"
            >
              <Icon name="doc" size={14} /> Buka catalog posisi
            </Link>
            <Link
              href={`/admin/applications?position=${jo.position_slug}&pool=in_job_order`}
              className="text-[13px] font-bold text-pg-ink-primary no-underline hover:text-pg-red-600 inline-flex items-center gap-1.5"
            >
              <Icon name="compass" size={14} /> Lamaran posisi ini di pipeline ({apps.length})
            </Link>
            <Link
              href={`/admin/candidates?position=${jo.position_slug}`}
              className="text-[13px] font-bold text-pg-ink-primary no-underline hover:text-pg-red-600 inline-flex items-center gap-1.5"
            >
              <Icon name="users" size={14} /> Talent pool match
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function DRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt
        className="text-[10px] font-semibold tracking-[0.1em] uppercase"
        style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
      >
        {label}
      </dt>
      <dd className="text-[13px] font-semibold text-pg-ink-primary">{value}</dd>
    </div>
  );
}
