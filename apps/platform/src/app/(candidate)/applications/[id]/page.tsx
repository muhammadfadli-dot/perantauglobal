import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import { getRequirementsWithStatus } from "@/lib/readiness";

export const dynamic = "force-dynamic";

type PositionRow = {
  slug: string;
  name: string;
  country: string;
  description: string | null;
  requirements: unknown;
};

type ApplicationRow = {
  id: string;
  candidate_id: string;
  position_slug: string;
  pipeline_stage: string;
  created_at: string;
  answers: unknown;
  positions: PositionRow | null;
};

const COUNTRY_LABEL: Record<string, string> = {
  saudi_arabia: "Arab Saudi",
  japan: "Jepang",
  taiwan: "Taiwan",
  indonesia: "Indonesia",
  any: "Global",
};

const ANSWER_LABEL: Record<string, string> = {
  motivation: "Motivasi",
  earliest_start: "Siap berangkat",
  visa_status: "Status visa",
  referral: "Tertarik dari mana",
  asrama_6mo: "Bersedia tinggal di asrama 6 bln",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

const PHASES = [
  {
    key: "diseleksi" as const,
    label: "Sedang diseleksi",
    short: "Sekarang",
    desc: "Profil kamu lagi ditinjau tim recruitment. Update bakal muncul di sini.",
    includes: ["applied", "screening", "voice_screen", "document_check"],
  },
  {
    key: "wawancara" as const,
    label: "Wawancara & dokumen",
    short: "Wawancara",
    desc: "Sedang dijadwalkan wawancara dan persiapan dokumen kerja.",
    includes: ["interview", "briefing", "trial"],
  },
  {
    key: "diterima" as const,
    label: "Diterima",
    short: "Diterima",
    desc: "Kamu diterima! Selamat. Tim akan kabari proses keberangkatan.",
    includes: ["selected", "training", "deployed", "active"],
  },
  {
    key: "selesai" as const,
    label: "Selesai",
    short: "Selesai",
    desc: "Selamat sudah berangkat. Semoga sukses di tempat baru.",
    includes: ["active", "deployed"],
  },
];

const REJECTED_PHASE = {
  label: "Tidak terpilih",
  desc: "Sayang sekali, kamu belum terpilih kali ini. Tetap semangat — coba lowongan lain di Jelajah.",
};

function phaseIdx(internal: string): number {
  if (["rejected", "exit"].includes(internal)) return -1;
  for (let i = 0; i < PHASES.length; i++) {
    if (PHASES[i]!.includes.includes(internal)) return i;
  }
  return 0;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const { data: appData } = await supabase
    .from("applications")
    .select(
      "id, candidate_id, position_slug, pipeline_stage, created_at, answers, positions (slug, name, country, description, requirements)"
    )
    .eq("id", id)
    .eq("candidate_id", candidateId)
    .single();
  const application = appData as unknown as ApplicationRow | null;
  if (!application || !application.positions) notFound();

  const { data: historyData } = await supabase
    .from("application_status_history")
    .select("id, from_stage, to_stage, changed_at, public_note")
    .eq("application_id", application.id)
    .order("changed_at", { ascending: false });
  const history = (historyData ?? []) as Array<{
    id: string;
    from_stage: string | null;
    to_stage: string;
    changed_at: string;
    public_note: string | null;
  }>;

  const position = application.positions;
  const currentIdx = phaseIdx(application.pipeline_stage);
  const isRejected = currentIdx === -1;
  const current = isRejected ? null : PHASES[currentIdx];

  const { requirements, score_pct, hard_pass } = await getRequirementsWithStatus(
    candidateId,
    position.slug,
    supabase
  );
  const totalReqs = requirements.length;
  const passedReqs = requirements.filter((r) => r.passed).length;
  const openCount = totalReqs - passedReqs;
  const showLengkapi = !isRejected && openCount > 0;

  // Find first missing hard requirement for inline message
  const firstMissingHard = requirements.find((r) => !r.passed && r.importance === "hard");

  const answers = (application.answers ?? {}) as Record<string, string>;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <TopBarApp title="Status lamaran" back backHref="/applications" bell />

      <main className="flex-1 pb-8">
        {/* Header */}
        <section className="px-5 pt-3">
          <div
            className="text-[11px] font-semibold tracking-[0.1em] uppercase"
            style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
          >
            {position.name} — {COUNTRY_LABEL[position.country] ?? position.country}
          </div>
          {!isRejected ? (
            <>
              <div
                className="inline-flex items-center gap-1.5 mt-3 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-[0.06em] uppercase"
                style={{
                  background: "var(--pg-red-soft-bg)",
                  color: "var(--pg-red-600)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--pg-red-600)" }}
                />
                Tahap {currentIdx + 1} dari 4
              </div>
              <h1 className="text-[28px] font-extrabold tracking-[-0.025em] mt-2 text-pg-ink-primary leading-tight">
                {current!.label}
              </h1>
              <p className="text-[14px] text-pg-ink-tertiary mt-2 leading-relaxed">
                {current!.desc}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[28px] font-extrabold tracking-[-0.025em] mt-3 text-pg-ink-primary">
                {REJECTED_PHASE.label}
              </h1>
              <p className="text-[14px] text-pg-ink-tertiary mt-2 leading-relaxed">
                {REJECTED_PHASE.desc}
              </p>
            </>
          )}
        </section>

        {/* 4-step circle progress */}
        {!isRejected && (
          <section className="px-5 pt-5">
            <div className="flex items-start justify-between">
              {PHASES.map((p, i) => {
                const done = i < currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={p.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className="w-6 h-6 rounded-full grid place-items-center shrink-0"
                        style={{
                          background: done
                            ? "var(--pg-red-600)"
                            : active
                            ? "var(--pg-red-600)"
                            : "transparent",
                          border: !active && !done ? "1.5px solid var(--pg-ink-200)" : "none",
                        }}
                      >
                        {done && <Icon name="check" size={11} stroke={3} className="text-white" />}
                        {active && (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className="text-[11px] font-bold whitespace-nowrap"
                        style={{
                          color: active
                            ? "var(--pg-red-600)"
                            : done
                            ? "var(--pg-ink-primary)"
                            : "var(--pg-ink-quaternary)",
                        }}
                      >
                        {p.short}
                      </span>
                    </div>
                    {i < PHASES.length - 1 && (
                      <div
                        className="h-px flex-1 mx-1.5"
                        style={{
                          background: i < currentIdx ? "var(--pg-red-600)" : "var(--pg-ink-200)",
                          marginTop: "11px",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Persyaratan posisi — red soft card */}
        {!isRejected && totalReqs > 0 && (
          <section className="px-5 pt-6">
            <div
              className="rounded-2xl p-5 flex flex-col gap-3"
              style={{ background: "var(--pg-red-soft-bg)" }}
            >
              <div className="flex items-baseline justify-between">
                <div
                  className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                  style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
                >
                  Persyaratan posisi
                </div>
                <div
                  className="text-[10px] font-bold"
                  style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
                >
                  {score_pct}%
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[36px] font-extrabold leading-[40px] text-pg-red-700 tabular-nums">
                  {passedReqs}
                </span>
                <span className="text-[16px] font-semibold text-pg-ink-tertiary">
                  / {totalReqs} syarat lengkap
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(215,38,47,0.15)" }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${(passedReqs / totalReqs) * 100}%`,
                    background: "var(--pg-red-600)",
                  }}
                />
              </div>
              {firstMissingHard && (
                <div className="flex items-start gap-2 text-[13px] text-pg-ink-secondary">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                    style={{ background: "var(--pg-red-600)" }}
                  />
                  <span>Tinggal {firstMissingHard.label} biar lamaran dilanjut tim recruitment.</span>
                </div>
              )}
              {showLengkapi && (
                <Link
                  href={`/applications/${id}/lengkapi`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 mt-1 rounded-xl text-[14px] font-bold text-white no-underline"
                  style={{ background: "var(--pg-red-600)" }}
                >
                  Lengkapi sekarang <Icon name="arrow_right" size={14} />
                </Link>
              )}
              {hard_pass && (
                <div
                  className="px-3 py-2 rounded-lg text-[12px] font-semibold flex items-center gap-2"
                  style={{ background: "var(--pg-ok-soft-bg)", color: "var(--pg-ok-soft-fg)" }}
                >
                  <Icon name="check" size={13} stroke={2.5} />
                  Semua syarat utama terpenuhi
                </div>
              )}
            </div>
          </section>
        )}

        {/* Perjalanan lamaran */}
        <section className="px-5 pt-6">
          <div
            className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-1"
            style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
          >
            Perjalanan lamaran
          </div>
          <div className="text-[13px] text-pg-ink-tertiary mb-3">
            Setiap update bakal muncul di sini.
          </div>
          <div
            className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3.5"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            {history.length === 0 && (
              <div className="text-[13px] text-pg-ink-tertiary italic">
                Belum ada update. Tim akan update setelah review profil kamu.
              </div>
            )}
            {history.map((h, i) => {
              const phaseIdxFor = phaseIdx(h.to_stage);
              const phaseLabel =
                phaseIdxFor === -1
                  ? "Tidak terpilih"
                  : PHASES[phaseIdxFor]?.label ?? h.to_stage;
              const isLatest = i === 0;
              const isToday =
                new Date(h.changed_at).toDateString() === new Date().toDateString();
              return (
                <div key={h.id} className="grid grid-cols-[16px_1fr] gap-3">
                  <div className="relative pt-1.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: isLatest ? "var(--pg-red-600)" : "transparent",
                        border: isLatest ? "none" : "1.5px solid var(--pg-ink-300)",
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-[11px] font-semibold flex items-center gap-2"
                      style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                    >
                      {new Date(h.changed_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {isToday && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-[0.04em] uppercase"
                          style={{
                            background: "var(--pg-red-soft-bg)",
                            color: "var(--pg-red-600)",
                          }}
                        >
                          Hari ini
                        </span>
                      )}
                    </div>
                    <div className="text-[15px] font-bold text-pg-ink-primary mt-0.5">
                      {phaseLabel}
                    </div>
                    {h.public_note && (
                      <div className="text-[13px] text-pg-ink-secondary mt-1.5 leading-tight">
                        {h.public_note}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Jawaban kamu — table style */}
        <section className="px-5 pt-6">
          <div className="flex items-baseline justify-between mb-1">
            <div
              className="text-[10px] font-semibold tracking-[0.12em] uppercase"
              style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
            >
              Jawaban kamu
            </div>
            <Link
              href={`/applications/${id}/lengkapi`}
              className="text-[12px] font-bold text-pg-red-600 no-underline"
            >
              Edit
            </Link>
          </div>
          <div className="text-[13px] text-pg-ink-tertiary mb-3">Bisa di-edit kapan aja.</div>
          <div
            className="bg-pg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            {Object.entries(ANSWER_LABEL).map(([key, label], i) => {
              const value = answers[key];
              return (
                <div
                  key={key}
                  className="flex items-center justify-between px-4 py-3.5"
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid var(--pg-border-soft)",
                  }}
                >
                  <span className="text-[13px] text-pg-ink-secondary">{label}</span>
                  <span
                    className={`text-[13px] font-semibold text-right ml-3 truncate max-w-[60%] ${
                      value ? "text-pg-ink-primary" : "italic"
                    }`}
                    style={{ color: value ? undefined : "var(--pg-ink-quaternary)" }}
                  >
                    {value || "Belum diisi"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Ada pertanyaan? */}
        <section className="px-5 pt-6">
          <div
            className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <h3 className="text-[16px] font-extrabold tracking-[-0.01em] text-pg-ink-primary">
              Ada pertanyaan?
            </h3>
            <p className="text-[13px] text-pg-ink-tertiary">
              Tim recruitment Perantau Global siap bantu kamu via WhatsApp atau email.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl text-[13px] font-bold text-pg-ink-primary no-underline"
                style={{ border: "1.5px solid var(--pg-border)" }}
              >
                <Icon name="phone" size={14} />
                WhatsApp
              </a>
              <a
                href="mailto:halo@perantauglobal.com"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl text-[13px] font-bold text-pg-ink-primary no-underline"
                style={{ border: "1.5px solid var(--pg-border)" }}
              >
                <Icon name="mail" size={14} />
                Email
              </a>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
