import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import SignOutButton from "@/components/SignOutButton";
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

  const { session, role } = await getSessionAndRole();
  if (!session) redirect("/");
  if (role === "admin") redirect("/admin");

  const supabase = await createServerClient();

  const { data: candData } = await supabase
    .from("candidates")
    .select("id, profile_data")
    .eq("auth_user_id", session.userId)
    .single();
  const candidate = candData as {
    id: string;
    profile_data: unknown;
  } | null;
  if (!candidate) redirect("/");

  const profileData = (candidate.profile_data ?? {}) as Record<string, unknown>;
  const credentials = (profileData.credentials ?? {}) as Record<string, unknown>;
  const profileEmpty = Object.keys(credentials).length === 0;

  const { data: readinessData } = await supabase
    .from("readiness_view")
    .select(
      "candidate_id, position_slug, position_name, country, completion_pct, hard_pass",
    )
    .eq("candidate_id", candidate.id);
  const readiness = (readinessData ?? []) as ReadinessRow[];

  const { data: appsData } = await supabase
    .from("applications")
    .select("id, position_slug")
    .eq("candidate_id", candidate.id);
  const appliedMap = new Map<string, string>(
    (appsData ?? []).map((a) => {
      const row = a as { id: string; position_slug: string };
      return [row.position_slug, row.id];
    }),
  );

  const ranked = [...readiness].sort((a, b) => {
    const hp = Number(b.hard_pass ?? false) - Number(a.hard_pass ?? false);
    if (hp !== 0) return hp;
    return (b.completion_pct ?? 0) - (a.completion_pct ?? 0);
  });

  const filtered = hardOnly ? ranked.filter((r) => r.hard_pass) : ranked;

  const hardCount = ranked.filter((r) => r.hard_pass).length;

  return (
    <main className="mx-auto max-w-[640px] px-6 py-8 pb-24">
      <header className="flex items-baseline justify-between">
        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] opacity-60">
          Jelajah Posisi
        </p>
        <SignOutButton />
      </header>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-[1.2]">
        Posisi cocok buat kamu
      </h1>
      <p className="mt-2 text-sm opacity-70 leading-[1.5]">
        Diurutkan berdasarkan kecocokan profil kamu. Yang syarat wajibnya lolos
        muncul di atas.
      </p>

      {profileEmpty && (
        <section className="mt-6 border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream,#faf8f1)] p-4">
          <p className="text-sm leading-[1.5]">
            Profil kamu masih kosong — persentase di bawah belum akurat.
          </p>
          <a
            href="/profile"
            className="mt-3 inline-block bg-[var(--color-dtg-ink)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            Lengkapi profil →
          </a>
        </section>
      )}

      <div className="mt-6 flex items-center gap-2">
        <a
          href="/explore"
          className={`border px-3 py-2 text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.1em] ${
            hardOnly
              ? "border-[var(--color-dtg-ink)]/30 opacity-60"
              : "border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] text-white"
          }`}
        >
          Semua ({ranked.length})
        </a>
        <a
          href="/explore?filter=hard"
          className={`border px-3 py-2 text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.1em] ${
            hardOnly
              ? "border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] text-white"
              : "border-[var(--color-dtg-ink)]/30 opacity-60"
          }`}
        >
          Lolos syarat wajib ({hardCount})
        </a>
      </div>

      <section className="mt-6">
        {filtered.length === 0 ? (
          <p className="mt-8 text-sm opacity-70">
            {hardOnly
              ? "Belum ada posisi yang syarat wajibnya kamu lolosi. Lengkapi profil dulu supaya muncul di sini."
              : "Belum ada posisi aktif."}
          </p>
        ) : (
          <ul className="space-y-4">
            {filtered.map((r) => {
              const slug = r.position_slug ?? "";
              const pct = r.completion_pct ?? 0;
              const hardPass = r.hard_pass ?? false;
              const existingAppId = appliedMap.get(slug);
              return (
                <li
                  key={slug}
                  className="border border-[var(--color-dtg-ink)] bg-white p-5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-[family-name:var(--font-display)] text-xl leading-[1.2]">
                      {r.position_name ?? slug}
                    </h3>
                    <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] opacity-60">
                      {r.country}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 w-full bg-[var(--color-dtg-ink)]/10">
                        <div
                          className={`h-full ${
                            hardPass
                              ? "bg-green-600"
                              : "bg-[var(--color-dtg-ink)]/60"
                          }`}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-[family-name:var(--font-mono)] text-xs font-semibold">
                      {pct}%
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[11px]">
                    {hardPass ? (
                      <span className="font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] text-green-700">
                        ✓ syarat wajib lolos
                      </span>
                    ) : (
                      <span className="font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] text-red-700">
                        syarat wajib kurang
                      </span>
                    )}
                  </div>

                  {existingAppId ? (
                    <a
                      href={`/applications/${existingAppId}`}
                      className="mt-4 inline-block w-full border border-[var(--color-dtg-ink)]/30 bg-[var(--color-dtg-ink)]/5 px-4 py-3 text-center text-sm font-semibold text-[var(--color-dtg-ink)] hover:bg-[var(--color-dtg-ink)]/10"
                    >
                      Sudah dilamar — lihat lamaran →
                    </a>
                  ) : (
                    <ApplyButton positionSlug={slug} hardPass={hardPass} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <nav
        aria-label="Navigasi"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-dtg-ink)] bg-white"
      >
        <div className="mx-auto grid max-w-[640px] grid-cols-3">
          <a
            href="/dashboard"
            className="flex flex-col items-center gap-1 py-3 text-[11px] uppercase tracking-[0.1em]"
          >
            <span className="font-[family-name:var(--font-mono)]">Home</span>
          </a>
          <a
            href="/profile"
            className="flex flex-col items-center gap-1 py-3 text-[11px] uppercase tracking-[0.1em]"
          >
            <span className="font-[family-name:var(--font-mono)]">Profil</span>
          </a>
          <a
            href="/explore"
            className="flex flex-col items-center gap-1 py-3 text-[11px] uppercase tracking-[0.1em]"
          >
            <span className="font-[family-name:var(--font-mono)] font-bold">
              Jelajah
            </span>
          </a>
        </div>
      </nav>
    </main>
  );
}
