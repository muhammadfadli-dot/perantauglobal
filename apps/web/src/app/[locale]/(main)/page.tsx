import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { generateMeta } from "@/lib/seo";
import { Icon } from "@/components/pg/Icon";
import { TrustStrip } from "@/components/pg/TrustStrip";
import { WhatsAppFab } from "@/components/pg/WhatsAppFab";
import { POSITIONS } from "@/lib/positions";
import { waLink } from "@/lib/contact";

export const revalidate = 60;

const GOLD = "#8a5e0a";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  await params;
  return generateMeta({
    title: "Perantau Global — Aplikasi Kerja Luar Negeri Resmi (P3MI)",
    description:
      "Perantau Global (PT Daya Talenta Global) — P3MI berlisensi Kemnaker, bagian dari DayaLima Group (sejak 1998). Lowongan & sertifikasi siap kerja: bebas biaya sebelum offering letter, proses transparan, tanpa calo.",
    locale: "id",
  });
}

const COUNTRIES = [
  { name: "Saudi Arabia", short: "Saudi", flag: "🇸🇦", img: "/images/countries/saudi.jpg" },
  { name: "Jepang", short: "Jepang", flag: "🇯🇵", img: "/images/countries/jepang.jpg" },
  { name: "Taiwan", short: "Taiwan", flag: "🇹🇼", img: "/images/countries/taiwan.jpg" },
  { name: "Indonesia", short: "Indonesia", flag: "🇮🇩", img: "/images/countries/indonesia.jpg" },
];

