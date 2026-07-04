import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import { getApplicationCompleteness } from "@/lib/applicationCompleteness";
import { getApplicationStatus } from "@/lib/applicationStatus";
import { waLink } from "@/lib/contact";
import { BerandaTopBar, SectionHead } from "@/components/pg/candidate/BerandaShared";
import {
  PipelineTimeline,
  DocStateBadge,
} from "@/components/pg/candidate/PipelineTimeline";
import { PendampingCard } from "@/components/pg/candidate/PendampingCard";
import {
  COUNTRY_FLAG,
  COUNTRY_LABEL as COUNTRY_LABEL_PORTAL,
  COUNTRY_TINT,
  normalizeCountry,
} from "@/components/pg/candidate/LowonganTiles";
import { positionHeroUrl, countryImageUrl } from "@perantauglobal/db/media";

export const dynamic = "force-dynamic";

type PositionRow = {
  slug: string;
  name: string;
  country: string;
  description: string | null;
};

type ApplicationRow = {
  id: string;
  candidate_id: string;
  position_slug: string;
  pipeline_stage: string;
  job_order_id: string | null;
  created_at: string;
  positions: PositionRow | null;
};

// Map pipeline_stage → 3-stage timeline currentIdx (0=Terkirim, 1=Diproses, 2=Hasil).
// "Diproses" covers every in-progress internal stage; only terminal stages reach Hasil.
function deriveTimelineIdx(stage: string): number {
  if (["selected", "training", "deployed", "active", "rejected", "exit"].includes(stage)) {
    return 2; // Hasil
  }
  return 1; // Diproses — Terkirim is already done once the lamaran exists
}

