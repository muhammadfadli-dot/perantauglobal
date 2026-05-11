"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import type { LamaranJourney, LamaranStage } from "@/lib/journey";

interface Props {
  lamaran: LamaranJourney[];
  countryLabel: Record<string, string>;
}

export default function LamaranSwitcher({ lamaran, countryLabel }: Props) {
  const [activeId, setActiveId] = useState<string>(lamaran[0]?.applicationId ?? "");
  const active = lamaran.find((l) => l.applicationId === activeId) ?? lamaran[0];
  if (!active) return null;

  return (
    <>
      {/* Tab strip */}
      <section className="px-5 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
          {lamaran.map((l) => {
            const isActive = l.applicationId === active.applicationId;
            return (
              <button
                key={l.applicationId}
                type="button"
                onClick={() => setActiveId(l.applicationId)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold whitespace-nowrap shrink-0"
                style={
                  isActive
                    ? {
                        background: "var(--pg-ink-primary)",
                        color: "#fff",
                        border: "1px solid var(--pg-ink-primary)",
                        boxShadow: "0 2px 6px rgba(20,20,20,0.20)",
                      }
                    : {
                        background: "var(--pg-white)",
                        color: "var(--pg-ink-primary)",
                        border: "1px solid var(--pg-border)",
                        boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 4px 12px rgba(20,20,20,0.04)",
                      }
                }
              >
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.08em] font-mono"
                  style={{ opacity: 0.7 }}
                >
                  {countryLabel[l.country] ?? l.country}
                </span>
                <span>{l.positionName.split(" — ")[0] ?? l.positionName}</span>
                <UrgencyDot lamaran={l} active={isActive} />
              </button>
            );
          })}
        </div>
      </section>

      {/* Per-lamaran hero */}
      <section className="px-5 pt-3">
        <LamaranHero lamaran={active} countryLabel={countryLabel} />
      </section>
    </>
  );
}

function UrgencyDot({
  lamaran,
  active,
}: {
  lamaran: LamaranJourney;
  active: boolean;
}) {
  if (lamaran.needsDocs) {
    return (
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: active ? "#fde047" : "var(--pg-warn-soft-fg)" }}
      />
    );
  }
  if (lamaran.stage === "diproses") {
    return (
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: active ? "#fde047" : "var(--pg-info)",
          animation: "pg-pulse-mini 1.6s infinite",
        }}
      />
    );
  }
  if (lamaran.stage === "hasil_diterima") {
    return (
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: active ? "#bef264" : "var(--pg-ok-soft-fg)" }}
      />
    );
  }
  return null;
}

