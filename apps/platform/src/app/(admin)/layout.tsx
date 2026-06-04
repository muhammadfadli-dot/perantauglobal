import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import AdminSidebar, { type SidebarCounts } from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, role } = await getSessionAndRole();
  if (!session) redirect("/");
  if (role !== "admin") redirect("/dashboard");

  const supabase = await createServerClient();

  const [
    { count: positions },
    { count: jobOrdersOpen },
    { count: candidates },
    { count: applications },
    { count: pendingDocs },
    { count: inboxNew },
    { count: agents },
  ] = await Promise.all([
    supabase.from("positions").select("*", { count: "exact", head: true }),
    supabase.from("job_orders").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("candidates").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase
      .from("candidate_documents")
      .select("*", { count: "exact", head: true })
      .eq("verified", false)
      .is("rejected_at", null),
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("affiliate_agents").select("*", { count: "exact", head: true }),
  ]);

  const fullName = session.email
    ? session.email
        .split("@")[0]
        ?.split(/[._-]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ")
    : null;

  const counts: SidebarCounts = {
    positions: positions ?? undefined,
    jobOrdersOpen: jobOrdersOpen ?? undefined,
    candidates: candidates ?? undefined,
    applications: applications ?? undefined,
    pendingDocs: pendingDocs ?? undefined,
    inboxNew: inboxNew ?? undefined,
    agents: agents ?? undefined,
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--pg-paper)" }}>
      <AdminSidebar
        email={session.email}
        fullName={fullName ?? null}
        role="Admin"
        counts={counts}
      />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
