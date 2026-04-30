import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import AnswersForm from "./AnswersForm";
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

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Map internal stage → 4-stage user-visible (per SPEC.md §3.8) */
function userStage(internal: string) {
  const phases = [
    {
      key: "diseleksi" as const,
      label: "Sedang diseleksi",
      desc: "Tim recruiter sedang review profil & jawaban kamu. Biasanya 3–5 hari kerja.",
      includes: ["applied", "screening", "voice_screen", "document_check"],
    },
    {
      key: "wawancara" as const,
      label: "Wawancara & dokumen",
      desc: "Sedang dijadwalkan wawancara dan persiapan dokumen kerja.",
      includes: ["interview", "briefing", "trial"],
    },
    {
      key: "diterima" as const,
      label: "Diterima",
      desc: "Kamu diterima! Selamat. Tim akan kabari proses keberangkatan.",
      includes: ["selected", "training", "deployed", "active"],
    },
    {
      key: "tidak" as const,
      label: "Tidak lolos",
      desc: "Sayang sekali, kamu belum lolos kali ini. Tetap semangat — coba lowongan lain di Jelajah.",
      includes: ["rejected", "exit"],
    },
  ];
  const idx = phases.findIndex((p) => p.includes.includes(internal));
  return { phases, currentIdx: idx >= 0 ? idx : 0 };
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

  // Real status history from application_status_history. RLS scopes to own.
  const { data: historyData } = await supabase
    .from("application_status_history")
    .select("id, from_stage, to_stage, changed_at, public_note")
    .eq("application_id", application.id)
    .order("changed_at", { ascending: true });
  const history = (historyData ?? []) as Array<{
    id: string;
    from_stage: string | null;
    to_stage: string;
    changed_at: string;
    public_note: string | null;
  }>;

  const position = application.positions;
  const stage = userStage(application.pipeline_stage);
  const current = stage.phases[stage.currentIdx];
  const isFailed = current.key === "tidak";

  // Live readiness against position requirements (compute_readiness_v3).
  const { requirements, score_pct, hard_pass } = await getRequirementsWithStatus(
    candidateId,
    position.slug,
    supabase,
  );
  const openCount = requirements.filter((r) => !r.passed).length;
  const showLengkapi = !isFailed && openCount > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <TopBarApp title="Status lamaran" back backHref="/dashboard" bell />

      <main className="flex-1 pb-6">
        <section className="px-5 pt-4">
          <div className="text-[12px] font-bold tracking-[0.1em] uppercase text-pg-ink-400">
            {position.country}
          </div>
          <h1 className="text-[22px] font-extrabold tracking-tight mt-1.5">{position.name}</h1>
        </section>

        {/* 4-stage progress card */}
        <section className="px-5 pt-4">
          <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
            <div className="flex gap-1.5 mb-4">
              {stage.phases.map((p, i) => {
                let color = "var(--pg-ink-100)";
                if (isFailed) {
                  color = i <= stage.currentIdx ? "var(--pg-err)" : "var(--pg-ink-100)";
                } else if (i < stage.currentIdx) color = "var(--pg-ok)";
                else if (i === stage.currentIdx) color = "var(--pg-warn)";
                return (
                  <div key={p.key} className="flex-1 h-1.5 rounded-full" style={{ background: color }} />
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full grid place-items-center shrink-0"
                style={{
                  background: isFailed ? "var(--pg-err-bg)" : "var(--pg-warn-bg)",
                  color: isFailed ? "var(--pg-err)" : "var(--pg-warn)",
                }}
              >
                <Icon name={isFailed ? "x" : "clock"} size={20} stroke={2.2} />
              </div>
              <div>
                <div className="text-[17px] font-extrabold tracking-tight">{current.label}</div>
                <div className="text-sm text-pg-ink-500 mt-0.5 leading-relaxed">
                  {current.desc}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline — real history from application_status_history */}
        <section className="px-5 pt-6">
          <h2 className="text-lg font-bold tracking-tight">Perjalanan lamaran</h2>
          <div className="mt-3.5">
            {history.map((h, i, arr) => {
              const phaseLabel = userStage(h.to_stage).phases[userStage(h.to_stage).currentIdx]?.label ?? h.to_stage;
              return (
                <div
                  key={h.id}
                  className={`grid grid-cols-[28px_1fr] gap-3 ${
                    i === arr.length - 1 ? "" : "pb-5"
                  } relative`}
                >
                  <div className="relative">
                    <div
                      className="w-6 h-6 rounded-full grid place-items-center mt-1 text-white"
                      style={{ background: "var(--pg-red-600)" }}
                    >
                      <Icon name="check" size={14} stroke={3} />
                    </div>
                    {i < arr.length - 1 && (
                      <div
                        className="absolute left-[11px] top-[30px] -bottom-5 w-0.5"
                        style={{ background: "var(--pg-red-600)" }}
                      />
                    )}
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-pg-ink-400">
                      {new Date(h.changed_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-[15px] font-bold text-pg-ink-900 mt-0.5">
                      {phaseLabel}
                    </div>
                    {h.public_note && (
                      <div className="text-sm text-pg-ink-700 mt-1 leading-relaxed bg-pg-ink-50 rounded-lg px-3 py-2.5">
                        <div className="text-[11px] font-bold tracking-wide uppercase text-pg-ink-500 mb-1">
                          Dari recruiter
                        </div>
                        {h.public_note}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Future phases (not yet reached) */}
            {stage.phases.slice(stage.currentIdx + 1).map((p) => (
              <div key={p.key} className="grid grid-cols-[28px_1fr] gap-3 pb-5 relative">
                <div className="relative">
                  <div
                    className="w-6 h-6 rounded-full grid place-items-center mt-1 bg-pg-white"
                    style={{ border: "2px solid var(--pg-ink-200)" }}
                  />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-pg-ink-400 mt-1">{p.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Persyaratan posisi (readiness v3) */}
        <section className="px-5 pt-6">
          <div className="flex justify-between items-baseline">
            <h2 className="text-lg font-bold tracking-tight">Persyaratan posisi</h2>
            <div className="text-sm font-bold text-pg-red-600">{score_pct}%</div>
          </div>
          <div className="mt-3 bg-pg-white border border-pg-ink-100 rounded-2xl p-4">
            <div className="grid gap-2.5">
              {requirements.map((req) => (
                <div key={req.key} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full grid place-items-center shrink-0"
                    style={{
                      background: req.passed
                        ? "var(--pg-ok-bg)"
                        : req.importance === "hard"
                          ? "var(--pg-err-bg)"
                          : "var(--pg-ink-50)",
                      color: req.passed
                        ? "var(--pg-ok)"
                        : req.importance === "hard"
                          ? "var(--pg-err)"
                          : "var(--pg-ink-400)",
                    }}
                  >
                    <Icon name={req.passed ? "check" : "x"} size={14} stroke={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{req.label}</div>
                    <div className="text-[12px] text-pg-ink-500 mt-0.5">
                      {req.passed
                        ? req.doc_passed && req.evidence_mode !== "self_declared"
                          ? "Terverifikasi via dokumen"
                          : "Sudah terpenuhi"
                        : req.importance === "hard"
                          ? "Wajib · belum lengkap"
                          : "Bonus · belum lengkap"}
                    </div>
                  </div>
                </div>
              ))}
              {requirements.length === 0 && (
                <div className="text-sm text-pg-ink-500">
                  Posisi ini tidak punya persyaratan khusus.
                </div>
              )}
            </div>
            {showLengkapi && (
              <Link
                href={`/applications/${id}/lengkapi`}
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 min-h-[48px] rounded-xl bg-pg-red-600 text-white font-bold text-sm hover:bg-pg-red-700 no-underline"
              >
                Lengkapi {openCount} persyaratan
                <Icon name="arrow_right" size={16} />
              </Link>
            )}
            {hard_pass && requirements.length > 0 && (
              <div
                className="mt-3 px-3 py-2 rounded-lg text-[12px] font-semibold flex items-center gap-2"
                style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
              >
                <Icon name="check" size={14} stroke={2.5} />
                Semua syarat utama terpenuhi
              </div>
            )}
          </div>
        </section>

        {/* Detail lamaran */}
        <section className="px-5 pt-6">
          <h2 className="text-lg font-bold tracking-tight">Jawaban kamu</h2>
          <div className="mt-3">
            <AnswersForm
              applicationId={application.id}
              initialAnswers={(application.answers ?? {}) as Record<string, string>}
            />
          </div>
        </section>

        {/* Contact */}
        <section className="px-5 pt-6">
          <div className="bg-pg-ink-50 rounded-xl p-4 flex gap-3 items-center">
            <Icon name="mail" size={20} className="text-pg-ink-500 shrink-0" />
            <div className="text-[13px] text-pg-ink-500 flex-1">
              Ada pertanyaan? Email kami di{" "}
              <a href="mailto:halo@perantauglobal.com" className="text-pg-red-600 font-bold">
                halo@perantauglobal.com
              </a>
            </div>
          </div>
        </section>

        <section className="px-5 pt-6">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-pg-red-600 font-bold text-sm no-underline"
          >
            Lihat lowongan lain <Icon name="arrow_right" size={16} />
          </Link>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
