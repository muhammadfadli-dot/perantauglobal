import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import { Badge } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";

export const dynamic = "force-dynamic";

type PositionRow = {
  slug: string;
  name: string;
  country: string;
  active: boolean;
  requirements: Record<string, unknown> | null;
  updated_at: string;
};

const COUNTRY_LABEL: Record<string, string> = {
  saudi_arabia: "Saudi Arabia",
  japan: "Jepang",
  taiwan: "Taiwan",
  indonesia: "Indonesia",
  any: "—",
};

export default async function AdminPositionsPage() {
  const supabase = await createServerClient();

  const [{ data: positionsData }, { data: jobOrdersData }, { data: appsData }] = await Promise.all([
    supabase.from("positions").select("slug, name, country, active, requirements, updated_at").order("active", { ascending: false }).order("country").order("name"),
    supabase.from("job_orders").select("position_slug, status").eq("status", "open"),
    supabase.from("applications").select("position_slug"),
  ]);

  const positions = (positionsData ?? []) as PositionRow[];
  const openJobOrdersByPosition = new Map<string, number>();
  for (const jo of (jobOrdersData ?? []) as { position_slug: string }[]) {
    openJobOrdersByPosition.set(jo.position_slug, (openJobOrdersByPosition.get(jo.position_slug) ?? 0) + 1);
  }
  const appsByPosition = new Map<string, number>();
  for (const a of (appsData ?? []) as { position_slug: string }[]) {
    appsByPosition.set(a.position_slug, (appsByPosition.get(a.position_slug) ?? 0) + 1);
  }

  return (
    <main className="p-6 lg:p-10 max-w-6xl">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            Admin / Posisi
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
            Catalog posisi
          </h1>
          <p className="text-base text-pg-ink-700 mt-2 leading-relaxed max-w-2xl">
            Template posisi dengan persyaratan default. Buat <b>job order</b> dari sini saat ada
            employer baru yang request batch baru.
          </p>
        </div>
      </div>

      <div className="mt-8 bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="border-b border-pg-ink-100 bg-pg-ink-50">
            <tr className="text-left text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">
              <th className="px-4 py-3">Posisi</th>
              <th className="px-4 py-3">Negara</th>
              <th className="px-4 py-3">Job order aktif</th>
              <th className="px-4 py-3">Total lamaran</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => {
              const openCount = openJobOrdersByPosition.get(p.slug) ?? 0;
              const appCount = appsByPosition.get(p.slug) ?? 0;
              return (
                <tr key={p.slug} className="border-b border-pg-ink-100 last:border-b-0 hover:bg-pg-ink-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/positions/${p.slug}`}
                      className="font-bold text-pg-ink-900 hover:text-pg-red-600 no-underline"
                    >
                      {p.name}
                    </Link>
                    <div className="text-[11px] text-pg-ink-400 font-mono mt-0.5">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-[13px]">{COUNTRY_LABEL[p.country] ?? p.country}</td>
                  <td className="px-4 py-3">
                    {openCount > 0 ? (
                      <Badge variant="ok" icon="check">{openCount}</Badge>
                    ) : (
                      <span className="text-pg-ink-400 text-[13px]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-semibold">{appCount}</td>
                  <td className="px-4 py-3">
                    {p.active ? <Badge variant="ok">Aktif</Badge> : <Badge variant="mute">Nonaktif</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/job-orders/new?position=${p.slug}`}
                      className="inline-flex items-center gap-1 text-pg-red-600 font-bold text-[13px] no-underline"
                    >
                      <Icon name="plus" size={14} stroke={2.4} /> Buat JO
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className="mt-6 px-4 py-3.5 rounded-xl flex items-start gap-3"
        style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
      >
        <Icon name="info" size={18} className="shrink-0 mt-0.5" />
        <div className="text-[13px] leading-relaxed">
          Edit catalog posisi (gaji, requirement, deskripsi) lewat SQL migration di{" "}
          <code className="font-mono">packages/db/migrations/</code>. UI editor catalog dijadwal di
          phase berikutnya. Untuk sekarang, fokus operate via job orders.
        </div>
      </div>
    </main>
  );
}
