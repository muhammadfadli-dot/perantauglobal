/**
 * BD lead notification via Resend (HTTP API, zero-dep), mirroring
 * apps/web/src/lib/email.ts.
 *
 * Feature-flagged on BOTH env vars being present:
 *   RESEND_API_KEY    — same Resend account the other apps use
 *   INQUIRY_NOTIFY_TO — the BD inbox that gets one email per stored lead
 * Neither is set in the `perantauglobal-demand` Vercel project yet, so this
 * ships dormant and activates by env alone, no redeploy logic needed. The row
 * in `employer_inquiries` is the source of truth either way; this email is a
 * read path, not the store.
 *
 * Sender stays on the verified perantauglobal.com domain because
 * dayatalentaglobal.com is not verified in Resend; verify it there before
 * switching DEFAULT_FROM.
 *
 * Best-effort by contract: a mail failure must never fail the inquiry insert.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Daya Talenta Global <noreply@perantauglobal.com>";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function sendInquiryNotification(args: {
  companyName: string;
  contactPerson: string;
  email: string;
  country: string;
  industry: string;
  workersNeeded: string;
  timeline: string;
  details: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_NOTIFY_TO;
  if (!key || !to) return false; // dormant until both env vars exist

  const row = (label: string, value: string) =>
    value.trim()
      ? `<tr><td style="padding:6px 14px 6px 0;color:#6E6752;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:6px 0;color:#20301F;font-size:14px">${esc(value)}</td></tr>`
      : "";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px">
    <p style="font-size:12px;letter-spacing:.14em;color:#B28A48;margin:0 0 6px">NEW EMPLOYER INQUIRY</p>
    <h2 style="font-size:20px;color:#20301F;margin:0 0 16px">${esc(args.companyName)} · ${esc(args.country)}</h2>
    <table style="border-collapse:collapse">
      ${row("Contact", `${args.contactPerson} (${args.email})`)}
      ${row("Sector", args.industry)}
      ${row("Hires", args.workersNeeded)}
      ${row("Timeline", args.timeline)}
    </table>
    <pre style="background:#F5F1E6;border:1px solid #DCD3BE;border-radius:8px;padding:14px;font-size:13px;line-height:1.6;color:#20301F;white-space:pre-wrap;margin:16px 0">${esc(args.details)}</pre>
    <p style="font-size:12px;color:#8A857A;margin:0">Stored in employer_inquiries (status: new). Reply goes to the contact email above.</p>
  </div>`;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      // The route awaits this call, so a hanging Resend must not hold the
      // inquiry response past the client's own 8s abort.
      signal: AbortSignal.timeout(5000),
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: DEFAULT_FROM,
        to: [to],
        reply_to: args.email,
        subject: `Inquiry: ${args.companyName} (${args.country}, ${args.industry})`,
        html,
      }),
    });
    if (!res.ok) {
      console.error(
        "[inquiry] resend failed:",
        res.status,
        await res.text().catch(() => ""),
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("[inquiry] resend threw:", err);
    return false;
  }
}
