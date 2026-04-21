import { cn } from "@/lib/utils";

type Props = {
  number?: string;
  label: string;
  divider?: boolean;
  tone?: "ink" | "cream";
  className?: string;
};

export function SectionTag({ number, label, divider = true, tone = "ink", className }: Props) {
  const text = number ? `§ ${number} — ${label}` : `§ ${label}`;
  return (
    <div
      className={cn(
        divider && "border-t-2 pt-4",
        tone === "ink" ? "border-[var(--color-dtg-ink)]" : "border-[var(--color-dtg-cream)]",
        className,
      )}
    >
      <span className="font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.15em] opacity-60">
        {text}
      </span>
    </div>
  );
}