const TESTIMONIALS = [
  {
    img: "/images/testimonials/sari-perawat-saudi.jpg",
    name: "Sari",
    role: "Perawat",
    country: "Saudi Arabia",
    year: "2025",
    quote:
      "Dari nol, nggak punya paspor. Sekarang kerja perawat di Riyadh. Nggak ada calo, semua jelas 🙏",
  },
  {
    img: "/images/testimonials/budi-driver-jepang.jpg",
    name: "Budi",
    role: "Truck Driver",
    country: "Jepang",
    year: "2025",
    quote:
      "4 bulan dari daftar sampai terbang ke Osaka. Tiap tahap dikabarin PIC. Gaji sesuai kontrak.",
  },
  {
    img: "/images/testimonials/rini-caregiver-taiwan.jpg",
    name: "Rini",
    role: "Caregiver",
    country: "Taiwan",
    year: "2025",
    quote:
      "Awalnya takut ketipu calo. Ternyata semua transparan, bisa dicek sendiri. Sekarang udah di Taipei.",
  },
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

const EYEBROW =
  "text-[11px] md:text-[12px] font-bold tracking-[0.16em] uppercase text-pg-red-600 font-mono";
const H2 = "text-[24px] md:text-[40px] font-extrabold tracking-[-0.02em] leading-[1.1] text-pg-ink-900";
const SHELL = "max-w-6xl mx-auto";

function ArrowRight({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <TrustStrip />
      <main>
        {/* BEAT 1 — HERO (poster editorial, blok merah terintegrasi, 1 CTA) */}
        <section className="relative overflow-hidden" style={{ background: "#c4202a" }}>
          {/* Desktop: poster full-bleed cover behind the copy */}
          <Image
            src="/images/home-hero-poster-v43.jpg"
            alt="Ilustrasi tiga pekerja Indonesia — perawat, teknisi, dan caregiver — siap berangkat kerja ke luar negeri bersama Perantau Global"
            fill
            priority
            sizes="100vw"
            className="hidden md:block object-cover object-bottom select-none"
          />
          <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 md:min-h-[720px] flex flex-col items-center text-center pt-10 md:pt-16">
            <div
              className="text-[10.5px] md:text-[12px] font-bold tracking-[0.18em] uppercase font-mono"
              style={{ color: "#e8c074" }}
            >
              Perantau Global · Aplikasi Resmi P3MI
            </div>
            <h1
              className="mt-4 text-[34px] md:text-[58px] font-extrabold leading-[1.05] tracking-[-0.03em]"
              style={{ color: "#f6efe0" }}
            >
              Siap berangkat{" "}
              <span style={{ color: "#e8c074" }}>kerja ke luar negeri.</span>
            </h1>
            <p
              className="mt-4 max-w-md md:max-w-lg text-[14px] md:text-[17px] font-medium leading-relaxed"
              style={{ color: "rgba(246,239,224,0.86)" }}
            >
              Resmi, jelas, tanpa calo. Izin P3MI-nya bisa kamu cek sendiri — bukan janji calo.
            </p>
            {/* Desktop CTA — pushed down over the figures' torso, clears faces */}
            <div className="hidden md:flex md:mt-auto md:pb-[88px] flex-col items-center gap-4">
              <Link
                href="/lowongan"
                className="inline-flex items-center justify-center gap-2 min-h-[54px] px-7 text-[17px] font-extrabold rounded-2xl no-underline transition-transform hover:-translate-y-0.5"
                style={{ background: "#f6efe0", color: "#c0202a", boxShadow: "0 14px 34px rgba(0,0,0,0.3)" }}
              >
                Lihat lowongan <ArrowRight />
              </Link>
              <div
                className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-semibold tracking-[0.1em] uppercase font-mono"
                style={{ color: "rgba(246,239,224,0.62)" }}
              >
                <span>Gratis di awal</span>
                <span>·</span>
                <span>Tanpa calo</span>
                <span>·</span>
                <span>Izin bisa dicek</span>
              </div>
            </div>
          </div>
          {/* Mobile: poster figure-forward below the copy */}
          <div className="md:hidden mt-7 w-full aspect-[4/5] relative">
            <Image
              src="/images/home-hero-poster-v43.jpg"
              alt="Ilustrasi tiga pekerja Indonesia — perawat, teknisi, dan caregiver — siap berangkat kerja ke luar negeri bersama Perantau Global"
              fill
              priority
              sizes="100vw"
              className="object-cover object-bottom select-none"
            />
          </div>
          {/* Mobile CTA — moved below the poster */}
          <div className="md:hidden relative z-10 px-5 pt-7 pb-11 flex flex-col items-center text-center gap-4">
            <Link
              href="/lowongan"
              className="inline-flex items-center justify-center gap-2 min-h-[54px] px-7 text-[16px] font-extrabold rounded-2xl no-underline transition-transform hover:-translate-y-0.5"
              style={{ background: "#f6efe0", color: "#c0202a", boxShadow: "0 14px 34px rgba(0,0,0,0.3)" }}
            >
              Lihat lowongan <ArrowRight />
            </Link>
            <div
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-semibold tracking-[0.1em] uppercase font-mono"
              style={{ color: "rgba(246,239,224,0.62)" }}
            >
              <span>Gratis di awal</span>
              <span>·</span>
              <span>Tanpa calo</span>
              <span>·</span>
              <span>Izin bisa dicek</span>
            </div>
          </div>
        </section>

        {/* BEAT 2 — INI APA + AJAKAN */}
        <section className="px-5 md:px-8 py-14 md:py-20 bg-white border-b border-pg-ink-100">
          <div className={`${SHELL} flex flex-col gap-6`}>
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className={EYEBROW}>Bareng yang lain</div>
              <h2 className={H2}>Banyak yang udah berangkat. Sekarang giliranmu.</h2>
              <p className="text-[14px] md:text-[16px] font-medium leading-relaxed text-pg-ink-500">
                Perantau Global itu aplikasi resmi buat kerja ke luar negeri. Dua hal yang kamu dapat
                di sini:
              </p>
            </div>
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
                <div
                  className="w-8 h-8 rounded-[10px] grid place-items-center shrink-0"
                  style={{ background: "rgba(201,138,20,0.14)", color: GOLD }}
                >
                  <Icon name="passport" size={16} stroke={2.2} />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[15px] font-extrabold text-pg-ink-900">2. Bekal siap kerja</div>
                  <div className="text-[13px] font-medium leading-snug text-pg-ink-500">
                    Persiapan biar kamu lebih cepat diterima employer. Boleh diambil, bukan
                    kewajiban.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BEAT 3 — ORANG NYATA (gaya komen sosmed) */}
        <section className="px-5 md:px-8 py-14 md:py-20 bg-white border-b border-pg-ink-100">
          <div className="max-w-2xl mx-auto flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 items-center text-center">
              <div className={EYEBROW}>Kata mereka yang udah berangkat</div>
              <h2 className={H2}>Orang biasa, sekarang kerja di luar negeri.</h2>
            </div>
            <div className="flex flex-col gap-3.5">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={t.name}
                  className="bg-white rounded-2xl p-4 md:p-5"
                  style={{
                    border: "1px solid #f0f0ee",
                    boxShadow: "0 6px 22px rgba(20,20,20,0.08)",
                    transform: i % 2 === 0 ? "rotate(-0.5deg)" : "rotate(0.6deg)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Image
                      src={t.img}
                      alt={t.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover w-12 h-12 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14.5px] font-extrabold text-pg-ink-900">
                          {t.name}
                        </span>
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 rounded-full shrink-0"
                          style={{ background: "#0f8a4a" }}
                        >
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      </div>
                      <div className="text-[11.5px] font-medium text-pg-ink-400">
                        {t.role} · {t.country}
                      </div>
                    </div>
                    <span
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono"
                      style={{ background: "#e6f4ec", color: "#0a6e3a" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a6e3a" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      Berangkat {t.year}
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] md:text-[15px] leading-relaxed text-pg-ink-700">
                    {t.quote}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-[11.5px] font-medium italic text-center text-pg-ink-300">
              Komentar contoh — diganti cerita kandidat asli sebelum rilis
            </div>
          </div>
        </section>

        {/* BEAT 4 — KENAPA BISA DIPERCAYA (lineage, akurasi) */}
        <section className="px-5 md:px-8 py-14 md:py-20">
          <div className={SHELL}>
            <div
              className="rounded-3xl p-6 md:p-10 bg-white border border-pg-ink-200 flex flex-col md:flex-row md:items-center gap-6 md:gap-10"
              style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
            >
              <div className="flex flex-col gap-2.5 md:flex-1">
                <div className={EYEBROW}>Kenapa bisa dipercaya</div>
                <h2 className="text-[22px] md:text-[32px] font-extrabold tracking-[-0.02em] leading-[1.15] text-pg-ink-900">
                  Bukan pemain baru. Bagian dari DayaLima Group.
                </h2>
                <p className="text-[13.5px] md:text-[15px] font-medium leading-relaxed text-pg-ink-500">
                  Perantau Global dijalankan PT Daya Talenta Global — unit penempatan kerja luar
                  negeri dari{" "}
                  <b className="text-pg-ink-900">DayaLima Group</b>, grup layanan SDM Indonesia yang
                  sudah berpengalaman <b className="text-pg-ink-900">sejak 1998</b>. Resmi berizin
                  P3MI Kemnaker.
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
                    className="flex items-center justify-between gap-2 mt-1 px-3.5 py-3 rounded-xl no-underline bg-pg-red-50"
                  >
                    <span className="text-[11.5px] font-semibold text-pg-red-600 font-mono">
                      Cek di sipptki.kemnaker.go.id
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d7262f" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                      <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BEAT 5 — PILIH NEGARA TUJUAN */}
        <section className="px-5 md:px-8 py-14 md:py-20 bg-white border-y border-pg-ink-100">
          <div className={`${SHELL} flex flex-col gap-7`}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex flex-col gap-2 max-w-2xl">
                <div className={EYEBROW}>Pilih negara tujuan</div>
                <h2 className={H2}>Jadi, mau mulai dari negara mana?</h2>
                <p className="text-[13.5px] md:text-[15px] font-medium leading-relaxed text-pg-ink-500">
                  Pilih negaranya dulu. Posisi, gaji &amp; syarat lengkap ada di halaman lowongannya.
                </p>
              </div>
              <Link
                href="/lowongan"
                className="self-start inline-flex items-center gap-1.5 px-4 py-3 rounded-full border border-pg-ink-200 bg-pg-paper text-pg-ink-900 font-bold text-sm no-underline hover:bg-pg-ink-50 whitespace-nowrap"
              >
                Lihat semua {POSITIONS.length} lowongan <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {COUNTRIES.map((c) => (
                <Link
                  key={c.name}
                  href={`/lowongan?country=${encodeURIComponent(c.name)}`}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-pg-ink-100 no-underline transition-transform hover:-translate-y-0.5"
                  style={{ boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 8px 24px rgba(20,20,20,0.06)" }}
                >
                  <div className="relative h-44 md:h-52">
                    <Image src={c.img} alt={c.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.34) 45%, rgba(0,0,0,0.72) 100%)",
                      }}
                    />
                    <span
                      className="absolute left-3 top-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.12em] uppercase text-white font-mono"
                      style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}
                    >
                      <span className="text-[12px] leading-none">{c.flag}</span>
                      {c.short}
                    </span>
                    <div className="absolute left-4 bottom-3 text-[24px] md:text-[30px] font-extrabold leading-[1.05] tracking-[-0.02em] text-white">
                      {c.name}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-4">
                    <span className="text-[14px] md:text-[15px] font-bold text-pg-ink-900">
                      Lihat lowongan
                    </span>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pg-ink-900 shrink-0 transition-transform group-hover:translate-x-0.5">
                      <ArrowRight size={14} color="#fff" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* BEAT 6 — KERAGUAN (FAQ) */}
        <section className="px-5 md:px-8 py-14 md:py-20">
          <div className={`${SHELL} flex flex-col gap-4`}>
            <div className="flex flex-col gap-1.5">
              <div className={EYEBROW}>Masih ragu?</div>
              <h2 className={H2}>Pertanyaan yang sering ditanya.</h2>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-x-8">
              {FAQS.map((f, i) => (
                <div
                  key={f.q}
                  className={`flex flex-col gap-1 py-4 ${i === FAQS.length - 1 ? "" : "border-b border-pg-ink-100"} md:border-b`}
                >
                  <div className="text-[15px] font-extrabold text-pg-ink-900">{f.q}</div>
                  <div className="text-[13px] font-medium leading-relaxed text-pg-ink-500">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BEAT 7 — LANGKAHNYA (final CTA, blok merah — bookend hero) */}
        <section className="relative overflow-hidden" style={{ background: "#c4202a" }}>
          <Image
            src="/images/cta/cta-globe-red-v43.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-bottom select-none"
          />
          <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 min-h-[500px] md:min-h-[580px] flex flex-col items-center text-center pt-16 md:pt-24 pb-16 md:pb-24">
            <div
              className="text-[10.5px] md:text-[12px] font-bold tracking-[0.18em] uppercase font-mono"
              style={{ color: "#e8c074" }}
            >
              Siap mulai?
            </div>
            <h2
              className="mt-4 text-[32px] md:text-[54px] font-extrabold tracking-[-0.03em] leading-[1.05]"
              style={{ color: "#f6efe0" }}
            >
              Perjalananmu ke luar negeri mulai dari{" "}
              <span style={{ color: "#e8c074" }}>satu langkah kecil.</span>
            </h2>
            <p
              className="mt-4 max-w-md md:max-w-lg text-[14px] md:text-[17px] font-medium leading-relaxed"
              style={{ color: "rgba(246,239,224,0.86)" }}
            >
              Lihat lowongan dulu, atau ngobrol sama orang kami. Gratis, tanpa komitmen.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-2.5 w-full max-w-md md:max-w-xl">
              <Link
                href="/lowongan"
                className="inline-flex flex-1 items-center justify-center gap-2 min-h-[54px] px-6 text-base font-extrabold rounded-2xl no-underline transition-transform hover:-translate-y-0.5 whitespace-nowrap"
                style={{ background: "#f6efe0", color: "#c0202a", boxShadow: "0 14px 34px rgba(0,0,0,0.3)" }}
              >
                Lihat lowongan <ArrowRight />
              </Link>
              <a
                href={waLink("Halo, saya mau tanya soal kerja luar negeri.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 min-h-[54px] px-6 text-base font-bold rounded-2xl no-underline transition-colors whitespace-nowrap"
                style={{ background: "transparent", color: "#f6efe0", border: "1.5px solid rgba(246,239,224,0.45)" }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#25D366" }} />
                Tanya via WhatsApp
              </a>
            </div>
            <div
              className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-semibold tracking-[0.08em] uppercase font-mono"
              style={{ color: "rgba(246,239,224,0.6)" }}
            >
              <span>Gratis</span>
              <span>Tanpa bayar di awal</span>
              <span>Tanpa calo</span>
            </div>
          </div>
        </section>
      </main>
      <WhatsAppFab />
    </>
  );
}
