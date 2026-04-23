import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import ApplicationFilters from "@/components/admin/ApplicationFilters";
import { Badge } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";

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

  const { data: positions } = await supabase
    .from("positions")
    .select("slug, name, country, active")
    .eq("active", true)
    .order("name");

  let q = supabase
    .from("applications")
    .select(
      "id, candidate_id, position_slug, pipeline_stage, reached_out, score, created_at, candidates (full_name, email, phone, city), positions (name, country)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (stage) q = q.eq("pipeline_stage", stage as never);
  if (position) q = q.eq("position_slug", position);

  const { data, count, error } = await q;
  if (error) {
    return (
      <main className="p-10">
        <p className="text-sm text-pg-err">Query gagal: {error.message}</p>
      </main>
    );
  }

  const rows = (data ?? []) as unknown as AppRow[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <main className="p-6 lg:p-10 max-w-6xl">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            Admin / Lamaran
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">Pipeline lamaran</h1>
        </div>
        <div className="text-[12px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">
          {count ?? 0} total · halaman {page} / {totalPages}
        </div>
      </div>

      <div className="mt-6">
        <ApplicationFilters
          positions={positions ?? []}
          stages={STAGES as unknown as string[]}
          initialStage={stage ?? ""}
          initialPosition={position ?? ""}
        />
      </div>

      <div className="mt-6 bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="border-b border-pg-ink-100 bg-pg-ink-50">
            <tr className="text-left text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">
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
                <td colSpan={5} className="px-4 py-8 text-center text-pg-ink-500">
                  Tidak ada lamaran yang cocok.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-pg-ink-100 last:border-b-0 hover:bg-pg-ink-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/candidates/${r.candidate_id}`}
                    className="font-bold text-pg-ink-900 hover:text-pg-red-600 no-underline"
                  >
                    {r.candidates?.full_name ?? "—"}
                  </Link>
                  <div className="text-[11px] text-pg-ink-500 font-mono">
                    {r.candidates?.city ?? "—"} · {r.candidates?.phone ?? "—"}
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px]">
                  <div className="font-semibold">{r.positions?.name ?? r.position_slug}</div>
                  <div className="text-[11px] text-pg-ink-500 font-mono">
                    {r.positions?.country ?? ""}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="mute">{r.pipeline_stage}</Badge>
                </td>
                <td className="px-4 py-3 text-[13px]">
                  {r.reached_out ? <Badge variant="ok" icon="check">Sudah</Badge> : <span className="text-pg-ink-400">—</span>}
                </td>
                <td className="px-4 py-3 text-[12px] text-pg-ink-500 font-mono">
                  {new Date(r.created_at).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} stage={stage} position={position} />
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
    <nav className="mt-6 flex items-center justify-between text-[13px] font-semibold">
      {page > 1 ? (
        <Link href={build(page - 1)} className="inline-flex items-center gap-1 text-pg-ink-700 no-underline hover:text-pg-red-600">
          <Icon name="arrow_left" size={16} /> Prev
        </Link>
      ) : (
        <span className="text-pg-ink-300 inline-flex items-center gap-1">
          <Icon name="arrow_left" size={16} /> Prev
        </span>
      )}
      <span className="text-pg-ink-500">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={build(page + 1)} className="inline-flex items-center gap-1 text-pg-ink-700 no-underline hover:text-pg-red-600">
          Next <Icon name="arrow_right" size={16} />
        </Link>
      ) : (
        <span className="text-pg-ink-300 inline-flex items-center gap-1">
          Next <Icon name="arrow_right" size={16} />
        </span>
      )}
    </nav>
  );
}
