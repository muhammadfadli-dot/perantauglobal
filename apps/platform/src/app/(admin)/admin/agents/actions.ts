"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import { logAdminAction } from "@/lib/audit-log";
import type {
  AffiliateAgentStatus,
  ReferralCodeStatus,
} from "@perantauglobal/db";

/**
 * Affiliate / referral admin actions.
 *
 * Pattern (cloned from /admin/job-orders/actions.ts + /admin/actions.ts):
 *   - every action runs assertAdmin() first (role=admin gate)
 *   - PII / state-mutating actions call logAdminAction() BEFORE the write
 *   - user-facing actions return a discriminated union { ok, error }
 *   - revalidatePath() after every successful mutation
 *
 * RLS on all three affiliate tables is admin-only (migration 0067), so the
 * anon-keyed server client writes succeed only for an authenticated admin.
 */

type ActionResult = { ok: true } | { ok: false; error: string };

async function assertAdmin() {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") throw new Error("Unauthorized");
  return { userId: session.userId };
}

// ============================================================================
// Referral code generation
// ============================================================================

const CODE_RE = /^[A-Z0-9-]{4,32}$/;

/**
 * Derive a referral code from the agent's name. Takes the leading
 * alphanumeric characters of the name (uppercased, non-alnum stripped) as a
 * human-readable prefix, then appends a crypto-random suffix so codes are
 * unguessable and collision-resistant. Always satisfies ^[A-Z0-9-]{4,32}$.
 */
function buildReferralCode(name: string): string {
  // Leading alnum chars of the name, uppercased. Strip everything else.
  const prefix = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  // Crypto-random base32-ish suffix (no ambiguous chars not in the charset).
  const suffix = randomBytes(8)
    .toString("hex")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
  // Prefix may be empty (e.g. a name of only symbols) — guarantee min length.
  const base = prefix.length >= 2 ? `${prefix}-${suffix}` : suffix;
  let code = base.slice(0, 32);
  // Pad in the unlikely event the suffix alone fell under 4 chars.
  if (code.length < 4) code = `${code}${suffix}`.slice(0, 32);
  // Hard guarantee the result matches the DB CHECK (^[A-Z0-9-]{4,32}$) before
  // we ever hit the insert — fall back to a pure-hex code if construction drifts.
  if (!CODE_RE.test(code)) {
    code = randomBytes(8).toString("hex").toUpperCase().slice(0, 16);
  }
  return code;
}

/**
 * Insert a referral code for an agent, retrying once on a unique-violation
 * (Postgres code 23505) with a freshly randomized code. Returns the created
 * code id, or throws on a non-collision DB error.
 */
async function insertReferralCodeWithRetry(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  agentId: string,
  agentName: string,
): Promise<{ id: string; code: string }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const code = buildReferralCode(agentName);
    const { data, error } = await supabase
      .from("referral_codes")
      .insert({ agent_id: agentId, code, status: "active" } as never)
      .select("id, code")
      .single();
    if (!error && data) return data as { id: string; code: string };
    // 23505 = unique_violation. Retry once with a new random code.
    if (error?.code === "23505" && attempt === 0) continue;
    throw new Error(error?.message ?? "Gagal membuat kode referral");
  }
  throw new Error("Gagal membuat kode referral (kode bentrok berulang)");
}

// ============================================================================
// Agents
// ============================================================================

export type CreateAffiliateAgentInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  notes?: string | null;
  status?: AffiliateAgentStatus;
};

/**
 * Create an affiliate agent AND auto-generate its first referral code in the
 * same action (a code is the agent's only operational handle). On success,
 * redirects to the agent detail page. Returns { ok:false, error } for
 * user-facing validation/DB failures so the form can surface them inline.
 */
