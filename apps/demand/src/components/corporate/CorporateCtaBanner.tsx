import Link from "next/link";
import type { ReactNode } from "react";

type CorporateCtaBannerProps = {
  label: string;
  title: ReactNode;
  description: string;
  href?: string;
  cta?: string;
  id?: string;
};

export function CorporateCtaBanner({
  label,
  title,
  description,
  href = "/contact",
  cta = "Discuss Your Workforce Needs",
  id,
}: CorporateCtaBannerProps) {
  return (
    <section className="corp-contact" id={id}>
      <div className="corp-contact-decoration" aria-hidden="true">
        <span>ROLE FIT</span><i /><span>MARKET ROUTE</span><i /><span>AFTERCARE</span>
      </div>
      <p className="corp-kicker">{label}</p>
      <h2>{title}</h2>
      <Link href={href} className="corp-button">{cta} <span>→</span></Link>
      <p className="corp-contact-note">{description}</p>
    </section>
  );
}
