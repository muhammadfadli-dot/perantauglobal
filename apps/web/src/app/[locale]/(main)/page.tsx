import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { generateMeta } from "@/lib/seo";
import { Icon } from "@/components/pg/Icon";
import { WhatsAppFab } from "@/components/pg/WhatsAppFab";
import {
  ButtonLink,
  Section,
  SectionHeader,
  Eyebrow,
  FinalCTA,
} from "@/components/pg/primitives";
import { POSITIONS } from "@/lib/positions";
import { waLink } from "@/lib/contact";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  await params;
  return generateMeta({
    title: "Perantau Global — Aplikasi Kerja Luar Negeri Resmi (P3MI)",
    description:
      "Perantau Global (PT Daya Talenta Global) — P3MI resmi Kemnaker, bagian dari DayaLima yang sudah jalan sejak 1998. Lowongan & sertifikasi siap kerja: bebas biaya sebelum offering letter, proses transparan, tanpa calo.",
    locale: "id",
  });
}

const COUNTRIES = [
  { name: "Saudi Arabia", short: "Saudi", flag: "🇸🇦", img: "/images/countries/saudi.jpg" },
  { name: "Jepang", short: "Jepang", flag: "🇯🇵", img: "/images/countries/jepang.jpg" },
  { name: "Taiwan", short: "Taiwan", flag: "🇹🇼", img: "/images/countries/taiwan.jpg" },
  { name: "Indonesia", short: "Indonesia", flag: "🇮🇩", img: "/images/countries/indonesia.jpg" },
];

