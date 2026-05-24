import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import { getApplicationCompleteness } from "@/lib/applicationCompleteness";
import { getApplicationStatus } from "@/lib/applicationStatus";

export const dynamic = "force-dynamic";

type PositionRow = {
  slug: string;
  name: string;
  country: string;
  description: string | null;
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const { data: appData } = await supabase
    .from("applications")
    .select(
      "id, candidate_id, position_slug, pipeline_stage, created_at, answers, positions (slug, name, country, description)"
    )
    .eq("id", id)
    .eq("candidate_id", candidateId)
    .single();
  const application = appData as unknown as ApplicationRow | null;
  if (!application || !application.positions) notFound();

  const [historyRes, completeness] = await Promise.all([
    supabase
      .from("application_status_history")
      .select("id, from_stage, to_stage, changed_at, public_note")
      .eq("application_id", application.id)
      .order("changed_at", { ascending: false }),
    getApplicationCompleteness(application.id, supabase),
  ]);

  const history = (historyRes.data ?? []) as Array<{
    id: string;
    from_stage: string | null;
    to_stage: string;
    changed_at: string;
    public_note: string | null;
  }>;

  const position = application.positions;
  const { fields: requirements, score_pct, hard_pass } = completeness;
  const totalReqs = requirements.length;
  const passedReqs = requirements.filter((r) => r.passed).length;
  const openCount = totalReqs - passedReqs;

  const status = getApplicationStatus({
    pipelineStage: application.pipeline_stage,
    hardPass: hard_pass,
  });
  const isRejected = status.key === "rejected";
  const showLengkapi = !isRejected && openCount > 0;

  // First missing required (= hard) for inline message
  const firstMissingHard = requirements.find(
    (r) => !r.passed && r.importance === "required",
  );

  // Display rows for "Jawaban kamu" — sourced from per-application
  // completeness (applications.answers + position_application_fields). Per
  // Fase 5: no longer merges candidates.profile_data.credentials.
  const answerRows = requirements.map((f) => {
    const raw = f.value ?? "";
    const opt = f.options?.find((o) => o.value === raw);
    return {
      key: f.field_key,
      label: f.field_label,
      value: opt?.label ?? raw,
      hasValue: f.passed,
    };
  });

  // Public timeline: only entries with a public note from the recruitment team.
  // Internal pipeline_stage transitions are deliberately hidden from candidates.
  const publicHistory = history.filter((h) => h.public_note);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <TopBarApp title="Status lamaran" back backHref="/applications" />

      <main className="flex-1 pb-8">
        {/* Header */}
        <section className="px-5 pt-3">
          <div
            className="text-[11px] font-semibold tracking-[0.1em] uppercase"
            style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
          >
            {position.name} — {COUNTRY_LABEL[position.country] ?? position.country}
          </div>
          <StatusBadge tone={status.tone} className="mt-3">
            {status.label}
          </StatusBadge>
          <h1 className="text-[28px] font-extrabold tracking-[-0.025em] mt-2 text-pg-ink-primary leading-tight">
            {status.headline}
          </h1>
          <p className="text-[14px] text-pg-ink-tertiary mt-2 leading-relaxed">
            {status.description}
          </p>
        </section>

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
                  <span>Tinggal {firstMissingHard.field_label} biar lamaran dilanjut tim recruitment.</span>
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

        {/* Perjalanan lamaran — only public-facing events, never internal stages */}
        <section className="px-5 pt-6">
          <div
            className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-1"
            style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
          >
            Perjalanan lamaran
          </div>
          <div className="text-[13px] text-pg-ink-tertiary mb-3">
            Update dari tim recruitment akan muncul di sini.
          </div>
          <div
            className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3.5"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            {publicHistory.map((h, i) => {
              const isLatest = i === 0;
              const isToday =
                new Date(h.changed_at).toDateString() === new Date().toDateString();
              return (
                <TimelineItem
                  key={h.id}
                  date={h.changed_at}
                  isLatest={isLatest}
                  isToday={isToday}
                  title="Update dari tim recruitment"
                  note={h.public_note}
                />
              );
            })}
            <TimelineItem
              date={application.created_at}
              isLatest={publicHistory.length === 0}
              isToday={
                new Date(application.created_at).toDateString() ===
                new Date().toDateString()
              }
              title="Lamaran terkirim"
              note={
                publicHistory.length === 0
                  ? "Tim akan update setelah review profil kamu."
                  : null
              }
            />
          </div>
        </section>

        {/* Jawaban kamu — driven by position_application_fields, hidden if none */}
        {answerRows.length > 0 && (
          <section className="px-5 pt-6">
            <div className="flex items-baseline justify-between mb-1">
              <div
                className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
              >
                Jawaban kamu
              </div>
              <Link
                href="/profile"
                className="text-[12px] font-bold text-pg-red-600 no-underline"
              >
                Edit di profil
              </Link>
            </div>
            <div className="text-[13px] text-pg-ink-tertiary mb-3">
              Diambil dari profil kamu. Update profil untuk ubah.
            </div>
            <div
              className="bg-pg-white rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--pg-border)" }}
            >
              {answerRows.map((row, i) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between px-4 py-3.5"
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid var(--pg-border-soft)",
                  }}
                >
                  <span className="text-[13px] text-pg-ink-secondary">{row.label}</span>
                  <span
                    className={`text-[13px] font-semibold text-right ml-3 truncate max-w-[60%] ${
                      row.hasValue ? "text-pg-ink-primary" : "italic"
                    }`}
                    style={{ color: row.hasValue ? undefined : "var(--pg-ink-quaternary)" }}
                  >
                    {row.hasValue ? row.value : "Belum diisi"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

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

function StatusBadge({
  tone,
  className,
  children,
}: {
  tone: "warn" | "info" | "ok" | "mute";
  className?: string;
  children: React.ReactNode;
}) {
  const colors =
    tone === "warn"
      ? { bg: "var(--pg-warn-soft-bg)", fg: "var(--pg-warn-soft-fg)", dot: "var(--pg-warn-soft-fg)" }
      : tone === "ok"
      ? { bg: "var(--pg-ok-soft-bg)", fg: "var(--pg-ok-soft-fg)", dot: "var(--pg-ok-soft-fg)" }
      : tone === "mute"
      ? { bg: "var(--pg-ink-50)", fg: "var(--pg-ink-tertiary)", dot: "var(--pg-ink-tertiary)" }
      : { bg: "var(--pg-red-soft-bg)", fg: "var(--pg-red-600)", dot: "var(--pg-red-600)" };
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-[0.06em] uppercase ${className ?? ""}`}
      style={{ background: colors.bg, color: colors.fg, fontFamily: "var(--font-mono)" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.dot }} />
      {children}
    </div>
  );
}

function TimelineItem({
  date,
  isLatest,
  isToday,
  title,
  note,
}: {
  date: string;
  isLatest: boolean;
  isToday: boolean;
  title: string;
  note: string | null;
}) {
  return (
    <div className="grid grid-cols-[16px_1fr] gap-3">
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
          {new Date(date).toLocaleDateString("id-ID", {
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
        <div className="text-[15px] font-bold text-pg-ink-primary mt-0.5">{title}</div>
        {note && (
          <div className="text-[13px] text-pg-ink-secondary mt-1.5 leading-tight">{note}</div>
        )}
      </div>
    </div>
  );
}
