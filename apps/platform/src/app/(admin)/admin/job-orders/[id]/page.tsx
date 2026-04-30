import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import { Icon } from "@/components/pg/Icon";

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
  application_tiers: { tier: string }[] | null;
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

type ColumnKey = "selecting" | "interview_doc" | "accepted" | "not_selected";

const COLUMN_DEF: { key: ColumnKey; label: string; tone: "warn" | "warn2" | "ok" | "mute"; stages: string[] }[] = [
  {
    key: "selecting",
    label: "Sedang diseleksi",
    tone: "warn",
    stages: ["applied", "screening", "voice_screen"],
  },
  {
    key: "interview_doc",
    label: "Wawancara & dokumen",
    tone: "warn2",
    stages: ["interview", "document_check", "briefing"],
  },
  {
    key: "accepted",
    label: "Diterima",
    tone: "ok",
    stages: ["selected", "trial", "training", "deployed", "active"],
  },
  {
    key: "not_selected",
    label: "Tidak terpilih",
    tone: "mute",
    stages: ["rejected", "exit"],
  },
];

const STAGE_HINT: Record<string, { label: string; tone: "ok" | "warn" | "info" | "mute" }> = {
  document_check: { label: "Butuh medical", tone: "warn" },
  trial: { label: "Training", tone: "info" },
  deployed: { label: "Sudah dideploy", tone: "ok" },
  active: { label: "Active", tone: "ok" },
  voice_screen: { label: "Voice screen", tone: "info" },
  interview: { label: "Interview", tone: "info" },
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
        "id, candidate_id, pipeline_stage, created_at, candidates (full_name, email, city), application_tiers (tier)"
      )
      .eq("job_order_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const jo = joData as unknown as JobOrder | null;
  if (!jo) return notFound();
  const apps = (appsData ?? []) as unknown as LinkedApp[];

  // Group apps by column
  const byColumn = new Map<ColumnKey, LinkedApp[]>();
  for (const col of COLUMN_DEF) byColumn.set(col.key, []);
  for (const a of apps) {
    const col = COLUMN_DEF.find((c) => c.stages.includes(a.pipeline_stage));
    if (col) {
      byColumn.get(col.key)!.push(a);
    } else {
      byColumn.get("selecting")!.push(a);
    }
  }

  const acceptedCount =
    byColumn.get("accepted")?.length ?? 0;

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
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/job-orders/${jo.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-bold text-pg-ink-secondary no-underline"
              style={{ border: "1px solid var(--pg-border)", background: "var(--pg-white)" }}
            >
              <Icon name="edit" size={13} />
              Edit JO
            </Link>
            <Link
              href={`/admin/candidates?position=${jo.position_slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-bold text-white no-underline"
              style={{ background: "var(--pg-red-600)" }}
            >
              <Icon name="plus" size={13} stroke={2.4} />
              Pull dari talent pool
            </Link>
          </div>
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

        {/* Kanban */}
        <div className="grid gap-4 lg:grid-cols-4">
          {COLUMN_DEF.map((col) => {
            const items = byColumn.get(col.key) ?? [];
            const dotColor =
              col.tone === "ok"
                ? "var(--pg-ok-soft-fg)"
                : col.tone === "warn"
                ? "var(--pg-warn-soft-fg)"
                : col.tone === "warn2"
                ? "var(--pg-warn-soft-fg)"
                : "var(--pg-ink-quaternary)";
            const showCount =
              col.key === "accepted" ? `${acceptedCount} / ${jo.slot_count}` : `${items.length}`;
            return (
              <div key={col.key} className="flex flex-col gap-3 min-w-0">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: dotColor }}
                    />
                    <span className="text-[14px] font-bold text-pg-ink-primary">
                      {col.label}
                    </span>
                  </div>
                  <span
                    className="text-[12px] font-semibold tabular-nums"
                    style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                  >
                    {showCount}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 min-h-[200px]">
                  {items.map((a) => (
                    <KanbanCard key={a.id} app={a} muted={col.key === "not_selected"} />
                  ))}
                  {items.length === 0 && (
                    <div
                      className="rounded-xl px-4 py-6 text-center text-[12px]"
                      style={{
                        background: "var(--pg-paper)",
                        border: "1px dashed var(--pg-border)",
                        color: "var(--pg-ink-quaternary)",
                      }}
                    >
                      Belum ada
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

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
            {jo.notes && (
              <div
                className="px-5 py-4"
                style={{ borderTop: "1px solid var(--pg-border)" }}
              >
                <div
                  className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5"
                  style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                >
                  Catatan internal
                </div>
                <p className="text-[14px] text-pg-ink-secondary leading-tight whitespace-pre-wrap">
                  {jo.notes}
                </p>
              </div>
            )}
          </div>
          <div
            className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <div
              className="text-[10px] font-semibold tracking-[0.12em] uppercase"
              style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
            >
              Aksi cepat
            </div>
            <Link
              href={`/admin/positions/${jo.position_slug}`}
              className="text-[13px] font-bold text-pg-ink-primary no-underline hover:text-pg-red-600 inline-flex items-center gap-1.5"
            >
              <Icon name="doc" size={14} /> Buka catalog posisi
            </Link>
            <Link
              href={`/admin/applications?job_order=${jo.id}`}
              className="text-[13px] font-bold text-pg-ink-primary no-underline hover:text-pg-red-600 inline-flex items-center gap-1.5"
            >
              <Icon name="compass" size={14} /> Lihat semua lamaran ({apps.length})
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

function KanbanCard({ app, muted }: { app: LinkedApp; muted?: boolean }) {
  const c = app.candidates;
  const tier = app.application_tiers?.[0]?.tier;
  const initials =
    c?.full_name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") ?? "??";
  const stageHint = STAGE_HINT[app.pipeline_stage];
  return (
    <Link
      href={`/admin/candidates/${app.candidate_id}`}
      className="block bg-pg-white rounded-xl p-3 no-underline"
      style={{
        border: "1px solid var(--pg-border)",
        opacity: muted ? 0.65 : 1,
      }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-8 h-8 rounded-full grid place-items-center font-bold text-[11px] shrink-0"
          style={{
            background: muted ? "var(--pg-ink-50)" : "var(--pg-ink-primary)",
            color: muted ? "var(--pg-ink-tertiary)" : "white",
            fontFamily: "var(--font-mono)",
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[13px] font-bold text-pg-ink-primary leading-tight truncate">
              {c?.full_name ?? "—"}
            </div>
            {tier && (
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0"
                style={{
                  background: tier === "A" ? "var(--pg-red-soft-bg)" : "var(--pg-ink-50)",
                  color: tier === "A" ? "var(--pg-red-600)" : "var(--pg-ink-tertiary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {tier}
              </span>
            )}
          </div>
          <div
            className="text-[11px] mt-0.5 leading-tight truncate"
            style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
          >
            {c?.city ?? "—"}
          </div>
        </div>
      </div>
      {stageHint && (
        <div
          className="mt-2 px-2 py-1 rounded-md text-[10px] font-bold tracking-[0.04em] uppercase"
          style={{
            background:
              stageHint.tone === "ok"
                ? "var(--pg-ok-soft-bg)"
                : stageHint.tone === "warn"
                ? "var(--pg-warn-soft-bg)"
                : stageHint.tone === "info"
                ? "var(--pg-info-bg)"
                : "var(--pg-ink-50)",
            color:
              stageHint.tone === "ok"
                ? "var(--pg-ok-soft-fg)"
                : stageHint.tone === "warn"
                ? "var(--pg-warn-soft-fg)"
                : stageHint.tone === "info"
                ? "var(--pg-info)"
                : "var(--pg-ink-tertiary)",
            fontFamily: "var(--font-mono)",
            display: "inline-block",
          }}
        >
          {stageHint.label}
        </div>
      )}
    </Link>
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
