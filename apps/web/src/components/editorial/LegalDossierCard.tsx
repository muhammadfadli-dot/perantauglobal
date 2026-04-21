import type { ReactNode } from "react";

export type Credential = { label: string; note: string };

type Props = {
  serial: string;
  status: string;
  badge: string;
  headline: ReactNode;
  body: ReactNode;
  credentials: Credential[];
  signatory: { name: string; title: string; date: string; location: string };
};

/**
 * Editorial legal dossier — looks like a stamped official document.
 * Used in lowongan RoleInfo sidebar; reusable on tentang/programs/kontak.
 */
export function LegalDossierCard({ serial, status, badge, headline, body, credentials, signatory }: Props) {
  return (
    <div className="relative">
      {/* Filing strip */}
      <div className="flex justify-between bg-[var(--color-dtg-ink)] px-3.5 py-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-dtg-cream)]">
        <span>{serial}</span>
        <span className="text-[var(--color-dtg-red)]">● {status}</span>
      </div>

      {/* Ruled paper card */}
      <div
        className="relative overflow-hidden border border-t-0 border-[var(--color-dtg-ink)] px-5 py-6 pb-5"
        style={{
          background: "#fdfaf3",
          backgroundImage: "repeating-linear-gradient(0deg, transparent 0 27px, rgba(14,14,16,0.05) 27px 28px)",
        }}
      >
        {/* Diagonal stamp */}
        <div className="pointer-events-none absolute -right-3.5 top-3 rotate-[8deg] opacity-95">
          <div
            className="rounded-md border-[2.5px] border-[var(--color-dtg-red)] bg-white/60 px-4 py-2.5 text-center text-[var(--color-dtg-red)]"
            style={{ boxShadow: "inset 0 0 0 2px rgba(200,16,46,0.25)" }}
          >
            <div className="mb-1 font-[family-name:var(--font-display)] text-[9px] font-extrabold uppercase tracking-[0.2em] opacity-85">
              ★ OFFICIAL ★
            </div>
            <div className="font-[family-name:var(--font-display)] text-[22px] font-extrabold leading-none tracking-[0.08em]">
              VERIFIED
            </div>
            <div className="mt-1 font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.2em] opacity-85">
              {badge}
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="max-w-[62%]">
          <div className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-dtg-red)]">
            Perlindungan Hukum
          </div>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-[22px] font-extrabold leading-[1.05] tracking-[-0.03em]">
            {headline}
          </h3>
        </div>

        <p className="mt-4 max-w-[56ch] text-[13px] leading-[1.55] opacity-80">{body}</p>

        {/* Credential strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-dashed border-[color:rgba(14,14,16,0.3)] pt-4">
          {credentials.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-0.5 font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--color-dtg-red)]">✓</span>
              <div>
                <div className="font-[family-name:var(--font-display)] text-xs font-bold tracking-[-0.01em]">{c.label}</div>
                <div className="mt-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.06em] opacity-60">
                  {c.note}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Signature line */}
        <div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--color-dtg-ink)] pt-3.5">
          <div>
            <div
              className="text-[20px] leading-none italic tracking-[0.02em] text-[var(--color-dtg-ink)] opacity-85"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {signatory.name}
            </div>
            <div className="mt-1 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.12em] opacity-55">
              {signatory.title}
            </div>
          </div>
          <div className="text-right font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.12em] opacity-55">
            {signatory.date}
            <br />
            {signatory.location}
          </div>
        </div>
      </div>
    </div>
  );
}
