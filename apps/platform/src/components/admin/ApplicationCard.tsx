import StageSelector from "./StageSelector";
import NotesEditor from "./NotesEditor";
import ReachOutToggle from "./ReachOutToggle";

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
  };
}

export default function ApplicationCard({ application: a }: ApplicationCardProps) {
  return (
    <article className="border border-[var(--color-dtg-ink)]/15 bg-white p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="font-semibold">
            {a.positions?.name ?? a.position_slug}
          </h3>
          <p className="mt-0.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] opacity-60">
            {a.positions?.country ?? "—"} · didaftarkan{" "}
            {new Date(a.created_at).toLocaleDateString("id-ID")}
          </p>
        </div>
        <ReachOutToggle
          applicationId={a.id}
          reachedOut={a.reached_out}
          reachedOutAt={a.reached_out_at}
        />
      </header>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_200px]">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] opacity-60">
            Jawaban
          </p>
          <pre className="mt-2 overflow-x-auto rounded bg-[var(--color-dtg-cream)]/50 p-3 font-[family-name:var(--font-mono)] text-[11px] leading-[1.5]">
            {JSON.stringify(a.answers ?? {}, null, 2)}
          </pre>
        </div>
        <div>
          <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] opacity-60">
            Pipeline stage
          </p>
          <div className="mt-2">
            <StageSelector applicationId={a.id} current={a.pipeline_stage} />
          </div>
          {typeof a.score === "number" && (
            <p className="mt-3 font-[family-name:var(--font-mono)] text-[11px] opacity-60">
              Score: {a.score}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <NotesEditor applicationId={a.id} initialNotes={a.po_notes ?? ""} />
      </div>
    </article>
  );
}
