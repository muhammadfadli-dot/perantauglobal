"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/pg/Icon";
import { Badge } from "@/components/pg/primitives";
import DocumentUploadModal from "@/components/pg/DocumentUploadModal";

type DocType = "ktp" | "passport" | "formal_photo" | "photo" | "cv";

type DocStatus = "missing" | "pending" | "verified" | "rejected";

export type DocItem = {
  type: DocType;
  status: DocStatus;
  file_path?: string;
  rejected_reason?: string | null;
};

const DOC_LABEL: Record<DocType, string> = {
  ktp: "KTP",
  passport: "Paspor",
  formal_photo: "Foto formal",
  photo: "Foto formal",
  cv: "CV / Curriculum Vitae",
};

const DOC_ICON: Record<DocType, IconName> = {
  ktp: "id_card",
  passport: "passport",
  formal_photo: "camera",
  photo: "camera",
  cv: "doc",
};

export default function DocUploader({
  candidateId,
  initial,
}: {
  candidateId: string;
  initial: DocItem[];
}) {
  return (
    <div className="grid gap-2">
      {initial.map((d) => (
        <DocRow key={d.type} candidateId={candidateId} doc={d} />
      ))}
    </div>
  );
}

function DocRow({ candidateId, doc }: { candidateId: string; doc: DocItem }) {
  const [open, setOpen] = useState(false);

  const tone =
    doc.status === "verified" ? { bg: "var(--pg-ok-bg)", fg: "var(--pg-ok)" } :
    doc.status === "pending"  ? { bg: "var(--pg-warn-bg)", fg: "var(--pg-warn)" } :
    doc.status === "rejected" ? { bg: "var(--pg-err-bg)", fg: "var(--pg-err)" } :
    { bg: "var(--pg-ink-50)", fg: "var(--pg-ink-500)" };

  // Map legacy "photo" doc_type to new "formal_photo" schema.
  const uploadDocType = doc.type === "photo" ? "formal_photo" : doc.type;

  return (
    <div className="bg-pg-white border border-pg-ink-100 rounded-xl">
      <div className="flex items-center gap-3 px-3.5 py-3">
        <div
          className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
          style={{ background: tone.bg, color: tone.fg }}
        >
          <Icon name={DOC_ICON[doc.type]} size={18} stroke={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold">{DOC_LABEL[doc.type]}</div>
          {doc.status === "missing" && (
            <div className="text-[12px] text-pg-ink-500 mt-0.5">Belum diupload</div>
          )}
          {doc.status === "pending" && (
            <div className="text-[12px] text-pg-warn mt-0.5">Menunggu verifikasi admin</div>
          )}
          {doc.status === "verified" && (
            <div className="text-[12px] text-pg-ok mt-0.5">Sudah terverifikasi</div>
          )}
          {doc.status === "rejected" && (
            <div className="text-[12px] text-pg-err mt-0.5">Ditolak — silakan upload ulang</div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {doc.status === "verified" && <Badge variant="ok" icon="check">Verified</Badge>}
          {doc.status === "pending" && <Badge variant="warn">Review</Badge>}
          {doc.status === "rejected" && <Badge variant="err">Tolak</Badge>}
          {(doc.status === "missing" || doc.status === "rejected") && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1 min-h-[36px] px-3 text-[13px] font-semibold rounded-lg bg-pg-red-600 text-white hover:bg-pg-red-700"
            >
              <Icon name="upload" size={14} />
              Upload
            </button>
          )}
        </div>
      </div>
      {doc.status === "rejected" && doc.rejected_reason && (
        <div
          className="px-3.5 pb-3 text-[12px]"
          style={{ color: "var(--pg-err)" }}
        >
          Alasan: {doc.rejected_reason}
        </div>
      )}

      <DocumentUploadModal
        open={open}
        onClose={() => setOpen(false)}
        candidateId={candidateId}
        docType={uploadDocType}
      />
    </div>
  );
}
