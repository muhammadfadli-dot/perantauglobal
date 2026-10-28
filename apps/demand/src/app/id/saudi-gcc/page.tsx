import type { Metadata } from "next";
import Image from "next/image";
import { Nav } from "@/components/sections/Nav";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Rekrut Barista dan Perawat Indonesia untuk Saudi Arabia",
  description: "Solusi rekrutmen bagi perusahaan Saudi Arabia dan GCC untuk merekrut Barista dan Perawat Indonesia, dari kebutuhan tenaga kerja, seleksi kandidat, dokumen, mobilisasi, hingga aftercare.",
  keywords: [
    "rekrut barista Indonesia Saudi Arabia",
    "rekrut perawat Indonesia Saudi Arabia",
    "penempatan tenaga kerja Indonesia Saudi Arabia",
    "rekrutmen tenaga kerja Indonesia GCC",
    "barista Indonesia untuk kafe Saudi Arabia",
    "perawat Indonesia untuk rumah sakit Saudi Arabia",
    "tenaga manufaktur Indonesia Saudi Arabia",
    "operator produksi Indonesia Saudi Arabia",
    "solusi rekrutmen perusahaan Saudi Arabia",
    "penyedia tenaga kerja Indonesia untuk perusahaan",
  ],
  alternates: {
    canonical: "/id/saudi-gcc",
    languages: { en: "/en/saudi-gcc", id: "/id/saudi-gcc", ar: "/ar/saudi-gcc" },
  },
  openGraph: {
    title: "Rekrut Talenta Indonesia untuk Saudi Arabia & GCC | DTG",
    description: "Jalur rekrutmen yang jelas bagi employer Saudi Arabia dan GCC untuk merekrut talenta Indonesia.",
    url: "/id/saudi-gcc",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rekrut Talenta Indonesia untuk Saudi Arabia & GCC | DTG",
    description: "Jalur rekrutmen yang jelas bagi employer Saudi Arabia dan GCC untuk merekrut talenta Indonesia.",
  },
};

const sectors = [
  {
    title: "Kesehatan & perawatan",
    text: "Untuk rumah sakit, klinik, dan fasilitas perawatan yang membutuhkan Perawat Indonesia sesuai tanggung jawab peran dan konteks tempat kerja.",
    roles: ["Perawat terdaftar", "Caregiver dan asisten perawat", "Tenaga kesehatan pendukung"],
    image: "/images/sector-healthcare.jpg",
    alt: "Perawat Indonesia meninjau catatan pasien di rumah sakit modern",
    keyword: "Rekrut Perawat Indonesia untuk Saudi Arabia",
  },
  {
    title: "Hospitality & kafe",
    text: "Untuk hotel, restoran, dan jaringan kafe yang membutuhkan Barista Indonesia serta layanan food and beverage sesuai kebutuhan operasional.",
    roles: ["Barista Indonesia", "Layanan food and beverage", "Tim housekeeping hotel"],
    image: "/images/sector-hospitality.jpg",
    alt: "Barista Indonesia menyiapkan kopi di kafe hotel",
    keyword: "Rekrut Barista Indonesia untuk Saudi Arabia",
  },
  {
    title: "Manufaktur",
    text: "Untuk perusahaan manufaktur dan operasional yang membutuhkan tenaga produksi Indonesia berdasarkan kebutuhan peran, keselamatan kerja, dan konteks fasilitas.",
    roles: ["Operator produksi", "Dukungan teknis", "Quality control dan maintenance"],
    image: "/images/sector-manufacturing-v2.png",
    alt: "Profesional manufaktur Indonesia berkolaborasi di lini produksi modern",
    keyword: "Rekrut tenaga manufaktur Indonesia untuk Saudi Arabia",
  },
];

const process = [
  ["Memahami kebutuhan", "Menyelaraskan peran, konteks tempat kerja, jumlah kebutuhan, target waktu, serta kriteria penting dari employer."],
  ["Meninjau kesesuaian dan kesiapan", "Meninjau pengalaman relevan, kesiapan kerja, serta bahasa atau persiapan yang dibutuhkan sesuai peran."],
  ["Mengoordinasikan jalur terdokumentasi", "Menjelaskan dokumen, tanggung jawab, dan langkah mobilisasi bersama pihak yang terkait sebelum proses berjalan."],
  ["Dukungan setelah bergabung", "Mengatur komunikasi dan dukungan sesuai cakupan serta ketentuan tertulis yang telah disepakati."],
];

