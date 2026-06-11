import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { BottomNav } from "@/components/pg/AppChrome";
import {
  getDashboardData,
  getTimeOfDayGreeting,
  sortLamaranByUrgency,
  deriveBerandaState,
  type LamaranJourney,
} from "@/lib/journey";
import { formatMemberId } from "@/lib/candidate";
import {
  BerandaTopBar,
  BerandaHeader,
  SectionHead,
} from "@/components/pg/candidate/BerandaShared";
import { JourneyHero } from "@/components/pg/candidate/JourneyHero";
import { PasporInviteCard } from "@/components/pg/candidate/PasporInviteCard";
import { TaskCard } from "@/components/pg/candidate/TaskCard";
import { CountryBigTile } from "@/components/pg/candidate/CountryBigTile";
import { ProgressNudge } from "@/components/pg/candidate/ProgressNudge";
import { PendampingCard } from "@/components/pg/candidate/PendampingCard";
import { TerminalCard } from "@/components/pg/candidate/TerminalCard";
import {
  COUNTRY_KEYS,
  COUNTRY_META,
  normalizeCountryKey,
  countryLabelFromDb,
  type CountryKey,
} from "@perantauglobal/db/country";
import { positionHeroUrl } from "@perantauglobal/db/media";

export const dynamic = "force-dynamic";

type ExploreCardData = {
  slug: string;
  country: string;
  flag: string;
  countryLabel: string;
  role: string;
  salary: string;
  status: "open" | "queue";
};

// Pull salary off positions.content.cardMeta.salary (mirrors explore/page.tsx).
function pickSalary(content: unknown): string {
  if (!content || typeof content !== "object" || Array.isArray(content)) return "—";
  const meta = (content as Record<string, unknown>).cardMeta;
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return "—";
  const salary = (meta as Record<string, unknown>).salary;
  return typeof salary === "string" && salary.trim() ? salary : "—";
}

