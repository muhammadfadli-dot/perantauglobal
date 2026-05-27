import { Icon } from "@/components/pg/Icon";

/**
 * QuickFacts — 4-cell data card floating up to overlap hero bottom.
 *
 * Primary cell (salary): pink gradient background, mono-numeral large value,
 * optional IDR sub. Right cells: Kontrak / Kandidat (gender+age) / Proses.
 */
export function QuickFacts({
  salary,
  salaryNote,
  salaryIdr,
  contractLabel,
  gender,
  age,
  processDuration,
}: {
  salary: string;
  salaryNote: string;
  salaryIdr?: string;
  contractLabel?: string;
  gender: string;
  age: string;
  processDuration?: string;
}) {
  const procFirst = processDuration?.split(" ")[0] ?? "—";
  const procRest = processDuration?.split(" ").slice(1).join(" ") ?? "";

  return (
    <div className="relative z-[5] -mt-12 md:-mt-12 mb-8 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div
          className="bg-pg-white border border-pg-ink-100 rounded-[18px] overflow-hidden grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]"
          style={{ boxShadow: "0 24px 60px rgba(20,20,20,0.10)" }}
        >
          {/* Primary salary cell */}
          <div
            className="p-5 md:p-6 flex flex-col gap-1 col-span-2 md:col-span-1 border-b md:border-b-0 md:border-r border-pg-ink-100"
            style={{ background: "linear-gradient(135deg, #fff 0%, #fff7f7 100%)" }}
          >
            <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-pg-red-700">
              <span className="text-pg-red-600">
                <Icon name="wallet" size={12} stroke={2.2} />
              </span>
              Gaji per bulan
            </span>
            <span
              className="font-mono font-extrabold tracking-[-0.02em] text-pg-ink-900 leading-tight"
              style={{ fontSize: "clamp(22px, 3vw, 26px)" }}
            >
              {salary}
            </span>
            {salaryNote && (
              <span className="font-mono text-[12px] text-pg-ink-500">{salaryNote}</span>
            )}
            {salaryIdr && (
              <span className="font-mono text-[12px] font-semibold text-pg-red-700 mt-0.5">
                ≈ {salaryIdr}
              </span>
            )}
          </div>

          {/* Contract */}
          <div className="p-4 md:p-6 flex flex-col gap-1 border-r border-pg-ink-100">
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-pg-ink-500">
              Kontrak
            </span>
            <span className="text-[15px] md:text-[17px] font-extrabold text-pg-ink-900 leading-tight tracking-[-0.018em]">
              {contractLabel ?? "—"}
            </span>
          </div>

          {/* Kandidat */}
          <div className="p-4 md:p-6 flex flex-col gap-1 border-r border-pg-ink-100">
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-pg-ink-500">
              Kandidat
            </span>
            <span className="text-[15px] md:text-[17px] font-extrabold text-pg-ink-900 leading-tight tracking-[-0.018em]">
              {gender}
            </span>
            <span className="font-mono text-[12px] text-pg-ink-500">{age} tahun</span>
          </div>

          {/* Proses */}
          <div className="p-4 md:p-6 flex flex-col gap-1">
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-pg-ink-500">
              Proses
            </span>
            <span className="text-[15px] md:text-[17px] font-extrabold text-pg-ink-900 leading-tight tracking-[-0.018em]">
              {procFirst}
            </span>
            {procRest && (
              <span className="font-mono text-[12px] text-pg-ink-500">{procRest}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
