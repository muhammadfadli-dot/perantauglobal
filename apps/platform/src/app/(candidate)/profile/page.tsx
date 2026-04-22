import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

type CandidateRow = {
  id: string;
  full_name: string;
  email: string | null;
  profile_data: unknown;
};

export default async function ProfilePage() {
  const { session, role } = await getSessionAndRole();
  if (!session) redirect("/");
  if (role === "admin") redirect("/admin");

  const supabase = await createServerClient();
  const { data } = await supabase
    .from("candidates")
    .select("id, full_name, email, profile_data")
    .eq("auth_user_id", session.userId)
    .single();
  const candidate = data as CandidateRow | null;

  if (!candidate) redirect("/");

  const profileData = (candidate.profile_data ?? {}) as Record<string, unknown>;
  const credentials = (profileData.credentials ?? {}) as Record<string, string>;

  return (
    <main className="mx-auto max-w-[640px] px-6 py-10 pb-24">
      <a
        href="/dashboard"
        className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] opacity-60 hover:opacity-100"
      >
        ← Dashboard
      </a>

      <p className="mt-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] opacity-60">
        Profil Kualifikasi
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-[1.1]">
        {candidate.full_name}
      </h1>
      <p className="mt-2 text-sm opacity-70">
        Lengkapi kualifikasi kamu sekali — dipakai untuk semua lamaran. Makin
        lengkap, makin tinggi peluang lolos.
      </p>

      <ProfileForm initialCredentials={credentials} candidateId={candidate.id} />
    </main>
  );
}
