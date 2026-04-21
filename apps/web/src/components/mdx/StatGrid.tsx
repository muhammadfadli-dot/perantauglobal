import type { ReactNode } from "react";

export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-10 grid grid-cols-2 gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] md:grid-cols-4">
      {children}
    </div>
  );
}

export function Stat({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon?: string;
}) {
  return (
    <div className="flex flex-col gap-2 bg-white p-5 lg:p-6">
      {icon && (
        <span className="font-[family-name:var(--font-mono)] text-sm leading-none opacity-60">
          {icon}
        </span>
      )}
      <p className="font-[family-name:var(--font-display)] text-[clamp(28px,3vw,40px)] font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-ink)]">
        {value}
      </p>
      <p className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
        {label}
      </p>
    </div>
  );
}
