import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

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
  positions: { name: string; country: string; requirements: unknown } | null;
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
      "id, position_slug, pipeline_stage, created_at, positions (name, country, requirements)",
    )
    .eq("candidate_id", candidate?.id ?? "")
    .order("created_at", { ascending: false });
  const applications = (appsData ?? []) as ApplicationRow[];

  return (
    <main className="mx-auto max-w-[840px] px-6 py-12">
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] opacity-60">
        Portal Kandidat
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-[1.15]">
        Halo, {candidate?.full_name ?? session.email}.
      </h1>
      <p className="mt-2 text-sm opacity-70">{candidate?.email}</p>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em] opacity-60">
          Lamaran Kamu
        </h2>
        {applications.length === 0 ? (
          <p className="mt-4 text-sm opacity-70">Belum ada lamaran aktif.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {applications.map((a) => {
              const position = a.positions;
              return (
                <li
                  key={a.id}
                  className="border border-[var(--color-dtg-ink)] bg-white p-5"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-semibold">
                      {position?.name ?? a.position_slug}
                    </h3>
                    <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] opacity-60">
                      {a.pipeline_stage}
                    </span>
                  </div>
                  <p className="mt-1 text-xs opacity-60">
                    Didaftarkan {new Date(a.created_at).toLocaleDateString("id-ID")}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-12 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-50">
        Fitur readiness, upload dokumen, & pipeline detail — segera hadir.
      </p>
    </main>
  );
}
