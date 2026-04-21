"use client";

import type { FormStepProps } from "./types";
import { ALL_PROVINCES } from "./types";

export default function FormStep1({ formData, onChange, t }: FormStepProps) {
  return (
    <div className="space-y-5">
      {/* Name & Phone */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
            {t("fields.fullName")} *
          </label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            required
            className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
            {t("fields.phone")} *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="08xxxxxxxxxx"
            required
            className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
          {t("fields.email")} *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          required
          className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
        />
      </div>

      {/* Province & City */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="province" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
            {t("fields.province")} *
          </label>
          <select
            id="province"
            value={formData.province}
            onChange={(e) => onChange("province", e.target.value)}
            required
            className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
          >
            <option value="">{t("fields.provincePlaceholder")}</option>
            {ALL_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {t(`provinces.${p}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="city" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
            {t("fields.city")} *
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder={t("fields.cityPlaceholder")}
            required
            className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
          />
        </div>
      </div>

      {/* Age & Education */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="age" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
            {t("fields.age")} *
          </label>
          <input
            type="number"
            id="age"
            min={17}
            max={60}
            value={formData.age}
            onChange={(e) => onChange("age", e.target.value)}
            required
            className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
          />
        </div>
        <div>
          <label htmlFor="education" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
            {t("fields.education")} *
          </label>
          <select
            id="education"
            value={formData.education}
            onChange={(e) => onChange("education", e.target.value)}
            required
            className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
          >
            <option value="">{t("fields.educationPlaceholder")}</option>
            <option value="smp">{t("options.education.smp")}</option>
            <option value="sma">{t("options.education.sma")}</option>
            <option value="d3">{t("options.education.d3")}</option>
            <option value="s1">{t("options.education.s1")}</option>
            <option value="s2">{t("options.education.s2")}</option>
          </select>
        </div>
      </div>

      {/* Vehicle */}
      <div>
        <label htmlFor="vehicle" className="mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70">
          {t("fields.vehicle")} *
        </label>
        <select
          id="vehicle"
          value={formData.vehicle}
          onChange={(e) => onChange("vehicle", e.target.value)}
          required
          className="w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]"
        >
          <option value="">{t("fields.vehiclePlaceholder")}</option>
          <option value="motor">{t("options.vehicle.motor")}</option>
          <option value="mobil">{t("options.vehicle.mobil")}</option>
          <option value="motor-mobil">{t("options.vehicle.motorMobil")}</option>
          <option value="tidak">{t("options.vehicle.tidak")}</option>
        </select>
      </div>
    </div>
  );
}
