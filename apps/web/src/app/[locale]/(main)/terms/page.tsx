import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { PageHero, Section } from "@/components/pg/primitives";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — Perantau Global",
  description:
    "Syarat & Ketentuan penggunaan platform Perantau Global (PT Daya Talenta Global). Hak, kewajiban, dan aturan main untuk kandidat, mitra, dan employer yang menggunakan layanan kami.",
};

export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ locale: "id" }];
}

const LAST_UPDATED = "28 Mei 2026";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return (
    <main>
      <PageHero
        eyebrow="Legal"
        title="Syarat & Ketentuan"
        lede="Aturan penggunaan platform Perantau Global. Dengan mendaftar atau melamar lewat platform ini, kamu menyetujui Syarat & Ketentuan di bawah ini."
      />

      <Section size="md">
        <div className="prose-pg max-w-3xl text-pg-ink-700 text-[15px] md:text-[16px] leading-relaxed space-y-10">
          <p className="text-[13px] text-pg-ink-500 font-mono uppercase tracking-[0.12em]">
            Berlaku sejak {LAST_UPDATED}
          </p>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              1. Definisi
            </h2>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>&ldquo;Perantau Global&rdquo;</strong> / <strong>&ldquo;kami&rdquo;</strong> — PT Daya Talenta Global, P3MI berlisensi Kemnaker (Izin No. 1810240237512001), bagian dari Dayalima Group.</li>
              <li><strong>&ldquo;Platform&rdquo;</strong> — situs perantauglobal.com beserta portal kandidat di app.perantauglobal.com.</li>
              <li><strong>&ldquo;Kandidat&rdquo;</strong> / <strong>&ldquo;kamu&rdquo;</strong> — pengguna individual yang mendaftar atau melamar lowongan melalui Platform.</li>
              <li><strong>&ldquo;Employer&rdquo;</strong> — perusahaan di luar negeri yang membuka lowongan dan bermitra dengan Perantau Global untuk perekrutan.</li>
              <li><strong>&ldquo;Penempatan&rdquo;</strong> — proses lengkap dari pendaftaran sampai kandidat berangkat dan mulai bekerja di negara tujuan.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              2. Layanan
            </h2>
            <p>
              Perantau Global adalah perusahaan penempatan Pekerja Migran Indonesia (PMI) resmi yang menghubungkan
              kandidat WNI dengan lowongan kerja di luar negeri (Jepang, Saudi Arabia, Taiwan, dan negara lain
              yang kami buka). Layanan kami meliputi: rekrutmen, seleksi, pendampingan dokumen, fasilitasi
              pelatihan & sertifikasi (mis. SSW, JLPT, sertifikat caregiver), pemberangkatan, dan after-care
              selama masa kontrak.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              3. Eligibilitas
            </h2>
            <p>Untuk mendaftar sebagai Kandidat, kamu harus:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Warga Negara Indonesia (WNI) dengan KTP elektronik yang sah.</li>
              <li>Berusia minimal 18 tahun (atau sesuai persyaratan usia per posisi).</li>
              <li>Sehat jasmani & rohani — siap menjalani Medical Check-Up (MCU/GAMCA).</li>
              <li>Memenuhi syarat khusus posisi yang dilamar (sertifikat, pengalaman, fisik, bahasa).</li>
              <li>Tidak sedang terikat kontrak kerja luar negeri lain yang masih aktif.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              4. Akun & Tanggung Jawab Kamu
            </h2>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Kamu wajib memberikan data yang <strong>benar, akurat, dan terkini</strong>. Pemalsuan data dapat berakibat pembatalan lamaran tanpa pengembalian biaya.</li>
              <li>Kamu bertanggung jawab menjaga kerahasiaan akun (magic link, OTP). Jangan bagikan kode OTP ke siapapun, termasuk yang mengaku &ldquo;dari Perantau Global&rdquo;.</li>
              <li>Kamu wajib merespons komunikasi recruiter dalam waktu wajar (umumnya 3×24 jam) selama proses berjalan.</li>
              <li>Dokumen yang kamu unggah (KTP, paspor, ijazah, dll.) harus asli atau salinan sah — bukan hasil editing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              5. Proses Pendaftaran & Penempatan
            </h2>
            <p>Proses standar Perantau Global:</p>
            <ol className="list-decimal pl-6 mt-3 space-y-2">
              <li><strong>Pendaftaran</strong> — kamu mengisi form lowongan dan menjawab pertanyaan kualifikasi.</li>
              <li><strong>Seleksi awal</strong> — tim kami memeriksa kelayakan kamu berdasar persyaratan posisi.</li>
              <li><strong>Wawancara</strong> — wawancara internal kami dan/atau dengan calon employer.</li>
              <li><strong>Dokumen & medical</strong> — kamu melengkapi dokumen wajib, menjalani MCU, dan mengikuti pelatihan/sertifikasi bila diperlukan.</li>
              <li><strong>Offering letter</strong> — bila employer menerima kamu, terbit offering letter dari mereka.</li>
              <li><strong>Visa & keberangkatan</strong> — kami fasilitasi pengurusan visa, tiket, dan persiapan terakhir sebelum kamu berangkat.</li>
              <li><strong>After-care</strong> — kami tetap menjadi titik kontak selama masa kontrakmu di luar negeri.</li>
            </ol>
            <p className="mt-3">
              Lama setiap tahapan berbeda per posisi dan negara — recruiter akan memberi estimasi yang realistis.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              6. Biaya & Pembayaran
            </h2>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Daftar = gratis.</strong> Tidak ada biaya untuk mendaftar atau melamar lewat Platform.</li>
              <li><strong>Biaya proses muncul setelah employer menerima kamu</strong> (terbit offering letter). Biaya ini mencakup MCU, visa, sertifikat resmi, dan komponen lain yang diatur regulasi.</li>
              <li>Rincian biaya per posisi tertera di halaman lowongan masing-masing dan dijelaskan ulang oleh recruiter sebelum kamu memutuskan lanjut.</li>
              <li><strong>Dana talang</strong> tersedia untuk beberapa posisi — recruiter akan menjelaskan skema dan ketentuan pengembalian dana talang dari gaji.</li>
              <li><strong>Kami tidak akan pernah</strong> meminta uang lewat rekening pribadi karyawan. Semua pembayaran resmi via rekening perusahaan terdaftar dengan kuitansi.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              7. Kekayaan Intelektual
            </h2>
            <p>
              Semua konten di Platform (logo, teks, foto, ilustrasi, kode) adalah milik Perantau Global atau
              digunakan dengan lisensi yang sah. Kamu tidak boleh mengambil, mendistribusikan, atau
              memodifikasi konten kami untuk keperluan komersial tanpa izin tertulis.
            </p>
            <p className="mt-3">
              Konten yang kamu unggah (CV, foto, dokumen) tetap milik kamu, tapi kamu memberi Perantau Global
              lisensi terbatas untuk memproses dan membagikannya ke employer & regulator sebagai bagian dari
              proses penempatan.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              8. Larangan Penggunaan
            </h2>
            <p>Kamu tidak boleh:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Memalsukan identitas atau dokumen.</li>
              <li>Mendaftar atas nama orang lain tanpa kuasa yang sah.</li>
              <li>Mengirim spam, malware, atau melakukan scraping massal terhadap Platform.</li>
              <li>Menyebarkan informasi yang merugikan kandidat lain atau mengganggu proses rekrutmen.</li>
              <li>Menggunakan Platform untuk tujuan selain mencari kerja luar negeri yang sah.</li>
            </ul>
            <p className="mt-3">
              Pelanggaran dapat berakibat penghentian akses, pembatalan lamaran, atau tindakan hukum.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              9. Pemutusan
            </h2>
            <p>
              Kamu boleh menghentikan partisipasi kapan saja sebelum penandatanganan kontrak kerja, dengan
              memberi tahu recruiter kamu. Setelah kontrak kerja ditandatangani, ketentuan kontrak yang
              berlaku.
            </p>
            <p className="mt-3">
              Perantau Global berhak menghentikan layanan kepada kandidat yang melanggar Syarat & Ketentuan
              ini atau gagal memenuhi persyaratan posisi setelah dievaluasi secara wajar.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              10. Disclaimers & Batasan Tanggung Jawab
            </h2>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Perantau Global memfasilitasi proses perekrutan, tapi keputusan akhir penerimaan ada di tangan employer.</li>
              <li>Kami tidak menjamin durasi proses tertentu — proses dapat dipengaruhi oleh kebijakan negara tujuan, ketersediaan slot, dan kondisi kandidat.</li>
              <li>Untuk informasi yang berasal dari pihak ketiga (mis. ketentuan kerja yang diberi employer), kami berupaya menyajikan dengan akurat tapi bisa terjadi perubahan dari pihak employer di luar kendali kami.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              11. Hukum yang Berlaku
            </h2>
            <p>
              Syarat & Ketentuan ini tunduk pada hukum Republik Indonesia, khususnya UU No. 18 Tahun 2017
              tentang Pelindungan Pekerja Migran Indonesia, UU No. 27 Tahun 2022 tentang Pelindungan Data
              Pribadi, dan peraturan turunannya. Perselisihan diselesaikan secara musyawarah; bila tidak
              tercapai, melalui pengadilan di Jakarta.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              12. Perubahan Syarat
            </h2>
            <p>
              Kami dapat memperbarui Syarat & Ketentuan ini. Perubahan material akan diumumkan di halaman ini
              dengan tanggal &ldquo;Berlaku sejak&rdquo; baru. Penggunaan Platform setelah pembaruan dianggap sebagai
              persetujuan terhadap versi terbaru.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              13. Kontak
            </h2>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Email: <a href="mailto:halo@perantauglobal.com" className="text-pg-red-600 font-bold no-underline hover:underline">halo@perantauglobal.com</a></li>
              <li>WhatsApp: <a href="https://wa.me/6285211415104" className="text-pg-red-600 font-bold no-underline hover:underline">0852-1141-5104</a></li>
              <li>Alamat: PT Daya Talenta Global, Jakarta, Indonesia</li>
            </ul>
          </section>

          <hr className="border-pg-ink-100" />

          <p className="text-[14px] text-pg-ink-500">
            Untuk pengelolaan data pribadi, lihat{" "}
            <Link href="/privacy" className="text-pg-red-600 font-bold no-underline hover:underline">
              Kebijakan Privasi
            </Link>.
          </p>
        </div>
      </Section>
    </main>
  );
}
