import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import ApplicationCard from "@/components/admin/ApplicationCard";

export const dynamic = "force-dynamic";

type Candidate = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  province: string | null;
  birth_date: string | null;
  gender: string | null;
  education: string | null;
  profile_data: Record<string, unknown> | null;
  source: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string;
  auth_user_id: string | null;
};

type ApplicationWithPosition = {
  id: string;
  position_slug: string;
  pipeline_stage: string;
  answers: Record<string, unknown> | null;
  po_notes: string | null;
  reached_out: boolean;
  reached_out_at: string | null;
  score: number | null;
  created_at: string;
  positions: {
    name: string;
    country: string;
    requirements: Record<string, unknown> | null;
  } | null;
};

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: candidate, error } = await supabase
    .from("candidates")
    .select(
      "id, full_name, email, phone, city, province, birth_date, gender, education, profile_data, source, utm_source, utm_campaign, created_at, auth_user_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !candidate) return notFound();

  const cand = candidate as Candidate;

  const { data: apps } = await supabase
    .from("applications")
    .select(
      "id, position_slug, pipeline_stage, answers, po_notes, reached_out, reached_out_at, score, created_at, positions (name, country, requirements)",
    )
    .eq("candidate_id", id)
    .order("created_at", { ascending: false });

  const applications = (apps ?? []) as unknown as ApplicationWithPosition[];

  return (
    <main className="p-6 lg:p-10">
      <Link
        href="/admin/candidates"
        className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60 hover:opacity-100"
      >
        ← Kembali ke daftar
      </Link>

      <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] opacity-60">
            Kandidat
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-[1.1]">
            {cand.full_name}
          </h1>
          <p className="mt-2 text-sm opacity-70">
            {cand.email ?? "—"}
            {cand.phone ? ` · ${cand.phone}` : ""}
          </p>
        </div>
        <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60">
          ID {cand.id.slice(0, 8)}…
          <br />
          Sumber: {cand.source ?? "unknown"}
          <br />
          {cand.auth_user_id ? "Auth: ✓ linked" : "Auth: unlinked"}
        </div>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="border border-[var(--color-dtg-ink)]/10 bg-white p-5">
          <h2 className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60">
            Bio
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Kota" value={cand.city} />
            <Row label="Provinsi" value={cand.province} />
            <Row label="Tgl lahir" value={cand.birth_date} />
            <Row label="Gender" value={cand.gender} />
            <Row label="Pendidikan" value={cand.education} />
            <Row label="UTM source" value={cand.utm_source} />
            <Row label="UTM campaign" value={cand.utm_campaign} />
            <Row
              label="Masuk"
              value={new Date(cand.created_at).toLocaleDateString("id-ID")}
            />
          </dl>

          <h2 className="mt-6 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60">
            Profile data
          </h2>
          <pre className="mt-3 overflow-x-auto rounded bg-[var(--color-dtg-cream)]/50 p-3 font-[family-name:var(--font-mono)] text-[11px] leading-[1.5]">
            {JSON.stringify(cand.profile_data ?? {}, null, 2)}
          </pre>
        </aside>

        <section>
          <h2 className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60">
            Lamaran ({applications.length})
          </h2>
          <div className="mt-4 space-y-4">
            {applications.length === 0 && (
              <p className="text-sm opacity-60">Belum ada lamaran aktif.</p>
            )}
            {applications.map((a) => (
              <ApplicationCard key={a.id} application={a} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] opacity-60">
        {label}
      </dt>
      <dd className="text-right">{value ?? <span className="opacity-30">—</span>}</dd>
    </div>
  );
}