const REQUIRED_DOCS = [
  { key: "ktp", label: "KTP" },
  { key: "passport", label: "Paspor" },
  { key: "formal_photo", label: "Foto formal" },
  { key: "cv", label: "CV" },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const { data: appData } = await supabase
    .from("applications")
    .select(
      "id, candidate_id, position_slug, pipeline_stage, job_order_id, created_at, positions (slug, name, country, description)"
    )
    .eq("id", id)
    .eq("candidate_id", candidateId)
    .single();
  const application = appData as unknown as ApplicationRow | null;
  if (!application || !application.positions) notFound();

  const [completenessRes, docsRes] = await Promise.all([
    getApplicationCompleteness(application.id, supabase),
    supabase
      .from("candidate_documents")
      .select("doc_type, verified, rejected_at, uploaded_at")
      .eq("candidate_id", candidateId)
      .order("uploaded_at", { ascending: false }),
  ]);
  const completeness = completenessRes;
  const docsRows = (docsRes.data ?? []) as Array<{
    doc_type: string;
    verified: boolean;
    rejected_at: string | null;
    uploaded_at: string;
  }>;

  const position = application.positions;
  const { all_required_filled, required_remaining } = completeness;
  // Candidate-facing "still has work" = required fields not yet ANSWERED
  // (presence), NOT whether the answers qualify. An honest non-qualifying answer
  // is done from the candidate's side — eligibility is an admin concern
  // (hard_pass). Optional/Bonus fields never drive this red nudge.
  const requiredOpen = required_remaining;

  const status = getApplicationStatus({
    pipelineStage: application.pipeline_stage,
    allRequiredFilled: all_required_filled,
  });
  const isRejected = status.key === "rejected";
  const isAccepted = status.key === "accepted";
  const showLengkapi = !isRejected && requiredOpen > 0;

  const countryKey = normalizeCountry(position.country);
  const countryLabel = countryKey
    ? COUNTRY_LABEL_PORTAL[countryKey]
    : position.country;
  const flag = countryKey ? COUNTRY_FLAG[countryKey] : "🌐";
  const tint = countryKey ? COUNTRY_TINT[countryKey] : "#36598c";

  const timelineIdx = deriveTimelineIdx(application.pipeline_stage);

  // Doc state lookup
  const docsLatestByType = new Map<string, { verified: boolean; rejected: boolean }>();
  for (const d of docsRows) {
    const key = d.doc_type === "photo" ? "formal_photo" : d.doc_type;
    if (!docsLatestByType.has(key)) {
      docsLatestByType.set(key, {
        verified: d.verified,
        rejected: !!d.rejected_at,
      });
    }
  }
  const docsVerifiedCount = REQUIRED_DOCS.filter(
    (d) => docsLatestByType.get(d.key)?.verified,
  ).length;

  const appliedDate = new Date(application.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const waMsg = `Halo Perantau Global, saya mau tanya tentang lamaran ${position.name} (ID #${application.id.slice(0, 8)}).`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <BerandaTopBar />
      <main className="flex-1 pb-32 pt-1">
        {/* Back button row */}
        <div className="px-5 pb-2">
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-pg-ink-700 no-underline"
          >
            <Icon name="arrow_left" size={14} stroke={2.4} />
            Semua lamaran
          </Link>
        </div>

        {/* Position hero — photo tile with country tint */}
        <div className="px-5 pb-4">
          <div
            className="relative overflow-hidden rounded-[18px] text-white isolate"
            style={{
              minHeight: 140,
              background: tint,
              boxShadow:
                "0 2px 6px rgba(20,16,12,0.06), 0 18px 42px rgba(20,16,12,0.10)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{
                backgroundImage: countryKey
                  ? `url(${positionHeroUrl(application.position_slug)}), url(${countryImageUrl(countryKey)})`
                  : `url(${positionHeroUrl(application.position_slug)})`,
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 z-[1]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20,16,12,0.10) 0%, rgba(20,16,12,0.20) 35%, rgba(20,16,12,0.62) 100%)",
              }}
            />
            <div className="relative z-[2] p-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/92">
                {flag} {countryLabel}
              </span>
              <div
                className="mt-1.5 text-[22px] font-extrabold tracking-[-0.02em] leading-tight"
                style={{ textShadow: "0 2px 6px rgba(0,0,0,0.30)" }}
              >
                {position.name}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="font-mono text-[10.5px] tracking-[0.04em] text-white/85">
                  Dilamar {appliedDate}
                </span>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-bold uppercase tracking-[0.06em]"
                  style={{
                    background:
                      status.tone === "ok"
                        ? "rgba(15,138,74,0.92)"
                        : isRejected
                        ? "rgba(185,29,36,0.92)"
                        : "rgba(255,255,255,0.20)",
                    color: "#fff",
                  }}
                >
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="px-5">
          <SectionHead
            title="Tahap progres"
            sub={
              isAccepted
                ? "Selamat! Tahap berikutnya: persiapan keberangkatan."
                : isRejected
                ? "Lamaran ini belum cocok. Cari posisi lain di Lowongan."
                : `Tahap ${timelineIdx + 1} dari 3 · biasanya total 4-6 minggu`
            }
          />
          <div
            className="rounded-[14px] p-4 bg-pg-white"
            style={{
              border: "1px solid var(--pg-ink-100)",
              boxShadow:
                "0 1px 2px rgba(20,16,12,0.04), 0 8px 24px rgba(20,16,12,0.06)",
            }}
          >
            <PipelineTimeline
              currentIdx={timelineIdx}
              customMeta={{
                0: `Dilamar ${appliedDate}`,
              }}
              insets={
                showLengkapi
                  ? {
                      [timelineIdx]: (
                        <div
                          className="rounded-[10px] px-3 py-2.5 flex items-center gap-2 text-[12.5px] font-semibold text-pg-red-700"
                          style={{
                            background:
                              "linear-gradient(180deg, #fff 0%, var(--pg-red-50) 100%)",
                            border: "1px solid var(--pg-red-100)",
                          }}
                        >
                          <Icon name="info" size={14} stroke={2.2} />
                          <span className="flex-1">
                            {requiredOpen} syarat belum lengkap.
                          </span>
                          <Link
                            href={`/applications/${application.id}/lengkapi`}
                            className="text-[12px] font-extrabold text-pg-red-600 no-underline"
                          >
                            Lengkapi ›
                          </Link>
                        </div>
                      ),
                    }
                  : undefined
              }
            />
          </div>
        </div>

        {/* Documents */}
        <div className="px-5 pt-5">
          <SectionHead
            title="Dokumen kamu"
            sub={`${docsVerifiedCount} dari ${REQUIRED_DOCS.length} terverifikasi`}
            allHref="/profile/dokumen"
          />
          <div className="flex flex-col gap-2">
            {REQUIRED_DOCS.map((d) => {
              const row = docsLatestByType.get(d.key);
              const state: "verified" | "review" | "missing" =
                row?.verified
                  ? "verified"
                  : row
                  ? "review"
                  : "missing";
              return (
                <Link
                  key={d.key}
                  href="/profile/dokumen"
                  className="flex items-center gap-3 p-3 rounded-[12px] bg-pg-white no-underline text-pg-ink-900"
                  style={{
                    // Documents are collected at the Cek Dokumen stage, so a
                    // not-yet-uploaded doc is a calm to-do (amber), not a red
                    // alarm. Red is reserved for real blockers.
                    border: "1px solid var(--pg-ink-100)",
                    boxShadow:
                      "0 1px 2px rgba(20,16,12,0.04), 0 4px 12px rgba(20,16,12,0.04)",
                    background: "var(--pg-white)",
                  }}
                >
                  <span
                    className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
                    style={
                      state === "verified"
                        ? { background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }
                        : state === "review"
                        ? { background: "var(--pg-info-bg)", color: "var(--pg-info)" }
                        : { background: "var(--pa-amber-100)", color: "var(--pa-amber-700)" }
                    }
                  >
                    <Icon
                      name={state === "verified" ? "check" : state === "review" ? "clock" : "upload"}
                      size={16}
                      stroke={state === "missing" ? 2.5 : 2}
                    />
                  </span>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-[13.5px] font-extrabold tracking-[-0.01em]">
                      {d.label}
                    </span>
                    <DocStateBadge state={state} />
                  </div>
                  <span
                    className="text-[12px] font-extrabold"
                    style={{ color: "var(--pg-ink-700)" }}
                  >
                    {state === "missing" ? "Upload ›" : "Lihat ›"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Pendamping */}
        <div className="px-5 pt-5">
          <SectionHead title="Pendamping kamu" />
          <PendampingCard
            name="Tim Perantau Global"
            initials="PG"
            msg="Halo! Kami pantau lamaran kamu di sini. Kalau ada pertanyaan, chat lewat WhatsApp ya."
            time="Online"
            whatsappHref={waLink(waMsg)}
          />
        </div>
      </main>

      {/* Sticky CTA — Lengkapi if needed */}
      {showLengkapi && (
        <div
          className="fixed bottom-[68px] left-0 right-0 z-30 px-5 py-3 border-t border-pg-ink-100"
          style={{
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <Link
            href={`/applications/${application.id}/lengkapi`}
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-[12px] font-extrabold text-[14px] text-white no-underline"
            style={{
              background: "var(--pg-red-600)",
              boxShadow: "0 4px 12px rgba(215,38,47,0.20)",
            }}
          >
            Lengkapi {requiredOpen} syarat <Icon name="arrow_right" size={16} />
          </Link>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
