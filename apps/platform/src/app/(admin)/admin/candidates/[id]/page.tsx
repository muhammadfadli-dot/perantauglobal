import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import ApplicationCard, { type CvFit } from "@/components/admin/ApplicationCard";
import { Icon } from "@/components/pg/Icon";
import { getApplicationCompleteness } from "@/lib/applicationCompleteness";
import type { ReadinessResultV3 } from "@/components/admin/ApplicationCard";
import CvAssessmentCard, { type CvAssessment } from "@/components/admin/CvAssessmentCard";
import DocViewButton from "./DocViewButton";
import ReGradeCvButton from "./ReGradeCvButton";

export const dynamic = "force-dynamic";

type Candidate = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  province: string | null;
  birth_date: string | null;
  gender: string | null;
  education: string | null;
  profile_data: Record<string, unknown> | null;
  source: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string;
  auth_user_id: string | null;
  referred_by_agent_id: string | null;
};

type AppRow = {
  id: string;
  position_slug: string;
  pipeline_stage: string;
  answers: Record<string, unknown> | null;
  po_notes: string | null;
  reached_out: boolean;
  reached_out_at: string | null;
  score: number | null;
  created_at: string;
  job_order_id: string | null;
  positions: {
    name: string;
    country: string;
  } | null;
  job_orders: {
    id: string;
    intake_label: string;
    internal_employer_name: string;
    status: string;
  } | null;
};

type OpenJobOrder = {
  id: string;
  intake_label: string;
  internal_employer_name: string;
  position_slug: string;
  slot_count: number;
  slot_filled: number;
};

type Document = {
  id: string;
  doc_type: string;
  verified: boolean;
  rejected_at: string | null;
  expires_at: string | null;
  uploaded_at: string;
  display_name: string | null;
  file_path: string;
};

type Activity = {
  ts: Date;
  title: string;
  desc: string;
  tone: "ok" | "warn" | "info" | "mute";
};

type FormField = {
  position_slug: string;
  field_key: string;
  field_label: string;
  field_type: string;
  options: { value: string; label: string }[] | null;
  collect_at_stage: string;
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
  deployed: "Sudah dideploy",
  active: "Aktif",
  rejected: "Tidak terpilih",
  exit: "Selesai",
};

