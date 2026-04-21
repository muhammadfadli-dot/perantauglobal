import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  left: ReactNode;
  right: ReactNode;
  tone?: "cream" | "ink" | "red";
  border?: "top" | "bottom" | "both";
  className?: string;
};

const tones = {
  cream: "bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)] border-[var(--color-dtg-ink)]",
  ink: "bg-[var(--color-dtg-ink)] text-[var(--color-dtg-cream)] border-[color:rgba(245,240,232,0.15)]",
  red: "bg-[var(--color-dtg-red)] text-white border-[color:rgba(255,255,255,0.25)]",
};

const borders = {
  top: "border-t",
  bottom: "border-b",
  both: "border-t border-b",
};

export function MetaStrip({ left, right, tone = "cream", border = "bottom", className }: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-6 py-3.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em]",
        tones[tone],
        borders[border],
        className,
      )}
    >
      <span>{left}</span>
      <span className="flex flex-wrap items-center gap-x-6 gap-y-1 text-right">{right}</span>
    </div>
  );
}
