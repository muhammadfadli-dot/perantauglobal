"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trackEvent, generateEventId, getMetaCookies } from "@/lib/tracking";
import { supabaseBrowserV2 } from "@/lib/supabase-browser-v2";
import {
  Accent,
  DisplayHeadline,
  EditorialButton,
  IllStamp,
  Italic,
  MonoLabel,
  SectionTag,
} from "@/components/editorial";

const educationOptions = ["sma", "d3", "s1", "s2", "other"] as const;
const currentStatusOptions = ["fresh_grad", "working", "lpk_student", "job_seeker"] as const;
const interestedCountryOptions = ["japan", "saudi", "taiwan", "undecided"] as const;
const hasLPKOptions = ["yes", "no"] as const;

export default function GTHForm() {
  const t = useTranslations("program.gth.form");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      fullName: formData.get("fullName") as string,
      whatsapp: formData.get("whatsapp") as string,
      email: formData.get("email") as string,
      city: formData.get("city") as string,
      education: formData.get("education") as string,
      currentStatus: formData.get("currentStatus") as string,
      interestedCountry: formData.get("interestedCountry") as string,
      hasLPK: formData.get("hasLPK") as string,
    };
    const eventId = generateEventId("global_talent_hub");
    const { fbp, fbc } = getMetaCookies();
    try {
      const res = await fetch("/api/program/global-talent-hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, eventId, fbp, fbc }),
      });
      if (res.ok) {
        setStatus("success");
        trackEvent("form_submission", { form_name: "global_talent_hub", form_location: "/program/global-talent-hub" }, eventId);
        try {
          const sb = supabaseBrowserV2();
          const redirectTo = `${window.location.origin}/auth/callback`;
          sb.auth
            .signInWithOtp({
              email: data.email,
              options: { shouldCreateUser: true, emailRedirectTo: redirectTo },
            })
            .then(({ error }) => {
              if (error) console.warn("[magic-link]", error.message);
            });
        } catch (err) {
          console.warn("[magic-link] skipped:", err);
        }
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section
        id="registration-form"
        className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:py-24"
      >
        <div className="mx-auto max-w-[700px] text-center">
          <div className="flex justify-center">
            <IllStamp size={160} label="RECEIVED" />
          </div>
          <DisplayHeadline size="sidebar" className="mt-8">
            {t("successTitle")}
          </DisplayHeadline>
          <p className="mt-6 text-lg leading-[1.5] opacity-80">{t("successMessage")}</p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-8 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-red)] underline-offset-4 hover:underline"
          >
            ← {t("submitAnother")}
          </button>
        </div>
      </section>
    );
  }

  const input =
    "w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]";
  const label =
    "mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70";

  return (
    <section
      id="registration-form"
      className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
        <aside>
          <SectionTag number="05" label="Form pendaftaran GTH" />
          <DisplayHeadline size="sidebar" className="mt-4">
            Mulai{" "}
            <Italic>gratis</Italic>,{" "}
            <Accent>dalam 4 menit.</Accent>
          </DisplayHeadline>
          <p className="mt-6 text-[15px] leading-[1.55] opacity-75">{t("subtitle")}</p>
          <div className="mt-6 border border-[var(--color-dtg-ink)] bg-white p-4 font-[family-name:var(--font-mono)] text-[13px] leading-[1.5]">
            ⚠ {t("trustNote")}
          </div>
          <MonoLabel className="mt-6 block opacity-60">100% gratis · sertifikat GTR</MonoLabel>
        </aside>

        <form onSubmit={handleSubmit} className="grid gap-5 border border-[var(--color-dtg-ink)] bg-white p-8 lg:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={label}>{t("fullName")} <span className="text-[var(--color-dtg-red)]">*</span></span>
              <input type="text" name="fullName" required className={input} />
            </label>
            <label className="block">
              <span className={label}>{t("whatsapp")} <span className="text-[var(--color-dtg-red)]">*</span></span>
              <input type="tel" name="whatsapp" required className={input} />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={label}>{t("email")} <span className="text-[var(--color-dtg-red)]">*</span></span>
              <input type="email" name="email" required className={input} />
            </label>
            <label className="block">
              <span className={label}>{t("city")} <span className="text-[var(--color-dtg-red)]">*</span></span>
              <input type="text" name="city" required className={input} />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={label}>{t("education")} <span className="text-[var(--color-dtg-red)]">*</span></span>
              <select name="education" required defaultValue="" className={input}>
                <option value="" disabled>— Pilih —</option>
                {educationOptions.map((opt) => (
                  <option key={opt} value={opt}>{t(`educationOptions.${opt}`)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={label}>{t("currentStatus")} <span className="text-[var(--color-dtg-red)]">*</span></span>
              <select name="currentStatus" required defaultValue="" className={input}>
                <option value="" disabled>— Pilih —</option>
                {currentStatusOptions.map((opt) => (
                  <option key={opt} value={opt}>{t(`currentStatusOptions.${opt}`)}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={label}>{t("interestedCountry")} <span className="text-[var(--color-dtg-red)]">*</span></span>
              <select name="interestedCountry" required defaultValue="" className={input}>
                <option value="" disabled>— Pilih —</option>
                {interestedCountryOptions.map((opt) => (
                  <option key={opt} value={opt}>{t(`interestedCountryOptions.${opt}`)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={label}>{t("hasLPK")} <span className="text-[var(--color-dtg-red)]">*</span></span>
              <select name="hasLPK" required defaultValue="" className={input}>
                <option value="" disabled>— Pilih —</option>
                {hasLPKOptions.map((opt) => (
                  <option key={opt} value={opt}>{t(`hasLPKOptions.${opt}`)}</option>
                ))}
              </select>
            </label>
          </div>

          {status === "error" && (
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em] text-[var(--color-dtg-red)]">
              ⚠ {t("error")}
            </p>
          )}

          <EditorialButton
            type="submit"
            variant="ink"
            suffix={status === "loading" ? "…" : "→"}
            fullWidth
            disabled={status === "loading"}
          >
            {status === "loading" ? "Mengirim…" : t("submit")}
          </EditorialButton>

          <p className="text-[12px] leading-[1.5] opacity-60">
            {t("trustNote")}
          </p>
        </form>
      </div>
    </section>
  );
}