const FAQS = [
  {
    q: "Belum punya paspor, bisa daftar?",
    a: "Bisa. Daftar dulu — kami pandu cara urus paspor sambil proses jalan.",
  },
  {
    q: "Harus pernah kerja di luar negeri?",
    a: "Nggak. Banyak yang kami berangkatkan baru pertama kali.",
  },
  {
    q: "Beneran gratis di awal?",
    a: "Iya. Biaya cuma muncul setelah kamu diterima employer, untuk dokumen — angkanya tertera di tiap lowongan.",
  },
  {
    q: "Data saya aman?",
    a: "Aman, sesuai UU Perlindungan Data Pribadi. Cuma tim recruiter & PIC kamu yang akses.",
  },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <main>
        {/* BEAT 1 — HERO (poster full-bleed; intentional escape hatch — only place
            on the site that uses the red-illustration treatment) */}
        <section
          className="relative overflow-hidden"
          style={{ background: "var(--pg-red-900)" }}
        >
          {/* Desktop poster — wide horizontal, figures center-left, globe upper-right */}
          <Image
            src="/images/home-hero-desktop-v44.jpg"
            alt="Ilustrasi tiga pekerja Indonesia — perawat, teknisi, dan caregiver — memandang ke atas dengan harapan, latar globe Asia Tenggara"
            fill
            priority
            sizes="100vw"
            className="hidden md:block object-cover object-bottom select-none"
          />
          {/* Mobile poster — 4:5 portrait, figures bottom-anchored, globe behind */}
          <Image
            src="/images/home-hero-mobile-v44.jpg"
            alt="Ilustrasi tiga pekerja Indonesia — perawat, teknisi, dan caregiver — memandang ke atas dengan harapan, latar globe Asia Tenggara"
            fill
            priority
            sizes="100vw"
            className="md:hidden object-cover object-bottom select-none"
          />
          {/* Scrim — subtle top + bottom darken so text stays legible. */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.10) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.12) 100%)",
            }}
          />
          <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 min-h-[640px] md:min-h-[720px] flex flex-col items-center text-center pt-10 md:pt-16">
            <Eyebrow tone="gold" className="!text-pg-gold-200">
              Perantau Global · Aplikasi Resmi P3MI
            </Eyebrow>
            <h1
              className="mt-4 text-[34px] md:text-[58px] font-extrabold leading-[1.05] tracking-[-0.03em]"
              style={{
                color: "var(--pg-cream)",
                textShadow:
                  "0 1px 2px rgba(0,0,0,0.18), 0 2px 18px rgba(0,0,0,0.22)",
              }}
            >
              Siap berangkat{" "}
              <span style={{ color: "var(--pg-gold-500)" }}>
                kerja ke luar negeri.
              </span>
            </h1>
            <p
              className="mt-4 max-w-md md:max-w-lg text-[14px] md:text-[17px] font-medium leading-relaxed"
              style={{
                color: "var(--pg-cream)",
                opacity: 0.94,
                textShadow: "0 1px 6px rgba(0,0,0,0.18)",
              }}
            >
              Resmi, jelas, tanpa calo. Izin P3MI-nya bisa kamu cek sendiri — bukan janji calo.
            </p>
            {/* CTA — bottom-anchored, kept clear of faces via mt-auto + responsive pb */}
            <div className="mt-auto pb-10 md:pb-[88px] flex flex-col items-center gap-3 md:gap-4 w-full">
              <ButtonLink href="/lowongan" variant="cream" size="lg">
                Lihat lowongan <Icon name="arrow_right" size={18} stroke={2.4} />
              </ButtonLink>
              <div
                className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-semibold tracking-[0.1em] uppercase font-mono"
                style={{
                  color: "var(--pg-cream)",
                  opacity: 0.92,
                  textShadow: "0 1px 4px rgba(0,0,0,0.22)",
                }}
              >
                <span>Gratis di awal</span>
                <span>·</span>
                <span>Tanpa calo</span>
                <span>·</span>
                <span>Izin bisa dicek</span>
              </div>
            </div>
          </div>
        </section>

        {/* BEAT 2 — INI APA + AJAKAN */}
        <Section tone="white" size="lg" border="bottom">
          <div className="flex flex-col gap-6">
            <SectionHeader
              eyebrow="Bareng yang lain"
              title="Banyak yang udah berangkat. Sekarang giliranmu."
              intro="Perantau Global itu aplikasi resmi buat kerja ke luar negeri. Dua hal yang kamu dapat di sini:"
            />
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="flex items-start gap-3 p-4 md:p-5 flex-1 rounded-2xl bg-pg-paper border border-pg-ink-100">
                <div className="w-8 h-8 rounded-[10px] grid place-items-center shrink-0 bg-pg-red-50">
                  <Icon name="briefcase" size={16} stroke={2.2} className="text-pg-red-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[15px] font-extrabold text-pg-ink-900">1. Lowongan resmi</div>
                  <div className="text-[13px] font-medium leading-snug text-pg-ink-500">
                    Kerjaan beneran di Saudi, Jepang, Taiwan. Gaji &amp; syarat jelas di depan.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 md:p-5 flex-1 rounded-2xl bg-pg-paper border border-pg-ink-100">
                <div className="w-8 h-8 rounded-[10px] grid place-items-center shrink-0 bg-pg-gold-100 text-pg-gold-700">
                  <Icon name="passport" size={16} stroke={2.2} />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[15px] font-extrabold text-pg-ink-900">2. Bekal siap kerja</div>
                  <div className="text-[13px] font-medium leading-snug text-pg-ink-500">
                    Persiapan biar kamu lebih cepat diterima employer. Boleh diambil, bukan kewajiban.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* BEAT 4 — KENAPA BISA DIPERCAYA (lineage, akurasi) */}
        <Section size="lg">
          <div
            className="rounded-3xl p-6 md:p-10 bg-white border border-pg-ink-200 flex flex-col md:flex-row md:items-center gap-6 md:gap-10"
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            <div className="flex flex-col gap-2.5 md:flex-1">
              <Eyebrow>Kenapa bisa dipercaya</Eyebrow>
              <h2 className="text-[22px] md:text-[32px] font-extrabold tracking-[-0.02em] leading-[1.15] text-pg-ink-900">
                Perusahaan baru. Tapi nggak mulai dari nol.
              </h2>
              <p className="text-[13.5px] md:text-[15px] font-medium leading-relaxed text-pg-ink-500">
                PT Daya Talenta Global resmi berdiri{" "}
                <b className="text-pg-ink-900">Oktober 2024</b> sebagai perusahaan penempatan
                kerja luar negeri. Kami bagian dari{" "}
                <b className="text-pg-ink-900">DayaLima</b> — perusahaan Indonesia yang sudah
                jalan di bidang rekrutmen sejak{" "}
                <b className="text-pg-ink-900">1998</b>. Jadi walaupun nama Perantau Global
                baru, tim &amp; sistem kami punya pengalaman puluhan tahun ngurus orang yang
                lagi cari kerja.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:w-[300px] shrink-0">
              <div className="rounded-2xl p-4 bg-pg-paper border border-pg-ink-200 flex flex-col gap-2">
                <div className="text-[9px] font-semibold tracking-[0.18em] uppercase text-pg-ink-400 font-mono">
                  Izin Resmi P3MI
                </div>
                <div className="text-[17px] font-bold text-pg-ink-900 font-mono">
                  No. 1810240237512001
                </div>
                <a
                  href="https://sipptki.kemnaker.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 mt-1 px-4 py-3 rounded-xl no-underline bg-pg-red-50"
                >
                  <span className="text-[11.5px] font-semibold text-pg-red-600 font-mono">
                    Cek di sipptki.kemnaker.go.id
                  </span>
                  <Icon name="arrow_right" size={14} className="text-pg-red-600" />
                </a>
              </div>
            </div>
          </div>
        </Section>

        {/* BEAT 5 — PILIH NEGARA TUJUAN */}
        <Section tone="white" size="lg" border="both">
          <div className="flex flex-col gap-7">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <SectionHeader
                eyebrow="Pilih negara tujuan"
                title="Jadi, mau mulai dari negara mana?"
                intro="Pilih negaranya dulu. Posisi, gaji & syarat lengkap ada di halaman lowongannya."
              />
              <ButtonLink href="/lowongan" variant="ghost" size="sm">
                Lihat semua {POSITIONS.length} lowongan{" "}
                <Icon name="arrow_right" size={14} />
              </ButtonLink>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {COUNTRIES.map((c) => {
                const count = POSITIONS.filter((p) => p.country === c.name).length;
                return (
                  <Link
                    key={c.name}
                    href={`/lowongan?country=${encodeURIComponent(c.name)}`}
                    className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-pg-ink-100 no-underline transition-transform hover:-translate-y-0.5"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="relative h-44 md:h-52">
                      <Image
                        src={c.img}
                        alt={c.name}
                        fill
                        sizes="(min-width:1024px) 25vw, 50vw"
                        className="object-cover"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.34) 45%, rgba(0,0,0,0.72) 100%)",
                        }}
                      />
                      <span
                        className="absolute left-3 top-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.12em] uppercase text-white font-mono"
                        style={{
                          background: "rgba(0,0,0,0.4)",
                          border: "1px solid var(--pg-overlay-white-strong)",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <span className="text-[12px] leading-none">{c.flag}</span>
                        {c.short}
                      </span>
                      <div className="absolute left-4 bottom-3 text-[28px] md:text-[36px] font-extrabold leading-[1.05] tracking-[-0.02em] text-white">
                        {c.name}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] md:text-[15px] font-bold text-pg-ink-900">
                          Lihat lowongan
                        </span>
                        <span className="text-[11.5px] font-medium text-pg-ink-500 font-mono">
                          {count} lowongan aktif
                        </span>
                      </div>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pg-ink-900 shrink-0 transition-transform group-hover:translate-x-0.5">
                        <Icon name="arrow_right" size={14} className="text-white" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </Section>

        {/* BEAT 6 — FAQ */}
        <Section size="lg">
          <div className="flex flex-col gap-4">
            <SectionHeader
              eyebrow="Masih ragu?"
              title="Pertanyaan yang sering ditanya."
            />
            <div className="md:grid md:grid-cols-2 md:gap-x-8">
              {FAQS.map((f, i) => (
                <div
                  key={f.q}
                  className={`flex flex-col gap-1 py-4 ${
                    i === FAQS.length - 1 ? "" : "border-b border-pg-ink-100"
                  } md:border-b`}
                >
                  <div className="text-[15px] font-extrabold text-pg-ink-900">{f.q}</div>
                  <div className="text-[13px] font-medium leading-relaxed text-pg-ink-500">
                    {f.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* BEAT 7 — FINAL CTA (red bookend, using shared primitive) */}
        <FinalCTA
          eyebrow="Siap mulai?"
          title={
            <>
              Perjalananmu ke luar negeri mulai dari{" "}
              <span style={{ color: "var(--pg-gold-200)" }}>satu langkah kecil.</span>
            </>
          }
          body="Lihat lowongan dulu, atau ngobrol sama orang kami. Gratis, tanpa komitmen."
          primaryHref="/lowongan"
          primaryLabel="Lihat lowongan"
          whatsappHref={waLink("Halo, saya mau tanya soal kerja luar negeri.")}
          microcopy={
            <>
              <span>Gratis</span>
              <span>Tanpa bayar di awal</span>
              <span>Tanpa calo</span>
            </>
          }
        />
      </main>
      <WhatsAppFab />
    </>
  );
}
