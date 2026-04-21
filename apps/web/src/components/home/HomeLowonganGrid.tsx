import Link from "next/link";
import { useTranslations } from "next-intl";
import { Accent, AsymmetricSectionHeader, DisplayHeadline, Italic } from "@/components/editorial";

const NS = "home.editorial";

type Headline = { lead: string; italic?: string; accent?: string; trail?: string };
type Tile = {
  role: string;
  destination: string;
  salary: string;
  slots: string;
  intake: string;
  href: string;
  featured: boolean;
};

export default function HomeLowonganGrid() {
  const t = useTranslations(NS);
  const tag = t("lowonganAktif.tag");
  const headline = t.raw("lowonganAktif.headline") as Headline;
  const body = t("lowonganAktif.body");
  const tiles = t.raw("lowonganAktif.tiles") as Tile[];
  const slotLabel = t("lowonganAktif.slotLabel");
  const intakeLabel = t("lowonganAktif.intakeLabel");
  const readMore = t("lowonganAktif.readMore");

  return (
    <section id="lowongan-aktif" className="bg-[var(--color-dtg-cream)] px-6 py-20 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="01"
          label={tag}
          headline={
            <DisplayHeadline size="section">
              {headline.lead}
              {headline.italic && (
                <>
                  {" "}
                  <Italic>{headline.italic}</Italic>
                </>
              )}{" "}
              {headline.accent && <Accent>{headline.accent}</Accent>}
              {headline.trail && <> {headline.trail}</>}
            </DisplayHeadline>
          }
          body={body}
        />

        <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile, i) => {
            const isFeatured = tile.featured;
            return (
              <Link
                key={i}
                href={tile.href}
                className={
                  "group relative flex flex-col justify-between overflow-hidden p-8 no-underline transition-colors lg:p-10 " +
                  (isFeatured
                    ? "bg-[var(--color-dtg-red)] text-white hover:bg-[var(--color-dtg-red-dark)] lg:col-span-2 lg:row-span-2 lg:min-h-[520px]"
                    : "bg-white text-[var(--color-dtg-ink)] hover:bg-[var(--color-dtg-paper)] lg:min-h-[260px]")
                }
              >
                <div className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
                  {String(i + 1).padStart(2, "0")} / {String(tiles.length).padStart(2, "0")}
                </div>

                <div className="mt-10 lg:mt-auto">
                  <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] opacity-80">
                    {tile.destination}
                  </div>
                  <h3
                    className={
                      "mt-2 font-[family-name:var(--font-display)] font-extrabold leading-[0.92] tracking-[-0.04em] " +
                      (isFeatured ? "text-[clamp(40px,6vw,80px)]" : "text-[clamp(28px,3.5vw,44px)]")
                    }
                  >
                    {tile.role}
                  </h3>
                  <p
                    className={
                      "mt-3 font-[family-name:var(--font-display)] font-extrabold tracking-[-0.02em] " +
                      (isFeatured ? "text-2xl" : "text-lg")
                    }
                  >
                    {tile.salary}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] opacity-75">
                    <span>
                      <span className="text-[var(--color-dtg-red)] opacity-100" style={{ color: isFeatured ? "#fff" : undefined }}>●</span>{" "}
                      {tile.slots} {slotLabel}
                    </span>
                    <span className="opacity-60">|</span>
                    <span>{intakeLabel} {tile.intake}</span>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-[0.12em] transition-transform group-hover:translate-x-1">
                    {readMore}
                    <span>→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
