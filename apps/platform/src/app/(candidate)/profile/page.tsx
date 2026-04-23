import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
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

export default async function ProfilePage() {
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("candidates")
    .select("id, full_name, email, phone, city, birth_date, gender, education, profile_data")
    .eq("id", candidateId)
    .single();
  const candidate = data as CandidateRow | null;
  if (!candidate) throw new Error(`Candidate ${candidateId} disappeared between requireCandidate() and select`);

  const { data: docsData } = await supabase
    .from("candidate_documents")
    .select("doc_type, file_path, verified, rejected_at, rejected_reason, uploaded_at")
    .eq("candidate_id", candidate.id)
    .order("uploaded_at", { ascending: false });
  const docsRows = (docsData ?? []) as Array<{
    doc_type: string;
    file_path: string;
    verified: boolean;
    rejected_at: string | null;
    rejected_reason: string | null;
  }>;
  const REQUIRED_DOC_TYPES = ["ktp", "passport", "photo", "cv"] as const;
  const docItems: DocItem[] = REQUIRED_DOC_TYPES.map((t) => {
    const latest = docsRows.find((d) => d.doc_type === t);
    if (!latest) return { type: t, status: "missing" };
    if (latest.verified) return { type: t, status: "verified", file_path: latest.file_path };
    if (latest.rejected_at) return { type: t, status: "rejected", file_path: latest.file_path, rejected_reason: latest.rejected_reason };
    return { type: t, status: "pending", file_path: latest.file_path };
  });
  const verifiedCount = docItems.filter((d) => d.status === "verified").length;

  const profileData = (candidate.profile_data ?? {}) as Record<string, unknown>;
  const credentials = (profileData.credentials ?? {}) as Record<string, string>;
  const credentialCount = Object.keys(credentials).length;
  const profilePct = Math.min(100, Math.round((credentialCount / 5) * 100));

  const initials = candidate.full_name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  const dataDiri: { label: string; value: string }[] = [
    { label: "Email", value: candidate.email ?? "—" },
    { label: "Nomor HP", value: candidate.phone ?? "Belum diisi" },
    { label: "Kota", value: candidate.city ?? "Belum diisi" },
    { label: "Tanggal lahir", value: candidate.birth_date ?? "Belum diisi" },
    { label: "Gender", value: candidate.gender ?? "Belum diisi" },
    { label: "Pendidikan", value: candidate.education ?? "Belum diisi" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <TopBarApp title="Profil" back backHref="/dashboard" bell />
      <main className="flex-1 pb-6">
        <section className="px-5 pt-5">
          <div className="flex items-center gap-4">
            <div
              className="w-[68px] h-[68px] rounded-full grid place-items-center text-white text-2xl font-extrabold tracking-tight"
              style={{ background: "var(--pg-red-600)" }}
            >
              {initials || "PG"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-extrabold tracking-tight truncate">
                {candidate.full_name}
              </div>
              <div className="text-sm text-pg-ink-500 mt-0.5">
                {[candidate.city, candidate.education].filter(Boolean).join(" · ") ||
                  "Lengkapi data kamu di bawah"}
              </div>
            </div>
          </div>

          <div
            className="mt-4 px-4 py-3.5 rounded-xl border flex items-center gap-3"
            style={{
              background: "var(--pg-red-50)",
              borderColor: "var(--pg-red-100)",
            }}
          >
            <div className="flex-1">
              <div className="flex justify-between text-[13px] font-bold text-pg-red-800">
                <span>Profil {profilePct}% lengkap</span>
                <span>
                  {credentialCount} dari 5 kualifikasi
                </span>
              </div>
              <div className="h-1.5 bg-pg-red-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${profilePct}%`, background: "var(--pg-red-600)" }}
                />
              </div>
            </div>
          </div>
        </section>

        <Section title="Data diri">
          <div className="bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
            {dataDiri.map((row, i) => (
              <div
                key={row.label}
                className={`px-4 py-3.5 flex justify-between gap-3 ${
                  i ? "border-t border-pg-ink-100" : ""
                }`}
              >
                <div className="text-sm text-pg-ink-500 shrink-0">{row.label}</div>
                <div
                  className={`text-sm font-semibold text-right ${
                    row.value.startsWith("Belum") ? "text-pg-ink-400 italic font-medium" : ""
                  }`}
                >
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Dokumen"
          extra={
            <div className="text-sm text-pg-ink-500 font-semibold">
              {verifiedCount} / {docItems.length}
            </div>
          }
        >
          <DocUploader candidateId={candidate.id} initial={docItems} />
          <div className="mt-3 flex gap-2 items-start text-[12px] text-pg-ink-500 leading-relaxed">
            <Icon name="info" size={14} className="shrink-0 mt-0.5 text-pg-ink-400" />
            <span>
              Format: JPG, PNG, HEIC, atau PDF. Maksimal 5MB per file. Pastikan foto jelas dan
              tidak buram.
            </span>
          </div>
        </Section>

        <Section title="Kualifikasi">
          <ProfileForm initialCredentials={credentials} candidateId={candidate.id} />
        </Section>

        {candidate.email && (
          <Section title="Keamanan">
            <SecurityCard email={candidate.email} />
          </Section>
        )}

        <section className="px-5 pt-6">
          <a
            href="/auth/sign-out"
            className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-base font-semibold rounded-xl border-[1.5px] border-pg-ink-200 text-pg-ink-900 no-underline"
          >
            Keluar dari akun
          </a>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

function Section({
  title,
  extra,
  children,
}: {
  title: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 pt-6">
      <div className="flex justify-between items-center mb-2.5">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
          {title}
        </div>
        {extra}
      </div>
      {children}
    </section>
  );
}
