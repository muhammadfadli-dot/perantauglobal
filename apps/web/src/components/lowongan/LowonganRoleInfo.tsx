"use client";

import { useTranslations } from "next-intl";
import { LegalDossierCard, SectionTag, type Credential } from "@/components/editorial";

interface Props {
  /** Role-level namespace, e.g. "lowongan.perawat-saudi-arabia". */
  namespace: string;
}

type Row = { key: string; value: string; sub: string };
type Headline = { lead: string; italic?: string; trail?: string };
type Dossier = {
  serial: string;
  status: string;
  badge: string;
  headline: string;
  body: string;
  credentials: Credential[];
  signatory: { name: string; title: string; date: string; location: string };
};

export default function LowonganRoleInfo({ namespace }: Props) {
  const t = useTranslations(namespace);
  const tag = t("editorial.roleInfo.tag");
  const headline = t.raw("editorial.roleInfo.headline") as Headline;
  const rows = t.raw("editorial.roleInfo.rows") as Row[];
  const dossier = t.raw("editorial.roleInfo.dossier") as Dossier;

  return (
    <section id="info" className="bg-white px-6 py-20 lg:px-14 lg:py-24">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SectionTag number="01" label={tag} />
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(36px,5.5vw,72px)] font-extrabold leading-[0.92] tracking-[-0.04em] text-balance">
            {headline.lead}{" "}
            {headline.italic && <span className="italic font-medium">{headline.italic}</span>}{" "}
            {headline.trail}
          </h2>
          <div className="mt-8">
            <LegalDossierCard
              serial={dossier.serial}
              status={dossier.status}
              badge={dossier.badge}
              headline={
                <>
                  {dossier.headline.split(" ").slice(0, Math.ceil(dossier.headline.split(" ").length / 2)).join(" ")}
                  <br />
                  {dossier.headline.split(" ").slice(Math.ceil(dossier.headline.split(" ").length / 2)).join(" ")}
                </>
              }
              body={dossier.body}
              credentials={dossier.credentials}
              signatory={dossier.signatory}
            />
          </div>
        </aside>

        {/* Dossier table */}
        <div className="border-t border-[var(--color-dtg-ink)]">
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid gap-6 border-b border-[color:rgba(26,26,26,0.15)] py-6 sm:grid-cols-[140px_1fr] sm:gap-10"
            >
              <div className="pt-1.5 font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
                {row.key}
              </div>
              <div>
                <p className="font-[family-name:var(--font-display)] text-[clamp(20px,2vw,28px)] font-extrabold tracking-[-0.03em]">
                  {row.value}
                </p>
                <p className="mt-1.5 text-[15px] leading-[1.5] opacity-72">{row.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
