// xendit-webhook — receives Xendit Invoice callbacks and marks the matching
// academy enrollment paid. Service-role (bypasses RLS): the webhook has no
// Supabase user context, so this is the ONLY place that flips payment_status to
// 'paid', via the SECURITY DEFINER RPC mark_academy_enrollment_paid (0083).
//
// MUST be deployed with verify_jwt = false (Xendit sends no Supabase JWT) — see
// supabase/config.toml. Auth is instead the Xendit callback token in the
// `x-callback-token` header, compared against XENDIT_WEBHOOK_TOKEN.
//
// Invoice external_id format (set by createPaymentInvoiceAction): paspor:<enrollmentId>:<nonce>
// Idempotent: duplicate PAID/SETTLED callbacks keep the first paid_at.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_TOKEN = Deno.env.get("XENDIT_WEBHOOK_TOKEN") ?? "";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const svc = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  // Auth: Xendit callback token (set in Xendit dashboard → Webhooks).
  const token = req.headers.get("x-callback-token") ?? "";
  if (!WEBHOOK_TOKEN || token !== WEBHOOK_TOKEN) {
    return json({ error: "invalid callback token" }, 401);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "bad json" }, 400);
  }

  const status = String(payload.status ?? "").toUpperCase();
  const externalId = String(payload.external_id ?? "");

  // Only act on success events; ack everything else so Xendit stops retrying.
  if (status !== "PAID" && status !== "SETTLED") {
    return json({ ok: true, ignored: status || "no-status" }, 200);
  }

  const parts = externalId.split(":");
  if (parts[0] !== "paspor" || !parts[1]) {
    return json({ ok: true, ignored: "external_id", external_id: externalId }, 200);
  }
  const enrollmentId = parts[1];

  const amount =
    typeof payload.paid_amount === "number"
      ? payload.paid_amount
      : typeof payload.amount === "number"
        ? payload.amount
        : null;

  const { error } = await svc.rpc("mark_academy_enrollment_paid", {
    p_enrollment_id: enrollmentId,
    p_payment_ref: String(payload.id ?? ""),
    p_channel: payload.payment_channel ? String(payload.payment_channel) : null,
    p_amount: amount,
  });

  if (error) return json({ ok: false, error: error.message }, 500);
  return json({ ok: true, enrollment_id: enrollmentId }, 200);
});
