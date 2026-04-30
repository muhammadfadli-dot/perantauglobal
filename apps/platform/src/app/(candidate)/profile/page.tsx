import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import SignOutButton from "@/components/SignOutButton";
import ProfileForm from "./ProfileForm";
import DocUploader, { type DocItem } from "./DocUploader";
import SecurityCard from "./SecurityCard";

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
};

const EDUCATION_LABEL: Record<string, string> = {
  sma: "SMA/SMK",
  d3: "D3 sederajat",
  s1: "S1 sederajat",
  s2: "S2 sederajat",
  smk: "SMK",
};

const GENDER_LABEL: Record<string, string> = {
  male: "Pria",
  female: "Wanita",
};

export default async function ProfilePage() {
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const [{ data: candidateData }, { data: docsData }, { data: readinessData }] = await Promise.all([
    supabase
      .from("candidates")
      .select("id, full_name, email, phone, city, birth_date, gender, education, profile_data")
      .eq("id", candidateId)
      .single(),
    supabase
      .from("candidate_documents")
      .select("doc_type, file_path, verified, rejected_at, rejected_reason, uploaded_at")
      .eq("candidate_id", candidateId)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("readiness_view")
      .select("position_slug, position_name, country, hard_pass")
      .eq("candidate_id", candidateId),
  ]);

  const candidate = candidateData as CandidateRow | null;
  if (!candidate) throw new Error(`Candidate ${candidateId} disappeared`);

  const docsRows = (docsData ?? []) as Array<{
    doc_type: string;
    file_path: string;
    verified: boolean;
    rejected_at: string | null;
    rejected_reason: string | null;
  }>;

  const REQUIRED_DOC_TYPES: DocItem["type"][] = ["ktp", "passport", "formal_photo", "cv"];
  const docItems: DocItem[] = REQUIRED_DOC_TYPES.map((t) => {
    const candidates =
      t === "formal_photo"
        ? docsRows.filter((d) => d.doc_type === "formal_photo" || d.doc_type === "photo")
        : docsRows.filter((d) => d.doc_type === t);
    const latest = candidates[0];
    if (!latest) return { type: t, status: "missing" };
    if (latest.verified) return { type: t, status: "verified", file_path: latest.file_path };
    if (latest.rejected_at)
      return {
        type: t,
        status: "rejected",
        file_path: latest.file_path,
        rejected_reason: latest.rejected_reason,
      };
    return { type: t, status: "pending", file_path: latest.file_path };
  });
  const verifiedDocs = docItems.filter((d) => d.status === "verified").length;

  const profileData = (candidate.profile_data ?? {}) as Record<string, unknown>;
  const credentials = (profileData.credentials ?? {}) as Record<string, string>;
  const credentialCount = Object.keys(credentials).length;

  // Calculate "buka N lowongan baru" — readiness items hard-passed
  const readiness = (readinessData ?? []) as Array<{
    position_slug: string | null;
    position_name: string | null;
    country: string | null;
    hard_pass: boolean | null;
  }>;
  const hardPassCount = readiness.filter((r) => r.hard_pass).length;
  const profileMissing = Math.max(0, 5 - credentialCount);

  const initials = candidate.full_name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "??";

  const dataDiri: { label: string; value: string; missing?: boolean }[] = [
    { label: "Email", value: candidate.email ?? "—" },
    { label: "Nomor HP", value: candidate.phone ?? "Belum diisi", missing: !candidate.phone },
    { label: "Kota", value: candidate.city ?? "Belum diisi", missing: !candidate.city },
    {
      label: "Tanggal lahir",
      value: candidate.birth_date
        ? new Date(candidate.birth_date).toLocaleDateString("id-ID")
        : "Belum diisi",
      missing: !candidate.birth_date,
    },
    {
      label: "Gender",
      value: candidate.gender ? (GENDER_LABEL[candidate.gender] ?? candidate.gender) : "Belum diisi",
      missing: !candidate.gender,
    },
    {
      label: "Pendidikan",
      value: candidate.education
        ? (EDUCATION_LABEL[candidate.education] ?? candidate.education.toUpperCase())
        : "Belum diisi",
      missing: !candidate.education,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <TopBarApp title="Profil" bell />

      <main className="flex-1 pb-6">
        {/* Header */}
        <section className="px-5 pt-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-[60px] h-[60px] rounded-full grid place-items-center text-white text-[20px] font-extrabold shrink-0"
              style={{ background: "var(--pg-red-600)" }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[20px] font-extrabold tracking-[-0.01em] truncate text-pg-ink-primary">
                {candidate.full_name}
              </div>
              <div className="text-[13px] text-pg-ink-tertiary truncate">
                {[candidate.city, candidate.education ? (EDUCATION_LABEL[candidate.education] ?? candidate.education.toUpperCase()) : null]
                  .filter(Boolean)
                  .join(" · ") || "Lengkapi data kamu"}
              </div>
            </div>
          </div>

          {/* Status banner — Paper style */}
          {profileMissing > 0 && (
            <div
              className="mt-4 px-4 py-3 rounded-xl flex items-center justify-between gap-3"
              style={{ background: "var(--pg-red-soft-bg)" }}
            >
              <div
                className="text-[12px] font-bold uppercase tracking-[0.04em]"
                style={{ color: "var(--pg-red-600)" }}
              >
                {hardPassCount > 0 ? `Buka ${hardPassCount} lowongan baru` : "Lengkapi profil"}
              </div>
              <div className="text-[12px] font-bold text-pg-red-700">
                Lengkapi {profileMissing} hal lagi
              </div>
            </div>
          )}
        </section>

        {/* Identitas saya */}
        <Section title="Identitas saya" hint="Wajib untuk semua lamaran.">
          <div
            className="bg-pg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            {dataDiri.map((row, i) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-4 py-3.5 gap-3"
                style={{
                  borderTop: i === 0 ? "none" : "1px solid var(--pg-border-soft)",
                }}
              >
                <span className="text-[13px] text-pg-ink-tertiary shrink-0">{row.label}</span>
                <span
                  className={`text-[13px] font-semibold text-right truncate ${
                    row.missing ? "italic" : ""
                  }`}
                  style={{ color: row.missing ? "var(--pg-ink-quaternary)" : "var(--pg-ink-primary)" }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Dokumen */}
        <Section
          title="Dokumen"
          hint="KTP wajib. Paspor, foto, & CV diminta saat tahap Cek Dokumen."
          rightHint={`${verifiedDocs} / ${docItems.length}`}
        >
          <DocUploader candidateId={candidate.id} initial={docItems} />
          <div
            className="mt-3 flex gap-2 items-start text-[12px] leading-tight"
            style={{ color: "var(--pg-ink-tertiary)" }}
          >
            <Icon name="info" size={13} className="shrink-0 mt-0.5" />
            <span>Format: JPG, PNG, HEIC, atau PDF. Maks 5MB. Pastikan foto jelas.</span>
          </div>
        </Section>

        {/* Kualifikasi & Sertifikat */}
        <Section
          title="Kualifikasi & sertifikat"
          hint="Tiap kualifikasi buka lebih banyak lowongan yang cocok."
        >
          <ProfileForm initialCredentials={credentials} candidateId={candidate.id} />
        </Section>

        {/* Pengaturan */}
        <Section title="Pengaturan" hint="Atur akun, notifikasi, & data kamu.">
          <div
            className="bg-pg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            {candidate.email && (
              <div className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--pg-border-soft)" }}>
                <SecurityCard email={candidate.email} />
              </div>
            )}
            <SettingRow icon="bell" label="Notifikasi" href="/profile" disabled />
            <SettingRow icon="shield" label="Privasi & data" href="/profile" disabled />
          </div>

          <div className="mt-3">
            <SignOutButton variant="ghost" />
          </div>
        </Section>
      </main>

      <BottomNav />
    </div>
  );
}

