import Link from "next/link";
import { CONTACT, CREDENTIALS, waLink } from "@/lib/site-config";
import { LogoMark } from "@/components/LogoMark";

// Legal links live in the base bar rather than as a fourth column: two items
// would read thin next to the three-item Credentials and Contact stacks, and
// the base bar is where visitors (and a compliance reviewer) look for them.
const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
];

type FooterMarket = "gcc" | "europe" | "japan" | "global";

export function Footer({ market = "global" }: { market?: FooterMarket }) {
  const isGcc = market === "gcc";
  const isGlobal = market === "global";
  const description = isGcc
    ? "Helping Saudi and GCC employers discuss workforce needs across healthcare, hospitality, wellness, and manufacturing."
    : "We help international employers assess fit and readiness in Indonesian talent, then support a considered route from workforce need through aftercare.";
  const footerBackground = isGlobal ? "#252223" : "#16220F";
  const footerBorder = isGlobal ? "rgba(255,255,255,.14)" : "rgba(216,185,120,.22)";
  const accent = isGlobal ? "#D8B978" : "#B28A48";
  return (
    <footer style={{ background: footerBackground, borderTop: `1px solid ${footerBorder}`, padding: "60px 0 0" }}>
      <div className="g-foot" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px 48px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 18 }}>
            <LogoMark size={34} />
            <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: ".09em", color: "#F3EEE1" }}>DAYA TALENTA GLOBAL</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: ".22em", color: "#8A9781" }}>PART OF DAYALIMA GROUP</span>
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: "#8A9781", maxWidth: 340, textWrap: "pretty" }}>{description}</p>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: ".18em", color: accent, marginBottom: 18 }}>{isGcc ? "CREDENTIALS" : isGlobal ? "ABOUT DTG" : "MARKET STATUS"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 13, lineHeight: 1.5, color: "#B9C4A6" }}>
            {isGcc ? <><span>Saudi MOFA Approved Agent · Reg. {CREDENTIALS.mofaApprovalDisplay}</span><span>Licensed P3MI · No. {CREDENTIALS.p3miLicenseNo}</span><span>Protected for 6 months</span></> : isGlobal ? <><span>Licensed Indonesian P3MI</span><span>Part of Dayalima Group</span><span>Employer inquiry site</span></> : <><span>Employer-first market conversation</span><span>Requirements confirmed per engagement</span><span>Part of Dayalima Group</span></>}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: ".18em", color: accent, marginBottom: 18 }}>CONTACT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 13, lineHeight: 1.5, color: "#B9C4A6" }}>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="link-gold-underline" style={{ color: "#B9C4A6", textDecoration: "none", borderBottom: "none" }}>WhatsApp Business · {CONTACT.whatsappDisplay}</a>
            <span>{CONTACT.office}</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${isGlobal ? "rgba(255,255,255,.11)" : "rgba(216,185,120,.16)"}` }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, color: "#8A9781" }}>© 2026 Daya Talenta Global. Part of Dayalima Group.</span>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="link-gold-underline" style={{ fontSize: 12.5, color: "#B9C4A6", textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
          <span style={{ fontSize: 12.5, color: "#8A9781" }}>Looking for work abroad? Applications are handled at Perantau Global.</span>
        </div>
      </div>
    </footer>
  );
}
