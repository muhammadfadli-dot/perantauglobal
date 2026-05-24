import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import { ReadinessBadge } from "./ReadinessBadge";
import StageSelector from "./StageSelector";
import NotesEditor from "./NotesEditor";
import { JobOrderPicker } from "./JobOrderPicker";
/**
 * Per-application readiness shape for ApplicationCard display.
 * Built from getApplicationCompleteness by callers — see
 * /admin/candidates/[id]/page.tsx for the adapter.
 */
export type ReadinessResultV3 = {
  per_field: Record<
    string,
    {
      passed: boolean
      self_passed: boolean
      doc_passed: boolean
      importance: "hard" | "soft"
      category: "personal" | "certification" | "language" | "experience"
      evidence_mode: "self_declared" | "document" | "either"
      label: string
      collect_at_stage: string
    }
  >
  hard_pass: boolean
  score_pct: number
  schema_version: 3
}

type OpenJobOrder = {
  id: string;
  intake_label: string;
  internal_employer_name: string;
  slot_count: number;
  slot_filled: number;
};

type FormField = {
  position_slug: string;
  field_key: string;
  field_label: string;
  field_type: string;
  options: { value: string; label: string }[] | null;
  collect_at_stage: string;
};

const STAGE_LABEL: Record<string, string> = {
  applied: "Baru masuk",
  screening: "Screening",
  voice_screen: "Voice screen",
  interview: "Wawancara",
  document_check: "Cek dokumen",
  briefing: "Briefing",
  trial: "Trial / training",
  selected: "Terpilih",
  training: "Training",
  deployed: "Sudah dideploy",
  active: "Aktif",
  rejected: "Tidak terpilih",
  exit: "Selesai",
};

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
    job_order_id?: string | null;
    positions: {
      name: string;
      country: string;
    } | null;
    job_orders?: {
      id: string;
      intake_label: string;
      internal_employer_name: string;
      status: string;
    } | null;
  };
  candidateName?: string;
  openJobOrders?: OpenJobOrder[];
  readiness?: ReadinessResultV3 | null;
  formFields?: FormField[];
}

