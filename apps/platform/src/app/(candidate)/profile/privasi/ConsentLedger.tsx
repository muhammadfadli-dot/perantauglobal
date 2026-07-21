"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import { WITHDRAW_COPY, type ConsentImpact } from "@/lib/privacy-center";
import { withdrawConsent } from "./actions";

/** One grant event. Dates arrive preformatted from the server (Asia/Jakarta). */
export type GrantView = {
  grantedLabel: string | null;
  withdrawnLabel: string | null;
};

/**
 * One distinct wording the candidate agreed to, with every occasion they
 * agreed to it. `text` is the verbatim `consents.purpose_text` column - the
 * page renders it as-is, never summarised.
 */
export type WordingView = {
  key: string;
  text: string;
  version: string;
  grants: GrantView[];
};

export type ConsentGroupView = {
  purpose: string;
  label: string;
  blurb: string;
  icon: IconName;
  impact: ConsentImpact;
  activeCount: number;
  totalCount: number;
  lastWithdrawnLabel: string | null;
  wordings: WordingView[];
};

export default function ConsentLedger({ groups }: { groups: ConsentGroupView[] }) {
  return (
    <div className="flex flex-col gap-3">
      {groups.map((g) => (
        <ConsentCard key={g.purpose} group={g} />
      ))}
    </div>
  );
}

