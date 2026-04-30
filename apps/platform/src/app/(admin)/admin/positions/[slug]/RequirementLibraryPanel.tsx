"use client";

import { useMemo, useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import {
  REQUIREMENT_LIBRARY,
  type RequirementCategory,
  type RequirementTemplate,
} from "@perantauglobal/db/schemas/requirements";
import {
  addRequirementToPosition,
  removeRequirementFromPosition,
} from "../actions";

const CAT_LABEL: Record<RequirementCategory, string> = {
  personal: "Personal",
  certification: "Sertifikasi",
  language: "Bahasa",
  experience: "Pengalaman",
};

export default function RequirementLibraryPanel({
  slug,
  active,
}: {
  slug: string;
  /** Keys currently set on the position (so we can mark them as added). */
  active: Set<string>;
}) {
  const [pending, start] = useTransition();
  const [filter, setFilter] = useState<RequirementCategory | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const items = useMemo(
    () =>
      filter === "all"
        ? REQUIREMENT_LIBRARY
        : REQUIREMENT_LIBRARY.filter((r) => r.category === filter),
    [filter],
  );

  function add(t: RequirementTemplate) {
    setError(null);
    setPendingKey(t.key);
    const requirement: Record<string, unknown> = {
      label: t.label,
      importance: t.importance,
      category: t.category,
      evidence_mode: t.evidence_mode,
      collect_at_stage: t.collect_at_stage ?? (t.importance === "hard" ? "applied" : "screening"),
    };
    if (t.allowed_values) requirement.allowed_values = t.allowed_values;
    if (t.value_labels) requirement.value_labels = t.value_labels;
    if (t.description) requirement.description = t.description;
    if (t.document_type) requirement.document_type = t.document_type;
    if (t.document_filter) requirement.document_filter = t.document_filter;

    start(async () => {
      try {
        await addRequirementToPosition(slug, t.key, requirement);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal tambah");
      } finally {
        setPendingKey(null);
      }
    });
  }

  function remove(key: string) {
    setError(null);
    setPendingKey(key);
    start(async () => {
      try {
        await removeRequirementFromPosition(slug, key);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal hapus");
      } finally {
        setPendingKey(null);
      }
    });
  }

  return (
    <div className="bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-pg-ink-100">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500">
          Library · {REQUIREMENT_LIBRARY.length} template
        </div>
        <div className="mt-2.5 flex gap-1.5 flex-wrap">
          {(["all", "personal", "certification", "language", "experience"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${
                filter === c
                  ? "bg-pg-red-600 text-white"
                  : "bg-pg-ink-50 text-pg-ink-700 hover:bg-pg-ink-100"
              }`}
            >
              {c === "all" ? "Semua" : CAT_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[480px] overflow-y-auto divide-y divide-pg-ink-100">
        {items.map((t) => {
          const isActive = active.has(t.key);
          const rowBusy = pending && pendingKey === t.key;
          return (
            <div key={t.key} className="px-5 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-[14px] font-bold tracking-tight">{t.label}</div>
                  <span
                    className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded"
                    style={{
                      color:
                        t.importance === "hard" ? "var(--pg-red-600)" : "var(--pg-ink-500)",
                      background:
                        t.importance === "hard" ? "var(--pg-red-50)" : "var(--pg-ink-50)",
                    }}
                  >
                    {t.importance}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-pg-ink-400">
                    {t.evidence_mode}
                  </span>
                </div>
                <div className="text-[12px] text-pg-ink-500 mt-0.5 font-mono truncate">
                  {t.key}
                </div>
              </div>
              {isActive ? (
                <button
                  type="button"
                  disabled={rowBusy}
                  onClick={() => remove(t.key)}
                  className="inline-flex items-center gap-1 min-h-[32px] px-2.5 text-[12px] font-bold rounded-lg border border-pg-ink-200 text-pg-ink-700 hover:bg-pg-ink-50 disabled:opacity-50"
                >
                  <Icon name="check" size={12} stroke={2.4} /> Sudah ada
                </button>
              ) : (
                <button
                  type="button"
                  disabled={rowBusy}
                  onClick={() => add(t)}
                  className="inline-flex items-center gap-1 min-h-[32px] px-2.5 text-[12px] font-bold rounded-lg bg-pg-red-600 text-white hover:bg-pg-red-700 disabled:opacity-50"
                >
                  <Icon name="plus" size={12} stroke={2.4} /> Tambah
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div
          className="px-5 py-2 text-[12px] flex items-start gap-1.5 border-t"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
        >
          <Icon name="warn" size={14} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
