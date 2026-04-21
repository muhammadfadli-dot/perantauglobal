import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  EditorialButton,
  Footer,
  IllCompass,
  IllHand,
  IllPassport,
  IllPin,
  IllPlane,
  IllStamp,
  IllTicket,
  Italic,
  LegalDossierCard,
  MetaStrip,
  MobileStickyCTA,
  MonoLabel,
  Nav,
  SectionTag,
  Ticker,
} from "@/components/editorial";

export const dynamic = "force-static";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[var(--color-dtg-paper)] text-[var(--color-dtg-ink)]">
      <Nav
        anchors={[
          { id: "tokens", label: "Tokens" },
          { id: "type", label: "Type" },
          { id: "buttons", label: "Buttons" },
          { id: "illustrations", label: "Ill" },
          { id: "patterns", label: "Patterns" },
        ]}
        ctaLabel="Catalog"
        ctaHref="#tokens"
      />

      <MetaStrip
        left="§ Design system catalog · dev only"
        right={<span className="text-[var(--color-dtg-red)]">● editorial v1</span>}
        tone="cream"
        border="bottom"
      />

      <main className="mx-auto max-w-[1440px] px-6 py-16">
        {/* Tokens */}
        <section id="tokens" className="mb-20">
          <AsymmetricSectionHeader
            number="01"
            label="Color tokens"
            headline={
              <DisplayHeadline size="section">
                Three colors,<br />one <Accent>system</Accent>.
              </DisplayHeadline>
            }
            body="Cream, ink, and DTG red. Plus paper for table rows and white for inner panels. That's it."
          />
          <div className="mt-10 grid grid-cols-2 gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] sm:grid-cols-3 md:grid-cols-6">
            {[
              ["Ink", "var(--color-dtg-ink)", "#0E0E10"],
              ["Cream", "var(--color-dtg-cream)", "#F5F0E8"],
              ["Paper", "var(--color-dtg-paper)", "#F9F6EF"],
              ["Red", "var(--color-dtg-red)", "#C8102E"],
              ["Red Dark", "var(--color-dtg-red-dark)", "#8B0000"],
              ["White", "#fff", "#FFFFFF"],
            ].map(([name, css, hex]) => (
              <div key={name} className="flex flex-col">
                <div className="aspect-square" style={{ background: css }} />
                <div className="bg-white p-3">
                  <div className="font-[family-name:var(--font-display)] text-sm font-extrabold">{name}</div>
                  <MonoLabel className="mt-1 block">{hex}</MonoLabel>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section id="type" className="mb-20">
          <AsymmetricSectionHeader
            number="02"
            label="Typography scale"
            headline={
              <DisplayHeadline size="section">
                Display, body,<br /><Accent>mono</Accent>.
              </DisplayHeadline>
            }
            body="Plus Jakarta Sans for display. Source Sans 3 for body. JetBrains Mono for tags, labels, and arrows."
          />
          <div className="mt-10 grid gap-12 border border-[var(--color-dtg-ink)] bg-white p-10">
            <div>
              <MonoLabel>hero · clamp(48,8.5vw,112)</MonoLabel>
              <DisplayHeadline size="hero" as="h3">
                Perawat, <Italic>menuju</Italic> <Accent>Riyadh.</Accent>
              </DisplayHeadline>
            </div>
            <div>
              <MonoLabel>section · clamp(40,7vw,96)</MonoLabel>
              <DisplayHeadline size="section" as="h3">
                Paket lengkap, <Italic>tanpa potongan</Italic> gelap.
              </DisplayHeadline>
            </div>
            <div>
              <MonoLabel>sidebar · clamp(36,5.5vw,72)</MonoLabel>
              <DisplayHeadline size="sidebar" as="h3">
                Detil <Italic>posisi,</Italic> hitam di atas putih.
              </DisplayHeadline>
            </div>
            <div>
              <MonoLabel>poster · clamp(56,10vw,144)</MonoLabel>
              <DisplayHeadline size="poster" as="h3">
                Waktu <Italic>mulai</Italic> merantau.
              </DisplayHeadline>
            </div>
            <div className="border-t border-[var(--color-dtg-ink)] pt-8">
              <MonoLabel>body · 17/1.6</MonoLabel>
              <p className="mt-3 max-w-[60ch] text-[17px] leading-[1.6]">
                Source Sans 3 at 17px. Used for paragraph copy, descriptions, and form helper text. Comfortable line length around 60–65 characters.
              </p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section id="buttons" className="mb-20">
          <AsymmetricSectionHeader
            number="03"
            label="Buttons"
            headline={
              <DisplayHeadline size="section">
                Hard edges,<br /><Accent>arrow</Accent> mono.
              </DisplayHeadline>
            }
            body="Four variants. No rounding. Mono arrow suffix is automatic."
          />
          <div className="mt-10 flex flex-wrap items-center gap-4 border border-[var(--color-dtg-ink)] bg-white p-10">
            <EditorialButton variant="ink" suffix="→">Daftar sekarang</EditorialButton>
            <EditorialButton variant="cream" suffix="→">WhatsApp langsung</EditorialButton>
            <EditorialButton variant="red" suffix="↑">Daftar · gratis</EditorialButton>
            <EditorialButton variant="outline" suffix="↓">Baca dosier</EditorialButton>
          </div>
        </section>

        {/* Ticker */}
        <section id="patterns" className="mb-20">
          <AsymmetricSectionHeader
            number="04"
            label="Patterns"
            headline={
              <DisplayHeadline size="section">
                Ticker, dossier,<br />and <Accent>cards</Accent>.
              </DisplayHeadline>
            }
          />
          <div className="mt-10 grid gap-10">
            <Ticker
              items={[
                { icon: "★", text: "SIP No. KEP.1847/MEN/2019" },
                { icon: "✦", text: "PT Daya Talenta Global" },
                { icon: "◆", text: "Dayalima Group · est. 2008" },
                { icon: "●", text: "BP2MI & Kemnaker partner" },
                { icon: "★", text: "ISO 9001:2015 tersertifikasi" },
                { icon: "✦", text: "50+ negara · 3,400+ PMI" },
              ]}
            />

            <div className="grid gap-10 lg:grid-cols-[340px_1fr]">
              <LegalDossierCard
                serial="Arsip legal · No. 1847/MEN/2019"
                status="AKTIF"
                badge="BP2MI · KEMNAKER"
                headline={
                  <>
                    Kontrak kamu<br />sah di mata negara.
                  </>
                }
                body={
                  <>
                    Disahkan <b>BP2MI</b>, terdaftar di <b>Kemnaker RI</b>. Tim legal kami mengecek tiap klausul sebelum kamu tanda tangan.
                  </>
                }
                credentials={[
                  { label: "P3MI", note: "No. izin resmi" },
                  { label: "ISO 9001:2015", note: "Tersertifikasi" },
                  { label: "BP2MI", note: "Partner terdaftar" },
                  { label: "Dayalima Group", note: "Sejak 2008" },
                ]}
                signatory={{
                  name: "R. Setiawan",
                  title: "Kepala Legal · Perantau Global",
                  date: "Tgl. 12 Mar 2026",
                  location: "Jakarta, ID",
                }}
              />
              <SectionTag
                number="sample"
                label="Sidebar pairs with table content in real sections (e.g. RoleInfo, FAQ)."
              />
            </div>
          </div>
        </section>

        {/* Illustrations */}
        <section id="illustrations" className="mb-20">
          <AsymmetricSectionHeader
            number="05"
            label="Illustrations"
            headline={
              <DisplayHeadline size="section">
                Flat editorial,<br /><Accent>no realism</Accent>.
              </DisplayHeadline>
            }
            body="Seven SVGs. DTG red + cream + ink only. Each component takes a `size` prop."
          />
          <div className="mt-10 grid grid-cols-2 gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] sm:grid-cols-3 md:grid-cols-4">
            {[
              ["Stamp", <IllStamp key="s" size={120} />],
              ["Plane", <IllPlane key="p" size={120} />],
              ["Passport", <IllPassport key="pa" size={120} />],
              ["Compass", <IllCompass key="c" size={120} />],
              ["Pin", <IllPin key="pi" size={120} />],
              ["Hand", <IllHand key="h" size={120} />],
              ["Ticket", <IllTicket key="t" size={200} />],
            ].map(([name, svg]) => (
              <div key={String(name)} className="flex flex-col items-center bg-[var(--color-dtg-paper)] p-6">
                <div>{svg}</div>
                <MonoLabel className="mt-3">{name}</MonoLabel>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer
        brand={{
          title: "Perantau Global",
          body: "PT Daya Talenta Global · P3MI resmi di bawah Dayalima Group. Catalog dev-only.",
        }}
        columns={[
          { label: "Lowongan", items: ["Perawat Saudi", "Kaigo Jepang", "Truck Driver", "Barista Saudi"] },
          { label: "Kontak", items: ["+62 852-1141-5104", "halo@perantauglobal.com", "Jakarta, Indonesia"] },
        ]}
        legal={{ left: "© 2026 Perantau Global", right: "SIP No. KEP.1847/MEN/2019" }}
      />

      <MobileStickyCTA
        metaLeft="§ Action"
        metaRight="12 / 24 slot"
        ctaLabel="Daftar · gratis"
        formAnchor="#tokens"
        whatsappUrl="https://wa.me/6285211415104"
      />
    </div>
  );
}
