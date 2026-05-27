/**
 * Sticky WhatsApp contact button. Floats bottom-right on every public
 * page — primary contact channel for the PMI audience.
 *
 * Number/link centralized in lib/contact (NEXT_PUBLIC_WA_NUMBER).
 */

import { waLink } from "@/lib/contact";

export function WhatsAppFab() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-50 inline-flex items-center gap-2 px-4 md:px-5 py-3 md:py-4 rounded-full text-white font-bold text-[13px] md:text-sm no-underline transition-all"
      style={{
        background: "var(--pg-wa-green)",
        boxShadow: "var(--shadow-cta-wa)",
      }}
      aria-label="Tanya via WhatsApp"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.4A10 10 0 1012 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.3-.5.1-1.1.1-1.7-.1-.4-.1-1-.3-1.7-.6-2.9-1.3-4.8-4.3-5-4.5-.1-.2-1.2-1.6-1.2-3 0-1.5.8-2.2 1-2.5.3-.3.6-.4.8-.4h.6c.2 0 .5 0 .7.6.3.7.9 2.2 1 2.4.1.2.1.4 0 .6-.1.2-.2.4-.4.5-.2.2-.3.4-.5.6-.2.2-.4.4-.2.7.2.4.9 1.5 1.9 2.4 1.3 1.1 2.4 1.5 2.8 1.6.4.2.6.2.8-.1.2-.2.9-1 1.1-1.4.2-.4.4-.3.7-.2.3.1 2 .9 2.3 1.1.3.2.6.2.6.4.1.2.1.8-.2 1.6z" />
      </svg>
      <span className="hidden sm:inline">Tanya WhatsApp</span>
    </a>
  );
}
