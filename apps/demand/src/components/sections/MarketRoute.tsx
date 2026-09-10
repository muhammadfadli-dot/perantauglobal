import { Reveal } from "@/components/Reveal";

type Market = "europe" | "japan";

const ROUTES = {
  europe: {
    label: "EUROPE · EMPLOYER-FIRST MARKET CONVERSATION",
    title: "Clarify the need before you commit.",
    introduction:
      "A considered conversation starts with the role context, relevant experience, demonstrated readiness, and any gaps that need preparation.",
    principles: [
      ["Role and context", "We begin with the work to be done, the operating environment, and the capability your team needs."],
      ["Evidence before commitment", "Relevant experience and demonstrated readiness are made clearer before a hiring decision."],
      ["Market route", "Country-specific requirements and the documented route are confirmed with the appropriate parties. [NEED APPROVAL]"],
    ],
    poolTitle: "Availability is confirmed against your brief.",
    poolBody:
      "DTG does not publish unverified pool numbers for Europe. A role-led conversation determines whether sourcing, readiness review, and the route are relevant to your requirement.",
    steps: [
      ["Requirements review", "Agree the role, operating context, timeline, and the evidence needed to assess fit."],
      ["Focused sourcing", "Identify relevant talent against the agreed brief; availability is confirmed before presentation."],
      ["Readiness review", "Make experience, practical readiness, and remaining preparation gaps visible."],
      ["Documented route", "Confirm the applicable documentation and mobility coordination with the appropriate parties. [NEED APPROVAL]"],
      ["Aftercare plan", "Agree the support rhythm, owners, and escalation route before deployment. [NEED APPROVAL]"],
    ],
    evidenceTitle: "Evidence that supports a more informed decision.",
    evidence: [
      ["Relevant experience", "Role history and context are reviewed against the employer brief."],
      ["Demonstrated readiness", "The assessment format, criteria, and evidence owner are to be confirmed. [NEED APPROVAL]"],
      ["Route and support", "Documentation, mobility, and aftercare scope are confirmed for the specific requirement. [NEED APPROVAL]"],
    ],
    faqs: [
      ["Can DTG support a Europe workforce requirement?", "DTG first reviews the role, business context, and market relevance. Any support scope is agreed only after the applicable route and responsibilities are confirmed."],
      ["Do you have talent ready to present?", "Availability is not assumed or published as a standing number. DTG verifies relevance and readiness against your brief before presenting a profile."],
      ["Which documents are managed?", "Documentation requirements depend on the country, role, and route. The responsible parties and scope need to be confirmed for each engagement. [NEED APPROVAL]"],
      ["What does aftercare include?", "Aftercare is agreed with the employer before deployment, including duration, check-in rhythm, owners, and escalation path. [NEED APPROVAL]"],
    ],
  },
  japan: {
    label: "JAPAN · EMPLOYER-FIRST MARKET CONVERSATION",
    title: "Build operational confidence, role by role.",
    introduction:
      "A considered conversation starts with the role, the work environment, practical readiness, and the preparation needed for a sustainable workforce decision.",
    principles: [
      ["Role-specific brief", "We begin with the work to be done, shift pattern, operational context, and capability your team needs."],
      ["Readiness made visible", "Relevant experience, demonstrated readiness, and remaining preparation gaps are clarified before commitment."],
      ["Controlled coordination", "Country- and role-specific requirements are confirmed with the appropriate parties before the journey proceeds. [NEED APPROVAL]"],
    ],
    poolTitle: "A role-led conversation, not a pipeline claim.",
    poolBody:
      "DTG does not publish unverified Japan pipeline numbers. Sourcing relevance, readiness review, and the appropriate documented route are assessed against your actual requirement.",
    steps: [
      ["Operational brief", "Agree the role, workplace context, timeline, and the evidence required to assess suitability."],
      ["Focused sourcing", "Identify relevant talent against the agreed brief; availability is confirmed before presentation."],
      ["Readiness review", "Review relevant experience, practical readiness, and remaining preparation gaps."],
      ["Documented route", "Confirm the applicable documentation and mobility coordination with the appropriate parties. [NEED APPROVAL]"],
      ["Aftercare plan", "Agree the support rhythm, owners, and escalation route before deployment. [NEED APPROVAL]"],
    ],
    evidenceTitle: "Clarity for the work your team needs done.",
    evidence: [
      ["Relevant experience", "Role history and operating context are reviewed against the employer brief."],
      ["Practical readiness", "The assessment format, criteria, and evidence owner are to be confirmed. [NEED APPROVAL]"],
      ["Preparation gaps", "Language, workplace preparation, documentation, and any training gaps are made explicit where relevant. [NEED APPROVAL]"],
    ],
    faqs: [
      ["Can DTG support a Japan workforce requirement?", "DTG first reviews the role, operating context, and market relevance. Any support scope is agreed only after the applicable route and responsibilities are confirmed."],
      ["Do you have talent ready to present?", "Availability is not assumed or published as a standing number. DTG verifies relevance and readiness against your brief before presenting a profile."],
      ["How are language and workplace readiness assessed?", "The criteria, assessment format, and preparation requirements are agreed for the specific role. [NEED APPROVAL]"],
      ["What does aftercare include?", "Aftercare is agreed with the employer before deployment, including duration, check-in rhythm, owners, and escalation path. [NEED APPROVAL]"],
    ],
  },
} as const;

