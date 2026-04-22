import { redirect } from "next/navigation";
import { getSessionAndRole } from "@/lib/supabase-server";
import AdminSidebar from "@/components/admin/Sidebar";

/**
 * All /admin/* routes share this layout. Enforces admin-only access before
 * children render; candidates get redirected to /dashboard.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, role } = await getSessionAndRole();
  if (!session) redirect("/");
  if (role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[var(--color-dtg-cream)]">
      <div className="flex min-h-screen">
        <AdminSidebar email={session.email} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
