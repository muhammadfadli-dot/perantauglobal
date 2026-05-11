import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import SignOutButton from "@/components/SignOutButton";
import { formatMemberId, EDUCATION_LABEL } from "@/lib/candidate";

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
  profile_data: unknown;
  created_at: string;
};

export default async function ProfilePage() {
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const [{ data: candidateData }, { data: docsData }] = await Promise.all([
    supabase
      .from("candidates")
      .select(
        "id, full_name, email, phone, city, birth_date, gender, education, profile_data, created_at",
      )
      .eq("id", candidateId)
      .single(),
    supabase
      .from("candidate_documents")
      .select("doc_type, verified, rejected_at, uploaded_at")
      .eq("candidate_id", candidateId)
      .order("uploaded_at", { ascending: false }),
  ]);

  const candidate = candidateData as CandidateRow | null;
  if (!candidate) throw new Error(`Candidate ${candidateId} disappeared`);

  const docsRows = (docsData ?? []) as Array<{
    doc_type: string;
    verified: boolean;
    rejected_at: string | null;
  }>;

  // Identity completion: 5 fields beyond email (which is locked to auth account)
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

  // Documents — count latest verified per required type
  const REQUIRED_DOCS = ["ktp", "passport", "formal_photo", "cv"];
  const docsLatestByType = new Map<string, { verified: boolean; rejected: boolean }>();
  for (const d of docsRows) {
    const key = d.doc_type === "photo" ? "formal_photo" : d.doc_type;
    if (!docsLatestByType.has(key)) {
      docsLatestByType.set(key, { verified: d.verified, rejected: !!d.rejected_at });
    }
  }
  const docsVerified = REQUIRED_DOCS.filter((t) => docsLatestByType.get(t)?.verified).length;
  const docsTotal = REQUIRED_DOCS.length;

  // Credentials count
  const profileData = (candidate.profile_data ?? {}) as Record<string, unknown>;
  const credentials = (profileData.credentials ?? {}) as Record<string, string>;
  const credentialsFilled = Object.values(credentials).filter(
    (v) => typeof v === "string" && v.trim() !== "",
  ).length;

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
    <div className="min-h-screen flex flex-col">
      <TopBarApp title="Profil" />

      <main className="flex-1 pb-6">
        {/* Header card — avatar + name + member ID */}
        <section
          className="px-5 pt-4 pb-5"
          style={{
            background: "linear-gradient(180deg, var(--pg-surface-subtle) 0%, transparent 100%)",
            borderBottom: "1px solid var(--pg-border)",
          }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-14 h-14 rounded-full grid place-items-center text-white text-[18px] font-extrabold shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--pg-red-600) 0%, var(--pg-red-700) 100%)",
                boxShadow:
                  "0 3px 10px rgba(215,38,47,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[19px] font-extrabold tracking-[-0.02em] leading-tight truncate">
                {candidate.full_name}
              </div>
              {subline && (
                <div className="text-[12px] text-pg-ink-tertiary mt-0.5 truncate">
                  {subline}
                </div>
              )}
            </div>
          </div>

          {/* Member ID pill */}
          <div className="mt-3 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono"
              style={{
                background: "var(--pg-white)",
                border: "1px solid var(--pg-border)",
                boxShadow: "0 1px 2px rgba(20,20,20,0.04)",
              }}
            >
              <Icon name="check" size={12} className="text-pg-red-600" />
              <span
                className="text-[11px] font-bold tracking-[0.08em] uppercase"
                style={{ color: "var(--pg-ink-tertiary)" }}
              >
                Anggota
              </span>
              <span
                className="text-[11px] font-extrabold tracking-[0.06em]"
                style={{ color: "var(--pg-ink-primary)" }}
              >
                {memberId}
              </span>
            </span>
          </div>
        </section>

        {/* Group: Data kamu */}
        <Group label="Data kamu">
          <ListRow
            href="/profile/identitas"
            iconBg="var(--pg-red-soft-bg)"
            iconColor="var(--pg-red-600)"
            iconSvg={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
              </svg>
            }
            label="Data diri"
            badge={
              identityComplete
                ? { text: "Lengkap", tone: "ok" }
                : { text: `${identityFilled}/${identityTotal}`, tone: "warn" }
            }
          />
          <ListRow
            href="/profile/dokumen"
            iconBg="var(--pg-amber-100)"
            iconColor="var(--pg-amber-700)"
            iconSvg={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            }
            label="Dokumen"
            badge={
              docsVerified === docsTotal
                ? { text: "Lengkap", tone: "ok" }
                : { text: `${docsVerified}/${docsTotal}`, tone: "warn" }
            }
          />
          <ListRow
            href="/profile/kualifikasi"
            iconBg="var(--pg-info-bg)"
            iconColor="var(--pg-info)"
            iconSvg={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L9 7l-5.5.8L7.5 12l-1 5.5L12 15l5.5 2.5-1-5.5 4-4.2L15 7z" />
              </svg>
            }
            label="Kualifikasi"
            badge={
              credentialsFilled > 0
                ? { text: `${credentialsFilled} terisi`, tone: "ok" }
                : { text: "Belum ada", tone: "mute" }
            }
            isLast
          />
        </Group>

        {/* Group: Akun */}
        <Group label="Akun">
          <ListRow
            href="/profile/password"
            iconBg="var(--pg-ink-50)"
            iconColor="var(--pg-ink-secondary)"
            iconSvg={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
            label="Password"
          />
          <ListRow
            iconBg="var(--pg-ink-50)"
            iconColor="var(--pg-ink-secondary)"
            iconSvg={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            }
            label="Notifikasi"
            badge={{ text: "Soon", tone: "mute" }}
            disabled
          />
          <ListRow
            iconBg="var(--pg-ink-50)"
            iconColor="var(--pg-ink-secondary)"
            iconSvg={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-12V5l-8-3-8 3v5c0 8 8 12 8 12z" />
              </svg>
            }
            label="Privasi & data"
            badge={{ text: "Soon", tone: "mute" }}
            disabled
            isLast
          />
        </Group>

        <section className="px-5 pt-4">
          <SignOutButton variant="ghost" />
        </section>

        <section className="px-5 pt-4 pb-2">
          <p className="text-[11px] text-pg-ink-quaternary text-center font-mono tracking-[0.06em]">
            v0.1 · Global Talent Hub
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 pt-5">
      <div
        className="text-[10px] font-bold tracking-[0.12em] uppercase font-mono mb-2 ml-1"
        style={{ color: "var(--pg-ink-tertiary)" }}
      >
        {label}
      </div>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--pg-white)",
          border: "1px solid var(--pg-border)",
          boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 4px 16px rgba(20,20,20,0.06)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function ListRow({
  href,
  iconBg,
  iconColor,
  iconSvg,
  label,
  badge,
  disabled,
  isLast,
}: {
  href?: string;
  iconBg: string;
  iconColor: string;
  iconSvg: React.ReactNode;
  label: string;
  badge?: { text: string; tone: "ok" | "warn" | "mute" };
  disabled?: boolean;
  isLast?: boolean;
}) {
  const badgeStyles =
    badge?.tone === "ok"
      ? { background: "var(--pg-ok-soft-bg)", color: "var(--pg-ok-soft-fg)" }
      : badge?.tone === "warn"
      ? { background: "var(--pg-warn-soft-bg)", color: "var(--pg-warn-soft-fg)" }
      : { background: "var(--pg-ink-50)", color: "var(--pg-ink-tertiary)" };

  const inner = (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--pg-border-soft)",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div
        className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
        style={{ background: iconBg, color: iconColor }}
      >
        <span style={{ width: 18, height: 18, display: "block" }}>
          {iconSvg}
        </span>
      </div>
      <span className="flex-1 text-[14px] font-bold text-pg-ink-primary">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <span
            className="text-[9px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded font-mono"
            style={badgeStyles}
          >
            {badge.text}
          </span>
        )}
        <Icon name="chevron_right" size={16} className="text-pg-ink-quaternary" />
      </div>
    </div>
  );

  if (disabled || !href) return inner;
  return (
    <Link href={href} className="block no-underline text-pg-ink-primary">
      {inner}
    </Link>
  );
}
