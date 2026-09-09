import Link from "next/link";
import { CorporateFooter } from "@/components/corporate/CorporateFooter";
import { CorporateNav } from "@/components/corporate/CorporateNav";
import { CorporateCtaBanner } from "@/components/corporate/CorporateCtaBanner";

const resources = [
  ["01", "DTG Company Profile", "A concise employer-facing introduction to DTG, its role in the Dayalima Group, market focus, and accountable workforce approach.", "Company profile", "Ready as a web preview"],
  ["02", "How DTG Works", "A clear engagement journey from qualified workforce need and job detail through selection support, mobilisation coordination, and aftercare.", "View the process", "Ready as a web preview"],
  ["03", "Employer Guides", "Market-specific guides for Saudi & GCC, Japan, and Bulgaria-led Europe. Regulatory and market claims will be added only after review.", "Explore the guides", "In content development"],
  ["04", "Illustrative Assessment & Readiness Report", "A future employer-facing sample using a fictional candidate profile, role-specific criteria, evidence status, strengths, gaps, and review notes.", "View report framework", "Awaiting assessment mapping"],
] as const;

export default function ResourcesPage() {
  return <main className="corp"><CorporateNav />
    <section className="corp-inner-hero"><p className="corp-kicker">EMPLOYER RESOURCES</p><h1>Make the next workforce conversation <em>more informed.</em></h1><p>Practical DTG materials for employers and authorised demand-side intermediaries. Public resources remain evidence-led and are updated as material is cleared for use.</p></section>
    <section className="corp-resource-grid">{resources.map(([number, title, copy, cta, status]) => <article key={title}><span>{number}</span><small>{status}</small><h2>{title}</h2><p>{copy}</p><Link href="/contact">{cta} <b>→</b></Link></article>)}</section><section className="corp-resource-note"><p className="corp-kicker">EVIDENCE STATUS</p><p>Public materials are intentionally limited to information DTG can substantiate. This hub does not publish live vacancies, candidate identities, placement volumes, or unverified market promises.</p></section><section className="corp-resource-guide"><div><p className="corp-kicker">HOW TO USE THIS HUB</p><h2>Start with the material that matches your <em>next decision.</em></h2></div><div className="corp-resource-guide-list"><article><b>01</b><div><h3>Still framing the need?</h3><p>Start with the company profile and How DTG Works overview before opening an employer conversation.</p></div></article><article><b>02</b><div><h3>Comparing a destination market?</h3><p>Use the market guides to prepare questions about sector fit, route, timing, and required evidence.</p></div></article><article><b>03</b><div><h3>Reviewing talent readiness?</h3><p>Request the illustrative assessment framework to understand what can be discussed once assessment mapping is approved.</p></div></article></div></section>
    <CorporateCtaBanner label="NEED A SPECIFIC BRIEF?" title="Start with your workforce requirement." description="Tell us the market, role, volume, and timing. DTG can then share the most relevant material through the appropriate employer conversation." />
    <CorporateFooter />
  </main>;
}




