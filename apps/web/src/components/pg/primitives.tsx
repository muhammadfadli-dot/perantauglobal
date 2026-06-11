import * as React from "react";
import Link from "next/link";
import { Icon, type IconName } from "./Icon";

/* ============================================================
   Button + ButtonLink
   ============================================================ */

type ButtonVariant = "primary" | "ghost" | "dark" | "cream" | "wa";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  /** @deprecated use size="sm" instead */
  small?: boolean;
  className?: string;
  children: React.ReactNode;
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 font-semibold border-0 cursor-pointer no-underline transition-transform duration-75 active:scale-[0.985] tracking-tight disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-pg-red-600 text-white hover:bg-pg-red-700",
  ghost: "bg-transparent text-pg-ink-900 border-[1.5px] border-pg-ink-200 hover:bg-pg-ink-50",
  dark: "bg-pg-ink-900 text-white hover:bg-black",
  cream: "bg-pg-cream text-pg-red-700 hover:-translate-y-0.5",
  wa: "bg-transparent text-pg-cream border-[1.5px] border-pg-cream/45 hover:bg-pg-cream/10",
};

const BTN_SIZES: Record<ButtonSize, string> = {
  sm: "min-h-[40px] px-4 text-sm rounded-xl",
  md: "min-h-[52px] px-[22px] text-base rounded-xl",
  lg: "min-h-[54px] px-7 text-[16px] md:text-[17px] rounded-2xl font-extrabold",
};

const BTN_VARIANT_SHADOWS: Partial<Record<ButtonVariant, string>> = {
  cream: "var(--shadow-cta-cream)",
};

function buttonClasses(
  { variant = "primary", size, block, small, className }: ButtonProps,
): string {
  const resolvedSize: ButtonSize = size ?? (small ? "sm" : "md");
  return [
    BTN_BASE,
    BTN_VARIANTS[variant],
    BTN_SIZES[resolvedSize],
    block ? "w-full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buttonStyle({ variant = "primary" }: ButtonProps): React.CSSProperties | undefined {
  const shadow = BTN_VARIANT_SHADOWS[variant];
  return shadow ? { boxShadow: shadow } : undefined;
}

export function Button(
  props: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const { variant, size, block, small, className, children, style, ...rest } = props;
  return (
    <button
      {...rest}
      className={buttonClasses({ variant, size, block, small, className, children })}
      style={{ ...buttonStyle({ variant, size, block, small, className, children }), ...style }}
    >
      {children}
    </button>
  );
}

export function ButtonLink(
  props: ButtonProps & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
) {
  const { variant, size, block, small, className, children, href, style, ...rest } = props;
  return (
    <Link
      href={href}
      {...rest}
      className={buttonClasses({ variant, size, block, small, className, children })}
      style={{ ...buttonStyle({ variant, size, block, small, className, children }), ...style }}
    >
      {children}
    </Link>
  );
}

/** WhatsApp CTA pill — convenience wrapper that ships with the green dot prefix. */
export function WhatsAppButton({
  href,
  children = "Tanya via WhatsApp",
  size = "lg",
  block,
}: {
  href: string;
  children?: React.ReactNode;
  size?: ButtonSize;
  block?: boolean;
}) {
  return (
    <ButtonLink href={href} variant="wa" size={size} block={block} target="_blank" rel="noopener noreferrer">
      <span
        aria-hidden
        className="inline-block w-2.5 h-2.5 rounded-full"
        style={{ background: "var(--pg-wa-green)" }}
      />
      {children}
    </ButtonLink>
  );
}

/* ============================================================
   Badge + Chip + StatusDot
   ============================================================ */

type BadgeVariant = "ok" | "warn" | "err" | "info" | "mute";

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  ok: "bg-pg-ok-bg text-pg-ok",
  warn: "bg-pg-warn-bg text-pg-warn",
  err: "bg-pg-err-bg text-pg-err",
  info: "bg-pg-info-bg text-pg-info",
  mute: "bg-pg-ink-100 text-pg-ink-500",
};

