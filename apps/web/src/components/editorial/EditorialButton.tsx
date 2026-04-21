"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "ink" | "cream" | "red" | "outline";
type Suffix = string | null;

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  suffix?: Suffix;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const variants: Record<Variant, string> = {
  ink: "bg-[var(--color-dtg-ink)] text-[var(--color-dtg-cream)] hover:bg-black",
  cream: "bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)] hover:bg-white",
  red: "bg-[var(--color-dtg-red)] text-white hover:bg-[var(--color-dtg-red-dark)]",
  outline: "bg-transparent text-[var(--color-dtg-ink)] border-b-2 border-[var(--color-dtg-ink)] hover:text-[var(--color-dtg-red)] hover:border-[var(--color-dtg-red)] px-0",
};

const sizes = {
  sm: "px-4 py-2.5 text-sm",
  md: "px-6 py-4 text-[15px]",
  lg: "px-7 py-5 text-base",
};

function buttonClass(variant: Variant, size: "sm" | "md" | "lg", fullWidth: boolean, className?: string) {
  return cn(
    "inline-flex items-center justify-between gap-4 font-bold transition-colors duration-150",
    "font-[family-name:var(--font-sans)]",
    variant !== "outline" && sizes[size],
    variant === "outline" && "py-3 text-base",
    variants[variant],
    fullWidth && "w-full",
    className,
  );
}

type AsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
};

export function EditorialButton(props: AsButton | AsLink) {
  const { children, variant = "ink", suffix = "→", fullWidth = false, size = "md", className } = props;

  const inner = (
    <>
      <span>{children}</span>
      {suffix !== null && <span className="font-[family-name:var(--font-mono)]">{suffix}</span>}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <a
        href={props.href}
        target={props.target}
        rel={props.rel}
        onClick={props.onClick}
        className={cn(buttonClass(variant, size, fullWidth, className), "no-underline")}
      >
        {inner}
      </a>
    );
  }

  const {
    href: _h,
    variant: _v,
    suffix: _s,
    fullWidth: _f,
    size: _sz,
    className: _c,
    children: _ch,
    ...rest
  } = props as AsButton;
  void _h; void _v; void _s; void _f; void _sz; void _c; void _ch;
  return (
    <button {...rest} className={buttonClass(variant, size, fullWidth, className)}>
      {inner}
    </button>
  );
}