export default async function DashboardPage() {
  const { session, candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  // Parallel: dashboard data + active positions (for S1 counts + S2 explore
  // cards) + open job_orders (for status) + candidate meta.
  const [dashboard, positionsResult, jobOrdersResult, candidateMeta] =
    await Promise.all([
      getDashboardData(candidateId, supabase),
      supabase
        .from("positions")
        .select("slug, name, country, content, active, created_at")
        .eq("active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("job_orders")
        .select("position_slug")
        .eq("status", "open"),
      supabase
        .from("candidates")
        .select("created_at")
        .eq("id", candidateId)
        .single(),
    ]);

  const lamaranSorted = sortLamaranByUrgency(dashboard.lamaran);
  const primary = lamaranSorted[0];
  const state = deriveBerandaState(primary);

  const firstName =
    (dashboard.candidateFullName || session.email || "kandidat").split(" ")[0];

  const activePositions = (positionsResult.data ?? []) as Array<{
    slug: string;
    name: string;
    country: string;
    content: unknown;
  }>;

  const positionCounts = Object.fromEntries(
    COUNTRY_KEYS.map((k) => [k, 0]),
  ) as Record<CountryKey, number>;
  for (const row of activePositions) {
    const k = normalizeCountryKey(row.country);
    if (k) positionCounts[k]++;
  }

  // Slugs with an open job_order → "open", otherwise "queue" (talent-pool).
  const openSlugs = new Set(
    ((jobOrdersResult.data ?? []) as Array<{ position_slug: string }>).map(
      (j) => j.position_slug,
    ),
  );

  // Build explore cards from real positions for S2's "Eksplor lowongan lain".
  // Exclude positions the candidate already applied to.
  const appliedSlugs = new Set(dashboard.lamaran.map((l) => l.positionSlug));
  const exploreCards: ExploreCardData[] = activePositions
    .filter((p) => !appliedSlugs.has(p.slug))
    .map((p) => {
      const k = normalizeCountryKey(p.country);
      const meta = k ? COUNTRY_META[k] : null;
      return {
        slug: p.slug,
        country: meta?.key ?? p.country,
        flag: meta?.flag ?? "🌐",
        countryLabel: meta?.label ?? p.country,
        role: p.name,
        salary: pickSalary(p.content),
        status: openSlugs.has(p.slug) ? ("open" as const) : ("queue" as const),
      };
    })
    .slice(0, 6);

  const memberId = candidateMeta.data
    ? formatMemberId(candidateId, (candidateMeta.data as { created_at: string }).created_at)
    : undefined;

  const greeting = `${getTimeOfDayGreeting()}, ${firstName} 👋`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <BerandaTopBar />
      <main className="flex-1 pb-8 pt-1">
        {state === "S1" && (
          <BerandaS1
            greeting={greeting}
            memberId={memberId}
            identityFilled={dashboard.identityFilledCount}
            identityTotal={dashboard.identityTotalCount}
            positionCounts={positionCounts}
          />
        )}
        {state === "S2" && primary && (
          <BerandaS2
            greeting={greeting}
            memberId={memberId}
            primary={primary}
            exploreCards={exploreCards}
          />
        )}
        {state === "S3" && primary && (
          <BerandaS3
            greeting={greeting}
            memberId={memberId}
            primary={primary}
          />
        )}
        {state === "hasil-diterima" && primary && (
          <BerandaTerminal
            greeting={greeting}
            memberId={memberId}
            primary={primary}
            outcome="diterima"
          />
        )}
        {state === "hasil-ditolak" && primary && (
          <BerandaTerminal
            greeting={greeting}
            memberId={memberId}
            primary={primary}
            outcome="ditolak"
          />
        )}
      </main>
      <BottomNav />
    </div>
  );
}

// ─── S1: No application yet ────────────────────────────────────────────────
function BerandaS1({
  greeting,
  memberId,
  identityFilled,
  identityTotal,
  positionCounts,
}: {
  greeting: string;
  memberId?: string;
  identityFilled: number;
  identityTotal: number;
  positionCounts: Record<CountryKey, number>;
}) {
  const presentKeys = COUNTRY_KEYS.filter((k) => positionCounts[k] > 0);
  const totalOpen = presentKeys.reduce((a, k) => a + positionCounts[k], 0);
  const profileIncomplete = identityFilled < identityTotal;
  return (
    <>
      <BerandaHeader
        greeting={greeting}
        memberId={memberId}
        headline={
          <>
            Mau kerja <span style={{ color: "var(--pg-red-600)" }}>di mana</span>?
          </>
        }
        sub={`${totalOpen} lowongan di ${presentKeys.length} negara. Pilih satu dulu, lengkapi profil sambil jalan.`}
      />

      {/* Country picker — horizontal scroll, derived from active positions */}
      <div className="pl-5">
        <div className="flex gap-3 overflow-x-auto pb-1 pr-5 scrollbar-none" style={{ scrollbarWidth: "none" as const }}>
          {presentKeys.map((k) => {
            const meta = COUNTRY_META[k];
            return (
              <CountryBigTile
                key={k}
                slug={k}
                flag={meta.flag}
                name={meta.label}
                count={`${positionCounts[k]} posisi`}
                href={`/explore?country=${encodeURIComponent(meta.dbValue)}`}
              />
            );
          })}
        </div>
      </div>

      {/* Profile progress — soft nudge */}
      {profileIncomplete && (
        <div className="px-5 pt-4">
          <ProgressNudge filled={identityFilled} total={identityTotal} />
        </div>
      )}

      {/* Paspor invite — compact secondary */}
      <div className="px-5 pt-4">
        <div className="mb-2.5">
          <span
            className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--pa-amber-700)" }}
          >
            Belajar duluan, sambil milih
          </span>
        </div>
        <PasporInviteCard variant="compact" countryLabel="Jepang" />
      </div>
    </>
  );
}

