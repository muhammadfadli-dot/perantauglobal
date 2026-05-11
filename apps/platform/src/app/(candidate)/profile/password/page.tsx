import { redirect } from "next/navigation";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import SecurityCard from "../SecurityCard";

export const dynamic = "force-dynamic";

export default async function PasswordPage() {
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const { data: candidateData } = await supabase
    .from("candidates")
    .select("email")
    .eq("id", candidateId)
    .single();
  const candidate = candidateData as { email: string | null } | null;
  if (!candidate?.email) {
    // Should be unreachable for an authenticated candidate, but bounce safely.
    redirect("/profile");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <TopBarApp title="Password" back backHref="/profile" />

      <main className="flex-1 pb-8 px-5 pt-4">
        <p className="text-[13px] text-pg-ink-tertiary mb-4 leading-snug">
          Kami kirim link untuk ganti password lewat email. Aman dan gak perlu nginget password lama.
        </p>
        <div
          className="rounded-2xl px-4 py-4"
          style={{
            background: "var(--pg-white)",
            border: "1px solid var(--pg-border)",
            boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 4px 16px rgba(20,20,20,0.06)",
          }}
        >
          <SecurityCard email={candidate.email} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