export async function createAffiliateAgent(
  input: CreateAffiliateAgentInput,
): Promise<ActionResult> {
  const { userId } = await assertAdmin();

  const name = input.name?.trim() ?? "";
  if (name.length < 2 || name.length > 200) {
    return { ok: false, error: "Nama agen wajib diisi (2–200 karakter)." };
  }
  const email = input.email?.trim().toLowerCase() || null;
  const phone = input.phone?.trim() || null;

  const supabase = await createServerClient();

  const { data: agent, error: agentErr } = await supabase
    .from("affiliate_agents")
    .insert({
      name,
      email,
      phone,
      city: input.city?.trim() || null,
      notes: input.notes?.trim() || null,
      status: input.status ?? "active",
      created_by: userId,
    } as never)
    .select("id, name")
    .single();

  if (agentErr || !agent) {
    if (agentErr?.code === "23505") {
      return { ok: false, error: "Email agen sudah terdaftar." };
    }
    return { ok: false, error: agentErr?.message ?? "Gagal membuat agen." };
  }

  const created = agent as { id: string; name: string };

  await logAdminAction("create_affiliate_agent", "affiliate_agent", created.id, {
    name: created.name,
  });

  // Auto-generate the agent's first referral code.
  try {
    const code = await insertReferralCodeWithRetry(supabase, created.id, created.name);
    await logAdminAction("generate_referral_code", "referral_code", code.id, {
      agent_id: created.id,
      code: code.code,
    });
  } catch (err) {
    // The agent exists; surface the code failure but don't roll back — admin
    // can retry from the detail page via GenerateCodeButton.
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Agen dibuat tapi kode referral gagal: ${err.message}`
          : "Agen dibuat tapi kode referral gagal dibuat.",
    };
  }

  revalidatePath("/admin/agents");
  redirect(`/admin/agents/${created.id}`);
}

export type UpdateAffiliateAgentInput = {
  name?: string;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  notes?: string | null;
  status?: AffiliateAgentStatus;
};

export async function updateAffiliateAgent(
  agentId: string,
  input: UpdateAffiliateAgentInput,
): Promise<ActionResult> {
  await assertAdmin();

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (name.length < 2 || name.length > 200) {
      return { ok: false, error: "Nama agen wajib diisi (2–200 karakter)." };
    }
    patch.name = name;
  }
  if (input.email !== undefined) patch.email = input.email?.trim().toLowerCase() || null;
  if (input.phone !== undefined) patch.phone = input.phone?.trim() || null;
  if (input.city !== undefined) patch.city = input.city?.trim() || null;
  if (input.notes !== undefined) patch.notes = input.notes?.trim() || null;
  if (input.status !== undefined) patch.status = input.status;

  if (Object.keys(patch).length === 0) return { ok: true };

  await logAdminAction("update_affiliate_agent", "affiliate_agent", agentId, {
    fields: Object.keys(patch).join(","),
  });

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("affiliate_agents")
    .update(patch as never)
    .eq("id", agentId);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Email agen sudah terdaftar." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/agents");
  revalidatePath(`/admin/agents/${agentId}`);
  return { ok: true };
}

// ============================================================================
// Referral codes
// ============================================================================

export async function generateReferralCode(agentId: string): Promise<ActionResult> {
  await assertAdmin();
  const supabase = await createServerClient();

  const { data: agent, error: agentErr } = await supabase
    .from("affiliate_agents")
    .select("id, name")
    .eq("id", agentId)
    .maybeSingle();
  if (agentErr) return { ok: false, error: agentErr.message };
  if (!agent) return { ok: false, error: "Agen tidak ditemukan." };

  try {
    const code = await insertReferralCodeWithRetry(
      supabase,
      agentId,
      (agent as { name: string }).name,
    );
    await logAdminAction("generate_referral_code", "referral_code", code.id, {
      agent_id: agentId,
      code: code.code,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Gagal membuat kode referral.",
    };
  }

  revalidatePath(`/admin/agents/${agentId}`);
  return { ok: true };
}

export async function setReferralCodeStatus(
  codeId: string,
  status: ReferralCodeStatus,
): Promise<ActionResult> {
  await assertAdmin();
  await logAdminAction("update_referral_code", "referral_code", codeId, { status });

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("referral_codes")
    .update({ status } as never)
    .eq("id", codeId)
    .select("agent_id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };

  const agentId = (data as { agent_id: string } | null)?.agent_id;
  if (agentId) revalidatePath(`/admin/agents/${agentId}`);
  return { ok: true };
}

// ============================================================================
// Commission ledger
// ============================================================================

async function revalidateAgentForEvent(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  eventId: string,
) {
  const { data } = await supabase
    .from("affiliate_commission_events")
    .select("agent_id")
    .eq("id", eventId)
    .maybeSingle();
  const agentId = (data as { agent_id: string } | null)?.agent_id;
  if (agentId) revalidatePath(`/admin/agents/${agentId}`);
  revalidatePath("/admin/agents");
}

export async function setCommissionAmount(
  eventId: string,
  amount: number | null,
): Promise<ActionResult> {
  await assertAdmin();

  if (amount != null) {
    if (!Number.isFinite(amount) || amount < 0) {
      return { ok: false, error: "Nominal harus angka ≥ 0." };
    }
    // NUMERIC(12,2) — guard against overflow client-side for a friendly error.
    if (amount > 9_999_999_999.99) {
      return { ok: false, error: "Nominal terlalu besar." };
    }
  }

  const supabase = await createServerClient();
  // Settled rows are immutable — don't let an amount edit mutate paid/void money.
  const { data: ev, error: evErr } = await supabase
    .from("affiliate_commission_events")
    .select("status")
    .eq("id", eventId)
    .maybeSingle();
  if (evErr) return { ok: false, error: evErr.message };
  if (!ev) return { ok: false, error: "Event komisi tidak ditemukan." };
  const status = (ev as { status: string }).status;
  if (status === "paid" || status === "void") {
    return { ok: false, error: "Event sudah final — nominal tidak bisa diubah." };
  }

  await logAdminAction("set_commission_amount", "commission_event", eventId, {
    amount: amount ?? null,
  });

  const { error } = await supabase
    .from("affiliate_commission_events")
    .update({ amount } as never)
    .eq("id", eventId);
  if (error) return { ok: false, error: error.message };

  await revalidateAgentForEvent(supabase, eventId);
  return { ok: true };
}

export async function approveCommissionEvent(eventId: string): Promise<ActionResult> {
  const { userId } = await assertAdmin();

  const supabase = await createServerClient();
  // Guard: can't approve an event with no amount set.
  const { data: ev, error: evErr } = await supabase
    .from("affiliate_commission_events")
    .select("amount, status")
    .eq("id", eventId)
    .maybeSingle();
  if (evErr) return { ok: false, error: evErr.message };
  if (!ev) return { ok: false, error: "Event komisi tidak ditemukan." };
  const event = ev as { amount: number | null; status: string };
  if (event.amount == null) {
    return { ok: false, error: "Isi nominal dulu sebelum approve." };
  }
  if (event.status === "paid") {
    return { ok: false, error: "Event sudah dibayar." };
  }
  if (event.status === "approved") {
    return { ok: true };
  }
  if (event.status === "void") {
    return { ok: false, error: "Event sudah di-void." };
  }

  await logAdminAction("approve_commission", "commission_event", eventId, {});

  const { error } = await supabase
    .from("affiliate_commission_events")
    .update({
      status: "approved",
      approved_by: userId,
      approved_at: new Date().toISOString(),
    } as never)
    .eq("id", eventId);
  if (error) return { ok: false, error: error.message };

  await revalidateAgentForEvent(supabase, eventId);
  return { ok: true };
}

export async function markCommissionPaid(eventId: string): Promise<ActionResult> {
  await assertAdmin();

  const supabase = await createServerClient();
  const { data: ev, error: evErr } = await supabase
    .from("affiliate_commission_events")
    .select("status, amount")
    .eq("id", eventId)
    .maybeSingle();
  if (evErr) return { ok: false, error: evErr.message };
  if (!ev) return { ok: false, error: "Event komisi tidak ditemukan." };
  const event = ev as { status: string; amount: number | null };
  if (event.status !== "approved") {
    return { ok: false, error: "Approve dulu sebelum tandai sudah dibayar." };
  }

  await logAdminAction("mark_commission_paid", "commission_event", eventId, {});

  const { error } = await supabase
    .from("affiliate_commission_events")
    .update({ status: "paid", paid_at: new Date().toISOString() } as never)
    .eq("id", eventId);
  if (error) return { ok: false, error: error.message };

  await revalidateAgentForEvent(supabase, eventId);
  return { ok: true };
}

export async function voidCommissionEvent(eventId: string): Promise<ActionResult> {
  await assertAdmin();

  const supabase = await createServerClient();
  // A paid event is settled money — voiding it would silently erase it from the
  // paid rollup. Guard server-side (the UI hiding the button is not enough).
  const { data: ev, error: evErr } = await supabase
    .from("affiliate_commission_events")
    .select("status")
    .eq("id", eventId)
    .maybeSingle();
  if (evErr) return { ok: false, error: evErr.message };
  if (!ev) return { ok: false, error: "Event komisi tidak ditemukan." };
  const status = (ev as { status: string }).status;
  if (status === "paid") {
    return { ok: false, error: "Event sudah dibayar — tidak bisa di-void." };
  }
  if (status === "void") return { ok: true };

  await logAdminAction("void_commission", "commission_event", eventId, {});

  const { error } = await supabase
    .from("affiliate_commission_events")
    .update({ status: "void" } as never)
    .eq("id", eventId);
  if (error) return { ok: false, error: error.message };

  await revalidateAgentForEvent(supabase, eventId);
  return { ok: true };
}
