/**
 * One-off backfill: send the event thank-you email to registrants who signed up
 * for "Work. Travel. Repeat." BEFORE the auto thank-you email went live
 * (2026-06-18). Skips the 2 who registered after it was live (already emailed).
 *
 * The key never goes in this file. Run with the prod RESEND_API_KEY pulled
 * locally:
 *
 *   cd apps/web
 *   vercel env pull .env.backfill --environment=production
 *   node --env-file=.env.backfill ../../scripts/backfill-event-thankyou-wtr.mjs
 *   rm .env.backfill
 *
 * Idempotency: re-running re-sends. Only run once.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error("RESEND_API_KEY not set. See header for how to run.");
  process.exit(1);
}

const FROM = "Perantau Global <noreply@perantauglobal.com>";
const SUBJECT = "Kamu terdaftar! Work. Travel. Repeat. : Dari Kampus ke Karier Global";

// Registered before the thank-you email was live. (Saras + Siti, who registered
// after ~11:45 WIB 2026-06-18, already got it automatically — excluded.)
const RECIPIENTS = [
  { name: "Nashya", email: "nashya.12024003398@student.atmajaya.ac.id" },
  { name: "Aldy", email: "aldyrinaldysmg@gmail.com" },
  { name: "Afril", email: "rdailyxx@gmail.com" },
  { name: "Farla", email: "farlakartina20@gmail.com" },
  { name: "Alwim", email: "alwimfaisal35@gmail.com" },
  { name: "Leo", email: "leof39345@gmail.com" },
  { name: "Bagus", email: "bagusnurr4@gmail.com" },
  { name: "Cinta", email: "cintakirana3011@gmail.com" },
  { name: "Rini", email: "semangat.belajar0311@gmail.com" },
  { name: "Asri", email: "asrisuratmi28@gmail.com" },
  { name: "Ardi", email: "ihiwajjh@gmail.com" },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const html = (name) => `<div style="margin:0;padding:0;background:#F5F3EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1A1A1A"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3EE;padding:32px 16px"><tr><td align="center"><table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden"><tr><td style="background:#D1283C;padding:24px 28px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#FFFFFF;width:36px;height:36px;border-radius:8px;text-align:center;vertical-align:middle;color:#D1283C;font-weight:800;font-size:18px">P</td><td style="padding-left:12px;color:#FFFFFF;font-weight:800;font-size:18px;letter-spacing:-0.02em">Perantau Global</td></tr></table></td></tr><tr><td style="height:4px;background:#1D4ED8"></td></tr><tr><td style="padding:36px 28px 8px 28px"><p style="margin:0 0 8px 0;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#1D4ED8">Pendaftaran berhasil</p><h1 style="margin:0 0 16px 0;font-size:26px;font-weight:800;letter-spacing:-0.02em;line-height:1.25;color:#1A1A1A">Sampai jumpa di acara, ${esc(name)}! 🎉</h1><p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#3A3A3A">Terima kasih sudah mendaftar di <strong>Work. Travel. Repeat. : Dari Kampus ke Karier Global</strong>. Tempat kamu sudah kami amankan.</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#F5F3EE;border-radius:12px"><tr><td style="padding:18px 20px"><p style="margin:0 0 10px 0;font-size:13px;line-height:1.5;color:#3A3A3A">📅 <strong>Selasa, 23 Juni 2026 · 10:00 WIB</strong></p><p style="margin:0 0 10px 0;font-size:13px;line-height:1.5;color:#3A3A3A">💻 Online via Zoom</p><p style="margin:0;font-size:13px;line-height:1.5;color:#3A3A3A">🎟️ Gratis — tanpa biaya, tanpa calo</p></td></tr></table><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;background:#FFF7E6;border:1px solid #F5D9A8;border-radius:12px"><tr><td style="padding:16px 20px"><p style="margin:0;font-size:14px;line-height:1.6;color:#7A4E00"><strong>Link Zoom-nya akan kami kirim H-1</strong> sebelum acara, ke email dan WhatsApp kamu. Pastikan nomor WhatsApp kamu aktif, ya.</p></td></tr></table><p style="margin:0 0 6px 0;font-size:14px;line-height:1.6;color:#3A3A3A">Yang kamu dapat di sesi ini:</p><p style="margin:0 0 24px 0;font-size:14px;line-height:1.8;color:#3A3A3A">📘 E-book "Paspor Gaji"<br/>🧭 Live "Cek Level Perantau"<br/>📜 E-Certificate kehadiran</p><p style="margin:0 0 4px 0;font-size:12px;line-height:1.5;color:#6B6B6B">Diselenggarakan oleh PT Daya Talenta Global (Perantau Global)</p><p style="margin:0;font-size:12px;line-height:1.5;color:#6B6B6B">Bersama Lembaga Vokasi Universitas Indonesia & LSP Universitas Indonesia</p></td></tr><tr><td style="padding:24px 28px;border-top:1px solid #EDEAE3"><p style="margin:0;font-size:12px;line-height:1.5;color:#9A9A9A">Email ini dikirim ke kamu karena mendaftar di acara Perantau Global. Butuh bantuan? Balas email ini atau hubungi <a href="https://perantauglobal.com/kontak" style="color:#D1283C;text-decoration:none">perantauglobal.com/kontak</a>.</p></td></tr></table><p style="margin:16px 0 0 0;font-size:11px;color:#9A9A9A">© Perantau Global · perantauglobal.com</p></td></tr></table></div>`;

const text = (name) =>
  `Halo ${name},\n\nTerima kasih sudah mendaftar di Work. Travel. Repeat. : Dari Kampus ke Karier Global. Tempat kamu sudah kami amankan.\n\nSelasa, 23 Juni 2026 - 10:00 WIB\nOnline via Zoom - Gratis\n\nLink Zoom-nya akan kami kirim H-1 sebelum acara, ke email dan WhatsApp kamu. Pastikan nomor WhatsApp kamu aktif.\n\nYang kamu dapat: E-book "Paspor Gaji", Live "Cek Level Perantau", E-Certificate.\n\nDiselenggarakan oleh PT Daya Talenta Global (Perantau Global) bersama Lembaga Vokasi UI & LSP UI.\n\n- Perantau Global - perantauglobal.com`;

let ok = 0,
  fail = 0;
for (const r of RECIPIENTS) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [r.email],
        subject: SUBJECT,
        html: html(r.name),
        text: text(r.name),
      }),
    });
    if (res.ok) {
      ok++;
      console.log(`✓ ${r.email}`);
    } else {
      fail++;
      console.error(`✗ ${r.email}: ${res.status} ${await res.text().catch(() => "")}`);
    }
  } catch (e) {
    fail++;
    console.error(`✗ ${r.email}: ${e}`);
  }
  await new Promise((res) => setTimeout(res, 600)); // stay under Resend rate limit
}
console.log(`\nDone. Sent ${ok}, failed ${fail}, of ${RECIPIENTS.length}.`);