function Section({
  title,
  hint,
  rightHint,
  children,
}: {
  title: string;
  hint?: string;
  rightHint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 pt-6">
      <div className="flex justify-between items-baseline mb-1">
        <div
          className="text-[10px] font-semibold tracking-[0.12em] uppercase"
          style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
        >
          {title}
        </div>
        {rightHint && (
          <div
            className="text-[11px] font-semibold"
            style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
          >
            {rightHint}
          </div>
        )}
      </div>
      {hint && (
        <div className="text-[12px] text-pg-ink-tertiary mb-3 leading-tight">{hint}</div>
      )}
      {children}
    </section>
  );
}

function SettingRow({
  icon,
  label,
  href,
  disabled,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  href: string;
  disabled?: boolean;
}) {
  const inner = (
    <div
      className="flex items-center justify-between px-4 py-3.5 gap-3"
      style={{ borderTop: "1px solid var(--pg-border-soft)", opacity: disabled ? 0.55 : 1 }}
    >
      <div className="flex items-center gap-2.5">
        <Icon name={icon} size={16} className="text-pg-ink-tertiary" />
        <span className="text-[14px] font-semibold text-pg-ink-primary">{label}</span>
        {disabled && (
          <span
            className="text-[9px] font-bold tracking-[0.06em] uppercase px-1.5 py-0.5 rounded"
            style={{
              background: "var(--pg-ink-50)",
              color: "var(--pg-ink-tertiary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Soon
          </span>
        )}
      </div>
      <Icon name="chevron_right" size={16} className="text-pg-ink-quaternary" />
    </div>
  );
  if (disabled) return inner;
  return (
    <Link href={href} className="block no-underline text-pg-ink-primary">
      {inner}
    </Link>
  );
}
