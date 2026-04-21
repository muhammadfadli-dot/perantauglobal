"use client";

import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  url: string;
  whatsappLabel?: string;
  copyLabel?: string;
  copiedLabel?: string;
}

export default function ShareButtons({
  title,
  url,
  whatsappLabel = "Bagikan via WhatsApp",
  copyLabel = "Salin Link",
  copiedLabel = "Tersalin!",
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 border border-[var(--color-dtg-ink)] bg-white px-4 py-2.5 font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-ink)] no-underline transition-colors hover:bg-[var(--color-dtg-cream)]"
      >
        <span className="text-[var(--color-whatsapp)]">●</span>
        {whatsappLabel}
        <span>→</span>
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-3 border border-[var(--color-dtg-ink)] bg-white px-4 py-2.5 font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-ink)] transition-colors hover:bg-[var(--color-dtg-cream)]"
      >
        {copied ? (
          <>
            <span className="text-[var(--color-success)]">✓</span>
            {copiedLabel}
          </>
        ) : (
          <>
            <span className="opacity-60">⎘</span>
            {copyLabel}
          </>
        )}
      </button>
    </div>
  );
}
