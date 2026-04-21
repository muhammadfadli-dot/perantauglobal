import { useTranslations } from "next-intl";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  EditorialButton,
  IllPlane,
  IllStamp,
  IllTicket,
  Italic,
  LegalDossierCard,
  MetaStrip,
  MonoLabel,
  type Credential,
} from "@/components/editorial";

const NS = "about.editorial";

type Headline = { lead: string; italic?: string; accent?: string; trail?: string };
type Row = { key: string; value: string; sub: string };
type Stat = { label: string; value: string; sub: string };

export default function TentangContent() {
  const t = useTranslations(NS);

  const hero = t.raw("hero") as { tag: string; headline: Headline; body: string };
  const arsip = t.raw("arsip") as {
    tag: string;
    headline: Headline;
    body: string;
    rows: Row[];
    dossier: {
      serial: string;
      status: string;
      badge: string;
      headline: string;
      body: string;
      credentials: Credential[];
      signatory: { name: string; title: string; date: string; location: string };
    };
  };
  const dayalima = t.raw("dayalima") as { tag: string; headline: Headline; body: string; stats: Stat[] };
  const visiMisi = t.raw("visiMisi") as {
    tag: string;
    headline: Headline;
    visi: { label: string; body: string };
    misi: { label: string; items: string[] };
  };
  const kredensial = t.raw("kredensial") as {
    tag: string;
    headline: Headline;
    body: string;
    rows: Row[];
    verifyLabel: string;
    verifyHref: string;
  };
  const finalCta = t.raw("finalCta") as {
    tag: string;
    scarcity: string;
    headline: Headline;
    body: string;
    ctaPrimary: string;
    ctaPrimaryHref: string;
    ctaSecondary: string;
    ctaSecondaryHref: string;
  };

  return (
    <>
      {/* Editorial hero (simpler — no photo, just type) */}
      <section className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]">
        <MetaStrip
          left="§ Tentang · PT Daya Talenta Global"
          right={<span className="text-[var(--color-dtg-red)]">● P3MI Resmi · No. 1810240237512001</span>}
          tone="cream"
          border="bottom"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-14 lg:py-20 animate-[slideUp_0.6s_var(--ease-out-expo)]">
          <div className="flex items-center gap-3">
            <span className="block h-[2px] w-9 bg-[var(--color-dtg-red)]" />
            <MonoLabel className="text-[var(--color-dtg-red)] opacity-100" size="sm">
              {hero.tag}
            </MonoLabel>
          </div>
          <DisplayHeadline as="h1" size="hero" className="mt-6 max-w-[22ch]">
            {hero.headline.lead}
            {hero.headline.italic && (
              <>
                {" "}
                <Italic>{hero.headline.italic}</Italic>
              </>
            )}
            {hero.headline.accent && (
              <>
                {" "}
                <Accent>{hero.headline.accent}</Accent>
              </>
            )}
          </DisplayHeadline>
          <p className="mt-8 max-w-[58ch] text-[clamp(16px,1.6vw,20px)] leading-[1.5] opacity-80">
            {hero.body}
          </p>
        </div>
      </section>

      {/* § 01 — Arsip perusahaan: dossier-table + LegalDossierCard */}
      <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <AsymmetricSectionHeader
            number="01"
            label={arsip.tag}
            headline={
              <DisplayHeadline size="section">
                {arsip.headline.lead}{" "}
                {arsip.headline.italic && <Italic>{arsip.headline.italic}</Italic>}{" "}
                {arsip.headline.accent && <Accent>{arsip.headline.accent}</Accent>}
              </DisplayHeadline>
            }
            body={arsip.body}
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
            <div className="border-t border-[var(--color-dtg-ink)]">
              {arsip.rows.map((row, i) => (
                <div
                  key={i}
                  className="grid gap-6 border-b border-[color:rgba(26,26,26,0.15)] py-6 sm:grid-cols-[160px_1fr] sm:gap-10"
                >
                  <div className="pt-1.5 font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
                    {row.key}
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-[clamp(18px,1.8vw,24px)] font-extrabold tracking-[-0.03em]">
                      {row.value}
                    </p>
                    <p className="mt-1.5 text-[14px] leading-[1.5] opacity-70">{row.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <LegalDossierCard
              serial={arsip.dossier.serial}
              status={arsip.dossier.status}
              badge={arsip.dossier.badge}
              headline={
                <>
                  {arsip.dossier.headline.split(" ").slice(0, 3).join(" ")}
                  <br />
                  {arsip.dossier.headline.split(" ").slice(3).join(" ")}
                </>
              }
              body={arsip.dossier.body}
              credentials={arsip.dossier.credentials}
              signatory={arsip.dossier.signatory}
            />
          </div>
        </div>
      </section>

      {/* § 02 — Dayalima Group: stats magazine grid */}
      <section className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <AsymmetricSectionHeader
            number="02"
            label={dayalima.tag}
            headline={
              <DisplayHeadline size="section">
                {dayalima.headline.lead}{" "}
                {dayalima.headline.italic && <Italic>{dayalima.headline.italic}</Italic>}{" "}
                {dayalima.headline.accent && <Accent>{dayalima.headline.accent}</Accent>}
              </DisplayHeadline>
            }
            body={dayalima.body}
          />
          <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] sm:grid-cols-2 lg:grid-cols-4">
            {dayalima.stats.map((stat, i) => (
              <div key={i} className="bg-white p-8 lg:p-10">
                <MonoLabel className="opacity-60" size="xs">
                  {stat.label}
                </MonoLabel>
                <p className="mt-3 font-[family-name:var(--font-display)] text-[clamp(40px,4.5vw,64px)] font-extrabold leading-none tracking-[-0.05em]">
                  {stat.value}
                </p>
                <p className="mt-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] opacity-70">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* § 03 — Visi & Misi */}
      <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <AsymmetricSectionHeader
            number="03"
            label={visiMisi.tag}
            headline={
              <DisplayHeadline size="section">
                {visiMisi.headline.lead}{" "}
                {visiMisi.headline.italic && <Italic>{visiMisi.headline.italic}</Italic>}{" "}
                {visiMisi.headline.accent && <Accent>{visiMisi.headline.accent}</Accent>}
              </DisplayHeadline>
            }
          />
          <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] lg:grid-cols-[1fr_1.3fr]">
            <div className="flex flex-col gap-6 bg-[var(--color-dtg-paper)] p-10 lg:p-14">
              <MonoLabel className="opacity-60">{visiMisi.visi.label}</MonoLabel>
              <p className="font-[family-name:var(--font-display)] text-[clamp(22px,2.4vw,32px)] font-extrabold leading-[1.15] tracking-[-0.02em] text-balance">
                <span className="text-[var(--color-dtg-red)]">“</span>
                {visiMisi.visi.body}
                <span className="text-[var(--color-dtg-red)]">”</span>
              </p>
            </div>
            <div className="bg-white p-10 lg:p-14">
              <MonoLabel className="opacity-60">{visiMisi.misi.label}</MonoLabel>
              <ol className="mt-4 grid gap-5">
                {visiMisi.misi.items.map((item, i) => (
                  <li key={i} className="flex gap-5 border-t border-[color:rgba(26,26,26,0.15)] pt-5 first:border-t-0 first:pt-0">
                    <span className="font-[family-name:var(--font-display)] text-3xl font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-red)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="pt-1 text-[15px] leading-[1.5] opacity-85">{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* § 04 — Kredensial & legalitas */}
      <section className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <AsymmetricSectionHeader
            number="04"
            label={kredensial.tag}
            headline={
              <DisplayHeadline size="section">
                {kredensial.headline.lead}{" "}
                {kredensial.headline.italic && <Italic>{kredensial.headline.italic}</Italic>}{" "}
                {kredensial.headline.accent && <Accent>{kredensial.headline.accent}</Accent>}
              </DisplayHeadline>
            }
            body={kredensial.body}
          />

          <div className="mt-12 border-t border-[var(--color-dtg-ink)] bg-white">
            {kredensial.rows.map((row, i) => (
              <div
                key={i}
                className="grid gap-6 border-b border-[color:rgba(26,26,26,0.15)] px-6 py-6 sm:grid-cols-[200px_1fr_auto] sm:items-baseline sm:gap-10 lg:px-10"
              >
                <div className="font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
                  {row.key}
                </div>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-[clamp(18px,1.8vw,24px)] font-extrabold tracking-[-0.03em]">
                    {row.value}
                  </p>
                  <p className="mt-1.5 text-sm leading-[1.5] opacity-70">{row.sub}</p>
                </div>
                <span className="font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-dtg-red)]">
                  ✓ Verified
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <EditorialButton href={kredensial.verifyHref} variant="ink" suffix="↗" target="_blank" rel="noopener noreferrer">
              {kredensial.verifyLabel}
            </EditorialButton>
          </div>
        </div>
      </section>

      {/* Final CTA — poster */}
      <section className="relative overflow-hidden bg-[var(--color-dtg-red)] text-white">
        <MetaStrip
          left={`§ ${finalCta.tag}`}
          right={
            <>
              <span className="text-white">●</span> {finalCta.scarcity}
            </>
          }
          tone="red"
          border="bottom"
          className="text-white"
        />
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1.3fr_1fr] lg:items-center lg:min-h-[440px]">
          <div className="flex flex-col gap-8 px-6 py-14 lg:px-14 lg:py-16">
            <DisplayHeadline size="poster">
              {finalCta.headline.lead}
              {finalCta.headline.italic && (
                <>
                  <br />
                  <Italic>{finalCta.headline.italic}</Italic>
                </>
              )}
              {finalCta.headline.trail && (
                <>
                  <br />
                  {finalCta.headline.trail}
                </>
              )}
            </DisplayHeadline>
            <p className="max-w-[42ch] text-lg leading-[1.5] text-white/90">{finalCta.body}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <EditorialButton href={finalCta.ctaPrimaryHref} variant="ink" suffix="→">
                {finalCta.ctaPrimary}
              </EditorialButton>
              <EditorialButton href={finalCta.ctaSecondaryHref} variant="cream" suffix="→" target="_blank" rel="noopener noreferrer">
                {finalCta.ctaSecondary}
              </EditorialButton>
            </div>
          </div>
          <div className="relative min-h-[240px] lg:min-h-[380px]">
            <div className="absolute left-6 top-10 rotate-[8deg]">
              <IllPlane size={150} />
            </div>
            <div className="absolute right-10 top-40 -rotate-[8deg]">
              <IllStamp size={120} label="LEGAL" />
            </div>
            <div className="absolute bottom-10 left-12 -rotate-[4deg]">
              <IllTicket size={220} routeCode="CGK → ∞" routeLabel="JAKARTA · 50+ NEGARA" gate="A1" seat="HOME" />
            </div>
          </div>
        </div>
        <MetaStrip
          left="© 2026 Perantau Global · PT Daya Talenta Global"
          right="SIP No. KEP.1847/MEN/2019"
          tone="red"
          border="top"
          className="text-white opacity-90"
        />
      </section>
    </>
  );
}

