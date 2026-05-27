import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Icon } from "@/components/pg/Icon";
import { PositionCard } from "@/components/pg/PositionCard";
import { WhatsAppFab } from "@/components/pg/WhatsAppFab";
import { FinalCTA } from "@/components/pg/primitives";
import { CountryTabs } from "@/components/pg/lowongan/CountryTabs";
import { ChapterBand } from "@/components/pg/lowongan/ChapterBand";
import { CrossLinkSertifikasi } from "@/components/pg/lowongan/CrossLinkSertifikasi";
import { COUNTRY_META, COUNTRY_KEYS, countryKeyFromName, type CountryMeta } from "@/lib/lowonganCountries";
import { fetchPositionsForCatalog } from "@/lib/positions-db";
import { waLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Lowongan Kerja Luar Negeri — Saudi Arabia, Jepang, Taiwan",
  description:
    "Job Portal Perantau Global: lowongan resmi dari employer terverifikasi P3MI di Saudi Arabia, Jepang, Taiwan & Indonesia. Bebas biaya sebelum offering letter, tanpa calo.",
};

export const revalidate = 60;

function inferInitialActive(country: string | undefined): "all" | CountryMeta["key"] {
  if (!country) return "all";
  const lower = country.toLowerCase();
  if (lower === "semua" || lower === "all") return "all";
  for (const k of COUNTRY_KEYS) {
    const c = COUNTRY_META[k];
    if (
      c.key === lower ||
      c.short.toLowerCase() === lower ||
      c.name.toLowerCase() === lower
    ) {
      return k;
    }
  }
  return "all";
}

