import "server-only";

/**
 * Xendit Invoice API client (server-only).
 *
 * Uses the hosted Invoice flow: we create an invoice, redirect the candidate to
 * `invoice_url`, and Xendit calls our `xendit-webhook` edge function when paid.
 * The secret key never reaches the browser. Auth = HTTP Basic with the secret
 * key as username + empty password (Xendit convention).
 *
 * Docs: https://docs.xendit.co (Create Invoice / v2/invoices).
 */

const XENDIT_BASE = "https://api.xendit.co";

function authHeader(): string {
  const key = process.env.XENDIT_SECRET_KEY;
  if (!key) throw new Error("xendit: XENDIT_SECRET_KEY missing");
  return "Basic " + Buffer.from(`${key}:`).toString("base64");
}

export interface CreateInvoiceParams {
  /** Unique per invoice. Encodes the enrollment: `paspor:<enrollmentId>:<nonce>`. */
  externalId: string;
  /** IDR, integer. */
  amount: number;
  description: string;
  payerEmail?: string;
  customerName?: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  /** Seconds the invoice stays payable. Default 24h. */
  invoiceDurationSec?: number;
}

export interface XenditInvoice {
  id: string;
  invoice_url: string;
  status: string;
  external_id: string;
  amount: number;
}

export async function createXenditInvoice(
  p: CreateInvoiceParams,
): Promise<XenditInvoice> {
  const res = await fetch(`${XENDIT_BASE}/v2/invoices`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: p.externalId,
      amount: p.amount,
      currency: "IDR",
      description: p.description,
      payer_email: p.payerEmail,
      customer: p.customerName ? { given_names: p.customerName } : undefined,
      success_redirect_url: p.successRedirectUrl,
      failure_redirect_url: p.failureRedirectUrl,
      invoice_duration: p.invoiceDurationSec ?? 86_400,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`xendit: create invoice failed ${res.status} ${body.slice(0, 300)}`);
  }
  return (await res.json()) as XenditInvoice;
}
