"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { User, GraduationCap, FileText, MessageCircle } from "lucide-react";
import { trackEvent, generateEventId, getMetaCookies } from "@/lib/tracking";
import {
  Accent,
  DisplayHeadline,
  EditorialButton,
  IllStamp,
  Italic,
  MonoLabel,
  SectionTag,
} from "@/components/editorial";

const STEPS = [
  { key: "step1", icon: User },
  { key: "step2", icon: GraduationCap },
  { key: "step3", icon: FileText },
] as const;

export default function RegisterForm() {
  const t = useTranslations("register");
  const tc = useTranslations("common");
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const input =
    "w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]";
  const label =
    "mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70";

  if (submitted) {
    return (
      <section className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:py-24">
        <div className="mx-auto max-w-[700px] text-center">
          <div className="flex justify-center">
            <IllStamp size={180} label="RECEIVED" />
          </div>
          <DisplayHeadline size="sidebar" className="mt-8">
            Pendaftaran{" "}
            <Accent>diterima.</Accent>
          </DisplayHeadline>
          <p className="mt-6 text-lg leading-[1.5] opacity-80">{t("form.success")}</p>
          <div className="mt-8 flex justify-center">
            <EditorialButton href={tc("whatsAppUrl")} variant="ink" suffix="→" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" /> {tc("contactWhatsApp")}
            </EditorialButton>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Step indicator */}
      <section className="border-b border-[var(--color-dtg-ink)] bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-2 px-6 py-5">
          {STEPS.map(({ key, icon: Icon }, i) => {
            const isCurrent = i === step;
            const isDone = i < step;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStep(i)}
                className={
                  "inline-flex items-center gap-2 border px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] transition-colors " +
                  (isCurrent
                    ? "border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] text-[var(--color-dtg-cream)]"
                    : isDone
                    ? "border-[var(--color-dtg-red)] bg-[var(--color-dtg-red)] text-white"
                    : "border-[var(--color-dtg-ink)] bg-white text-[var(--color-dtg-ink)] hover:bg-[var(--color-dtg-cream)]")
                }
              >
                <Icon className="size-3.5" />
                {String(i + 1).padStart(2, "0")} · {t(`form.${key}`)}
              </button>
            );
          })}
        </div>
      </section>

      {/* Form section */}
      <section className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
          <aside>
            <SectionTag number={String(step + 1).padStart(2, "0")} label={`${STEPS[step].key} · ${t(`form.${STEPS[step].key}`)}`} />
            <DisplayHeadline size="sidebar" className="mt-4">
              Langkah{" "}
              <Italic>{step + 1}</Italic>{" "}
              <Accent>dari {STEPS.length}.</Accent>
            </DisplayHeadline>
            <p className="mt-6 text-[15px] leading-[1.55] opacity-75">
              {step === 0 && "Data pribadi kamu. Pastikan sesuai KTP."}
              {step === 1 && "Latar belakang pendidikan & pengalaman kerja."}
              {step === 2 && "Preferensi penempatan dan persiapan bahasa."}
            </p>
            <MonoLabel className="mt-6 block opacity-60">
              {STEPS.length - step - 1 === 0 ? "Langkah terakhir" : `${STEPS.length - step - 1} langkah lagi`}
            </MonoLabel>
          </aside>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (step < 2) {
                setStep(step + 1);
              } else {
                const form = e.currentTarget;
                const data = Object.fromEntries(new FormData(form));
                const eventId = generateEventId("register");
                const { fbp, fbc } = getMetaCookies();
                try {
                  await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...data, eventId, fbp, fbc }),
                  });
                } catch {
                  /* handled by success state */
                }
                trackEvent("form_submission", { form_name: "register", form_location: "/daftar" }, eventId);
                setSubmitted(true);
              }
            }}
            className="border border-[var(--color-dtg-ink)] bg-white p-8 lg:p-10"
          >
            {step === 0 && (
              <div className="grid gap-5">
                <label className="block">
                  <span className={label}>{t("form.fullName")} <span className="text-[var(--color-dtg-red)]">*</span></span>
                  <input type="text" name="fullName" required className={input} />
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className={label}>{t("form.email")} <span className="text-[var(--color-dtg-red)]">*</span></span>
                    <input type="email" name="email" required className={input} />
                  </label>
                  <label className="block">
                    <span className={label}>{t("form.phone")} <span className="text-[var(--color-dtg-red)]">*</span></span>
                    <input type="tel" name="phone" required className={input} />
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className={label}>{t("form.birthDate")} <span className="text-[var(--color-dtg-red)]">*</span></span>
                    <input type="date" name="birthDate" required className={input} />
                  </label>
                  <label className="block">
                    <span className={label}>{t("form.gender")} <span className="text-[var(--color-dtg-red)]">*</span></span>
                    <select name="gender" required defaultValue="" className={input}>
                      <option value="" disabled>— Pilih —</option>
                      <option value="male">{t("form.genderOptions.male")}</option>
                      <option value="female">{t("form.genderOptions.female")}</option>
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className={label}>{t("form.address")} <span className="text-[var(--color-dtg-red)]">*</span></span>
                  <textarea name="address" rows={2} required className={input} />
                </label>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-5">
                <label className="block">
                  <span className={label}>{t("form.education")} <span className="text-[var(--color-dtg-red)]">*</span></span>
                  <select name="education" required defaultValue="" className={input}>
                    <option value="" disabled>— Pilih —</option>
                    {(["smp", "sma", "d3", "s1", "s2"] as const).map((opt) => (
                      <option key={opt} value={opt}>{t(`form.educationOptions.${opt}`)}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={label}>{t("form.major")}</span>
                  <input type="text" name="major" className={input} />
                </label>
                <label className="block">
                  <span className={label}>{t("form.experience")} <span className="text-[var(--color-dtg-red)]">*</span></span>
                  <select name="experience" required defaultValue="" className={input}>
                    <option value="" disabled>— Pilih —</option>
                    {(["none", "less1", "1to3", "3to5", "more5"] as const).map((opt) => (
                      <option key={opt} value={opt}>{t(`form.experienceOptions.${opt}`)}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={label}>{t("form.skills")}</span>
                  <input type="text" name="skills" className={input} />
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-5">
                <label className="block">
                  <span className={label}>{t("form.destination")} <span className="text-[var(--color-dtg-red)]">*</span></span>
                  <select name="destination" required defaultValue="" className={input}>
                    <option value="" disabled>— Pilih —</option>
                    {(["japan", "saudi", "uae", "qatar", "kuwait", "any"] as const).map((opt) => (
                      <option key={opt} value={opt}>{t(`form.destinationOptions.${opt}`)}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={label}>{t("form.language")}</span>
                  <select name="language" defaultValue="" className={input}>
                    <option value="" disabled>— Pilih —</option>
                    {(["none", "japanese", "english", "arabic", "other"] as const).map((opt) => (
                      <option key={opt} value={opt}>{t(`form.languageOptions.${opt}`)}</option>
                    ))}
                  </select>
                </label>
                <div>
                  <span className={label}>{t("form.hasPassport")}</span>
                  <div className="mt-1 flex gap-3">
                    {(["yes", "no"] as const).map((v) => (
                      <label key={v} className="inline-flex cursor-pointer items-center gap-2 border border-[var(--color-dtg-ink)] px-4 py-2 text-[14px] font-medium transition-colors has-[input:checked]:bg-[var(--color-dtg-ink)] has-[input:checked]:text-[var(--color-dtg-cream)]">
                        <input type="radio" name="hasPassport" value={v} defaultChecked={v === "no"} className="sr-only" />
                        {t(`form.${v}`)}
                      </label>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className={label}>{t("form.motivation")}</span>
                  <textarea name="motivation" rows={3} className={input} />
                </label>
                <p className="font-[family-name:var(--font-mono)] text-[11px] leading-[1.5] uppercase tracking-[0.08em] opacity-60">
                  {t("form.agreement")}
                </p>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--color-dtg-ink)] pt-6">
              {step > 0 ? (
                <EditorialButton
                  type="button"
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  suffix={null}
                  size="sm"
                >
                  ← {t("form.back")}
                </EditorialButton>
              ) : (
                <div />
              )}
              <EditorialButton type="submit" variant="ink" suffix="→">
                {step < 2 ? t("form.next") : t("form.submit")}
              </EditorialButton>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
