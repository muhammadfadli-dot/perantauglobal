import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import { Icon } from "@/components/pg/Icon";

export const dynamic = "force-dynamic";

const HOUR_NAMES = (h: number) =>
  h < 11 ? "pagi" : h < 15 ? "siang" : h < 18 ? "sore" : "malam";

export default async function AdminHomePage() {
  const { session, role } = await getSessionAndRole();
  if (!session) redirect("/");
  if (role !== "admin") redirect("/dashboard");

  const supabase = await createServerClient();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: pendingDocs },
    { count: openJobOrders },
    { count: applicationsThisWeek },
    { count: applicationsLastWeek },
    { count: screeningStage },
    { count: acceptedStage },
    { data: openJOWithPosition },
    { data: positionVelocity },
    { data: pendingDocsRecent },
  ] = await Promise.all([
    supabase
      .from("candidate_documents")
      .select("*", { count: "exact", head: true })
      .eq("verified", false)
      .is("rejected_at", null),
    supabase.from("job_orders").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .gte("created_at", twoWeeksAgo)
      .lt("created_at", weekAgo),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("pipeline_stage", "screening")
      .gte("created_at", weekAgo),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("pipeline_stage", "selected")
      .gte("created_at", weekAgo),
    supabase
      .from("job_orders")
      .select("id, position_slug, public_employer_name, slot_count, slot_filled, deadline, positions(name, country)")
      .eq("status", "open")
      .order("deadline", { ascending: true })
      .limit(3),
    supabase
      .from("applications")
      .select("position_slug")
      .gte("created_at", weekAgo),
    supabase
      .from("candidate_documents")
      .select("doc_type, candidates(full_name)")
      .eq("verified", false)
      .is("rejected_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(2),
  ]);

  // Velocity (top performer): count apps per position last week
  const velocityMap = new Map<string, number>();
  for (const a of (positionVelocity ?? []) as { position_slug: string }[]) {
    velocityMap.set(a.position_slug, (velocityMap.get(a.position_slug) ?? 0) + 1);
  }
  const topPositionSlugs = [...velocityMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([slug, count]) => ({ slug, count }));

  // Fetch top positions metadata
  let topPositions: { slug: string; name: string; country: string; count: number }[] = [];
  if (topPositionSlugs.length > 0) {
    const { data: posMeta } = await supabase
      .from("positions")
      .select("slug, name, country")
      .in(
        "slug",
        topPositionSlugs.map((p) => p.slug)
      );
    const metaMap = new Map((posMeta ?? []).map((p) => [p.slug, p]));
    topPositions = topPositionSlugs.map(({ slug, count }) => {
      const m = metaMap.get(slug);
      return {
        slug,
        name: m?.name ?? slug,
        country: m?.country ?? "—",
        count,
      };
    });
  }

  const thisWeek = applicationsThisWeek ?? 0;
  const lastWeek = applicationsLastWeek ?? 0;
  const wowDelta = thisWeek - lastWeek;
  const wowPct = lastWeek > 0 ? Math.round((wowDelta / lastWeek) * 100) : null;

  const greetingName = session.email?.split("@")[0]?.split(".")[0] ?? "admin";
  const greeting = `Selamat ${HOUR_NAMES(now.getHours())}, ${
    greetingName.charAt(0).toUpperCase() + greetingName.slice(1)
  }`;

  // Compose top 3 attention items
  const attentions: AttentionCard[] = [];
  if ((pendingDocs ?? 0) > 0) {
    const samples = (pendingDocsRecent ?? [])
      .map((d) => {
        const c = d.candidates as unknown as { full_name?: string | null } | null;
        return c?.full_name?.split(" ")[0];
      })
      .filter(Boolean) as string[];
    attentions.push({
      tone: "urgent",
      label: "URGENT",
      count: pendingDocs ?? 0,
      title: "Dokumen menunggu verifikasi",
      desc:
        samples.length > 0
          ? `Sertifikat & dokumen baru dari ${samples.join(", ")} — review supaya bisa dilanjut`
          : "Sertifikat & dokumen baru perlu review supaya bisa dilanjut",
      href: "/admin/documents",
      ctaLabel: "Verifikasi sekarang",
    });
  }
  if ((openJobOrders ?? 0) > 0) {
    const top = (openJOWithPosition ?? [])[0] as
      | {
          public_employer_name?: string | null;
          deadline?: string | null;
          positions?: { name?: string | null } | null;
        }
      | undefined;
    let desc = "Pull dari talent pool ke pipeline";
    if (top) {
      const employer = top.public_employer_name ?? top.positions?.name ?? "Job order baru";
      desc = `${employer} — pull dari talent pool ke pipeline`;
    }
    attentions.push({
      tone: "ok",
      label: "PERMINTAAN",
      count: openJobOrders ?? 0,
      title: "Job order buka",
      desc,
      href: "/admin/job-orders",
      ctaLabel: "Buka pool",
    });
  }
  if ((screeningStage ?? 0) > 0) {
    attentions.push({
      tone: "warn",
      label: "MINGGU INI",
      count: screeningStage ?? 0,
      title: "Lamaran maju ke screening",
      desc: `${screeningStage} kandidat udah lengkap dokumen — review buat masuk wawancara`,
      href: "/admin/applications?stage=screening",
      ctaLabel: "Review screening",
    });
  }
  // Always have at least 3 placeholder slots; fill with a generic if empty
  while (attentions.length < 3) {
    attentions.push({
      tone: "ok",
      label: "AMAN",
      count: 0,
      title:
        attentions.length === 0
          ? "Pipeline lancar"
          : attentions.length === 1
          ? "Pipeline lancar"
          : "Pipeline lancar",
      desc: "Tidak ada item urgent. Semua tugas pipeline udah ditangani.",
      href: "/admin/applications",
      ctaLabel: "Lihat pipeline",
    });
  }

  return (
    <>
      <AdminTopBar crumbs={[{ label: "Dashboard", emphasis: true }]} />

      <main className="px-8 py-7 flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <Eyebrow>{greeting}</Eyebrow>
          <h1 className="text-[32px] font-extrabold leading-[36px] tracking-[-0.025em] text-pg-ink-primary">
            {attentions.slice(0, 3).filter((a) => a.count > 0).length === 0
              ? "Pipeline lancar — tidak ada urgent task"
              : `${attentions.slice(0, 3).filter((a) => a.count > 0).length} hal yang butuh perhatian kamu`}
          </h1>
        </div>

        {/* Attention cards */}
        <div className="grid gap-3 md:grid-cols-3">
          {attentions.slice(0, 3).map((a, i) => (
            <AttentionCardView key={i} card={a} />
          ))}
        </div>

        {/* Pipeline activity + Top performer */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div
            className="lg:col-span-2 bg-pg-white rounded-2xl p-6 flex flex-col gap-3.5"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Eyebrow>Minggu ini · {weekRange()}</Eyebrow>
                <div className="text-[18px] font-extrabold leading-[22px] tracking-[-0.01em] text-pg-ink-primary">
                  Pipeline activity
                </div>
              </div>
            </div>
            <div className="flex gap-6 py-3">
              <Stat
                value={`${wowDelta >= 0 ? "+" : ""}${thisWeek}`}
                label="Lamaran masuk"
                delta={wowPct != null ? `${wowPct >= 0 ? "↑" : "↓"} ${Math.abs(wowPct)}%` : undefined}
                deltaPositive={wowPct == null ? undefined : wowPct >= 0}
              />
              <Stat
                value={String(screeningStage ?? 0)}
                label="Maju ke screening"
              />
              <Stat value={String(acceptedStage ?? 0)} label="Diterima" />
              <Stat
                value={
                  thisWeek > 0
                    ? `${Math.round(((screeningStage ?? 0) / thisWeek) * 100)}%`
                    : "—"
                }
                label="Conv applied → screen"
              />
            </div>
          </div>

          <div
            className="bg-pg-white rounded-2xl p-6 flex flex-col gap-3"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <div className="flex flex-col gap-0.5">
              <Eyebrow>Top performer</Eyebrow>
              <div className="text-[18px] font-extrabold leading-[22px] tracking-[-0.01em] text-pg-ink-primary">
                Posisi paling cepat
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {topPositions.length === 0 ? (
                <div className="text-[13px] text-pg-ink-tertiary py-2">
                  Belum ada lamaran minggu ini.
                </div>
              ) : (
                topPositions.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/admin/positions/${p.slug}`}
                    className="flex items-center gap-3 px-2.5 py-2.5 rounded-[10px] no-underline"
                    style={{ background: "var(--pg-paper)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg grid place-items-center text-white font-bold shrink-0"
                      style={{ background: "var(--pg-ink-primary)", fontFamily: "var(--font-mono)", fontSize: "10px" }}
                    >
                      {p.country.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-pg-ink-primary truncate leading-tight">
                        {p.name}
                      </div>
                      <div
                        className="text-[10px] mt-0.5 leading-tight"
                        style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                      >
                        {p.count} lamaran/minggu
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/admin/job-orders/new" icon="plus" title="Buat job order" />
          <QuickAction
            href="/admin/positions"
            icon="doc"
            title="Catalog posisi"
          />
          <QuickAction href="/admin/candidates" icon="users" title="Talent pool" />
          <QuickAction href="/admin/analytics" icon="sparkle_dot" title="Analytics" />
        </div>
      </main>
    </>
  );
}

type AttentionCard = {
  tone: "urgent" | "warn" | "ok";
  label: string;
  count: number;
  title: string;
  desc: string;
  href: string;
  ctaLabel: string;
};

function AttentionCardView({ card }: { card: AttentionCard }) {
  const colors =
    card.tone === "urgent"
      ? {
          border: "var(--pg-red-soft-border)",
          pillBg: "var(--pg-red-soft-bg)",
          pillFg: "var(--pg-red-600)",
          countFg: "var(--pg-red-600)",
          ctaFg: "var(--pg-red-600)",
        }
      : card.tone === "warn"
      ? {
          border: "var(--pg-warn-soft-border)",
          pillBg: "var(--pg-warn-soft-bg)",
          pillFg: "var(--pg-warn-soft-fg)",
          countFg: "var(--pg-warn-soft-fg)",
          ctaFg: "var(--pg-warn-soft-fg)",
        }
      : {
          border: "var(--pg-ok-soft-border)",
          pillBg: "var(--pg-ok-soft-bg)",
          pillFg: "var(--pg-ok-soft-fg)",
          countFg: "var(--pg-ok-soft-fg)",
          ctaFg: "var(--pg-ok-soft-fg)",
        };

  return (
    <Link
      href={card.href}
      className="bg-pg-white rounded-2xl p-5 flex flex-col gap-2.5 no-underline"
      style={{ border: `1.5px solid ${colors.border}` }}
    >
      <div className="flex items-center justify-between">
        <span
          className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-[0.04em] leading-[12px]"
          style={{
            background: colors.pillBg,
            color: colors.pillFg,
            fontFamily: "var(--font-mono)",
          }}
        >
          {card.label}
        </span>
        <span
          className="text-[22px] font-extrabold leading-[28px]"
          style={{ color: colors.countFg }}
        >
          {card.count}
        </span>
      </div>
      <div className="text-[16px] font-extrabold leading-[20px] tracking-[-0.005em] text-pg-ink-primary">
        {card.title}
      </div>
      <div
        className="text-[12px] leading-4"
        style={{ color: "var(--pg-ink-tertiary)" }}
      >
        {card.desc}
      </div>
      <div className="flex items-center gap-1.5 pt-2">
        <span
          className="text-[12px] font-bold leading-4"
          style={{ color: colors.ctaFg }}
        >
          {card.ctaLabel} →
        </span>
      </div>
    </Link>
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

function Stat({
  value,
  label,
  delta,
  deltaPositive,
}: {
  value: string;
  label: string;
  delta?: string;
  deltaPositive?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-1.5">
        <div className="text-[32px] font-extrabold leading-[40px] text-pg-ink-primary">
          {value}
        </div>
        {delta && (
          <span
            className="text-[11px] font-semibold leading-[14px]"
            style={{
              color:
                deltaPositive === false
                  ? "var(--pg-ink-tertiary)"
                  : "var(--pg-ok-soft-fg)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {delta}
          </span>
        )}
      </div>
      <div
        className="text-[10px] font-semibold tracking-[0.08em] uppercase leading-[12px]"
        style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
}: {
  href: string;
  icon: Parameters<typeof Icon>[0]["name"];
  title: string;
}) {
  return (
    <Link
      href={href}
      className="bg-pg-white rounded-2xl p-4 flex items-center gap-3 no-underline hover:border-pg-red-200"
      style={{ border: "1px solid var(--pg-border)" }}
    >
      <div
        className="w-10 h-10 rounded-xl grid place-items-center"
        style={{ background: "var(--pg-red-50)", color: "var(--pg-red-600)" }}
      >
        <Icon name={icon} size={18} stroke={2} />
      </div>
      <div className="text-[14px] font-bold text-pg-ink-primary">{title}</div>
      <Icon name="arrow_right" size={16} className="ml-auto text-pg-ink-quaternary" />
    </Link>
  );
}

function weekRange(): string {
  const now = new Date();
  const day = now.getDay() || 7; // Mon=1..Sun=7
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  return `${fmt(monday)}–${fmt(sunday)}`;
}