export default async function LowonganIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ country?: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  const { country } = await searchParams;
  const initialActive = inferInitialActive(country);

  const positions = await fetchPositionsForCatalog();
  const openCountTotal = positions.filter((p) => p.status === "open").length;

  // Group positions by country key (in the order COUNTRY_KEYS defines)
  const byCountry: Record<CountryMeta["key"], typeof positions> = {
    saudi: [],
    jepang: [],
    taiwan: [],
    indonesia: [],
  };
  for (const p of positions) {
    const key = countryKeyFromName(p.country);
    byCountry[key].push(p);
  }

  const counts: Record<CountryMeta["key"], number> = {
    saudi: byCountry.saudi.length,
    jepang: byCountry.jepang.length,
    taiwan: byCountry.taiwan.length,
    indonesia: byCountry.indonesia.length,
  };

  return (
    <>
      <main>
        {/* Hero — Mau berangkat ke negara mana? */}
        <section className="px-5 md:px-8 py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-10 items-end">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-red-600">
                  Job Portal · Lowongan Aktif
                </div>
                <h1
                  className="mt-3.5 font-extrabold leading-[1.04] tracking-[-0.03em] text-pg-ink-900 text-balance"
                  style={{ fontSize: "clamp(36px, 5.6vw, 64px)" }}
                >
                  Mau berangkat <span className="text-pg-red-600">ke negara mana?</span>
                </h1>
                <p
                  className="mt-4 leading-relaxed text-pg-ink-700 font-medium"
                  style={{ fontSize: "clamp(15px, 1.3vw, 18px)", maxWidth: "56ch" }}
                >
                  {positions.length} posisi resmi dari employer terverifikasi P3MI di 4 negara.
                  Pilih negaranya — gaji, syarat, dan kontrak semua jelas di depan. Bebas calo.
                  Bebas biaya sebelum offering letter.
                </p>
              </div>
              <div className="flex flex-wrap gap-8 md:gap-10">
                <div className="flex flex-col gap-1 pl-5 border-l-[2px] border-pg-ink-900 py-2">
                  <span
                    className="font-mono font-extrabold leading-none tracking-[-0.025em]"
                    style={{ fontSize: "clamp(34px, 4vw, 48px)" }}
                  >
                    {positions.length}
                  </span>
                  <span className="font-mono text-[13px] text-pg-ink-500 tracking-[0.02em]">
                    posisi aktif
                  </span>
                </div>
                <div className="flex flex-col gap-1 pl-5 border-l border-pg-ink-200 py-2">
                  <span
                    className="font-mono font-extrabold leading-none tracking-[-0.025em] text-pg-ok"
                    style={{ fontSize: "clamp(34px, 4vw, 48px)" }}
                  >
                    {openCountTotal}
                  </span>
                  <span className="font-mono text-[13px] text-pg-ink-500 tracking-[0.02em]">
                    batch lagi buka
                  </span>
                </div>
                <div className="flex flex-col gap-1 pl-5 border-l border-pg-ink-200 py-2">
                  <span
                    className="font-mono font-extrabold leading-none tracking-[-0.025em]"
                    style={{ fontSize: "clamp(34px, 4vw, 48px)" }}
                  >
                    4
                  </span>
                  <span className="font-mono text-[13px] text-pg-ink-500 tracking-[0.02em]">
                    negara tujuan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky country tabs */}
        <CountryTabs initialActive={initialActive} counts={counts} total={positions.length} />

        {/* Country chapters */}
        {COUNTRY_KEYS.map((k) => {
          const list = byCountry[k];
          if (list.length === 0) return null;
          const open = list.filter((p) => p.status === "open");
          const queue = list.filter((p) => p.status === "queue");
          const country = COUNTRY_META[k];

          return (
            <section
              key={k}
              id={`chapter-${k}`}
              className="px-5 md:px-8 py-12 md:py-14 scroll-mt-[140px]"
              data-screen-label={`Chapter — ${country.name}`}
            >
              <div className="max-w-6xl mx-auto">
                <ChapterBand country={country} openCount={open.length} />

                {/* Meta row */}
                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[18px] font-bold tracking-[-0.01em] text-pg-ink-900">
                      {list.length} posisi di {country.name}
                    </span>
                    <span className="text-[13px] text-pg-ink-500">
                      Gaji dalam {country.currency}. Semua dari employer terverifikasi, bebas calo.
                    </span>
                  </div>
                </div>

                {/* Open positions — Featured cards (full width) */}
                {open.length > 0 && (
                  <div className="flex flex-col gap-4 mb-6">
                    {open.map((p) => (
                      <PositionCard key={p.slug} p={p} variant="featured" />
                    ))}
                  </div>
                )}

                {/* Divider + Queue positions — Row cards or Themed grid */}
                {queue.length > 0 && (
                  <>
                    {open.length > 0 && (
                      <div className="flex items-center gap-3 my-6">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-ink-500">
                          Daftar antrian — {queue.length} posisi
                        </span>
                        <span className="flex-1 h-px bg-pg-ink-100" />
                      </div>
                    )}
                    {open.length > 0 ? (
                      <div className="flex flex-col gap-2.5">
                        {queue.map((p) => (
                          <PositionCard key={p.slug} p={p} variant="row" />
                        ))}
                      </div>
                    ) : (
                      <div
                        className="grid gap-4 md:gap-5"
                        style={{
                          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                        }}
                      >
                        {queue.map((p) => (
                          <PositionCard key={p.slug} p={p} variant="themed" />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          );
        })}

        {/* Empty state — if positions list is empty */}
        {positions.length === 0 && (
          <section className="px-5 md:px-8 py-16 text-center text-pg-ink-500">
            <Icon name="info" size={28} stroke={2} className="mx-auto mb-3" />
            Belum ada posisi aktif saat ini. Hubungi kami untuk daftar antrian.
          </section>
        )}

        {/* Cross-link to sertifikasi */}
        <section className="px-5 md:px-8 py-8 md:py-10">
          <div className="max-w-6xl mx-auto">
            <CrossLinkSertifikasi />
          </div>
        </section>

        {/* Final CTA bookend */}
        <FinalCTA
          eyebrow="Belum nemu yang cocok?"
          title="Kami kabari saat kuota buka."
          body="Daftar antrian buat negara/posisi yang kamu incar. Kami WhatsApp/email begitu batch berikutnya dibuka."
          primaryHref="/kontak"
          primaryLabel="Hubungi kami"
          whatsappHref={waLink(
            "Halo, saya mau daftar antrian buat lowongan berikutnya di Perantau Global.",
          )}
        />
      </main>
      <WhatsAppFab />
    </>
  );
}
