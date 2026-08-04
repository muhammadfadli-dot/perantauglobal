import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import CandidateFilters from "@/components/admin/CandidateFilters";
import { Icon } from "@/components/pg/Icon";
import { countryLabelFromDb } from "@perantauglobal/db/country";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type Search = {
  q?: string;
  page?: string;
  tab?: "all" | "qualified" | "review" | "no_apply";
  position?: string;
};

export default async function CandidatesListPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { q, page: pageParam, tab = "all", position } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;

  const supabase = await createServerClient();

  // ── Membership id-sets, fetched in full (paginated past PostgREST's 1000-row cap) ──
  // Computing these globally and then filtering in-memory keeps the tab COUNTS and the
  // displayed TABLE in agreement. The old code counted globally but filtered only the
  // current 25-row page, so "Sudah qualified (359)" rendered a near-empty table.
  // A small paginator over a per-call thunk keeps each table's builder correctly typed.
  async function paginateRows<T>(
    run: (from: number, to: number) => PromiseLike<{ data: T[] | null }>,
  ): Promise<T[]> {
    const rows: T[] = [];
    for (let f = 0; ; f += 1000) {
      const { data } = await run(f, f + 999);
      const batch = data ?? [];
      rows.push(...batch);
      if (batch.length < 1000) break;
    }
    return rows;
  }

  async function paginateIds(
    run: (from: number, to: number) => PromiseLike<{ data: { candidate_id: string | null }[] | null }>,
  ): Promise<Set<string>> {
    const set = new Set<string>();
    for (const r of await paginateRows(run)) if (r.candidate_id) set.add(r.candidate_id);
    return set;
  }

  // "Sudah qualified" = at least one application where BOTH hold on the SAME
  // application row: hard_pass (qualifying answers) AND a graded CV fit > 60
  // (application_cv_fit.status = 'ok'; 'skipped' = no CV, so it never counts).
  // hard_pass alone overstated readiness — 866 candidates showed qualified while
  // their CV fit said otherwise (bug report Zalfa 2026-08-03). Cross-position
  // mixing (form pass on position A + fit pass on position B) must NOT qualify,
  // hence the intersect on application_id, not candidate_id.
  const [hardPassApps, fitPassApps, pendingDocIds, appliedIds] = await Promise.all([
    paginateRows<{ candidate_id: string | null; application_id: string | null }>((f, t) =>
      supabase
        .from("application_readiness_view")
        .select("candidate_id, application_id")
        .eq("hard_pass", true)
        .range(f, t),
    ),
    paginateRows<{ application_id: string | null }>((f, t) =>
      supabase
        .from("application_cv_fit")
        .select("application_id")
        .eq("status", "ok")
        .gt("fit_score", 60)
        .range(f, t),
    ),
    paginateIds((f, t) =>
      supabase
        .from("candidate_documents")
        .select("candidate_id")
        .eq("verified", false)
        .is("rejected_at", null)
        .range(f, t),
    ),
    paginateIds((f, t) =>
      supabase.from("applications").select("candidate_id").range(f, t),
    ),
  ]);

  const fitPassIds = new Set<string>();
  for (const r of fitPassApps) if (r.application_id) fitPassIds.add(r.application_id);
  const qualifiedIds = new Set<string>();
  for (const r of hardPassApps) {
    if (r.candidate_id && r.application_id && fitPassIds.has(r.application_id)) {
      qualifiedIds.add(r.candidate_id);
    }
  }

  // Optional ?position= membership (powers "Pull dari talent pool" from a job order).
  let positionName: string | null = null;
  let positionIds: Set<string> | null = null;
  if (position) {
    const { data: posRow } = await supabase
      .from("positions")
      .select("name")
      .eq("slug", position)
      .maybeSingle();
    positionName = (posRow as { name: string } | null)?.name ?? position;
    positionIds = await paginateIds((f, t) =>
      supabase
        .from("applications")
        .select("candidate_id")
        .eq("position_slug", position)
        .range(f, t),
    );
  }

  // Full candidate list (paginated), newest first — filtered + paginated in-memory.
  type Cand = {
    id: string;
    email: string | null;
    full_name: string;
    phone: string | null;
    city: string | null;
    created_at: string;
  };
  const allCandidates: Cand[] = [];
  for (let f = 0; ; f += 1000) {
    const { data } = await supabase
      .from("candidates")
      .select("id, email, full_name, phone, city, created_at")
      .order("created_at", { ascending: false })
      .range(f, f + 999);
    const batch = (data ?? []) as Cand[];
    allCandidates.push(...batch);
    if (batch.length < 1000) break;
  }

  const totalCandidates = allCandidates.length;
  // eslint-disable-next-line react-hooks/purity -- per-request "this week" stat; non-idempotent by design
  const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weekCandidates = allCandidates.filter((c) => c.created_at >= weekAgoIso).length;

  const needle = q?.trim().toLowerCase() ?? "";
  const matchesSearch = (c: Cand) =>
    !needle ||
    c.full_name.toLowerCase().includes(needle) ||
    (c.email?.toLowerCase().includes(needle) ?? false) ||
    (c.phone?.toLowerCase().includes(needle) ?? false);

  // base = the position + search scope; tab badges AND rows both derive from it so the
  // numbers always match what the table shows.
  const base = allCandidates.filter(
    (c) => (!positionIds || positionIds.has(c.id)) && matchesSearch(c),
  );
  const allCount = base.length;
  const qualifiedCount = base.filter((c) => qualifiedIds.has(c.id)).length;
  const reviewCount = base.filter((c) => pendingDocIds.has(c.id)).length;
  const noApplyCount = base.filter((c) => !appliedIds.has(c.id)).length;

  const tabbed = base.filter((c) => {
    if (tab === "qualified") return qualifiedIds.has(c.id);
    if (tab === "review") return pendingDocIds.has(c.id);
    if (tab === "no_apply") return !appliedIds.has(c.id);
    return true;
  });
  const total = tabbed.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = tabbed.slice(from, from + PAGE_SIZE);
  const ids = rows.map((c) => c.id);

  // Apps per displayed candidate — for the "Posisi terbaru" column.
  // Tracks count + latest position name/country for the "Posisi terbaru"
  // column (post-rework: shared "match terkuat" cross-position concept no
  // longer applies since each apply is fresh — see migration 0037).
  const appsByCandidate = new Map<
    string,
    {
      count: number;
      latest_position_slug: string | null;
      latest_position_name: string | null;
      latest_position_country: string | null;
    }
  >();
  if (ids.length > 0) {
    const { data: appsData } = await supabase
      .from("applications")
      .select("candidate_id, position_slug, created_at, positions(name, country)")
      .in("candidate_id", ids)
      .order("created_at", { ascending: false });
    for (const a of (appsData ?? []) as Array<{
      candidate_id: string;
      position_slug: string;
      created_at: string;
      positions: { name: string; country: string } | null;
    }>) {
      const prev = appsByCandidate.get(a.candidate_id);
      if (!prev) {
        appsByCandidate.set(a.candidate_id, {
          count: 1,
          latest_position_slug: a.position_slug,
          latest_position_name: a.positions?.name ?? null,
          latest_position_country: a.positions?.country ?? null,
        });
      } else {
        appsByCandidate.set(a.candidate_id, { ...prev, count: prev.count + 1 });
      }
    }
  }

  function timeAgo(iso: string): string {
    // eslint-disable-next-line react-hooks/purity -- per-request "X jam lalu" label; non-idempotent by design
    const diffH = Math.round((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
    if (diffH < 1) return "Baru aja";
    if (diffH < 24) return `${diffH} jam lalu`;
    return `${Math.round(diffH / 24)} hari lalu`;
  }

  return (
    <>
      <AdminTopBar crumbs={[{ label: "Kandidat", emphasis: true }]} />
      <main className="px-8 py-7 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <Eyebrow>Talent pool</Eyebrow>
            <h1 className="text-[32px] font-extrabold leading-[36px] tracking-[-0.025em] text-pg-ink-primary">
              Kandidat
            </h1>
            <p className="text-[14px] text-pg-ink-tertiary">
              Database orang yang udah daftar. Untuk triage lamaran per posisi, lihat halaman{" "}
              <Link href="/admin/applications" className="text-pg-red-600 font-semibold no-underline hover:underline">
                Lamaran
              </Link>
              .
            </p>
          </div>
          <Link
            href="/admin/candidates/export"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-[13px] font-bold text-pg-ink-secondary no-underline"
            style={{ border: "1px solid var(--pg-border)", background: "var(--pg-white)" }}
          >
            <Icon name="download" size={14} stroke={2} />
            Export CSV
          </Link>
        </div>

        {/* Stats — overview of the talent pool, not per-application metrics */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total kandidat"
            value={totalCandidates ?? 0}
            sub={`+${weekCandidates ?? 0} minggu ini`}
            subTone="ok"
          />
          <StatCard
            label="Sudah qualified"
            value={qualifiedCount}
            valueColor="var(--pg-ok-soft-fg)"
            sub="Lolos syarat + fit CV >60 di 1 posisi"
          />
          <StatCard
            label="Belum lamar"
            value={noApplyCount}
            sub="Masih kosong, perlu di-engage"
          />
          <StatCard
            label="Cek dokumen"
            value={reviewCount}
            valueColor="var(--pg-warn-soft-fg)"
            sub="Dokumen pending verify"
          />
        </div>

        {/* Active position filter banner */}
        {position && (
          <div
            className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl"
            style={{ background: "var(--pg-red-50)", border: "1px solid var(--pg-red-200)" }}
          >
            <span className="text-[13px] font-semibold text-pg-ink-secondary">
              Difilter ke pelamar posisi{" "}
              <span className="font-bold text-pg-red-700">{positionName}</span>
            </span>
            <Link
              href={buildUrl({ q })}
              className="inline-flex items-center gap-1 text-[12px] font-bold text-pg-red-600 no-underline hover:underline"
            >
              <Icon name="x" size={12} stroke={2.4} /> Hapus filter
            </Link>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            <FilterTab href={buildUrl({ q, position })} label="Semua" count={allCount} active={tab === "all"} />
            <FilterTab
              href={buildUrl({ q, position, tab: "qualified" })}
              label="Sudah qualified"
              count={qualifiedCount}
              active={tab === "qualified"}
            />
            <FilterTab
              href={buildUrl({ q, position, tab: "no_apply" })}
              label="Belum lamar"
              count={noApplyCount}
              active={tab === "no_apply"}
            />
            <FilterTab
              href={buildUrl({ q, position, tab: "review" })}
              label="Cek dokumen"
              count={reviewCount}
              active={tab === "review"}
            />
          </div>
          <CandidateFilters initialQuery={q ?? ""} />
        </div>

        {/* Table */}
        <div
          className="bg-pg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--pg-border)" }}
        >
          <div
            className="grid items-center px-5 py-3 text-[10px] font-semibold tracking-[0.1em] uppercase"
            style={{
              gridTemplateColumns: "minmax(0,2.4fr) 0.7fr 1.8fr 1fr 1fr",
              color: "var(--pg-ink-tertiary)",
              fontFamily: "var(--font-mono)",
              borderBottom: "1px solid var(--pg-border)",
            }}
          >
            <span>Kandidat</span>
            <span>Lamaran</span>
            <span>Posisi terbaru</span>
            <span>Aktivitas</span>
            <span className="text-right">Aksi</span>
          </div>
          {rows.length === 0 && (
            <div className="px-5 py-12 text-center text-[13px] text-pg-ink-tertiary">
              Tidak ada kandidat yang cocok.
            </div>
          )}
          {rows.map((r) => {
            const apps = appsByCandidate.get(r.id);
            const initials = (r.full_name || "?")
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((s) => s[0]?.toUpperCase())
              .join("");
            const isQualified = qualifiedIds.has(r.id);
            return (
              <div
                key={r.id}
                className="grid items-center px-5 py-3.5 hover:bg-pg-paper transition-colors"
                style={{
                  gridTemplateColumns: "minmax(0,2.4fr) 0.7fr 1.8fr 1fr 1fr",
                  borderBottom: "1px solid var(--pg-border-soft)",
                }}
              >
                <Link
                  href={`/admin/candidates/${r.id}`}
                  className="flex items-center gap-3 min-w-0 no-underline"
                >
                  <div
                    className="w-9 h-9 rounded-full grid place-items-center font-bold shrink-0"
                    style={{
                      background: "var(--pg-ink-50)",
                      color: "var(--pg-ink-secondary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                    }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-pg-ink-primary leading-tight truncate">
                      {r.full_name}
                    </div>
                    <div
                      className="text-[11px] mt-0.5 leading-tight truncate"
                      style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                    >
                      {r.city ?? "—"} · {r.email ?? r.phone ?? "—"}
                    </div>
                  </div>
                </Link>
                <span className="text-[14px] font-semibold text-pg-ink-secondary tabular-nums">
                  {apps?.count ?? 0}
                </span>
                <span className="min-w-0 flex items-center gap-2">
                  {apps && apps.latest_position_name ? (
                    <>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-pg-ink-primary truncate leading-tight">
                          {apps.latest_position_name}
                        </div>
                        <div
                          className="text-[11px] mt-0.5 leading-tight truncate"
                          style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                        >
                          {countryLabelFromDb(
                            apps.latest_position_country,
                            apps.latest_position_country ?? "—",
                          )}
                          {apps.count > 1 ? ` · +${apps.count - 1} lain` : ""}
                        </div>
                      </div>
                      {isQualified && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.04em] uppercase px-1.5 py-0.5 rounded shrink-0"
                          style={{
                            background: "var(--pg-ok-soft-bg)",
                            color: "var(--pg-ok-soft-fg)",
                            fontFamily: "var(--font-mono)",
                          }}
                          title="Lolos syarat + fit CV >60 pada lamaran yang sama"
                        >
                          <Icon name="check" size={10} stroke={2.4} /> Qual
                        </span>
                      )}
                    </>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-[12px] text-pg-warn-soft-fg italic"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <Icon name="warn" size={12} /> Belum lamar
                    </span>
                  )}
                </span>
                <span
                  className="text-[12px]"
                  style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                >
                  {timeAgo(r.created_at)}
                </span>
                <span className="text-right">
                  <Link
                    href={`/admin/candidates/${r.id}`}
                    className="text-[12px] font-semibold text-pg-ink-secondary no-underline hover:text-pg-red-600"
                  >
                    Lihat detail →
                  </Link>
                </span>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} q={q} tab={tab} position={position} />
      </main>
    </>
  );
}

function buildUrl(p: {
  q?: string;
  page?: number;
  tab?: string;
  position?: string;
}): string {
  const sp = new URLSearchParams();
  if (p.q) sp.set("q", p.q);
  if (p.page) sp.set("page", String(p.page));
  if (p.tab) sp.set("tab", p.tab);
  if (p.position) sp.set("position", p.position);
  const qs = sp.toString();
  return qs ? `/admin/candidates?${qs}` : "/admin/candidates";
}

function Pagination({
  page,
  totalPages,
  q,
  tab,
  position,
}: {
  page: number;
  totalPages: number;
  q?: string;
  tab?: string;
  position?: string;
}) {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? buildUrl({ q, tab, position, page: page - 1 }) : null;
  const next = page < totalPages ? buildUrl({ q, tab, position, page: page + 1 }) : null;
  return (
    <nav className="flex items-center justify-between text-[13px] font-semibold">
      {prev ? (
        <Link href={prev} className="inline-flex items-center gap-1 text-pg-ink-secondary no-underline hover:text-pg-red-600">
          <Icon name="arrow_left" size={14} /> Prev
        </Link>
      ) : (
        <span className="text-pg-ink-quaternary inline-flex items-center gap-1">
          <Icon name="arrow_left" size={14} /> Prev
        </span>
      )}
      <span className="text-pg-ink-tertiary">{page} / {totalPages}</span>
      {next ? (
        <Link href={next} className="inline-flex items-center gap-1 text-pg-ink-secondary no-underline hover:text-pg-red-600">
          Next <Icon name="arrow_right" size={14} />
        </Link>
      ) : (
        <span className="text-pg-ink-quaternary inline-flex items-center gap-1">
          Next <Icon name="arrow_right" size={14} />
        </span>
      )}
    </nav>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[11px] font-semibold tracking-[0.12em] leading-[14px] uppercase"
      style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
    >
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  valueColor,
  sub,
  subTone,
}: {
  label: string;
  value: number;
  valueColor?: string;
  sub?: string;
  subTone?: "ok" | "info";
}) {
  const subColor =
    subTone === "ok"
      ? "var(--pg-ok-soft-fg)"
      : subTone === "info"
      ? "var(--pg-info)"
      : "var(--pg-ink-tertiary)";
  return (
    <div
      className="bg-pg-white rounded-2xl p-5"
      style={{ border: "1px solid var(--pg-border)" }}
    >
      <div
        className="text-[10px] font-semibold tracking-[0.1em] uppercase leading-[12px]"
        style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
      <div
        className="text-[32px] font-extrabold leading-[40px] mt-1.5"
        style={{ color: valueColor ?? "var(--pg-ink-primary)" }}
      >
        {value.toLocaleString("id-ID")}
      </div>
      {sub && (
        <div className="text-[12px] font-semibold mt-1" style={{ color: subColor }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function FilterTab({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-bold no-underline"
      style={{
        background: active ? "var(--pg-ink-primary)" : "transparent",
        color: active ? "var(--pg-white)" : "var(--pg-ink-secondary)",
      }}
    >
      {label}
      <span className="text-[10px] font-semibold opacity-80" style={{ fontFamily: "var(--font-mono)" }}>
        {count}
      </span>
    </Link>
  );
}
