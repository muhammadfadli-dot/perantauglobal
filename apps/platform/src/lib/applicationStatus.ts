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
