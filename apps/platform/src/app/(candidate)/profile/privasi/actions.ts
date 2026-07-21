"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";

/**
 * Withdraw a PDP consent (UU 27/2022 right to withdraw).
 *
 * Scope of the write, deliberately narrow: it stamps `consents.withdrawn_at`
 * and nothing else. No row is deleted, no document is removed, no application
 * is cancelled here. The ledger is evidence of what was agreed to and when -
 * mutating it beyond the withdrawal stamp would destroy that.
 *
 * Trust model: the action takes a PURPOSE, never a row id. `requireCandidate()`
 * resolves `candidates.id` from the session cookie (same gate the page itself
 * uses), and every statement below is pinned to that id, so a forged payload
 * can at most target rows the caller already owns. The DB is the second line:
 * `consents_candidate_withdraw_own` (migration 0001) scopes UPDATE to
 * `candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())`
 * in both USING and WITH CHECK.
 *
 * Purpose-level rather than row-level because the ledger holds one row per
 * grant event: a candidate with two applications has two identical
 * `application_processing` rows. "Withdraw row 2 of 3" is not a decision anyone
 * can meaningfully make, and a half-withdrawn purpose is not a state we could
 * defend to a regulator. Withdrawing a purpose withdraws every still-active row
 * under it.
 */

/** consents.purpose is free-text; every value ever written matches this. */
const PURPOSE_RE = /^[a-z0-9_]{1,64}$/;

export type WithdrawResult =
  | { ok: true; withdrawn: number }
  | { ok: false; error: string };

export async function withdrawConsent(purpose: string): Promise<WithdrawResult> {
  const target = typeof purpose === "string" ? purpose.trim() : "";
  if (!PURPOSE_RE.test(target)) {
    return { ok: false, error: "Jenis persetujuan tidak dikenali." };
  }

  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  // Re-verify ownership before writing. RLS would already refuse someone else's
  // rows, but doing it in app code keeps the guarantee visible at the call site
  // and lets us tell the candidate apart from a silent 0-row UPDATE.
  const { data: ownRows, error: readError } = await supabase
    .from("consents")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("purpose", target)
    .is("withdrawn_at", null);

  if (readError) {
    return { ok: false, error: "Gagal membaca catatan persetujuan kamu." };
  }

  const rows = (ownRows ?? []) as Array<{ id: string }>;
  if (rows.length === 0) {
    return {
      ok: false,
      error: "Persetujuan ini sudah ditarik atau gak ada di catatan kamu.",
    };
  }

  const { data: updated, error } = await supabase
    .from("consents")
    .update({ withdrawn_at: new Date().toISOString() } as never)
    .in(
      "id",
      rows.map((r) => r.id),
    )
    .eq("candidate_id", candidateId)
    // Idempotent: a row withdrawn by a concurrent request keeps its original
    // timestamp instead of being re-stamped by this one.
    .is("withdrawn_at", null)
    .select("id");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile/privasi");
  revalidatePath("/profile");
  return { ok: true, withdrawn: (updated ?? []).length };
}
