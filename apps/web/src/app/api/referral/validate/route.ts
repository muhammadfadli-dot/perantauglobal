import { NextRequest } from "next/server";
import { supabaseV2, isV2Configured } from "@/lib/supabase-v2";

/**
 * Public, boolean-only referral-code check used by the apply form to show a
 * subtle "Kode dikenali" / "Kode nggak ketemu" hint as the candidate types.
 *
 * NON-authoritative + NON-blocking: this only powers a UI affirmation. The real
 * attribution happens server-side in the DB trigger (handle_new_auth_user →
 * _attribute_candidate_referral) reading pending_submissions.form_data.ref. A
 * bad/unknown code never blocks registration.
 *
 * Returns ONLY { valid: boolean } — never any agent identity — going through
 * the SECURITY DEFINER `validate_referral_code` RPC, so the referral_codes /
 * affiliate_agents tables (admin-only RLS) are never read directly and agents
 * can't be enumerated. Returns { valid: false } on missing/invalid input or any
 * error (fail-closed for the hint; submit is unaffected either way).
 */

// Mirror the DB CHECK: code = upper(code) AND code ~ '^[A-Z0-9-]{4,32}$'.
// Skip the RPC entirely for input that can't possibly be a real code.
const CODE_RE = /^[A-Z0-9-]{4,32}$/;

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("code");
  const code = (raw ?? "").trim().toUpperCase();

  if (!code || !CODE_RE.test(code) || !isV2Configured()) {
    return Response.json({ valid: false });
  }

  try {
    const { data, error } = await supabaseV2().rpc("validate_referral_code", {
      p_code: code,
    });
    if (error) {
      console.warn("[referral/validate] rpc failed:", error.message);
      return Response.json({ valid: false });
    }
    return Response.json({ valid: Boolean(data) });
  } catch (err) {
    console.warn(
      "[referral/validate] unexpected error:",
      err instanceof Error ? err.message : String(err),
    );
    return Response.json({ valid: false });
  }
}
