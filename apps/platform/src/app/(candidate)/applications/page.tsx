import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Badge } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";

export const dynamic = "force-dynamic";

type ApplicationRow = {
  id: string;
  position_slug: string;
  pipeline_stage: string;
  created_at: string;
  positions: { name: string; country: string } | null;
};

function userStage(internal: string): { label: string; variant: "warn" | "info" | "ok" | "err" | "mute" } {
  switch (internal) {
    case "applied":
    case "screening":
    case "voice_screen":
    case "document_check":
      return { label: "Sedang diseleksi", variant: "warn" };
    case "interview":
    case "briefing":
    case "trial":
      return { label: "Wawancara & dokumen", variant: "info" };
    case "selected":
    case "training":
    case "deployed":
    case "active":
      return { label: "Diterima", variant: "ok" };
    case "rejected":
    case "exit":
      return { label: "Tidak lolos", variant: "err" };
    default:
      return { label: "Diproses", variant: "mute" };
  }
}

export default async function ApplicationsListPage() {
  const { session, role } = await getSessionAndRole();
  if (!session) redirect("/");
  if (role === "admin") redirect("/admin");

  const supabase = await createServerClient();
  const { data: cand } = await supabase
    .from("candidates")
    .select("id")
    .eq("auth_user_id", session.userId)
    .single();
  const candidate = cand as { id: string } | null;
  if (!candidate) redirect("/");

  const { data: appsData } = await supabase
    .from("applications")
    .select("id, position_slug, pipeline_stage, created_at, positions (name, country)")
    .eq("candidate_id", candidate.id)
    .order("created_at", { ascending: false });
  const applications = (appsData ?? []) as unknown as ApplicationRow[];

  return (
    <div className="min-h-screen flex flex-col">
      <TopBarApp title="Lamaran kamu" bell />
      <main className="flex-1 pb-6">
        <section className="px-5 pt-4">
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            Semua lamaran
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            {applications.length} lamaran
          </h1>
        </section>

        <section className="px-5 pt-4 grid gap-3">
          {applications.length === 0 ? (
            <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-6 text-center">
              <div className="text-base font-bold">Belum ada lamaran</div>
              <div className="text-sm text-pg-ink-500 mt-1.5 leading-relaxed">
                Mulai jelajahi posisi yang cocok untuk kamu.
              </div>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 mt-4 text-sm font-semibold rounded-xl bg-pg-red-600 text-white no-underline"
              >
                Cari lowongan <Icon name="arrow_right" size={16} />
              </Link>
            </div>
          ) : (
            applications.map((a) => {
              const stage = userStage(a.pipeline_stage);
              return (
                <Link
                  key={a.id}
                  href={`/applications/${a.id}`}
                  className="block bg-pg-white border border-pg-ink-100 rounded-2xl px-4 py-4 no-underline text-pg-ink-900"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="text-[12px] tracking-[0.08em] uppercase text-pg-ink-400">
                        {a.positions?.country ?? "—"}
                      </div>
                      <div className="text-lg font-extrabold tracking-tight mt-0.5">
                        {a.positions?.name ?? a.position_slug}
                      </div>
                    </div>
                    <Badge variant={stage.variant}>{stage.label}</Badge>
                  </div>
                  <div className="flex justify-between items-center mt-3.5 pt-3.5 border-t border-pg-ink-100">
                    <div className="text-sm text-pg-ink-500">
                      Dilamar {new Date(a.created_at).toLocaleDateString("id-ID")}
                    </div>
                    <div className="flex items-center gap-1 text-pg-red-600 font-bold text-sm">
                      Detail <Icon name="chevron_right" size={16} />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
