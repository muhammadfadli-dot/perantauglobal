import { useTranslations } from "next-intl";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  Italic,
  LegalDossierCard,
  type Credential,
} from "@/components/editorial";

const NS = "home.editorial";

type Headline = { lead: string; italic?: string; accent?: string };
type Stat = { label: string; value: string; sub: string };
type Dossier = {
  serial: string;
  status: string;
  badge: string;
  headline: string;
  body: string;
  credentials: Credential[];
  signatory: { name: string; title: string; date: string; location: string };
};

export default function HomeTentangDossier() {
  const t = useTranslations(NS);
  const tag = t("tentang.tag");
  const headline = t.raw("tentang.headline") as Headline;
  const body = t("tentang.body");
  const stats = t.raw("tentang.stats") as Stat[];
  const dossier = t.raw("tentang.dossier") as Dossier;

  return (
    <section id="tentang" className="bg-[var(--color-dtg-cream)] px-6 py-20 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="03"
          label={tag}
          headline={
            <DisplayHeadline size="section">
              {headline.lead}{" "}
              {headline.italic && <Italic>{headline.italic}</Italic>}{" "}
              {headline.accent && <Accent>{headline.accent}</Accent>}
            </DisplayHeadline>
          }
          body={body}
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-16">
          <div className="grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] sm:grid-cols-2">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-8 lg:p-10">
                <div className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.14em] opacity-60">
                  {stat.label}
                </div>
                <p className="mt-3 font-[family-name:var(--font-display)] text-[clamp(44px,5vw,72px)] font-extrabold leading-none tracking-[-0.05em]">
                  {stat.value}
                </p>
                <p className="mt-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] opacity-70">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>

          <LegalDossierCard
            serial={dossier.serial}
            status={dossier.status}
            badge={dossier.badge}
            headline={
              <>
                {dossier.headline.split(" ").slice(0, 3).join(" ")}
                <br />
                {dossier.headline.split(" ").slice(3).join(" ")}
              </>
            }
            body={dossier.body}
            credentials={dossier.credentials}
            signatory={dossier.signatory}
          />
        </div>
      </div>
    </section>
  );
}
