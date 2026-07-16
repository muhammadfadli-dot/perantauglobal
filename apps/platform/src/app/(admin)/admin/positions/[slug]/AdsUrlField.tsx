"use client";

import { useState } from "react";
import { Icon } from "@/components/pg/Icon";

/**
 * The ads landing URL + a copy button.
 *
 * Client-only because copying is the entire job. The macro braces are shown
 * verbatim on purpose: whoever pastes this into Meta must NOT "helpfully"
 * replace them — Meta expands them per impression, and that is what puts
 * ig/fb/th + the campaign id into candidates.utm_source / utm_campaign.
 */
export function AdsUrlField({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (permissions, insecure context). The URL is
      // right there and selectable, so a failed copy is a non-event.
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="text-[10px] font-bold tracking-[0.1em] uppercase"
        style={{ color: "var(--pg-ink-tertiary)" }}
      >
        URL buat dipasang di iklan
      </div>
      <div className="flex items-stretch gap-2">
        <code
          className="flex-1 min-w-0 px-3 py-2 rounded-lg text-[11px] leading-[16px] break-all"
          style={{
            background: "var(--pg-ink-50, #f6f5f3)",
            border: "1px solid var(--pg-border-soft)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {url}
        </code>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 px-3 rounded-lg text-[12px] font-bold shrink-0"
          style={{
            background: copied ? "var(--pg-ok-soft-bg)" : "var(--pg-white)",
            color: copied ? "var(--pg-ok)" : "var(--pg-ink-primary)",
            border: "1px solid var(--pg-border)",
          }}
        >
          <Icon name={copied ? "check" : "doc_check"} size={12} stroke={2.4} />
          {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <div className="text-[11px] leading-[15px]" style={{ color: "var(--pg-ink-tertiary)" }}>
        Bagian <code style={{ fontFamily: "var(--font-mono)" }}>{"{{...}}"}</code> itu
        macro Meta — biarkan apa adanya, Meta yang isi otomatis per tayangan. Itu
        yang bikin lead-nya kebaca sumber &amp; campaign-nya di CRM.
      </div>
    </div>
  );
}
