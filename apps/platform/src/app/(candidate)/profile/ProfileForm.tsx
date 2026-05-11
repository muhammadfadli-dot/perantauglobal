"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import { updateProfile } from "./actions";

interface FieldOption {
  value: string;
  label: string;
}

interface FieldSpec {
  key: string;
  label: string;
  category: "language" | "certification" | "experience";
  help?: string;
  options: FieldOption[];
}

// Curated list of credentials a candidate might want to record proactively.
// Position-specific qualifying questions (e.g., cat_engine_exp) are collected
// at apply time on the web form, not here — that's why this list stays small
// and broad. Profile is for review + general credentials, not exhaustive
// position-by-position enumeration.
const FIELDS: FieldSpec[] = [
  {
    key: "english_level",
    label: "Bahasa Inggris",
    category: "language",
    options: [
      { value: "fluent", label: "Fasih" },
      { value: "intermediate", label: "Menengah" },
      { value: "basic", label: "Dasar" },
    ],
  },
  {
    key: "jlpt_level",
    label: "Bahasa Jepang (JLPT)",
    category: "language",
    options: [
      { value: "n2", label: "N2 (mahir)" },
      { value: "n3", label: "N3 (menengah atas)" },
      { value: "n4", label: "N4 (menengah)" },
      { value: "n5", label: "N5 (pemula)" },
      { value: "no_cert", label: "Belum punya" },
    ],
  },
  {
    key: "str_active",
    label: "STR Keperawatan",
    category: "certification",
    options: [
      { value: "yes", label: "Aktif" },
      { value: "inProgress", label: "Sedang diurus" },
      { value: "no", label: "Belum punya" },
    ],
  },
  {
    key: "sim_type",
    label: "SIM",
    category: "certification",
    options: [
      { value: "sim_internasional", label: "SIM Internasional" },
      { value: "sim_b2", label: "SIM B2 (truk besar)" },
      { value: "sim_b1", label: "SIM B1 (truk kecil)" },
      { value: "sim_a", label: "SIM A (mobil pribadi)" },
    ],
  },
  {
    key: "care_certification",
    label: "Sertifikasi caregiver",
    category: "certification",
    options: [
      { value: "ssw_kaigo", label: "SSW Kaigo" },
      { value: "nursing_s1", label: "S1 Keperawatan" },
      { value: "nursing_d3", label: "D3 Keperawatan" },
      { value: "caregiver_training", label: "Pelatihan caregiver" },
      { value: "none", label: "Belum ada" },
    ],
  },
  {
    key: "experience_years",
    label: "Pengalaman kerja",
    category: "experience",
    options: [
      { value: "3+", label: "Lebih dari 3 tahun" },
      { value: "1-3", label: "1–3 tahun" },
      { value: "less_than_1", label: "Kurang dari 1 tahun" },
      { value: "none", label: "Belum ada" },
    ],
  },
];

const CATEGORY_LABEL: Record<FieldSpec["category"], string> = {
  language: "Bahasa",
  certification: "Sertifikat",
  experience: "Pengalaman",
};

interface Props {
  initialCredentials: Record<string, string>;
  candidateId: string;
}

