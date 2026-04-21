"use client";

type Props = {
  metaLeft: string;
  metaRight: string;
  ctaLabel: string;
  formAnchor: string;
  whatsappUrl: string;
  whatsappLabel?: string;
};

export function MobileStickyCTA({
  metaLeft,
  metaRight,
  ctaLabel,
  formAnchor,
  whatsappUrl,
  whatsappLabel = "WhatsApp",
}: Props) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] text-[var(--color-dtg-cream)] md:hidden"
      style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-between border-b border-[color:rgba(245,240,232,0.15)] px-3.5 py-2 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.14em] text-[color:rgba(245,240,232,0.7)]">
        <span>{metaLeft}</span>
        <span>
          <span className="text-[var(--color-dtg-red)]">●</span> {metaRight}
        </span>
      </div>
      <div className="flex gap-2 px-3 py-2.5">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={whatsappLabel}
          className="grid size-12 shrink-0 place-items-center border border-[var(--color-dtg-cream)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)] no-underline"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.2.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.2-.2-.5-.3zM12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.3A10 10 0 1012 2zm0 18.3c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3a8.3 8.3 0 116.9 3.8z" />
          </svg>
        </a>
        <a
          href={formAnchor}
          className="flex flex-1 items-center justify-between bg-[var(--color-dtg-red)] px-4 py-3 text-sm font-bold text-white no-underline"
        >
          <span>{ctaLabel}</span>
          <span className="font-[family-name:var(--font-mono)]">→</span>
        </a>
      </div>
    </div>
  );
}
