import { Reveal } from "@/components/Reveal";

const REASONS = [
  {
    title: "Legal and compliant",
    body: "Approved by Saudi MOFA and licensed as a P3MI. Contract to visa, the full legal route.",
    icon: (
      <svg width="30" height="30" fill="none" stroke="#4A5A32" strokeWidth="1.5" style={{ flex: "none" }}>
        <path d="M15 3 25 6.5v6.5c0 6-4.3 10.3-10 12-5.7-1.7-10-6-10-12V6.5Z" />
        <path d="m10.5 14.5 3 3 5.5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Screened and ready",
    body: "Skills, language, and readiness assessed before you see a profile. Shortlists, not raw CVs.",
    icon: (
      <svg width="30" height="30" fill="none" stroke="#4A5A32" strokeWidth="1.5" style={{ flex: "none" }}>
        <circle cx="11" cy="9.5" r="4.2" />
        <path d="M4 25c0-4.2 3.2-6.8 7.2-6.8s7.2 2.6 7.2 6.8" strokeLinecap="round" />
        <path d="m18.5 10.5 2.2 2.2 4.4-4.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Backed by Dayalima Group",
    body: "26+ years of Indonesian human capital consulting behind every engagement.",
    icon: (
      <svg width="30" height="30" fill="none" stroke="#4A5A32" strokeWidth="1.5" style={{ flex: "none" }}>
        <path d="M4 26h22" strokeLinecap="round" />
        <path d="M7 26V12h6.5v14" />
        <path d="M17 26V6h6.5v20" />
      </svg>
    ),
  },
];

export function ValueProps() {
  return (
    <Reveal id="why" style={{ background: "#F5F1E6", padding: "96px 0", scrollMarginTop: 74 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px" }}>
        <div className="anim ar" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
          <span style={{ width: 7, height: 7, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E" }}>WHY DAYA TALENTA GLOBAL</span>
        </div>
        <div className="g-why">
          <div className="anim ar" style={{ position: "relative", background: "#20301F", backgroundImage: "repeating-linear-gradient(45deg,rgba(216,185,120,.05) 0,rgba(216,185,120,.05) 1px,transparent 1px,transparent 20px),repeating-linear-gradient(-45deg,rgba(216,185,120,.05) 0,rgba(216,185,120,.05) 1px,transparent 1px,transparent 20px)", borderRadius: 14, padding: "48px 46px", display: "flex", flexDirection: "column", justifyContent: "center", animationDelay: ".15s" }}>
            <span style={{ width: 48, height: 48, position: "relative", display: "block", marginBottom: 24 }}>
              <span style={{ position: "absolute", inset: 0, border: "1.6px solid #B28A48", transform: "rotate(45deg)", display: "block" }} />
              <span style={{ position: "absolute", inset: 13, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
            </span>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".18em", color: "#D8B978", marginBottom: 16 }}>THE REASON CLIENTS STAY</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(28px,5.5vw,40px)", lineHeight: 1.06, color: "#F3EEE1", marginBottom: 16 }}>Cross-border hiring, made simple and safe.</div>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.64, color: "#B9C4A6", maxWidth: 420, textWrap: "pretty" }}>Recruiting from abroad should not demand your attention. We run the entire legal route, from job order to arrival, and we put our name on the result with a written guarantee.</p>
          </div>
          <div style={{ display: "grid", gridTemplateRows: "repeat(3,1fr)", gap: 18 }}>
            {REASONS.map((r, i) => (
              <div key={r.title} className="anim ar" style={{ display: "flex", alignItems: "center", gap: 22, background: "#FBF8F0", border: "1px solid #DCD3BE", borderRadius: 12, padding: "26px 30px", animationDelay: `${0.3 + i * 0.1}s` }}>
                {r.icon}
                <div>
                  <div style={{ fontSize: 16.5, fontWeight: 700, color: "#20301F", marginBottom: 4 }}>{r.title}</div>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6E6752" }}>{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="anim ar" style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "#6E6752", animationDelay: ".6s" }}>
          <span style={{ width: 6, height: 6, background: "#B28A48", transform: "rotate(45deg)", display: "block", flex: "none" }} />
          From signed job order to arrival in about two months. <a href="#process" style={{ color: "#8A6D2E", fontWeight: 600 }}>See how the process works</a>
        </div>
      </div>
    </Reveal>
  );
}
