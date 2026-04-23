import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Badge } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";

export const dynamic = "force-dynamic";

type CandidateRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  profile_data: unknown;
};

type ApplicationRow = {
  id: string;
  position_slug: string;
  pipeline_stage: string;
  created_at: string;
  positions: { name: string; country: string } | null;
};

type ReadinessRow = {
  candidate_id: string | null;
  position_slug: string | null;
  completion_pct: number | null;
  hard_pass: boolean | null;
};

type MatchRow = {
  position_slug: string | null;
  position_name: string | null;
  country: string | null;
  completion_pct: number | null;
  hard_pass: boolean | null;
};

/**
 * Internal pipeline stage → user-visible 4-stage label.
 * Sourced from SPEC.md §3.8.
 */
function userStage(internal: string): { label: string; variant: "warn" | "info" | "ok" | "err" | "mute" } {
  switch (internal) {
    case "applied":
    case "screening":
    case "voice_screen":
    case "document_check":
      return { label: "Sedang diseleksi", variant: "warn" };
    case "interview":
    case "briefing":
    case "trial":
      return { label: "Wawancara & dokumen", variant: "info" };
    case "selected":
    case "training":
    case "deployed":
    case "active":
      return { label: "Diterima", variant: "ok" };
    case "rejected":
    case "exit":
      return { label: "Tidak lolos", variant: "err" };
    default:
      return { label: "Diproses", variant: "mute" };
  }
}

export default async function DashboardPage() {
  const { session, candidateId } = await requireCandidate();

  const supabase = await createServerClient();
  const { data } = await supabase
    .from("candidates")
    .select("id, full_name, email, phone, city, profile_data")
    .eq("id", candidateId)
    .single();
  const candidate = data as CandidateRow | null;

  const { data: appsData } = await supabase
    .from("applications")
    .select("id, position_slug, pipeline_stage, created_at, positions (name, country)")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });
  const applications = (appsData ?? []) as unknown as ApplicationRow[];

  const profileData = (candidate?.profile_data ?? {}) as Record<string, unknown>;
  const credentials = (profileData.credentials ?? {}) as Record<string, unknown>;
  const credentialCount = Object.keys(credentials).length;
  const onboarding = (profileData.onboarding ?? {}) as Record<string, unknown>;
  const profileCompleted = Boolean(onboarding.completed_at) || credentialCount >= 4;
  const profilePct = Math.min(100, Math.round((credentialCount / 5) * 100));

  let topMatches: MatchRow[] = [];
  if (candidate) {
    const { data: matchData } = await supabase
      .from("readiness_view")
      .select("position_slug, position_name, country, completion_pct, hard_pass")
      .eq("candidate_id", candidate.id);
    const appliedSet = new Set(applications.map((a) => a.position_slug));
    topMatches = ((matchData ?? []) as MatchRow[])
      .filter((r) => r.position_slug && !appliedSet.has(r.position_slug))
      .sort((a, b) => {
        const hp = Number(b.hard_pass ?? false) - Number(a.hard_pass ?? false);
        if (hp !== 0) return hp;
        return (b.completion_pct ?? 0) - (a.completion_pct ?? 0);
      })
      .slice(0, 3);
  }

  const firstName = (candidate?.full_name ?? session.email ?? "kandidat").split(" ")[0];

  return (
    <div className="min-h-screen flex flex-col">
      <TopBarApp title="Beranda" bell />

      <main className="flex-1">
        <section className="px-5 pt-5">
          <div className="text-[15px] text-pg-ink-500">Halo,</div>
          <div className="text-2xl font-extrabold tracking-tight mt-0.5">{firstName}</div>
        </section>

        {!profileCompleted && (
          <section className="px-5 pt-4">
            <Link
              href="/profile"
              className="flex items-center gap-3.5 rounded-2xl px-4 py-4 text-white no-underline relative overflow-hidden"
              style={{ background: "var(--pg-red-600)" }}
            >
              <ProfileRing pct={profilePct} />
              <div className="flex-1">
                <div className="text-[15px] font-bold">Profil kamu {profilePct}% lengkap</div>
                <div className="text-[13px] opacity-85 mt-0.5">
                  Lengkapi data untuk lamar lebih cepat
                </div>
              </div>
              <Icon name="chevron_right" size={20} />
            </Link>
          </section>
        )}

        <section className="px-5 pt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold tracking-tight">Lamaran kamu</h2>
            <div className="text-[13px] text-pg-ink-500">{applications.length} aktif</div>
          </div>
          {applications.length === 0 ? (
            <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-6 text-center">
              <div className="text-base font-bold">Belum ada lamaran</div>
              <div className="text-sm text-pg-ink-500 mt-1.5 leading-relaxed">
                Mulai jelajahi posisi yang cocok untuk kamu.
              </div>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 mt-4 text-sm font-semibold rounded-xl bg-pg-red-600 text-white no-underline"
              >
                Cari lowongan <Icon name="arrow_right" size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {applications.map((a) => {
                const stage = userStage(a.pipeline_stage);
                const position = a.positions;
                return (
                  <Link
                    key={a.id}
                    href={`/applications/${a.id}`}
                    className="block bg-pg-white border border-pg-ink-100 rounded-2xl px-4 py-4 no-underline text-pg-ink-900"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="text-[12px] tracking-[0.08em] uppercase text-pg-ink-400">
                          {position?.country ?? "—"}
                        </div>
                        <div className="text-lg font-extrabold tracking-tight mt-0.5">
                          {position?.name ?? a.position_slug}
                        </div>
                      </div>
                      <Badge variant={stage.variant}>{stage.label}</Badge>
                    </div>
                    <div className="flex justify-between items-center mt-3.5 pt-3.5 border-t border-pg-ink-100">
                      <div className="text-sm text-pg-ink-500">
                        Dilamar {new Date(a.created_at).toLocaleDateString("id-ID")}
                      </div>
                      <div className="flex items-center gap-1 text-pg-red-600 font-bold text-sm">
                        Lihat detail <Icon name="chevron_right" size={16} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {topMatches.length > 0 && (
          <section className="px-5 pt-6 pb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold tracking-tight">Cocok buat kamu</h2>
              <Link
                href="/explore"
                className="text-pg-red-600 font-bold text-[13px] no-underline"
              >
                Lihat semua
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto -mr-5 pr-5">
              {topMatches.map((m) => (
                <Link
                  key={m.position_slug ?? ""}
                  href="/explore"
                  className="block min-w-[200px] bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden shrink-0 no-underline text-pg-ink-900"
                >
                  <div
                    className="px-3.5 pt-3.5 pb-3 text-white min-h-[80px]"
                    style={{
                      background:
                        "radial-gradient(ellipse at 80% 10%, rgba(255,255,255,.18), transparent 60%), var(--pg-red-600)",
                    }}
                  >
                    <div className="text-[10px] font-bold tracking-[0.14em] uppercase opacity-85">
                      {m.country}
                    </div>
                    <div className="text-xl font-extrabold tracking-tight mt-1">
                      {m.position_name}
                    </div>
                  </div>
                  <div className="px-3.5 py-3">
                    <Badge variant="ok" icon="sparkle_dot">
                      {m.completion_pct ?? 0}% cocok
                    </Badge>
                    <div className="flex items-center gap-1 text-pg-red-600 font-bold text-[13px] mt-2.5">
                      Lihat <Icon name="chevron_right" size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function ProfileRing({ pct }: { pct: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-[52px] h-[52px] shrink-0">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="5" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 26 26)"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-sm font-extrabold">{pct}%</div>
    </div>
  );
}
