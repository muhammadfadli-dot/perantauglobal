import { Reveal } from "@/components/Reveal";
import { Count } from "@/components/Count";
import { CREDENTIALS } from "@/lib/site-config";
import type { ReactNode } from "react";

type Market = "gcc" | "europe" | "japan";
type Registration = { label: string; value: string; note: string };
type Metric = { value: ReactNode; label: string; accent?: boolean };
type MarketContent = { title: string; registrations: Registration[]; metrics: Metric[]; summaryTitle: string; summary: string };

const REGISTRATIONS = [
  { label: "SAUDI MOFA APPROVED AGENT", value: `REG. ${CREDENTIALS.mofaApprovalDisplay}`, note: "Registered with the Saudi authorities" },
  { label: "LICENSED P3MI · INDONESIA", value: CREDENTIALS.p3miLicenseNo, note: "Authorized to place workers abroad" },
  { label: "PART OF DAYALIMA GROUP", value: "26+ YEARS", note: "Human capital consulting since 1999" },
];

const MARKET_CONTENT: Record<Market, MarketContent> = {
  gcc: {
    title: "Credentials that support confident hiring.",
    registrations: REGISTRATIONS,
    metrics: [
      { value: <Count target={1300} suffix="+" />, label: "active talent pool" },
      { value: <Count target={550} suffix="+" />, label: "ready for Saudi & GCC" },
      { value: "3 mo", label: "written guarantee", accent: true },
    ],
    summaryTitle: "Trusted by employers across the Gulf",
    summary: "Referenced organisations reflect established relationships across the Gulf market.",
  },
  europe: {
    title: "A clearer path for Europe workforce planning.",
    registrations: [
      { label: "BALKAN MARKET FOCUS", value: "EMPLOYER-LED", note: "Planning starts with the priority sector and destination" },
      { label: "ROLE & READINESS", value: "SCREENED", note: "Candidate fit is reviewed against the employer brief" },
      { label: "PART OF DAYALIMA GROUP", value: "26+ YEARS", note: "Human capital consulting since 1999" },
    ],
    metrics: [
      { value: "BRIEF", label: "sector and destination first" },
      { value: "READINESS", label: "fit before presentation" },
      { value: "ROUTE", label: "country-aware planning", accent: true },
    ],
    summaryTitle: "Clearer decisions before mobilisation",
    summary: "Each Europe workforce requirement is reviewed for role fit, candidate readiness, and the route relevant to the destination.",
  },
  japan: {
    title: "Preparation for Japan workforce requirements.",
    registrations: [
      { label: "JAPAN MARKET FOCUS", value: "ROLE-SPECIFIC", note: "Workforce planning begins with the role and workplace context" },
      { label: "LANGUAGE & SKILL", value: "ROLE-LED", note: "Readiness is reviewed against the employer requirement" },
      { label: "PART OF DAYALIMA GROUP", value: "26+ YEARS", note: "Human capital consulting since 1999" },
    ],
    metrics: [
      { value: "LANGUAGE", label: "workplace communication" },
      { value: "SKILL", label: "role preparation" },
      { value: "SUPPORT", label: "planned after placement", accent: true },
    ],
    summaryTitle: "Preparation before placement",
    summary: "Japan workforce requirements are assessed around role context, language and skill readiness, workplace preparation, and appropriate support.",
  },
};

export function Credentials({ market = "gcc" }: { market?: Market }) {
  const content = MARKET_CONTENT[market];
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
              <h2 className="anim aw" style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(28px,5.5vw,42px)", lineHeight: 1.08, letterSpacing: "-.01em", color: "#20301F", animationDelay: ".12s" }}>{content.title}</h2>
            </div>
            <span className="aseal" style={{ width: 58, height: 58, position: "relative", display: "block", flex: "none", animationDelay: ".2s", marginTop: 6 }}>
              <span style={{ position: "absolute", inset: 0, border: "1.5px solid #B28A48", transform: "rotate(45deg)", display: "block" }} />
              <span style={{ position: "absolute", inset: 15, border: "1.5px solid #D8B978", transform: "rotate(45deg)", display: "block" }} />
              <span style={{ position: "absolute", inset: 24, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
            </span>
          </div>
          <div className="arule" style={{ height: 2, background: "#20301F", marginBottom: 2 }} />
          <div className="anim ar g-cred3" style={{ animationDelay: ".3s" }}>
            {content.registrations.map((r, i) => (
              <div key={r.label} style={{ padding: i === 0 ? "28px 32px 28px 0" : "28px 32px", borderLeft: i === 0 ? "none" : "1px solid #DCD3BE" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: ".14em", color: "#7E7458", marginBottom: 12 }}>{r.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 19, fontWeight: 600, color: "#20301F", letterSpacing: ".02em" }}>{r.value}</div>
                <div style={{ fontSize: 12.5, color: "#6E6752", marginTop: 8, lineHeight: 1.5 }}>{r.note}</div>
              </div>
            ))}
          </div>
          <div className="anim ar g-cred4" style={{ gridTemplateColumns: "repeat(3, 1fr)", background: "#20301F", backgroundImage: "repeating-linear-gradient(45deg,rgba(216,185,120,.045) 0,rgba(216,185,120,.045) 1px,transparent 1px,transparent 22px),repeating-linear-gradient(-45deg,rgba(216,185,120,.045) 0,rgba(216,185,120,.045) 1px,transparent 1px,transparent 22px)", borderRadius: 12, padding: "30px 40px", margin: "6px 0 34px", animationDelay: ".42s" }}>
            {content.metrics.map((metric, index) => <div key={metric.label} style={{ textAlign: "center", borderRight: index === content.metrics.length - 1 ? undefined : "1px solid rgba(216,185,120,.18)" }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600, color: metric.accent ? "#D8B978" : "#F3EEE1" }}>{metric.value}</div><div style={{ fontSize: 11.5, color: "#9FAE8E", marginTop: 6 }}>{metric.label}</div></div>)}
          </div>
          <div className="anim ar" style={{ animationDelay: ".54s" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#20301F", marginBottom: 8 }}>{content.summaryTitle}</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#6E6752", maxWidth: 640 }}>{content.summary}</p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
