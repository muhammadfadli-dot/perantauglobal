"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/pg/Icon";
import DocumentUploadModal from "@/components/pg/DocumentUploadModal";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { RequirementWithStatus } from "@/lib/readiness";

/**
 * Inline form to satisfy a single position requirement.
 *
 * Renders the right input(s) per evidence_mode:
 *   - self_declared → radio/select against allowed_values, saves to
 *                     candidates.profile_data.credentials[key]
 *   - document      → "Upload dokumen" button → DocumentUploadModal,
 *                     pre-fills the document_filter as auto-derived metadata
 *   - either        → both options stacked
 */
export default function RequirementInlineForm({
  req,
  candidateId,
  initialValue,
}: {
  req: RequirementWithStatus;
  candidateId: string;
  initialValue: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState<string>(initialValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docOpen, setDocOpen] = useState(false);

  async function saveSelfDeclared(next: string) {
    setValue(next);
    setBusy(true);
    setError(null);
    try {
      const sb = supabaseBrowser();
      const { data: cand } = await sb
        .from("candidates")
        .select("profile_data")
        .eq("id", candidateId)
        .single();
      const current = ((cand?.profile_data as Record<string, unknown>) ?? {}) as Record<
        string,
        unknown
      >;
      const credentials = (current.credentials ?? {}) as Record<string, unknown>;
      const merged = {
        ...current,
        schema_version: current.schema_version ?? 1,
        credentials: { ...credentials, [req.key]: next },
      };
      const { error: upErr } = await sb
        .from("candidates")
        .update({ profile_data: merged } as never)
        .eq("id", candidateId);
      if (upErr) throw upErr;
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setBusy(false);
    }
  }

  const showSelf =
    req.evidence_mode === "self_declared" || req.evidence_mode === "either";
  const showDoc =
    (req.evidence_mode === "document" || req.evidence_mode === "either") &&
    Boolean(req.document_type);

  const importanceColor = req.importance === "hard" ? "var(--pg-red-600)" : "var(--pg-ink-400)";

  return (
    <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-[15px] font-extrabold tracking-tight">
              {req.label}
            </div>
            <span
              className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded"
              style={{
                color: importanceColor,
                background:
                  req.importance === "hard"
                    ? "var(--pg-red-50)"
                    : "var(--pg-ink-50)",
              }}
            >
              {req.importance === "hard" ? "Wajib" : "Bonus"}
            </span>
          </div>
          {req.description && (
            <p className="text-[12px] text-pg-ink-500 mt-1 leading-relaxed">
              {req.description}
            </p>
          )}
        </div>
      </div>

      {/* Self-declared input */}
      {showSelf && (
        <div className="mt-3.5">
          {req.allowed_values && req.allowed_values.length > 0 ? (
            <div className="grid gap-2">
              {req.allowed_values.map((opt) => {
                const selected = value === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={busy}
                    onClick={() => saveSelfDeclared(opt)}
                    className={`text-left flex items-center gap-3 px-3.5 py-3 rounded-xl border-[1.5px] ${
                      selected
                        ? "border-pg-red-600 bg-pg-red-50"
                        : "border-pg-ink-200 bg-pg-white hover:border-pg-ink-400"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-[1.5px] grid place-items-center shrink-0 ${
                        selected
                          ? "border-pg-red-600 bg-pg-red-600 text-white"
                          : "border-pg-ink-300"
                      }`}
                    >
                      {selected && <Icon name="check" size={12} stroke={3} />}
                    </div>
                    <div className="text-sm font-semibold">
                      {req.value_labels?.[opt] ?? opt}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => value !== initialValue && saveSelfDeclared(value)}
              disabled={busy}
              placeholder="Isi jawaban kamu"
              className="w-full min-h-[44px] px-3.5 rounded-xl border-[1.5px] border-pg-ink-200 bg-pg-white text-sm font-medium focus:outline-none focus:border-pg-red-600"
            />
          )}
        </div>
      )}

      {/* Document upload trigger */}
      {showDoc && (
        <div className={showSelf ? "mt-3 pt-3 border-t border-pg-ink-100" : "mt-3"}>
          {showSelf && (
            <div className="text-[11px] tracking-wide uppercase font-bold text-pg-ink-400 mb-2">
              atau upload sertifikat
            </div>
          )}
          <button
            type="button"
            onClick={() => setDocOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl bg-pg-ink-900 text-white font-bold text-sm hover:bg-pg-ink-700"
          >
            <Icon name="upload" size={16} stroke={2.2} />
            Upload dokumen
          </button>
          <DocumentUploadModal
            open={docOpen}
            onClose={() => setDocOpen(false)}
            candidateId={candidateId}
            docType={req.document_type!}
            prefillMetadata={
              (req.document_filter as Record<string, string> | undefined) ?? {}
            }
          />
        </div>
      )}

      {error && (
        <div className="mt-2 text-[12px] text-pg-err flex items-start gap-1.5">
          <Icon name="warn" size={12} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
