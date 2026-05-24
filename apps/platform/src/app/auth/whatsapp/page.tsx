import Link from "next/link";
import { Icon } from "@/components/pg/Icon";

/**
 * WhatsApp OTP entry — placeholder for the auth path that will eventually
 * replace email magic-link as the PRIMARY auth method for PMI candidates
 * (single-device mobile users, scam-fearful, low digital literacy — research
 * shows email round-trip is the biggest friction in the funnel).
 *
 * Phase plan:
 *   - Fase 3 (this commit) — sketch UI + route shell, no live wire
 *   - Follow-up PR — Twilio SMS bridge (WA Business API requires business
 *     verification, longer lead time)
 *   - Subsequent — flip to native WA Business API once cleared
 *
 * For now: button is disabled, copy says "Segera hadir". Email path remains
 * the live default.
 */
export default function WhatsAppAuthPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div
          className="w-full max-w-md bg-pg-white rounded-3xl overflow-hidden"
          style={{ border: "1px solid var(--pg-border)" }}
        >
          {/* Red ribbon */}
          <div
            className="px-7 py-6"
            style={{ background: "var(--pg-red-600)", color: "white" }}
          >
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase opacity-80 font-mono">
              Login Perantau Global
            </div>
            <h1 className="text-[24px] font-extrabold mt-1 leading-[28px]">
              Masuk via WhatsApp
            </h1>
            <p className="text-[13px] mt-1.5 opacity-90 leading-relaxed">
              Kami kirim kode 6-digit ke WhatsApp kamu. Lebih cepat dari email,
              gak perlu pindah aplikasi.
            </p>
          </div>

          <div className="px-7 py-6 grid gap-4">
            <div
              className="px-4 py-3 rounded-xl flex items-start gap-2.5"
              style={{ background: "var(--pg-warn-bg)", color: "var(--pg-warn)" }}
            >
              <Icon name="info" size={14} className="shrink-0 mt-0.5" />
              <div className="text-[12px] leading-relaxed">
                <b>Segera hadir.</b> WhatsApp OTP lagi dipersiapkan — sambil
                menunggu, pakai email untuk login.
              </div>
            </div>

            <label className="block">
              <div className="text-[13px] font-bold text-pg-ink-secondary mb-1.5">
                Nomor WhatsApp
              </div>
              <input
                type="tel"
                inputMode="tel"
                placeholder="08xxxxxxxxxx"
                disabled
                className="w-full bg-pg-ink-50 border-[1.5px] border-pg-ink-200 rounded-lg px-3.5 py-3 text-base text-pg-ink-tertiary cursor-not-allowed"
              />
            </label>

            <button
              type="button"
              disabled
              className="w-full min-h-[48px] px-5 text-base font-bold rounded-xl text-white opacity-50 cursor-not-allowed"
              style={{ background: "var(--pg-red-600)" }}
            >
              Kirim kode via WhatsApp
            </button>

            <div className="text-center pt-2">
              <Link
                href="/auth/sign-in"
                className="text-[13px] font-bold text-pg-red-600 no-underline"
              >
                Atau masuk pakai email →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
