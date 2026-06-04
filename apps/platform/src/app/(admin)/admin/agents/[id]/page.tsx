import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import { Icon } from "@/components/pg/Icon";
import GenerateCodeButton from "./GenerateCodeButton";
import CodeStatusButton from "./CodeStatusButton";
import AgentStatusControls from "./AgentStatusControls";
import CommissionLedger, { formatIDR, type LedgerEvent } from "./CommissionLedger";
import type {
  AffiliateAgentStatus,
  CommissionEventStatus,
  CommissionEventType,
  ReferralCodeStatus,
} from "@perantauglobal/db";

export const dynamic = "force-dynamic";

type Agent = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  status: AffiliateAgentStatus;
  notes: string | null;
  created_at: string;
};

type Code = {
  id: string;
  code: string;
  label: string | null;
  status: ReferralCodeStatus;
  created_at: string;
};

type ReferredCandidate = {
  id: string;
  full_name: string;
  city: string | null;
  referral_attributed_at: string | null;
};

type AppRow = {
  candidate_id: string;
  pipeline_stage: string;
  positions: { name: string } | null;
};

type EventRow = {
  id: string;
  candidate_id: string;
  event_type: CommissionEventType;
  amount: number | null;
  currency: string;
  status: CommissionEventStatus;
  triggered_stage: string | null;
  created_at: string;
  candidates: { full_name: string } | null;
};

const AGENT_STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  inactive: "Nonaktif",
  suspended: "Suspended",
};
const AGENT_STATUS_TONE: Record<string, { bg: string; fg: string }> = {
  active: { bg: "var(--pg-ok-soft-bg)", fg: "var(--pg-ok-soft-fg)" },
  inactive: { bg: "var(--pg-ink-50)", fg: "var(--pg-ink-tertiary)" },
  suspended: { bg: "var(--pg-err-bg)", fg: "var(--pg-err)" },
};

