import Link from "next/link";
import AdminTopBar from "@/components/admin/TopBar";
import { createServerClient } from "@/lib/supabase-server";
import { getCountryRegistry } from "@perantauglobal/db/country";
import PositionCreateForm from "./PositionCreateForm";

export const dynamic = "force-dynamic";

export default async function NewPositionPage() {
  // Country presets come from the live registry (public.countries), so a country
  // registered here (or via the "Tambah negara" flow) appears with no deploy.
  const supabase = await createServerClient();
  const registry = await getCountryRegistry(supabase);
  const countryOptions = registry.activeCountries().map((c) => ({
    value: c.dbValue,
    label: c.label,
    initials: c.initials,
  }));

  return (
    <>
      <AdminTopBar
        crumbs={[
          { label: "Operasi" },
          { label: "Catalog posisi", href: "/admin/positions" },
          { label: "Tambah posisi", emphasis: true },
        ]}
        rightSlot={
          <Link
            href="/admin/positions"
            className="text-[13px] font-bold text-pg-ink-secondary px-3 py-2 rounded-lg no-underline hover:bg-pg-ink-50"
          >
            Batal
          </Link>
        }
      />
      <PositionCreateForm countryOptions={countryOptions} />
    </>
  );
}
