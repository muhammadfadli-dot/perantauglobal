import Image from "next/image";
import { Count } from "@/components/Count";
import { CREDENTIALS } from "@/lib/site-config";

const COPY = {
  gcc: { eyebrow: "REGISTERED INDONESIAN TALENT PARTNER · SAUDI ARABIA & GCC", lines: ["Your registered gateway to", "screened Indonesian talent", "in the Gulf."], lede: "Approved by the Saudi authorities, licensed in Indonesia, and backed by Dayalima Group. We deliver screened, work-ready talent in about two months, with a 3-month written guarantee." },
  europe: { eyebrow: "REGISTERED INDONESIAN TALENT PARTNER · EUROPE", lines: ["A considered route to", "Indonesian talent", "for Europe."], lede: "A market-specific workforce conversation for European employers, starting with the role, readiness requirements, and the appropriate documented route." },
  japan: { eyebrow: "REGISTERED INDONESIAN TALENT PARTNER · JAPAN", lines: ["A considered route to", "Indonesian talent", "for Japan."], lede: "A role-specific workforce conversation for Japanese employers, starting with the requirement, practical readiness, and the appropriate documented route." },
} as const;

export function Hero({ market = "gcc" }: { market?: keyof typeof COPY }) {
  const copy = COPY[market];
  const heroImage = market === "europe" ? "/images/europe-hero.png" : market === "japan" ? "/images/japan-hero.png" : "/images/hero-arches.jpg";
  const heroAlt = market === "europe" ? "Indonesian professionals in a European city" : market === "japan" ? "Indonesian professionals in a contemporary Japanese city" : "";
  return (
    <header
      id="top"
      className="seen"
      data-screen-label="Hero"
      style={{ position: "relative", overflow: "hidden", background: "#182618" }}
    >
      {/* animated ground: golden-hour Gulf colonnade + legibility overlays */}
      <div
        className="anim af abg"
        style={{ position: "absolute", inset: 0, zIndex: 0, background: "#182618", transformOrigin: "center" }}
      >
        {/* Two crops, not one. The landscape frame holds three arches and three
            professionals, one per sector; a phone viewport crops that composition
            away entirely, so mobile gets a portrait frame of its own. */}
        <Image
          className="hero-img-wide"
          src={heroImage}
          alt={heroAlt}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        {market === "gcc" && <Image className="hero-img-tall" src="/images/hero-arch-mobile.jpg" alt="" fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition: "center 55%" }} />}
        <div className="hero-scrim" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(16,27,16,.74) 0%,rgba(16,27,16,.5) 38%,rgba(16,27,16,.56) 72%,rgba(16,27,16,.9) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,rgba(216,185,120,.035) 0,rgba(216,185,120,.035) 1px,transparent 1px,transparent 26px),repeating-linear-gradient(-45deg,rgba(216,185,120,.035) 0,rgba(216,185,120,.035) 1px,transparent 1px,transparent 26px)" }} />
      </div>

      {/* content */}
      <div className="hero-in" style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "182px 40px 0", textAlign: "center" }}>
        <span className="as hero-dia" style={{ width: 60, height: 60, display: "inline-block", marginBottom: 28, position: "relative", animationDelay: ".05s" }}>
          <span style={{ position: "absolute", inset: 0, border: "1.6px solid #B28A48", transform: "rotate(45deg)", display: "block" }} />
          <span style={{ position: "absolute", inset: 15, border: "1.6px solid #D8B978", transform: "rotate(45deg)", display: "block" }} />
          <span style={{ position: "absolute", inset: 26, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
        </span>
        <div className="anim ar hero-eyebrow" style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: ".22em", color: "#E1C583", marginBottom: 26, animationDelay: ".12s" }}>
          {copy.eyebrow}
        </div>
        <h1 className="hero-h1" style={{ margin: "0 auto", maxWidth: 900, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(40px,4.8vw,66px)", lineHeight: 1.03, letterSpacing: "-.018em", color: "#F5F1E6", textShadow: "0 2px 30px rgba(10,18,10,.5)" }}>
          {/* Desktop breaks these by hand, one line per span. Mobile reflows them
              inline, so the spaces between spans have to be real text nodes or
              the words run together. Between block elements they collapse. */}
          <span className="anim aw" style={{ display: "block", animationDelay: ".22s" }}>{copy.lines[0]}</span>{" "}
          <span className="anim aw" style={{ display: "block", animationDelay: ".36s" }}>{copy.lines[1]}</span>{" "}
          <span className="anim aw" style={{ display: "block", fontStyle: "italic", fontWeight: 400, color: "#E1C583", animationDelay: ".5s" }}>{copy.lines[2]}</span>
        </h1>
        <p className="anim af hero-lede" style={{ margin: "26px auto 36px", fontSize: 17, lineHeight: 1.62, color: "#E4E0CC", maxWidth: 610, animationDelay: ".66s", textWrap: "pretty", textShadow: "0 1px 16px rgba(10,18,10,.5)" }}>
          {copy.lede}
        </p>
        <div className="anim ar hero-cta" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", animationDelay: ".76s" }}>
          <a href="#contact" className="btn-terra" style={{ background: "#A8452F", color: "#F3EEE1", textDecoration: "none", fontSize: 15.5, fontWeight: 700, padding: "16px 34px", borderRadius: 8, boxShadow: "0 14px 34px rgba(168,69,47,.44)", transition: "background .15s, transform .15s" }}>
            Discuss Your Workforce Needs
          </a>
          <a href="#pool" className="btn-ghost" style={{ color: "#F5F1E6", textDecoration: "none", fontSize: 15.5, fontWeight: 600, padding: "15px 32px", borderRadius: 8, border: "1px solid rgba(216,185,120,.6)", background: "rgba(16,27,16,.28)", transition: "background .15s, border-color .15s" }}>
            See Our Talent Pool
          </a>
        </div>
        <svg className="anim adraw hero-rule" width="1" height="46" style={{ display: "block", margin: "44px auto 0", overflow: "visible" }}>
          <line x1="0.5" y1="0" x2="0.5" y2="46" stroke="#B28A48" strokeWidth="1.4" strokeDasharray="46" strokeDashoffset="46" />
        </svg>
      </div>

      {/* trust strip */}
      <div className="anim af hero-trust" style={{ position: "relative", zIndex: 10, marginTop: 38, borderTop: "1px solid rgba(216,185,120,.2)", background: "rgba(16,27,16,.66)", backdropFilter: "blur(3px)", animationDelay: ".95s" }}>
        <div className="g-trust" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ padding: "26px 30px", display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="26" height="26" fill="none" stroke="#B28A48" strokeWidth="1.5" style={{ display: "block", flex: "none" }}><path d="M13 3 21 6v5.4c0 5-3.6 8.6-8 10-4.4-1.4-8-5-8-10V6Z" /><path d="m9.4 12.6 2.6 2.6 4.8-5.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div><div style={{ fontSize: 13.5, fontWeight: 700, color: "#F3EEE1" }}>Saudi MOFA Approved</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".1em", color: "#9FAE8E", marginTop: 3 }}>REG. NO. {CREDENTIALS.mofaApprovalDisplay}</div></div>
          </div>
          <div style={{ padding: "26px 30px", display: "flex", alignItems: "center", gap: 14, borderLeft: "1px solid rgba(216,185,120,.14)" }}>
            <svg width="26" height="26" fill="none" stroke="#B28A48" strokeWidth="1.5" style={{ display: "block", flex: "none" }}><path d="M7 3.5h7.6L19 8v14.5H7Z" /><path d="M14.6 3.5v4.4H19" /><path d="M10 13h6M10 16.5h6" strokeLinecap="round" /></svg>
            <div><div style={{ fontSize: 13.5, fontWeight: 700, color: "#F3EEE1" }}>Licensed P3MI</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".1em", color: "#9FAE8E", marginTop: 3 }}>NO. {CREDENTIALS.p3miLicenseNo}</div></div>
          </div>
          <div style={{ padding: "26px 30px", display: "flex", alignItems: "center", gap: 14, borderLeft: "1px solid rgba(216,185,120,.14)" }}>
            <svg width="26" height="26" fill="none" stroke="#B28A48" strokeWidth="1.5" style={{ display: "block", flex: "none" }}><path d="M4 22h18" strokeLinecap="round" /><path d="M6 22V10.5h5.5V22" /><path d="M14.5 22V5.5H20V22" /></svg>
            <div><div style={{ fontSize: 13.5, fontWeight: 700, color: "#F3EEE1" }}>Dayalima Group</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".1em", color: "#9FAE8E", marginTop: 3 }}>26+ YEARS IN HUMAN CAPITAL</div></div>
          </div>
          <div style={{ padding: "26px 30px", display: "flex", alignItems: "center", gap: 14, borderLeft: "1px solid rgba(216,185,120,.14)" }}>
            <svg width="26" height="26" fill="none" stroke="#B28A48" strokeWidth="1.5" style={{ display: "block", flex: "none" }}><circle cx="13" cy="13" r="9.5" /><path d="M3.5 13h19" /><ellipse cx="13" cy="13" rx="4.2" ry="9.5" /></svg>
            <div><div style={{ fontSize: 13.5, fontWeight: 700, color: "#F3EEE1" }}><Count target={1300} suffix="+" /> in the pool</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".1em", color: "#9FAE8E", marginTop: 3 }}>3-MONTH WRITTEN GUARANTEE</div></div>
          </div>
        </div>
      </div>
    </header>
  );
}
