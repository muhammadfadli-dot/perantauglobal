import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import { Badge } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";
import PositionActiveToggle from "./PositionActiveToggle";
import PositionMetaEditor from "./PositionMetaEditor";
import DeletePositionCard from "./DeletePositionCard";
import PublishBarMount from "./PublishBarMount";
import PreviewMount from "./PreviewMount";
import { PublishHistoryCard } from "./PublishHistoryCard";
import PositionEditorShell from "@/components/admin/PositionEditorShell";
import MediaSeoTab from "@/components/admin/MediaSeoTab";
import ApplicationFieldsEditor, {
  type Field as ApplicationField,
} from "@/components/admin/ApplicationFieldsEditor";
import { EditorTabsHeader } from "@/components/admin/EditorTabsHeader";
import { BannerMetric } from "@/components/admin/BannerMetric";
import { parseContent } from "@/lib/position-content";
import { countryLabelFromDb } from "@perantauglobal/db/country";

export const dynamic = "force-dynamic";

type Position = {
  slug: string;
  name: string;
  country: string;
  description: string | null;
  active: boolean;
  content: unknown;
  draft_content: unknown;
  updated_at: string | null;
  published_at: string | null;
};

type JobOrder = {
  id: string;
  intake_label: string;
  internal_employer_name: string;
  slot_count: number;
  slot_filled: number;
  status: "open" | "closed" | "filled" | "cancelled";
  deadline: string | null;
  created_at: string;
};