// ─── S2: Active application, needs lengkapi/upload (most common) ─────────
function BerandaS2({
  greeting,
  memberId,
  primary,
  exploreCards,
}: {
  greeting: string;
  memberId?: string;
  primary: LamaranJourney;
  exploreCards: ExploreCardData[];
}) {
  const countryLabel = countryLabelFromDb(primary.country, primary.country);
  return (
    <>
      <BerandaHeader
        greeting={greeting}
        memberId={memberId}
        headline={
          <>
            Perjalananmu ke{" "}
            <span style={{ color: "var(--pg-red-600)" }}>{countryLabel}</span>{" "}
            lagi jalan.
          </>
        }
      />

      <div className="px-5">
        <JourneyHero
          mode="applying"
          countrySlug={primary.country}
          positionName={primary.positionName}
          applicationId={primary.applicationId}
          positionSlug={primary.positionSlug}
        />
      </div>

      {/* Tasks hari ini */}
      <div className="px-5 pt-5">
        <SectionHead
          title="Tugas hari ini"
          sub={
            primary.needsDocs ? "Lengkapi syarat agar lamaran bisa lanjut" : "Pantau status"
          }
        />
        <div className="flex flex-col gap-2.5">
          {primary.needsDocs ? (
            <TaskCard
              icon="passport"
              title="Lengkapi syarat lamaran"
              meta="Upload dokumen + isi pertanyaan sisanya"
              deadline="Sekarang"
              urgent
              href={`/applications/${primary.applicationId}/lengkapi`}
            />
          ) : (
            <TaskCard
              icon="clock"
              title="Pantau status lamaran"
              meta="Cek update terakhir dari tim Perantau Global"
              href={`/applications/${primary.applicationId}`}
            />
          )}
        </div>
      </div>

      {/* Sambil nunggu — Paspor secondary */}
      <div className="px-5 pt-5">
        <SectionHead
          title="Sambil nunggu"
          sub={`Lanjut persiapan ${countryLabel}`}
        />
        <PasporInviteCard variant="default" countryLabel={countryLabel} />
      </div>

      {/* Eksplor lain */}
      {exploreCards.length > 0 && (
        <div className="pt-5">
          <div className="px-5">
            <SectionHead title="Eksplor lowongan lain" sub="Mungkin ada yang lebih cocok" allHref="/explore" />
          </div>
          <div className="pl-5">
            <div className="flex gap-3 overflow-x-auto pb-1 pr-5 scrollbar-none" style={{ scrollbarWidth: "none" as const }}>
              {exploreCards.map((c) => (
                <ExploreCard
                  key={c.slug}
                  slug={c.slug}
                  country={c.country}
                  flag={c.flag}
                  countryLabel={c.countryLabel}
                  role={c.role}
                  salary={c.salary}
                  status={c.status}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── S3: Application processing (docs complete, waiting for review) ──────
function BerandaS3({
  greeting,
  memberId,
  primary,
}: {
  greeting: string;
  memberId?: string;
  primary: LamaranJourney;
}) {
  const countryLabel = countryLabelFromDb(primary.country, primary.country);
  return (
    <>
      <BerandaHeader
        greeting={greeting}
        memberId={memberId}
        headline={
          <>
            Lamaran kamu lagi{" "}
            <span style={{ color: "var(--pg-red-600)" }}>diproses</span>.
          </>
        }
        sub="Biasanya 5-7 hari kerja. Tim Perantau kabari segera."
      />

      <div className="px-5">
        <JourneyHero
          mode="processing"
          countrySlug={primary.country}
          positionName={primary.positionName}
          applicationId={primary.applicationId}
          positionSlug={primary.positionSlug}
        />
      </div>

      {/* Paspor jadi primer */}
      <div className="px-5 pt-5">
        <SectionHead
          title="Manfaatkan waktu nunggu"
          sub={`Mulai belajar untuk ${countryLabel} — sertifikat di akhir`}
        />
        <PasporInviteCard variant="primary" countryLabel={countryLabel} />
      </div>

      {/* Pendamping */}
      <div className="px-5 pt-5">
        <SectionHead title="Pesan dari Perantau Global" />
        <PendampingCard
          msg={`Halo! Dokumen kamu sudah kami terima. Tim sedang review lamaran kamu untuk ${primary.positionName} di ${countryLabel}. Kami kabari segera.`}
          time="Baru saja"
        />
      </div>
    </>
  );
}

// ─── Terminal: hasil diterima / ditolak ──────────────────────────────────
function BerandaTerminal({
  greeting,
  memberId,
  primary,
  outcome,
}: {
  greeting: string;
  memberId?: string;
  primary: LamaranJourney;
  outcome: "diterima" | "ditolak";
}) {
  const countryLabel = countryLabelFromDb(primary.country, primary.country);
  return (
    <>
      <BerandaHeader
        greeting={greeting}
        memberId={memberId}
        headline={
          outcome === "diterima" ? (
            <>Selamat berangkat ke <span style={{ color: "var(--pg-red-600)" }}>{countryLabel}</span> 🎉</>
          ) : (
            <>Hasil lamaranmu sudah keluar.</>
          )
        }
      />
      <div className="px-5">
        <TerminalCard
          outcome={outcome}
          positionName={primary.positionName}
          country={countryLabel}
          applicationId={primary.applicationId}
        />
      </div>
      {outcome === "diterima" && (
        <div className="px-5 pt-5">
          <SectionHead
            title="Persiapan keberangkatan"
            sub="Modul Paspor + tips dari alumni"
          />
          <PasporInviteCard variant="primary" countryLabel={countryLabel} />
        </div>
      )}
    </>
  );
}

// ─── Mini explore card (S2 horizontal scroll) ─────────────────────────────
function ExploreCard({
  slug,
  flag,
  countryLabel,
  role,
  salary,
  status,
}: {
  slug: string;
  country: string;
  flag: string;
  countryLabel: string;
  role: string;
  salary: string;
  status: "open" | "queue";
}) {
  return (
    <Link
      href={`/explore?position=${encodeURIComponent(slug)}`}
      className="flex flex-col shrink-0 rounded-[14px] overflow-hidden bg-pg-white no-underline transition-transform hover:-translate-y-0.5"
      style={{
        width: 220,
        border: "1px solid var(--pg-ink-100)",
        boxShadow:
          "0 1px 2px rgba(20,16,12,0.04), 0 8px 24px rgba(20,16,12,0.06)",
      }}
    >
      <div
        className="relative h-[110px] bg-cover bg-center bg-pg-ink-50"
        style={{ backgroundImage: `url(${positionHeroUrl(slug)})` }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,16,12,0.10) 0%, rgba(20,16,12,0.45) 100%)",
          }}
        />
        <span
          className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-[0.04em]"
          style={{ background: "rgba(255,255,255,0.94)", color: "var(--pg-ink-900)" }}
        >
          <span aria-hidden className="text-[11px] leading-none">{flag}</span>
          {countryLabel}
        </span>
        <span
          className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9.5px] font-bold uppercase tracking-[0.06em]"
          style={
            status === "open"
              ? { background: "var(--pg-red-600)", color: "#fff" }
              : { background: "rgba(255,255,255,0.92)", color: "var(--pg-ink-700)" }
          }
        >
          {status === "open" ? "Lagi buka" : "Antrian"}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-0.5">
        <span className="text-[14px] font-extrabold tracking-[-0.01em] text-pg-ink-900">
          {role}
        </span>
        <span className="font-mono text-[11px] text-pg-ink-500 tracking-[0.02em]">
          {salary === "—" ? (
            "Gaji menyusul"
          ) : (
            <>
              {salary} <span style={{ opacity: 0.6 }}>/bulan</span>
            </>
          )}
        </span>
      </div>
    </Link>
  );
}
