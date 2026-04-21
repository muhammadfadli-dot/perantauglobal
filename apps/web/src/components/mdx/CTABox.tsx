import type { ReactNode } from "react";

export default function CTABox({
  title,
  description,
  buttonText,
  href,
  variant = "primary",
}: {
  title: string;
  description?: string;
  buttonText: string;
  href?: string;
  variant?: "primary" | "whatsapp";
  children?: ReactNode;
}) {
  const isPrimary = variant === "primary";
  const bg = isPrimary ? "var(--color-dtg-red)" : "var(--color-whatsapp)";
  const suffix = isPrimary ? "→" : "→";

  return (
    <div className="not-prose my-10 border border-[var(--color-dtg-ink)]" style={{ background: bg }}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:rgba(255,255,255,0.25)] px-5 py-2.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-white">
        <span>§ Next step</span>
        <span className="opacity-80">{isPrimary ? "Primary CTA" : "WhatsApp CTA"}</span>
      </div>
      <div className="grid gap-6 p-6 text-white md:grid-cols-[1.4fr_auto] md:items-end md:gap-10 md:p-10">
        <div>
          <p className="font-[family-name:var(--font-display)] text-[clamp(22px,3vw,36px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-balance">
            {title}
          </p>
          {description && (
            <p className="mt-3 max-w-[55ch] text-[15px] leading-[1.55] text-white/90">
              {description}
            </p>
          )}
        </div>
        <a
          href={href || "https://wa.me/6285211415104"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-between gap-4 whitespace-nowrap bg-[var(--color-dtg-ink)] px-6 py-3.5 font-[family-name:var(--font-sans)] text-[15px] font-bold text-[var(--color-dtg-cream)] no-underline transition-colors hover:bg-black"
        >
          <span>{buttonText}</span>
          <span className="font-[family-name:var(--font-mono)]">{suffix}</span>
        </a>
      </div>
    </div>
  );
}
