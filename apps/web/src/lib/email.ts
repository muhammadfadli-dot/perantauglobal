/**
 * Transactional email via Resend (HTTP API, zero-dep).
 *
 * RESEND_API_KEY is already provisioned (also used for Supabase Auth SMTP).
 * Sender domain perantauglobal.com is verified in Resend. These are NOT auth
 * emails — Supabase Auth handles those. This is for app-level transactional
 * mail like the event registration thank-you.
 *
 * Every send is best-effort: a mail failure must never break the user flow, so
 * callers should fire these inside waitUntil() and we swallow/log errors here.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Perantau Global <noreply@perantauglobal.com>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[email] RESEND_API_KEY missing — skipping send");
    return false;
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: opts.from ?? DEFAULT_FROM,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error("[email] resend failed:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] resend threw:", err);
    return false;
  }
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Thank-you email for event registration. NOT an auth email — a plain
 * confirmation. Branded to match the event LP (PG red + campus-blue accent),
 * states clearly that the Zoom link is sent H-1.
 */
export function buildEventThankYouEmail(args: {
  firstName: string;
  eventTitle: string;
  whenLabel: string; // e.g. "Senin, 23 Juni 2026 · 10:00 WIB"
  platform: string; // e.g. "Zoom"
  joinUrl?: string | null; // when set, the confirmation includes the join button directly
}): { subject: string; html: string } {
  const name = esc(args.firstName.split(" ")[0] || args.firstName);
  const title = esc(args.eventTitle);
  const when = esc(args.whenLabel);
  const platform = esc(args.platform);
  const joinUrl = args.joinUrl ? esc(args.joinUrl) : "";

  const subject = `Kamu terdaftar! ${args.eventTitle}`;

  // When the join link is already available (e.g. registrations close to the
  // event), give attendees the button straight away instead of promising it H-1.
  const joinBlock = joinUrl
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;background:#ECFDF3;border:1px solid #A6E9C5;border-radius:12px">
              <tr><td style="padding:18px 20px;text-align:center">
                <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#065F46"><strong>Link Zoom kamu sudah siap.</strong> Simpan email ini, ya — tinggal klik tombol di bawah pas acara mulai.</p>
                <a href="${joinUrl}" style="display:inline-block;background:#D1283C;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:13px 34px;border-radius:10px">Join ${platform} →</a>
              </td></tr>
            </table>`
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;background:#FFF7E6;border:1px solid #F5D9A8;border-radius:12px">
              <tr><td style="padding:16px 20px">
                <p style="margin:0;font-size:14px;line-height:1.6;color:#7A4E00"><strong>Link Zoom-nya akan kami kirim H-1</strong> sebelum acara, ke email dan WhatsApp kamu. Pastikan nomor WhatsApp kamu aktif, ya.</p>
              </td></tr>
            </table>`;

  const html = `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#F5F3EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1A1A1A">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3EE;padding:32px 16px">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden">
          <tr><td style="background:#D1283C;padding:24px 28px">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="background:#FFFFFF;width:36px;height:36px;border-radius:8px;text-align:center;vertical-align:middle;color:#D1283C;font-weight:800;font-size:18px">P</td>
              <td style="padding-left:12px;color:#FFFFFF;font-weight:800;font-size:18px;letter-spacing:-0.02em">Perantau Global</td>
            </tr></table>
          </td></tr>
          <tr><td style="height:4px;background:#1D4ED8"></td></tr>
          <tr><td style="padding:36px 28px 8px 28px">
            <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#1D4ED8">Pendaftaran berhasil</p>
            <h1 style="margin:0 0 16px 0;font-size:26px;font-weight:800;letter-spacing:-0.02em;line-height:1.25;color:#1A1A1A">Sampai jumpa di acara, ${name}! 🎉</h1>
            <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#3A3A3A">Terima kasih sudah mendaftar di <strong>${title}</strong>. Tempat kamu sudah kami amankan.</p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#F5F3EE;border-radius:12px">
              <tr><td style="padding:18px 20px">
                <p style="margin:0 0 10px 0;font-size:13px;line-height:1.5;color:#3A3A3A">📅 <strong>${when}</strong></p>
                <p style="margin:0 0 10px 0;font-size:13px;line-height:1.5;color:#3A3A3A">💻 Online via ${platform}</p>
                <p style="margin:0;font-size:13px;line-height:1.5;color:#3A3A3A">🎟️ Gratis — tanpa biaya, tanpa calo</p>
              </td></tr>
            </table>

            ${joinBlock}

            <p style="margin:0 0 6px 0;font-size:14px;line-height:1.6;color:#3A3A3A">Yang kamu dapat di sesi ini:</p>
            <p style="margin:0 0 24px 0;font-size:14px;line-height:1.8;color:#3A3A3A">📘 E-book "Paspor Gaji"<br/>🧭 Live "Cek Level Perantau"<br/>📜 E-Certificate kehadiran</p>

            <p style="margin:0 0 4px 0;font-size:12px;line-height:1.5;color:#6B6B6B">Diselenggarakan oleh PT Daya Talenta Global (Perantau Global)</p>
            <p style="margin:0;font-size:12px;line-height:1.5;color:#6B6B6B">Bersama Lembaga Vokasi Universitas Indonesia & LSP Universitas Indonesia</p>
          </td></tr>
          <tr><td style="padding:24px 28px;border-top:1px solid #EDEAE3">
            <p style="margin:0;font-size:12px;line-height:1.5;color:#9A9A9A">Email ini dikirim ke kamu karena mendaftar di acara Perantau Global. Butuh bantuan? Balas email ini atau hubungi <a href="https://perantauglobal.com/kontak" style="color:#D1283C;text-decoration:none">perantauglobal.com/kontak</a>.</p>
          </td></tr>
        </table>
        <p style="margin:16px 0 0 0;font-size:11px;color:#9A9A9A">© Perantau Global · perantauglobal.com</p>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, html };
}