function LamaranHero({
  lamaran,
  countryLabel,
}: {
  lamaran: LamaranJourney;
  countryLabel: Record<string, string>;
}) {
  // Stage-aware copy + CTA
  let statusLabel: string;
  let statusText: string;
  let ctaLabel: string;
  let ctaSub: string;
  let ctaHref: string;

  const country = countryLabel[lamaran.country] ?? lamaran.country;

  if (lamaran.needsDocs) {
    statusLabel = "Butuh tindakan kamu";
    statusText = "Ada dokumen wajib yang belum kamu isi. Lengkapi biar lamaran kamu bisa dilanjut tim.";
    ctaLabel = "Lengkapi dokumen";
    ctaSub = "Buka lamaran ini";
    ctaHref = `/applications/${lamaran.applicationId}/lengkapi`;
  } else if (lamaran.stage === "terkirim") {
    statusLabel = "Status sekarang";
    statusText = "Lamaran kamu udah masuk. Tim recruitment lagi cari kandidat untuk batch berikutnya.";
    ctaLabel = "Lihat detail lamaran";
    ctaSub = "Cek riwayat & jawaban kamu";
    ctaHref = `/applications/${lamaran.applicationId}`;
  } else if (lamaran.stage === "diproses") {
    statusLabel = "Status sekarang";
    statusText = "Lamaran kamu lagi ditinjau tim recruitment. Biasanya proses 1–2 minggu.";
    ctaLabel = "Sambil nunggu, siapin diri";
    ctaSub = `Sertifikasi Siap Kerja ${country} · Gratis`;
    ctaHref = "/paspor";
  } else if (lamaran.stage === "hasil_diterima") {
    statusLabel = "Selamat!";
    statusText = "Kamu lolos seleksi. Tim akan kabari proses berikutnya lewat WhatsApp dan email.";
    ctaLabel = "Lihat detail lamaran";
    ctaSub = "Persiapan keberangkatan";
    ctaHref = `/applications/${lamaran.applicationId}`;
  } else {
    // hasil_ditolak
    statusLabel = "Tidak terpilih kali ini";
    statusText = "Sayang sekali, kamu belum terpilih. Tetap semangat — coba posisi lain di Jelajah.";
    ctaLabel = "Cari lowongan lain";
    ctaSub = "Banyak posisi lain yang cocok";
    ctaHref = "/explore";
  }

  return (
    <div
      className="rounded-3xl p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, var(--pg-red-600) 0%, var(--pg-red-700) 100%)",
        color: "white",
        boxShadow:
          "0 8px 24px rgba(215,38,47,0.22), 0 16px 48px rgba(215,38,47,0.12), inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(255,255,255,0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative">
        <div
          className="text-[10px] font-bold uppercase tracking-[0.14em] font-mono"
          style={{ opacity: 0.85 }}
        >
          {country}
        </div>
        <h2 className="text-[22px] font-extrabold tracking-[-0.025em] mt-1 leading-tight">
          {lamaran.positionName}
        </h2>
        <div className="text-[11px] mt-1.5" style={{ opacity: 0.85 }}>
          Dilamar{" "}
          {new Date(lamaran.appliedAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>

        {lamaran.stage !== "hasil_ditolak" && (
          <StepIndicator stage={lamaran.stage} />
        )}

        <div
          className="rounded-2xl px-3.5 py-3 mt-4 mb-3.5"
          style={{
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="text-[10px] font-bold uppercase tracking-[0.12em] font-mono"
            style={{ opacity: 0.85 }}
          >
            {statusLabel}
          </div>
          <div className="text-[13px] font-semibold leading-snug mt-1">{statusText}</div>
        </div>

        <Link
          href={ctaHref}
          className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl no-underline"
          style={{
            background: "rgba(255,255,255,0.95)",
            color: "var(--pg-red-600)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          <div className="leading-tight">
            <div className="text-[14px] font-extrabold">{ctaLabel}</div>
            <div className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--pg-ink-tertiary)" }}>
              {ctaSub}
            </div>
          </div>
          <Icon name="arrow_right" size={16} />
        </Link>
      </div>
    </div>
  );
}

function StepIndicator({ stage }: { stage: LamaranStage }) {
  const steps: { key: "terkirim" | "diproses" | "hasil"; label: string }[] = [
    { key: "terkirim", label: "Terkirim" },
    { key: "diproses", label: "Diproses" },
    { key: "hasil", label: "Hasil" },
  ];
  const fillPctMap: Record<LamaranStage, string> = {
    terkirim: "0%",
    diproses: "50%",
    hasil_diterima: "100%",
    hasil_ditolak: "100%",
  };

  function stateOf(key: string): "done" | "active" | "todo" {
    if (stage === "terkirim") {
      if (key === "terkirim") return "active";
      return "todo";
    }
    if (stage === "diproses") {
      if (key === "terkirim") return "done";
      if (key === "diproses") return "active";
      return "todo";
    }
    // hasil_diterima
    if (key === "hasil") return "active";
    return "done";
  }

  return (
    <div className="grid grid-cols-3 mt-4 relative">
      <div
        className="absolute h-[2px] z-0"
        style={{
          top: "13px",
          left: "16.67%",
          right: "16.67%",
          background: "rgba(255,255,255,0.22)",
        }}
      />
      <div
        className="absolute h-[2px] z-[1]"
        style={{
          top: "13px",
          left: "16.67%",
          width: `calc(66.66% * ${fillPctMap[stage]} / 100%)`,
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 0 8px rgba(255,255,255,0.4)",
        }}
      />
      {steps.map((s) => {
        const state = stateOf(s.key);
        return (
          <div key={s.key} className="z-[2] flex flex-col items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-full grid place-items-center shrink-0"
              style={{
                background:
                  state === "done" || state === "active"
                    ? "rgba(255,255,255,0.95)"
                    : "var(--pg-red-700)",
                border: "2px solid",
                borderColor:
                  state === "done" || state === "active"
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.4)",
                boxShadow: state === "active" ? "0 0 0 6px rgba(255,255,255,0.18)" : "none",
              }}
            >
              {state === "done" && (
                <Icon name="check" size={12} stroke={3} className="text-pg-red-600" />
              )}
              {state === "active" && (
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: "var(--pg-red-600)",
                    animation: "pg-pulse-dot 1.6s ease-in-out infinite",
                  }}
                />
              )}
            </div>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.06em] font-mono text-center"
              style={{ opacity: state === "todo" ? 0.75 : 1 }}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
