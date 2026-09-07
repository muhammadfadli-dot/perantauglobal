import Link from "next/link";
import Image from "next/image";
import { LanguageSwitch } from "./LanguageSwitch";

export function CorporateNav() {
  return (
    <>
      <nav className="corp-nav" aria-label="Primary navigation">
        <Link href="/" className="corp-brand-logo" aria-label="Daya Talenta Global home"><Image src="/images/logo-dtg-navbar.webp" alt="Daya Talenta Global" width={170} height={68} priority /></Link>
        <div className="corp-nav-links">
          <Link href="/about">About DTG</Link>
          <Link href="/services">Workforce solutions</Link>
          <Link href="/resources">Employer resources</Link>
          <Link href="/regions">Markets</Link>
          <Link href="/articles">Articles</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="corp-nav-actions"><Link className="corp-nav-talent" href="/for-candidates">For candidates</Link><LanguageSwitch /><Link className="corp-nav-cta" href="/contact">Discuss your needs <span>→</span></Link></div>
      </nav>
    </>
  );
}
