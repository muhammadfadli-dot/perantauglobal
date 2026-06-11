"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import {
  createApplicationField,
  deleteApplicationField,
  reorderApplicationField,
  updateApplicationField,
  type ApplicationFieldInput,
} from "../../app/(admin)/admin/positions/actions";

/**
 * Edits position_application_fields for a slug — admin-facing UX is
 * designed for non-technical authors. Six friendly field types map to
 * the storage enum; field_key is auto-derived from the label; options
 * are edited as a list, not pipe-separated text.
 *
 * Sections still map 1:1 to the storage enum (syarat_utama / kualifikasi
 * / screening) — the labels and hints are plain Indonesian.
 */

export type Field = {
  id: string;
  field_key: string;
  field_label: string;
  field_help: string | null;
  field_type: string;
  /**
   * `qualifying` (added 2026-05-28) marks options that count as "passing"
   * for the qualification gate (used by application_readiness_view). The
   * editor exposes a per-option "Lolos" toggle and preserves the flag when
   * round-tripping.
   */
  options: { value: string; label: string; qualifying?: boolean }[] | null;
  importance: "required" | "optional";
  section: "syarat_utama" | "kualifikasi" | "screening";
  tier_weight: number;
  sort_order: number;
  collect_at_stage: string;
};

// ─── Section copy ─────────────────────────────────────────────────────────

const SECTION_META: Record<
  Field["section"],
  { label: string; hint: string; tone: string }
> = {
  syarat_utama: {
    label: "Syarat utama",
    hint: "Ditanya saat kandidat klik Lamar di lowongan. Pakai untuk syarat yang menentukan kelayakan — kalau jawabannya nggak cocok, kandidat ga lanjut.",
    tone: "var(--pg-red-600)",
  },
  kualifikasi: {
    label: "Kualifikasi tambahan",
    hint: "Ditanya setelah daftar, di dalam portal kandidat. Buat ngumpulin info bonus yang ngebantu kamu pertimbangkan.",
    tone: "var(--pg-info)",
  },
  screening: {
    label: "Screening lanjutan",
    hint: "Ditanya pas tahap lanjut — biasanya menjelang interview atau cek dokumen.",
    tone: "var(--pg-ink-secondary)",
  },
};

// ─── Field type catalog ───────────────────────────────────────────────────

type FieldTypeKey =
  | "radio"
  | "multiselect"
  | "text"
  | "textarea"
  | "number"
  | "file";

type FieldTypeMeta = {
  key: FieldTypeKey;
  label: string;
  description: string;
  example: string;
  emoji: string;
  hasOptions: boolean;
};

const FIELD_TYPES: FieldTypeMeta[] = [
  {
    key: "radio",
    label: "Pilihan tunggal",
    description: "Kandidat pilih 1 dari beberapa opsi.",
    example: "Status STR? · Aktif / Sedang proses / Belum ada",
    emoji: "◉",
    hasOptions: true,
  },
  {
    key: "multiselect",
    label: "Pilihan ganda",
    description: "Kandidat bisa pilih lebih dari 1 opsi.",
    example: "Bahasa yang dikuasai · Inggris, Arab, Mandarin",
    emoji: "☷",
    hasOptions: true,
  },
  {
    key: "text",
    label: "Jawaban singkat",
    description: "Satu baris — nama, nomor, alamat, dll.",
    example: "Nomor STR keperawatan kamu?",
    emoji: "—",
    hasOptions: false,
  },
  {
    key: "textarea",
    label: "Jawaban panjang",
    description: "Beberapa baris — cerita atau alasan.",
    example: "Kenapa kamu pilih posisi ini?",
    emoji: "≡",
    hasOptions: false,
  },
  {
    key: "number",
    label: "Angka",
    description: "Jumlah, umur, tahun pengalaman.",
    example: "Berapa tahun pengalaman jadi perawat?",
    emoji: "#",
    hasOptions: false,
  },
  {
    key: "file",
    label: "Upload dokumen",
    description: "Kandidat upload file (PDF / foto).",
    example: "Upload scan STR keperawatan kamu",
    emoji: "⇪",
    hasOptions: false,
  },
];