export default function ApplicationCard({
  application: a,
  candidateName,
  openJobOrders = [],
  readiness = null,
  formFields = [],
}: ApplicationCardProps) {
  const inJobOrder = !!a.job_order_id;

  // Only show fields the candidate has actually answered. Order by sort_order
  // (already applied in query) and fall back to alphabetical for stability.
  const answeredFields = formFields.filter(
    (f) => a.answers && f.field_key in a.answers,
  );

  return (
    <article className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-400">
            {a.positions?.country ?? "—"}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <h3 className="text-lg font-extrabold tracking-tight">
              {a.positions?.name ?? a.position_slug}
            </h3>
            <ReadinessBadge readiness={readiness} />
          </div>
          <div className="text-[12px] text-pg-ink-500 mt-1">
            Didaftarkan {new Date(a.created_at).toLocaleDateString("id-ID")}
          </div>
        </div>
        <div className="shrink-0">
          {inJobOrder && a.job_orders ? (
            <Link
              href={`/admin/job-orders/${a.job_orders.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg no-underline text-[12px] font-bold transition-colors"
              style={{
                border: "1px solid var(--pg-info)",
                background: "var(--pg-info-bg)",
                color: "var(--pg-info)",
              }}
              title={`Pipeline: ${a.pipeline_stage} · Employer: ${a.job_orders.internal_employer_name}`}
            >
              <Icon name="arrow_right" size={13} stroke={2.4} />
              <span className="truncate max-w-[180px]">{a.job_orders.intake_label}</span>
            </Link>
          ) : (
            <JobOrderPicker
              applicationId={a.id}
              candidateName={candidateName ?? "kandidat"}
              openJobOrders={openJobOrders}
            />
          )}
        </div>
      </header>

      {/* Qualifying answers — formatted, not raw JSON */}
      <div className="mt-4">
        <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-500 mb-2">
          Jawaban qualifying
        </div>
        {answeredFields.length === 0 ? (
          <div className="text-[12px] text-pg-ink-400 italic py-2">
            Belum ada jawaban qualifying.
          </div>
        ) : (
          <div className="rounded-lg border border-pg-ink-100 divide-y divide-pg-ink-100 overflow-hidden">
            {answeredFields.map((f) => (
              <QuestionRow
                key={f.field_key}
                field={f}
                answer={a.answers?.[f.field_key]}
                readinessField={readiness?.per_field?.[f.field_key]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pipeline stage — only meaningful when in job order */}
      {inJobOrder && (
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap p-3 rounded-lg bg-pg-ink-50">
          <div className="flex flex-col gap-0.5">
            <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">
              Pipeline di {a.job_orders?.intake_label ?? "job order"}
            </div>
            <div className="text-[13px] font-semibold text-pg-ink-900">
              {STAGE_LABEL[a.pipeline_stage] ?? a.pipeline_stage}
            </div>
          </div>
          <StageSelector applicationId={a.id} current={a.pipeline_stage} />
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-pg-ink-100">
        <NotesEditor applicationId={a.id} initialNotes={a.po_notes ?? ""} />
      </div>
    </article>
  );
}

function QuestionRow({
  field,
  answer,
  readinessField,
}: {
  field: FormField;
  answer: unknown;
  readinessField?: {
    passed: boolean;
    importance: string;
  };
}) {
  const passed = readinessField?.passed;
  const isHard = readinessField?.importance === "hard";

  return (
    <div className="flex items-start gap-3 px-3 py-2.5 hover:bg-pg-ink-50 transition-colors">
      <StatusIcon passed={passed} hasReadiness={!!readinessField} />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-pg-ink-500">
          {field.field_label}
        </div>
        <div className="text-[13px] font-bold text-pg-ink-900 mt-0.5">
          {formatAnswer(answer, field)}
        </div>
      </div>
      {readinessField && passed === false && isHard && (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
          style={{
            background: "var(--pg-err-bg)",
            color: "var(--pg-err)",
          }}
        >
          Hard fail
        </span>
      )}
    </div>
  );
}

function StatusIcon({
  passed,
  hasReadiness,
}: {
  passed?: boolean;
  hasReadiness: boolean;
}) {
  if (!hasReadiness) {
    return (
      <span
        className="w-5 h-5 rounded-full grid place-items-center mt-0.5 shrink-0"
        style={{ background: "var(--pg-ink-100)", color: "var(--pg-ink-400)" }}
        title="Bukan syarat formal"
      >
        <Icon name="info" size={11} stroke={2.4} />
      </span>
    );
  }
  if (passed) {
    return (
      <span
        className="w-5 h-5 rounded-full grid place-items-center mt-0.5 shrink-0"
        style={{
          background: "var(--pg-ok-soft-bg)",
          color: "var(--pg-ok-soft-fg)",
        }}
        title="Syarat terpenuhi"
      >
        <Icon name="check" size={12} stroke={2.4} />
      </span>
    );
  }
  return (
    <span
      className="w-5 h-5 rounded-full grid place-items-center mt-0.5 shrink-0"
      style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
      title="Syarat tidak terpenuhi"
    >
      <Icon name="x" size={12} stroke={2.4} />
    </span>
  );
}

function formatAnswer(answer: unknown, field: FormField): string {
  if (answer === null || answer === undefined || answer === "") return "—";

  // Multiselect / array of values
  if (Array.isArray(answer)) {
    return answer
      .map((v) => optionLabel(v, field))
      .filter(Boolean)
      .join(", ");
  }

  // Boolean → Ya/Tidak
  if (typeof answer === "boolean") {
    return answer ? "Ya" : "Tidak";
  }

  // Object (rare, defensive)
  if (typeof answer === "object") {
    return JSON.stringify(answer);
  }

  // String / number — try option label lookup first
  return optionLabel(answer, field) || String(answer);
}

function optionLabel(value: unknown, field: FormField): string {
  const stringVal = String(value);
  const opt = field.options?.find((o) => String(o.value) === stringVal);
  if (opt) return opt.label;
  return stringVal;
}
