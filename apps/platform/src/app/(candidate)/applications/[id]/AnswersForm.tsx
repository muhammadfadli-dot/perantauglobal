"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
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
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-4 md:p-5">
        <label htmlFor="motivation" className="block text-[15px] font-bold">
          Kenapa kamu tertarik dengan posisi ini?
        </label>
        <div className="text-[13px] text-pg-ink-500 mt-1">
          Opsional. Dibaca recruiter — makin jelas makin bagus.
        </div>
        <textarea
          id="motivation"
          name="motivation"
          rows={4}
          defaultValue={initialAnswers.motivation ?? ""}
          className="mt-3 w-full border-[1.5px] border-pg-ink-200 bg-pg-white rounded-lg p-3 text-base focus:border-pg-red-600 outline-none"
          placeholder="Contoh: Saya ingin kerja di Saudi karena…"
          maxLength={800}
        />
      </div>

      <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-4 md:p-5">
        <div className="text-[15px] font-bold">Kapan kamu siap berangkat?</div>
        <div className="mt-3 grid gap-2">
          {START_OPTIONS.map((opt) => {
            const selected = values.earliest_start === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-xl border-[1.5px] cursor-pointer ${
                  selected
                    ? "border-pg-red-600 bg-pg-red-50"
                    : "border-pg-ink-200 bg-pg-white hover:border-pg-ink-300"
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
                <div
                  className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${
                    selected ? "border-pg-red-600" : "border-pg-ink-300"
                  }`}
                >
                  {selected && <div className="w-2.5 h-2.5 rounded-full bg-pg-red-600" />}
                </div>
                <span className={`text-[15px] flex-1 ${selected ? "font-bold" : "font-medium"}`}>
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-4 md:p-5">
        <div className="text-[15px] font-bold">Status dokumen / visa</div>
        <div className="mt-3 grid gap-2">
          {VISA_OPTIONS.map((opt) => {
            const selected = values.visa_status === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-xl border-[1.5px] cursor-pointer ${
                  selected
                    ? "border-pg-red-600 bg-pg-red-50"
                    : "border-pg-ink-200 bg-pg-white hover:border-pg-ink-300"
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
                <div
                  className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${
                    selected ? "border-pg-red-600" : "border-pg-ink-300"
                  }`}
                >
                  {selected && <div className="w-2.5 h-2.5 rounded-full bg-pg-red-600" />}
                </div>
                <span className={`text-[15px] flex-1 ${selected ? "font-bold" : "font-medium"}`}>
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-4 md:p-5">
        <label htmlFor="referral" className="block text-[15px] font-bold">
          Tahu Perantau Global dari mana? <span className="text-pg-ink-400 font-medium">(opsional)</span>
        </label>
        <input
          id="referral"
          name="referral"
          type="text"
          defaultValue={initialAnswers.referral ?? ""}
          className="mt-3 w-full border-[1.5px] border-pg-ink-200 bg-pg-white rounded-lg p-3 text-base focus:border-pg-red-600 outline-none"
          placeholder="Contoh: rekomendasi teman, Instagram, TikTok…"
          maxLength={200}
        />
      </div>

      <div className="pt-2">
        {toast?.kind === "error" && (
          <div
            className="px-3 py-2 mb-2 rounded-lg text-[13px] flex items-start gap-2"
            style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
          >
            <Icon name="warn" size={14} />
            <span>Gagal: {toast.message}</span>
          </div>
        )}
        {toast?.kind === "ok" && (
          <div
            className="px-3 py-2 mb-2 rounded-lg text-[13px] flex items-start gap-2"
            style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
          >
            <Icon name="check" size={14} />
            <span>Tersimpan. Recruiter bakal lihat info tambahan ini.</span>
          </div>
        )}
        <Button type="submit" variant="primary" block disabled={isPending}>
          {isPending ? "Menyimpan…" : (
            <>
              Simpan jawaban <Icon name="check" size={18} stroke={2.6} />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
