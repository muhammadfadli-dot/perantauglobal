"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  EditorialButton,
  IllStamp,
  Italic,
  MetaStrip,
  MonoLabel,
} from "@/components/editorial";

const WHY_KEYS = ["talent", "compliance", "training", "support"] as const;
const INDUSTRIES = ["hospitality", "manufacturing", "construction", "healthcare", "retail", "other"] as const;

export default function MitraContent() {
  const t = useTranslations("partners");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/employer-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) (e.currentTarget as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    }
  }

  const input =
    "w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]";
  const label =
    "mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70";

  return (
    <>
      {/* Editorial hero */}
      <section className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]">
        <MetaStrip
          left="§ Kemitraan · employer"
          right={<span className="text-[var(--color-dtg-red)]">● 3,400+ PMI ditempatkan · 50+ negara</span>}
          tone="cream"
          border="bottom"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-14 lg:py-20 animate-[slideUp_0.6s_var(--ease-out-expo)]">
          <div className="flex items-center gap-3">
            <span className="block h-[2px] w-9 bg-[var(--color-dtg-red)]" />
            <MonoLabel className="text-[var(--color-dtg-red)] opacity-100" size="sm">
              Mitra employer · Perantau Global
            </MonoLabel>
          </div>
          <DisplayHeadline as="h1" size="hero" className="mt-6 max-w-[22ch]">
            Cari talent{" "}
            <Italic>Indonesia,</Italic>{" "}
            <Accent>sudah terlatih.</Accent>
          </DisplayHeadline>
          <p className="mt-8 max-w-[58ch] text-[clamp(16px,1.6vw,20px)] leading-[1.5] opacity-80">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* § 01 — Kenapa jadi mitra */}
      <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <AsymmetricSectionHeader
            number="01"
            label={t("whyPartner.title")}
            headline={
              <DisplayHeadline size="section">
                Bukan agensi biasa,{" "}
                <Italic>ini</Italic> <Accent>P3MI resmi.</Accent>
              </DisplayHeadline>
            }
          />
          <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] sm:grid-cols-2">
            {WHY_KEYS.map((key, i) => (
              <div key={key} className="bg-white p-8 lg:p-10">
                <div className="font-[family-name:var(--font-display)] text-[clamp(44px,4.5vw,64px)] font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-red)]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-[-0.02em]">
                  {t(`whyPartner.items.${key}.title`)}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.55] opacity-75">
                  {t(`whyPartner.items.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* § 02 — Form inquiry */}
      <section className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <AsymmetricSectionHeader
            number="02"
            label={t("form.title")}
            headline={
              <DisplayHeadline size="section">
                Kirim <Italic>inquiry,</Italic> tim balas <Accent>24 jam.</Accent>
              </DisplayHeadline>
            }
            body="Isi form dengan kebutuhan workforce perusahaanmu. Tim BD kami akan menghubungi dengan sample CV dan dokumentasi lengkap."
          />

          {status === "success" ? (
            <div className="mt-12 border border-[var(--color-dtg-ink)] bg-white p-10 text-center lg:p-14">
              <div className="flex justify-center">
                <IllStamp size={150} label="RECEIVED" />
              </div>
              <p className="mt-6 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.02em]">
                Inquiry diterima
              </p>
              <p className="mt-3 opacity-75">Tim BD akan menghubungi dalam 24 jam.</p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-6 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-red)] underline-offset-4 hover:underline"
              >
                ← Kirim inquiry lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-12 grid gap-5 border border-[var(--color-dtg-ink)] bg-white p-8 lg:p-12">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className={label}>{t("form.companyName")} <span className="text-[var(--color-dtg-red)]">*</span></span>
                  <input type="text" name="companyName" required className={input} />
                </label>
                <label className="block">
                  <span className={label}>{t("form.country")} <span className="text-[var(--color-dtg-red)]">*</span></span>
                  <input type="text" name="country" required className={input} />
                </label>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className={label}>{t("form.contactPerson")} <span className="text-[var(--color-dtg-red)]">*</span></span>
                  <input type="text" name="contactPerson" required className={input} />
                </label>
                <label className="block">
                  <span className={label}>{t("form.email")} <span className="text-[var(--color-dtg-red)]">*</span></span>
                  <input type="email" name="email" required className={input} />
                </label>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className={label}>{t("form.phone")}</span>
                  <input type="tel" name="phone" className={input} />
                </label>
                <label className="block">
                  <span className={label}>{t("form.industry")} <span className="text-[var(--color-dtg-red)]">*</span></span>
                  <select name="industry" required defaultValue="" className={input}>
                    <option value="" disabled>— Pilih —</option>
                    {INDUSTRIES.map((opt) => (
                      <option key={opt} value={opt}>{t(`form.industryOptions.${opt}`)}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className={label}>{t("form.workersNeeded")}</span>
                <input type="text" name="workersNeeded" className={input} />
              </label>
              <label className="block">
                <span className={label}>{t("form.message")}</span>
                <textarea name="message" rows={4} className={input} />
              </label>
              {status === "error" && (
                <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em] text-[var(--color-dtg-red)]">
                  ⚠ Gagal mengirim. Coba lagi atau WhatsApp langsung.
                </p>
              )}
              <EditorialButton type="submit" variant="ink" suffix={status === "loading" ? "…" : "→"} fullWidth disabled={status === "loading"}>
                {status === "loading" ? "Mengirim…" : t("form.submit")}
              </EditorialButton>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
