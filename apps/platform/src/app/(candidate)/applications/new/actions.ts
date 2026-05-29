"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

export type SubmitInput = {
  position_slug: string;
  job_order_id: string | null;
  answers: Record<string, unknown>;
  // PDP UU 27/2022: affirmative consent for this application. Must be true.
  agreed: boolean;
};

type SubmitResult =
  | { ok: true; applicationId: string }
  | { ok: false; error: string };

export async function submitApplication(
  input: SubmitInput,
): Promise<SubmitResult> {
  const { session, role } = await getSessionAndRole();
  if (!session) return { ok: false, error: "Kamu belum masuk. Silakan login dulu." };
  if (role === "admin") return { ok: false, error: "Admin tidak bisa melamar." };
  if (!input.agreed) {
    return {
      ok: false,
      error: "Centang dulu pernyataan persetujuan sebelum mengirim lamaran.",
    };
  }

  const supabase = await createServerClient();

  const { data: candData } = await supabase
    .from("candidates")
    .select("id")
    .eq("auth_user_id", session.userId)
    .single();
  const candidate = candData as { id: string } | null;
  if (!candidate) return { ok: false, error: "Profil kandidat belum tersedia." };

  // Block apply to an inactive position. A position with no active job_order
  // is still valid (talent-pool model) — only an inactive POSITION is blocked.
  const { data: position } = await supabase
    .from("positions")
    .select("slug, active")
    .eq("slug", input.position_slug)
    .single();
  const pos = position as { slug: string; active: boolean } | null;
  if (!pos || !pos.active) {
    return { ok: false, error: "Posisi ini sudah tidak menerima lamaran." };
  }

  // Idempotent — if already applied, treat as success.
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("candidate_id", candidate.id)
    .eq("position_slug", input.position_slug)
    .maybeSingle();
  if (existing) {
    return { ok: true, applicationId: (existing as { id: string }).id };
  }

  const { data: created, error } = await supabase
    .from("applications")
    .insert({
      candidate_id: candidate.id,
      position_slug: input.position_slug,
      job_order_id: input.job_order_id,
      pipeline_stage: "applied",
      answers: input.answers,
    } as never)
    .select("id")
    .single();

  if (error) {
    // Unique-violation race (uniq_candidate_position) — re-select & succeed.
    if (error.code === "23505") {
      const { data: raced } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_id", candidate.id)
        .eq("position_slug", input.position_slug)
        .single();
      const row = raced as { id: string } | null;
      if (row) return { ok: true, applicationId: row.id };
    }
    return { ok: false, error: error.message };
  }

  const row = created as { id: string } | null;
  if (!row) return { ok: false, error: "Gagal membuat lamaran." };

  // Log PDP consent for this application (purpose matches the web LP path).
  // Best-effort: the affirmative checkbox is the binding consent — don't fail the
  // apply if the audit-trail insert hiccups.
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  const { error: consentErr } = await supabase.from("consents").insert({
    candidate_id: candidate.id,
    purpose: "application_processing",
    purpose_text:
      "Memproses lamaran kerja (verifikasi data, komunikasi via email, pencocokan lowongan).",
    version: "2026-04-23",
    granted_at: new Date().toISOString(),
    ip_address: fwd ? fwd.split(",")[0].trim() : undefined,
    user_agent: h.get("user-agent") ?? undefined,
  } as never);
  if (consentErr) {
    console.warn("[submitApplication] consent log failed:", consentErr.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/applications");
  revalidatePath("/explore");
  return { ok: true, applicationId: row.id };
}
