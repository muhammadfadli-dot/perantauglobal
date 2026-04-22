import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import SignOutButton from "@/components/SignOutButton";

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

const STAGE_LABELS: Record<string, string> = {
  applied: "Didaftarkan",
  screening: "Sedang diseleksi",
  voice_screen: "Voice screening",
  interview: "Wawancara",
  document_check: "Cek dokumen",
  briefing: "Briefing",
  trial: "Trial",
  selected: "Lolos seleksi",
  training: "Pelatihan",
  deployed: "Diberangkatkan",
  active: "Aktif bekerja",
  rejected: "Tidak lolos",
  exit: "Kontrak selesai",
};

export default async function DashboardPage() {
  const { session, role } = await getSessionAndRole();
  if (!session) redirect("/");
  if (role === "admin") redirect("/admin");

  const supabase = await createServerClient();
  const { data } = await supabase
    .from("candidates")
    .select("id, full_name, email, phone, city, profile_data")
    .eq("auth_user_id", session.userId)
    .single();
  const candidate = data as CandidateRow | null;

  const { data: appsData } = await supabase
    .from("applications")
    .select(
      "id, position_slug, pipeline_stage, created_at, positions (name, country)",
    )
    .eq("candidate_id", candidate?.id ?? "")
    .order("created_at", { ascending: false });
  const applications = (appsData ?? []) as ApplicationRow[];

  // Fetch readiness for all applied positions in a single query.
  const appliedSlugs = applications.map((a) => a.position_slug);
  let readinessMap: Record<string, ReadinessRow> = {};
  if (candidate && appliedSlugs.length > 0) {
    const { data: readinessData } = await supabase
      .from("readiness_view")
      .select("candidate_id, position_slug, completion_pct, hard_pass")
      .eq("candidate_id", candidate.id)
      .in("position_slug", appliedSlugs);
    readinessMap = Object.fromEntries(
      (readinessData ?? []).map((row) => [
        (row as ReadinessRow).position_slug ?? "",
        row as ReadinessRow,
      ]),
    );
  }

  // Profile completion check: has credentials been populated?
  const profileData = (candidate?.profile_data ?? {}) as Record<string, unknown>;
  const credentials = (profileData.credentials ?? {}) as Record<string, unknown>;
  const credentialCount = Object.keys(credentials).length;
  const onboarding = (profileData.onboarding ?? {}) as Record<string, unknown>;
  const profileCompleted = Boolean(onboarding.completed_at) || credentialCount >= 4;

  return (
    <main className="mx-auto max-w-[640px] px-6 py-8 pb-24">
      <header className="flex items-baseline justify-between">
        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] opacity-60">
          Portal Kandidat
        </p>
        <SignOutButton />
      </header>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-[1.2]">
        Halo, {candidate?.full_name ?? session.email ?? "kandidat"}.
      </h1>
      {candidate?.email && (
        <p className="mt-1 text-xs opacity-60">{candidate.email}</p>
      )}

      {!profileCompleted && (
        <section className="mt-6 border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] p-5 text-white">
          <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] opacity-70">
            Langkah berikutnya
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl leading-[1.2]">
            Lengkapi profil kamu
          </h2>
          <p className="mt-2 text-sm leading-[1.5] opacity-90">
            Makin lengkap profil, makin tinggi peluang kamu dihubungi
            recruiter. Cuma 3 menit.
          </p>
          <a
            href="/profile"
            className="mt-4 inline-block bg-white px-5 py-3 text-sm font-semibold text-[var(--color-dtg-ink)] hover:opacity-90"
          >
            Mulai isi profil →
          </a>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] opacity-60">
          Lamaran Kamu
        </h2>
        {applications.length === 0 ? (
          <p className="mt-4 text-sm opacity-70">Belum ada lamaran aktif.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {applications.map((a) => {
              const position = a.positions;
              const readiness = readinessMap[a.position_slug];
              const pct = readiness?.completion_pct ?? 0;
              const hardPass = readiness?.hard_pass ?? false;
              return (
                <li key={a.id}>
                  <a
                    href={`/applications/${a.id}`}
                    className="block border border-[var(--color-dtg-ink)] bg-white p-4 transition hover:bg-[var(--color-dtg-cream,#faf8f1)]"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-semibold text-[15px] leading-[1.3]">
                        {position?.name ?? a.position_slug}
                      </h3>
                      <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.08em] opacity-60">
                        {STAGE_LABELS[a.pipeline_stage] ?? a.pipeline_stage}
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
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="opacity-60">
                        Didaftarkan {new Date(a.created_at).toLocaleDateString("id-ID")}
                      </span>
                      {!hardPass && (
                        <span className="font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] text-red-700">
                          syarat wajib kurang
                        </span>
                      )}
                    </div>
                  </a>
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
            <span className="font-[family-name:var(--font-mono)] font-bold">Home</span>
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
            <span className="font-[family-name:var(--font-mono)]">Jelajah</span>
          </a>
        </div>
      </nav>
    </main>
  );
}