export default function ProfileForm({ initialCredentials }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(initialCredentials);
  const [editing, setEditing] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<
    { kind: "ok" } | { kind: "error"; message: string } | null
  >(null);

  function setField(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleEdit(key: string) {
    setEditing((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.ok) {
        setToast({ kind: "ok" });
        setEditing(new Set());
        setShowAdd(false);
        setTimeout(() => {
          setToast(null);
          router.refresh();
        }, 1200);
      } else {
        setToast({ kind: "error", message: result.error });
      }
    });
  }

  // Split into filled vs not-yet-filled. Filled ones get the review-style
  // card (label + value + edit affordance). The rest live behind a single
  // "Tambah kualifikasi" toggle so the page doesn't shove every position's
  // credentials at users who don't need them.
  const filled = FIELDS.filter((f) => values[f.key]);
  const unfilled = FIELDS.filter((f) => !values[f.key]);
  const hasChanges = JSON.stringify(values) !== JSON.stringify(initialCredentials);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Filled credentials — the page's primary content */}
      {filled.length === 0 ? (
        <div
          className="bg-pg-white rounded-2xl px-4 py-5 text-center"
          style={{ border: "1px solid var(--pg-border)" }}
        >
          <div className="text-[14px] font-bold text-pg-ink-primary">
            Belum ada kualifikasi terisi
          </div>
          <div className="text-[12px] text-pg-ink-tertiary mt-1.5 leading-snug">
            Kualifikasi otomatis terisi saat kamu lamar posisi.
            Atau tambah sendiri di bawah.
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filled.map((field) => (
            <CredentialCard
              key={field.key}
              field={field}
              value={values[field.key] ?? ""}
              isEditing={editing.has(field.key)}
              onSelect={(v) => setField(field.key, v)}
              onClear={() => setField(field.key, "")}
              onToggleEdit={() => toggleEdit(field.key)}
            />
          ))}
        </div>
      )}

      {/* Add credential — collapsed by default */}
      {unfilled.length > 0 && (
        <div className="pt-2">
          {!showAdd ? (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border-[1.5px] border-dashed text-[13px] font-bold"
              style={{
                borderColor: "var(--pg-ink-300)",
                color: "var(--pg-ink-secondary)",
              }}
            >
              <Icon name="plus" size={14} />
              Tambah kualifikasi
              <span
                className="text-[10px] font-semibold tracking-[0.06em] uppercase ml-1"
                style={{ color: "var(--pg-ink-quaternary)", fontFamily: "var(--font-mono)" }}
              >
                {unfilled.length} tersedia
              </span>
            </button>
          ) : (
            <div className="space-y-2">
              <div
                className="flex items-baseline justify-between mt-2"
              >
                <div
                  className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                  style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                >
                  Tambah kualifikasi
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="text-[12px] font-semibold text-pg-ink-tertiary"
                >
                  Tutup
                </button>
              </div>
              {unfilled.map((field) => (
                <CredentialCard
                  key={field.key}
                  field={field}
                  value={values[field.key] ?? ""}
                  isEditing={true}
                  expanded
                  onSelect={(v) => setField(field.key, v)}
                  onClear={() => setField(field.key, "")}
                  onToggleEdit={() => toggleEdit(field.key)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save bar — only when there are unsaved changes */}
      {hasChanges && (
        <div className="sticky bottom-[68px] z-10 pt-3 -mx-5 px-5 bg-pg-paper">
          {toast?.kind === "error" && (
            <div
              className="px-4 py-3 mb-2 rounded-lg text-sm flex items-start gap-2"
              style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
            >
              <Icon name="warn" size={16} />
              <span>Gagal menyimpan: {toast.message}</span>
            </div>
          )}
          <Button type="submit" variant="primary" block disabled={isPending}>
            {isPending ? "Menyimpan…" : (
              <>
                Simpan perubahan <Icon name="check" size={18} stroke={2.6} />
              </>
            )}
          </Button>
        </div>
      )}
      {toast?.kind === "ok" && !hasChanges && (
        <div
          className="px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
        >
          <Icon name="check" size={16} />
          <span>Tersimpan</span>
        </div>
      )}
    </form>
  );
}

function CredentialCard({
  field,
  value,
  isEditing,
  expanded = false,
  onSelect,
  onClear,
  onToggleEdit,
}: {
  field: FieldSpec;
  value: string;
  isEditing: boolean;
  expanded?: boolean;
  onSelect: (v: string) => void;
  onClear: () => void;
  onToggleEdit: () => void;
}) {
  const selectedOption = field.options.find((o) => o.value === value);

  return (
    <div
      className="bg-pg-white rounded-2xl"
      style={{ border: "1px solid var(--pg-border)" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-semibold tracking-[0.1em] uppercase"
              style={{ color: "var(--pg-ink-quaternary)", fontFamily: "var(--font-mono)" }}
            >
              {CATEGORY_LABEL[field.category]}
            </span>
          </div>
          <div className="text-[15px] font-bold text-pg-ink-primary truncate mt-0.5">
            {field.label}
          </div>
          {!isEditing && !expanded && (
            <div className="text-[13px] text-pg-ink-secondary mt-0.5 truncate">
              {selectedOption?.label ?? value ?? "Belum diisi"}
            </div>
          )}
        </div>
        {!expanded && (
          <button
            type="button"
            onClick={onToggleEdit}
            className="text-[12px] font-bold text-pg-red-600 shrink-0"
          >
            {isEditing ? "Tutup" : "Ubah"}
          </button>
        )}
      </div>

      {(isEditing || expanded) && (
        <div className="px-4 pb-4 grid gap-2">
          {/* Hidden input so form submit picks up the current value */}
          <input type="hidden" name={field.key} value={value ?? ""} />
          {field.options.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSelect(opt.value)}
                className={`text-left flex items-center gap-3 px-3.5 py-3 rounded-xl border-[1.5px] transition ${
                  selected
                    ? "border-pg-red-600 bg-pg-red-50"
                    : "border-pg-ink-200 bg-pg-white hover:border-pg-ink-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${
                    selected ? "border-pg-red-600" : "border-pg-ink-300"
                  }`}
                >
                  {selected && <div className="w-2.5 h-2.5 rounded-full bg-pg-red-600" />}
                </div>
                <span
                  className={`text-[14px] flex-1 ${selected ? "font-bold" : "font-medium"}`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="self-start text-[12px] text-pg-ink-tertiary underline mt-1"
            >
              Kosongkan
            </button>
          )}
        </div>
      )}
    </div>
  );
}
