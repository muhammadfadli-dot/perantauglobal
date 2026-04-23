import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { Badge } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";
import KanbanColumn from "./KanbanColumn";

export const dynamic = "force-dynamic";

type AppCard = {
  id: string;
  candidate_id: string;
  pipeline_stage: string;
  created_at: string;
  candidates: { full_name: string; city: string | null } | null;
  application_tiers: { tier: "A" | "B" | "C" | "D" | "rejected" } | null;
};

type JobOrder = {
  id: string;
  intake_label: string;
  position_slug: string;
  positions: { name: string; country: string } | null;
};

/**
 * Kanban groups internal stages into 4 user-visible phases (per SPEC §3.8) +
 * a separate "rejected/exit" column. This matches the design and what
 * candidates see, while admin can still set fine-grained internal stage.
 */
const COLUMNS: {
  key: string;
  label: string;
  stages: string[];
  tone: "warn" | "info" | "ok" | "err" | "mute";
}[] = [
  { key: "selection", label: "Sedang diseleksi", stages: ["applied", "screening", "voice_screen", "document_check"], tone: "warn" },
  { key: "interview", label: "Wawancara & dokumen", stages: ["interview", "briefing", "trial"], tone: "info" },
  { key: "accepted", label: "Diterima", stages: ["selected", "training", "deployed", "active"], tone: "ok" },
  { key: "rejected", label: "Tidak lolos", stages: ["rejected", "exit"], tone: "err" },
];

export default async function KanbanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const [{ data: joData }, { data: appsData }] = await Promise.all([
    supabase.from("job_orders").select("id, intake_label, position_slug, positions (name, country)").eq("id", id).maybeSingle(),
    supabase.from("applications").select("id, candidate_id, pipeline_stage, created_at, candidates (full_name, city), application_tiers (tier)").eq("job_order_id", id).order("created_at", { ascending: false }),
  ]);

  const jo = joData as unknown as JobOrder | null;
  if (!jo) return notFound();
  const apps = (appsData ?? []) as unknown as AppCard[];

  const grouped = COLUMNS.map((col) => ({
    ...col,
    cards: apps.filter((a) => col.stages.includes(a.pipeline_stage)),
  }));

  return (
    <main className="p-6 lg:p-10">
      <Link
        href={`/admin/job-orders/${id}`}
        className="inline-flex items-center gap-1 text-[12px] font-bold tracking-wide uppercase text-pg-ink-500 hover:text-pg-red-600 no-underline"
      >
        <Icon name="arrow_left" size={14} /> Kembali ke job order
      </Link>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <div>
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            Pipeline kanban
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1.5">
            {jo.positions?.name ?? jo.position_slug}
          </h1>
          <div className="text-base text-pg-ink-700 mt-1">{jo.intake_label}</div>
        </div>
        <Badge variant="info">{apps.length} kandidat</Badge>
      </div>

      {/* Kanban — horizontal scroll on mobile, 4-col grid on lg+ */}
      <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-4">
        {grouped.map((col) => (
          <KanbanColumn key={col.key} column={col} />
        ))}
      </div>
    </main>
  );
}
