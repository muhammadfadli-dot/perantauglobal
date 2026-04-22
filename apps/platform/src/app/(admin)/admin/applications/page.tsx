import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import ApplicationFilters from "@/components/admin/ApplicationFilters";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;
const STAGES = [
  "applied",
  "screening",
  "voice_screen",
  "interview",
  "document_check",
  "briefing",
  "trial",
  "selected",
  "training",
  "deployed",
  "active",
  "rejected",
  "exit",
] as const;

type AppRow = {
  id: string;
  candidate_id: string;
  position_slug: string;
  pipeline_stage: string;
  reached_out: boolean;
  score: number | null;
  created_at: string;
  candidates: {
    full_name: string;
    email: string | null;
    phone: string | null;
    city: string | null;
  } | null;
  positions: { name: string; country: string } | null;
};

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; position?: string; page?: string }>;
}) {
  const { stage, position, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createServerClient();

  // Positions for filter dropdown
  const { data: positions } = await supabase
    .from("positions")
    .select("slug, name, country, active")
    .eq("active", true)
    .order("name");

  let q = supabase
    .from("applications")
    .select(
      "id, candidate_id, position_slug, pipeline_stage, reached_out, score, created_at, candidates (full_name, email, phone, city), positions (name, country)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (stage) q = q.eq("pipeline_stage", stage as never);
  if (position) q = q.eq("position_slug", position);

  const { data, count, error } = await q;
  if (error) {
    return (
      <main className="p-10">
        <p className="text-sm text-[var(--color-dtg-red)]">Query gagal: {error.message}</p>
      </main>
    );
  }

  const rows = (data ?? []) as unknown as AppRow[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <main className="p-6 lg:p-10">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] opacity-60">
            Admin / Lamaran
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-[1.1]">
            Pipeline Lamaran
          </h1>
        </div>
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60">
          {count ?? 0} total · page {page} / {totalPages}
        </p>
      </header>

      <div className="mt-6">
        <ApplicationFilters
          positions={positions ?? []}
          stages={STAGES as unknown as string[]}
          initialStage={stage ?? ""}
          initialPosition={position ?? ""}
        />
      </div>

      <div className="mt-6 overflow-x-auto border border-[var(--color-dtg-ink)]/10 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-[var(--color-dtg-ink)]/10 bg-[var(--color-dtg-cream)]/50">
            <tr className="text-left font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] opacity-60">
              <th className="px-4 py-3">Kandidat</th>
              <th className="px-4 py-3">Posisi</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Outreach</th>
              <th className="px-4 py-3">Masuk</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center opacity-60">
                  Tidak ada lamaran yang cocok.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-[var(--color-dtg-ink)]/5 hover:bg-[var(--color-dtg-cream)]/30"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/candidates/${r.candidate_id}`}
                    className="font-medium hover:underline"
                  >
                    {r.candidates?.full_name ?? "—"}
                  </Link>
                  <div className="font-[family-name:var(--font-mono)] text-[11px] opacity-60">
                    {r.candidates?.city ?? "—"} · {r.candidates?.phone ?? "—"}
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px]">
                  {r.positions?.name ?? r.position_slug}
                  <div className="font-[family-name:var(--font-mono)] text-[11px] opacity-60">
                    {r.positions?.country ?? ""}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block border border-[var(--color-dtg-ink)]/20 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.08em]">
                    {r.pipeline_stage}
                  </span>
                </td>
                <td className="px-4 py-3 text-[13px]">
                  {r.reached_out ? "✓ yes" : <span className="opacity-40">—</span>}
                </td>
                <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] opacity-70">
                  {new Date(r.created_at).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        stage={stage}
        position={position}
      />
    </main>
  );
}

function Pagination({
  page,
  totalPages,
  stage,
  position,
}: {
  page: number;
  totalPages: number;
  stage?: string;
  position?: string;
}) {
  if (totalPages <= 1) return null;
  const build = (p: number) => {
    const sp = new URLSearchParams();
    if (stage) sp.set("stage", stage);
    if (position) sp.set("position", position);
    sp.set("page", String(p));
    return `/admin/applications?${sp.toString()}`;
  };
  return (
    <nav className="mt-6 flex items-center justify-between font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em]">
      {page > 1 ? (
        <Link href={build(page - 1)} className="hover:underline">
          ← Prev
        </Link>
      ) : (
        <span className="opacity-30">← Prev</span>
      )}
      <span className="opacity-60">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={build(page + 1)} className="hover:underline">
          Next →
        </Link>
      ) : (
        <span className="opacity-30">Next →</span>
      )}
    </nav>
  );
}