const STAGE_TONE: Record<string, "ok" | "warn" | "info" | "mute"> = {
  applied: "mute",
  screening: "warn",
  voice_screen: "info",
  interview: "info",
  document_check: "warn",
  selected: "ok",
  training: "ok",
  deployed: "ok",
  active: "ok",
  rejected: "mute",
  exit: "mute",
};

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const [
    { data: candidate },
    { data: apps },
    { data: documents },
    { data: openJOs },
    { data: cvAssessment },
  ] = await Promise.all([
    supabase
      .from("candidates")
      .select(
        "id, full_name, email, phone, city, province, birth_date, gender, education, profile_data, source, utm_source, utm_campaign, created_at, auth_user_id, referred_by_agent_id"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("applications")
      .select(
        "id, position_slug, pipeline_stage, answers, po_notes, reached_out, reached_out_at, score, created_at, job_order_id, positions (name, country), job_orders (id, intake_label, internal_employer_name, status)"
      )
      .eq("candidate_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("candidate_documents")
      .select("id, doc_type, verified, rejected_at, expires_at, uploaded_at, display_name, file_path")
      .eq("candidate_id", id)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("job_orders")
      .select(
        "id, intake_label, internal_employer_name, position_slug, slot_count, slot_filled"
      )
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    // Latest CV assessment (AI grader, migration 0071). One row per CV doc;
    // take the most recent for this candidate.
    supabase
      .from("cv_assessments")
      .select("status, error, quality_score, quality, derived, parsed, model, created_at")
      .eq("candidate_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!candidate) return notFound();
  const cand = candidate as Candidate;

  // Referral attribution — resolve the agent name when this candidate came in
  // through an affiliate code (migration 0067). Single lightweight lookup.
  let referredByAgent: { id: string; name: string } | null = null;
  if (cand.referred_by_agent_id) {
    const { data: agentRow } = await supabase
      .from("affiliate_agents")
      .select("id, name")
      .eq("id", cand.referred_by_agent_id)
      .maybeSingle();
    referredByAgent = (agentRow as { id: string; name: string } | null) ?? null;
  }

  const applications = (apps ?? []) as unknown as AppRow[];

  // CV-to-position fit per application (migration 0071, Batch 2).
  const fitByApp = new Map<string, CvFit>();
  const appIds = applications.map((a) => a.id);
  if (appIds.length) {
    const { data: fitsData } = await supabase
      .from("application_cv_fit")
      .select("application_id, fit_score, reasons, verification, has_flags, status")
      .in("application_id", appIds);
    for (const f of fitsData ?? []) {
      fitByApp.set((f as { application_id: string }).application_id, f as unknown as CvFit);
    }
  }

  const docs = (documents ?? []) as Document[];
  const hasCv = docs.some((d) => d.doc_type === "cv");
  const openJobOrders = (openJOs ?? []) as OpenJobOrder[];
  const jobOrdersByPosition = new Map<string, OpenJobOrder[]>();
  for (const jo of openJobOrders) {
    const arr = jobOrdersByPosition.get(jo.position_slug) ?? [];
    arr.push(jo);
    jobOrdersByPosition.set(jo.position_slug, arr);
  }
  const allInJobOrder =
    applications.length > 0 && applications.every((a) => a.job_order_id);

  // Per-application completeness (Fase 6: replaces legacy getReadinessV3 which
  // depended on candidates.profile_data.credentials + positions.requirements).
  // Single fetch per application — internally pulls position_application_fields
  // + answers + documents.
  const completenessByApp = new Map<
    string,
    Awaited<ReturnType<typeof getApplicationCompleteness>>
  >();
  await Promise.all(
    applications.map(async (a) => {
      const c = await getApplicationCompleteness(a.id, supabase);
      completenessByApp.set(a.id, c);
    }),
  );

  // Adapter — ApplicationCard still expects the legacy ReadinessResultV3 shape.
  // Map ApplicationCompleteness.fields → per_field record keyed by field_key.
  function asReadinessV3(
    c: Awaited<ReturnType<typeof getApplicationCompleteness>>,
  ): ReadinessResultV3 {
    return {
      per_field: Object.fromEntries(
        c.fields.map((f) => [
          f.field_key,
          {
            passed: f.passed,
            answered: f.answered,
            self_passed: f.passed && f.field_type !== "file",
            doc_passed: f.doc_uploaded,
            importance: (f.importance === "required" ? "hard" : "soft") as
              | "hard"
              | "soft",
            category: "personal" as const,
            evidence_mode:
              f.field_type === "file"
                ? ("document" as const)
                : ("self_declared" as const),
            label: f.field_label,
            collect_at_stage: f.collect_at_stage,
          },
        ]),
      ),
      hard_pass: c.hard_pass,
      score_pct: c.score_pct,
      schema_version: 3,
    };
  }

  const readinessByApp = new Map<string, ReadinessResultV3>();
  for (const [appId, c] of completenessByApp) {
    readinessByApp.set(appId, asReadinessV3(c));
  }

  // formFields per position derived from completeness (avoids a second query).
  const formFieldsByPosition = new Map<string, FormField[]>();
  for (const a of applications) {
    const c = completenessByApp.get(a.id);
    if (!c) continue;
    formFieldsByPosition.set(
      a.position_slug,
      c.fields.map((f) => ({
        position_slug: a.position_slug,
        field_key: f.field_key,
        field_label: f.field_label,
        field_type: f.field_type,
        options: f.options,
        collect_at_stage: f.collect_at_stage,
      })),
    );
  }

  const qualifiedPositionsCount = applications.filter(
    (a) => completenessByApp.get(a.id)?.hard_pass,
  ).length;

  const initials = cand.full_name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "??";

  // Compute age from birth_date
  let age: number | null = null;
  if (cand.birth_date) {
    const b = new Date(cand.birth_date);
    // eslint-disable-next-line react-hooks/purity -- per-request age computation; non-idempotent by design
    age = Math.floor((Date.now() - b.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }

  const verifiedDocs = docs.filter((d) => d.verified).length;
  const totalDocs = docs.length;

  // Compose activity log
  const activity: Activity[] = [];
  for (const d of docs.slice(0, 4)) {
    activity.push({
      ts: new Date(d.uploaded_at),
      title: `Upload ${docTypeLabel(d.doc_type)}`,
      desc: d.expires_at
        ? `Berlaku sampai ${new Date(d.expires_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}${d.verified ? " · Diverifikasi" : ""}`
        : d.verified
        ? "Diverifikasi"
        : "Pending verifikasi",
      tone: d.verified ? "ok" : d.rejected_at ? "warn" : "warn",
    });
  }
  for (const a of applications.slice(0, 4)) {
    const r = readinessByApp.get(a.id);
    const fitPct = r?.score_pct ?? null;
    const inJO = !!a.job_order_id;
    activity.push({
      ts: new Date(a.created_at),
      title: `Lamar ${a.positions?.name ?? a.position_slug}`,
      desc: inJO
        ? `Pipeline: ${STAGE_LABEL[a.pipeline_stage] ?? a.pipeline_stage}${fitPct !== null ? ` · Fit ${fitPct}%` : ""}`
        : `Talent pool${fitPct !== null ? ` · Fit ${fitPct}%` : ""}`,
      tone: inJO ? STAGE_TONE[a.pipeline_stage] ?? "info" : "mute",
    });
  }
  activity.push({
    ts: new Date(cand.created_at),
    title: cand.auth_user_id ? "Akun aktif via magic link" : "Form submission",
    desc: `Source: ${cand.source ?? cand.utm_source ?? "—"}`,
    tone: "info",
  });
  activity.sort((a, b) => b.ts.getTime() - a.ts.getTime());

  function timeAgo(ts: Date): string {
    // eslint-disable-next-line react-hooks/purity -- per-request "X jam lalu" label; non-idempotent by design
    const diffH = Math.round((Date.now() - ts.getTime()) / (1000 * 60 * 60));
    if (diffH < 1) return "Baru aja";
    if (diffH < 24) return `${diffH} jam lalu`;
    if (diffH < 24 * 30) return `${Math.round(diffH / 24)} hari lalu`;
    return `${Math.round(diffH / 24 / 7)} minggu lalu`;
  }

  return (
    <>
      <AdminTopBar
        crumbs={[
          { label: "Operasi" },
          { label: "Kandidat", href: "/admin/candidates" },
          { label: cand.full_name, emphasis: true },
        ]}
        rightSlot={
          <div className="flex items-center gap-2">
            {cand.phone && (
              <a
                href={`https://wa.me/${cand.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-bold text-pg-ink-secondary no-underline"
                style={{ border: "1px solid var(--pg-border)", background: "var(--pg-white)" }}
              >
                <Icon name="phone" size={13} />
                Hubungi
              </a>
            )}
            {allInJobOrder ? (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-bold no-underline"
                style={{
                  border: "1px solid var(--pg-border)",
                  background: "var(--pg-ok-soft-bg)",
                  color: "var(--pg-ok-soft-fg)",
                }}
                title="Semua lamaran sudah masuk job order"
              >
                <Icon name="check" size={13} stroke={2.4} />
                Sudah di job order
              </span>
            ) : null}
          </div>
        }
      />

      <main className="px-8 py-7 grid gap-5 lg:grid-cols-3">
        {/* LEFT — profile card + kontak + dokumen */}
        <div className="flex flex-col gap-4">
          <div
            className="bg-pg-white rounded-2xl p-7 flex flex-col items-center gap-3 text-center"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <div
              className="w-24 h-24 rounded-full grid place-items-center text-white font-extrabold text-[28px] tracking-tight"
              style={{ background: "var(--pg-ink-primary)" }}
            >
              {initials}
            </div>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-[24px] font-extrabold tracking-[-0.02em] text-pg-ink-primary">
                {cand.full_name}
              </h2>
              <div
                className="text-[13px]"
                style={{ color: "var(--pg-ink-tertiary)" }}
              >
                {[cand.city, age ? `${age}thn` : null, cand.education].filter(Boolean).join(" · ") || "—"}
              </div>
            </div>
            <div className="flex items-baseline gap-7 mt-3 pt-4 w-full justify-center" style={{ borderTop: "1px solid var(--pg-border)" }}>
              <BigStat value={String(applications.length)} label="Lamaran" />
              <BigStat
                value={String(qualifiedPositionsCount)}
                label="Qualified"
                color={
                  qualifiedPositionsCount > 0 ? "var(--pg-ok-soft-fg)" : "var(--pg-ink-primary)"
                }
              />
              <BigStat
                value={`${verifiedDocs}/${totalDocs}`}
                label="Dokumen"
              />
            </div>
          </div>

          {/* Kontak */}
          <div
            className="bg-pg-white rounded-2xl p-5 flex flex-col gap-2.5"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <Eyebrow>Kontak</Eyebrow>
            {cand.email && (
              <div className="flex items-center gap-2 text-[14px]">
                <Icon name="mail" size={14} className="text-pg-ink-quaternary" />
                <span className="text-pg-ink-primary">{cand.email}</span>
              </div>
            )}
            {cand.phone && (
              <div className="flex items-center gap-2 text-[14px]">
                <Icon name="phone" size={14} className="text-pg-ink-quaternary" />
                <span className="text-pg-ink-primary">{cand.phone}</span>
              </div>
            )}
            {referredByAgent && (
              <div
                className="flex items-center gap-2 text-[14px] pt-2.5 mt-0.5"
                style={{ borderTop: "1px solid var(--pg-border-soft)" }}
              >
                <Icon name="share" size={14} className="text-pg-ink-quaternary" />
                <span className="text-pg-ink-tertiary">Direferral oleh</span>
                <Link
                  href={`/admin/agents/${referredByAgent.id}`}
                  className="font-bold text-pg-ink-primary no-underline hover:text-pg-red-600 truncate"
                >
                  {referredByAgent.name}
                </Link>
              </div>
            )}
          </div>

          {/* Dokumen */}
          <div
            className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <div className="flex items-center justify-between">
              <Eyebrow>Dokumen</Eyebrow>
              <span
                className="text-[11px] font-semibold"
                style={{
                  color: verifiedDocs === totalDocs && totalDocs > 0 ? "var(--pg-ok-soft-fg)" : "var(--pg-ink-tertiary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {verifiedDocs} / {totalDocs} verified
              </span>
            </div>
            {totalDocs === 0 ? (
              <div className="text-[12px] text-pg-ink-tertiary py-2 italic">
                Belum upload dokumen.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {docs.slice(0, 6).map((d) => {
                  const isOk = d.verified;
                  const isRejected = !!d.rejected_at;
                  return (
                    <div key={d.id} className="flex items-start gap-2.5">
                      <div
                        className="w-5 h-5 rounded grid place-items-center shrink-0 mt-0.5"
                        style={{
                          background: isOk
                            ? "var(--pg-ok-soft-bg)"
                            : isRejected
                            ? "var(--pg-err-bg)"
                            : "var(--pg-warn-soft-bg)",
                          color: isOk
                            ? "var(--pg-ok-soft-fg)"
                            : isRejected
                            ? "var(--pg-err)"
                            : "var(--pg-warn-soft-fg)",
                        }}
                      >
                        <Icon
                          name={isOk ? "check" : isRejected ? "x" : "clock"}
                          size={11}
                          stroke={2.4}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-pg-ink-primary leading-tight">
                          {d.display_name ?? docTypeLabel(d.doc_type)}
                        </div>
                        {d.expires_at && (
                          <div
                            className="text-[10px] mt-0.5 leading-tight"
                            style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                          >
                            Berlaku sampai{" "}
                            {new Date(d.expires_at).toLocaleDateString("id-ID", {
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        )}
                      </div>
                      <DocViewButton filePath={d.file_path} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <CvAssessmentCard
            a={cvAssessment as CvAssessment | null}
            action={hasCv ? <ReGradeCvButton candidateId={id} /> : null}
          />
        </div>

        {/* RIGHT — applications + activity */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div
            className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3.5"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-extrabold tracking-[-0.01em]">
                Lamaran kandidat ({applications.length})
              </h3>
              {applications.length > 3 && (
                <Link
                  href={`/admin/applications?candidate=${cand.id}`}
                  className="text-[12px] font-bold text-pg-red-600 no-underline"
                >
                  Lihat semua
                </Link>
              )}
            </div>
            {applications.length === 0 ? (
              <div className="text-[13px] text-pg-ink-tertiary italic py-4 text-center">
                Belum ada lamaran. Pull ke job order untuk mulai.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {applications.map((a) => (
                  <ApplicationCard
                    key={a.id}
                    application={a}
                    candidateName={cand.full_name}
                    openJobOrders={jobOrdersByPosition.get(a.position_slug) ?? []}
                    readiness={readinessByApp.get(a.id) ?? null}
                    formFields={formFieldsByPosition.get(a.position_slug) ?? []}
                    fit={fitByApp.get(a.id) ?? null}
                  />
                ))}
              </div>
            )}
          </div>

          <div
            className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <h3 className="text-[18px] font-extrabold tracking-[-0.01em]">
              Aktivitas terakhir
            </h3>
            <ol className="flex flex-col gap-3">
              {activity.slice(0, 6).map((a, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{
                      background:
                        a.tone === "ok"
                          ? "var(--pg-ok-soft-fg)"
                          : a.tone === "warn"
                          ? "var(--pg-warn-soft-fg)"
                          : a.tone === "info"
                          ? "var(--pg-info)"
                          : "var(--pg-ink-quaternary)",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[10px] font-semibold tracking-[0.06em] uppercase"
                      style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
                    >
                      {timeAgo(a.ts)}
                    </div>
                    <div className="text-[14px] font-bold text-pg-ink-primary leading-tight mt-0.5">
                      {a.title}
                    </div>
                    <div
                      className="text-[12px] mt-0.5"
                      style={{ color: "var(--pg-ink-tertiary)" }}
                    >
                      {a.desc}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Profile data dump (admin only) */}
          {cand.profile_data && Object.keys(cand.profile_data).length > 0 && (
            <details
              className="bg-pg-white rounded-2xl p-5"
              style={{ border: "1px solid var(--pg-border)" }}
            >
              <summary className="text-[12px] font-bold tracking-[0.08em] uppercase text-pg-ink-tertiary cursor-pointer">
                Raw profile data
              </summary>
              <pre className="mt-3 overflow-x-auto rounded-lg p-3 text-[11px] leading-[1.5] font-mono" style={{ background: "var(--pg-paper)" }}>
                {JSON.stringify(cand.profile_data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </main>
    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[10px] font-semibold tracking-[0.12em] leading-[12px] uppercase"
      style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
    >
      {children}
    </div>
  );
}

function BigStat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="text-[24px] font-extrabold leading-[28px] tabular-nums"
        style={{ color: color ?? "var(--pg-ink-primary)" }}
      >
        {value}
      </div>
      <div
        className="text-[10px] font-semibold tracking-[0.08em] uppercase"
        style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
    </div>
  );
}

function docTypeLabel(t: string): string {
  const m: Record<string, string> = {
    ktp: "KTP",
    passport: "Paspor",
    cv: "CV",
    formal_photo: "Foto formal",
    str_certificate: "Sertifikat STR",
    driving_license: "SIM",
    language_certificate: "Sertifikat bahasa",
    professional_certificate: "Sertifikat profesi",
    education_certificate: "Sertifikat pendidikan",
    work_certificate: "Sertifikat kerja",
    medical_check: "Medical check",
  };
  return m[t] ?? t;
}
