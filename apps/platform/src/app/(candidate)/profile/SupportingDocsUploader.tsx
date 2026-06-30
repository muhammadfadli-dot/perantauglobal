"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/pg/Icon";
import DocumentUploadModal from "@/components/pg/DocumentUploadModal";

/**
 * Optional supporting-credential uploads (sertifikat, ijazah, SIM, dst).
 * These feed the CV grader's multi-document extraction — uploading one
 * re-grades the candidate's CV so the evidence is merged + the per-position
 * fit reflects it (the re-grade is fired inside DocumentUploadModal).
 *
 * Kept deliberately light for a low-skill audience: all optional, one familiar
 * row per credential type, "Tambah" always available (a candidate can have
 * several — e.g. two language certs). No verification states to avoid clutter.
 */

type CredType =
  | "language_certificate"
  | "professional_certificate"
  | "education_certificate"
  | "work_certificate"
  | "str_certificate"
  | "driving_license";

const CRED: { type: CredType; label: string; hint: string; icon: IconName }[] = [
  { type: "language_certificate", label: "Sertifikat bahasa", hint: "JLPT, IELTS, EPS-TOPIK, dll", icon: "globe" },
  { type: "professional_certificate", label: "Sertifikat profesi", hint: "SSW Kaigo, BLS, Halal Handler, dll", icon: "star" },
  { type: "education_certificate", label: "Ijazah / transkrip", hint: "Pendidikan terakhir", icon: "doc" },
  { type: "work_certificate", label: "Surat pengalaman kerja", hint: "Dari perusahaan sebelumnya", icon: "briefcase" },
  { type: "str_certificate", label: "STR", hint: "Surat Tanda Registrasi (perawat)", icon: "doc_check" },
  { type: "driving_license", label: "SIM", hint: "Surat Izin Mengemudi", icon: "truck" },
];

export default function SupportingDocsUploader({
  candidateId,
  counts,
}: {
  candidateId: string;
  counts: Record<string, number>;
}) {
  return (
    <div className="grid gap-2">
      {CRED.map((c) => (
        <CredRow key={c.type} candidateId={candidateId} item={c} count={counts[c.type] ?? 0} />
      ))}
    </div>
  );
}

function CredRow({
  candidateId,
  item,
  count,
}: {
  candidateId: string;
  item: { type: CredType; label: string; hint: string; icon: IconName };
  count: number;
}) {
  const [open, setOpen] = useState(false);
  const has = count > 0;
  return (
    <div className="bg-pg-white border border-pg-ink-100 rounded-xl">
      <div className="flex items-center gap-3 px-3.5 py-3">
        <div
          className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
          style={{
            background: has ? "var(--pg-ok-bg)" : "var(--pg-ink-50)",
            color: has ? "var(--pg-ok)" : "var(--pg-ink-500)",
          }}
        >
          <Icon name={item.icon} size={18} stroke={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold">{item.label}</div>
          <div
            className="text-[12px] mt-0.5"
            style={{ color: has ? "var(--pg-ok)" : "var(--pg-ink-500)" }}
          >
            {has ? `${count} dokumen tersimpan` : item.hint}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 min-h-[36px] px-3 text-[13px] font-semibold rounded-lg shrink-0"
          style={
            has
              ? { border: "1px solid var(--pg-border)", color: "var(--pg-ink-secondary)" }
              : { background: "var(--pg-red-600)", color: "var(--pg-white)" }
          }
        >
          <Icon name={has ? "plus" : "upload"} size={14} />
          {has ? "Tambah" : "Upload"}
        </button>
      </div>

      <DocumentUploadModal
        open={open}
        onClose={() => setOpen(false)}
        candidateId={candidateId}
        docType={item.type}
      />
    </div>
  );
}
