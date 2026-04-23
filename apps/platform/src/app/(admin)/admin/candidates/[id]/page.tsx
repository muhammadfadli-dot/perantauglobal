import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import ApplicationCard from "@/components/admin/ApplicationCard";
import { Badge } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";

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
  application_tiers: { tier: "A" | "B" | "C" | "D" | "rejected" } | null;
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
      "id, full_name, email, phone, city, province, birth_date, gender, education, profile_data, source, utm_source, utm_campaign, created_at, auth_user_id"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !candidate) return notFound();
  const cand = candidate as Candidate;

  const { data: apps } = await supabase
    .from("applications")
    .select(
      "id, position_slug, pipeline_stage, answers, po_notes, reached_out, reached_out_at, score, created_at, positions (name, country, requirements), application_tiers (tier)"
    )
    .eq("candidate_id", id)
    .order("created_at", { ascending: false });
  const applications = (apps ?? []) as unknown as ApplicationWithPosition[];

  const initials = cand.full_name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <main className="p-6 lg:p-10 max-w-6xl">
      <Link
        href="/admin/candidates"
        className="inline-flex items-center gap-1 text-[12px] font-bold tracking-wide uppercase text-pg-ink-500 hover:text-pg-red-600 no-underline"
      >
        <Icon name="arrow_left" size={14} /> Kembali ke daftar
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full grid place-items-center text-white text-xl font-extrabold tracking-tight shrink-0"
            style={{ background: "var(--pg-red-600)" }}
          >
            {initials || "PG"}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{cand.full_name}</h1>
            <div className="text-sm text-pg-ink-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
              {cand.email && (
                <span className="inline-flex items-center gap-1">
                  <Icon name="mail" size={14} /> {cand.email}
                </span>
              )}
              {cand.phone && (
                <span className="inline-flex items-center gap-1">
                  <Icon name="phone" size={14} /> {cand.phone}
                </span>
              )}
              {cand.city && (
                <span className="inline-flex items-center gap-1">
                  <Icon name="location" size={14} /> {cand.city}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {cand.auth_user_id ? (
            <Badge variant="ok" icon="check">Auth linked</Badge>
          ) : (
            <Badge variant="mute">Auth unlinked</Badge>
          )}
          <div className="text-[11px] text-pg-ink-500 font-mono">
            ID {cand.id.slice(0, 8)}…
          </div>
          {cand.source && (
            <div className="text-[11px] text-pg-ink-500 font-mono">
              Sumber: {cand.source}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 self-start">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">Bio</div>
          <dl className="mt-3 space-y-2.5 text-sm">
            <Row label="Kota" value={cand.city} />
            <Row label="Provinsi" value={cand.province} />
            <Row label="Tgl lahir" value={cand.birth_date} />
            <Row label="Gender" value={cand.gender} />
            <Row label="Pendidikan" value={cand.education} />
            <Row label="UTM source" value={cand.utm_source} />
            <Row label="UTM campaign" value={cand.utm_campaign} />
            <Row label="Masuk" value={new Date(cand.created_at).toLocaleDateString("id-ID")} />
          </dl>

          <div className="mt-5 pt-5 border-t border-pg-ink-100">
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">
              Profile data
            </div>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-pg-ink-50 p-3 text-[11px] leading-[1.5] font-mono">
              {JSON.stringify(cand.profile_data ?? {}, null, 2)}
            </pre>
          </div>
        </aside>

        <section>
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">
            Lamaran ({applications.length})
          </div>
          <div className="mt-3 grid gap-4">
            {applications.length === 0 && (
              <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 text-center text-sm text-pg-ink-500">
                Belum ada lamaran aktif.
              </div>
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
      <dt className="text-[11px] font-bold tracking-[0.08em] uppercase text-pg-ink-500 shrink-0">
        {label}
      </dt>
      <dd className="text-right text-pg-ink-700">
        {value ?? <span className="text-pg-ink-300">—</span>}
      </dd>
    </div>
  );
}