const faqs = [
  ["Apakah DTG dapat menyediakan Barista Indonesia?", "Pembahasan dimulai dari kebutuhan employer untuk kafe atau hotel, persyaratan peran, pengalaman kandidat, dan kesiapan kerja sebelum profil disampaikan."],
  ["Apakah DTG dapat mendukung kebutuhan Perawat di Saudi Arabia?", "Kebutuhan rumah sakit atau fasilitas ditinjau berdasarkan konteks kerja, persyaratan peran, dan jalur terdokumentasi yang relevan sebelum cakupan dukungan disepakati."],
  ["Apakah jumlah kandidat tersedia dipublikasikan secara tetap?", "DTG tidak menampilkan angka yang belum terverifikasi. Kesesuaian, ketersediaan, dan kesiapan dikonfirmasi berdasarkan kebutuhan employer yang aktual."],
  ["Apa yang termasuk dalam perlindungan enam bulan?", "Perlindungan tertulis, proses dukungan atau pemulihan, serta syarat yang berlaku ditentukan dalam perjanjian penempatan yang relevan."],
];

const indonesiaSeoJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "Rekrut Talenta Indonesia untuk Saudi Arabia dan GCC",
      description: "Solusi rekrutmen bagi perusahaan Saudi Arabia dan GCC untuk merekrut Barista, Perawat, dan tenaga manufaktur Indonesia, dari kebutuhan tenaga kerja hingga dukungan setelah kandidat bergabung.",
      url: `https://${SITE.domain}/id/saudi-gcc`,
      serviceType: "Solusi rekrutmen internasional untuk perusahaan",
      areaServed: [{ "@type": "Country", name: "Saudi Arabia" }, { "@type": "Place", name: "Gulf Cooperation Council" }],
      availableLanguage: ["id", "en", "ar"],
      provider: { "@type": "Organization", name: SITE.legalName, url: `https://${SITE.domain}` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: `https://${SITE.domain}/` },
        { "@type": "ListItem", position: 2, name: "Saudi Arabia & GCC", item: `https://${SITE.domain}/id/saudi-gcc` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
    },
  ],
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="gcc-ar-label"><span />{children}</div>;
}

