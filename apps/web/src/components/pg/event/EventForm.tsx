"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, Input, Select } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";
import { EventAccountUpsell } from "@/components/pg/event/EventAccountUpsell";
import { generateEventId, getMetaCookies, trackEvent } from "@/lib/tracking";

const DEFAULT_PROFESSIONS = [
  "Perawat",
  "Bidan",
  "Mahasiswa keperawatan / kebidanan",
  "Tenaga kesehatan lainnya",
  "Lainnya",
];

type Status = "idle" | "submitting" | "success" | "error";

function readUtm(): Record<string, string | undefined> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    source: p.get("utm_source") ?? undefined,
    medium: p.get("utm_medium") ?? undefined,
    campaign: p.get("utm_campaign") ?? undefined,
    content: p.get("utm_content") ?? undefined,
    term: p.get("utm_term") ?? undefined,
  };
}

export function EventForm({
  eventSlug,
  eventTitle,
  joinUrl: initialJoinUrl,
  professionLabel = "Profesi",
  professionOptions,
  interestLabel = "Negara/posisi yang diminati",
  interestOptions,
  note,
}: {
  eventSlug: string;
  eventTitle: string;
  joinUrl: string | null;
  professionLabel?: string;
  professionOptions?: string[];
  interestLabel?: string;
  interestOptions?: string[];
  note?: string;
}) {
  const professions =
    professionOptions && professionOptions.length > 0
      ? professionOptions
      : DEFAULT_PROFESSIONS;
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [joinUrl, setJoinUrl] = useState<string | null>(initialJoinUrl);
  const [duplicate, setDuplicate] = useState(false);
  const [submitted, setSubmitted] = useState<{
    full_name: string;
    whatsapp: string;
    email: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setError(null);

    const fd = new FormData(e.currentTarget);
    const full_name = String(fd.get("full_name") || "").trim();
    const whatsapp = String(fd.get("whatsapp") || "").trim();
    const email = String(fd.get("email") || "").trim();

    if (!full_name || !whatsapp || !email) {
      setError("Nama, WhatsApp, dan email wajib diisi.");
      setStatus("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email belum benar.");
      setStatus("error");
      return;
    }

    setStatus("submitting");

    const { fbp, fbc } = getMetaCookies();
    const eventId = generateEventId("evt");
    const utm = readUtm();

    // Browser pixel (GTM dataLayer) fires the same eventId for dedup with CAPI.
    trackEvent(
      "CompleteRegistration",
      { content_name: `event_${eventSlug}`, content_category: "event" },
      eventId,
    );

    try {
      const res = await fetch(`/api/event/${eventSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name,
          whatsapp,
          email,
          city: String(fd.get("city") || "").trim() || undefined,
          profession: String(fd.get("profession") || "").trim() || undefined,
          interest: String(fd.get("interest") || "").trim() || undefined,
          consent_marketing: fd.get("consent_marketing") === "on",
          website: String(fd.get("website") || ""), // honeypot
          source_url: typeof window !== "undefined" ? window.location.href : undefined,
          utm,
          eventId,
          fbp,
          fbc,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        joinUrl?: string | null;
        error?: string;
        duplicate?: boolean;
      };

      if (!res.ok || !data.success) {
        setError(data.error || "Gagal mendaftar. Coba lagi sebentar.");
        setStatus("error");
        return;
      }

      if (data.joinUrl) setJoinUrl(data.joinUrl);
      setDuplicate(data.duplicate === true);
      setSubmitted({ full_name, whatsapp, email });
      setStatus("success");
    } catch {
      setError("Koneksi bermasalah. Coba lagi sebentar.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <span
          className="w-14 h-14 rounded-full grid place-items-center"
          style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
        >
          <Icon name="check" size={28} stroke={3} />
        </span>
        <h3 className="mt-4 text-[20px] font-extrabold text-pg-ink-900">
          {duplicate ? "Kamu sudah terdaftar ✓" : "Pendaftaran berhasil!"}
        </h3>
        <p className="mt-2 text-[14px] text-pg-ink-600 leading-relaxed max-w-sm">
          {duplicate ? (
            <>Kamu sudah terdaftar di <strong>{eventTitle}</strong>. Nggak perlu daftar
            lagi — pastikan WhatsApp &amp; email kamu aktif ya.</>
          ) : (
            <>Sampai jumpa di <strong>{eventTitle}</strong>. Menjelang acara, link Zoom
            &amp; pengingat kami kirim ke WhatsApp dan email kamu — dari kontak resmi
            Perantau Global. Pastikan WhatsApp kamu aktif ya.</>
          )}
        </p>
        {joinUrl && (
          <a
            href={joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl font-bold text-white bg-pg-red-600 hover:bg-pg-red-700 no-underline"
          >
            <Icon name="zoom" size={18} /> Buka link Zoom
          </a>
        )}
        {submitted && (
          <EventAccountUpsell eventSlug={eventSlug} prefill={submitted} />
        )}

        <Link
          href="/lowongan"
          className="mt-4 text-[13px] font-semibold text-pg-red-700 hover:text-pg-red-800 no-underline"
        >
          Sambil nunggu, lihat lowongan ke luar negeri →
        </Link>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Honeypot: off-screen (not display:none, which bots skip). Humans never fill it. */}
      <div aria-hidden className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <h3 className="text-[18px] md:text-[20px] font-extrabold text-pg-ink-900">
          Daftar Sekarang
        </h3>
        <p className="text-[13px] text-pg-ink-500 mt-1">
          Gratis. Cukup 30 detik.
        </p>
        {note && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold"
            style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}>
            <Icon name="shield" size={13} /> {note}
          </div>
        )}
      </div>

      <Field label="Nama lengkap" required htmlFor="full_name">
        <Input id="full_name" name="full_name" autoComplete="name" placeholder="Nama sesuai KTP" required />
      </Field>

      <Field label="Nomor WhatsApp" required htmlFor="whatsapp" helper="Pengingat & link Zoom dikirim ke sini.">
        <Input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="08xxxxxxxxxx"
          required
        />
      </Field>

      <Field label="Email" required htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="email@kamu.com" required />
      </Field>

      <Field label={professionLabel} htmlFor="profession">
        <Select id="profession" name="profession" defaultValue="">
          <option value="" disabled>
            Pilih salah satu
          </option>
          {professions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={interestLabel} htmlFor="interest" helper="Opsional — bantu kami kasih info yang relevan.">
        {interestOptions && interestOptions.length > 0 ? (
          <Select id="interest" name="interest" defaultValue="">
            <option value="" disabled>
              Pilih salah satu
            </option>
            {interestOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        ) : (
          <Input id="interest" name="interest" placeholder="mis. Perawat Saudi Arabia" />
        )}
      </Field>

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          name="consent_marketing"
          className="mt-1 w-4 h-4 accent-[var(--pg-red-600)] shrink-0"
        />
        <span className="text-[12.5px] text-pg-ink-600 leading-relaxed">
          Saya bersedia dihubungi Perantau Global soal peluang kerja ke luar negeri.
        </span>
      </label>

      {error && (
        <div
          className="flex gap-2 items-start px-3.5 py-2.5 rounded-xl text-[13px]"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
        >
          <Icon name="warn" size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 min-h-[54px] px-7 rounded-2xl font-extrabold text-[16px] md:text-[17px] text-white bg-pg-red-600 hover:bg-pg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full"
      >
        {submitting ? (
          "Mendaftarkan…"
        ) : (
          <>
            Daftar gratis <Icon name="arrow_right" size={18} />
          </>
        )}
      </button>

      <p className="text-[11px] text-pg-ink-400 text-center leading-relaxed">
        Data kamu aman &amp; hanya dipakai untuk acara ini sesuai kebijakan privasi Perantau Global.
      </p>
    </form>
  );
}
