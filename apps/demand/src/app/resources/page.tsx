import Link from "next/link";
import { CorporateFooter } from "@/components/corporate/CorporateFooter";
import { CorporateNav } from "@/components/corporate/CorporateNav";

const resources = [
  ["01", "DTG Company Profile", "A concise employer-facing introduction to DTG, its role in the Dayalima Group, market focus, and accountable workforce approach.", "Company profile", "Ready as a web preview"],
  ["02", "How DTG Works", "A clear engagement journey from qualified workforce need and job detail through selection support, mobilisation coordination, and aftercare.", "View the process", "Ready as a web preview"],
  ["03", "Employer Guides", "Market-specific guides for Saudi & GCC, Japan, and Bulgaria-led Europe. Regulatory and market claims will be added only after review.", "Explore the guides", "In content development"],
  ["04", "Illustrative Assessment & Readiness Report", "A future employer-facing sample using a fictional candidate profile, role-specific criteria, evidence status, strengths, gaps, and review notes.", "View report framework", "Awaiting assessment mapping"],
] as const;

export default function ResourcesPage() {
  return <main className="corp"><CorporateNav />
    <section className="corp-inner-hero"><p className="corp-kicker">EMPLOYER RESOURCES</p><h1>Make the next workforce conversation <em>more informed.</em></h1><p>Practical DTG materials for employers and authorised demand-side intermediaries. Public resources remain evidence-led and are updated as material is cleared for use.</p></section>
    <section className="corp-resource-grid">{resources.map(([number, title, copy, cta, status]) => <article key={title}><span>{number}</span><small>{status}</small><h2>{title}</h2><p>{copy}</p><Link href="/contact">{cta} <b>→</b></Link></article>)}</section>
    <section className="corp-callout"><p className="corp-kicker">NEED A SPECIFIC BRIEF?</p><h2>Start with your workforce requirement.</h2><p>Tell us the market, role, volume, and timing. DTG can then share the most relevant material through the appropriate employer conversation.</p><Link className="corp-button" href="/contact">Discuss Your Workforce Needs →</Link></section>
    <CorporateFooter />
  </main>;
}
