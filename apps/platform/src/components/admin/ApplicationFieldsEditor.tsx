"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { Button, Badge } from "@/components/pg/primitives";
import {
  createApplicationField,
  deleteApplicationField,
  reorderApplicationField,
  updateApplicationField,
  type ApplicationFieldInput,
} from "../../app/(admin)/admin/positions/actions";

/**
 * Edits position_application_fields for a slug. Replaces the legacy
 * FormFieldsEditor (which talked to position_form_fields).
 *
 * Sections matter for grouping in candidate UI:
 *   - syarat_utama → hard filters asked on apply form (LP)
 *   - kualifikasi  → soft / tier-scoring, asked post-apply in portal
 *   - screening    → deeper questions at later stage
 *
 * Inline add/edit/delete/reorder. No modal.
 */

export type Field = {
  id: string;
  field_key: string;
  field_label: string;
  field_help: string | null;
  field_type: string;
  options: { value: string; label: string }[] | null;
  importance: "required" | "optional";
  section: "syarat_utama" | "kualifikasi" | "screening";
  tier_weight: number;
  sort_order: number;
  collect_at_stage: string;
};

const SECTION_LABEL: Record<string, string> = {
  syarat_utama: "Syarat utama",
  kualifikasi: "Kualifikasi",
  screening: "Screening",
};

const SECTION_HINT: Record<string, string> = {
  syarat_utama:
    "Ditanya di apply form (LP). Disqualifier kalau jawaban salah. Pilih 'required' untuk hard-pass.",
  kualifikasi:
    "Ditanya post-apply di portal. Bobot kontribusi ke tier scoring (A/B/C/D).",
  screening: "Pertanyaan mendalam di tahap doc-check / interview.",
};

const TYPE_OPTIONS: ApplicationFieldInput["field_type"][] = [
  "radio",
  "select",
  "multiselect",
  "text",
  "textarea",
  "number",
  "file",
];