export default function SaudiGccIndonesianPage() {
  return (
    <div className="gcc-page gcc-ar-page gcc-id-page" lang="id">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(indonesiaSeoJsonLd) }} />
      <Nav market="gcc" initialLocale="id" />
      <main>
        <header id="top" className="gcc-ar-hero">
          <Image src="/images/hero-arches.jpg" alt="Profesional Indonesia dalam konteks kerja di Saudi Arabia dan GCC" fill priority sizes="100vw" style={{ objectFit: "cover" }} />
          <div className="gcc-ar-hero-overlay" />
          <div className="gcc-ar-shell gcc-ar-hero-content">
            <p className="gcc-ar-kicker">MITRA TALENTA INDONESIA BERLISENSI · SAUDI ARABIA & GCC</p>
            <h1>Rekrut talenta Indonesia dengan percaya diri.<br /><em>Perlindungan tertulis selama 6 bulan.</em></h1>
            <p className="gcc-ar-lede">DTG mendukung employer di Saudi Arabia dan GCC, dari kebutuhan tenaga kerja dan seleksi kandidat hingga dokumen, mobilisasi, dan aftercare setelah kandidat bergabung.</p>
            <div className="gcc-ar-actions"><a className="gcc-ar-primary" href="#contact">Diskusikan kebutuhan tenaga kerja</a><a className="gcc-ar-secondary" href="#sectors">Lihat sektor talenta</a></div>
            <a className="gcc-ar-guarantee-link" href="#guarantee">Perlindungan tertulis enam bulan setelah kandidat bergabung</a>
          </div>
        </header>

        <section className="gcc-ar-trust" aria-label="Kredensial DTG">
          <div className="gcc-ar-shell gcc-ar-trust-grid">
            <div><b>Disetujui Saudi MOFA</b><small>REG. NO. 321</small></div>
            <div><b>P3MI berlisensi</b><small>1810240237512001</small></div>
            <div><b>Bagian dari Dayalima Group</b><small>26+ tahun di human capital</small></div>
            <div><b>Perlindungan tertulis</b><small>6 bulan setelah bergabung</small></div>
          </div>
        </section>

        <section id="why" className="gcc-ar-section gcc-ar-paper"><div className="gcc-ar-shell gcc-ar-two-column"><div><SectionLabel>MENGAPA DTG</SectionLabel><h2>Keputusan rekrutmen yang lebih jelas,<br /><em>dengan jalur yang bertanggung jawab.</em></h2></div><div className="gcc-ar-copy"><p>DTG membantu perusahaan Saudi Arabia menyelaraskan kebutuhan tenaga kerja dengan pengalaman relevan, kesiapan kerja, serta jalur penempatan yang sesuai. Pembahasan dimulai dari pekerjaan yang dibutuhkan, bukan dari daftar kandidat umum.</p><p>Solusi rekrutmen perusahaan mencakup penjelasan persyaratan peran, peninjauan kandidat, serta koordinasi dokumen dan mobilisasi dalam batas tanggung jawab yang disepakati.</p></div></div></section>

        <section id="sectors" className="gcc-ar-section gcc-ar-offwhite"><div className="gcc-ar-shell"><SectionLabel>SEKTOR</SectionLabel><div className="gcc-ar-section-intro"><h2>Sektor yang relevan untuk Saudi Arabia dan GCC.</h2><p>Penyediaan Barista Indonesia untuk kafe, Perawat Indonesia untuk rumah sakit, dan tenaga manufaktur dimulai dari pemahaman peran, konteks kerja, dan kebutuhan employer.</p></div><div className="gcc-ar-sector-grid">{sectors.map((sector) => <article className="gcc-ar-sector-card" key={sector.title}><div className="gcc-ar-image"><Image src={sector.image} alt={sector.alt} fill sizes="(max-width: 800px) 100vw, 50vw" style={{ objectFit: "cover" }} /></div><div className="gcc-ar-card-body"><p className="gcc-ar-keyword">{sector.keyword}</p><h3>{sector.title}</h3><p>{sector.text}</p><ul>{sector.roles.map((role) => <li key={role}>{role}</li>)}</ul><a href="#contact">Diskusikan kebutuhan sektor ini</a></div></article>)}</div></div></section>

        <section id="process" className="gcc-ar-section gcc-ar-paper"><div className="gcc-ar-shell"><SectionLabel>JALUR REKRUTMEN</SectionLabel><div className="gcc-ar-section-intro"><h2>Perjalanan yang jelas dari kebutuhan hingga dukungan.</h2><p>Penempatan tenaga kerja Indonesia untuk perusahaan dibahas berdasarkan peran, dokumen yang diperlukan, dan tanggung jawab yang terdokumentasi.</p></div><ol className="gcc-ar-process">{process.map(([title, body], index) => <li key={title}><b>{String(index + 1).padStart(2, "0")}</b><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></div></section>

        <section id="guarantee" className="gcc-ar-section gcc-ar-guarantee"><div className="gcc-ar-shell gcc-ar-guarantee-card"><SectionLabel>PERLINDUNGAN TERTULIS</SectionLabel><h2>Enam bulan.<br /><em>Terdokumentasi secara tertulis.</em></h2><p>Employer memperoleh perlindungan tertulis selama enam bulan setelah kandidat bergabung. Syarat yang berlaku serta proses dukungan atau pemulihan dijelaskan dalam perjanjian penempatan.</p><div className="gcc-ar-pills"><span>Syarat ada dalam perjanjian</span><span>Proses dukungan terdokumentasi</span><span>Selama periode yang disepakati</span></div></div></section>

        <section id="credentials" className="gcc-ar-section gcc-ar-offwhite"><div className="gcc-ar-shell"><SectionLabel>KREDENSIAL & REKAM JEJAK</SectionLabel><h2>Bukti yang dapat dirujuk.</h2><div className="gcc-ar-credentials"><div><small>AGEN DISETUJUI SAUDI MOFA</small><b>REG. 321</b><p>Terdaftar pada otoritas Saudi Arabia.</p></div><div><small>P3MI BERLISENSI DI INDONESIA</small><b>1810240237512001</b><p>Berwenang menempatkan pekerja ke luar negeri.</p></div><div><small>BAGIAN DARI DAYALIMA GROUP</small><b>26+ TAHUN</b><p>Pengalaman di human capital dan konsultasi.</p></div></div></div></section>

        <section id="faq" className="gcc-ar-section gcc-ar-paper"><div className="gcc-ar-shell gcc-ar-faq-layout"><div><SectionLabel>PERTANYAAN MARKET</SectionLabel><h2>Jawaban jelas sebelum langkah berikutnya.</h2></div><div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></section>

        <section id="contact" className="gcc-ar-contact"><div className="gcc-ar-shell"><SectionLabel>MULAI PERCAKAPAN</SectionLabel><h2>Sampaikan kebutuhan tenaga kerja Anda.</h2><p>Sertakan peran, jumlah kebutuhan, konteks tempat kerja, dan target waktu. Tim DTG akan menghubungi Anda untuk membahas langkah yang sesuai.</p><a className="gcc-ar-primary" href="https://wa.me/6285110555561?text=Halo%20DTG%2C%20saya%20ingin%20mendiskusikan%20kebutuhan%20tenaga%20kerja%20untuk%20Saudi%20Arabia%20dan%20GCC." target="_blank" rel="noreferrer">Hubungi lewat WhatsApp</a></div></section>
      </main>
      <footer className="gcc-ar-footer"><div className="gcc-ar-shell">DTG · Mitra talenta Indonesia · Bagian dari Dayalima Group</div></footer>
    </div>
  );
}
