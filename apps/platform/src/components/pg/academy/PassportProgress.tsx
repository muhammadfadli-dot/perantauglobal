import { Icon } from "@/components/pg/Icon";
import type { ModuleCap, PsikotesStatus } from "@/lib/academy-db";

/**
 * Passport-progress card — the redesign's signature. Replaces the single percent
 * bar with a row of module "stamps" (caps) + a dual-path strip showing the route
 * to TWO certificates (kursus + psikotes). Pure presentational → safe in server
 * components. Amber "earned medal" palette.
 *
 * - `done` cap   → filled amber + check
 * - `current`    → outlined solid amber (active)
 * - `future`     → faded amber outline
 */
export function PassportProgress({
  caps,
  pct,
  psikotes,
  courseDone,
  showPath = true,
}: {
  caps: ModuleCap[];
  pct: number;
  psikotes: PsikotesStatus;
  courseDone: boolean;
  showPath?: boolean;
}) {
  const earned = caps.filter((c) => c.status === "done").length;
  const total = caps.length;
  return (
    <div
      className="rounded-[18px] p-4"
      style={{
        background: "linear-gradient(135deg, #fffaef 0%, var(--pa-amber-100) 100%)",
        border: "1px solid var(--pa-amber-200)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-mono text-[10px] font-bold uppercase tracking-[0.08em]"
          style={{ color: "var(--pa-amber-700)" }}
        >
          Paspormu
        </span>
        <span
          className="font-mono text-[12px] font-bold"
          style={{ color: "var(--pa-amber-700)" }}
        >
          {earned} / {total} cap · {pct}%
        </span>
      </div>

      <div className="flex gap-[7px] mt-3">
        {caps.map((c) => (
          <Stamp key={c.moduleNum} cap={c} />
        ))}
      </div>

      {showPath && (
        <div
          className="flex items-center gap-2 mt-3.5 pt-3 text-[11.5px]"
          style={{ borderTop: "1px dashed var(--pa-amber-200)", color: "var(--pg-ink-700)" }}
        >
          <PathSeg label="Kursus" done={courseDone} />
          <span style={{ color: "var(--pa-amber-600)" }}>+</span>
          <PathSeg label="Psikotes" done={psikotes === "done"} />
          <span style={{ color: "var(--pa-amber-600)" }}>=</span>
          <span className="font-semibold" style={{ color: "var(--pa-amber-700)" }}>
            2 sertifikat
          </span>
        </div>
      )}
    </div>
  );
}

function Stamp({ cap }: { cap: ModuleCap }) {
  const base =
    "flex-1 aspect-square rounded-full grid place-items-center font-mono text-[8px] font-bold";
  if (cap.status === "done") {
    return (
      <span
        className={base}
        style={{ background: "var(--pa-amber-500)", color: "#fff", border: "1.5px solid var(--pa-amber-500)" }}
        aria-label={`Modul ${cap.moduleNum} selesai`}
      >
        <Icon name="check" size={13} stroke={3} />
      </span>
    );
  }
  if (cap.status === "current") {
    return (
      <span
        className={base}
        style={{ border: "1.5px solid var(--pa-amber-500)", color: "var(--pa-amber-700)" }}
        aria-label={`Modul ${cap.moduleNum} sedang berjalan`}
      >
        M{cap.moduleNum}
      </span>
    );
  }
  return (
    <span
      className={base}
      style={{ border: "1.5px dashed var(--pa-amber-200)", color: "var(--pa-amber-200)" }}
      aria-label={`Modul ${cap.moduleNum} terkunci`}
    >
      M{cap.moduleNum}
    </span>
  );
}

/**
 * A round passport "stamp" for a module. `earned` (cap ceremony) = pressed solid
 * gold, slightly rotated; `!earned` (module intro) = calm outlined opener.
 */
export function ModuleStamp({
  moduleNum,
  title,
  caption,
  earned = false,
  size = 150,
}: {
  moduleNum: number;
  title?: string;
  caption?: string;
  earned?: boolean;
  size?: number;
}) {
  const mn = String(moduleNum).padStart(2, "0");
  return (
    <div
      className="rounded-full grid place-items-center relative mx-auto text-center"
      style={{
        width: size,
        height: size,
        border: earned ? "3px solid var(--pa-amber-600)" : "2px solid var(--pa-amber-500)",
        color: "var(--pa-amber-700)",
        transform: earned ? "rotate(-7deg)" : "none",
        boxShadow: earned ? "inset 0 0 0 7px rgba(201,138,20,0.10)" : "none",
        background: earned ? "linear-gradient(135deg,#fffaef,var(--pa-amber-100))" : "transparent",
      }}
    >
      <span
        aria-hidden
        className="absolute rounded-full"
        style={{ inset: 14, border: "1.5px dashed var(--pa-amber-500)" }}
      />
      <div className="px-3">
        <div className="font-mono text-[11px] font-bold tracking-[0.1em]">MODUL {mn}</div>
        {title && (
          <div className="text-[18px] font-extrabold tracking-[-0.01em] leading-[1.05] mt-0.5">
            {title}
          </div>
        )}
        {caption && (
          <div className="font-mono text-[10px] tracking-[0.18em] mt-1">{caption}</div>
        )}
      </div>
    </div>
  );
}

function PathSeg({ label, done }: { label: string; done: boolean }) {
  return (
    <span className="inline-flex items-center gap-[5px] font-semibold">
      <span
        className="w-4 h-4 rounded-full grid place-items-center"
        style={
          done
            ? { background: "var(--pg-ok)", color: "#fff" }
            : { border: "1.5px solid var(--pa-amber-500)", color: "var(--pa-amber-600)" }
        }
      >
        {done ? <Icon name="check" size={10} stroke={3} /> : <Icon name="clock" size={9} />}
      </span>
      {label}
    </span>
  );
}