function ConsentCard({ group }: { group: ConsentGroupView }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [acked, setAcked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const active = group.activeCount > 0;
  const copy = WITHDRAW_COPY[group.impact];
  const needsAck = Boolean(copy.ackLabel);

  function openConfirm() {
    setError(null);
    setAcked(false);
    setConfirming(true);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await withdrawConsent(group.purpose);
      if (result.ok) {
        setConfirming(false);
        setAcked(false);
        setDone(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <section
      className="rounded-2xl p-4"
      style={{
        background: "var(--pg-white)",
        border: "1px solid var(--pg-border)",
        boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 4px 12px rgba(20,20,20,0.04)",
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
          style={{
            background: active ? "var(--pg-ink-50)" : "var(--pg-ink-100)",
            color: active ? "var(--pg-ink-700)" : "var(--pg-ink-500)",
          }}
        >
          <Icon name={group.icon} size={16} stroke={2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14px] font-extrabold tracking-[-0.01em] text-pg-ink-900 m-0">
              {group.label}
            </h3>
            <StatusPill active={active} />
          </div>
          <p className="text-[12.5px] text-pg-ink-500 leading-snug mt-1 mb-0">
            {group.blurb}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {group.wordings.map((w) => (
          <Wording key={w.key} wording={w} />
        ))}
      </div>

      {!active && group.lastWithdrawnLabel && (
        <p className="text-[12px] text-pg-ink-500 leading-snug mt-3 mb-0">
          Kamu menarik persetujuan ini pada {group.lastWithdrawnLabel}. Catatannya
          sengaja kami simpan supaya kamu punya bukti apa yang pernah kamu
          setujui dan kapan kamu menariknya.
        </p>
      )}

      {/* Bridges the gap between a successful write and router.refresh() landing:
          without it the card would still read "Aktif" for a beat, as if nothing
          had happened. Falls away on its own once the server data catches up. */}
      {done && active && (
        <div
          className="mt-3 px-3 py-2.5 rounded-lg text-[12.5px] flex items-start gap-2"
          style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
        >
          <Icon name="check" size={15} stroke={2.4} />
          <span>Persetujuan kamu sudah ditarik.</span>
        </div>
      )}

      {active && !confirming && !done && (
        <div className="mt-3.5">
          <button
            type="button"
            onClick={openConfirm}
            aria-expanded={false}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 text-[13px] font-bold rounded-xl border-[1.5px] bg-transparent cursor-pointer"
            style={{ borderColor: "var(--pg-ink-200)", color: "var(--pg-ink-900)" }}
          >
            <Icon name="x" size={14} stroke={2.4} />
            Tarik persetujuan
          </button>
        </div>
      )}

      {active && confirming && (
        <div
          className="mt-3.5 rounded-xl p-3.5"
          style={
            group.impact === "placement"
              ? {
                  background: "var(--pg-warn-bg)",
                  border: "1px solid var(--pg-warn)",
                }
              : {
                  background: "var(--pg-ink-50)",
                  border: "1px solid var(--pg-ink-100)",
                }
          }
        >
          <div className="flex items-start gap-2">
            <span
              className="shrink-0 mt-0.5"
              style={{
                color:
                  group.impact === "placement"
                    ? "var(--pg-warn)"
                    : "var(--pg-ink-700)",
              }}
            >
              <Icon
                name={group.impact === "placement" ? "warn" : "info"}
                size={16}
                stroke={2.2}
              />
            </span>
            <h4
              className="text-[13px] font-extrabold tracking-[-0.005em] m-0"
              style={{
                color:
                  group.impact === "placement"
                    ? "var(--pg-warn)"
                    : "var(--pg-ink-900)",
              }}
            >
              {copy.title}
            </h4>
          </div>

          <ul className="mt-2 mb-0 pl-4 flex flex-col gap-1.5 list-disc">
            {copy.points.map((p) => (
              <li key={p} className="text-[12.5px] leading-snug text-pg-ink-700">
                {p}
              </li>
            ))}
          </ul>

          {needsAck && (
            <label className="flex items-start gap-2.5 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acked}
                onChange={(e) => setAcked(e.target.checked)}
                className="mt-0.5 w-[18px] h-[18px] shrink-0 cursor-pointer"
                style={{ accentColor: "var(--pg-red-600)" }}
              />
              <span className="text-[12.5px] font-bold leading-snug text-pg-ink-900">
                {copy.ackLabel}
              </span>
            </label>
          )}

          {error && (
            <div
              className="mt-3 px-3 py-2.5 rounded-lg text-[12.5px] flex items-start gap-2"
              style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
            >
              <Icon name="warn" size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 mt-3.5">
            <Button
              type="button"
              variant="ghost"
              small
              onClick={() => {
                setConfirming(false);
                setError(null);
              }}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              small
              onClick={submit}
              disabled={isPending || (needsAck && !acked)}
            >
              {isPending ? "Memproses..." : copy.confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[9.5px] font-bold uppercase tracking-[0.06em]"
      style={
        active
          ? { background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }
          : { background: "var(--pg-ink-100)", color: "var(--pg-ink-500)" }
      }
    >
      {active ? (
        <>
          <Icon name="check" size={9} stroke={3} /> Aktif
        </>
      ) : (
        "Ditarik"
      )}
    </span>
  );
}

/** Grants arrive newest-first, so grants[0] is the most recent one. */
function summarise(grants: GrantView[]): string {
  if (grants.length === 1) {
    const only = grants[0];
    const base = only.grantedLabel
      ? `disetujui ${only.grantedLabel}`
      : "tanggal gak tercatat";
    return only.withdrawnLabel ? `${base} · ditarik ${only.withdrawnLabel}` : base;
  }

  const latest = grants.find((g) => g.grantedLabel)?.grantedLabel;
  const base = latest
    ? `disetujui ${grants.length} kali, terakhir ${latest}`
    : `disetujui ${grants.length} kali`;

  const withdrawn = grants.filter((g) => g.withdrawnLabel).length;
  if (withdrawn === 0) return base;
  if (withdrawn === grants.length) return `${base} · semuanya sudah ditarik`;
  return `${base} · ${withdrawn} sudah ditarik`;
}

/**
 * The verbatim sentence, quoted. This is the whole point of the ledger: the
 * candidate sees the exact wording they agreed to, not our summary of it.
 */
function Wording({ wording }: { wording: WordingView }) {
  return (
    <div
      className="rounded-xl px-3.5 py-3"
      style={{
        background: "var(--pg-paper)",
        borderLeft: "3px solid var(--pg-ink-200)",
      }}
    >
      <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] text-pg-ink-500 mb-1.5">
        Yang kamu setujui
      </div>
      <p className="text-[12.5px] leading-relaxed text-pg-ink-900 m-0">
        &ldquo;{wording.text}&rdquo;
      </p>
      <div className="mt-2 font-mono text-[10px] tracking-[0.04em] text-pg-ink-500">
        Versi {wording.version} · {summarise(wording.grants)}
      </div>

      {/* One wording can cover many grant events (one per lamaran). The summary
          above stays readable; nothing is hidden, the individual dates just
          move behind a disclosure so a 14-row ledger does not bury the
          sentence it belongs to. */}
      {wording.grants.length > 1 && (
        <details className="mt-1.5">
          <summary className="font-mono text-[10px] font-bold tracking-[0.04em] text-pg-ink-700 cursor-pointer">
            Lihat semua tanggal
          </summary>
          <div className="mt-1.5 flex flex-col gap-0.5">
            {wording.grants.map((g, i) => (
              <div
                key={`${wording.key}-${i}`}
                className="font-mono text-[10px] tracking-[0.04em] text-pg-ink-500"
              >
                {g.grantedLabel ? `Disetujui ${g.grantedLabel}` : "Tanggal gak tercatat"}
                {g.withdrawnLabel ? ` · ditarik ${g.withdrawnLabel}` : ""}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
