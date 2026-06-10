import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { Icon } from "@/components/pg/Icon";
import JobOrderForm, { type JobOrderInitial } from "../../new/JobOrderForm";

export const dynamic = "force-dynamic";

type Position = { slug: string; name: string; country: string };

type JobOrderRow = {
  id: string;
  position_slug: string;
  internal_employer_name: string;
  public_employer_name: string | null;
  employer_city: string | null;
  intake_label: string;
  slot_count: number;
  deadline: string | null;
  public_description: string | null;
  notes: string | null;
};

export default async function EditJobOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const [{ data: joData }, { data: positionsData }] = await Promise.all([
    supabase
      .from("job_orders")
      .select(
        "id, position_slug, internal_employer_name, public_employer_name, employer_city, intake_label, slot_count, deadline, public_description, notes",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("positions")
      .select("slug, name, country")
      .order("country")
      .order("name"),
  ]);

  const jo = joData as JobOrderRow | null;
  if (!jo) return notFound();
  const positions = (positionsData ?? []) as Position[];

  const initial: JobOrderInitial = {
    internal_employer_name: jo.internal_employer_name,
    public_employer_name: jo.public_employer_name,
    employer_city: jo.employer_city,
    intake_label: jo.intake_label,
    slot_count: jo.slot_count,
    // <input type="date"> wants YYYY-MM-DD.
    deadline: jo.deadline ? jo.deadline.slice(0, 10) : null,
    public_description: jo.public_description,
    notes: jo.notes,
  };

  return (
    <main className="p-6 lg:p-10 max-w-3xl">
      <Link
        href={`/admin/job-orders/${id}`}
        className="inline-flex items-center gap-1 text-[12px] font-bold tracking-wide uppercase text-pg-ink-500 hover:text-pg-red-600 no-underline"
      >
        <Icon name="arrow_left" size={14} /> Kembali ke job order
      </Link>

      <div className="mt-6">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
          Edit job order
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
          {jo.public_employer_name ?? jo.internal_employer_name}
        </h1>
        <p className="text-base text-pg-ink-700 mt-2 leading-relaxed">
          Perbarui employer, slot, deadline, atau deskripsi. Perubahan deskripsi &
          employer publik langsung kebaca di www <code className="font-mono text-[13px]">/lowongan</code>.
        </p>
      </div>

      <div className="mt-6">
        <JobOrderForm
          positions={positions}
          presetSlug={jo.position_slug}
          mode="edit"
          jobOrderId={jo.id}
          initial={initial}
        />
      </div>
    </main>
  );
}
