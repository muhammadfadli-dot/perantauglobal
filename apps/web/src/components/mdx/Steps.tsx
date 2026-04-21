import type { ReactNode } from "react";

export function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-10 border-t border-[var(--color-dtg-ink)]">
      {children}
    </div>
  );
}

export function Step({
  number,
  title,
  icon,
  children,
}: {
  number: number;
  title: string;
  icon?: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid gap-4 border-b border-[color:rgba(26,26,26,0.15)] py-6 sm:grid-cols-[80px_1fr] sm:gap-8">
      <div className="font-[family-name:var(--font-display)] text-[clamp(40px,4vw,56px)] font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-red)]">
        {icon || String(number).padStart(2, "0")}
      </div>
      <div>
        <h4 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.02em] text-[var(--color-dtg-ink)]">
          {title}
        </h4>
        {children && (
          <div className="mt-2 text-[15px] leading-[1.6] text-[var(--color-dtg-ink)] opacity-85 [&>p]:m-0 [&>p+p]:mt-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
