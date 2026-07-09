import { Reveal } from "@/components/Reveal";
import { Count } from "@/components/Count";
import { CREDENTIALS } from "@/lib/site-config";

const REGISTRATIONS = [
  { label: "SAUDI MOFA APPROVED AGENT", value: `REG. ${CREDENTIALS.mofaApprovalDisplay}`, note: "Registered with the Saudi authorities" },
  { label: "LICENSED P3MI · INDONESIA", value: CREDENTIALS.p3miLicenseNo, note: "Authorized to place workers abroad" },
  { label: "PART OF DAYALIMA GROUP", value: "26+ YEARS", note: "Human capital consulting since 1999" },
];

export function Credentials() {
  return (
    <Reveal id="credentials" style={{ background: "#EDE7D9", padding: "96px 0", scrollMarginTop: 74 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ background: "#F3EEE1", border: "1px solid #DCD3BE", borderRadius: 16, padding: "56px 60px", boxShadow: "0 18px 50px rgba(32,48,31,.09)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 24 }}>
            <div>
              <div className="anim ar" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ width: 7, height: 7, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E" }}>CREDENTIALS &amp; TRACK RECORD</span>
              </div>
              <h2 className="anim aw" style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(28px,5.5vw,42px)", lineHeight: 1.08, letterSpacing: "-.01em", color: "#20301F", animationDelay: ".12s" }}>Proof, not promises.</h2>
            </div>
            <span className="aseal" style={{ width: 58, height: 58, position: "relative", display: "block", flex: "none", animationDelay: ".2s", marginTop: 6 }}>
              <span style={{ position: "absolute", inset: 0, border: "1.5px solid #B28A48", transform: "rotate(45deg)", display: "block" }} />
              <span style={{ position: "absolute", inset: 15, border: "1.5px solid #D8B978", transform: "rotate(45deg)", display: "block" }} />
              <span style={{ position: "absolute", inset: 24, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
            </span>
          </div>
          <div className="arule" style={{ height: 2, background: "#20301F", marginBottom: 2 }} />
          <div className="anim ar g-cred3" style={{ animationDelay: ".3s" }}>
            {REGISTRATIONS.map((r, i) => (
              <div key={r.label} style={{ padding: i === 0 ? "28px 32px 28px 0" : "28px 32px", borderLeft: i === 0 ? "none" : "1px solid #DCD3BE" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: ".14em", color: "#7E7458", marginBottom: 12 }}>{r.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 19, fontWeight: 600, color: "#20301F", letterSpacing: ".02em" }}>{r.value}</div>
                <div style={{ fontSize: 12.5, color: "#6E6752", marginTop: 8, lineHeight: 1.5 }}>{r.note}</div>
              </div>
            ))}
          </div>
          <div className="anim ar g-cred4" style={{ background: "#20301F", backgroundImage: "repeating-linear-gradient(45deg,rgba(216,185,120,.045) 0,rgba(216,185,120,.045) 1px,transparent 1px,transparent 22px),repeating-linear-gradient(-45deg,rgba(216,185,120,.045) 0,rgba(216,185,120,.045) 1px,transparent 1px,transparent 22px)", borderRadius: 12, padding: "30px 40px", margin: "6px 0 34px", animationDelay: ".42s" }}>
            <div style={{ textAlign: "center", borderRight: "1px solid rgba(216,185,120,.18)" }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 600, color: "#F3EEE1" }}><Count target={1300} suffix="+" /></div><div style={{ fontSize: 11.5, color: "#9FAE8E", marginTop: 6 }}>active talent pool</div></div>
            <div style={{ textAlign: "center", borderRight: "1px solid rgba(216,185,120,.18)" }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 600, color: "#F3EEE1" }}><Count target={550} suffix="+" /></div><div style={{ fontSize: 11.5, color: "#9FAE8E", marginTop: 6 }}>ready for Saudi &amp; GCC</div></div>
            <div style={{ textAlign: "center", borderRight: "1px solid rgba(216,185,120,.18)" }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 600, color: "#F3EEE1" }}>7</div><div style={{ fontSize: 11.5, color: "#9FAE8E", marginTop: 6 }}>active markets</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 600, color: "#D8B978" }}>3 mo</div><div style={{ fontSize: 11.5, color: "#9FAE8E", marginTop: 6 }}>written guarantee</div></div>
          </div>
          <div className="anim ar" style={{ animationDelay: ".54s" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#20301F", marginBottom: 8 }}>Trusted by employers across the Gulf</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#6E6752", maxWidth: 640 }}>A growing portfolio across healthcare, hospitality, and wellness. Client names and logos are shared during consultation, with their written permission.</p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
