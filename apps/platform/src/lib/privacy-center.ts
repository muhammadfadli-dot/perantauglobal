/**
 * Display catalog + constants for the candidate privacy centre
 * (/profile/privasi). Presentation only - this module deliberately holds NO
 * consent wording of its own.
 *
 * The binding text a candidate agreed to is the `purpose_text` stored on each
 * `consents` row, written at grant time from the consent SoT modules
 * (lib/apply-consent.ts, lib/academy-consent.ts, lib/signup-consent.ts). The
 * privacy page renders that column verbatim; everything here is the label,
 * the plain-language blurb and the withdrawal warning wrapped AROUND it. Never
 * paraphrase a purpose_text into this file - a paraphrase shown next to a
 * ledger row is exactly the drift that made the ledger unusable as evidence.
 *
 * No server-only imports: this is pulled into the client bundle by
 * ConsentLedger.tsx.
 */
import type { IconName } from "@/components/pg/Icon";
import { APPLY_CONSENT_PURPOSE } from "./apply-consent";

/**
 * How much a candidate loses by withdrawing. Drives which warning + how many
 * confirm steps the UI puts in front of them.
 *
 *  - `placement`: stops the placement process itself (UU PDP right to withdraw,
 *    with the consequence the privacy policy already warns about).
 *  - `granular`: an independent, smaller opt-out that leaves the application
 *    running.
 *  - `service`: stops one service the candidate opted into.
 */
export type ConsentImpact = "placement" | "granular" | "service";

export type ConsentMeta = {
  label: string;
  blurb: string;
  icon: IconName;
  impact: ConsentImpact;
};

/**
 * Keyed by `consents.purpose`. Values observed in production as of 2026-07-21:
 * application_processing, cv_processing, academy_processing,
 * event_account_processing. Anything else falls back to genericMeta() so a new
 * purpose shipped elsewhere still renders (and stays withdrawable) instead of
 * silently disappearing from the candidate's ledger.
 */
const CATALOG: Record<string, ConsentMeta> = {
  [APPLY_CONSENT_PURPOSE]: {
    label: "Pemrosesan lamaran",
    blurb:
      "Dipakai buat verifikasi data kamu, menghubungi kamu, mencocokkan kamu dengan lowongan, dan membagikan berkas ke calon employer serta regulator.",
    icon: "briefcase",
    impact: "placement",
  },
  cv_processing: {
    label: "Analisis CV otomatis",
    blurb:
      "Dipakai buat membaca CV kamu secara otomatis dan mencocokkannya dengan kebutuhan tiap lowongan.",
    icon: "doc",
    impact: "granular",
  },
  academy_processing: {
    label: "Akademi Perantau",
    blurb:
      "Dipakai buat pendaftaran dan penyelenggaraan kelas: verifikasi, komunikasi, materi, dan sertifikat.",
    icon: "passport",
    impact: "service",
  },
  event_account_processing: {
    label: "Acara & webinar",
    blurb:
      "Dipakai buat pendaftaran acara dan pembuatan akun yang menyertainya.",
    icon: "users",
    impact: "service",
  },
};

function genericMeta(purpose: string): ConsentMeta {
  const label = purpose
    .split("_")
    .filter(Boolean)
    .join(" ")
    .replace(/^./, (c) => c.toUpperCase());
  return {
    label: label || "Persetujuan lain",
    blurb:
      "Persetujuan yang kamu berikan lewat salah satu formulir Perantau Global.",
    icon: "shield",
    impact: "service",
  };
}

export function getConsentMeta(purpose: string): ConsentMeta {
  return CATALOG[purpose] ?? genericMeta(purpose);
}

export type WithdrawCopy = {
  title: string;
  points: string[];
  /** Present = the UI must make the candidate tick this before confirming. */
  ackLabel?: string;
  confirmLabel: string;
};

/**
 * Withdrawal is a state change on the ledger and NOTHING else: no row is
 * deleted, no document is removed, no application is cancelled by this app.
 * Every variant says so out loud, because a candidate who reads "tarik
 * persetujuan" as "hapus data saya" would otherwise walk away with the wrong
 * mental model of what just happened.
 */
export const WITHDRAW_COPY: Record<ConsentImpact, WithdrawCopy> = {
  placement: {
    title: "Ini bisa menghentikan proses penempatan kamu",
    points: [
      "Lamaran yang lagi berjalan bisa dihentikan. Kami berhenti memproses data kamu buat pencocokan lowongan dan berhenti membagikannya ke calon employer.",
      "Kamu gak bisa membatalkan sendiri dari halaman ini. Kalau berubah pikiran, kamu perlu melamar lagi dari awal.",
      "Data kamu gak ikut terhapus. Yang wajib kami simpan karena aturan tetap tersimpan. Buat minta penghapusan, pakai bagian \"Hapus data saya\" di bawah.",
    ],
    ackLabel: "Aku paham proses penempatanku bisa berhenti.",
    confirmLabel: "Ya, tarik persetujuan",
  },
  granular: {
    title: "Keputusan kecil, terpisah dari lamaran kamu",
    points: [
      "CV kamu berhenti dianalisis otomatis buat pencocokan lowongan. Lamaran kamu sendiri tetap jalan.",
      "File CV-nya gak ikut terhapus. Kalau kamu mau file-nya dihapus juga, pakai bagian \"Hapus data saya\" di bawah.",
    ],
    confirmLabel: "Tarik persetujuan ini",
  },
  service: {
    title: "Sebelum kamu tarik",
    points: [
      "Kami berhenti memproses data kamu buat keperluan ini, dan layanan yang bergantung padanya bisa ikut berhenti.",
      "Data kamu gak ikut terhapus. Buat minta penghapusan, pakai bagian \"Hapus data saya\" di bawah.",
    ],
    confirmLabel: "Ya, tarik persetujuan",
  },
};

/**
 * Data-subject request channel. These three are quoted from the published
 * privacy policy (perantauglobal.com/privacy, section "Hak Kamu" + "Kontak"),
 * so the portal promises exactly what the policy promises - not a day more,
 * not a different mailbox.
 */
export const PDP_REQUEST_EMAIL = "halo@perantauglobal.com";
export const PDP_REQUEST_SUBJECT = "Permintaan Hak Subjek Data";
export const PDP_RESPONSE_WORKING_DAYS = 14;
