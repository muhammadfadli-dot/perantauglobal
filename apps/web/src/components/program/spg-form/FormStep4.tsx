"use client";

import { MapPin, Briefcase, Heart, User } from "lucide-react";
import type { FormStepProps } from "./types";

export default function FormStep4({ formData, onChange, t }: FormStepProps) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-dtg-black">
          {t("summary.title")}
        </h3>
        <p className="mt-1 text-sm text-dtg-gray-500">{t("summary.subtitle")}</p>
      </div>

      <div className="space-y-3">
        {/* Identity summary */}
        <div className="flex items-start gap-3 border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-paper)] px-4 py-3">
          <User className="mt-0.5 size-4 shrink-0 text-dtg-red" />
          <div className="text-sm">
            <p className="font-semibold text-dtg-gray-700">{formData.fullName}</p>
            <p className="text-dtg-gray-500">{formData.email} &middot; {formData.phone}</p>
          </div>
        </div>

        {/* Location summary */}
        <div className="flex items-start gap-3 border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-paper)] px-4 py-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-dtg-red" />
          <div className="text-sm">
            <p className="text-dtg-gray-700">
              {formData.city}, {t(`provinces.${formData.province}`)}
            </p>
          </div>
        </div>

        {/* Work summary */}
        <div className="flex items-start gap-3 border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-paper)] px-4 py-3">
          <Briefcase className="mt-0.5 size-4 shrink-0 text-dtg-red" />
          <div className="text-sm">
            <p className="text-dtg-gray-700">
              {t(`options.vehicle.${formData.vehicle === "motor-mobil" ? "motorMobil" : formData.vehicle}`)} &middot;{" "}
              {t(`options.availability.${formData.availability === "1-2-minggu" ? "satuDuaMinggu" : formData.availability === "lebih-2-minggu" ? "lebihDuaMinggu" : formData.availability}`)}
            </p>
          </div>
        </div>

        {/* Motivation summary */}
        <div className="flex items-start gap-3 border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-paper)] px-4 py-3">
          <Heart className="mt-0.5 size-4 shrink-0 text-dtg-red" />
          <div className="text-sm">
            <p className="text-dtg-gray-700">
              {t(`options.motivation.${
                formData.motivationReason === "cari-penghasilan-tambahan"
                  ? "penghasilan"
                  : formData.motivationReason === "tertarik-bidang-ketenagakerjaan"
                    ? "ketenagakerjaan"
                    : formData.motivationReason === "ingin-membantu-orang"
                      ? "membantu"
                      : formData.motivationReason === "diajak-teman"
                        ? "teman"
                        : "lainnya"
              }`)}
            </p>
          </div>
        </div>
      </div>

      {/* Briefing Availability */}
      <div>
        <label htmlFor="briefingAvailability" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
          {t("fields.briefingAvailability")} *
        </label>
        <select
          id="briefingAvailability"
          value={formData.briefingAvailability}
          onChange={(e) => onChange("briefingAvailability", e.target.value)}
          required
          className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
        >
          <option value="">{t("fields.briefingAvailabilityPlaceholder")}</option>
          <option value="selasa">{t("options.briefing.selasa")}</option>
          <option value="jumat">{t("options.briefing.jumat")}</option>
          <option value="keduanya">{t("options.briefing.keduanya")}</option>
        </select>
      </div>

      {/* Terms Agreement */}
      <label className="flex cursor-pointer items-start gap-3 border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] px-4 py-3 has-[input:checked]:bg-[var(--color-dtg-ink)] has-[input:checked]:text-[var(--color-dtg-cream)]">
        <input
          type="checkbox"
          checked={formData.agreedTerms}
          onChange={(e) => onChange("agreedTerms", e.target.checked)}
          className="mt-0.5 size-4 accent-[var(--color-dtg-red)]"
        />
        <span className="text-sm text-dtg-gray-700">{t("fields.agreedTerms")}</span>
      </label>
    </div>
  );
}
