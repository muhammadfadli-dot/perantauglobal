"use client";

import type { FormStepProps } from "./types";

export default function FormStep3({ formData, onChange, t }: FormStepProps) {
  return (
    <div className="space-y-5">
      {/* Motivation Reason */}
      <div>
        <label htmlFor="motivationReason" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
          {t("fields.motivationReason")} *
        </label>
        <select
          id="motivationReason"
          value={formData.motivationReason}
          onChange={(e) => onChange("motivationReason", e.target.value)}
          required
          className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
        >
          <option value="">{t("fields.motivationReasonPlaceholder")}</option>
          <option value="cari-penghasilan-tambahan">{t("options.motivation.penghasilan")}</option>
          <option value="tertarik-bidang-ketenagakerjaan">{t("options.motivation.ketenagakerjaan")}</option>
          <option value="ingin-membantu-orang">{t("options.motivation.membantu")}</option>
          <option value="diajak-teman">{t("options.motivation.teman")}</option>
          <option value="lainnya">{t("options.motivation.lainnya")}</option>
        </select>
      </div>

      {/* Motivation Detail */}
      <div>
        <label htmlFor="motivationDetail" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
          {t("fields.motivationDetail")}
        </label>
        <textarea
          id="motivationDetail"
          value={formData.motivationDetail}
          onChange={(e) => onChange("motivationDetail", e.target.value)}
          rows={3}
          placeholder={t("fields.motivationDetailPlaceholder")}
          className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
        />
      </div>

      {/* Communication Comfort */}
      <div>
        <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
          {t("fields.communicationComfort")} *
        </label>
        <p className="mb-3 text-sm text-dtg-gray-500">{t("fields.communicationComfortHint")}</p>
        <div className="flex items-center gap-2">
          {["1", "2", "3", "4", "5"].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange("communicationComfort", val)}
              className={`flex size-12 items-center justify-center border font-[family-name:var(--font-display)] text-base font-extrabold transition-colors duration-150 ${
                formData.communicationComfort === val
                  ? "border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] text-[var(--color-dtg-cream)]"
                  : "border-[var(--color-dtg-ink)] bg-white text-[var(--color-dtg-ink)] hover:bg-[var(--color-dtg-cream)]"
              }`}
            >
              {val}
            </button>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-dtg-gray-500">
          <span>{t("fields.comfortLow")}</span>
          <span>{t("fields.comfortHigh")}</span>
        </div>
      </div>

      {/* Initiative Scenario */}
      <div>
        <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
          {t("fields.initiativeScenario")} *
        </label>
        <p className="mb-3 text-sm text-dtg-gray-500">{t("fields.initiativeScenarioHint")}</p>
        <div className="space-y-2">
          {(["langsung-cari-lpk-lain", "hubungi-tim-minta-arahan", "tunggu-jadwal-ulang", "skip-area-itu"] as const).map((val) => (
            <label
              key={val}
              className={`flex cursor-pointer items-start gap-3 border px-4 py-3 transition-colors duration-150 ${
                formData.initiativeScenario === val
                  ? "border-[var(--color-dtg-red)] bg-[var(--color-dtg-paper)]"
                  : "border-[var(--color-dtg-ink)] bg-white hover:bg-[var(--color-dtg-cream)]"
              }`}
            >
              <input
                type="radio"
                name="initiativeScenario"
                value={val}
                checked={formData.initiativeScenario === val}
                onChange={(e) => onChange("initiativeScenario", e.target.value)}
                className="mt-0.5 accent-[var(--color-dtg-red)]"
              />
              <span className="text-sm text-dtg-gray-700">{t(`options.initiative.${val}`)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Referral Source */}
      <div>
        <label htmlFor="referralSource" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
          {t("fields.referralSource")} *
        </label>
        <select
          id="referralSource"
          value={formData.referralSource}
          onChange={(e) => onChange("referralSource", e.target.value)}
          required
          className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
        >
          <option value="">{t("fields.referralSourcePlaceholder")}</option>
          <option value="instagram">{t("options.referral.instagram")}</option>
          <option value="facebook">{t("options.referral.facebook")}</option>
          <option value="linkedin">{t("options.referral.linkedin")}</option>
          <option value="teman">{t("options.referral.teman")}</option>
          <option value="website">{t("options.referral.website")}</option>
          <option value="lainnya">{t("options.referral.lainnya")}</option>
        </select>
      </div>
    </div>
  );
}
