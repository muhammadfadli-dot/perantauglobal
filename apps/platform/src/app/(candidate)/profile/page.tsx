import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { BottomNav } from "@/components/pg/AppChrome";
import { Icon, type IconName } from "@/components/pg/Icon";
import SignOutButton from "@/components/SignOutButton";
import { formatMemberId, EDUCATION_LABEL } from "@/lib/candidate";
import {
  BerandaTopBar,
  SectionHead,
  ProfileRing,
} from "@/components/pg/candidate/BerandaShared";
import { getActiveAcademyResume } from "@/lib/academy-db";

export const dynamic = "force-dynamic";

type CandidateRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  birth_date: string | null;
  gender: string | null;
  education: string | null;
  created_at: string;
};

const REQUIRED_DOCS = ["ktp", "passport", "formal_photo", "cv"];

export default async function ProfilePage() {
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const [candRes, docsRes, appsRes, academyResume] = await Promise.all([
    supabase
      .from("candidates")
      .select(
        "id, full_name, email, phone, city, birth_date, gender, education, created_at",
      )
      .eq("id", candidateId)
      .single(),
    supabase
      .from("candidate_documents")
      .select("doc_type, verified, rejected_at, uploaded_at")
      .eq("candidate_id", candidateId)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("applications")
      .select("id, pipeline_stage")
      .eq("candidate_id", candidateId),
    getActiveAcademyResume(candidateId),
  ]);

  const candidate = candRes.data as CandidateRow | null;
  if (!candidate) throw new Error(`Candidate ${candidateId} disappeared`);

  const docsRows = (docsRes.data ?? []) as Array<{
    doc_type: string;
    verified: boolean;
    rejected_at: string | null;
  }>;
  const appsRows = (appsRes.data ?? []) as Array<{ id: string; pipeline_stage: string }>;

  // Identity completion
  const identityFields = [
    candidate.phone,
    candidate.city,
    candidate.birth_date,
    candidate.gender,
    candidate.education,
  ];
  const identityFilled = identityFields.filter(Boolean).length;
  const identityTotal = identityFields.length;
  const identityComplete = identityFilled === identityTotal;

  // Documents — 4-state per required type so an uploaded-but-pending doc is NOT
  // mislabeled "belum upload" (mirrors profile/dokumen + DocUploader semantics).
  const docsLatestByType = new Map<string, { verified: boolean; rejected: boolean }>();
  for (const d of docsRows) {
    const key = d.doc_type === "photo" ? "formal_photo" : d.doc_type;
    if (!docsLatestByType.has(key))
      docsLatestByType.set(key, { verified: d.verified, rejected: !!d.rejected_at });
  }
  const docsTotal = REQUIRED_DOCS.length;
  let docsVerified = 0;
  let docsPending = 0;
  let docsMissing = 0;
  let docsRejected = 0;
  for (const t of REQUIRED_DOCS) {
    const row = docsLatestByType.get(t);
    if (!row) docsMissing++;
    else if (row.rejected) docsRejected++;
    else if (row.verified) docsVerified++;
    else docsPending++;
  }
  // Caption priority: needs-action (rejected → missing) before pending before done.
  const docsCaption =
    docsVerified === docsTotal
      ? "Lengkap"
      : docsRejected > 0
        ? `${docsRejected} perlu diganti`
        : docsMissing > 0
          ? `${docsMissing} belum upload`
          : `${docsPending} sedang dicek`;
  const docsTone: "ok" | "warn" | "info" =
    docsVerified === docsTotal
      ? "ok"
      : docsRejected > 0 || docsMissing > 0
        ? "warn"
        : "info";

  // Applications
  const appsActive = appsRows.filter(
    (a) => !["rejected", "exit"].includes(a.pipeline_stage),
  ).length;

  // Overall completion (avg of identity + docs)
  const overallPct = Math.round(
    ((identityFilled / identityTotal) * 0.5 +
      (docsVerified / docsTotal) * 0.5) *
      100,
  );

  const memberId = formatMemberId(candidate.id, candidate.created_at);

  const subline = [
    candidate.city,
    candidate.education
      ? EDUCATION_LABEL[candidate.education] ?? candidate.education.toUpperCase()
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const initials =
    (candidate.full_name || "??")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "??";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <BerandaTopBar />
      <main className="flex-1 pb-8 pt-1">
        {/* Profile header with progress ring */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-3.5">
            <ProfileRing pct={overallPct} size={72}>
              <span
                className="grid place-items-center w-14 h-14 rounded-full text-white text-[18px] font-extrabold"
                style={{
                  background:
                    "linear-gradient(135deg, var(--pg-red-600) 0%, var(--pg-red-700) 100%)",
                  boxShadow:
                    "0 3px 10px rgba(215,38,47,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
              >
                {initials}
              </span>
            </ProfileRing>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span
                className="font-extrabold tracking-[-0.022em] leading-tight text-pg-ink-900 truncate"
                style={{ fontSize: 20 }}
              >
                {candidate.full_name}
              </span>
              {subline && (
                <span className="text-[12.5px] text-pg-ink-500 truncate">
                  {subline}
                </span>
              )}
              <span
                className="inline-flex items-center w-fit gap-1.5 mt-1 px-2 py-0.5 rounded font-mono text-[9.5px] font-bold uppercase tracking-[0.06em]"
                style={
                  overallPct >= 100
                    ? { background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }
                    : { background: "var(--pg-warn-bg)", color: "var(--pg-warn)" }
                }
              >
                {overallPct >= 100 ? (
                  <>
                    <Icon name="check" size={9} stroke={3} /> Lengkap
                  </>
                ) : (
                  <>{overallPct}% lengkap</>
                )}
              </span>
            </div>
          </div>

          {/* Member ID pill */}
          <div
            className="flex items-center gap-2 mt-3.5 px-3 py-2 rounded-[10px] font-mono text-[10.5px] font-bold uppercase tracking-[0.06em]"
            style={{
              background: "var(--pg-paper)",
              border: "1px solid var(--pg-ink-100)",
              color: "var(--pg-ink-500)",
            }}
          >
            ID Anggota
            <span
              className="tracking-[0.04em]"
              style={{ color: "var(--pg-ink-900)" }}
            >
              {memberId}
            </span>
          </div>
        </div>

        {/* Journey stats — 4 tiles */}
        <div className="px-5 pt-3">
          <SectionHead title="Perjalanan kamu" sub="Ringkasan progres" />
          <div className="grid grid-cols-2 gap-2.5">
            <StatTile
              icon="briefcase"
              tone="red"
              label="Lamaran aktif"
              value={String(appsActive)}
              caption={appsActive === 0 ? "Belum ada" : "Sedang berjalan"}
            />
            <StatTile
              icon="passport"
              tone="amber"
              label="Akademi"
              value={academyResume ? `${academyResume.pct}%` : "—"}
              caption={
                academyResume
                  ? academyResume.courseDone
                    ? "Kelas selesai"
                    : "Sedang belajar"
                  : "Belum mulai"
              }
            />
            <StatTile
              icon="check"
              tone="ok"
              label="Dokumen"
              value={`${docsVerified}/${docsTotal}`}
              caption={docsCaption}
            />
            <StatTile
              icon="user"
              tone="info"
              label="Data diri"
              value={`${identityFilled}/${identityTotal}`}
              caption={identityComplete ? "Lengkap" : "Lengkapi profil"}
            />
          </div>
        </div>

        {/* Settings list */}
        <div className="px-5 pt-5">
          <SectionHead title="Akun" />
          <div
            className="rounded-[14px] overflow-hidden bg-pg-white"
            style={{
              border: "1px solid var(--pg-ink-100)",
              boxShadow:
                "0 1px 2px rgba(20,16,12,0.04), 0 4px 12px rgba(20,16,12,0.04)",
            }}
          >
            <SettingRow
              icon="user"
              label="Data diri"
              detail={identityComplete ? "Lengkap" : `${identityFilled} dari ${identityTotal}`}
              tone={identityComplete ? "ok" : "warn"}
              href="/profile/identitas"
            />
            <SettingRow
              icon="passport"
              label="Dokumen"
              detail={docsVerified === docsTotal ? "Lengkap" : docsCaption}
              tone={docsTone}
              href="/profile/dokumen"
            />
            <SettingRow
              icon="shield"
              label="Privasi & izin data"
              href="https://perantauglobal.com/id/privacy"
              external
            />
            {candidate.phone && (
              <SettingRow
                icon="phone"
                label="Nomor WhatsApp"
                detail={maskPhone(candidate.phone)}
                tone="ok"
              />
            )}
            <SettingRow
              icon="lock"
              label="Ubah password"
              href="/profile/password"
              last
            />
          </div>
        </div>

        {/* Sign out */}
        <div className="px-5 pt-5">
          <SignOutButton variant="ghost" />
        </div>

        <div
          className="text-center mt-4 px-5 font-mono text-[10.5px] tracking-[0.06em] text-pg-ink-400"
        >
          v2 · Portal Perantau Global
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function StatTile({
  icon,
  tone,
  label,
  value,
  caption,
}: {
  icon: IconName;
  tone: "red" | "amber" | "ok" | "info";
  label: string;
  value: string;
  caption: string;
}) {
  const palette: Record<typeof tone, { bg: string; fg: string }> = {
    red: { bg: "var(--pg-red-50)", fg: "var(--pg-red-600)" },
    amber: { bg: "var(--pa-amber-100)", fg: "var(--pa-amber-700)" },
    ok: { bg: "var(--pg-ok-bg)", fg: "var(--pg-ok)" },
    info: { bg: "var(--pg-info-bg)", fg: "var(--pg-info)" },
  };
  return (
    <div
      className="p-3.5 rounded-[14px] bg-pg-white"
      style={{
        border: "1px solid var(--pg-ink-100)",
        boxShadow: "0 1px 2px rgba(20,16,12,0.04), 0 4px 12px rgba(20,16,12,0.04)",
      }}
    >
      <span
        className="inline-grid place-items-center w-8 h-8 rounded-[9px] mb-2.5"
        style={{ background: palette[tone].bg, color: palette[tone].fg }}
      >
        <Icon name={icon} size={16} stroke={2} />
      </span>
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-pg-ink-500">
        {label}
      </div>
      <div className="text-[20px] font-extrabold tracking-[-0.02em] mt-0.5 text-pg-ink-900">
        {value}
      </div>
      <div className="text-[11px] text-pg-ink-500 mt-0.5 leading-snug">
        {caption}
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  label,
  detail,
  tone,
  href,
  external,
  last,
}: {
  icon: IconName;
  label: string;
  detail?: string;
  tone?: "ok" | "warn" | "info";
  href?: string;
  external?: boolean;
  last?: boolean;
}) {
  const detailColor =
    tone === "ok"
      ? "var(--pg-ok)"
      : tone === "warn"
      ? "var(--pg-warn)"
      : tone === "info"
      ? "var(--pg-info)"
      : "var(--pg-ink-500)";

  const inner = (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{
        borderBottom: last ? "none" : "1px solid var(--pg-ink-100)",
      }}
    >
      <span
        className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
        style={{ background: "var(--pg-ink-50)", color: "var(--pg-ink-700)" }}
      >
        <Icon name={icon} size={16} stroke={2} />
      </span>
      <span className="flex-1 text-[13.5px] font-bold tracking-[-0.005em] text-pg-ink-900">
        {label}
      </span>
      {detail && (
        <span
          className="font-mono text-[10.5px] font-bold tracking-[0.04em]"
          style={{ color: detailColor }}
        >
          {detail}
        </span>
      )}
      {/* Chevron only when the row actually navigates — no dead affordance. */}
      {href && (
        <Icon name="chevron_right" size={15} className="text-pg-ink-400 shrink-0" />
      )}
    </div>
  );

  if (!href) return inner;
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="block no-underline text-pg-ink-900"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className="block no-underline text-pg-ink-900">
      {inner}
    </Link>
  );
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return phone;
  return `+${digits.slice(0, 2)} ${digits.slice(2, 5)}•••${digits.slice(-2)}`;
}
