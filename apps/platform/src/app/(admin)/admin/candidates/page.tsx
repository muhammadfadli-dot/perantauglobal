import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import CandidateFilters from "@/components/admin/CandidateFilters";
import { Badge } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type CandidateListRow = {
  id: string;
  email: string | null;
  full_name: string;
  phone: string | null;
  city: string | null;
  created_at: string;
  applications_count: number;
  latest_stage: string | null;
  latest_position: string | null;
};

export default async function CandidatesListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createServerClient();

  let query = supabase
    .from("candidates")
    .select("id, email, full_name, phone, city, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q && q.trim().length > 0) {
    const needle = `%${q.trim()}%`;
    query = query.or(`full_name.ilike.${needle},email.ilike.${needle},phone.ilike.${needle}`);
  }

  const { data: candidatesData, count, error } = await query;
  const candidates = (candidatesData ?? []) as Array<{
    id: string;
    email: string | null;
    full_name: string;
    phone: string | null;
    city: string | null;
    created_at: string;
  }>;

  if (error) {
    return (
      <main className="p-10">
        <p className="text-sm text-pg-err">Query gagal: {error.message}</p>
      </main>
    );
  }

  const ids = candidates.map((c) => c.id);
  const appsByCandidate = new Map<
    string,
    { count: number; stage: string | null; position: string | null }
  >();
  if (ids.length > 0) {
    const { data: appsData } = await supabase
      .from("applications")
      .select("candidate_id, position_slug, pipeline_stage, created_at")
      .in("candidate_id", ids)
      .order("created_at", { ascending: false });
    const apps = (appsData ?? []) as Array<{
      candidate_id: string;
      position_slug: string;
      pipeline_stage: string;
      created_at: string;
    }>;
    for (const a of apps) {
      const prev = appsByCandidate.get(a.candidate_id);
      if (!prev) {
        appsByCandidate.set(a.candidate_id, {
          count: 1,
          stage: a.pipeline_stage,
          position: a.position_slug,
        });
      } else {
        appsByCandidate.set(a.candidate_id, { ...prev, count: prev.count + 1 });
      }
    }
  }

  const rows: CandidateListRow[] = candidates.map((c) => {
    const a = appsByCandidate.get(c.id);
    return {
      id: c.id,
      email: c.email,
      full_name: c.full_name,
      phone: c.phone,
      city: c.city,
      created_at: c.created_at,
      applications_count: a?.count ?? 0,
      latest_stage: a?.stage ?? null,
      latest_position: a?.position ?? null,
    };
  });

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <main className="p-6 lg:p-10 max-w-6xl">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            Admin / Kandidat
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">Kandidat</h1>
        </div>
        <div className="text-[12px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">
          {count ?? 0} total · halaman {page} / {totalPages}
        </div>
      </div>

      <div className="mt-6">
        <CandidateFilters initialQuery={q ?? ""} />
      </div>

      <div className="mt-6 bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="border-b border-pg-ink-100 bg-pg-ink-50">
            <tr className="text-left text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Kontak</th>
              <th className="px-4 py-3">Kota</th>
              <th className="px-4 py-3">Lamaran</th>
              <th className="px-4 py-3">Stage terakhir</th>
              <th className="px-4 py-3">Masuk</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-pg-ink-500">
                  Tidak ada kandidat yang cocok.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-pg-ink-100 last:border-b-0 hover:bg-pg-ink-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/candidates/${r.id}`}
                    className="font-bold text-pg-ink-900 hover:text-pg-red-600 no-underline"
                  >
                    {r.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="text-[13px] text-pg-ink-700">{r.email ?? "—"}</div>
                  <div className="text-[11px] text-pg-ink-500 font-mono">{r.phone ?? "—"}</div>
                </td>
                <td className="px-4 py-3 text-[13px]">{r.city ?? "—"}</td>
                <td className="px-4 py-3 text-[13px]">
                  {r.applications_count > 0 ? (
                    <span>
                      <b>{r.applications_count}</b>
                      <span className="text-pg-ink-500"> · {r.latest_position}</span>
                    </span>
                  ) : (
                    <span className="text-pg-ink-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {r.latest_stage ? <Badge variant="mute">{r.latest_stage}</Badge> : <span className="text-pg-ink-400">—</span>}
                </td>
                <td className="px-4 py-3 text-[12px] text-pg-ink-500 font-mono">
                  {new Date(r.created_at).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} q={q} />
    </main>
  );
}

function Pagination({
  page,
  totalPages,
  q,
}: {
  page: number;
  totalPages: number;
  q: string | undefined;
}) {
  if (totalPages <= 1) return null;
  const base = "/admin/candidates";
  const prev = page > 1 ? buildUrl(base, { q, page: page - 1 }) : null;
  const next = page < totalPages ? buildUrl(base, { q, page: page + 1 }) : null;
  return (
    <nav className="mt-6 flex items-center justify-between text-[13px] font-semibold">
      {prev ? (
        <Link href={prev} className="inline-flex items-center gap-1 text-pg-ink-700 no-underline hover:text-pg-red-600">
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
      {next ? (
        <Link href={next} className="inline-flex items-center gap-1 text-pg-ink-700 no-underline hover:text-pg-red-600">
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

function buildUrl(base: string, params: { q?: string; page?: number }): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.page) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}
