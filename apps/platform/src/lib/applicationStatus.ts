// Candidate-facing status derived from internal pipeline_stage + readiness hard_pass.
// Internal pipeline stages (applied/screening/interview/etc.) are deliberately
// NOT exposed to candidates — they only see one of four outcomes.

export type ApplicationStatusKey =
  | "needs_docs"
  | "received"
  | "accepted"
  | "rejected";

export type ApplicationStatusTone = "warn" | "info" | "ok" | "mute";

export type ApplicationStatus = {
  key: ApplicationStatusKey;
  label: string;
  tone: ApplicationStatusTone;
  headline: string;
  description: string;
};

// Canonical stage groupings — single source of truth shared by candidate-facing
// status, the admin dashboard/analytics KPIs, kanban, and job-order accepted counts.
// pipeline_stage is a single current-state column, so "accepted" must include every
// stage at or past selection (a candidate advanced to training/deployed/active is
// still accepted). Importing these instead of re-listing prevents the dashboard-vs-
// analytics "Diterima" drift.
export const ACCEPTED_STAGES = ["selected", "training", "deployed", "active"] as const;
export const REJECTED_STAGES = ["rejected", "exit"] as const;

const ACCEPTED_SET = new Set<string>(ACCEPTED_STAGES);
const REJECTED_SET = new Set<string>(REJECTED_STAGES);

export function isAcceptedStage(stage: string): boolean {
  return ACCEPTED_SET.has(stage);
}
export function isRejectedStage(stage: string): boolean {
  return REJECTED_SET.has(stage);
}

// ── Canonical pipeline stage model ────────────────────────────────────────────
// The full internal pipeline, in flow order. Single source of truth for which
// stages exist, their human labels, their flow position (for transition guards),
// and how they group into the 4 admin kanban columns. The candidate-facing status
// above and the admin kanban below are BOTH derived from this — so the JO detail
// board, the dashboard pipeline snapshot, analytics, and slot_filled can never
// disagree on what "accepted" means.
export const PIPELINE_STAGES = [
  "applied",
  "screening",
  "voice_screen",
  "interview",
  "document_check",
  "briefing",
  "trial",
  "selected",
  "training",
  "deployed",
  "active",
  "rejected",
  "exit",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

const STAGE_SET = new Set<string>(PIPELINE_STAGES);
export function isValidStage(stage: string): stage is PipelineStage {
  return STAGE_SET.has(stage);
}

// Position in the linear flow — used to detect backward / illegal transitions.
// rejected/exit sit at the end but are reachable from anywhere; callers treat a
// move INTO them as terminal, not "forward".
const STAGE_ORDER: Record<string, number> = Object.fromEntries(
  PIPELINE_STAGES.map((s, i) => [s, i]),
);
export function stageOrder(stage: string): number {
  return STAGE_ORDER[stage] ?? -1;
}

// Recruiter-facing Indonesian labels. NEVER render the raw enum token in the UI.
export const STAGE_LABEL: Record<string, string> = {
  applied: "Baru masuk",
  screening: "Screening",
  voice_screen: "Screening suara",
  interview: "Wawancara",
  document_check: "Cek dokumen",
  briefing: "Briefing",
  trial: "Trial / uji coba",
  selected: "Lolos seleksi",
  training: "Pelatihan",
  deployed: "Diberangkatkan",
  active: "Aktif bekerja",
  rejected: "Tidak lolos",
  exit: "Keluar / mundur",
};
export function stageLabel(stage: string): string {
  return STAGE_LABEL[stage] ?? stage;
}

// The 4 admin kanban columns. The "accepted" column IS exactly ACCEPTED_STAGES and
// the "rejected" column IS exactly REJECTED_STAGES, so a column's count can never
// drift from the canonical accepted/rejected sets — or from slot_filled, which is
// also computed from ACCEPTED_STAGES.
export type PipelineColumnKey =
  | "selection"
  | "interview_doc"
  | "accepted"
  | "rejected";
export type PipelineColumnTone = "warn" | "info" | "ok" | "mute";

export const PIPELINE_COLUMNS: {
  key: PipelineColumnKey;
  label: string;
  tone: PipelineColumnTone;
  stages: readonly PipelineStage[];
}[] = [
  {
    key: "selection",
    label: "Seleksi awal",
    tone: "warn",
    stages: ["applied", "screening", "voice_screen"],
  },
  {
    key: "interview_doc",
    label: "Wawancara & dokumen",
    tone: "info",
    stages: ["interview", "document_check", "briefing", "trial"],
  },
  {
    key: "accepted",
    label: "Diterima & penempatan",
    tone: "ok",
    stages: ACCEPTED_STAGES, // selected · training · deployed · active
  },
  {
    key: "rejected",
    label: "Tidak lolos",
    tone: "mute",
    stages: REJECTED_STAGES, // rejected · exit
  },
];

const COLUMN_FOR_STAGE: Record<string, PipelineColumnKey> = Object.fromEntries(
  PIPELINE_COLUMNS.flatMap((c) => c.stages.map((s) => [s, c.key] as const)),
);
export function columnForStage(stage: string): PipelineColumnKey {
  return COLUMN_FOR_STAGE[stage] ?? "selection";
}

// "Past pool" = the application has been pulled into a job order and is moving
// through the pipeline (anything beyond the initial 'applied' triage state).
// Used by dashboard/analytics to count real movement instead of current-snapshot.
export function isPastPool(stage: string): boolean {
  return isValidStage(stage) && stage !== "applied";
}

export function getApplicationStatus(input: {
  pipelineStage: string;
  hardPass: boolean | null | undefined;
}): ApplicationStatus {
  const { pipelineStage, hardPass } = input;

  if (REJECTED_SET.has(pipelineStage)) {
    return {
      key: "rejected",
      label: "Tidak terpilih",
      tone: "mute",
      headline: "Tidak terpilih",
      description:
        "Sayang sekali, kamu belum terpilih kali ini. Tetap semangat — coba lowongan lain di Jelajah.",
    };
  }

  if (ACCEPTED_SET.has(pipelineStage)) {
    return {
      key: "accepted",
      label: "Diterima",
      tone: "ok",
      headline: "Selamat — kamu diterima!",
      description:
        "Kamu lolos seleksi. Tim akan kabari proses berikutnya lewat WhatsApp dan email.",
    };
  }

  if (hardPass === false) {
    return {
      key: "needs_docs",
      label: "Lengkapi dokumen",
      tone: "warn",
      headline: "Lengkapi dokumen kamu",
      description:
        "Ada dokumen wajib yang belum kamu isi. Lengkapi biar lamaran kamu bisa dilanjut tim recruitment.",
    };
  }

  return {
    key: "received",
    label: "Lamaran diterima",
    tone: "info",
    headline: "Lamaran kamu sedang diproses",
    description:
      "Tim recruitment lagi tinjau profil kamu. Update bakal muncul di sini.",
  };
}
