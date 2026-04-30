import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import { getRequirementsWithStatus } from "@/lib/readiness";
import RequirementInlineForm from "./RequirementInlineForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LengkapiLamaranPage({ params }: PageProps) {
  const { id } = await params;
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const { data: appData } = await supabase
    .from("applications")
    .select(
      "id, candidate_id, position_slug, positions (slug, name, country)",
    )
    .eq("id", id)
    .eq("candidate_id", candidateId)
    .single();

  const application = appData as unknown as {
    id: string;
    candidate_id: string;
    position_slug: string;
    positions: { slug: string; name: string; country: string } | null;
  } | null;
  if (!application || !application.positions) notFound();

  const { requirements, score_pct, hard_pass } = await getRequirementsWithStatus(
    candidateId,
    application.position_slug,
    supabase,
  );

  // Read profile_data.credentials so the inline form pre-fills self-declared
  // values the candidate already entered on /profile.
  const { data: candData } = await supabase
    .from("candidates")
    .select("profile_data")
    .eq("id", candidateId)
    .single();
  const credentials = (((candData?.profile_data as Record<string, unknown>) ?? {})
    .credentials ?? {}) as Record<string, string>;

  const open = requirements.filter((r) => !r.passed);
  const done = requirements.filter((r) => r.passed);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBarApp title="Lengkapi lamaran" back backHref={`/applications/${id}`} bell={false} />

      <main className="flex-1 pb-6">
        <section className="px-5 pt-4">
          <div className="text-[12px] font-bold tracking-[0.1em] uppercase text-pg-ink-400">
            {application.positions.country}
          </div>
          <h1 className="text-[22px] font-extrabold tracking-tight mt-1.5">
            {application.positions.name}
          </h1>
        </section>

        {/* Progress */}
        <section className="px-5 pt-4">
          <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
            <div className="flex justify-between items-baseline">
              <div className="text-[15px] font-extrabold">
                {done.length} dari {requirements.length} persyaratan terpenuhi
              </div>
              <div className="text-sm font-bold text-pg-red-600">{score_pct}%</div>
            </div>
            <div className="h-1.5 bg-pg-ink-100 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${score_pct}%`,
                  background: hard_pass ? "var(--pg-ok)" : "var(--pg-warn)",
                }}
              />
            </div>
            <p className="text-[12px] text-pg-ink-500 mt-2.5 leading-relaxed">
              {hard_pass
                ? "Semua syarat utama sudah terpenuhi. Tambahkan kualifikasi tambahan untuk memperbesar peluang."
                : "Lengkapi syarat utama (tanda merah) supaya lamaran kamu bisa diproses."}
            </p>
          </div>
        </section>

        {open.length > 0 && (
          <Section title={`Belum lengkap (${open.length})`}>
            <div className="grid gap-3">
              {open.map((req) => (
                <RequirementInlineForm
                  key={req.key}
                  req={req}
                  candidateId={candidateId}
                  initialValue={credentials[req.key] ?? ""}
                />
              ))}
            </div>
          </Section>
        )}

        {done.length > 0 && (
          <Section title={`Sudah terpenuhi (${done.length})`}>
            <div className="grid gap-2">
              {done.map((req) => (
                <div
                  key={req.key}
                  className="flex items-center gap-3 px-3.5 py-3 bg-pg-white border border-pg-ink-100 rounded-xl"
                >
                  <div
                    className="w-8 h-8 rounded-full grid place-items-center shrink-0"
                    style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
                  >
                    <Icon name="check" size={16} stroke={2.4} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{req.label}</div>
                    <div className="text-[12px] text-pg-ink-500 mt-0.5">
                      {req.doc_passed && req.self_passed
                        ? "Terverifikasi via dokumen + isian"
                        : req.doc_passed
                          ? "Terverifikasi via dokumen"
                          : "Sudah diisi"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <section className="px-5 pt-6">
          <Link
            href={`/applications/${id}`}
            className="inline-flex items-center justify-center gap-1.5 w-full min-h-[52px] rounded-xl bg-pg-ink-900 text-white font-bold text-[15px]"
          >
            Kembali ke status lamaran
          </Link>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 pt-6">
      <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600 mb-2.5">
        {title}
      </div>
      {children}
    </section>
  );
}