const TYPE_BY_KEY = new Map(FIELD_TYPES.map((t) => [t.key, t]));

// Storage may have legacy "select" — show it as "radio" in admin UI.
function normalizeType(stored: string): FieldTypeKey {
  if (stored === "select") return "radio";
  if (TYPE_BY_KEY.has(stored as FieldTypeKey)) return stored as FieldTypeKey;
  return "text";
}

// ─── Slugify helper for auto-derive field_key + option value ──────────────

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

// ─── Main editor ──────────────────────────────────────────────────────────

export default function ApplicationFieldsEditor({
  positionSlug,
  initial,
}: {
  positionSlug: string;
  initial: Field[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addInSection, setAddInSection] = useState<Field["section"]>("kualifikasi");

  const grouped: Record<Field["section"], Field[]> = {
    syarat_utama: [],
    kualifikasi: [],
    screening: [],
  };
  for (const f of initial) grouped[f.section]?.push(f);

  return (
    <div className="grid gap-4">
      <div className="px-4 py-3 rounded-xl flex items-start gap-2.5 text-[12px] leading-relaxed"
        style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}>
        <Icon name="info" size={14} className="shrink-0 mt-0.5" />
        <div>
          <b>Cara baca:</b> 3 section di bawah ini menentukan <i>kapan</i> pertanyaan ditanya
          ke kandidat. Semua pertanyaan masuk ke aplikasi yang sama — section cuma ngatur
          timing-nya.
        </div>
      </div>

      {(["syarat_utama", "kualifikasi", "screening"] as const).map((section) => {
        const meta = SECTION_META[section];
        const fields = grouped[section];
        return (
          <div
            key={section}
            className="bg-pg-white rounded-2xl p-5"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-md"
                    style={{
                      background: "var(--pg-paper)",
                      color: meta.tone,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {fields.length} pertanyaan
                  </span>
                </div>
                <div className="text-[16px] font-extrabold text-pg-ink-primary mt-1.5">
                  {meta.label}
                </div>
                <div className="text-[12px] text-pg-ink-tertiary mt-1 leading-relaxed max-w-2xl">
                  {meta.hint}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAddInSection(section);
                  setShowAdd(true);
                }}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold"
                style={{
                  border: "1px solid var(--pg-border)",
                  background: "var(--pg-white)",
                  color: meta.tone,
                }}
              >
                <Icon name="plus" size={12} stroke={2.4} />
                Tambah di sini
              </button>
            </div>

            {fields.length > 0 && (
              <div className="mt-4 grid gap-2">
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

            {fields.length === 0 && (
              <div className="mt-4 px-4 py-6 rounded-xl text-center text-[12px] text-pg-ink-tertiary"
                style={{ background: "var(--pg-paper)", border: "1px dashed var(--pg-border)" }}>
                Belum ada pertanyaan di section ini.
              </div>
            )}
          </div>
        );
      })}

      {showAdd && (
        <FieldForm
          positionSlug={positionSlug}
          mode="add"
          defaultSection={addInSection}
          sortOrder={(initial[initial.length - 1]?.sort_order ?? 0) + 10}
          onClose={() => setShowAdd(false)}
        />
      )}
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

  const typeMeta = TYPE_BY_KEY.get(normalizeType(field.field_type));

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
        <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
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
          <div className="flex items-baseline gap-2 flex-wrap">
            <div className="text-[14px] font-bold text-pg-ink-primary">
              {field.field_label}
            </div>
            {field.importance === "required" && (
              <span
                className="text-[9px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--pg-red-soft-bg)",
                  color: "var(--pg-red-600)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Wajib
              </span>
            )}
          </div>
          <div className="text-[11px] text-pg-ink-tertiary mt-1 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <span style={{ fontFamily: "var(--font-mono)" }}>{typeMeta?.emoji ?? "—"}</span>
              {typeMeta?.label ?? field.field_type}
            </span>
            {field.options && field.options.length > 0 && (
              <span>· {field.options.length} pilihan</span>
            )}
            {field.tier_weight > 0 && (
              <span>· bobot {field.tier_weight}</span>
            )}
          </div>
          {field.field_help && (
            <div className="text-[12px] text-pg-ink-tertiary mt-1.5 italic">{field.field_help}</div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            disabled={pending}
            className="text-[12px] font-bold text-pg-ink-secondary hover:text-pg-red-600 inline-flex items-center gap-1"
          >
            <Icon name="edit" size={11} /> Edit
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-[12px] font-bold text-pg-red-600 hover:underline inline-flex items-center gap-1"
          >
            <Icon name="trash" size={11} /> Hapus
          </button>
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
      defaultSection: Field["section"];
      sortOrder: number;
      onClose: () => void;
      initial?: undefined;
    }
  | {
      mode: "edit";
      positionSlug: string;
      defaultSection: Field["section"];
      initial: Field;
      onClose: () => void;
      sortOrder?: undefined;
    };

type OptionRow = { value: string; label: string; qualifying?: boolean };

function FieldForm(props: FieldFormProps) {
  const { mode, positionSlug, onClose } = props;
  const initial = mode === "edit" ? props.initial : null;

  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Primary inputs
  const [label, setLabel] = useState<string>(initial?.field_label ?? "");
  const [help, setHelp] = useState<string>(initial?.field_help ?? "");
  const [fieldType, setFieldType] = useState<FieldTypeKey>(
    normalizeType(initial?.field_type ?? "radio"),
  );
  const [options, setOptions] = useState<OptionRow[]>(
    initial?.options && initial.options.length > 0
      ? initial.options.map((o) => ({
          value: o.value,
          label: o.label,
          // Preserve the qualifying flag through edit round-trip. Admin UI
          // for setting it isn't exposed yet; values are seeded via migration.
          qualifying: o.qualifying,
        }))
      : [
          { value: "", label: "" },
          { value: "", label: "" },
        ],
  );
  const [section, setSection] = useState<Field["section"]>(
    initial?.section ?? props.defaultSection,
  );
  const [importance, setImportance] = useState<Field["importance"]>(
    initial?.importance ?? (props.defaultSection === "syarat_utama" ? "required" : "optional"),
  );

  // Advanced (collapsed)
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [fieldKey, setFieldKey] = useState<string>(initial?.field_key ?? "");
  const [fieldKeyTouched, setFieldKeyTouched] = useState(false);
  const [tierWeight, setTierWeight] = useState<number>(initial?.tier_weight ?? 0);

  const typeMeta = TYPE_BY_KEY.get(fieldType)!;
  const effectiveKey = fieldKeyTouched || mode === "edit"
    ? fieldKey
    : slugify(label) || "";

  // A 'file' field in Syarat utama is a funnel-killer: the apply forms (web +
  // portal) don't render file inputs at that stage, so a required file question
  // can never be answered → the candidate can never submit. Files belong to the
  // later "Lengkapi" stage. Block it here.
  const fileInSyaratUtama = section === "syarat_utama" && fieldType === "file";

  const canSubmit =
    label.trim().length >= 2 &&
    (mode === "edit" || effectiveKey.length > 0) &&
    !fileInSyaratUtama &&
    (!typeMeta.hasOptions || options.some((o) => o.label.trim().length > 0));

  /**
   * Switching a choice type → a non-choice type drops every option, INCLUDING
   * any `qualifying` flags that drive hard_pass/readiness. Warn before that
   * silently changes who passes screening for a position with live applicants.
   */
  function handleTypeChange(next: FieldTypeKey) {
    const nextHasOptions = TYPE_BY_KEY.get(next)?.hasOptions ?? false;
    const losingOptions = typeMeta.hasOptions && !nextHasOptions;
    const hasQualifying = options.some((o) => o.qualifying);
    if (losingOptions && hasQualifying) {
      const ok = window.confirm(
        "Ganti ke jenis ini akan menghapus semua pilihan jawaban beserta tanda 'Lolos' (kualifikasi) yang sudah diset. Ini mengubah penilaian kelayakan kandidat. Lanjut?",
      );
      if (!ok) return;
    }
    setFieldType(next);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);

    const finalOptions: { value: string; label: string; qualifying?: boolean }[] | null = typeMeta.hasOptions
      ? options
          .filter((o) => o.label.trim().length > 0)
          .map((o) => {
            const cleanLabel = o.label.trim();
            const cleanValue = o.value.trim() || slugify(cleanLabel);
            return typeof o.qualifying === "boolean"
              ? { value: cleanValue, label: cleanLabel, qualifying: o.qualifying }
              : { value: cleanValue, label: cleanLabel };
          })
      : null;

    const collectStage =
      section === "syarat_utama"
        ? "applied"
        : section === "screening"
          ? "document_check"
          : "screening";

    const payload: ApplicationFieldInput = {
      field_key: mode === "edit" ? initial!.field_key : effectiveKey,
      field_label: label.trim(),
      field_help: help.trim() || undefined,
      field_type: fieldType,
      options: finalOptions,
      importance,
      section,
      tier_weight: tierWeight,
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

  return (
    <form
      onSubmit={submit}
      className="bg-pg-white rounded-2xl p-5"
      style={{ border: "1.5px solid var(--pg-red-200)" }}
    >
      <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-pg-red-600 mb-4"
        style={{ fontFamily: "var(--font-mono)" }}>
        {mode === "add" ? "Pertanyaan baru" : "Edit pertanyaan"}
      </div>

      {/* Step 1: Question label */}
      <label className="block">
        <div className="text-[13px] font-bold text-pg-ink-primary mb-1">
          1. Apa pertanyaan untuk kandidat?
        </div>
        <input
          type="text"
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Contoh: Berapa level JLPT kamu?"
          className={INPUT_CLASS}
          autoFocus={mode === "add"}
        />
      </label>

      {/* Step 2: Field type picker */}
      <div className="mt-5">
        <div className="text-[13px] font-bold text-pg-ink-primary mb-2">
          2. Jenis jawaban yang kamu mau
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FIELD_TYPES.map((t) => {
            const active = fieldType === t.key;
            const disabled = t.key === "file" && section === "syarat_utama";
            return (
              <button
                type="button"
                key={t.key}
                onClick={() => handleTypeChange(t.key)}
                disabled={disabled}
                title={
                  disabled
                    ? "Upload dokumen tidak bisa di Syarat utama — dikumpulkan di tahap Lengkapi."
                    : undefined
                }
                className="text-left px-3 py-3 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  border: active
                    ? "1.5px solid var(--pg-red-600)"
                    : "1.5px solid var(--pg-border)",
                  background: active ? "var(--pg-red-soft-bg)" : "var(--pg-white)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-[15px] font-bold"
                    style={{
                      color: active ? "var(--pg-red-600)" : "var(--pg-ink-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {t.emoji}
                  </span>
                  <div
                    className="text-[12.5px] font-bold"
                    style={{
                      color: active ? "var(--pg-red-600)" : "var(--pg-ink-primary)",
                    }}
                  >
                    {t.label}
                  </div>
                </div>
                <div className="text-[11px] text-pg-ink-tertiary mt-1 leading-tight">
                  {t.description}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-[11px] text-pg-ink-tertiary italic">
          Contoh: {typeMeta.example}
        </div>
        {fileInSyaratUtama && (
          <div
            className="mt-2 flex items-start gap-1.5 text-[11px] font-semibold rounded-lg px-2.5 py-2"
            style={{ background: "var(--pg-err-bg, #fdecea)", color: "var(--pg-err)" }}
          >
            <Icon name="warn" size={12} className="shrink-0 mt-0.5" />
            <span>
              Upload dokumen tidak bisa jadi Syarat utama — kandidat nggak bisa
              upload di tahap Lamar, jadi formnya nggak akan bisa di-submit. Pindah
              ke section &ldquo;Kualifikasi&rdquo; atau pakai jenis lain.
            </span>
          </div>
        )}
      </div>

      {/* Step 3 (conditional): Options editor for choice types */}
      {typeMeta.hasOptions && (
        <div className="mt-5">
          <div className="text-[13px] font-bold text-pg-ink-primary mb-2">
            3. Pilihan jawaban yang tersedia
          </div>
          <div
            className="rounded-xl p-3 flex flex-col gap-1.5"
            style={{ background: "var(--pg-paper)", border: "1px dashed var(--pg-border)" }}
          >
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-7 h-7 grid place-items-center text-[11px] font-bold text-pg-ink-tertiary shrink-0"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) =>
                    setOptions((prev) => {
                      const next = [...prev];
                      next[idx] = { ...next[idx], label: e.target.value };
                      return next;
                    })
                  }
                  placeholder={`Pilihan ${idx + 1}`}
                  className={`${INPUT_CLASS} flex-1`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setOptions((prev) => {
                      const next = [...prev];
                      next[idx] = {
                        ...next[idx],
                        qualifying: !next[idx].qualifying,
                      };
                      return next;
                    })
                  }
                  aria-pressed={!!opt.qualifying}
                  title="Tandai opsi ini sebagai 'lolos' syarat — memengaruhi kelayakan/readiness kandidat"
                  className="shrink-0 inline-flex items-center gap-1 px-2 h-7 rounded-md text-[10.5px] font-bold transition-colors"
                  style={
                    opt.qualifying
                      ? {
                          background: "var(--pg-ok-bg)",
                          color: "var(--pg-ok)",
                          border: "1px solid var(--pg-ok)",
                        }
                      : {
                          background: "var(--pg-white)",
                          color: "var(--pg-ink-tertiary)",
                          border: "1px solid var(--pg-border)",
                        }
                  }
                >
                  {opt.qualifying ? "✓ Lolos" : "Lolos?"}
                </button>
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() =>
                      setOptions((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="w-7 h-7 grid place-items-center text-pg-ink-tertiary hover:text-pg-red-600 shrink-0"
                    aria-label="Hapus pilihan"
                  >
                    <Icon name="trash" size={12} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setOptions((prev) => [...prev, { value: "", label: "" }])
              }
              className="self-start inline-flex items-center gap-1.5 px-2.5 py-1.5 mt-1 text-[12px] font-bold text-pg-red-600 rounded-lg"
              style={{ background: "var(--pg-white)" }}
            >
              <Icon name="plus" size={12} stroke={2.4} /> Tambah pilihan
            </button>
            <p className="text-[11px] text-pg-ink-tertiary mt-1.5 leading-snug">
              Tandai <b>Lolos</b> pada opsi yang dianggap memenuhi syarat. Kalau
              tidak ada yang ditandai, semua jawaban dianggap lolos.
            </p>
          </div>
        </div>
      )}

      {/* Section picker */}
      <div className="mt-5">
        <div className="text-[13px] font-bold text-pg-ink-primary mb-2">
          {typeMeta.hasOptions ? "4." : "3."} Kapan ini ditanya ke kandidat?
        </div>
        <div className="grid gap-1.5">
          {(["syarat_utama", "kualifikasi", "screening"] as const).map((s) => {
            const selected = section === s;
            const meta = SECTION_META[s];
            return (
              <button
                type="button"
                key={s}
                onClick={() => setSection(s)}
                className="text-left px-3 py-2.5 rounded-lg"
                style={{
                  border: selected
                    ? "1.5px solid var(--pg-red-600)"
                    : "1.5px solid var(--pg-border)",
                  background: selected ? "var(--pg-red-soft-bg)" : "var(--pg-white)",
                }}
              >
                <div
                  className="text-[13px] font-bold"
                  style={{
                    color: selected ? "var(--pg-red-600)" : "var(--pg-ink-primary)",
                  }}
                >
                  {meta.label}
                </div>
                <div className="text-[11.5px] text-pg-ink-tertiary mt-0.5 leading-snug">
                  {meta.hint}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Required toggle */}
      <div className="mt-5">
        <div className="text-[13px] font-bold text-pg-ink-primary mb-2">
          {typeMeta.hasOptions ? "5." : "4."} Wajib diisi atau opsional?
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["required", "optional"] as const).map((val) => {
            const selected = importance === val;
            const isReq = val === "required";
            return (
              <button
                type="button"
                key={val}
                onClick={() => setImportance(val)}
                className="text-left px-3 py-2.5 rounded-lg"
                style={{
                  border: selected
                    ? `1.5px solid ${isReq ? "var(--pg-red-600)" : "var(--pg-info)"}`
                    : "1.5px solid var(--pg-border)",
                  background: selected
                    ? isReq
                      ? "var(--pg-red-soft-bg)"
                      : "var(--pg-info-bg)"
                    : "var(--pg-white)",
                }}
              >
                <div
                  className="text-[13px] font-bold"
                  style={{
                    color: selected
                      ? isReq
                        ? "var(--pg-red-600)"
                        : "var(--pg-info)"
                      : "var(--pg-ink-primary)",
                  }}
                >
                  {isReq ? "Wajib" : "Opsional / bonus"}
                </div>
                <div className="text-[11.5px] text-pg-ink-tertiary mt-0.5">
                  {isReq
                    ? "Kandidat ga bisa lanjut kalau ga isi."
                    : "Boleh dilewat. Bantu ngangkat skor saja."}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Help text (optional) */}
      <label className="block mt-5">
        <div className="text-[13px] font-bold text-pg-ink-primary mb-1">
          Catatan untuk kandidat <span className="font-normal text-pg-ink-tertiary">(opsional)</span>
        </div>
        <input
          type="text"
          value={help}
          onChange={(e) => setHelp(e.target.value)}
          placeholder="Mis. Cantumkan nomor STR yang masih aktif."
          className={INPUT_CLASS}
        />
      </label>

      {/* Advanced (collapsed) */}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-pg-ink-secondary"
        >
          <Icon
            name={advancedOpen ? "chevron_down" : "chevron_right"}
            size={12}
            stroke={2.4}
          />
          Lanjutan
        </button>
        {advancedOpen && (
          <div
            className="mt-2 p-4 rounded-xl grid gap-3"
            style={{ background: "var(--pg-paper)", border: "1px solid var(--pg-border)" }}
          >
            <label className="block">
              <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1">
                ID teknis (field_key)
                {mode === "edit" && (
                  <span className="font-normal"> · ga bisa diubah setelah dibuat</span>
                )}
              </div>
              <input
                type="text"
                pattern="[a-z][a-z0-9_]*"
                value={mode === "edit" ? initial!.field_key : effectiveKey}
                onChange={(e) => {
                  setFieldKeyTouched(true);
                  setFieldKey(slugify(e.target.value));
                }}
                placeholder="jlpt_level"
                readOnly={mode === "edit"}
                className={`${INPUT_CLASS} font-mono ${mode === "edit" ? "bg-pg-ink-50 text-pg-ink-tertiary cursor-not-allowed" : ""}`}
                style={{ fontFamily: "var(--font-mono)" }}
              />
              <div className="text-[10.5px] text-pg-ink-tertiary mt-1 leading-snug">
                Otomatis dari label. Buat penyimpanan internal — kandidat ga lihat ini.
              </div>
            </label>
            <label className="block">
              <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1">
                Bobot scoring <span className="font-normal">(0–10)</span>
              </div>
              <input
                type="number"
                min={0}
                max={10}
                value={tierWeight}
                onChange={(e) => setTierWeight(Number(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
              <div className="text-[10.5px] text-pg-ink-tertiary mt-1 leading-snug">
                Cuma efek di kualifikasi — bobotin skor ranking kandidat. 0 = ga ngaruh.
              </div>
            </label>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 px-3 py-2.5 rounded-lg text-[12px] flex items-start gap-2"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}>
          <Icon name="warn" size={12} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <div className="mt-5 flex gap-2 pt-4" style={{ borderTop: "1px solid var(--pg-border-soft)" }}>
        <Button type="submit" small disabled={pending || !canSubmit}>
          {pending ? "Menyimpan…" : mode === "add" ? "Tambah pertanyaan" : "Simpan perubahan"}
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
  "w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3 py-2 text-[14px] text-pg-ink-primary placeholder:text-pg-ink-quaternary focus:border-pg-red-600 outline-none";
