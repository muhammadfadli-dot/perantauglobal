import { Reveal } from "@/components/Reveal";
import { Count } from "@/components/Count";

const poolMetrics = [
  { value: 550, suffix: "+", label: "Ready for Saudi & GCC roles" },
  { value: 380, suffix: "+", label: "In the Japan pipeline" },
] as const;

export function TalentPoolCounter() {
  return (
    <Reveal id="pool" style={{ background: "#EDE7D9", padding: "96px 0", scrollMarginTop: 74 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px", textAlign: "center" }}>
        <div className="anim ar" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 7, height: 7, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E" }}>TALENT POOL</span>
        </div>
        <h2 className="anim aw" style={{ margin: "0 auto 8px", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(26px,5vw,38px)", lineHeight: 1.1, color: "#20301F", maxWidth: 620, animationDelay: ".1s" }}>An established Indonesian talent pool.</h2>
        <div className="anim ar" style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "clamp(56px,11vw,150px)", lineHeight: 1, letterSpacing: "-.04em", color: "#20301F", margin: "12px 0 6px", animationDelay: ".2s" }}>
          <Count target={1300} suffix="+" />
        </div>
        <div className="anim ar" style={{ fontSize: 16, fontWeight: 600, color: "#4A5A32", animationDelay: ".3s" }}>Indonesian professionals in the stated talent pool</div>
        <div className="anim ar g-pool" style={{ gridTemplateColumns: "repeat(2, 1fr)", marginTop: 44, borderTop: "1px solid #DCD3BE", maxWidth: 900, marginLeft: "auto", marginRight: "auto", animationDelay: ".4s" }}>
          {poolMetrics.map((metric, index) => <div key={metric.label} style={{ padding: "26px 20px", borderLeft: index ? "1px solid #DCD3BE" : undefined }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 34, fontWeight: 600, color: "#8A6D2E" }}><Count target={metric.value} suffix={metric.suffix} /></div><div style={{ fontSize: 12.5, color: "#6E6752", marginTop: 6 }}>{metric.label}</div></div>)}
        </div>
        <p className="anim ar" style={{ margin: "34px auto 0", maxWidth: 680, fontSize: 13, lineHeight: 1.65, color: "#6E6752", animationDelay: ".5s" }}>Availability is confirmed against each employer requirement before a candidate is presented.</p>
      </div>
    </Reveal>
  );
}
