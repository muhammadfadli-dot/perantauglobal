import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { Badge } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";
import PositionMetaEditor from "./PositionMetaEditor";
import RequirementsEditor from "./RequirementsEditor";
import FormFieldsEditor from "./FormFieldsEditor";

export const dynamic = "force-dynamic";

type Position = {
  slug: string;
  name: string;
  country: string;
  description: string | null;
  active: boolean;
  requirements: Record<string, { type?: "hard" | "soft"; label?: string; allowed_values?: string[] }> | null;
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

type FormField = {
  id: string;
  field_key: string;
  field_label: string;
  field_help: string | null;
  field_type: string;
  options: { value: string; label: string }[] | null;
  required: boolean;
  tier_weight: number;
  sort_order: number;
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

  const [{ data: positionData }, { data: jobOrdersData }, { data: fieldsData }] = await Promise.all([
    supabase.from("positions").select("slug, name, country, description, active, requirements").eq("slug", slug).maybeSingle(),
    supabase.from("job_orders").select("id, intake_label, internal_employer_name, slot_count, slot_filled, status, deadline, created_at").eq("position_slug", slug).order("created_at", { ascending: false }),
    supabase.from("position_form_fields").select("id, field_key, field_label, field_help, field_type, options, required, tier_weight, sort_order").eq("position_slug", slug).order("sort_order"),
  ]);

  const position = positionData as Position | null;
  if (!position) return notFound();

  const jobOrders = (jobOrdersData ?? []) as JobOrder[];
  const fields = (fieldsData ?? []) as FormField[];

  return (
    <main className="p-6 lg:p-10 max-w-6xl">
      <Link
        href="/admin/positions"
        className="inline-flex items-center gap-1 text-[12px] font-bold tracking-wide uppercase text-pg-ink-500 hover:text-pg-red-600 no-underline"
      >
        <Icon name="arrow_left" size={14} /> Catalog posisi
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            {COUNTRY_LABEL[position.country] ?? position.country}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
            {position.name}
          </h1>
          <div className="text-[13px] text-pg-ink-500 mt-1 font-mono">{position.slug}</div>
          {position.description && (
            <p className="text-base text-pg-ink-700 mt-3 leading-relaxed max-w-2xl">
              {position.description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {position.active ? <Badge variant="ok">Aktif</Badge> : <Badge variant="mute">Nonaktif</Badge>}
          <Link
            href={`/admin/job-orders/new?position=${position.slug}`}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 text-sm font-semibold rounded-xl bg-pg-red-600 text-white no-underline hover:bg-pg-red-700"
          >
            <Icon name="plus" size={16} stroke={2.4} /> Buat job order
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-5">
        <PositionMetaEditor
          slug={position.slug}
          initial={{
            name: position.name,
            description: position.description,
            active: position.active,
          }}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <section>
            <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-2.5">
              Requirements default
            </div>
            <RequirementsEditor slug={position.slug} initial={position.requirements} />
          </section>

          <section>
            <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-2.5">
              Pertanyaan tambahan (custom form fields)
            </div>
            <FormFieldsEditor positionSlug={position.slug} initial={fields} />
          </section>
        </div>
      </div>

      {/* Job orders for this position */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500">
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
          <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-6 text-center text-sm text-pg-ink-500">
            Belum ada job order. Buat satu untuk mulai terima lamaran.
          </div>
        ) : (
          <div className="grid gap-3">
            {jobOrders.map((jo) => (
              <Link
                key={jo.id}
                href={`/admin/job-orders/${jo.id}`}
                className="block bg-pg-white border border-pg-ink-100 rounded-2xl p-4 no-underline text-pg-ink-900 hover:border-pg-ink-200"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-bold">{jo.intake_label}</div>
                    <div className="text-[13px] text-pg-ink-500 mt-0.5">
                      {jo.internal_employer_name}
                      {jo.deadline && ` · deadline ${new Date(jo.deadline).toLocaleDateString("id-ID")}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-base font-extrabold tracking-tight">
                        {jo.slot_filled}/{jo.slot_count}
                      </div>
                      <div className="text-[11px] text-pg-ink-500">slot terisi</div>
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
  );
}
