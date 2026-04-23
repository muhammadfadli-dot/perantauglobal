"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Accent,
  DisplayHeadline,
  EditorialButton,
  IllStamp,
  SectionTag,
} from "@/components/editorial";
import { trackEvent, generateEventId, getMetaCookies } from "@/lib/tracking";
import { supabaseBrowserV2 } from "@/lib/supabase-browser-v2";

interface LowonganFormProps {
  /** Role-level namespace, e.g. "lowongan.perawat-saudi-arabia". */
  namespace: string;
  apiEndpoint: string;
  role: string;
  country: string;
}

type Headline = { lead: string; accent?: string };

/**
 * Bio-only registration form (Phase C+). Candidates enter the talent pool
 * with minimal fields; they complete per-position credentials on
 * app.perantauglobal.com/profile after verifying the magic-link.
 */
export default function LowonganForm({
  namespace,
  apiEndpoint,
  role,
  country,
}: LowonganFormProps) {
  const t = useTranslations(namespace);
  const tForm = useTranslations(`${namespace}.form`);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submittedName, setSubmittedName] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [refNumber, setRefNumber] = useState("");

  const editTag = t("editorial.form.tag");
  const editHeadline = t.raw("editorial.form.headline") as Headline;
  const editSubtitle = t("editorial.form.subtitle");
  const antiscamNotice = t("editorial.form.antiscamNotice");
  const successHeadline = t.raw("editorial.form.successHeadline") as Headline;
  const successBodyTemplate = t.raw("editorial.form.successBody") as string;
  const refPrefix = t("editorial.form.refPrefix");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const sharedData = {
      full_name: formData.get("fullName") as string,
      whatsapp: formData.get("whatsapp") as string,
      email: formData.get("email") as string,
      city: formData.get("city") as string,
      birth_date: (formData.get("birthDate") as string) || null,
      gender: (formData.get("gender") as string) || null,
      education: formData.get("education") as string,
    };

    const eventId = generateEventId(`lowongan_${role}`);
    const { fbp, fbc } = getMetaCookies();

    // Bio-only payload. Per-position credentials collected in the portal
    // at app.perantauglobal.com/profile after magic-link verification.
    const payload = {
      ...sharedData,
      role,
      country,
      source_url: window.location.href,
      role_data: {},
      eventId,
      fbp,
      fbc,
    };

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmittedName(sharedData.full_name);
        setSubmittedPhone(sharedData.whatsapp);
        setRefNumber(String(Math.floor(1000 + Math.random() * 9000)));
        setStatus("success");
        trackEvent(
          "form_submission",
          { form_name: `lowongan_${role}`, form_location: window.location.pathname },
          eventId,
        );
        // Fire magic-link email. Non-blocking: shadow flow — if env missing
        // or rate-limited, success state still renders from legacy path.
        try {
          const sb = supabaseBrowserV2();
          const platformBase =
            process.env.NEXT_PUBLIC_PLATFORM_URL || window.location.origin;
          const redirectTo = `${platformBase}/auth/confirm`;
          sb.auth
            .signInWithOtp({
              email: sharedData.email,
              options: {
                shouldCreateUser: true,
                emailRedirectTo: redirectTo,
              },
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
    const body = successBodyTemplate
      .replace("{name}", submittedName)
      .replace("{phone}", submittedPhone);
    return (
      <section
        id="form"
        className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:py-24"
      >
        <div className="mx-auto max-w-[700px] text-center">
          <div className="flex justify-center">
            <IllStamp size={180} label="RECEIVED" />
          </div>
          <DisplayHeadline size="sidebar" className="mt-8">
            {successHeadline.lead}
            {successHeadline.accent && (
              <>
                <br />
                <Accent>{successHeadline.accent}</Accent>
              </>
            )}
          </DisplayHeadline>
          <p className="mt-6 text-lg leading-[1.5] opacity-80">{body}</p>
          <p className="mt-4 border-l-2 border-[var(--color-dtg-red)] bg-[var(--color-dtg-red)]/5 px-4 py-3 text-left text-sm leading-[1.5]">
            📩 Kami juga kirim <strong>tautan verifikasi</strong> ke email
            kamu. Klik tautan itu supaya akun kandidat kamu aktif dan data
            tersimpan di sistem kami.
          </p>
          <p className="mt-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em] opacity-60">
            {refPrefix}
            {refNumber} · {new Date().toLocaleDateString("id-ID")}
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-8 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-red)] underline-offset-4 hover:underline"
          >
            ← {tForm("submitAnother")}
          </button>
        </div>
      </section>
    );
  }

  const inputClass =
    "w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]";
  const labelClass =
    "mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70";

  const educationOptions = ["sma", "d3", "s1", "s2"] as const;
  const genderOptions = ["male", "female"] as const;

  function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
      <div className={labelClass}>
        {children}
        {required && <span className="ml-1 text-[var(--color-dtg-red)]">*</span>}
      </div>
    );
  }

  return (
    <section
      id="form"
      className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
        <aside>
          <SectionTag number="06" label={editTag} />
          <DisplayHeadline size="sidebar" className="mt-4">
            {editHeadline.lead}
            {editHeadline.accent && (
              <>
                <br />
                <Accent>{editHeadline.accent}</Accent>
              </>
            )}
          </DisplayHeadline>
          <p className="mt-6 text-[15px] leading-[1.55] opacity-75">{editSubtitle}</p>
          <div className="mt-6 border border-[var(--color-dtg-ink)] bg-white p-4 font-[family-name:var(--font-mono)] text-[13px] leading-[1.5]">
            {antiscamNotice}
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="border border-[var(--color-dtg-ink)] bg-white p-8">
          <div className="grid gap-5">
            <label className="block">
              <FieldLabel required>{tForm("fullName")}</FieldLabel>
              <input type="text" name="fullName" required className={inputClass} placeholder="Maya Sari" />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <FieldLabel required>{tForm("email")}</FieldLabel>
                <input type="email" name="email" required className={inputClass} placeholder="maya@email.com" />
              </label>
              <label className="block">
                <FieldLabel required>{tForm("whatsapp")}</FieldLabel>
                <input type="tel" name="whatsapp" required className={inputClass} placeholder="+62 812 …" />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <FieldLabel required>{tForm("city")}</FieldLabel>
                <input type="text" name="city" required className={inputClass} />
              </label>
              <label className="block">
                <FieldLabel>{tForm("birthDate")}</FieldLabel>
                <input type="date" name="birthDate" className={inputClass} />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <FieldLabel>{tForm("gender")}</FieldLabel>
                <select name="gender" defaultValue="" className={inputClass}>
                  <option value="">— Pilih —</option>
                  {genderOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {tForm(`genderOptions.${opt}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <FieldLabel required>{tForm("education")}</FieldLabel>
                <select name="education" required defaultValue="" className={inputClass}>
                  <option value="" disabled>
                    — Pilih —
                  </option>
                  {educationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {tForm(`educationOptions.${opt}`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

          </div>

          {status === "error" && (
            <p className="mt-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em] text-[var(--color-dtg-red)]">
              ⚠ {tForm("error")}
            </p>
          )}

          <div className="mt-8">
            <EditorialButton
              type="submit"
              variant="ink"
              suffix={status === "loading" ? "…" : "→"}
              fullWidth
              disabled={status === "loading"}
            >
              {status === "loading" ? "Mengirim…" : tForm("submit")}
            </EditorialButton>
          </div>

          <p className="mt-4 text-[12px] leading-[1.5] opacity-60">
            {tForm("trustNote")}
          </p>
        </form>
      </div>
    </section>
  );
}
