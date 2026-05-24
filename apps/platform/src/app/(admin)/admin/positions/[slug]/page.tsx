import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import { Badge } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";
import PositionMetaEditor from "./PositionMetaEditor";
import PositionEditorShell from "@/components/admin/PositionEditorShell";
import ApplicationFieldsEditor, {
  type Field as ApplicationField,
} from "@/components/admin/ApplicationFieldsEditor";
import { parseContent } from "@/lib/position-content";

export const dynamic = "force-dynamic";

type Position = {
  slug: string;
  name: string;
  country: string;
  description: string | null;
  active: boolean;
  content: unknown;
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

const COUNTRY_LABEL: Record<string, string> = {
  saudi_arabia: "Saudi Arabia",
  japan: "Jepang",
  taiwan: "Taiwan",
  indonesia: "Indonesia",
};

export default async function PositionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const [{ data: positionData }, { data: jobOrdersData }, { data: fieldsData }] =
    await Promise.all([
      supabase
        .from("positions")
        .select("slug, name, country, description, active, content")
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
    ]);

  const position = positionData as Position | null;
  if (!position) return notFound();

  const jobOrders = (jobOrdersData ?? []) as JobOrder[];
  const fields = (fieldsData ?? []) as ApplicationField[];
  const content = parseContent(position.content as never);

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
        <div className="flex flex-col gap-1.5 mb-5">
          <div
            className="text-[11px] font-semibold tracking-[0.12em] uppercase"
            style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
          >
            {COUNTRY_LABEL[position.country] ?? position.country}
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

        {/* Meta editor (name / desc / active) — narrow card */}
        <div className="mb-6 max-w-3xl">
          <PositionMetaEditor
            slug={position.slug}
            initial={{
              name: position.name,
              description: position.description,
              active: position.active,
            }}
          />
        </div>

        {/* Content editor + live preview side-by-side */}
        <section className="mb-8">
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase font-mono text-pg-ink-tertiary mb-3">
            Konten landing page
          </div>
          <PositionEditorShell
            slug={position.slug}
            name={position.name}
            country={COUNTRY_LABEL[position.country] ?? position.country}
            description={position.description}
            initialContent={content}
            initialFields={fields.map((f) => ({
              field_key: f.field_key,
              field_label: f.field_label,
              field_help: f.field_help,
              field_type: f.field_type,
              importance: f.importance,
              section: f.section,
            }))}
          />
        </section>

        {/* Application form fields editor */}
        <section className="mb-8">
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase font-mono text-pg-ink-tertiary mb-3">
            Form pertanyaan candidate
          </div>
          <ApplicationFieldsEditor positionSlug={position.slug} initial={fields} />
        </section>

        {/* Job orders for this position */}
        <section className="mb-8">
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
    </>
  );
}
