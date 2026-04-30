import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
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

type ReadinessForApp = {
  position_slug: string | null;
  hard_pass: boolean | null;
  completion_pct: number | null;
  position_name: string | null;
  country: string | null;
};

const COUNTRY_LABEL: Record<string, string> = {
  saudi_arabia: "Arab Saudi",
  japan: "Jepang",
  taiwan: "Taiwan",
  indonesia: "Indonesia",
  any: "Global",
};

function userStage(internal: string): {
  label: string;
  tone: "warn" | "info" | "ok" | "err" | "mute";
} {
  switch (internal) {
    case "applied":
    case "screening":
    case "voice_screen":
    case "document_check":
      return { label: "Sedang diseleksi", tone: "warn" };
    case "interview":
    case "briefing":
    case "trial":
      return { label: "Wawancara & dokumen", tone: "info" };
    case "selected":
    case "training":
    case "deployed":
    case "active":
      return { label: "Diterima", tone: "ok" };
    case "rejected":
    case "exit":
      return { label: "Tidak terpilih", tone: "mute" };
    default:
      return { label: "Diproses", tone: "mute" };
  }
}

export default async function DashboardPage() {
  const { session, candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const [candidateRes, appsRes, matchRes] = await Promise.all([
    supabase
      .from("candidates")
      .select("id, full_name, email, phone, city, profile_data")
      .eq("id", candidateId)
      .single(),
    supabase
      .from("applications")
      .select("id, position_slug, pipeline_stage, created_at, positions (name, country)")
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: false }),
    supabase
      .from("readiness_view")
      .select("position_slug, position_name, country, completion_pct, hard_pass")
      .eq("candidate_id", candidateId),
  ]);

  const candidate = candidateRes.data as CandidateRow | null;
  const applications = (appsRes.data ?? []) as unknown as ApplicationRow[];
  const readiness = (matchRes.data ?? []) as ReadinessForApp[];

  const profileData = (candidate?.profile_data ?? {}) as Record<string, unknown>;
  const credentials = (profileData.credentials ?? {}) as Record<string, unknown>;
  const credentialCount = Object.keys(credentials).length;
  const profilePct = Math.min(100, Math.round((credentialCount / 5) * 100));
  const profileMissing = Math.max(0, 5 - credentialCount);

  // Active applications (exclude rejected/exit)
  const activeApps = applications.filter(
    (a) => !["rejected", "exit"].includes(a.pipeline_stage)
  );

  // Per-app readiness lookup
  const readinessBySlug = new Map(readiness.map((r) => [r.position_slug, r]));

  // Top matches (not yet applied)
  const appliedSet = new Set(applications.map((a) => a.position_slug));
  const topMatches = readiness
    .filter((r) => r.position_slug && !appliedSet.has(r.position_slug))
    .sort((a, b) => {
      const hp = Number(b.hard_pass ?? false) - Number(a.hard_pass ?? false);
      if (hp !== 0) return hp;
      return (b.completion_pct ?? 0) - (a.completion_pct ?? 0);
    })
    .slice(0, 4);

  // Count "open lowongan" — count of unique positions in readiness_view
  const totalOpenLowongan = readiness.length;

  const firstName = (candidate?.full_name ?? session.email ?? "kandidat").split(" ")[0];

  return (
    <div className="min-h-screen flex flex-col">
      <TopBarApp title="Beranda" bell />

      <main className="flex-1 pb-6">
        {/* Greeting */}
        <section className="px-5 pt-5">
          <div className="text-[15px] text-pg-ink-tertiary">Halo,</div>
          <div className="text-[28px] font-extrabold tracking-[-0.02em] mt-0.5 text-pg-ink-primary">
            {firstName}
          </div>
        </section>

        {/* Profile completion CTA — only if incomplete */}
        {profilePct < 100 && (
          <section className="px-5 pt-4">
            <Link
              href="/profile"
              className="flex items-center gap-3.5 rounded-2xl px-4 py-4 text-white no-underline"
              style={{ background: "var(--pg-red-600)" }}
            >
              <ProfileRing pct={profilePct} />
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-extrabold leading-tight">
                  {totalOpenLowongan > 0
                    ? `Buka ${totalOpenLowongan} lowongan baru`
                    : `Profil ${profilePct}% lengkap`}
                </div>
                <div className="text-[13px] opacity-85 mt-0.5 leading-tight">
                  Lengkapi {profileMissing} hal di profil kamu
                </div>
              </div>
              <Icon name="chevron_right" size={20} />
            </Link>
          </section>
        )}

        {/* Lamaran kamu */}
        <section className="px-5 pt-6">
          <div className="flex justify-between items-baseline mb-3">
            <h2 className="text-[18px] font-extrabold tracking-[-0.01em] text-pg-ink-primary">
              Lamaran kamu
            </h2>
            <span
              className="text-[12px] font-semibold"
              style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
            >
              {activeApps.length} aktif
            </span>
          </div>
          {activeApps.length === 0 ? (
            <div
              className="bg-pg-white rounded-2xl p-6 text-center"
              style={{ border: "1px solid var(--pg-border)" }}
            >
              <div className="text-[16px] font-bold text-pg-ink-primary">Belum ada lamaran</div>
              <div className="text-[13px] text-pg-ink-tertiary mt-1.5 leading-tight">
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
            <div className="flex flex-col gap-3">
              {activeApps.map((a) => {
                const stage = userStage(a.pipeline_stage);
                const r = readinessBySlug.get(a.position_slug);
                const missing = !r?.hard_pass;
                return (
                  <Link
                    key={a.id}
                    href={`/applications/${a.id}`}
                    className="bg-pg-white rounded-2xl px-4 py-4 no-underline text-pg-ink-primary block"
                    style={{ border: "1px solid var(--pg-border)" }}
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
                      <StagePill tone={stage.tone}>{stage.label}</StagePill>
                    </div>

                    {missing && (
                      <Link
                        href={`/applications/${a.id}/lengkapi`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-between gap-2 mt-3 px-3 py-2.5 rounded-xl no-underline"
                        style={{ background: "var(--pg-red-soft-bg)" }}
                      >
                        <div className="flex items-center gap-2 text-[13px] text-pg-red-700 font-semibold">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: "var(--pg-red-600)" }}
                          />
                          1 hal wajib belum diisi
                        </div>
                        <span className="text-[12px] font-bold text-pg-red-600">
                          Lengkapi ›
                        </span>
                      </Link>
                    )}

                    <div
                      className="flex justify-between items-center mt-3 pt-3"
                      style={{ borderTop: "1px solid var(--pg-border)" }}
                    >
                      <div className="text-[13px] text-pg-ink-tertiary">
                        Dilamar {new Date(a.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "numeric", year: "numeric" })}
                      </div>
                      <span className="text-[12px] font-bold text-pg-red-600">
                        Lihat detail ›
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Cocok buat kamu */}
        {topMatches.length > 0 && (
          <section className="px-5 pt-6">
            <div className="flex justify-between items-baseline mb-3">
              <h2 className="text-[18px] font-extrabold tracking-[-0.01em] text-pg-ink-primary">
                Cocok buat kamu
              </h2>
              <Link
                href="/explore"
                className="text-[12px] font-bold text-pg-red-600 no-underline"
              >
                Lihat semua
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto -mr-5 pr-5 pb-1">
              {topMatches.map((m) => (
                <Link
                  key={m.position_slug ?? ""}
                  href={`/explore?slug=${m.position_slug}`}
                  className="min-w-[200px] bg-pg-white rounded-2xl overflow-hidden shrink-0 no-underline text-pg-ink-primary block"
                  style={{ border: "1px solid var(--pg-border)" }}
                >
                  <div
                    className="px-4 pt-3.5 pb-4"
                    style={{
                      background: "var(--pg-red-600)",
                      color: "white",
                    }}
                  >
                    <div
                      className="text-[10px] font-semibold tracking-[0.14em] uppercase opacity-90"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {COUNTRY_LABEL[m.country ?? ""] ?? m.country}
                    </div>
                    <div className="text-[18px] font-extrabold tracking-[-0.01em] mt-1 leading-tight">
                      {m.position_name}
                    </div>
                  </div>
                  <div className="px-4 py-3 flex flex-col gap-2">
                    <span
                      className="inline-flex w-fit px-2.5 py-1 rounded-md text-[10px] font-bold tracking-[0.04em] uppercase"
                      style={{
                        background: "var(--pg-ok-soft-bg)",
                        color: "var(--pg-ok-soft-fg)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {Math.round(m.completion_pct ?? 0)}% cocok
                    </span>
                    <span className="text-[12px] font-bold text-pg-red-600">Lihat ›</span>
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
      <div className="absolute inset-0 grid place-items-center text-[13px] font-extrabold">
        {pct}%
      </div>
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
