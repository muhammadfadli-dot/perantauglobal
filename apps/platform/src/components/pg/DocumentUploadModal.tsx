"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  getDocTypeSchema,
  type DocTypeSchema,
  type MetadataField,
} from "@perantauglobal/db/schemas/documents";

const ACCEPT = "image/jpeg,image/png,image/heic,image/heif,image/webp,application/pdf";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export type DocumentUploadModalProps = {
  open: boolean;
  onClose: () => void;
  candidateId: string;
  docType: string;
  /** Pre-fill metadata (e.g. when triggered from a requirement that targets
   *  driving_license with class=b1). Greys out the field as auto-derived. */
  prefillMetadata?: Record<string, string>;
  /** When the upload satisfies a specific application's file-type requirement,
   *  pass its id so the row is linked. The completeness engine + readiness view
   *  match documents by application_id, so omitting it leaves file requirements
   *  permanently unsatisfiable. */
  applicationId?: string;
  /** Called after successful insert so caller can refresh data. */
  onUploaded?: () => void;
};

/**
 * Mobile-first bottom sheet (web) for uploading a candidate document with
 * type-specific metadata fields. Reads schema from DOC_TYPE_METADATA_SCHEMAS
 * and renders the right form fields, then writes:
 *   - file → Supabase Storage `candidate-documents` bucket
 *   - row → candidate_documents (metadata JSONB, expires_at, display_name)
 */
export default function DocumentUploadModal({
  open,
  onClose,
  candidateId,
  docType,
  prefillMetadata = {},
  applicationId,
  onUploaded,
}: DocumentUploadModalProps) {
  if (!open) return null;
  // Mount-on-open via the parent ensures fresh state each time.
  return (
    <SheetBody
      onClose={onClose}
      candidateId={candidateId}
      docType={docType}
      prefillMetadata={prefillMetadata}
      applicationId={applicationId}
      onUploaded={onUploaded}
    />
  );
}