const STAGE_LABEL: Record<string, string> = {
  applied: "Baru masuk",
  screening: "Screening",
  voice_screen: "Voice screen",
  interview: "Wawancara",
  document_check: "Cek dokumen",
  briefing: "Briefing",
  trial: "Trial / training",
  selected: "Terpilih",
  training: "Training",
  deployed: "Sudah berangkat",
  active: "Aktif di tempat",
  rejected: "Tidak terpilih",
  exit: "Selesai",
};

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const [{ data: agentData }, { data: codesData }, { data: referredData }, { data: eventsData }] =
    await Promise.all([
      supabase
        .from("affiliate_agents")
        .select("id, name, email, phone, city, status, notes, created_at")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("referral_codes")
        .select("id, code, label, status, created_at")
        .eq("agent_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("candidates")
        .select("id, full_name, city, referral_attributed_at")
        .eq("referred_by_agent_id", id)
        .order("referral_attributed_at", { ascending: false }),
      supabase
        .from("affiliate_commission_events")
        .select(
          "id, candidate_id, event_type, amount, currency, status, triggered_stage, created_at, candidates (full_name)",
        )
        .eq("agent_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const agent = agentData as Agent | null;
  if (!agent) return notFound();

  const codes = (codesData ?? []) as Code[];
  const referred = (referredData ?? []) as ReferredCandidate[];
  const events = (eventsData ?? []) as unknown as EventRow[];

  // Pull every application stage for the referred candidates in one query,
  // then group per candidate (a candidate may have several applications).
  const referredIds = referred.map((c) => c.id);
  let appsByCandidate = new Map<string, AppRow[]>();
  if (referredIds.length > 0) {
    const { data: appsData } = await supabase
      .from("applications")
      .select("candidate_id, pipeline_stage, positions (name)")
      .in("candidate_id", referredIds)
      .order("created_at", { ascending: false });
    const apps = (appsData ?? []) as unknown as AppRow[];
    appsByCandidate = apps.reduce((acc, a) => {
      const arr = acc.get(a.candidate_id) ?? [];
      arr.push(a);
      acc.set(a.candidate_id, arr);
      return acc;
    }, new Map<string, AppRow[]>());
  }

  const ledgerEvents: LedgerEvent[] = events.map((e) => ({
    id: e.id,
    candidate_id: e.candidate_id,
    candidate_name: e.candidates?.full_name ?? "—",
    event_type: e.event_type,
    amount: e.amount,
    currency: e.currency,
    status: e.status,
    triggered_stage: e.triggered_stage,
    created_at: e.created_at,
  }));

  // Hero metrics.
  const activeCodes = codes.filter((c) => c.status === "active").length;
  const referralTotal = referred.length;
  const departureCount = events.filter((e) => e.event_type === "departure").length;
  const pendingEvents = events.filter((e) => e.status === "pending").length;
  // Outstanding = approved-but-unpaid amounts (settlement liability).
  const outstanding = events
    .filter((e) => e.status === "approved" && e.amount != null)
    .reduce((sum, e) => sum + (e.amount ?? 0), 0);
  const paidTotal = events
    .filter((e) => e.status === "paid" && e.amount != null)
    .reduce((sum, e) => sum + (e.amount ?? 0), 0);

  const initials =
    agent.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "??";

  return (
    <>
      <AdminTopBar
        crumbs={[
          { label: "Operasi" },
          { label: "Agen afiliasi", href: "/admin/agents" },
          { label: agent.name, emphasis: true },
        ]}
        rightSlot={
          agent.phone ? (
            <a
              href={`https://wa.me/${agent.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-bold text-pg-ink-secondary no-underline"
              style={{ border: "1px solid var(--pg-border)", background: "var(--pg-white)" }}
            >
              <Icon name="phone" size={13} /> Hubungi
            </a>
          ) : undefined
        }
      />

      <main className="px-8 py-7 flex flex-col gap-5">
        {/* Header + hero metrics */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4 min-w-0 max-w-2xl">
            <div
              className="w-16 h-16 rounded-2xl grid place-items-center text-white font-extrabold text-[22px] tracking-tight shrink-0"
              style={{ background: "var(--pg-ink-primary)" }}
            >
              {initials}
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold tracking-[0.06em] uppercase"
                  style={{
                    background: AGENT_STATUS_TONE[agent.status]?.bg,
                    color: AGENT_STATUS_TONE[agent.status]?.fg,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {AGENT_STATUS_LABEL[agent.status]}
                </span>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                >
                  Agen sejak{" "}
                  {new Date(agent.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h1 className="text-[32px] font-extrabold leading-[36px] tracking-[-0.025em] text-pg-ink-primary truncate">
                {agent.name}
              </h1>
              <div className="text-[13px]" style={{ color: "var(--pg-ink-tertiary)" }}>
                {[agent.city, agent.email, agent.phone].filter(Boolean).join(" · ") || "—"}
              </div>
            </div>
          </div>
          <div className="flex items-end gap-7 flex-wrap">
            <HeroStat value={String(activeCodes)} label="Kode aktif" />
            <HeroStat value={String(referralTotal)} label="Kandidat ke-refer" />
            <HeroStat
              value={String(departureCount)}
              label="Berangkat"
              color={departureCount > 0 ? "var(--pg-ok-soft-fg)" : undefined}
            />
            <HeroStat
              value={formatIDR(outstanding)}
              label="Komisi outstanding"
              small
              color={outstanding > 0 ? "var(--pg-warn-soft-fg)" : undefined}
            />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* LEFT column: codes + agent info/status */}
          <div className="flex flex-col gap-4">
            {/* Referral codes card */}
            <div
              className="bg-pg-white rounded-2xl"
              style={{ border: "1px solid var(--pg-border)" }}
            >
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: "1px solid var(--pg-border)" }}
              >
                <span
                  className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                  style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                >
                  Kode referral
                </span>
                <GenerateCodeButton agentId={agent.id} />
              </div>
              <div className="flex flex-col">
                {codes.length === 0 && (
                  <div className="px-5 py-6 text-[13px] text-pg-ink-tertiary italic text-center">
                    Belum ada kode. Generate satu untuk agen ini.
                  </div>
                )}
                {codes.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                    style={{ borderBottom: "1px solid var(--pg-border-soft)" }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[14px] font-bold tracking-[0.02em] text-pg-ink-primary"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {c.code}
                        </span>
                        <span
                          className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold tracking-[0.06em] uppercase"
                          style={{
                            background:
                              c.status === "active"
                                ? "var(--pg-ok-soft-bg)"
                                : "var(--pg-ink-50)",
                            color:
                              c.status === "active"
                                ? "var(--pg-ok-soft-fg)"
                                : "var(--pg-ink-tertiary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {c.status === "active" ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                      <div
                        className="text-[10px] mt-0.5"
                        style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                      >
                        {c.label ? `${c.label} · ` : ""}
                        {new Date(c.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <CodeStatusButton codeId={c.id} status={c.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Agent info + status */}
            <div
              className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3"
              style={{ border: "1px solid var(--pg-border)" }}
            >
              <div
                className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
              >
                Status agen
              </div>
              <AgentStatusControls agentId={agent.id} current={agent.status} />
              {agent.notes && (
                <div className="pt-2" style={{ borderTop: "1px solid var(--pg-border)" }}>
                  <div
                    className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5"
                    style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                  >
                    Catatan internal
                  </div>
                  <p className="text-[13px] text-pg-ink-secondary leading-relaxed whitespace-pre-wrap">
                    {agent.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT column: referrals + commission ledger */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Referrals table */}
            <div
              className="bg-pg-white rounded-2xl"
              style={{ border: "1px solid var(--pg-border)" }}
            >
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--pg-border)" }}
              >
                <h3 className="text-[16px] font-extrabold tracking-[-0.01em]">
                  Kandidat ke-refer ({referralTotal})
                </h3>
              </div>
              {referred.length === 0 ? (
                <div className="px-5 py-6 text-[13px] text-pg-ink-tertiary italic text-center">
                  Belum ada kandidat yang pakai kode agen ini.
                </div>
              ) : (
                <div className="flex flex-col">
                  {referred.map((c) => {
                    const apps = appsByCandidate.get(c.id) ?? [];
                    return (
                      <Link
                        key={c.id}
                        href={`/admin/candidates/${c.id}`}
                        className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-pg-paper transition-colors no-underline"
                        style={{ borderBottom: "1px solid var(--pg-border-soft)" }}
                      >
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold text-pg-ink-primary truncate">
                            {c.full_name}
                          </div>
                          <div
                            className="text-[11px] mt-0.5 truncate"
                            style={{
                              color: "var(--pg-ink-tertiary)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {c.city ?? "—"}
                            {c.referral_attributed_at
                              ? ` · ${new Date(c.referral_attributed_at).toLocaleDateString(
                                  "id-ID",
                                  { day: "numeric", month: "short", year: "numeric" },
                                )}`
                              : ""}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 justify-end shrink-0 max-w-[55%]">
                          {apps.length === 0 ? (
                            <span className="text-[11px] text-pg-ink-quaternary">
                              Belum ada lamaran
                            </span>
                          ) : (
                            apps.slice(0, 3).map((a, i) => (
                              <span
                                key={i}
                                className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold tracking-[0.04em] uppercase"
                                style={{
                                  background: "var(--pg-ink-50)",
                                  color: "var(--pg-ink-secondary)",
                                  fontFamily: "var(--font-mono)",
                                }}
                                title={a.positions?.name ?? undefined}
                              >
                                {STAGE_LABEL[a.pipeline_stage] ?? a.pipeline_stage}
                              </span>
                            ))
                          )}
                          {apps.length > 3 && (
                            <span className="text-[10px] text-pg-ink-quaternary">
                              +{apps.length - 3}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Commission ledger */}
            <div
              className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3"
              style={{ border: "1px solid var(--pg-border)" }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-[16px] font-extrabold tracking-[-0.01em]">Ledger komisi</h3>
                <div className="flex items-center gap-3 text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                  <span style={{ color: "var(--pg-warn-soft-fg)" }}>
                    {pendingEvents} pending
                  </span>
                  <span style={{ color: "var(--pg-ok-soft-fg)" }}>
                    {formatIDR(paidTotal)} dibayar
                  </span>
                </div>
              </div>
              <CommissionLedger events={ledgerEvents} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function HeroStat({
  value,
  label,
  color,
  small,
}: {
  value: string;
  label: string;
  color?: string;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col items-start">
      <div
        className={`font-extrabold tabular-nums leading-[40px] ${
          small ? "text-[24px] leading-[28px]" : "text-[36px]"
        }`}
        style={{ color: color ?? "var(--pg-ink-primary)" }}
      >
        {value}
      </div>
      <div
        className="text-[10px] mt-1 font-semibold tracking-[0.06em] uppercase"
        style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
    </div>
  );
}
