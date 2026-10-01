import Link from "next/link";
import { CorporateFooter } from "@/components/corporate/CorporateFooter";
import { CorporateNav } from "@/components/corporate/CorporateNav";
import { CorporateCtaBanner } from "@/components/corporate/CorporateCtaBanner";

const P3MI_GUIDE = "/downloads/hiring-indonesian-talent-through-p3mi.pdf";

const resources = [
  ["01", "DTG Company Profile", "A concise employer-facing introduction to DTG, its role in the Dayalima Group, market focus, and accountable workforce approach.", "Company profile", "Ready as a web preview"],
  ["02", "How DTG Works", "A clear engagement journey from qualified workforce need and job detail through selection support, mobilisation coordination, and aftercare.", "View the process", "Ready as a web preview"],
  ["03", "Hiring Indonesian Talent Through P3MI", "A practical guide to the employer hiring route through a licensed P3MI, including placement steps and the documents employers need to prepare.", "Download the guide (PDF)", "PDF GUIDE"],
  ["04", "Illustrative Assessment & Readiness Report", "A future employer-facing sample using a fictional candidate profile, role-specific criteria, evidence status, strengths, gaps, and review notes.", "View report framework", "NEED APPROVAL"],
] as const;

function ResourceVisual({ number }: { number: string }) {
  if (number === "04") return <div className="corp-resource-visual corp-readiness-preview" aria-hidden="true"><div><span>ROLE FIT</span><b>Illustrative profile</b></div><i /><i /><i /></div>;
  return null;
}

export default function ResourcesPage() {
  return <main className="corp"><CorporateNav />
    <section className="corp-inner-hero"><p className="corp-kicker">EMPLOYER RESOURCES</p><h1>Make the next workforce conversation <em>more informed.</em></h1><p>Practical DTG materials for employers and authorised demand-side intermediaries. Public resources remain evidence-led and are updated as material is cleared for use.</p></section>
    <section className="corp-resource-grid">{resources.map(([number, title, copy, cta, status]) => {
      const isGuide = title === "Hiring Indonesian Talent Through P3MI";
      return <article key={title} className={Number(number) > 3 ? "has-visual" : undefined}><span>{number}</span><small>{status}</small><h2>{isGuide ? <a href={P3MI_GUIDE} download>{title}</a> : title}</h2><p>{copy}</p><ResourceVisual number={number} />{isGuide ? <a href={P3MI_GUIDE} download>{cta} <b>→</b></a> : <Link href="/contact">{cta} <b>→</b></Link>}</article>;
    })}</section>
    <CorporateCtaBanner label="NEED A SPECIFIC BRIEF?" title="Start with your workforce requirement." description="Tell us the market, role, volume, and timing. DTG can then share the most relevant material through the appropriate employer conversation." />
    <CorporateFooter />
  </main>;
}