export function MarketRoute({ market }: { market: Market }) {
  const route = ROUTES[market];

  return (
    <>
      <Reveal id="why" style={{ background: "#F5F1E6", padding: "96px 0", scrollMarginTop: 74 }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px" }}>
          <div className="anim ar" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E" }}>{route.label}</span>
          </div>
          <div className="g-why">
            <div className="anim ar" style={{ background: "#20301F", borderRadius: 14, padding: "48px 46px", animationDelay: ".1s" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(30px,5.5vw,44px)", lineHeight: 1.06, color: "#F3EEE1", maxWidth: 470 }}>{route.title}</div>
              <p style={{ margin: "18px 0 0", fontSize: 15.5, lineHeight: 1.64, color: "#D6DDCE", maxWidth: 470 }}>{route.introduction}</p>
            </div>
            <div style={{ display: "grid", gridTemplateRows: "repeat(3, 1fr)", gap: 18 }}>
              {route.principles.map(([title, body], index) => (
                <article key={title} className="anim ar" style={{ background: "#FBF8F0", border: "1px solid #DCD3BE", borderRadius: 12, padding: "24px 28px", animationDelay: `${0.2 + index * 0.1}s` }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: 16.5, color: "#20301F" }}>{title}</h3>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6E6752" }}>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal id="pool" style={{ background: "#EDE7D9", padding: "82px 0", scrollMarginTop: 74 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 40px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E", marginBottom: 14 }}>AVAILABILITY &amp; READINESS</div>
          <h2 style={{ margin: "0 auto 14px", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(30px,5vw,42px)", lineHeight: 1.08, color: "#20301F" }}>{route.poolTitle}</h2>
          <p style={{ margin: "0 auto", maxWidth: 660, fontSize: 15.5, lineHeight: 1.65, color: "#6E6752" }}>{route.poolBody}</p>
          <span style={{ display: "inline-flex", marginTop: 20, padding: "6px 9px", border: "1px solid #A21F21", borderRadius: 4, color: "#A21F21", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".1em" }}>[NEED APPROVAL]</span>
        </div>
      </Reveal>

      <Reveal id="process" style={{ background: "#F5F1E6", padding: "96px 0", scrollMarginTop: 74 }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E", marginBottom: 14 }}>HOW THE CONVERSATION MOVES FORWARD</div>
          <h2 style={{ margin: "0 0 38px", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(30px,5vw,42px)", lineHeight: 1.08, color: "#20301F" }}>A controlled route, with the right decisions first.</h2>
          <div className="g-proc" style={{ background: "#FBF8F0", border: "1px solid #DCD3BE", borderRadius: 14, padding: "32px 24px" }}>
            {route.steps.map(([title, body], index) => (
              <article key={title} style={{ padding: "0 12px", textAlign: "center" }}>
                <span style={{ display: "inline-flex", width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "#20301F", color: "#F3EEE1", fontFamily: "var(--font-mono)", fontSize: 10, marginBottom: 13 }}>{`0${index + 1}`}</span>
                <h3 style={{ margin: "0 0 7px", fontSize: 14.5, color: "#20301F" }}>{title}</h3>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "#6E6752" }}>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal id="credentials" style={{ background: "#EDE7D9", padding: "96px 0", scrollMarginTop: 74 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ background: "#FBF8F0", border: "1px solid #DCD3BE", borderRadius: 16, padding: "48px 52px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E", marginBottom: 14 }}>DECISION EVIDENCE · [NEED APPROVAL]</div>
            <h2 style={{ margin: "0 0 32px", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(30px,5vw,42px)", lineHeight: 1.08, color: "#20301F" }}>{route.evidenceTitle}</h2>
            <div className="g-cred3">
              {route.evidence.map(([title, body], index) => (
                <article key={title} style={{ padding: index === 0 ? "0 28px 0 0" : "0 28px", borderLeft: index === 0 ? "none" : "1px solid #DCD3BE" }}>
                  <h3 style={{ margin: "0 0 10px", fontSize: 16, color: "#20301F" }}>{title}</h3>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#6E6752" }}>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <MarketFaq market={market} faqs={route.faqs} />
    </>
  );
}

function MarketFaq({ market, faqs }: { market: Market; faqs: readonly (readonly [string, string])[] }) {
  return (
    <Reveal id="faq" style={{ background: "#F5F1E6", padding: "96px 0", scrollMarginTop: 74 }}>
      <div className="g-faq" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E", marginBottom: 14 }}>MARKET QUESTIONS</div>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(28px,5vw,38px)", lineHeight: 1.1, color: "#20301F" }}>Straight answers before the next conversation.</h2>
          <p style={{ margin: "18px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "#6E6752" }}>Specific market commitments are confirmed with the appropriate parties for each requirement.</p>
        </div>
        <div>
          {faqs.map(([question, answer], index) => (
            <article key={question} style={{ borderTop: index === 0 ? "1px solid #20301F" : "1px solid #DCD3BE", padding: "20px 4px" }}>
              <h3 style={{ margin: "0 0 10px", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 20, color: "#20301F" }}>{question}</h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#4A4636" }}>{answer}</p>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
