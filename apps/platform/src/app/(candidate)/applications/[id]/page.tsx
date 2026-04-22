import { redirect, notFound } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import AnswersForm from "./AnswersForm";

export const dynamic = "force-dynamic";

type PositionRow = {
  slug: string;
  name: string;
  country: string;
  description: string | null;
  requirements: unknown;
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

type ReadinessFieldEntry = {
  passed: boolean;
  type: "hard" | "soft";
  label: string;
};

type RequirementSpec = {
  type?: "hard" | "soft";
  label?: string;
  allowed_values?: string[];
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { session, role } = await getSessionAndRole();
  if (!session) redirect("/");
  if (role === "admin") redirect("/admin");

  const supabase = await createServerClient();

  const { data: candData } = await supabase
    .from("candidates")
    .select("id")
    .eq("auth_user_id", session.userId)
    .single();
  const candidate = candData as { id: string } | null;
  if (!candidate) redirect("/");

  const { data: appData } = await supabase
    .from("applications")
    .select(
      "id, candidate_id, position_slug, pipeline_stage, created_at, answers, positions (slug, name, country, description, requirements)",
    )
    .eq("id", id)
    .eq("candidate_id", candidate.id)
    .single();
  const application = appData as ApplicationRow | null;
  if (!application || !application.positions) notFound();

  const { data: readinessData } = await supabase
    .from("readiness_view")
    .select("readiness, completion_pct, hard_pass")
    .eq("candidate_id", candidate.id)
    .eq("position_slug", application.position_slug)
    .single();
  const readiness = readinessData as {
    readiness: { per_field?: Record<string, ReadinessFieldEntry> } | null;
    completion_pct: number | null;
    hard_pass: boolean | null;
  } | null;

  const position = application.positions;
  const requirements = (position.requirements ?? {}) as Record<string, RequirementSpec>;
  const perField: Record<string, ReadinessFieldEntry> =
    readiness?.readiness?.per_field ?? {};

  const stageLabels: Record<string, string> = {
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

  return (
    <main className="mx-auto max-w-[640px] px-6 py-10 pb-24">
      <a
        href="/dashboard"
        className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] opacity-60 hover:opacity-100"
      >
        ← Dashboard
      </a>

      <p className="mt-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] opacity-60">
        Lamaran
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-[1.1]">
        {position.name}
      </h1>
      <p className="mt-2 text-sm opacity-70">
        Tahap:{" "}
        <span className="font-semibold">
          {stageLabels[application.pipeline_stage] ?? application.pipeline_stage}
        </span>
      </p>
      {position.description && (
        <p className="mt-4 text-sm leading-[1.5] opacity-80">
          {position.description}
        </p>
      )}

      <section className="mt-8 border border-[var(--color-dtg-ink)] bg-white p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em] opacity-60">
            Kecocokan kamu
          </h2>
          <span className="font-[family-name:var(--font-display)] text-2xl">
            {readiness?.completion_pct ?? 0}%
          </span>
        </div>

        {readiness?.hard_pass === false && (
          <p className="mt-3 border border-red-500 bg-red-50 p-3 text-xs leading-[1.5] text-red-800">
            Syarat wajib belum terpenuhi. Lengkapi profil supaya lolos tahap
            awal.
          </p>
        )}

        <ul className="mt-4 space-y-2">
          {Object.keys(requirements).map((key) => {
            const spec = requirements[key];
            const entry = perField[key];
            const passed = entry?.passed ?? false;
            const isHard = (entry?.type ?? spec?.type) === "hard";
            const label = entry?.label ?? spec?.label ?? key;
            return (
              <li key={key} className="flex items-center gap-3 text-sm">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center border text-xs ${
                    passed
                      ? "border-green-700 bg-green-700 text-white"
                      : isHard
                        ? "border-red-500 text-red-500"
                        : "border-[var(--color-dtg-ink)]/30 opacity-40"
                  }`}
                >
                  {passed ? "✓" : "·"}
                </span>
                <span className="flex-1">{label}</span>
                <span
                  className={`font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] ${
                    isHard ? "text-red-700" : "opacity-50"
                  }`}
                >
                  {isHard ? "wajib" : "opsional"}
                </span>
              </li>
            );
          })}
        </ul>

        <a
          href="/profile"
          className="mt-5 inline-block border border-[var(--color-dtg-ink)] px-4 py-2 text-xs font-semibold hover:bg-[var(--color-dtg-ink)] hover:text-white"
        >
          Lengkapi profil
        </a>
      </section>

      <AnswersForm
        applicationId={application.id}
        initialAnswers={(application.answers ?? {}) as Record<string, string>}
      />
    </main>
  );
}