export default async function PositionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerClient();

  // eslint-disable-next-line react-hooks/purity -- per-request time anchor for "7 hari" banner metric
  const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: positionData },
    { data: jobOrdersData },
    { data: fieldsData },
    { count: appCount },
    { data: weekAppsData },
    { count: screeningAllTime },
  ] = await Promise.all([
    supabase
      .from("positions")
      .select(
        "slug, name, country, description, active, content, draft_content, updated_at, published_at",
      )
      .eq("slug", slug)
      .maybeSingle(),
    supabase
      .from("job_orders")
      .select(
        "id, intake_label, internal_employer_name, slot_count, slot_filled, status, deadline, created_at",
      )
      .eq("position_slug", slug)
      .order("created_at", { ascending: false }),
    supabase
      .from("position_application_fields")
      .select(
        "id, field_key, field_label, field_help, field_type, options, importance, section, tier_weight, sort_order, collect_at_stage",
      )
      .eq("position_slug", slug)
      .order("sort_order"),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("position_slug", slug),
    supabase
      .from("applications")
      .select("created_at")
      .eq("position_slug", slug)
      .gte("created_at", sevenDaysAgoIso),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("position_slug", slug)
      .in("pipeline_stage", [
        "screening",
        "interview",
        "selected",
        "training",
        "deployed",
        "active",
      ]),
  ]);

  const position = positionData as Position | null;
  if (!position) return notFound();

  const jobOrders = (jobOrdersData ?? []) as JobOrder[];
  const fields = (fieldsData ?? []) as ApplicationField[];
  // Editor works on the draft. Falls back to live content when no draft
  // exists yet (draft_content is NULL = draft + live are in sync).
  const editorContent = parseContent(
    (position.draft_content ?? position.content) as never,
  );
  const hasPendingDraft = position.draft_content != null;
  const applicationsCount = appCount ?? 0;
  const jobOrdersCount = jobOrders.length;

  // Banner-metric computation: 7-day inflow + conv → screening (lifetime)
  const weekApps = (weekAppsData ?? []) as Array<{ created_at: string }>;
  const weekTotal = weekApps.length;
  const now = new Date();
  const weeklyBuckets = new Array(7).fill(0) as number[];
  for (const a of weekApps) {
    const t = new Date(a.created_at).getTime();
    const daysAgo = Math.floor((now.getTime() - t) / (24 * 60 * 60 * 1000));
    const idx = 6 - daysAgo;
    if (idx >= 0 && idx <= 6) weeklyBuckets[idx] += 1;
  }
  // Naive WoW comparison would need 14d window — defer; just show count for now.
  const screenedLifetime = screeningAllTime ?? 0;
  const convPct =
    applicationsCount > 0
      ? Math.round((screenedLifetime / applicationsCount) * 100)
      : null;

  return (
    <>
      <AdminTopBar
        crumbs={[
          { label: "Operasi" },
          { label: "Catalog posisi", href: "/admin/positions" },
          { label: position.name, emphasis: true },
        ]}
        rightSlot={
          <div className="flex items-center gap-2">
            {position.active ? (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold"
                style={{ background: "var(--pg-ok-soft-bg)", color: "var(--pg-ok-soft-fg)" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--pg-ok-soft-fg)" }}
                />{" "}
                Aktif
              </span>
            ) : (
              <Badge variant="mute">Nonaktif</Badge>
            )}
            <Link
              href={`/admin/job-orders/new?position=${position.slug}`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-bold text-white no-underline"
              style={{ background: "var(--pg-red-600)" }}
            >
              <Icon name="plus" size={14} stroke={2.4} /> Buat job order
            </Link>
          </div>
        }
      />
      <main className="px-6 lg:px-8 py-6 max-w-[1600px]">
        <div className="flex items-start justify-between gap-5 mb-5 flex-wrap">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div
              className="text-[11px] font-semibold tracking-[0.12em] uppercase"
              style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
            >
              {countryLabelFromDb(position.country, position.country)}
            </div>
            <h1 className="text-[28px] font-extrabold leading-[32px] tracking-[-0.025em]">
              {position.name}
            </h1>
            <div
              className="text-[12px] text-pg-ink-tertiary"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {position.slug}
            </div>
          </div>

          {/* BannerMetric strip — 3 position-level KPIs at a glance */}
          <div className="flex items-stretch gap-2 flex-wrap">
            <BannerMetric
              label="Lamaran 7 hari"
              value={weekTotal}
              sparkline={weeklyBuckets}
              deltaTone={weekTotal > 0 ? "ok" : "mute"}
            />
            <BannerMetric
              label="Apply → screen"
              value={convPct != null ? `${convPct}%` : "—"}
              deltaTone={convPct != null && convPct >= 30 ? "ok" : "mute"}
            />
            <BannerMetric
              label="Total lamaran"
              value={applicationsCount}
              deltaTone="mute"
            />
          </div>
        </div>

        {/* Phase 6b — tabbed editor. Sections below switch via [data-tab]
            attribute selector; underlying editors keep their state. */}
        <EditorTabsHeader
          counts={{ form: fields.length, jobs: jobOrdersCount }}
        />

        {/* === Tab: Konten landing === */}
        <section data-tab="konten" className="mb-8">
          {hasPendingDraft && (
            <div
              className="mb-3 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-[12.5px]"
              style={{
                background: "var(--pg-warn-soft-bg)",
                color: "var(--pg-warn-soft-fg)",
                border: "1px solid var(--pg-warn-soft-border)",
              }}
            >
              <Icon name="warn" size={14} stroke={2.4} />
              <span className="font-bold">Draft belum dipublish.</span>
              <span style={{ color: "var(--pg-ink-secondary)" }}>
                Konten di editor bawah ini lebih baru dari yang live di /lowongan.
                Klik &quot;Publish ke live&quot; di bar bawah untuk promote draft.
              </span>
            </div>
          )}
          <PositionEditorShell slug={position.slug} initialContent={editorContent} />
        </section>

        {/* === Tab: Form lamaran === */}
        <section data-tab="form" className="mb-8 max-w-4xl">
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase font-mono text-pg-ink-tertiary mb-3">
            Pertanyaan untuk kandidat
          </div>
          <ApplicationFieldsEditor positionSlug={position.slug} initial={fields} />
        </section>

        {/* === Tab: Media & SEO === */}
        <section data-tab="media" className="mb-8">
          <MediaSeoTab slug={position.slug} initialContent={editorContent} />
        </section>

        {/* === Tab: Settings & publish === */}
        <section data-tab="settings" className="mb-8 max-w-3xl flex flex-col gap-4">
          <PublishHistoryCard
            slug={position.slug}
            active={position.active}
            hasPendingDraft={hasPendingDraft}
            draftSavedAt={hasPendingDraft ? position.updated_at : null}
            publishedAt={position.published_at}
          />
          <PositionActiveToggle slug={position.slug} initialActive={position.active} />
          <PositionMetaEditor
            slug={position.slug}
            initial={{
              name: position.name,
              description: position.description,
            }}
          />
          <DeletePositionCard
            slug={position.slug}
            name={position.name}
            appCount={applicationsCount}
            joCount={jobOrdersCount}
          />
        </section>

        {/* PublishBar lives at the bottom of <main> so it sticks to the
            viewport bottom while admin scrolls editor content. The Settings
            tab still has PositionActiveToggle for the detailed explainer
            copy; PublishBar is the persistent action UI consistent with
            Sanity/Notion-style editors. */}
        {/* === Tab: Job orders === */}
        <section data-tab="jobs" className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold tracking-[0.12em] uppercase font-mono text-pg-ink-tertiary">
              Job orders ({jobOrders.length})
            </div>
            <Link
              href={`/admin/job-orders/new?position=${position.slug}`}
              className="inline-flex items-center gap-1 text-pg-red-600 font-bold text-[13px] no-underline"
            >
              <Icon name="plus" size={14} stroke={2.4} /> Tambah
            </Link>
          </div>
          {jobOrders.length === 0 ? (
            <div
              className="bg-pg-white rounded-2xl p-6 text-center text-sm text-pg-ink-tertiary"
              style={{ border: "1px solid var(--pg-border)" }}
            >
              Belum ada job order. Buat satu untuk mulai terima lamaran.
            </div>
          ) : (
            <div className="grid gap-3">
              {jobOrders.map((jo) => (
                <Link
                  key={jo.id}
                  href={`/admin/job-orders/${jo.id}`}
                  className="block bg-pg-white rounded-2xl p-4 no-underline text-pg-ink-primary"
                  style={{ border: "1px solid var(--pg-border)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-bold">{jo.intake_label}</div>
                      <div className="text-[13px] text-pg-ink-tertiary mt-0.5">
                        {jo.internal_employer_name}
                        {jo.deadline &&
                          ` · deadline ${new Date(jo.deadline).toLocaleDateString("id-ID")}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-base font-extrabold tracking-tight">
                          {jo.slot_filled}/{jo.slot_count}
                        </div>
                        <div className="text-[11px] text-pg-ink-tertiary">slot terisi</div>
                      </div>
                      <Badge
                        variant={
                          jo.status === "open"
                            ? "ok"
                            : jo.status === "filled"
                              ? "info"
                              : jo.status === "cancelled"
                                ? "err"
                                : "mute"
                        }
                      >
                        {jo.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <PreviewMount
        slug={position.slug}
        name={position.name}
        country={countryLabelFromDb(position.country, position.country)}
        description={position.description}
        initialContent={editorContent}
        fields={fields.map((f) => ({
          field_key: f.field_key,
          field_label: f.field_label,
          field_help: f.field_help,
          field_type: f.field_type,
          importance: f.importance,
          section: f.section,
        }))}
      />
      <PublishBarMount
        slug={position.slug}
        positionName={position.name}
        hasPendingDraft={hasPendingDraft}
        draftSavedAt={hasPendingDraft ? position.updated_at : null}
        publishedAt={position.published_at}
      />
    </>
  );
}
