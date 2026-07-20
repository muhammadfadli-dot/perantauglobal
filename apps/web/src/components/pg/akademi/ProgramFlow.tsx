import { Icon, type IconName } from "@/components/pg/Icon";
import type { ProgramFlowStep } from "@/lib/academy";

/**
 * The register -> screening -> pay -> train -> depart ladder, shared by the
 * Akademi hub and every certification product page so the two never drift.
 *
 * Step copy comes from the database (content.flow); everything here is
 * presentation keyed by position. If a program ever ships a flow of a
 * different length the icons fall back gracefully and the chips simply stop.
 */
const STEP_ICONS: IconName[] = ["user", "phone", "wallet", "doc_check", "star", "briefcase"];

const STEP_CHIPS: ({ label: string; paid: boolean } | null)[] = [
  { label: "Gratis", paid: false },
  { label: "Masih gratis", paid: false },
  { label: "Mulai bicara biaya", paid: true },
];

/**
 * Where money first enters the conversation. Filled marker instead of the
 * tinted one, because this is the step candidates are scanning for.
 */
const PAY_STEP_INDEX = 2;

export function ProgramFlow({
  flow,
  compact = false,
}: {
  flow: ProgramFlowStep[];
  /** Denser type and markers, for the product page's narrower column. */
  compact?: boolean;
}) {
  const marker = compact ? "w-[38px] h-[38px]" : "w-[42px] h-[42px]";
  const iconSize = compact ? 18 : 20;

  return (
    <ol className="list-none p-0 m-0">
      {flow.map((step, i) => {
        const chip = STEP_CHIPS[i] ?? null;
        const isPay = i === PAY_STEP_INDEX;
        const isLast = i === flow.length - 1;
        return (
          <li key={step.title} className={compact ? "flex gap-3.5" : "flex gap-4"}>
            <div className="flex flex-col items-center flex-none">
              <div
                className={`${marker} rounded-full grid place-items-center flex-none`}
                style={
                  isPay
                    ? { background: "var(--pa-amber-600)", color: "var(--pg-white)" }
                    : { background: "var(--pa-amber-100)", color: "var(--pa-amber-700)" }
                }
              >
                <Icon name={STEP_ICONS[i] ?? "check"} size={iconSize} />
              </div>
              {!isLast && <span aria-hidden className="w-0.5 flex-1 my-1.5 bg-pg-ink-100" />}
            </div>

            <div className={isLast ? "" : compact ? "pb-4" : "pb-5"}>
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono font-bold ${compact ? "text-[10.5px]" : "text-[11px]"}`}
                  style={{ color: "var(--pa-amber-600)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {chip && (
                  <span
                    className="font-mono text-[9px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-[5px]"
                    style={
                      chip.paid
                        ? { background: "var(--pa-amber-100)", color: "var(--pa-amber-700)" }
                        : { background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }
                    }
                  >
                    {chip.label}
                  </span>
                )}
              </div>
              <div
                className={`font-extrabold text-pg-ink-900 leading-snug mt-1 ${compact ? "text-[14.5px]" : "text-[15.5px]"}`}
              >
                {step.title}
              </div>
              {step.detail && (
                <p
                  className={`leading-relaxed text-pg-ink-500 mt-1 m-0 ${compact ? "text-[12.5px]" : "text-[13px]"}`}
                >
                  {step.detail}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
