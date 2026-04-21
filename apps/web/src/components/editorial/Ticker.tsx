import { cn } from "@/lib/utils";

type Item = { icon?: string; text: string };

type Props = {
  items: Item[];
  tone?: "ink" | "cream" | "red";
  className?: string;
};

const tones = {
  ink: "bg-[var(--color-dtg-ink)] text-[var(--color-dtg-cream)] border-y border-[color:rgba(245,240,232,0.15)]",
  cream: "bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)] border-y border-[var(--color-dtg-ink)]",
  red: "bg-[var(--color-dtg-red)] text-white",
};

export function Ticker({ items, tone = "ink", className }: Props) {
  if (items.length === 0) return null;
  const loop = [...items, ...items];
  return (
    <div className={cn("overflow-hidden py-4", tones[tone], className)}>
      <div className="editorial-ticker font-[family-name:var(--font-mono)] text-[13px] font-semibold">
        {loop.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3">
            <span className="text-[var(--color-dtg-red)]">{item.icon ?? "★"}</span>
            <span className="tracking-[0.04em]">{item.text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
