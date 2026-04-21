"use client";

import type { FormStepProps } from "./types";

export default function FormStep2({ formData, onChange, t }: FormStepProps) {
  return (
    <div className="space-y-5">
      {/* Work Status */}
      <div>
        <label htmlFor="workStatus" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
          {t("fields.workStatus")} *
        </label>
        <select
          id="workStatus"
          value={formData.workStatus}
          onChange={(e) => onChange("workStatus", e.target.value)}
          required
          className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
        >
          <option value="">{t("fields.workStatusPlaceholder")}</option>
          <option value="belum-bekerja">{t("options.workStatus.belumBekerja")}</option>
          <option value="bekerja-paruh-waktu">{t("options.workStatus.paruhWaktu")}</option>
          <option value="bekerja-penuh">{t("options.workStatus.penuh")}</option>
          <option value="mahasiswa">{t("options.workStatus.mahasiswa")}</option>
          <option value="freelance">{t("options.workStatus.freelance")}</option>
        </select>
      </div>

      {/* Availability */}
      <div>
        <label htmlFor="availability" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
          {t("fields.availability")} *
        </label>
        <select
          id="availability"
          value={formData.availability}
          onChange={(e) => onChange("availability", e.target.value)}
          required
          className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
        >
          <option value="">{t("fields.availabilityPlaceholder")}</option>
          <option value="segera">{t("options.availability.segera")}</option>
          <option value="1-2-minggu">{t("options.availability.satuDuaMinggu")}</option>
          <option value="lebih-2-minggu">{t("options.availability.lebihDuaMinggu")}</option>
        </select>
      </div>

      {/* Smartphone & Internet */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="hasSmartphone" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
            {t("fields.hasSmartphone")} *
          </label>
          <select
            id="hasSmartphone"
            value={formData.hasSmartphone}
            onChange={(e) => onChange("hasSmartphone", e.target.value)}
            required
            className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
          >
            <option value="">{t("fields.selectOption")}</option>
            <option value="ya">{t("options.yaTidak.ya")}</option>
            <option value="tidak">{t("options.yaTidak.tidak")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="hasInternet" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
            {t("fields.hasInternet")} *
          </label>
          <select
            id="hasInternet"
            value={formData.hasInternet}
            onChange={(e) => onChange("hasInternet", e.target.value)}
            required
            className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
          >
            <option value="">{t("fields.selectOption")}</option>
            <option value="ya">{t("options.yaTidak.ya")}</option>
            <option value="tidak">{t("options.yaTidak.tidak")}</option>
          </select>
        </div>
      </div>

      {/* Field Work Willing */}
      <div>
        <label htmlFor="fieldWorkWilling" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
          {t("fields.fieldWorkWilling")} *
        </label>
        <select
          id="fieldWorkWilling"
          value={formData.fieldWorkWilling}
          onChange={(e) => onChange("fieldWorkWilling", e.target.value)}
          required
          className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
        >
          <option value="">{t("fields.selectOption")}</option>
          <option value="ya">{t("options.yaTidak.ya")}</option>
          <option value="tidak">{t("options.yaTidak.tidak")}</option>
        </select>
      </div>
    </div>
  );
}
