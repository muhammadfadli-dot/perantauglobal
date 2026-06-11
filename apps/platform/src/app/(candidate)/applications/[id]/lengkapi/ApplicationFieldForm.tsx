"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/pg/Icon";
import DocumentUploadModal from "@/components/pg/DocumentUploadModal";
import { setApplicationAnswer } from "../actions";
import type { ApplicationField } from "@/lib/applicationCompleteness";

/**
 * Inline form to fill a single position_application_field on an
 * application. Writes to applications.answers JSONB (per Fase 5 model:
 * each application stands on its own, no profile_data.credentials merge).
 *
 * Field types:
 *   - radio / select / multiselect → button grid against options
 *   - text / textarea / number     → input that saves on blur
 *   - file                         → DocumentUploadModal scoped to this app
 */
export default function ApplicationFieldForm({
  field,
  applicationId,
  candidateId,
}: {
  field: ApplicationField;
  applicationId: string;
  candidateId: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState<string>(field.value ?? "");
  const [multiValue, setMultiValue] = useState<string[]>(() => {
    if (field.field_type !== "multiselect" || !field.value) return [];
    try {
      const parsed = JSON.parse(field.value);
      return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    } catch {
      return [];
    }
  });
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [docOpen, setDocOpen] = useState(false);

  function saveSingle(next: string) {
    setValue(next);
    setError(null);
    start(async () => {
      const result = await setApplicationAnswer(applicationId, field.field_key, next || null);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function toggleMulti(opt: string) {
    setError(null);
    const next = multiValue.includes(opt)
      ? multiValue.filter((v) => v !== opt)
      : [...multiValue, opt];
    setMultiValue(next);
    start(async () => {
      const result = await setApplicationAnswer(
        applicationId,
        field.field_key,
        next.length > 0 ? next : null,
      );
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  const importanceColor =
    field.importance === "required" ? "var(--pg-red-600)" : "var(--pg-ink-400)";

  return (
    <div
      className="bg-pg-white rounded-2xl p-4"
      style={{ border: "1px solid var(--pg-border)" }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-[15px] font-extrabold tracking-tight">
              {field.field_label}
            </div>
            <span
              className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded"
              style={{
                color: importanceColor,
                background:
                  field.importance === "required"
                    ? "var(--pg-red-50)"
                    : "var(--pg-ink-50)",
              }}
            >
              {field.importance === "required" ? "Wajib" : "Bonus"}
            </span>
            {field.passed && (
              <span
                className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"
                style={{ color: "var(--pg-ok-soft-fg)", background: "var(--pg-ok-soft-bg)" }}
              >
                <Icon name="check" size={10} stroke={2.6} /> Terisi
              </span>
            )}
          </div>
          {field.field_help && (
            <p className="text-[12px] text-pg-ink-tertiary mt-1 leading-relaxed">
              {field.field_help}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3.5">
        {(field.field_type === "radio" || field.field_type === "select") && field.options && (
          <div className="grid gap-2">
            {field.options.map((opt) => {
              const selected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={pending}
                  onClick={() => saveSingle(opt.value)}
                  className={`text-left flex items-center gap-3 px-3.5 py-3 rounded-xl border-[1.5px] disabled:opacity-50 ${
                    selected
                      ? "border-pg-red-600 bg-pg-red-50"
                      : "border-pg-ink-200 bg-pg-white hover:border-pg-ink-400"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-[1.5px] grid place-items-center shrink-0 ${
                      selected ? "border-pg-red-600 bg-pg-red-600 text-white" : "border-pg-ink-300"
                    }`}
                  >
                    {selected && <Icon name="check" size={12} stroke={3} />}
                  </div>
                  <div className="text-sm font-semibold">{opt.label}</div>
                </button>
              );
            })}
          </div>
        )}

        {field.field_type === "multiselect" && field.options && (
          <div className="grid gap-2">
            {field.options.map((opt) => {
              const selected = multiValue.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={pending}
                  onClick={() => toggleMulti(opt.value)}
                  className={`text-left flex items-center gap-3 px-3.5 py-3 rounded-xl border-[1.5px] disabled:opacity-50 ${
                    selected
                      ? "border-pg-red-600 bg-pg-red-50"
                      : "border-pg-ink-200 bg-pg-white hover:border-pg-ink-400"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded grid place-items-center shrink-0 border-[1.5px] ${
                      selected ? "border-pg-red-600 bg-pg-red-600 text-white" : "border-pg-ink-300"
                    }`}
                  >
                    {selected && <Icon name="check" size={11} stroke={3} />}
                  </div>
                  <div className="text-sm font-semibold">{opt.label}</div>
                </button>
              );
            })}
          </div>
        )}

        {(field.field_type === "text" || field.field_type === "number") && (
          <input
            type={field.field_type === "number" ? "number" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => value !== (field.value ?? "") && saveSingle(value)}
            disabled={pending}
            placeholder="Isi jawaban kamu"
            className="w-full min-h-[44px] px-3.5 rounded-xl border-[1.5px] border-pg-ink-200 bg-pg-white text-sm font-medium focus:outline-none focus:border-pg-red-600"
          />
        )}

        {field.field_type === "textarea" && (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => value !== (field.value ?? "") && saveSingle(value)}
            disabled={pending}
            rows={4}
            placeholder="Tulis jawaban panjang kamu"
            className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-pg-ink-200 bg-pg-white text-sm font-medium focus:outline-none focus:border-pg-red-600"
          />
        )}

        {field.field_type === "file" && (
          <>
            <button
              type="button"
              onClick={() => setDocOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl bg-pg-ink-900 text-white font-bold text-sm hover:bg-pg-ink-700"
            >
              <Icon name="upload" size={16} stroke={2.2} />
              {field.doc_uploaded ? "Ganti dokumen" : "Upload dokumen"}
            </button>
            {field.document_type && (
              <DocumentUploadModal
                open={docOpen}
                onClose={() => {
                  setDocOpen(false);
                  router.refresh();
                }}
                candidateId={candidateId}
                docType={field.document_type}
                prefillMetadata={{}}
                applicationId={applicationId}
              />
            )}
          </>
        )}
      </div>

      {error && (
        <div className="mt-2 text-[12px] text-pg-red-600 flex items-start gap-1.5">
          <Icon name="warn" size={12} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
