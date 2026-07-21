"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { headers } from "next/headers";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import {
  APPLY_CONSENT_PURPOSE,
  APPLY_CONSENT_TEXT,
  APPLY_CONSENT_VERSION,
} from "@/lib/apply-consent";

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
  // Text + version come from lib/apply-consent.ts, the same module ApplyWizard
  // renders, so the ledger row reproduces verbatim what the candidate was shown.
  // Best-effort: the affirmative checkbox (re-checked above via input.agreed) is
  // the binding consent - don't fail the apply if the audit-trail insert hiccups.
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  const { error: consentErr } = await supabase.from("consents").insert({
    candidate_id: candidate.id,
    purpose: APPLY_CONSENT_PURPOSE,
    purpose_text: APPLY_CONSENT_TEXT,
    version: APPLY_CONSENT_VERSION,
    granted_at: new Date().toISOString(),
    ip_address: fwd ? fwd.split(",")[0].trim() : undefined,
    user_agent: h.get("user-agent") ?? undefined,
  } as never);
  if (consentErr) {
    console.warn("[submitApplication] consent log failed:", consentErr.message);
  }

  // Score CV-to-position fit for the new application (audit fix 2026-06-10).
  // Non-blocking; self-skips to 'skipped' if the candidate has no CV yet, and
  // auto-fits later when they upload one. grade-cv lets a candidate fit own app.
  const newId = (row as { id: string }).id;
  after(async () => {
    try {
      await supabase.functions.invoke("grade-cv", { body: { application_id: newId } });
    } catch {
      // best-effort
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/applications");
  revalidatePath("/explore");
  return { ok: true, applicationId: row.id };
}
