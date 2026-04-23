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
  help?: string;
  options: FieldOption[];
}

const FIELDS: FieldSpec[] = [
  {
    key: "english_level",
    label: "Bahasa Inggris",
    help: "Penting untuk lamaran Saudi Arabia.",
    options: [
      { value: "fluent", label: "Fasih" },
      { value: "intermediate", label: "Menengah (B1)" },
      { value: "basic", label: "Dasar" },
    ],
  },
  {
    key: "jlpt_level",
    label: "JLPT (bahasa Jepang)",
    help: "Wajib untuk lamaran Jepang.",
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
    label: "STR (perawat)",
    help: "Wajib untuk Perawat Saudi Arabia.",
    options: [
      { value: "yes", label: "Aktif" },
      { value: "inProgress", label: "Sedang diurus" },
      { value: "no", label: "Belum punya" },
    ],
  },
  {
    key: "experience_years",
    label: "Pengalaman kerja relevan",
    options: [
      { value: "3+", label: "Lebih dari 3 tahun" },
      { value: "1-3", label: "1–3 tahun" },
      { value: "less_than_1", label: "Kurang dari 1 tahun" },
      { value: "none", label: "Belum ada" },
    ],
  },
  {
    key: "sim_type",
    label: "SIM (untuk Truck Driver Jepang)",
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
    help: "Untuk Kaigo Jepang & Caregiver Taiwan.",
    options: [
      { value: "ssw_kaigo", label: "SSW Kaigo" },
      { value: "nursing_s1", label: "S1 Keperawatan" },
      { value: "nursing_d3", label: "D3 Keperawatan" },
      { value: "caregiver_training", label: "Pelatihan caregiver" },
      { value: "none", label: "Belum ada" },
    ],
  },
];

interface Props {
  initialCredentials: Record<string, string>;
  candidateId: string;
}

export default function ProfileForm({ initialCredentials }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(initialCredentials);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<
    { kind: "ok" } | { kind: "error"; message: string } | null
  >(null);

  function setField(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.ok) {
        setToast({ kind: "ok" });
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        setToast({ kind: "error", message: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {FIELDS.map((field) => (
        <div
          key={field.key}
          className="bg-pg-white border border-pg-ink-100 rounded-2xl p-4 md:p-5"
        >
          <div className="text-[15px] font-bold">{field.label}</div>
          {field.help && (
            <div className="text-[13px] text-pg-ink-500 mt-1">{field.help}</div>
          )}
          <div className="mt-3 grid gap-2">
            {field.options.map((opt) => {
              const selected = values[field.key] === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-xl border-[1.5px] cursor-pointer transition ${
                    selected
                      ? "border-pg-red-600 bg-pg-red-50"
                      : "border-pg-ink-200 bg-pg-white hover:border-pg-ink-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={field.key}
                    value={opt.value}
                    checked={selected}
                    onChange={() => setField(field.key, opt.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${
                      selected ? "border-pg-red-600" : "border-pg-ink-300"
                    }`}
                  >
                    {selected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-pg-red-600" />
                    )}
                  </div>
                  <span className={`text-[15px] flex-1 ${selected ? "font-bold" : "font-medium"}`}>
                    {opt.label}
                  </span>
                </label>
              );
            })}
            {values[field.key] && (
              <button
                type="button"
                onClick={() => setField(field.key, "")}
                className="self-start text-[12px] text-pg-ink-500 underline mt-1"
              >
                Kosongkan
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="sticky bottom-[68px] z-10 pt-3 bg-pg-paper">
        {toast?.kind === "error" && (
          <div
            className="px-4 py-3 mb-2 rounded-lg text-sm flex items-start gap-2"
            style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
          >
            <Icon name="warn" size={16} />
            <span>Gagal menyimpan: {toast.message}</span>
          </div>
        )}
        {toast?.kind === "ok" && (
          <div
            className="px-4 py-3 mb-2 rounded-lg text-sm flex items-start gap-2"
            style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
          >
            <Icon name="check" size={16} />
            <span>Tersimpan! Mengalihkan ke beranda…</span>
          </div>
        )}
        <Button type="submit" variant="primary" block disabled={isPending}>
          {isPending ? "Menyimpan…" : (
            <>
              Simpan profil <Icon name="check" size={18} stroke={2.6} />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
