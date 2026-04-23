"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { Button, Badge } from "@/components/pg/primitives";
import { createFormField, deleteFormField, type FormFieldInput } from "../actions";

type Field = {
  id: string;
  field_key: string;
  field_label: string;
  field_help: string | null;
  field_type: string;
  options: { value: string; label: string }[] | null;
  required: boolean;
  tier_weight: number;
  sort_order: number;
};

const TYPE_OPTIONS: FormFieldInput["field_type"][] = [
  "select",
  "radio",
  "multiselect",
  "text",
  "textarea",
  "number",
  "file",
];

export default function FormFieldsEditor({
  positionSlug,
  initial,
}: {
  positionSlug: string;
  initial: Field[];
}) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="grid gap-2">
        {initial.length === 0 ? (
          <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 text-center text-sm text-pg-ink-500">
            Belum ada custom field. Tambah pertanyaan tambahan untuk apply form posisi ini.
          </div>
        ) : (
          initial.map((f) => (
            <FieldRow key={f.id} positionSlug={positionSlug} field={f} />
          ))
        )}
      </div>

      <div className="mt-4">
        {showAdd ? (
          <AddForm
            positionSlug={positionSlug}
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

function FieldRow({ positionSlug, field }: { positionSlug: string; field: Field }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    if (!confirm(`Hapus pertanyaan "${field.field_label}"?`)) return;
    setError(null);
    start(async () => {
      try {
        await deleteFormField(field.id, positionSlug);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal hapus");
      }
    });
  }

  return (
    <div className="bg-pg-white border border-pg-ink-100 rounded-xl px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold">{field.field_label}</div>
          <div className="text-[11px] text-pg-ink-500 font-mono mt-0.5">
            {field.field_key} · {field.field_type}
          </div>
          {field.field_help && (
            <div className="text-[12px] text-pg-ink-500 mt-1">{field.field_help}</div>
          )}
          {field.options && field.options.length > 0 && (
            <div className="text-[12px] text-pg-ink-500 mt-1">
              Options: {field.options.map((o) => o.label).join(", ")}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex gap-1.5">
            {field.required && <Badge variant="err">Wajib</Badge>}
            {field.tier_weight > 0 && <Badge variant="info">Bobot {field.tier_weight}</Badge>}
          </div>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="inline-flex items-center gap-1 text-[12px] font-bold text-pg-err hover:underline disabled:opacity-50"
          >
            <Icon name="trash" size={12} /> Hapus
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-2 text-[12px] text-pg-err flex items-center gap-1">
          <Icon name="warn" size={12} /> {error}
        </div>
      )}
    </div>
  );
}

function AddForm({
  positionSlug,
  sortOrder,
  onClose,
}: {
  positionSlug: string;
  sortOrder: number;
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldType, setFieldType] = useState<FormFieldInput["field_type"]>("radio");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const optionsRaw = String(fd.get("options") ?? "").trim();
    let options: { value: string; label: string }[] | null = null;
    if (optionsRaw && (fieldType === "select" || fieldType === "radio" || fieldType === "multiselect")) {
      try {
        options = optionsRaw.split("\n").filter(Boolean).map((line) => {
          const [value, ...labelParts] = line.split("|");
          const label = labelParts.join("|").trim() || value.trim();
          return { value: value.trim(), label };
        });
      } catch {
        setError("Format options salah. Pakai 'value|label' per baris.");
        return;
      }
    }

    start(async () => {
      try {
        await createFormField(positionSlug, {
          field_key: String(fd.get("field_key") ?? "").trim(),
          field_label: String(fd.get("field_label") ?? "").trim(),
          field_help: (fd.get("field_help") as string) || undefined,
          field_type: fieldType,
          options,
          required: fd.get("required") === "on",
          tier_weight: Number(fd.get("tier_weight") ?? 0),
          sort_order: sortOrder,
        });
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menambah");
      }
    });
  }

  const inputClass = "w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3 py-2 text-sm focus:border-pg-red-600 outline-none";

  return (
    <form onSubmit={submit} className="bg-pg-white border-[1.5px] border-pg-red-200 rounded-2xl p-4">
      <div className="text-[12px] font-bold tracking-[0.1em] uppercase text-pg-red-600 mb-3">
        Tambah pertanyaan baru
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <div className="text-[12px] font-bold text-pg-ink-500 mb-1">Field key (snake_case)</div>
          <input name="field_key" type="text" required pattern="[a-z][a-z0-9_]*" placeholder="kopi_skill" className={`${inputClass} font-mono`} />
        </label>
        <label>
          <div className="text-[12px] font-bold text-pg-ink-500 mb-1">Tipe</div>
          <select
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value as FormFieldInput["field_type"])}
            className={inputClass}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block mt-3">
        <div className="text-[12px] font-bold text-pg-ink-500 mb-1">Label (yang user lihat)</div>
        <input name="field_label" type="text" required placeholder="Berapa lama pengalaman barista kamu?" className={inputClass} />
      </label>
      <label className="block mt-3">
        <div className="text-[12px] font-bold text-pg-ink-500 mb-1">
          Help text <span className="font-normal text-pg-ink-400">(jelaskan kenapa ditanya)</span>
        </div>
        <input name="field_help" type="text" placeholder="Untuk cocokkan kamu dengan brand kopi yang tepat." className={inputClass} />
      </label>
      {(fieldType === "select" || fieldType === "radio" || fieldType === "multiselect") && (
        <label className="block mt-3">
          <div className="text-[12px] font-bold text-pg-ink-500 mb-1">
            Options <span className="font-normal text-pg-ink-400">(satu per baris, format: value|label)</span>
          </div>
          <textarea
            name="options"
            rows={4}
            placeholder={`belum_pernah|Belum pernah\n1_2|1–2 tahun\n3_plus|3 tahun ke atas`}
            className={`${inputClass} font-mono`}
          />
        </label>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input name="required" type="checkbox" className="w-4 h-4 accent-pg-red-600" />
          <span className="text-sm font-semibold">Wajib diisi</span>
        </label>
        <label>
          <div className="text-[12px] font-bold text-pg-ink-500 mb-1">
            Tier weight <span className="font-normal text-pg-ink-400">(0–10)</span>
          </div>
          <input name="tier_weight" type="number" min={0} max={10} defaultValue={0} className={inputClass} />
        </label>
      </div>
      {error && (
        <div className="mt-3 px-3 py-2 rounded-lg text-[12px] flex items-start gap-1" style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}>
          <Icon name="warn" size={12} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <Button type="submit" small disabled={pending}>{pending ? "Menyimpan…" : "Simpan field"}</Button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center min-h-[40px] px-4 text-sm font-semibold text-pg-ink-700 hover:bg-pg-ink-50 rounded-xl"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
