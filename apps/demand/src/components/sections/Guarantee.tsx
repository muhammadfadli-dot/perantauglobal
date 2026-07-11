import { Reveal } from "@/components/Reveal";

const PILLS = [
  "Written into every agreement",
  "Replacement managed by us",
  "Support through the period",
];

const CORNERS: Record<string, React.CSSProperties> = {
  tl: { top: 14, left: 14, borderTop: "2px solid #B28A48", borderLeft: "2px solid #B28A48" },
  tr: { top: 14, right: 14, borderTop: "2px solid #B28A48", borderRight: "2px solid #B28A48" },
  bl: { bottom: 14, left: 14, borderBottom: "2px solid #B28A48", borderLeft: "2px solid #B28A48" },
  br: { bottom: 14, right: 14, borderBottom: "2px solid #B28A48", borderRight: "2px solid #B28A48" },
};

export function Guarantee() {
  return (
    <Reveal
      id="guarantee"
      style={{
        background: "#20301F",
        backgroundImage:
          "radial-gradient(1000px 520px at 50% -18%,rgba(178,138,72,.17),transparent 60%),repeating-linear-gradient(45deg,rgba(216,185,120,.04) 0,rgba(216,185,120,.04) 1px,transparent 1px,transparent 26px),repeating-linear-gradient(-45deg,rgba(216,185,120,.04) 0,rgba(216,185,120,.04) 1px,transparent 1px,transparent 26px)",
        padding: "104px 0",
        scrollMarginTop: 74,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* soft seam from the paper section above: fade paper down into the dark so
          the color does not break hard between How It Works and the guarantee */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 150, background: "linear-gradient(180deg,#EDE7D9 0%,rgba(237,231,217,0) 100%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ position: "relative", border: "1px solid rgba(178,138,72,.55)", borderRadius: 14, padding: "64px 68px", textAlign: "center", background: "rgba(10,20,10,.28)" }}>
          {Object.entries(CORNERS).map(([k, s]) => (
            <span key={k} style={{ position: "absolute", width: 18, height: 18, ...s }} />
          ))}
          <span className="aseal" style={{ width: 72, height: 72, position: "relative", display: "inline-block", marginBottom: 28, animationDelay: ".1s" }}>
            <span style={{ position: "absolute", inset: 0, border: "1.6px solid #B28A48", transform: "rotate(45deg)", display: "block" }} />
            <span style={{ position: "absolute", inset: 16, border: "1.6px solid #D8B978", transform: "rotate(45deg)", display: "block" }} />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D8B978" strokeWidth="2.4" style={{ position: "absolute", left: 24, top: 24 }}>
              <path className="acheck" d="m3 12 5 5 11-12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="34" strokeDashoffset="34" />
            </svg>
          </span>
          <div className="anim ar" style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: ".2em", color: "#B28A48", marginBottom: 18, animationDelay: ".2s" }}>OUR GUARANTEE</div>
          <h2 style={{ margin: "0 0 24px", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(38px,4.6vw,56px)", lineHeight: 1.05, letterSpacing: "-.01em", color: "#F5F1E6" }}>
            <span className="anim aw" style={{ display: "inline-block", animationDelay: ".3s" }}>Three months.</span>{" "}
            <span className="anim aw" style={{ display: "inline-block", fontStyle: "italic", fontWeight: 400, color: "#E1C583", animationDelay: ".44s" }}>In writing.</span>
          </h2>
          <p className="anim ar" style={{ margin: "0 auto 38px", fontSize: 16.5, lineHeight: 1.7, color: "#B9C4A6", maxWidth: 600, animationDelay: ".56s", textWrap: "pretty" }}>If a placed candidate resigns or does not meet the agreed standard within the first three months, we replace them. That commitment is written into your placement agreement, not offered as a verbal promise.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", paddingTop: 32, borderTop: "1px solid rgba(216,185,120,.25)" }}>
            {PILLS.map((p, i) => (
              <span key={p} className="atick" style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(216,185,120,.08)", border: "1px solid rgba(216,185,120,.28)", borderRadius: 100, padding: "9px 18px", fontSize: 13, fontWeight: 600, color: "#E4E0CC", animationDelay: `${0.68 + i * 0.1}s` }}>
                <svg width="15" height="15" fill="none" stroke="#D8B978" strokeWidth="2"><path d="m3 8 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {p}
              </span>
            ))}
          </div>
          <div className="anim ar" style={{ marginTop: 34, animationDelay: ".98s" }}>
            <a href="#contact" className="link-gold-underline" style={{ color: "#E1C583", fontSize: 14.5, fontWeight: 700, textDecoration: "none", paddingBottom: 3 }}>Discuss the full terms with our team</a>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
