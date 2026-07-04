import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { Icon } from "@/components/pg/Icon";
import { getApplicationCompleteness } from "@/lib/applicationCompleteness";
import { countryLabelFromDb } from "@perantauglobal/db/country";
import { PipelineTimeline } from "@/components/pg/candidate/PipelineTimeline";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplyWelcomePage({ params }: PageProps) {
  const { id } = await params;
  const { candidateId, session } = await requireCandidate();
  const supabase = await createServerClient();

  const { data: appData } = await supabase
    .from("applications")
    .select(
      "id, candidate_id, position_slug, created_at, positions (slug, name, country, description)"
    )
    .eq("id", id)
    .eq("candidate_id", candidateId)
    .single();

  const application = appData as unknown as {
    id: string;
    candidate_id: string;
    position_slug: string;
    created_at: string;
    positions: {
      slug: string;
      name: string;
      country: string;
      description: string | null;
    } | null;
  } | null;
  if (!application || !application.positions) notFound();

  const { data: candData } = await supabase
    .from("candidates")
    .select("full_name")
    .eq("id", candidateId)
    .single();
  const firstName = (candData?.full_name ?? session.email ?? "kamu").split(" ")[0];

  const { score_pct, fields, required_remaining } = await getApplicationCompleteness(
    application.id,
    supabase,
  );
  // Required-missing = required fields not yet ANSWERED (presence) — this is what
  // keeps a lamaran in the "lengkapi" state. NOT qualifying hard_pass: an honest
  // non-qualifying answer is done, so we don't tell that candidate review is
  // blocked. Total missing is just the neutral road to 100% (incl. Bonus fields).
  const requiredMissing = required_remaining;
  const missing = fields.filter((f) => !f.filled).length;
  const requirements = fields; // alias for downstream usage below

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      {/* Brand bar */}
      <header className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg grid place-items-center text-white font-extrabold text-[16px]"
            style={{ background: "var(--pg-red-600)" }}
          >
            P
          </div>
          <span className="font-extrabold text-[15px] tracking-[-0.01em] text-pg-ink-primary">
            Perantau Global
          </span>
        </div>
      </header>

      <div className="flex-1 px-5 pt-4 pb-6 flex flex-col gap-5">
        {/* Success eyebrow */}
        <div
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase"
          style={{ color: "var(--pg-ok-soft-fg)", fontFamily: "var(--font-mono)" }}
        >
          <Icon name="check" size={12} stroke={3} />
          Lamaran berhasil masuk
        </div>

        <h1 className="text-[32px] font-extrabold tracking-[-0.025em] text-pg-ink-primary leading-[36px]">
          Selamat, {firstName}!
        </h1>
        <p className="text-[14px] text-pg-ink-tertiary leading-relaxed">
          Lamaran kamu udah masuk pool kandidat.{" "}
          {requiredMissing > 0
            ? `Lengkapi ${requiredMissing} syarat wajib di bawah biar tim recruitment bisa lanjutin review.`
            : "Tim recruitment akan review profil kamu dalam 3–5 hari kerja."}
        </p>

        {/* Position card */}
        <div
          className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3"
          style={{ border: "1px solid var(--pg-border)" }}
        >
          <div
            className="text-[10px] font-semibold tracking-[0.12em] uppercase"
            style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
          >
            {countryLabelFromDb(application.positions.country, application.positions.country)} ·
            Lamaran kamu
          </div>
          <div className="text-[24px] font-extrabold tracking-[-0.02em] text-pg-ink-primary leading-tight">
            {application.positions.name}
          </div>
          {application.positions.description && (
            <p className="text-[13px] text-pg-ink-tertiary leading-tight">
              {application.positions.description}
            </p>
          )}
          {requirements.length > 0 && (
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mt-1"
              style={{ background: "var(--pg-ok-soft-bg)" }}
            >
              <div
                className="w-7 h-7 rounded-md grid place-items-center shrink-0"
                style={{ background: "rgba(61,122,65,0.18)" }}
              >
                <Icon
                  name="check"
                  size={14}
                  stroke={2.6}
                  className="text-pg-ok-soft-fg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-pg-ok-soft-fg">
                  Profil kamu terisi {score_pct}%
                </div>
                {missing > 0 && (
                  <div className="text-[11px] mt-0.5" style={{ color: "var(--pg-ink-tertiary)" }}>
                    Lengkapi {missing} syarat lagi biar 100%
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Langkah selanjutnya */}
        <div>
          <div
            className="text-[10px] font-semibold tracking-[0.12em] uppercase"
            style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
          >
            Langkah selanjutnya
          </div>
          <p className="text-[13px] text-pg-ink-tertiary mt-1 mb-3 leading-tight">
            Begini perjalanan dari sini sampai berangkat.
          </p>
          <div
            className="bg-pg-white rounded-2xl p-5"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            {/* Same roadmap component the lamaran-detail page uses — so the steps,
                labels, and timeframes never diverge between the two screens. */}
            <PipelineTimeline currentIdx={1} />
          </div>
        </div>

        {/* CTAs — primary action keys off REQUIRED-missing (presence). Optional
            fields left unfilled are a neutral "biar 100%" nudge in the card
            above, not a reason to push the candidate back into lengkapi. */}
        <div className="flex flex-col gap-3 mt-2">
          {requiredMissing > 0 ? (
            <Link
              href={`/applications/${id}/lengkapi`}
              className="inline-flex items-center justify-center gap-1.5 min-h-[52px] px-5 rounded-xl text-[15px] font-bold text-white no-underline"
              style={{ background: "var(--pg-red-600)" }}
            >
              Lanjut lengkapi syarat <Icon name="arrow_right" size={16} />
            </Link>
          ) : (
            <Link
              href={`/applications/${id}`}
              className="inline-flex items-center justify-center gap-1.5 min-h-[52px] px-5 rounded-xl text-[15px] font-bold text-white no-underline"
              style={{ background: "var(--pg-red-600)" }}
            >
              Lihat status lamaran <Icon name="arrow_right" size={16} />
            </Link>
          )}
          <Link
            href="/explore"
            className="text-center text-[13px] font-semibold no-underline py-2"
            style={{ color: "var(--pg-ink-tertiary)" }}
          >
            Atau jelajah lowongan lain
          </Link>
        </div>
      </div>
    </main>
  );
}
