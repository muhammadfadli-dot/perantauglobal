"use client";

import { useCallback, useState } from "react";
import { Icon } from "@/components/pg/Icon";

/**
 * Trust block + share strip — combined section to close the detail page
 * before the FinalCTA. Trust card reaffirms P3MI license; share row gives
 * WhatsApp / Telegram / Copy-link buttons.
 */
export function TrustAndShare({
  role,
  country,
  salary,
}: {
  role: string;
  country: string;
  salary: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard API blocked — ignore */
    }
  }, []);

  // Build share URLs from the current page URL (only on client)
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Lowongan ${role} ${country} — gaji ${salary}, resmi P3MI. Cek di Perantau Global.`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + pageUrl)}`;
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`;

  return (
    <section id="share" className="px-5 md:px-8 py-12 md:py-14 bg-pg-white border-t border-pg-ink-100">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Trust card */}
        <div
          className="flex flex-col gap-2 p-5 md:p-6 rounded-2xl"
          style={{
            background: "var(--pg-ok-bg)",
            border: "1px solid rgba(15,138,74,0.18)",
          }}
        >
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-pg-ok">
            Lowongan ini resmi
          </span>
          <div className="text-[16px] md:text-[18px] font-extrabold text-pg-ink-900 tracking-[-0.015em]">
            P3MI Kemnaker · No. 1810240237512001
          </div>
          <p className="text-[13px] md:text-[14px] text-pg-ink-700 leading-relaxed max-w-[60ch]">
            Dijalankan PT Daya Talenta Global — unit penempatan kerja luar negeri dari
            DayaLima Group, sejak 1998. Bukan janji calo.
          </p>
        </div>

        {/* Share strip */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 md:p-6 rounded-2xl bg-pg-paper border border-pg-ink-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-extrabold text-pg-ink-900 tracking-[-0.01em]">
              Bagikan posisi ini ke teman
            </span>
            <span className="text-[13px] text-pg-ink-500">
              Mungkin ada yang cocok dengan posisi ini.
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-[12.5px] text-white no-underline transition-transform hover:-translate-y-0.5"
              style={{ background: "#25D366" }}
            >
              <span
                aria-hidden
                className="inline-block w-2 h-2 rounded-full bg-white"
              />
              WhatsApp
            </a>
            <a
              href={tgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-pg-info-bg text-pg-info font-bold text-[12.5px] no-underline transition-transform hover:-translate-y-0.5"
            >
              <span aria-hidden className="inline-block w-2 h-2 rounded-full bg-pg-info" />
              Telegram
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-pg-white border border-pg-ink-200 text-pg-ink-900 font-bold text-[12.5px] transition-all hover:border-pg-ink-300 hover:-translate-y-0.5"
            >
              <Icon name="share" size={12} stroke={2.4} />
              {copied ? "Tersalin ✓" : "Salin link"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
