import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Badge } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";
import ApplyButton from "./ApplyButton";

export const dynamic = "force-dynamic";

type ReadinessRow = {
  candidate_id: string | null;
  position_slug: string | null;
  position_name: string | null;
  country: string | null;
  completion_pct: number | null;
  hard_pass: boolean | null;
};

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const { filter } = await searchParams;
  const hardOnly = filter === "hard";

  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const [candRes, readinessRes, appsRes] = await Promise.all([
    supabase
      .from("candidates")
      .select("id, profile_data")
      .eq("id", candidateId)
      .single(),
    supabase
      .from("readiness_view")
      .select("candidate_id, position_slug, position_name, country, completion_pct, hard_pass")
      .eq("candidate_id", candidateId),
    supabase
      .from("applications")
      .select("id, position_slug")
      .eq("candidate_id", candidateId),
  ]);

  const candidate = (candRes.data ?? { id: candidateId, profile_data: {} }) as {
    id: string;
    profile_data: unknown;
  };

  const profileData = (candidate.profile_data ?? {}) as Record<string, unknown>;
  const credentials = (profileData.credentials ?? {}) as Record<string, unknown>;
  const profileEmpty = Object.keys(credentials).length === 0;

  const readiness = (readinessRes.data ?? []) as ReadinessRow[];

  const appliedMap = new Map<string, string>(
    (appsRes.data ?? []).map((a) => {
      const row = a as { id: string; position_slug: string };
      return [row.position_slug, row.id];
    })
  );

  const ranked = [...readiness].sort((a, b) => {
    const hp = Number(b.hard_pass ?? false) - Number(a.hard_pass ?? false);
    if (hp !== 0) return hp;
    return (b.completion_pct ?? 0) - (a.completion_pct ?? 0);
  });

  const filtered = hardOnly ? ranked.filter((r) => r.hard_pass) : ranked;
  const hardCount = ranked.filter((r) => r.hard_pass).length;

  return (
    <div className="min-h-screen flex flex-col">
      <TopBarApp title="Jelajah lowongan" bell />

      <main className="flex-1 pb-6">
        <section className="px-5 pt-3">
          <div className="flex bg-pg-ink-100 p-1 rounded-full">
            <Link
              href="/explore"
              className={`flex-1 px-3 py-2.5 text-center text-sm font-bold rounded-full no-underline ${
                !hardOnly ? "bg-pg-white text-pg-ink-900 shadow-sm" : "text-pg-ink-500"
              }`}
            >
              Semua · {ranked.length}
            </Link>
            <Link
              href="/explore?filter=hard"
              className={`flex-1 px-3 py-2.5 text-center text-sm font-bold rounded-full no-underline ${
                hardOnly ? "bg-pg-white text-pg-ink-900 shadow-sm" : "text-pg-ink-500"
              }`}
            >
              Lolos syarat · {hardCount}
            </Link>
          </div>
        </section>

        {profileEmpty && (
          <section className="px-5 pt-4">
            <div
              className="flex gap-3 items-start px-4 py-3.5 rounded-xl"
              style={{ background: "var(--pg-warn-bg)", color: "var(--pg-warn)" }}
            >
              <Icon name="warn" size={18} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-bold">Profil kamu masih kosong</div>
                <div className="text-[13px] mt-0.5 opacity-90">
                  Persentase di bawah belum akurat. Lengkapi profil dulu.
                </div>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 mt-2 text-sm font-bold underline"
                >
                  Lengkapi profil <Icon name="arrow_right" size={14} />
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="px-5 pt-4">
          <div className="text-[13px] text-pg-ink-500">
            Diurutkan dari yang paling cocok untuk kamu.
          </div>
        </section>

        <section className="px-5 pt-3 pb-6 grid gap-3.5">
          {filtered.length === 0 ? (
            <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-6 text-center">
              <div className="text-base font-bold">Belum ada posisi</div>
              <div className="text-sm text-pg-ink-500 mt-1.5 leading-relaxed">
                {hardOnly
                  ? "Belum ada posisi yang syarat wajibnya kamu lolosi. Lengkapi profil supaya muncul."
                  : "Belum ada posisi aktif. Cek lagi nanti."}
              </div>
            </div>
          ) : (
            filtered.map((r, idx) => {
              const slug = r.position_slug ?? "";
              const pct = r.completion_pct ?? 0;
              const hardPass = r.hard_pass ?? false;
              const existingAppId = appliedMap.get(slug);
              const isTop = idx === 0 && hardPass;

              if (existingAppId) {
                return (
                  <Link
                    key={slug}
                    href={`/applications/${existingAppId}`}
                    className="block bg-pg-white border border-pg-ink-100 rounded-2xl p-4 no-underline text-pg-ink-900"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="text-[11px] tracking-[0.1em] uppercase text-pg-ink-400">
                          {r.country}
                        </div>
                        <div className="text-lg font-extrabold tracking-tight mt-0.5">
                          {r.position_name}
                        </div>
                      </div>
                      <Badge variant="info">Sudah dilamar</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-pg-red-600 font-bold text-sm mt-3">
                      Lihat status <Icon name="chevron_right" size={16} />
                    </div>
                  </Link>
                );
              }

              if (isTop) {
                return (
                  <div
                    key={slug}
                    className="bg-pg-white border-[1.5px] border-pg-red-200 rounded-2xl overflow-hidden"
                  >
                    <div
                      className="px-4 pt-4 pb-3.5 text-white relative min-h-[96px]"
                      style={{
                        background:
                          "radial-gradient(ellipse at 80% 10%, rgba(255,255,255,.18), transparent 60%), var(--pg-red-600)",
                      }}
                    >
                      <div
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide"
                        style={{ background: "rgba(255,255,255,.16)" }}
                      >
                        {pct}% COCOK
                      </div>
                      <div className="text-[11px] font-bold tracking-[0.14em] uppercase opacity-85">
                        {r.country}
                      </div>
                      <div className="text-[22px] font-extrabold tracking-tight mt-1.5">
                        {r.position_name}
                      </div>
                    </div>
                    <div className="px-4 py-3.5">
                      <div className="grid gap-1.5">
                        <Reason ok>Semua syarat wajib kamu penuhi</Reason>
                        <Reason ok>Profil kamu cocok untuk posisi ini</Reason>
                      </div>
                      <ApplyButton positionSlug={slug} hardPass={hardPass} />
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={slug}
                  className="bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden"
                >
                  <div className="p-4 flex gap-3.5">
                    <div
                      className="w-13 h-13 rounded-xl grid place-items-center shrink-0"
                      style={{
                        width: 52,
                        height: 52,
                        background: hardPass ? "var(--pg-red-50)" : "var(--pg-ink-50)",
                        color: hardPass ? "var(--pg-red-700)" : "var(--pg-ink-500)",
                      }}
                    >
                      <Icon name="briefcase" size={26} stroke={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] tracking-[0.1em] uppercase text-pg-ink-400">
                        {r.country}
                      </div>
                      <div className="text-[17px] font-extrabold tracking-tight mt-0.5 truncate">
                        {r.position_name}
                      </div>
                      <div className="text-sm text-pg-ink-500 mt-1">
                        {hardPass ? `${pct}% cocok` : "Syarat wajib belum lengkap"}
                      </div>
                    </div>
                    <Badge variant={hardPass ? "ok" : "mute"}>
                      {hardPass ? `${pct}%` : "Antri"}
                    </Badge>
                  </div>
                  <div className="px-4 pb-4">
                    <ApplyButton positionSlug={slug} hardPass={hardPass} />
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function Reason({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <Icon
        name={ok ? "check" : "x"}
        size={14}
        stroke={3}
        className={ok ? "text-pg-ok" : "text-pg-err"}
      />
      <span>{children}</span>
    </div>
  );
}
