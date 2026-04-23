import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import { Icon } from "@/components/pg/Icon";
import JobOrderForm from "./JobOrderForm";

export const dynamic = "force-dynamic";

type Position = { slug: string; name: string; country: string };

export default async function NewJobOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ position?: string }>;
}) {
  const { position: presetPosition } = await searchParams;
  const supabase = await createServerClient();

  const { data: positionsData } = await supabase
    .from("positions")
    .select("slug, name, country")
    .eq("active", true)
    .order("country")
    .order("name");
  const positions = (positionsData ?? []) as Position[];

  return (
    <main className="p-6 lg:p-10 max-w-3xl">
      <Link
        href="/admin/job-orders"
        className="inline-flex items-center gap-1 text-[12px] font-bold tracking-wide uppercase text-pg-ink-500 hover:text-pg-red-600 no-underline"
      >
        <Icon name="arrow_left" size={14} /> Job Orders
      </Link>

      <div className="mt-6">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
          Buat job order
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">Job order baru.</h1>
        <p className="text-base text-pg-ink-700 mt-2 leading-relaxed">
          Setelah disimpan dan status <code className="font-mono text-[13px]">open</code>, job order
          ini akan muncul di www <code className="font-mono text-[13px]">/lowongan</code> dan
          kandidat bisa mulai apply.
        </p>
      </div>

      <div className="mt-6">
        <JobOrderForm positions={positions} presetSlug={presetPosition ?? null} />
      </div>
    </main>
  );
}
