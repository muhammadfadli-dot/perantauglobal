import { CONTACT, CREDENTIALS, waLink } from "@/lib/site-config";

export function Footer() {
  return (
    <footer style={{ background: "#16220F", borderTop: "1px solid rgba(216,185,120,.22)", padding: "60px 0 0" }}>
      <div className="g-foot" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px 48px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 18 }}>
            <span style={{ position: "relative", width: 34, height: 34, display: "block", flex: "none" }}>
              <span style={{ position: "absolute", inset: 0, border: "1.5px solid #B28A48", transform: "rotate(45deg)", display: "block" }} />
              <span style={{ position: "absolute", inset: 11, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: ".09em", color: "#F3EEE1" }}>DAYA TALENTA GLOBAL</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: ".22em", color: "#8A9781" }}>PART OF DAYALIMA GROUP</span>
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: "#8A9781", maxWidth: 340, textWrap: "pretty" }}>Helping global healthcare, hospitality, and wellness businesses access skilled Indonesian talent. Legally, reliably, and with a written guarantee.</p>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: ".18em", color: "#B28A48", marginBottom: 18 }}>CREDENTIALS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 13, lineHeight: 1.5, color: "#B9C4A6" }}>
            <span>Saudi MOFA Approved Agent · Reg. {CREDENTIALS.mofaApprovalDisplay}</span>
            <span>Licensed P3MI · No. {CREDENTIALS.p3miLicenseNo}</span>
            <span>Part of Dayalima Group · 26+ years</span>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: ".18em", color: "#B28A48", marginBottom: 18 }}>CONTACT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 13, lineHeight: 1.5, color: "#B9C4A6" }}>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="link-gold-underline" style={{ color: "#B9C4A6", textDecoration: "none", borderBottom: "none" }}>WhatsApp Business · {CONTACT.whatsappDisplay}</a>
            <a href={`mailto:${CONTACT.email}`} className="link-gold-underline" style={{ color: "#B9C4A6", textDecoration: "none", borderBottom: "none" }}>{CONTACT.email}</a>
            <span>{CONTACT.office}</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(216,185,120,.16)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, color: "#8A9781" }}>© 2026 Daya Talenta Global. Part of Dayalima Group.</span>
          <span style={{ fontSize: 12.5, color: "#8A9781" }}>Looking for work abroad? Applications are handled at Perantau Global.</span>
        </div>
      </div>
    </footer>
  );
}