export function Badge({
  variant = "mute",
  icon,
  children,
}: {
  variant?: BadgeVariant;
  icon?: IconName;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-bold tracking-wide uppercase rounded-full ${BADGE_VARIANTS[variant]}`}
    >
      {icon && <Icon name={icon} size={12} stroke={2.2} />}
      {children}
    </span>
  );
}

export function Chip({
  active,
  href,
  children,
  className,
}: {
  active?: boolean;
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const cls = [
    "inline-flex items-center gap-1.5 h-9 px-3.5 text-sm font-semibold rounded-full whitespace-nowrap border-[1.5px] transition-colors no-underline",
    active
      ? "bg-pg-ink-900 text-white border-pg-ink-900"
      : "bg-pg-white text-pg-ink-700 border-pg-ink-200 hover:border-pg-ink-300",
    className ?? "",
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <span className={cls}>{children}</span>;
}

export function StatusDot({ tone = "ok" }: { tone?: "ok" | "warn" | "err" | "mute" }) {
  const color =
    tone === "ok"
      ? "var(--pg-ok)"
      : tone === "warn"
      ? "var(--pg-warn)"
      : tone === "err"
      ? "var(--pg-err)"
      : "var(--pg-ink-300)";
  return (
    <span
      className="inline-block w-2 h-2 rounded-full shrink-0"
      style={{ background: color }}
    />
  );
}

/* ============================================================
   Card
   ============================================================ */

export function Card({
  children,
  className,
  noPadding,
  elevated,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  elevated?: boolean;
}) {
  return (
    <div
      className={[
        "bg-pg-white border border-pg-ink-100 rounded-2xl",
        noPadding ? "" : "p-5",
        className ?? "",
      ].join(" ")}
      style={elevated ? { boxShadow: "var(--shadow-card)" } : undefined}
    >
      {children}
    </div>
  );
}

/* ============================================================
   Eyebrow — standardized mono caps with tracking 0.16em
   ============================================================ */

type EyebrowTone = "red" | "gold" | "ink" | "cream" | "ok";

export function Eyebrow({
  children,
  tone = "red",
  className,
}: {
  children: React.ReactNode;
  tone?: EyebrowTone;
  className?: string;
}) {
  const colorClass =
    tone === "red"
      ? "text-pg-red-600"
      : tone === "gold"
      ? "text-pg-gold-700"
      : tone === "ink"
      ? "text-pg-ink-400"
      : tone === "ok"
      ? "text-pg-ok"
      : "text-pg-cream";
  return (
    <div
      className={`text-[11px] md:text-[12px] font-bold uppercase tracking-[0.16em] font-mono ${colorClass} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

/* ============================================================
   Section — consistent vertical rhythm + bg tone
   ============================================================ */

type SectionTone = "white" | "paper" | "ink" | "red" | "transparent";
type SectionSize = "sm" | "md" | "lg";

const SECTION_TONES: Record<SectionTone, string> = {
  white: "bg-pg-white",
  paper: "bg-pg-paper",
  ink: "bg-pg-ink-50",
  red: "bg-pg-red-900",
  transparent: "",
};

const SECTION_SIZES: Record<SectionSize, string> = {
  sm: "py-8 md:py-12",
  md: "py-10 md:py-16",
  lg: "py-12 md:py-20",
};

export function Section({
  children,
  tone = "transparent",
  size = "lg",
  border,
  className,
  shellClassName,
}: {
  children: React.ReactNode;
  tone?: SectionTone;
  size?: SectionSize;
  border?: "top" | "bottom" | "both" | "none";
  className?: string;
  shellClassName?: string;
}) {
  const borderClass =
    border === "top"
      ? "border-t border-pg-ink-100"
      : border === "bottom"
      ? "border-b border-pg-ink-100"
      : border === "both"
      ? "border-y border-pg-ink-100"
      : "";

  return (
    <section
      className={[
        "relative px-5 md:px-8",
        SECTION_SIZES[size],
        SECTION_TONES[tone],
        borderClass,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={`max-w-6xl mx-auto ${shellClassName ?? ""}`}>{children}</div>
    </section>
  );
}

/* Section header — eyebrow + h2 + optional intro paragraph */
export function SectionHeader({
  eyebrow,
  eyebrowTone = "red",
  title,
  intro,
  align = "left",
  className,
}: {
  eyebrow?: React.ReactNode;
  eyebrowTone?: EyebrowTone;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex flex-col gap-2 max-w-2xl ${alignClass} ${className ?? ""}`}>
      {eyebrow && <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>}
      <h2 className="text-[24px] md:text-[40px] font-extrabold tracking-[-0.02em] leading-[1.1] text-pg-ink-900">
        {title}
      </h2>
      {intro && (
        <p className="text-[14px] md:text-[16px] font-medium leading-relaxed text-pg-ink-500">
          {intro}
        </p>
      )}
    </div>
  );
}

/* ============================================================
   PageHero — text-only hero for sub-pages (cream/white bg)
   Homepage uses a hand-rolled red-poster hero (intentional escape hatch).
   ============================================================ */

export function PageHero({
  eyebrow,
  title,
  lede,
  children,
  align = "left",
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  const alignClass = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  return (
    <section className={`px-5 md:px-8 pt-10 md:pt-16 pb-8 md:pb-12 ${className ?? ""}`}>
      <div className={`max-w-4xl ${align === "center" ? "mx-auto" : ""}`}>
        <div className={`flex flex-col gap-3 ${alignClass}`}>
          {eyebrow && <Eyebrow tone="red">{eyebrow}</Eyebrow>}
          <h1 className="text-[34px] md:text-6xl font-extrabold tracking-tight leading-[1.05] text-pg-ink-900">
            {title}
          </h1>
          {lede && (
            <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed mt-2 max-w-prose">
              {lede}
            </p>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FinalCTA — red bookend section
   Used at the bottom of every long-scroll page for consistent
   "primary action + WhatsApp escape" ending.
   ============================================================ */

export function FinalCTA({
  eyebrow = "Siap mulai?",
  title,
  body,
  primaryHref,
  primaryLabel,
  whatsappHref,
  microcopy,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  primaryHref: string;
  primaryLabel: string;
  whatsappHref?: string;
  microcopy?: React.ReactNode;
}) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--pg-red-900)" }}
    >
      <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 min-h-[440px] md:min-h-[520px] flex flex-col items-center text-center pt-16 md:pt-24 pb-16 md:pb-24">
        <Eyebrow tone="gold" className="text-pg-gold-200">
          {eyebrow}
        </Eyebrow>
        <h2
          className="mt-4 text-[32px] md:text-[54px] font-extrabold tracking-[-0.03em] leading-[1.05]"
          style={{
            color: "var(--pg-cream)",
            textShadow:
              "0 1px 2px rgba(0,0,0,0.18), 0 2px 18px rgba(0,0,0,0.22)",
          }}
        >
          {title}
        </h2>
        {body && (
          <p
            className="mt-4 max-w-md md:max-w-lg text-[14px] md:text-[17px] font-medium leading-relaxed"
            style={{
              color: "var(--pg-cream)",
              opacity: 0.94,
              textShadow: "0 1px 6px rgba(0,0,0,0.18)",
            }}
          >
            {body}
          </p>
        )}
        <div className="mt-7 flex flex-col sm:flex-row gap-2.5 w-full max-w-md md:max-w-xl">
          <div className="flex-1">
            <ButtonLink href={primaryHref} variant="cream" size="lg" block>
              {primaryLabel}{" "}
              <Icon name="arrow_right" size={18} />
            </ButtonLink>
          </div>
          {whatsappHref && (
            <div className="flex-1">
              <WhatsAppButton href={whatsappHref} block />
            </div>
          )}
        </div>
        {microcopy && (
          <div
            className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-semibold tracking-[0.08em] uppercase font-mono"
            style={{
              color: "var(--pg-cream)",
              opacity: 0.92,
              textShadow: "0 1px 4px rgba(0,0,0,0.22)",
            }}
          >
            {microcopy}
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   Form primitives — Field + Input + Textarea + Select
   Extracted from ApplyForm + ContactForm (verbatim-duplicated).
   ============================================================ */

const FIELD_INPUT_CLASS =
  "block w-full min-h-[48px] px-4 py-3 text-base rounded-xl border border-pg-ink-200 bg-pg-white text-pg-ink-900 placeholder:text-pg-ink-400 focus:outline-none focus:border-pg-red-600 focus:ring-2 focus:ring-pg-red-100 transition-colors";

export function Field({
  label,
  required,
  helper,
  error,
  children,
  htmlFor,
}: {
  label: React.ReactNode;
  required?: boolean;
  helper?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-bold text-pg-ink-900">
        {label}
        {required && <span className="text-pg-red-600 ml-1" aria-hidden>*</span>}
      </label>
      {children}
      {error ? (
        <div role="alert" className="text-[12px] text-pg-err font-medium">
          {error}
        </div>
      ) : helper ? (
        <div className="text-[12px] text-pg-ink-500">{helper}</div>
      ) : null}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} {...rest} className={`${FIELD_INPUT_CLASS} ${className ?? ""}`} />;
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      {...rest}
      className={`${FIELD_INPUT_CLASS} min-h-[unset] resize-y ${className ?? ""}`}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...rest }, ref) {
  return (
    <select ref={ref} {...rest} className={`${FIELD_INPUT_CLASS} pr-10 ${className ?? ""}`}>
      {children}
    </select>
  );
});
