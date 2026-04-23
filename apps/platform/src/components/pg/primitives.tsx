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
