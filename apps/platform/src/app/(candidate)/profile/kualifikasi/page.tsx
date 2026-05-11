import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import ProfileForm from "../ProfileForm";

export const dynamic = "force-dynamic";

export default async function KualifikasiPage() {
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const { data: candidateData } = await supabase
    .from("candidates")
    .select("id, profile_data")
    .eq("id", candidateId)
    .single();
  const candidate = candidateData as { id: string; profile_data: unknown } | null;
  if (!candidate) throw new Error(`Candidate ${candidateId} disappeared`);

  const profileData = (candidate.profile_data ?? {}) as Record<string, unknown>;
  const credentials = (profileData.credentials ?? {}) as Record<string, string>;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <TopBarApp title="Kualifikasi" back backHref="/profile" />

      <main className="flex-1 pb-8 px-5 pt-4">
        <p className="text-[13px] text-pg-ink-tertiary mb-4 leading-snug">
          Kualifikasi otomatis terisi saat kamu lamar posisi. Bisa di-update di sini kapan aja.
        </p>
        <ProfileForm initialCredentials={credentials} candidateId={candidate.id} />
      </main>

      <BottomNav />
    </div>
  );
}
