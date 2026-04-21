"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { EditorialButton, IllStamp } from "@/components/editorial";
import { trackEvent, generateEventId, getMetaCookies } from "@/lib/tracking";

export default function EditorialContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const eventId = generateEventId("contact");
    const { fbp, fbc } = getMetaCookies();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, eventId, fbp, fbc }),
      });
      if (res.ok) {
        setStatus("success");
        trackEvent("form_submission", { form_name: "contact", form_location: "/kontak" }, eventId);
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
      <div className="border border-[var(--color-dtg-ink)] bg-white p-8 text-center">
        <div className="flex justify-center">
          <IllStamp size={120} label="RECEIVED" />
        </div>
        <p className="mt-4 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[-0.02em]">{t("form.success")}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-red)] underline-offset-4 hover:underline"
        >
          ← Kirim lagi
        </button>
      </div>
    );
  }

  const input =
    "w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]";
  const label =
    "mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 border border-[var(--color-dtg-ink)] bg-white p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={label}>{t("form.name")} <span className="text-[var(--color-dtg-red)]">*</span></span>
          <input type="text" name="name" required className={input} />
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
          <span className={label}>{t("form.subject")} <span className="text-[var(--color-dtg-red)]">*</span></span>
          <select name="subject" required defaultValue="" className={input}>
            <option value="" disabled>— Pilih —</option>
            <option value="general">{t("form.subjects.general")}</option>
            <option value="japan">{t("form.subjects.japan")}</option>
            <option value="middleEast">{t("form.subjects.middleEast")}</option>
            <option value="partnership">{t("form.subjects.partnership")}</option>
            <option value="other">{t("form.subjects.other")}</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className={label}>{t("form.message")} <span className="text-[var(--color-dtg-red)]">*</span></span>
        <textarea name="message" rows={5} required className={input} />
      </label>
      {status === "error" && (
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em] text-[var(--color-dtg-red)]">
          ⚠ Gagal mengirim. Coba lagi atau WhatsApp langsung.
        </p>
      )}
      <EditorialButton
        type="submit"
        variant="ink"
        suffix={status === "loading" ? "…" : "→"}
        fullWidth
        disabled={status === "loading"}
      >
        {status === "loading" ? "Mengirim…" : t("form.submit")}
      </EditorialButton>
    </form>
  );
}
