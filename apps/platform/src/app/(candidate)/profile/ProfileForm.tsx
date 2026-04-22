"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
    key: "jlpt_level",
    label: "Level JLPT (bahasa Jepang)",
    help: "Untuk lamaran Kaigo, Food Service, Truck Driver.",
    options: [
      { value: "n2", label: "N2 (mahir)" },
      { value: "n3", label: "N3 (menengah atas)" },
      { value: "n4", label: "N4 (menengah)" },
      { value: "n5", label: "N5 (pemula)" },
      { value: "no_cert", label: "Belum punya sertifikat" },
    ],
  },
  {
    key: "english_level",
    label: "Level Bahasa Inggris",
    help: "Untuk lamaran ke Saudi Arabia + program internasional.",
    options: [
      { value: "fluent", label: "Fasih (fluent)" },
      { value: "intermediate", label: "Menengah" },
      { value: "basic", label: "Dasar" },
    ],
  },
  {
    key: "str_active",
    label: "Status STR (Surat Tanda Registrasi perawat)",
    help: "Wajib untuk lamaran Perawat Saudi Arabia.",
    options: [
      { value: "yes", label: "Aktif" },
      { value: "inProgress", label: "Sedang diurus" },
      { value: "no", label: "Belum punya" },
    ],
  },
  {
    key: "sim_type",
    label: "Jenis SIM (Surat Izin Mengemudi)",
    help: "SIM B1/B2/Internasional wajib untuk Truck Driver Jepang.",
    options: [
      { value: "sim_internasional", label: "SIM Internasional" },
      { value: "sim_b2", label: "SIM B2 (truk besar)" },
      { value: "sim_b1", label: "SIM B1 (truk kecil)" },
      { value: "sim_a", label: "SIM A (mobil pribadi)" },
    ],
  },
  {
    key: "driving_years",
    label: "Pengalaman mengemudi (tahun)",
    help: "Untuk lamaran Truck Driver.",
    options: [
      { value: "5+", label: "Lebih dari 5 tahun" },
      { value: "3-5", label: "3–5 tahun" },
      { value: "1-2", label: "1–2 tahun" },
    ],
  },
  {
    key: "experience_years",
    label: "Pengalaman kerja relevan (tahun)",
    options: [
      { value: "3+", label: "Lebih dari 3 tahun" },
      { value: "1-3", label: "1–3 tahun" },
      { value: "less_than_1", label: "Kurang dari 1 tahun" },
      { value: "none", label: "Belum ada" },
    ],
  },
  {
    key: "care_certification",
    label: "Sertifikasi perawatan / caregiver",
    help: "Untuk lamaran Kaigo Jepang.",
    options: [
      { value: "ssw_kaigo", label: "SSW Kaigo" },
      { value: "nursing_s1", label: "S1 Keperawatan" },
      { value: "nursing_d3", label: "D3 Keperawatan" },
      { value: "caregiver_training", label: "Pelatihan caregiver" },
      { value: "none", label: "Belum ada" },
    ],
  },
  {
    key: "food_certification",
    label: "Sertifikasi food service / hospitality",
    help: "Untuk lamaran Food Service Jepang.",
    options: [
      { value: "ssw_food_service", label: "SSW Food Service" },
      { value: "hospitality_cert", label: "Sertifikat hospitality" },
      { value: "food_safety", label: "Food safety / hygiene" },
      { value: "none", label: "Belum ada" },
    ],
  },
  {
    key: "experience_type",
    label: "Latar belakang pengalaman kerja",
    options: [
      { value: "restaurant", label: "Restoran" },
      { value: "hotel", label: "Hotel" },
      { value: "cafe", label: "Kafe" },
      { value: "coffee_shop", label: "Coffee shop / barista" },
      { value: "catering", label: "Katering" },
      { value: "other", label: "Lainnya" },
    ],
  },
  {
    key: "has_lpk",
    label: "Sudah pernah / sedang LPK (Lembaga Pelatihan Kerja)?",
    options: [
      { value: "yes", label: "Ya" },
      { value: "no", label: "Belum" },
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
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {FIELDS.map((field) => (
        <section
          key={field.key}
          className="border border-[var(--color-dtg-ink)] bg-white p-5"
        >
          <label className="block font-semibold text-[15px] leading-[1.35]">
            {field.label}
          </label>
          {field.help && (
            <p className="mt-1 text-xs opacity-60">{field.help}</p>
          )}
          <div className="mt-4 grid gap-2">
            {field.options.map((opt) => {
              const selected = values[field.key] === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-3 border p-3 text-sm transition ${
                    selected
                      ? "border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] text-white"
                      : "border-[var(--color-dtg-ink)]/30 hover:border-[var(--color-dtg-ink)]"
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
                  <span className="flex-1">{opt.label}</span>
                  {selected && (
                    <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em]">
                      ✓
                    </span>
                  )}
                </label>
              );
            })}
            {values[field.key] && (
              <button
                type="button"
                onClick={() => setField(field.key, "")}
                className="mt-1 self-start font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60 hover:opacity-100"
              >
                Kosongkan
              </button>
            )}
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 z-10 flex flex-col gap-2 pt-2">
        {toast?.kind === "error" && (
          <div className="border border-red-500 bg-white p-3 text-sm text-red-700">
            Gagal menyimpan: {toast.message}
          </div>
        )}
        {toast?.kind === "ok" && (
          <div className="border border-green-600 bg-white p-3 text-sm text-green-700">
            Profil disimpan. Mengalihkan ke dashboard...
          </div>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[var(--color-dtg-ink)] px-6 py-4 text-center text-base font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan profil"}
        </button>
      </div>
    </form>
  );
}
