"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";

type Market = "europe" | "japan";

const ROUTES = {
  europe: {
    label: "EUROPE · BALKAN EMPLOYER CONVERSATIONS",
    title: "Make cross-border hiring easier to plan.",
    introduction:
      "Start with the priority sector, destination, and operational need. DTG then helps make candidate fit, readiness, and the next route clearer before a hiring decision.",
    principles: [
      ["Employer brief", "We begin with the role, sector, destination, operating context, and timeline your team needs."],
      ["Candidate readiness", "Relevant experience, practical capability, language readiness, and preparation gaps are reviewed against the brief."],
      ["Country-aware route", "Documentation and mobility requirements are considered by destination and confirmed with the appropriate parties. [NEED APPROVAL]"],
    ],
    poolTitle: "Start with the role, sector, and destination.",
    poolBody:
      "DTG does not publish standing pool numbers for Europe. A focused conversation determines whether sourcing, readiness review, and the appropriate route are relevant to your requirement.",
    steps: [
      ["Employer consultation", "Agree the role, sector, destination, timeline, and the evidence needed to assess fit."],
      ["Candidate selection", "Identify relevant talent against the agreed brief; availability is confirmed before presentation."],
      ["Readiness preparation", "Review experience, practical capability, language readiness, and any preparation gaps."],
      ["Documentation coordination", "Confirm the applicable country requirements and responsibilities with the appropriate parties. [NEED APPROVAL]"],
      ["Placement support", "Agree the support rhythm, owners, and escalation route before deployment. [NEED APPROVAL]"],
    ],
    faqs: [
      ["Can DTG support a Europe workforce requirement?", "DTG begins by reviewing the role, priority sector, destination, business context, and timeline. Support scope is agreed only after the applicable route and responsibilities are confirmed."],
      ["Do you have talent ready to present?", "Availability is not assumed or published as a standing number. DTG verifies relevance and readiness against your brief before presenting a profile."],
      ["Which sectors can be discussed?", "Europe conversations may cover hospitality, manufacturing, agriculture, logistics, construction, and healthcare, subject to the destination, role, and route. [NEED APPROVAL]"],
      ["Which documents are managed?", "Documentation requirements depend on the country, role, and route. The responsible parties and scope are confirmed for each engagement. [NEED APPROVAL]"],
      ["What does aftercare include?", "Aftercare is agreed with the employer before deployment, including duration, check-in rhythm, owners, and escalation path. [NEED APPROVAL]"],
    ],
  },
  japan: {
    label: "JAPAN · ROLE READINESS CONVERSATIONS",
    title: "Prepare talent for Japan workplace standards.",
    introduction:
      "A considered conversation starts with the role, workplace context, language and skill readiness, and the preparation needed before deployment.",
    principles: [
      ["Role-specific brief", "We begin with the work to be done, shift pattern, workplace context, and capability your team needs."],
      ["Language and skill readiness", "Language level, sector skills, workplace communication, and remaining preparation gaps are reviewed before commitment."],
      ["Japan route coordination", "The applicable route, including SSW where relevant, and the required documentation are confirmed with the appropriate parties. [NEED APPROVAL]"],
    ],
    poolTitle: "Readiness is assessed before a profile is presented.",
    poolBody:
      "DTG does not publish standing Japan pipeline numbers. Sourcing relevance, language and skill readiness, and the appropriate documented route are assessed against your actual requirement.",
    steps: [
      ["Operational brief", "Agree the role, workplace context, timeline, and the evidence required to assess suitability."],
      ["Focused sourcing", "Identify relevant talent against the agreed brief; availability is confirmed before presentation."],
      ["Language, skill, and culture preparation", "Review language ability, sector skills, workplace communication, and cultural preparation for the role."],
      ["Documented Japan route", "Confirm the applicable route, including SSW where relevant, documentation, and mobility coordination. [NEED APPROVAL]"],
      ["Arrival and ongoing support", "Agree the support rhythm, emergency contact route, owners, and escalation path before deployment. [NEED APPROVAL]"],
    ],
    faqs: [
      ["Can DTG support a Japan workforce requirement?", "DTG first reviews the role, operating context, and market relevance. Any support scope is agreed only after the applicable route and responsibilities are confirmed."],
      ["Do you have talent ready to present?", "Availability is not assumed or published as a standing number. DTG verifies relevance and readiness against your brief before presenting a profile."],
      ["How are language and workplace readiness assessed?", "For relevant roles, readiness may include formal Japanese language and sector-skill evidence, supported by role-specific communication and interview preparation. [NEED APPROVAL]"],
      ["What route is used for Japan placement?", "The appropriate route is confirmed for each role and may include the Specified Skilled Worker (SSW) pathway where relevant, alongside required documentation and partner coordination. [NEED APPROVAL]"],
      ["What does aftercare include?", "Aftercare is agreed with the employer before deployment and may include an emergency contact route, check-in rhythm, owners, and escalation path. [NEED APPROVAL]"],
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

      <MarketFaq market={market} faqs={route.faqs} />
    </>
  );
}

function MarketFaq({ market, faqs }: { market: Market; faqs: readonly (readonly [string, string])[] }) {
  const [open, setOpen] = useState(0);

  return (
    <Reveal id="faq" style={{ background: "#F5F1E6", padding: "96px 0", scrollMarginTop: 74 }}>
      <div className="g-faq" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E", marginBottom: 14 }}>MARKET QUESTIONS</div>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(28px,5vw,38px)", lineHeight: 1.1, color: "#20301F" }}>Straight answers before the next conversation.</h2>
          <p style={{ margin: "18px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "#6E6752" }}>Specific market commitments are confirmed with the appropriate parties for each requirement.</p>
        </div>
        <div>
          {faqs.map(([question, answer], index) => {
            const isOpen = open === index;
            return (
              <article key={question} style={{ borderTop: index === 0 ? "1px solid #20301F" : "1px solid #DCD3BE", borderBottom: index === faqs.length - 1 ? "1px solid #DCD3BE" : undefined, padding: index === 0 ? "22px 4px" : "20px 4px" }}>
                <button type="button" aria-expanded={isOpen} aria-controls={`market-faq-${market}-${index}`} onClick={() => setOpen(isOpen ? -1 : index)} style={{ all: "unset", boxSizing: "border-box", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, cursor: "pointer" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 20, color: "#20301F" }}>{question}</span>
                  <span aria-hidden style={{ width: 22, height: 22, border: `1px solid ${isOpen ? "#B28A48" : "#C9BD9E"}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: isOpen ? "#B28A48" : "#8A857A", fontSize: isOpen ? 14 : 15, flex: "none" }}>{isOpen ? "−" : "+"}</span>
                </button>
                <div id={`market-faq-${market}-${index}`} style={{ maxHeight: isOpen ? 240 : 0, overflow: "hidden", transition: "max-height .3s ease, opacity .3s ease, margin .3s ease", opacity: isOpen ? 1 : 0, marginTop: isOpen ? 12 : 0 }}>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#4A4636" }}>{answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}
