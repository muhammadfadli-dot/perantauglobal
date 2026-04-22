import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import CandidateFilters from "@/components/admin/CandidateFilters";

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

  // Main list query. ilike search across name/email/phone if q present.
  let query = supabase
    .from("candidates")
    .select("id, email, full_name, phone, city, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q && q.trim().length > 0) {
    const needle = `%${q.trim()}%`;
    query = query.or(
      `full_name.ilike.${needle},email.ilike.${needle},phone.ilike.${needle}`,
    );
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
        <p className="text-sm text-[var(--color-dtg-red)]">
          Query gagal: {error.message}
        </p>
      </main>
    );
  }

  // Hydrate each candidate with application count + latest stage.
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
    <main className="p-6 lg:p-10">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] opacity-60">
            Admin / Kandidat
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-[1.1]">
            Kandidat
          </h1>
        </div>
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60">
          {count ?? 0} total · page {page} / {totalPages}
        </p>
      </header>

      <div className="mt-6">
        <CandidateFilters initialQuery={q ?? ""} />
      </div>

      <div className="mt-6 overflow-x-auto border border-[var(--color-dtg-ink)]/10 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-[var(--color-dtg-ink)]/10 bg-[var(--color-dtg-cream)]/50">
            <tr className="text-left font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] opacity-60">
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
                <td colSpan={6} className="px-4 py-8 text-center opacity-60">
                  Tidak ada kandidat yang cocok.
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
                    href={`/admin/candidates/${r.id}`}
                    className="font-medium hover:underline"
                  >
                    {r.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="text-[13px]">{r.email ?? "—"}</div>
                  <div className="font-[family-name:var(--font-mono)] text-[11px] opacity-60">
                    {r.phone ?? "—"}
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px]">{r.city ?? "—"}</td>
                <td className="px-4 py-3 text-[13px]">
                  {r.applications_count > 0 ? (
                    <span>
                      {r.applications_count} ·{" "}
                      <span className="opacity-60">{r.latest_position}</span>
                    </span>
                  ) : (
                    <span className="opacity-40">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {r.latest_stage ? (
                    <span className="inline-block border border-[var(--color-dtg-ink)]/20 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.08em]">
                      {r.latest_stage}
                    </span>
                  ) : (
                    <span className="opacity-40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] opacity-70">
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
    <nav className="mt-6 flex items-center justify-between font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em]">
      {prev ? (
        <Link href={prev} className="hover:underline">
          ← Prev
        </Link>
      ) : (
        <span className="opacity-30">← Prev</span>
      )}
      <span className="opacity-60">
        {page} / {totalPages}
      </span>
      {next ? (
        <Link href={next} className="hover:underline">
          Next →
        </Link>
      ) : (
        <span className="opacity-30">Next →</span>
      )}
    </nav>
  );
}

function buildUrl(
  base: string,
  params: { q?: string; page?: number },
): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.page) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}
