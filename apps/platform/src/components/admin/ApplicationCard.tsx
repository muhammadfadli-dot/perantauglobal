import { Badge } from "@/components/pg/primitives";
import StageSelector from "./StageSelector";
import NotesEditor from "./NotesEditor";
import ReachOutToggle from "./ReachOutToggle";
import TierPicker from "./TierPicker";

export interface ApplicationCardProps {
  application: {
    id: string;
    position_slug: string;
    pipeline_stage: string;
    answers: Record<string, unknown> | null;
    po_notes: string | null;
    reached_out: boolean;
    reached_out_at: string | null;
    score: number | null;
    created_at: string;
    positions: {
      name: string;
      country: string;
      requirements: Record<string, unknown> | null;
    } | null;
    application_tiers?: { tier: "A" | "B" | "C" | "D" | "rejected" } | null;
  };
}

const TIER_VARIANT: Record<"A" | "B" | "C" | "D" | "rejected", "ok" | "info" | "warn" | "mute" | "err"> = {
  A: "ok",
  B: "info",
  C: "warn",
  D: "mute",
  rejected: "err",
};

export default function ApplicationCard({ application: a }: ApplicationCardProps) {
  const tier = a.application_tiers?.tier ?? null;
  return (
    <article className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-400">
            {a.positions?.country ?? "—"}
          </div>
          <h3 className="text-lg font-extrabold tracking-tight mt-0.5">
            {a.positions?.name ?? a.position_slug}
          </h3>
          <div className="text-[12px] text-pg-ink-500 mt-1 flex items-center gap-2 flex-wrap">
            <span>Didaftarkan {new Date(a.created_at).toLocaleDateString("id-ID")}</span>
            {tier && (
              <>
                <span>·</span>
                <Badge variant={TIER_VARIANT[tier]}>Tier {tier}</Badge>
              </>
            )}
            {typeof a.score === "number" && (
              <>
                <span>·</span>
                <Badge variant="info">Score {a.score}</Badge>
              </>
            )}
          </div>
        </div>
        <ReachOutToggle
          applicationId={a.id}
          reachedOut={a.reached_out}
          reachedOutAt={a.reached_out_at}
        />
      </header>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_220px]">
        <div>
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">
            Jawaban
          </div>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-pg-ink-50 p-3 text-[11px] leading-[1.5] font-mono">
            {JSON.stringify(a.answers ?? {}, null, 2)}
          </pre>
        </div>
        <div className="grid gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">
              Pipeline stage
            </div>
            <div className="mt-2">
              <StageSelector applicationId={a.id} current={a.pipeline_stage} />
            </div>
          </div>
          <TierPicker applicationId={a.id} current={tier} />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-pg-ink-100">
        <NotesEditor applicationId={a.id} initialNotes={a.po_notes ?? ""} />
      </div>
    </article>
  );
}
