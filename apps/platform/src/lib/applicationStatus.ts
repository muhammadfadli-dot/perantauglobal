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

const ACCEPTED_STAGES = new Set([
  "selected",
  "training",
  "deployed",
  "active",
]);

const REJECTED_STAGES = new Set(["rejected", "exit"]);

export function getApplicationStatus(input: {
  pipelineStage: string;
  hardPass: boolean | null | undefined;
}): ApplicationStatus {
  const { pipelineStage, hardPass } = input;

  if (REJECTED_STAGES.has(pipelineStage)) {
    return {
      key: "rejected",
      label: "Tidak terpilih",
      tone: "mute",
      headline: "Tidak terpilih",
      description:
        "Sayang sekali, kamu belum terpilih kali ini. Tetap semangat — coba lowongan lain di Jelajah.",
    };
  }

  if (ACCEPTED_STAGES.has(pipelineStage)) {
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
