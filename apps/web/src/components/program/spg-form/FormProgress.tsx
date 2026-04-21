const STEP_KEYS = ["identity", "logistics", "motivation", "confirmation"] as const;

interface FormProgressProps {
  currentStep: number;
  t: (key: string) => string;
}

export default function FormProgress({ currentStep, t }: FormProgressProps) {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-4 gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)]">
        {STEP_KEYS.map((key, i) => {
          const isDone = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div
              key={key}
              className={
                "flex flex-col gap-1.5 px-3 py-3 " +
                (isCurrent
                  ? "bg-[var(--color-dtg-ink)] text-[var(--color-dtg-cream)]"
                  : isDone
                  ? "bg-[var(--color-dtg-red)] text-white"
                  : "bg-white text-[var(--color-dtg-ink)]")
              }
            >
              <span className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.14em] opacity-80">
                {String(i + 1).padStart(2, "0")} {isDone && "✓"}
              </span>
              <span className="font-[family-name:var(--font-display)] text-xs font-extrabold tracking-[-0.02em]">
                {t(`steps.${key}`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