function SheetBody({
  onClose,
  candidateId,
  docType,
  prefillMetadata,
  applicationId,
  onUploaded,
}: Omit<DocumentUploadModalProps, "open"> & { prefillMetadata: Record<string, string> }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const schema: DocTypeSchema | null = getDocTypeSchema(docType);

  const [meta, setMeta] = useState<Record<string, string>>(() => ({ ...prefillMetadata }));
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!schema) {
    return (
      <Sheet onClose={onClose}>
        <div className="p-5 text-sm text-pg-err">
          Doc type tidak dikenali: <code>{docType}</code>
        </div>
      </Sheet>
    );
  }

  function pickFile() {
    inputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setError("File terlalu besar. Maksimal 5MB.");
      e.target.value = "";
      return;
    }
    setFile(f);
    setError(null);
  }

  function setField(key: string, value: string) {
    setMeta((m) => ({ ...m, [key]: value }));
  }

  function isFieldValid(field: MetadataField): boolean {
    if (!field.required) return true;
    const v = meta[field.key];
    return typeof v === "string" && v.length > 0;
  }

  function canSubmit(): boolean {
    if (!file) return false;
    return schema!.fields.every(isFieldValid);
  }

  async function submit() {
    if (!file || !schema || busy) return;
    setBusy(true);
    setError(null);
    try {
      const sb = supabaseBrowser();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      // eslint-disable-next-line react-hooks/purity -- inside async event handler, not render
      const stamp = Date.now();
      const filename = `${docType}-${stamp}.${ext}`;
      const path = `${candidateId}/${docType}/${filename}`;

      const { error: uploadErr } = await sb.storage
        .from("candidate-documents")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (uploadErr) throw uploadErr;

      // Compose payload. expires_at is promoted to its own column when a field
      // is flagged is_expires_at; everything else lands in metadata JSONB.
      const expiresAtField = schema.fields.find((f) => f.is_expires_at);
      const expiresAt =
        expiresAtField && meta[expiresAtField.key]
          ? meta[expiresAtField.key]
          : null;

      const cleanMeta: Record<string, string> = {};
      for (const f of schema.fields) {
        if (f.is_expires_at) continue;
        const v = meta[f.key];
        if (typeof v === "string" && v.length > 0) cleanMeta[f.key] = v;
      }

      const { data: inserted, error: insertErr } = await sb
        .from("candidate_documents")
        .insert({
          candidate_id: candidateId,
          doc_type: docType,
          file_path: path,
          file_size: file.size,
          mime_type: file.type,
          metadata: cleanMeta,
          expires_at: expiresAt,
          display_name: schema.label,
          // Link to the application when this upload satisfies a file requirement,
          // so the completeness engine / readiness view can match it.
          ...(applicationId ? { application_id: applicationId } : {}),
        } as never)
        .select("id")
        .single();
      if (insertErr) throw insertErr;

      // Kick off AI grading for CVs — extraction + per-position fit. Fire and
      // forget so the upload stays instant; results land asynchronously.
      if (docType === "cv" && (inserted as { id?: string } | null)?.id) {
        void sb.functions
          .invoke("grade-cv", { body: { document_id: (inserted as { id: string }).id } })
          .catch(() => {});
      }

      onUploaded?.();
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet onClose={onClose}>
      <div className="px-5 pt-4 pb-2">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
          Upload dokumen
        </div>
        <div className="mt-1 text-[20px] font-extrabold tracking-tight">
          {schema.label}
        </div>
        <p className="mt-1 text-sm text-pg-ink-500 leading-relaxed">
          {schema.description}
        </p>
      </div>

      <div className="px-5 pt-4 pb-2 grid gap-3.5">
        {/* File picker */}
        <div>
          <Label>File dokumen</Label>
          <button
            type="button"
            onClick={pickFile}
            className="w-full flex items-center gap-3 px-3.5 py-3.5 rounded-xl border-[1.5px] border-dashed border-pg-ink-200 bg-pg-ink-50 hover:bg-pg-ink-100 text-left"
          >
            <div className="w-9 h-9 rounded-lg grid place-items-center bg-pg-white border border-pg-ink-200 shrink-0">
              <Icon name="upload" size={16} stroke={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">
                {file ? file.name : "Pilih file dari perangkat"}
              </div>
              <div className="text-[12px] text-pg-ink-500 mt-0.5">
                JPG, PNG, HEIC, atau PDF · maks 5MB
              </div>
            </div>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        {/* Metadata fields */}
        {schema.fields.map((field) => (
          <FieldInput
            key={field.key}
            field={field}
            value={meta[field.key] ?? ""}
            onChange={(v) => setField(field.key, v)}
            locked={Boolean(prefillMetadata[field.key])}
          />
        ))}
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="px-5 pt-3 text-[13px] text-pg-err flex gap-1.5 items-start"
        >
          <Icon name="warn" size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="px-5 pt-5 pb-6 grid gap-2">
        <button
          type="button"
          disabled={!canSubmit() || busy}
          onClick={submit}
          className="w-full min-h-[52px] rounded-xl bg-pg-red-600 text-white font-bold text-[15px] hover:bg-pg-red-700 disabled:opacity-50"
        >
          {busy ? "Mengupload…" : "Upload dokumen"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[44px] rounded-xl text-pg-ink-700 font-semibold text-sm"
        >
          Batal
        </button>
      </div>
    </Sheet>
  );
}

/* ── primitives ──────────────────────────────────────────────────────── */

function Sheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup"
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative w-full sm:max-w-md bg-pg-white rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-pg-white pt-3 pb-1 grid place-items-center">
          <div className="w-10 h-1.5 rounded-full bg-pg-ink-200" />
        </div>
        {children}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] font-bold tracking-wide uppercase text-pg-ink-500 mb-1.5">
      {children}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  locked,
}: {
  field: MetadataField;
  value: string;
  onChange: (v: string) => void;
  locked?: boolean;
}) {
  const baseInputCls =
    "w-full min-h-[44px] px-3.5 rounded-xl border-[1.5px] border-pg-ink-200 bg-pg-white text-sm font-medium focus:outline-none focus:border-pg-red-600 disabled:bg-pg-ink-50 disabled:text-pg-ink-500";

  return (
    <div>
      <Label>
        {field.label}
        {field.required && <span className="text-pg-red-600 ml-0.5">*</span>}
        {locked && (
          <span className="ml-2 text-[10px] tracking-normal text-pg-ink-400 normal-case font-semibold">
            (otomatis)
          </span>
        )}
      </Label>
      {field.type === "select" && field.options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={locked}
          className={baseInputCls}
        >
          <option value="">— pilih —</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {field.option_labels?.[opt] ?? opt}
            </option>
          ))}
        </select>
      ) : field.type === "date" ? (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={locked}
          className={baseInputCls}
        />
      ) : field.type === "number" ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={locked}
          className={baseInputCls}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={locked}
          className={baseInputCls}
        />
      )}
      {field.description && (
        <div className="text-[12px] text-pg-ink-500 mt-1.5 leading-relaxed">
          {field.description}
        </div>
      )}
    </div>
  );
}
