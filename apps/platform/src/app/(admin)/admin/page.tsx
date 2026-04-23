import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import { Icon } from "@/components/pg/Icon";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const { session, role } = await getSessionAndRole();
  if (!session) redirect("/");
  if (role !== "admin") redirect("/dashboard");

  const supabase = await createServerClient();
  const [
    { count: candidates },
    { count: applications },
    { count: pending },
    { count: openJobOrders },
    { count: pendingDocs },
    { count: newMessages },
  ] = await Promise.all([
    supabase.from("candidates").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("pending_submissions").select("*", { count: "exact", head: true }).is("consumed_at", null),
    supabase.from("job_orders").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("candidate_documents").select("*", { count: "exact", head: true }).eq("verified", false).is("rejected_at", null),
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const stats = [
    { label: "Kandidat aktif", value: candidates ?? 0, icon: "users" as const, tone: "ok" as const },
    { label: "Total lamaran", value: applications ?? 0, icon: "briefcase" as const, tone: "info" as const },
    { label: "Job order buka", value: openJobOrders ?? 0, icon: "sparkle" as const, tone: "ok" as const },
    { label: "Doc pending", value: pendingDocs ?? 0, icon: "doc_check" as const, tone: "warn" as const },
    { label: "Pesan baru", value: newMessages ?? 0, icon: "mail" as const, tone: "warn" as const },
    { label: "Pending verifikasi", value: pending ?? 0, icon: "clock" as const, tone: "warn" as const },
  ];

  return (
    <main className="px-6 md:px-10 py-8 md:py-10 max-w-6xl">
      <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
        Overview
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">Beranda admin.</h1>
      <p className="text-base text-pg-ink-700 mt-2 leading-relaxed">
        Ringkasan pipeline kandidat & lamaran. Klik kartu untuk melihat detail.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl grid place-items-center"
                style={{
                  background:
                    s.tone === "ok" ? "var(--pg-ok-bg)" :
                    s.tone === "warn" ? "var(--pg-warn-bg)" :
                    "var(--pg-info-bg)",
                  color:
                    s.tone === "ok" ? "var(--pg-ok)" :
                    s.tone === "warn" ? "var(--pg-warn)" :
                    "var(--pg-info)",
                }}
              >
                <Icon name={s.icon} size={22} stroke={2} />
              </div>
              <div>
                <div className="text-[12px] font-bold tracking-[0.1em] uppercase text-pg-ink-400">
                  {s.label}
                </div>
                <div className="text-3xl font-extrabold tracking-tight mt-0.5">
                  {s.value.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        <QuickAction href="/admin/job-orders/new" icon="sparkle" title="Buat job order" desc="Employer, slot, batch, deadline" />
        <QuickAction href="/admin/job-orders" icon="briefcase" title="Job orders aktif" desc={`${openJobOrders ?? 0} sedang buka`} />
        <QuickAction href="/admin/positions" icon="sparkle_dot" title="Catalog posisi" desc="13 template posisi + custom field" />
        <QuickAction href="/admin/documents" icon="doc_check" title="Review dokumen" desc={`${pendingDocs ?? 0} pending review`} />
        <QuickAction href="/admin/inbox" icon="mail" title="Inbox kontak" desc={`${newMessages ?? 0} pesan baru`} />
        <QuickAction href="/admin/analytics" icon="sparkle_dot" title="Analytics" desc="Funnel + source attribution" />
        <QuickAction href="/admin/candidates" icon="users" title="Kandidat" desc="Search + filter + tier" />
        <QuickAction href="/admin/applications" icon="doc" title="Pipeline lamaran" desc="Stage + notes + reach-out" />
        <QuickAction href="/admin/team" icon="shield" title="Tim admin" desc="Invite admin baru" />
      </div>
    </main>
  );
}

function QuickAction({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: Parameters<typeof Icon>[0]["name"];
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-pg-white border border-pg-ink-100 rounded-2xl p-5 no-underline text-pg-ink-900 hover:border-pg-ink-200"
    >
      <div className="flex items-center gap-3.5">
        <div
          className="w-11 h-11 rounded-xl grid place-items-center"
          style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
        >
          <Icon name={icon} size={22} stroke={2} />
        </div>
        <div className="flex-1">
          <div className="text-base font-bold">{title}</div>
          <div className="text-sm text-pg-ink-500 mt-0.5">{desc}</div>
        </div>
        <Icon name="arrow_right" size={20} className="text-pg-ink-400" />
      </div>
    </Link>
  );
}
