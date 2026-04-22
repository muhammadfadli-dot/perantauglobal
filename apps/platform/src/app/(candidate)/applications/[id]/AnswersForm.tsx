"use client";

import { useState, useTransition } from "react";
import { updateAnswers } from "./actions";

interface Props {
  applicationId: string;
  initialAnswers: Record<string, string>;
}

const START_OPTIONS = [
  { value: "1_month", label: "Kurang dari 1 bulan lagi" },
  { value: "3_months", label: "1–3 bulan lagi" },
  { value: "6_months", label: "3–6 bulan lagi" },
  { value: "1_year", label: "6 bulan – 1 tahun lagi" },
  { value: "flexible", label: "Fleksibel / belum pasti" },
];

const VISA_OPTIONS = [
  { value: "none", label: "Belum ada dokumen apa-apa" },
  { value: "passport_only", label: "Baru punya paspor" },
  { value: "bp2mi_registered", label: "Sudah terdaftar BP2MI" },
  { value: "visa_in_progress", label: "Visa sedang diurus" },
];

export default function AnswersForm({ applicationId, initialAnswers }: Props) {
  const [values, setValues] = useState<Record<string, string>>(initialAnswers);
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
      const result = await updateAnswers(applicationId, formData);
      if (result.ok) {
        setToast({ kind: "ok" });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ kind: "error", message: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] opacity-60">
        Info tambahan lamaran
      </p>

      <section className="border border-[var(--color-dtg-ink)] bg-white p-5">
        <label
          htmlFor="motivation"
          className="block font-semibold text-[15px]"
        >
          Kenapa kamu tertarik dengan posisi ini?
        </label>
        <p className="mt-1 text-xs opacity-60">
          Opsional. Dibaca langsung oleh recruiter — makin jelas makin bagus.
        </p>
        <textarea
          id="motivation"
          name="motivation"
          rows={4}
          defaultValue={initialAnswers.motivation ?? ""}
          className="mt-3 w-full border border-[var(--color-dtg-ink)]/40 bg-white p-3 text-sm focus:border-[var(--color-dtg-ink)] focus:outline-none"
          placeholder="Contoh: Saya ingin kerja di Jepang karena..."
          maxLength={800}
        />
      </section>

      <section className="border border-[var(--color-dtg-ink)] bg-white p-5">
        <label className="block font-semibold text-[15px]">
          Kapan kamu siap berangkat?
        </label>
        <div className="mt-3 grid gap-2">
          {START_OPTIONS.map((opt) => {
            const selected = values.earliest_start === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center gap-3 border p-3 text-sm ${
                  selected
                    ? "border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] text-white"
                    : "border-[var(--color-dtg-ink)]/30 hover:border-[var(--color-dtg-ink)]"
                }`}
              >
                <input
                  type="radio"
                  name="earliest_start"
                  value={opt.value}
                  checked={selected}
                  onChange={() => setField("earliest_start", opt.value)}
                  className="sr-only"
                />
                <span className="flex-1">{opt.label}</span>
                {selected && <span className="text-xs">✓</span>}
              </label>
            );
          })}
        </div>
      </section>

      <section className="border border-[var(--color-dtg-ink)] bg-white p-5">
        <label className="block font-semibold text-[15px]">
          Status dokumen / visa
        </label>
        <div className="mt-3 grid gap-2">
          {VISA_OPTIONS.map((opt) => {
            const selected = values.visa_status === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center gap-3 border p-3 text-sm ${
                  selected
                    ? "border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] text-white"
                    : "border-[var(--color-dtg-ink)]/30 hover:border-[var(--color-dtg-ink)]"
                }`}
              >
                <input
                  type="radio"
                  name="visa_status"
                  value={opt.value}
                  checked={selected}
                  onChange={() => setField("visa_status", opt.value)}
                  className="sr-only"
                />
                <span className="flex-1">{opt.label}</span>
                {selected && <span className="text-xs">✓</span>}
              </label>
            );
          })}
        </div>
      </section>

      <section className="border border-[var(--color-dtg-ink)] bg-white p-5">
        <label htmlFor="referral" className="block font-semibold text-[15px]">
          Tahu Perantau Global dari mana? (opsional)
        </label>
        <input
          id="referral"
          name="referral"
          type="text"
          defaultValue={initialAnswers.referral ?? ""}
          className="mt-3 w-full border border-[var(--color-dtg-ink)]/40 bg-white p-3 text-sm focus:border-[var(--color-dtg-ink)] focus:outline-none"
          placeholder="Contoh: rekomendasi teman, Instagram, TikTok..."
          maxLength={200}
        />
      </section>

      <div className="sticky bottom-4 z-10 flex flex-col gap-2 pt-2">
        {toast?.kind === "error" && (
          <div className="border border-red-500 bg-white p-3 text-sm text-red-700">
            Gagal: {toast.message}
          </div>
        )}
        {toast?.kind === "ok" && (
          <div className="border border-green-600 bg-white p-3 text-sm text-green-700">
            Tersimpan. Recruiter bakal lihat info tambahan ini.
          </div>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[var(--color-dtg-ink)] px-6 py-4 text-center text-base font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan lamaran"}
        </button>
      </div>
    </form>
  );
}
