import * as React from "react";
import Link from "next/link";
import { Icon, type IconName } from "./Icon";

type ButtonVariant = "primary" | "ghost" | "dark";

type ButtonProps = {
  variant?: ButtonVariant;
  block?: boolean;
  small?: boolean;
  className?: string;
  children: React.ReactNode;
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 font-semibold text-base rounded-xl border-0 cursor-pointer no-underline transition-transform duration-75 active:scale-[0.985] tracking-tight disabled:opacity-50 disabled:cursor-not-allowed";

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-pg-red-600 text-white hover:bg-pg-red-700",
  ghost: "bg-transparent text-pg-ink-900 border-[1.5px] border-pg-ink-200 hover:bg-pg-ink-50",
  dark: "bg-pg-ink-900 text-white hover:bg-black",
};

function classes({ variant = "primary", block, small, className }: ButtonProps) {
  return [
    BTN_BASE,
    BTN_VARIANTS[variant],
    block ? "w-full" : "",
    small ? "min-h-[40px] px-4 text-sm" : "min-h-[52px] px-[22px]",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { variant, block, small, className, children, ...rest } = props;
  return (
    <button {...rest} className={classes({ variant, block, small, className, children })}>
      {children}
    </button>
  );
}

export function ButtonLink(
  props: ButtonProps & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">
) {
  const { variant, block, small, className, children, href, ...rest } = props;
  return (
    <Link href={href} {...rest} className={classes({ variant, block, small, className, children })}>
      {children}
    </Link>
  );
}

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

export function StatusDot({
  tone = "ok",
}: {
  tone?: "ok" | "warn" | "err" | "mute";
}) {
  const color =
    tone === "ok" ? "var(--pg-ok)" :
    tone === "warn" ? "var(--pg-warn)" :
    tone === "err" ? "var(--pg-err)" :
    "var(--pg-ink-300)";
  return <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: color }} />;
}

export function Card({
  children,
  className,
  noPadding,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div
      className={[
        "bg-pg-white border border-pg-ink-100 rounded-2xl",
        noPadding ? "" : "p-5",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/** Content-shaped loading placeholder. Use in loading.tsx skeletons. */
export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-xl bg-pg-ink-100 ${className ?? ""}`}
      style={style}
    />
  );
}

/** Specific, friendly empty state for data-driven lists. */
export function EmptyState({
  icon,
  title,
  sub,
  action,
}: {
  icon?: IconName;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {icon && (
        <span
          className="w-12 h-12 rounded-2xl grid place-items-center mb-3"
          style={{ background: "var(--pg-ink-50)", color: "var(--pg-ink-400)" }}
        >
          <Icon name={icon} size={22} stroke={1.8} />
        </span>
      )}
      <div className="text-[15px] font-extrabold text-pg-ink-900">{title}</div>
      {sub && (
        <div className="text-[13px] text-pg-ink-500 mt-1 max-w-xs">{sub}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Eyebrow({
  children,
  tone = "red",
}: {
  children: React.ReactNode;
  tone?: "red" | "ink" | "ok";
}) {
  const color =
    tone === "red" ? "text-pg-red-600" :
    tone === "ok" ? "text-pg-ok" :
    "text-pg-ink-400";
  return (
    <div className={`text-[12px] font-bold uppercase tracking-[0.12em] ${color}`}>{children}</div>
  );
}

/* ============================================================
   Form primitives — ported from apps/web for cross-app parity, so the portal
   stops hand-rolling inputs and a fix in one app reaches both. Field exposes an
   accessible `error` slot (role=alert + aria binding via htmlFor).
   ============================================================ */

const FIELD_INPUT_CLASS =
  "block w-full min-h-[48px] px-4 py-3 text-base rounded-xl border border-pg-ink-200 bg-pg-white text-pg-ink-900 placeholder:text-pg-ink-400 focus:outline-none focus:border-pg-red-600 focus:ring-2 focus:ring-pg-red-100 transition-colors";

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
    "inline-flex items-center gap-1.5 h-9 px-3.5 text-sm font-semibold rounded-full whitespace-nowrap border-[1.5px] transition-colors no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-pg-red-600 focus-visible:ring-offset-1",
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
        {required && (
          <span className="text-pg-red-600 ml-1" aria-hidden>
            *
          </span>
        )}
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

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} {...rest} className={`${FIELD_INPUT_CLASS} ${className ?? ""}`} />;
});

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
