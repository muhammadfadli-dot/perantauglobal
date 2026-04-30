import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import AdminTopBar from "@/components/admin/TopBar";
import ApplicationCard from "@/components/admin/ApplicationCard";
import { Icon } from "@/components/pg/Icon";

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
  positions: {
    name: string;
    country: string;
    requirements: Record<string, unknown> | null;
  } | null;
  application_tiers: { tier: "A" | "B" | "C" | "D" | "rejected" } | null;
};

type Document = {
  id: string;
  doc_type: string;
  verified: boolean;
  rejected_at: string | null;
  expires_at: string | null;
  uploaded_at: string;
  display_name: string | null;
};

type Activity = {
  ts: Date;
  title: string;
  desc: string;
  tone: "ok" | "warn" | "info" | "mute";
};

const STAGE_LABEL: Record<string, string> = {
  applied: "Sedang diseleksi",
  screening: "Sedang diseleksi",
  voice_screen: "Voice screen",
  interview: "Wawancara",
  document_check: "Cek dokumen",
  briefing: "Briefing",
  trial: "Trial / training",
  selected: "Terpilih",
  training: "Training",
  deployed: "Sudah dideploy",
  active: "Active",
  rejected: "Tidak terpilih",
  exit: "Selesai",
};

const STAGE_TONE: Record<string, "ok" | "warn" | "info" | "mute"> = {
  applied: "warn",
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

  const [{ data: candidate }, { data: apps }, { data: documents }] = await Promise.all([
    supabase
      .from("candidates")
      .select(
        "id, full_name, email, phone, city, province, birth_date, gender, education, profile_data, source, utm_source, utm_campaign, created_at, auth_user_id"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("applications")
      .select(
        "id, position_slug, pipeline_stage, answers, po_notes, reached_out, reached_out_at, score, created_at, positions (name, country, requirements), application_tiers (tier)"
      )
      .eq("candidate_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("candidate_documents")
      .select("id, doc_type, verified, rejected_at, expires_at, uploaded_at, display_name")
      .eq("candidate_id", id)
      .order("uploaded_at", { ascending: false }),
  ]);

  if (!candidate) return notFound();
  const cand = candidate as Candidate;
  const applications = (apps ?? []) as unknown as AppRow[];
  const docs = (documents ?? []) as Document[];

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
    age = Math.floor((Date.now() - b.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }

  const verifiedDocs = docs.filter((d) => d.verified).length;
  const totalDocs = docs.length;

  // Pull tier from highest priority application
  const allTiers = applications
    .map((a) => a.application_tiers?.tier)
    .filter(Boolean) as string[];
  const topTier = allTiers.includes("A")
    ? "A"
    : allTiers.includes("B")
    ? "B"
    : allTiers.includes("C")
    ? "C"
    : allTiers.includes("D")
    ? "D"
    : null;

  // Average FIT % across applications
  const avgFit =
    applications.length > 0
      ? Math.round(
          applications.reduce((s, a) => s + (a.score ?? 0), 0) / applications.length
        )
      : 0;

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
    activity.push({
      ts: new Date(a.created_at),
      title: `Lamar ${a.positions?.name ?? a.position_slug}`,
      desc: `Stage: ${STAGE_LABEL[a.pipeline_stage] ?? a.pipeline_stage}${a.score ? ` · Fit ${a.score}%` : ""}`,
      tone: STAGE_TONE[a.pipeline_stage] ?? "info",
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
            <Link
              href={`/admin/job-orders?candidate=${cand.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-bold text-white no-underline"
              style={{ background: "var(--pg-red-600)" }}
            >
              <Icon name="plus" size={13} stroke={2.4} />
              Pull ke Job Order
            </Link>
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
              style={{
                background: topTier === "A" ? "var(--pg-red-600)" : "var(--pg-ink-primary)",
              }}
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
            {topTier && (
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-[0.06em] uppercase"
                  style={{
                    background:
                      topTier === "A"
                        ? "var(--pg-red-soft-bg)"
                        : "var(--pg-ink-50)",
                    color:
                      topTier === "A"
                        ? "var(--pg-red-600)"
                        : "var(--pg-ink-tertiary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Tier {topTier}
                </span>
                {topTier === "A" && (
                  <span
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-[0.06em] uppercase"
                    style={{
                      background: "var(--pg-ink-primary)",
                      color: "white",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    Top talent
                  </span>
                )}
              </div>
            )}
            <div className="flex items-baseline gap-7 mt-3 pt-4 w-full justify-center" style={{ borderTop: "1px solid var(--pg-border)" }}>
              <BigStat value={String(applications.length)} label="Lamaran" />
              <BigStat
                value={`${avgFit}%`}
                label="Avg fit"
                color={avgFit >= 80 ? "var(--pg-ok-soft-fg)" : "var(--pg-ink-primary)"}
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
                      {!isOk && !isRejected && (
                        <Link
                          href={`/admin/documents`}
                          className="text-[11px] font-bold text-pg-red-600 no-underline shrink-0"
                        >
                          Lihat
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
                  <ApplicationCard key={a.id} application={a} />
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
