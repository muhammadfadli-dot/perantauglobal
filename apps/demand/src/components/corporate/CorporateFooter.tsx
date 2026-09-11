import Image from "next/image";
import Link from "next/link";
import { CONTACT, waLink } from "@/lib/site-config";

export function CorporateFooter() {
  return (
    <footer className="corp-footer">
      <div className="corp-footer-main"><div className="corp-footer-brand"><Image src="/images/logo-dtg-footer.webp" alt="Daya Talenta Global" width={180} height={72} /></div><p>We help international employers assess fit and readiness in Indonesian talent, then support the journey from workforce need through aftercare.</p><div className="corp-footer-contact"><p>Contact</p><a href={waLink("Hello DTG, I would like to discuss an employer workforce need.")} target="_blank" rel="noreferrer">WhatsApp {CONTACT.whatsappDisplay}</a><address>{CONTACT.office}</address></div></div>
      <div className="corp-footer-links"><div><p>For employers</p><Link href="/services">Workforce solutions</Link><Link href="/resources">Employer resources</Link><Link href="/contact#partnership">Partnership inquiry</Link><Link href="/contact">Employer inquiry</Link><Link href="/articles">Articles</Link></div><div><p>Company</p><Link href="/about">About DTG</Link><Link href="/about#why-dtg">Why DTG</Link><Link href="/about#evidence">Evidence &amp; governance</Link></div><div><p>Markets</p><Link href="/saudi-gcc">Saudi Arabia &amp; GCC</Link><Link href="/japan">Japan</Link><Link href="/europe">Europe / Bulgaria</Link></div><div className="corp-footer-candidate"><p>For candidates</p><Link className="corp-footer-perantau" href="/for-candidates">Perantau Global</Link></div></div>
      <div className="corp-footer-bottom"><p>PT Daya Talenta Global · Part of Dayalima Group</p><p>© 2026 PT Daya Talenta Global. All rights reserved.</p></div>
    </footer>
  );
}
