import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const { session, role } = await getSessionAndRole();
  if (!session) redirect("/");
  if (role !== "admin") redirect("/dashboard");

  const supabase = await createServerClient();
  const [{ count: candidates }, { count: applications }, { count: pending }] =
    await Promise.all([
      supabase.from("candidates").select("*", { count: "exact", head: true }),
      supabase.from("applications").select("*", { count: "exact", head: true }),
      supabase
        .from("pending_submissions")
        .select("*", { count: "exact", head: true })
        .is("consumed_at", null),
    ]);

  const stats = [
    { label: "Kandidat aktif", value: candidates ?? 0 },
    { label: "Total lamaran", value: applications ?? 0 },
    { label: "Pending verifikasi", value: pending ?? 0 },
  ];

  return (
    <main className="mx-auto max-w-[960px] px-6 py-12">
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] opacity-60">
        Admin CRM
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-[1.15]">
        Overview.
      </h1>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="border border-[var(--color-dtg-ink)] bg-white p-5"
          >
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60">
              {s.label}
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl">
              {s.value.toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-12 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-50">
        Pipeline views, kandidat detail, & filters — Task 10 (port dashboard.perantauglobal.com).
      </p>
    </main>
  );
}
