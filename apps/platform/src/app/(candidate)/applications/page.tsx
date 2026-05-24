import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import { getApplicationStatus } from "@/lib/applicationStatus";
import { getApplicationCompleteness } from "@/lib/applicationCompleteness";

export const dynamic = "force-dynamic";

type ApplicationRow = {
  id: string;
  position_slug: string;
  pipeline_stage: string;
  created_at: string;
  positions: { name: string; country: string } | null;
};

const COUNTRY_LABEL: Record<string, string> = {
  saudi_arabia: "Arab Saudi",
  japan: "Jepang",
  taiwan: "Taiwan",
  indonesia: "Indonesia",
  any: "Global",
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

  // Per-application hard_pass — computed from applications.answers +
  // position_application_fields (Fase 6B: replaces legacy readiness_view).
  const hardPassByAppId = new Map<string, boolean>();
  await Promise.all(
    applications.map(async (a) => {
      const c = await getApplicationCompleteness(a.id, supabase);
      hardPassByAppId.set(a.id, c.hard_pass);
    }),
  );

  return (
    <div className="min-h-screen flex flex-col">
      <TopBarApp title="Lamaran kamu" />
      <main className="flex-1 pb-6">
        <section className="px-5 pt-4">
          <div
            className="text-[10px] font-semibold tracking-[0.12em] uppercase"
            style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
          >
            Semua lamaran
          </div>
          <h1 className="text-[28px] font-extrabold tracking-[-0.02em] mt-1 text-pg-ink-primary">
            {applications.length} lamaran
          </h1>
        </section>

        <section className="px-5 pt-4 flex flex-col gap-3">
          {applications.length === 0 ? (
            <div
              className="bg-pg-white rounded-2xl p-6 text-center"
              style={{ border: "1px solid var(--pg-border)" }}
            >
              <div className="text-[16px] font-bold text-pg-ink-primary">Belum ada lamaran</div>
              <div className="text-[13px] text-pg-ink-tertiary mt-1.5">
                Mulai jelajahi posisi yang cocok untuk kamu.
              </div>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-4 py-2.5 mt-4 text-[13px] font-bold text-white no-underline rounded-xl"
                style={{ background: "var(--pg-red-600)" }}
              >
                Cari lowongan <Icon name="arrow_right" size={14} />
              </Link>
            </div>
          ) : (
            applications.map((a) => {
              const status = getApplicationStatus({
                pipelineStage: a.pipeline_stage,
                hardPass: hardPassByAppId.get(a.id),
              });
              const muted = status.key === "rejected";
              const needsDocs = status.key === "needs_docs";
              return (
                <Link
                  key={a.id}
                  href={`/applications/${a.id}`}
                  className="block bg-pg-white rounded-2xl px-4 py-4 no-underline text-pg-ink-primary"
                  style={{
                    border: "1px solid var(--pg-border)",
                    opacity: muted ? 0.65 : 1,
                  }}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div
                        className="text-[10px] font-semibold tracking-[0.1em] uppercase"
                        style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                      >
                        {COUNTRY_LABEL[a.positions?.country ?? ""] ?? a.positions?.country}
                      </div>
                      <div className="text-[18px] font-extrabold tracking-[-0.01em] mt-0.5 truncate">
                        {a.positions?.name ?? a.position_slug}
                      </div>
                    </div>
                    <StagePill tone={status.tone}>{status.label}</StagePill>
                  </div>

                  {needsDocs && (
                    <div
                      className="flex items-center justify-between gap-2 mt-3 px-3 py-2.5 rounded-xl"
                      style={{ background: "var(--pg-red-soft-bg)" }}
                    >
                      <div className="flex items-center gap-2 text-[13px] text-pg-red-700 font-semibold">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--pg-red-600)" }}
                        />
                        Dokumen wajib belum lengkap
                      </div>
                      <span className="text-[12px] font-bold text-pg-red-600">Lengkapi ›</span>
                    </div>
                  )}

                  <div
                    className="flex justify-between items-center mt-3 pt-3"
                    style={{ borderTop: "1px solid var(--pg-border)" }}
                  >
                    <div className="text-[13px] text-pg-ink-tertiary">
                      Dilamar{" "}
                      {new Date(a.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <span className="text-[12px] font-bold text-pg-red-600">Detail ›</span>
                  </div>
                </Link>
              );
            })
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
      className="inline-flex shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-[0.06em] uppercase whitespace-nowrap"
      style={{ background: colors.bg, color: colors.fg, fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}
