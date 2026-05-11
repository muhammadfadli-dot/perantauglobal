import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import {
  getDashboardData,
  getTimeOfDayGreeting,
  sortLamaranByUrgency,
} from "@/lib/journey";
import LamaranSwitcher from "./LamaranSwitcher";

export const dynamic = "force-dynamic";

const COUNTRY_LABEL: Record<string, string> = {
  saudi_arabia: "Arab Saudi",
  japan: "Jepang",
  taiwan: "Taiwan",
  indonesia: "Indonesia",
  any: "Global",
};

type ReadinessForApp = {
  position_slug: string | null;
  hard_pass: boolean | null;
  completion_pct: number | null;
  position_name: string | null;
  country: string | null;
};

export default async function DashboardPage() {
  const { session, candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const [dashboard, matchRes] = await Promise.all([
    getDashboardData(candidateId, supabase),
    supabase
      .from("readiness_view")
      .select("position_slug, position_name, country, completion_pct, hard_pass")
      .eq("candidate_id", candidateId),
  ]);

  const readiness = (matchRes.data ?? []) as ReadinessForApp[];
  const lamaranSorted = sortLamaranByUrgency(dashboard.lamaran);

  const appliedSet = new Set(dashboard.lamaran.map((l) => l.positionSlug));
  const topMatches = readiness
    .filter((r) => r.position_slug && !appliedSet.has(r.position_slug))
    .sort((a, b) => {
      const hp = Number(b.hard_pass ?? false) - Number(a.hard_pass ?? false);
      if (hp !== 0) return hp;
      return (b.completion_pct ?? 0) - (a.completion_pct ?? 0);
    })
    .slice(0, 4);

  const firstName =
    (dashboard.candidateFullName || session.email || "kandidat").split(" ")[0];
  const initials =
    (dashboard.candidateFullName || "??")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "??";

  // Show Paspor card when active lamaran is in "diproses" — that's the "sambil
  // nunggu" moment that makes the offer contextual. Card disappears at
  // terkirim (too early), hasil_diterima (different flow), and hasil_ditolak.
  const primaryLamaran = lamaranSorted[0];
  const showPasporCard = primaryLamaran?.stage === "diproses";
  const pasporCountry = primaryLamaran?.country
    ? COUNTRY_LABEL[primaryLamaran.country] ?? primaryLamaran.country
    : null;

  const greeting = getTimeOfDayGreeting();

  return (
    <div className="min-h-screen flex flex-col">
      <TopBarApp title="Beranda" />

      <main className="flex-1 pb-6">
        {/* Welcome zone — brand-led with hospitality */}
        <section
          className="px-5 pt-4 pb-4"
          style={{
            background: "linear-gradient(180deg, var(--pg-surface-subtle) 0%, transparent 100%)",
            borderBottom: "1px solid var(--pg-border)",
          }}
        >
          <div className="flex items-center mb-3">
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: "var(--pg-white)",
                border: "1px solid var(--pg-border)",
                boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 4px 12px rgba(20,20,20,0.04)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "var(--pg-red-600)",
                  animation: "pg-pulse-soft 2s infinite",
                }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.1em] font-mono"
                style={{ color: "var(--pg-ink-secondary)" }}
              >
                Welcome to Global Talent Hub
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-full grid place-items-center text-white text-[16px] font-extrabold shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--pg-red-600) 0%, var(--pg-red-700) 100%)",
                boxShadow:
                  "0 3px 10px rgba(215,38,47,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px]" style={{ color: "var(--pg-ink-tertiary)" }}>
                {greeting},
              </div>
              <div className="text-[22px] font-extrabold tracking-[-0.02em] leading-tight">
                {firstName} 👋
              </div>
            </div>
          </div>
        </section>

        {/* Per-lamaran tab strip + hero (or empty state) */}
        {lamaranSorted.length > 0 ? (
          <LamaranSwitcher lamaran={lamaranSorted} countryLabel={COUNTRY_LABEL} />
        ) : (
          <EmptyState
            identityFilled={dashboard.identityFilledCount}
            identityTotal={dashboard.identityTotalCount}
          />
        )}

        {/* Paspor Perantau Global — only when active lamaran is in "diproses" */}
        {showPasporCard && pasporCountry && (
          <section className="px-5 pt-7">
            <PasporCard
              countryLabel={pasporCountry}
              positionName={primaryLamaran?.positionName ?? null}
            />
          </section>
        )}

        {/* Cocok buat kamu */}
        {topMatches.length > 0 && (
          <section className="px-5 pt-7">
            <div className="flex justify-between items-baseline mb-3">
              <h2
                className="text-[10px] font-semibold tracking-[0.12em] uppercase font-mono"
                style={{ color: "var(--pg-red-600)" }}
              >
                {lamaranSorted.length === 0 ? "Cocok buat kamu" : "Cocok juga buat kamu"}
              </h2>
              <Link href="/explore" className="text-[12px] font-bold text-pg-red-600 no-underline">
                Semua
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto -mr-5 pr-5 pb-1">
              {topMatches.map((m) => (
                <Link
                  key={m.position_slug ?? ""}
                  href={`/explore?slug=${m.position_slug}`}
                  className="min-w-[200px] bg-pg-white rounded-2xl overflow-hidden shrink-0 no-underline text-pg-ink-primary block"
                  style={{
                    border: "1px solid var(--pg-border)",
                    boxShadow:
                      "0 1px 2px rgba(20,20,20,0.04), 0 4px 16px rgba(20,20,20,0.06)",
                  }}
                >
                  <div
                    className="px-4 pt-3.5 pb-4"
                    style={{
                      background:
                        "linear-gradient(160deg, var(--pg-red-600) 0%, var(--pg-red-700) 100%)",
                      color: "white",
                    }}
                  >
                    <div className="text-[10px] font-semibold tracking-[0.14em] uppercase opacity-90 font-mono">
                      {COUNTRY_LABEL[m.country ?? ""] ?? m.country}
                    </div>
                    <div className="text-[18px] font-extrabold tracking-[-0.01em] mt-1 leading-tight">
                      {m.position_name}
                    </div>
                  </div>
                  <div className="px-4 py-3 flex flex-col gap-2">
                    <span
                      className="inline-flex w-fit px-2.5 py-1 rounded-md text-[10px] font-bold tracking-[0.04em] uppercase font-mono"
                      style={{
                        background: "var(--pg-ok-soft-bg)",
                        color: "var(--pg-ok-soft-fg)",
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

// ─── Empty state (no lamaran yet) ──────────────────────────────────────────

function EmptyState({
  identityFilled,
  identityTotal,
}: {
  identityFilled: number;
  identityTotal: number;
}) {
  const profileIncomplete = identityFilled < identityTotal;

  return (
    <section className="px-5 pt-5">
      <div
        className="rounded-3xl p-5 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, var(--pg-red-600) 0%, var(--pg-red-700) 100%)",
          color: "white",
          boxShadow:
            "0 8px 24px rgba(215,38,47,0.22), 0 16px 48px rgba(215,38,47,0.12), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(255,255,255,0.12) 0%, transparent 60%)",
          }}
        />
        <div className="relative">
          <h2 className="text-[22px] font-extrabold tracking-[-0.02em] leading-tight">
            {profileIncomplete ? "Lengkapi profil dulu" : "Yuk mulai cari lowongan"}
          </h2>
          <p className="text-[13px] mt-2 leading-relaxed" style={{ opacity: 0.9 }}>
            {profileIncomplete
              ? "Profil lengkap = lamaran lebih cepet diproses. Tinggal beberapa hal lagi."
              : "Banyak lowongan ke Saudi Arabia, Jepang, Taiwan & Indonesia siap kamu lamar."}
          </p>
          <Link
            href={profileIncomplete ? "/profile" : "/explore"}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-3 mt-4 rounded-2xl text-[14px] font-extrabold no-underline"
            style={{
              background: "rgba(255,255,255,0.95)",
              color: "var(--pg-red-600)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            {profileIncomplete ? "Lengkapi profil" : "Cari lowongan"}
            <Icon name="arrow_right" size={14} stroke={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Paspor Perantau Global card ───────────────────────────────────────────

function PasporCard({
  countryLabel,
  positionName,
}: {
  countryLabel: string;
  positionName: string | null;
}) {
  return (
    <div
      className="rounded-3xl p-5 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #fffaef 0%, var(--pg-amber-100) 60%, #fce8b6 100%)",
        border: "1px solid var(--pg-amber-200)",
        boxShadow:
          "0 6px 18px rgba(201,138,20,0.20), 0 12px 36px rgba(201,138,20,0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0, left: 0, right: 0, height: "50%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-28px", right: "-28px",
          width: "100px", height: "100px",
          background: "radial-gradient(circle, var(--pg-amber-500) 0%, transparent 70%)",
          opacity: 0.16,
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-9 h-9 rounded-xl grid place-items-center text-white shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--pg-amber-500) 0%, var(--pg-amber-600) 100%)",
              boxShadow:
                "0 2px 6px rgba(201,138,20,0.40), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 2L9 7l-5.5.8L7.5 12l-1 5.5L12 15l5.5 2.5-1-5.5 4-4.2L15 7z" />
            </svg>
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em] font-mono"
            style={{ color: "var(--pg-amber-700)" }}
          >
            Paspor Perantau Global
          </span>
          <span
            className="text-[9px] font-extrabold uppercase tracking-[0.08em] px-2 py-0.5 rounded font-mono text-white"
            style={{ background: "var(--pg-amber-700)" }}
          >
            Gratis
          </span>
        </div>

        <h3
          className="text-[20px] font-extrabold tracking-[-0.018em] mt-2 leading-tight"
          style={{ color: "var(--pg-amber-700)" }}
        >
          Sertifikasi Siap Kerja {countryLabel}
        </h3>
        <p className="text-[13px] mt-2 leading-snug" style={{ color: "var(--pg-ink-secondary)" }}>
          Sambil nunggu hasil lamaran
          {positionName ? <strong> {positionName}</strong> : null}, siapin diri kamu lewat
          kursus singkat dari Perantau Global. Buat <strong>tahan & sukses</strong> kerja di {countryLabel}.
        </p>

        <div className="flex flex-col gap-1.5 mt-4 mb-4">
          {[
            "Etika kerja & budaya kerja",
            "Bahasa praktis di tempat kerja",
            "Adaptasi hidup & cara kelola gaji",
          ].map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 text-[12px] font-medium"
              style={{ color: "var(--pg-ink-secondary)" }}
            >
              <span
                className="w-4 h-4 rounded-full grid place-items-center text-white shrink-0"
                style={{
                  background: "var(--pg-amber-500)",
                  boxShadow: "0 1px 3px rgba(201,138,20,0.4)",
                }}
              >
                <Icon name="check" size={9} stroke={3} />
              </span>
              {feature}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div
            className="text-[11px] font-bold flex items-center gap-2"
            style={{ color: "var(--pg-amber-600)" }}
          >
            ~5 jam
            <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--pg-amber-500)" }} />
            Online
            <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--pg-amber-500)" }} />
            Sertifikat
          </div>
          <Link
            href="/paspor"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-extrabold text-white no-underline"
            style={{
              background: "linear-gradient(180deg, var(--pg-amber-600) 0%, #8a5e08 100%)",
              boxShadow:
                "0 3px 8px rgba(110,73,6,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            Mulai
            <Icon name="arrow_right" size={12} stroke={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
