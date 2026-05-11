import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import IdentityForm from "./IdentityForm";

export const dynamic = "force-dynamic";

export default async function IdentitasPage() {
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const { data: candidateData } = await supabase
    .from("candidates")
    .select("full_name, email, phone, city, birth_date, gender, education")
    .eq("id", candidateId)
    .single();
  const candidate = candidateData as {
    full_name: string;
    email: string | null;
    phone: string | null;
    city: string | null;
    birth_date: string | null;
    gender: string | null;
    education: string | null;
  } | null;
  if (!candidate) throw new Error(`Candidate ${candidateId} disappeared`);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <TopBarApp title="Data diri" back backHref="/profile" />

      <main className="flex-1 pb-8 px-5 pt-4">
        <p className="text-[13px] text-pg-ink-tertiary mb-4 leading-snug">
          Data yang dipakai untuk semua lamaran. Pastikan sesuai dengan KTP & paspor.
        </p>
        <IdentityForm initial={candidate} />
      </main>

      <BottomNav />
    </div>
  );
}