export default function ApplicationFieldsEditor({
  positionSlug,
  initial,
}: {
  positionSlug: string;
  initial: Field[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const grouped: Record<string, Field[]> = {
    syarat_utama: [],
    kualifikasi: [],
    screening: [],
  };
  for (const f of initial) grouped[f.section]?.push(f);

  return (
    <div className="grid gap-4">
      {(["syarat_utama", "kualifikasi", "screening"] as const).map((section) => {
        const fields = grouped[section];
        return (
          <div
            key={section}
            className="bg-pg-white rounded-2xl p-5"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-pg-ink-primary">
                  {SECTION_LABEL[section]}
                </div>
                <div className="text-[12px] text-pg-ink-tertiary mt-0.5 leading-snug">
                  {SECTION_HINT[section]}
                </div>
              </div>
              <span
                className="text-[10px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded shrink-0"
                style={{
                  background: "var(--pg-ink-50)",
                  color: "var(--pg-ink-tertiary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {fields.length}
              </span>
            </div>

            {fields.length > 0 && (
              <div className="mt-3 grid gap-2">
                {fields.map((f, idx) =>
                  editingId === f.id ? (
                    <FieldForm
                      key={f.id}
                      positionSlug={positionSlug}
                      mode="edit"
                      defaultSection={section}
                      initial={f}
                      onClose={() => setEditingId(null)}
                    />
                  ) : (
                    <FieldRow
                      key={f.id}
                      positionSlug={positionSlug}
                      field={f}
                      isFirst={idx === 0}
                      isLast={idx === fields.length - 1}
                      onEdit={() => setEditingId(f.id)}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        );
      })}

      <div>
        {showAdd ? (
          <FieldForm
            positionSlug={positionSlug}
            mode="add"
            defaultSection="kualifikasi"
            sortOrder={(initial[initial.length - 1]?.sort_order ?? 0) + 10}
            onClose={() => setShowAdd(false)}
          />
        ) : (
          <Button onClick={() => setShowAdd(true)} variant="ghost" small>
            <Icon name="plus" size={14} stroke={2.4} /> Tambah pertanyaan
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Field row (read-only display) ─────────────────────────────────────────

function FieldRow({
  positionSlug,
  field,
  isFirst,
  isLast,
  onEdit,
}: {
  positionSlug: string;
  field: Field;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    if (!confirm(`Hapus pertanyaan "${field.field_label}"?`)) return;
    setError(null);
    start(async () => {
      try {
        await deleteApplicationField(field.id, positionSlug);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal hapus");
      }
    });
  }

  function move(direction: "up" | "down") {
    setError(null);
    start(async () => {
      try {
        await reorderApplicationField(field.id, positionSlug, direction);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal pindah");
      }
    });
  }

  return (
    <div
      className="bg-pg-paper rounded-xl px-3.5 py-3"
      style={{ border: "1px solid var(--pg-border-soft)" }}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => move("up")}
            disabled={pending || isFirst}
            aria-label="Naik"
            className="w-5 h-5 grid place-items-center text-pg-ink-tertiary hover:text-pg-red-600 disabled:opacity-25"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => move("down")}
            disabled={pending || isLast}
            aria-label="Turun"
            className="w-5 h-5 grid place-items-center text-pg-ink-tertiary hover:text-pg-red-600 disabled:opacity-25"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-pg-ink-primary truncate">
            {field.field_label}
          </div>
          <div
            className="text-[11px] text-pg-ink-tertiary font-mono mt-0.5 truncate"
          >
            {field.field_key} · {field.field_type}
            {field.options && field.options.length > 0 ? ` · ${field.options.length} options` : ""}
          </div>
          {field.field_help && (
            <div className="text-[12px] text-pg-ink-tertiary mt-1 truncate">{field.field_help}</div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex gap-1.5">
            {field.importance === "required" && <Badge variant="err">Wajib</Badge>}
            {field.tier_weight > 0 && <Badge variant="info">Bobot {field.tier_weight}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              disabled={pending}
              className="text-[12px] font-bold text-pg-ink-secondary hover:text-pg-red-600"
            >
              <Icon name="edit" size={11} /> Edit
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="text-[12px] font-bold text-pg-red-600 hover:underline"
            >
              <Icon name="trash" size={11} /> Hapus
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-2 text-[12px] text-pg-red-600 flex items-center gap-1">
          <Icon name="warn" size={12} /> {error}
        </div>
      )}
    </div>
  );
}

// ─── Field add/edit form ───────────────────────────────────────────────────

type FieldFormProps =
  | {
      mode: "add";
      positionSlug: string;
      defaultSection: "syarat_utama" | "kualifikasi" | "screening";
      sortOrder: number;
      onClose: () => void;
      initial?: undefined;
    }
  | {
      mode: "edit";
      positionSlug: string;
      defaultSection: "syarat_utama" | "kualifikasi" | "screening";
      initial: Field;
      onClose: () => void;
      sortOrder?: undefined;
    };

function FieldForm(props: FieldFormProps) {
  const { mode, positionSlug, onClose } = props;
  const initial = mode === "edit" ? props.initial : null;

  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldType, setFieldType] = useState<ApplicationFieldInput["field_type"]>(
    (initial?.field_type as ApplicationFieldInput["field_type"]) ?? "radio",
  );
  const [section, setSection] = useState<ApplicationFieldInput["section"]>(
    initial?.section ?? props.defaultSection,
  );
  const [importance, setImportance] = useState<ApplicationFieldInput["importance"]>(
    initial?.importance ?? (props.defaultSection === "syarat_utama" ? "required" : "optional"),
  );

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const optionsRaw = String(fd.get("options") ?? "").trim();
    let options: { value: string; label: string }[] | null = null;
    if (
      optionsRaw &&
      (fieldType === "select" || fieldType === "radio" || fieldType === "multiselect")
    ) {
      options = optionsRaw
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [value, ...labelParts] = line.split("|");
          const label = labelParts.join("|").trim() || value!.trim();
          return { value: value!.trim(), label };
        });
    }

    const collectStage =
      section === "syarat_utama" ? "applied" : section === "screening" ? "document_check" : "screening";

    const payload: ApplicationFieldInput = {
      field_key: String(fd.get("field_key") ?? "").trim(),
      field_label: String(fd.get("field_label") ?? "").trim(),
      field_help: (fd.get("field_help") as string) || undefined,
      field_type: fieldType,
      options,
      importance,
      section,
      tier_weight: Number(fd.get("tier_weight") ?? 0),
      sort_order: mode === "add" ? props.sortOrder : initial!.sort_order,
      collect_at_stage: collectStage,
    };

    start(async () => {
      try {
        if (mode === "add") {
          await createApplicationField(positionSlug, payload);
        } else {
          const { field_key: _ignored, ...patch } = payload;
          void _ignored;
          await updateApplicationField(initial!.id, positionSlug, patch);
        }
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan");
      }
    });
  }

  const optionsDefault =
    initial?.options?.map((o) => `${o.value}|${o.label}`).join("\n") ?? "";

  return (
    <form
      onSubmit={submit}
      className="bg-pg-white rounded-2xl p-5"
      style={{ border: "1.5px solid var(--pg-red-200)" }}
    >
      <div className="text-[12px] font-bold tracking-[0.1em] uppercase text-pg-red-600 mb-3">
        {mode === "add" ? "Tambah pertanyaan" : "Edit pertanyaan"}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1">
            Field key (snake_case){mode === "edit" && " · read-only"}
          </div>
          <input
            name="field_key"
            type="text"
            required
            pattern="[a-z][a-z0-9_]*"
            placeholder="jlpt_level"
            defaultValue={initial?.field_key ?? ""}
            readOnly={mode === "edit"}
            className={`${INPUT_CLASS} font-mono ${mode === "edit" ? "bg-pg-ink-50 text-pg-ink-tertiary" : ""}`}
          />
        </label>
        <label>
          <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1">Tipe field</div>
          <select
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value as ApplicationFieldInput["field_type"])}
            className={INPUT_CLASS}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block mt-3">
        <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1">Label (yang user lihat)</div>
        <input
          name="field_label"
          type="text"
          required
          placeholder="Berapa level JLPT kamu?"
          defaultValue={initial?.field_label ?? ""}
          className={INPUT_CLASS}
        />
      </label>

      <label className="block mt-3">
        <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1">
          Help text <span className="font-normal">(opsional)</span>
        </div>
        <input
          name="field_help"
          type="text"
          placeholder="Jelaskan kenapa pertanyaan ini ditanya."
          defaultValue={initial?.field_help ?? ""}
          className={INPUT_CLASS}
        />
      </label>

      {(fieldType === "select" || fieldType === "radio" || fieldType === "multiselect") && (
        <label className="block mt-3">
          <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1">
            Options <span className="font-normal">(satu per baris, format `value|label`)</span>
          </div>
          <textarea
            name="options"
            rows={4}
            placeholder={`n2|JLPT N2\nn3|JLPT N3\nn4|JLPT N4\nnone|Belum punya`}
            defaultValue={optionsDefault}
            className={`${INPUT_CLASS} font-mono`}
          />
        </label>
      )}

      <div className="mt-4">
        <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1.5">Section</div>
        <div className="grid gap-1.5">
          {(["syarat_utama", "kualifikasi", "screening"] as const).map((s) => {
            const selected = section === s;
            return (
              <button
                type="button"
                key={s}
                onClick={() => setSection(s)}
                className={`text-left px-3 py-2 rounded-lg ${selected ? "border-pg-red-600 bg-pg-red-50" : "border-pg-ink-200 hover:border-pg-ink-300"}`}
                style={{ borderWidth: 1.5, borderStyle: "solid" }}
              >
                <div className="text-[13px] font-bold text-pg-ink-primary">{SECTION_LABEL[s]}</div>
                <div className="text-[11px] text-pg-ink-tertiary mt-0.5 leading-snug">
                  {SECTION_HINT[s]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1.5">Importance</div>
          <div className="inline-flex rounded-lg overflow-hidden" style={{ border: "1.5px solid var(--pg-ink-200)" }}>
            {(["required", "optional"] as const).map((val) => {
              const selected = importance === val;
              return (
                <button
                  type="button"
                  key={val}
                  onClick={() => setImportance(val)}
                  className="px-3 py-1.5 text-[12px] font-bold"
                  style={{
                    background: selected ? "var(--pg-red-600)" : "var(--pg-white)",
                    color: selected ? "white" : "var(--pg-ink-secondary)",
                  }}
                >
                  {val === "required" ? "Wajib" : "Bonus"}
                </button>
              );
            })}
          </div>
        </div>
        <label>
          <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1.5">
            Tier weight <span className="font-normal">(0–10)</span>
          </div>
          <input
            name="tier_weight"
            type="number"
            min={0}
            max={10}
            defaultValue={initial?.tier_weight ?? 0}
            className={INPUT_CLASS}
          />
        </label>
      </div>

      {error && (
        <div className="mt-3 text-[12px] text-pg-red-600 flex items-center gap-1">
          <Icon name="warn" size={12} /> {error}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button type="submit" small disabled={pending}>
          {pending ? "Menyimpan…" : mode === "add" ? "Tambah" : "Update"}
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center min-h-[40px] px-4 text-[13px] font-semibold text-pg-ink-secondary hover:bg-pg-ink-50 rounded-lg"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

const INPUT_CLASS =
  "w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3 py-2 text-sm text-pg-ink-primary placeholder:text-pg-ink-quaternary focus:border-pg-red-600 outline-none";
