import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import { getApplicationStatus } from "@/lib/applicationStatus";
import { BerandaTopBar, SectionHead } from "@/components/pg/candidate/BerandaShared";
import {
  COUNTRY_FLAG,
  COUNTRY_LABEL as COUNTRY_LABEL_PORTAL,
  COUNTRY_TINT,
  normalizeCountry,
} from "@/components/pg/candidate/LowonganTiles";
import { positionHeroUrl, countryImageUrl } from "@perantauglobal/db/media";

export const dynamic = "force-dynamic";

type ApplicationRow = {
  id: string;
  position_slug: string;
  pipeline_stage: string;
  created_at: string;
  positions: { name: string; country: string } | null;
};

export default async function ApplicationsListPage() {
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const { data: appsData } = await supabase
    .from("applications")
    .select("id, position_slug, pipeline_stage, created_at, positions (name, country)")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  const applications = (appsData ?? []) as unknown as ApplicationRow[];

  // Per-application hard_pass in ONE query via application_readiness_view (same
  // source the dashboard/journey.ts uses), instead of N×3 per-app completeness
  // calls — render time was scaling linearly with the candidate's lamaran count.
  const { data: readinessData } = await supabase
    .from("application_readiness_view")
    .select("application_id, hard_pass")
    .eq("candidate_id", candidateId);
  const hardPassByAppId = new Map<string, boolean>(
    ((readinessData ?? []) as Array<{ application_id: string; hard_pass: boolean }>).map(
      (r) => [r.application_id, r.hard_pass],
    ),
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <BerandaTopBar />
      <main className="flex-1 pb-8 pt-1">
        <div className="px-5 pb-3.5">
          <h1
            className="font-extrabold tracking-[-0.025em] leading-[1.1] text-pg-ink-900 m-0 text-balance"
            style={{ fontSize: "clamp(22px, 6vw, 28px)" }}
          >
            Lamaran kamu
          </h1>
          <p className="text-[13px] text-pg-ink-500 mt-1 m-0">
            {applications.length} lamaran · semua proses kamu di Perantau Global
          </p>
        </div>

        <section className="px-5">
          {applications.length === 0 ? (
            <div
              className="rounded-[16px] p-6 text-center bg-pg-white"
              style={{ border: "1px dashed var(--pg-ink-200)" }}
            >
              <div className="text-[15px] font-extrabold text-pg-ink-900 tracking-[-0.01em]">
                Belum ada lamaran
              </div>
              <div className="text-[13px] text-pg-ink-500 mt-1.5 leading-snug">
                Mulai jelajahi posisi yang cocok untuk kamu di Lowongan.
              </div>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-4 py-2.5 mt-4 text-[13px] font-extrabold text-white no-underline rounded-[10px]"
                style={{ background: "var(--pg-red-600)" }}
              >
                Cari lowongan <Icon name="arrow_right" size={14} />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <SectionHead title={`${applications.length} lamaran`} sub="Terbaru di atas" />
              {applications.map((a) => {
                const status = getApplicationStatus({
                  pipelineStage: a.pipeline_stage,
                  hardPass: hardPassByAppId.get(a.id),
                });
                const muted = status.key === "rejected";
                const needsDocs = status.key === "needs_docs";
                const countryKey =
                  a.positions?.country ? normalizeCountry(a.positions.country) : null;
                const countryLabel =
                  countryKey ? COUNTRY_LABEL_PORTAL[countryKey] : a.positions?.country ?? "—";
                const heroImg = countryKey
                  ? `url(${positionHeroUrl(a.position_slug)}), url(${countryImageUrl(countryKey)})`
                  : `url(${positionHeroUrl(a.position_slug)})`;
                const tintBg = countryKey ? COUNTRY_TINT[countryKey] : "var(--pg-ink-700)";

                return (
                  <Link
                    key={a.id}
                    href={`/applications/${a.id}`}
                    className="flex gap-3 p-3 rounded-[14px] bg-pg-white no-underline text-pg-ink-900 transition-transform hover:-translate-y-0.5"
                    style={{
                      border: "1px solid var(--pg-ink-100)",
                      boxShadow:
                        "0 1px 2px rgba(20,16,12,0.04), 0 8px 24px rgba(20,16,12,0.06)",
                      opacity: muted ? 0.7 : 1,
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-[12px] overflow-hidden shrink-0 bg-cover bg-center"
                      style={{
                        backgroundColor: tintBg,
                        backgroundImage: heroImg,
                      }}
                      aria-hidden
                    />
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] text-pg-ink-500">
                            {countryKey ? `${COUNTRY_FLAG[countryKey]} ${countryLabel}` : countryLabel}
                          </span>
                          <span className="text-[15px] font-extrabold tracking-[-0.012em] text-pg-ink-900 truncate">
                            {a.positions?.name ?? a.position_slug}
                          </span>
                        </div>
                        <StagePill tone={status.tone}>{status.label}</StagePill>
                      </div>
                      {needsDocs ? (
                        <div
                          className="inline-flex items-center gap-2 mt-1.5 px-2.5 py-1.5 rounded-[8px] text-[11.5px] font-semibold w-fit"
                          style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
                        >
                          <span
                            aria-hidden
                            className="inline-block w-1.5 h-1.5 rounded-full bg-pg-red-600"
                          />
                          Lengkapi syarat lamaran →
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="font-mono text-[10.5px] text-pg-ink-500 tracking-[0.02em]">
                            Dilamar{" "}
                            {new Date(a.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="font-mono text-[10.5px] font-bold text-pg-ink-700 tracking-[0.04em]">
                            Detail ›
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

function StagePill({
  tone,
  children,
}: {
  tone: "warn" | "info" | "ok" | "err" | "mute";
  children: React.ReactNode;
}) {
  const colors =
    tone === "warn"
      ? { bg: "var(--pg-warn-soft-bg)", fg: "var(--pg-warn-soft-fg)" }
      : tone === "info"
      ? { bg: "var(--pg-info-bg)", fg: "var(--pg-info)" }
      : tone === "ok"
      ? { bg: "var(--pg-ok-soft-bg)", fg: "var(--pg-ok-soft-fg)" }
      : tone === "err"
      ? { bg: "var(--pg-err-bg)", fg: "var(--pg-err)" }
      : { bg: "var(--pg-ink-50)", fg: "var(--pg-ink-tertiary)" };
  return (
    <span
      className="inline-flex shrink-0 px-2 py-0.5 rounded text-[9.5px] font-bold tracking-[0.06em] uppercase whitespace-nowrap"
      style={{
        background: colors.bg,
        color: colors.fg,
        fontFamily: "var(--font-mono)",
      }}
    >
      {children}
    </span>
  );
}
