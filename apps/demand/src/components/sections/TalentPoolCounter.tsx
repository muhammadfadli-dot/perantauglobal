import { Reveal } from "@/components/Reveal";
import { Count } from "@/components/Count";

export function TalentPoolCounter() {
  return (
    <Reveal id="pool" style={{ background: "#EDE7D9", padding: "96px 0", scrollMarginTop: 74 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px", textAlign: "center" }}>
        <div className="anim ar" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 7, height: 7, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E" }}>TALENT POOL · LIVE, ROUNDED</span>
        </div>
        <h2 className="anim aw" style={{ margin: "0 auto 8px", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(26px,5vw,38px)", lineHeight: 1.1, color: "#20301F", maxWidth: 560, animationDelay: ".1s" }}>The talent is real. And ready.</h2>
        <div className="anim ar" style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "clamp(56px,11vw,150px)", lineHeight: 1, letterSpacing: "-.04em", color: "#20301F", margin: "12px 0 6px", animationDelay: ".2s" }}>
          <Count target={1300} suffix="+" />
        </div>
        <div className="anim ar" style={{ fontSize: 16, fontWeight: 600, color: "#4A5A32", animationDelay: ".3s" }}>Indonesian professionals in our active talent pool</div>
        <div className="anim ar g-pool" style={{ marginTop: 44, borderTop: "1px solid #DCD3BE", maxWidth: 900, marginLeft: "auto", marginRight: "auto", animationDelay: ".4s" }}>
          <div style={{ padding: "26px 20px" }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 34, fontWeight: 600, color: "#8A6D2E" }}><Count target={550} suffix="+" /></div><div style={{ fontSize: 12.5, color: "#6E6752", marginTop: 6 }}>Ready for Saudi &amp; GCC roles</div></div>
          <div style={{ padding: "26px 20px", borderLeft: "1px solid #DCD3BE" }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 34, fontWeight: 600, color: "#8A6D2E" }}><Count target={380} suffix="+" /></div><div style={{ fontSize: 12.5, color: "#6E6752", marginTop: 6 }}>In the Japan pipeline</div></div>
          <div style={{ padding: "26px 20px", borderLeft: "1px solid #DCD3BE" }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 34, fontWeight: 600, color: "#8A6D2E" }}>7</div><div style={{ fontSize: 12.5, color: "#6E6752", marginTop: 6 }}>Active placement markets</div></div>
        </div>
        <div className="anim ar" style={{ margin: "32px auto 0", maxWidth: 620, background: "#20301F", borderRadius: 10, padding: "16px 22px", display: "flex", gap: 12, alignItems: "center", textAlign: "left", animationDelay: ".5s" }}>
          <svg width="20" height="20" fill="none" stroke="#D8B978" strokeWidth="1.7" style={{ display: "block", flex: "none" }}><circle cx="10" cy="10" r="8" /><path d="m6.5 10.5 2.4 2.4 4.6-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "#B9C4A6" }}>Every inquiry is re-verified against your specific requirements before we present candidates. You see current availability, not a stale list.</p>
        </div>
      </div>
    </Reveal>
  );
}
