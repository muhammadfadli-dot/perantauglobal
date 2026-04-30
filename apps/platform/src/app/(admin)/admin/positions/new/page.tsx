import Link from "next/link";
import AdminTopBar from "@/components/admin/TopBar";
import PositionWizard from "./PositionWizard";

export const dynamic = "force-dynamic";

export default function NewPositionPage() {
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
      <PositionWizard />
    </>
  );
}
