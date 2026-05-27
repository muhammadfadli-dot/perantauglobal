import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { PageHero, Section } from "@/components/pg/primitives";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Perantau Global",
  description:
    "Kebijakan Privasi PT Daya Talenta Global (Perantau Global). Bagaimana kami mengumpulkan, menggunakan, melindungi, dan membagikan data pribadi kamu — sesuai UU 27/2022 tentang Pelindungan Data Pribadi.",
};

export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ locale: "id" }];
}

const LAST_UPDATED = "28 Mei 2026";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return (
    <main>
      <PageHero
        eyebrow="Legal"
        title="Kebijakan Privasi"
        lede="Perantau Global menjaga data pribadi kamu dengan serius. Halaman ini menjelaskan dengan jelas data apa yang kami kumpulkan, untuk apa, siapa yang melihat, dan apa hak kamu — sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi."
      />

      <Section size="md">
        <div className="prose-pg max-w-3xl text-pg-ink-700 text-[15px] md:text-[16px] leading-relaxed space-y-10">
          <p className="text-[13px] text-pg-ink-500 font-mono uppercase tracking-[0.12em]">
            Berlaku sejak {LAST_UPDATED}
          </p>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              1. Pengendali Data
            </h2>
            <p>
              Data pribadi kamu dikendalikan oleh <strong>PT Daya Talenta Global</strong> (selanjutnya
              disebut <em>&ldquo;Perantau Global&rdquo;</em>, <em>&ldquo;kami&rdquo;</em>), berkedudukan di Jakarta,
              Indonesia. Perantau Global adalah P3MI resmi Kemnaker (Izin No. 1810240237512001), bagian dari
              DayaLima Group.
            </p>
            <p className="mt-3">
              Pertanyaan tentang data kamu bisa dikirim ke <a href="mailto:halo@perantauglobal.com" className="text-pg-red-600 font-bold no-underline hover:underline">halo@perantauglobal.com</a> atau WhatsApp{" "}
              <a href="https://wa.me/6285211415104" className="text-pg-red-600 font-bold no-underline hover:underline">0852-1141-5104</a>.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              2. Data yang Kami Kumpulkan
            </h2>
            <p>Kami mengumpulkan data dari kamu langsung ketika kamu daftar, melamar lowongan, atau menghubungi kami:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Identitas dasar</strong>: nama lengkap, tanggal lahir, jenis kelamin, nomor HP, email.</li>
              <li><strong>Data profil pekerja</strong>: pendidikan terakhir, pengalaman kerja, sertifikat (JLPT, SIM, sertifikasi caregiver, dll.), kemampuan bahasa, kondisi fisik (tinggi & berat badan untuk posisi yang memerlukan).</li>
              <li><strong>Dokumen identitas & legal</strong>: KTP, paspor, ijazah, sertifikat pelatihan, foto, CV — diunggah oleh kamu saat melengkapi lamaran.</li>
              <li><strong>Jawaban kualifikasi posisi</strong>: jawaban atas pertanyaan spesifik per lowongan (misalnya pengalaman caregiving, level bahasa Jepang, status ex-magang).</li>
              <li><strong>Data teknis</strong>: alamat IP, tipe perangkat, browser, dan log aktivitas situs untuk keperluan keamanan dan peningkatan layanan.</li>
              <li><strong>Cookie & teknologi pelacakan</strong>: lihat bagian 8.</li>
            </ul>
            <p className="mt-3 text-[14px] text-pg-ink-600">
              Kami tidak meminta data sensitif yang tidak relevan untuk proses perekrutan (mis. data kesehatan rinci di luar persyaratan posisi, orientasi politik/seksual, dll.).
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              3. Tujuan Pemrosesan
            </h2>
            <p>Data kamu kami proses untuk tujuan berikut:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Memproses pendaftaran & lamaran kamu untuk posisi kerja luar negeri.</li>
              <li>Menyeleksi kelayakan kamu terhadap persyaratan posisi (sertifikat, pengalaman, fisik, bahasa).</li>
              <li>Menghubungkan kamu dengan calon employer (perusahaan tujuan di Saudi, Jepang, Taiwan, dll.) sebagai bagian dari proses penempatan.</li>
              <li>Memenuhi kewajiban hukum sebagai P3MI — termasuk pelaporan ke BP2MI, Kemnaker, dan kedutaan negara tujuan.</li>
              <li>Memberi update status lamaran via email, WhatsApp, atau telepon.</li>
              <li>Meningkatkan kualitas layanan dan mengukur efektivitas konten/iklan kami.</li>
              <li>Mencegah penyalahgunaan platform dan menjaga keamanan akun.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              4. Dasar Hukum
            </h2>
            <p>Pemrosesan data kamu didasarkan pada (UU 27/2022 Pasal 20):</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Persetujuan kamu</strong> — dengan submit form pendaftaran/lamaran kamu memberikan persetujuan pemrosesan untuk tujuan rekrutmen.</li>
              <li><strong>Pelaksanaan kontrak</strong> — kontrak penempatan kerja yang kamu tandatangani dengan employer (via Perantau Global) memerlukan pemrosesan data.</li>
              <li><strong>Kewajiban hukum</strong> — pelaporan ke regulator (BP2MI, Kemnaker) sebagai P3MI berlisensi.</li>
              <li><strong>Kepentingan sah</strong> — untuk mencegah penipuan, melindungi sistem, dan memperbaiki layanan.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              5. Siapa yang Melihat Data Kamu
            </h2>
            <p>Data kamu kami bagikan hanya kepada pihak berikut, dan hanya seperlunya:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Tim Perantau Global</strong> (recruiter & PIC) — untuk memproses lamaran dan mendampingi kamu.</li>
              <li><strong>Calon employer di luar negeri</strong> — profil pelamar dan dokumen pendukung dibagikan ke perusahaan yang membuka lowongan, hanya setelah kamu lulus seleksi awal.</li>
              <li><strong>Regulator</strong> — BP2MI, Kemnaker, dan otoritas negara tujuan (kedutaan, agensi resmi negara penerima).</li>
              <li><strong>Mitra pelatihan/sertifikasi</strong> — bila kamu mengikuti program pelatihan yang kami fasilitasi (mis. Paspor Perantau Global).</li>
              <li><strong>Penyedia layanan teknologi</strong> — Supabase (database & autentikasi, server di Singapura), Vercel (hosting), Resend/Postmark (email), Twilio (SMS/WhatsApp OTP), Google (analytics & tag manager), Meta/Facebook (iklan & pengukuran konversi).</li>
            </ul>
            <p className="mt-3">
              Kami <strong>tidak menjual</strong> data kamu ke pihak manapun.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              6. Transfer Data ke Luar Negeri
            </h2>
            <p>
              Karena layanan kami menempatkan pekerja ke luar Indonesia, sebagian data kamu akan dikirim ke
              negara tujuan (Saudi Arabia, Jepang, Taiwan, dll.) untuk diproses oleh employer dan otoritas
              setempat. Beberapa penyedia teknologi kami (mis. Supabase, Vercel) juga menyimpan data di
              server regional (Singapura). Transfer dilakukan dengan menjaga prinsip perlindungan setara
              sesuai UU 27/2022.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              7. Lama Penyimpanan
            </h2>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Profil pelamar aktif</strong>: selama akun aktif dan kamu masih bagian dari talent pool kami.</li>
              <li><strong>Lamaran yang berhasil (penempatan kerja)</strong>: minimal 5 tahun setelah kontrak berakhir, untuk keperluan administrasi P3MI dan kemungkinan re-engagement.</li>
              <li><strong>Lamaran yang ditolak / tidak berhasil</strong>: maksimal 2 tahun, kecuali kamu meminta penghapusan lebih cepat.</li>
              <li><strong>Data log teknis</strong>: 90 hari, kecuali ada insiden keamanan yang memerlukan retensi lebih lama.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              8. Cookie & Teknologi Pelacakan
            </h2>
            <p>Situs kami menggunakan cookie dan pelacakan untuk:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Cookie sesi</strong>: menjaga kamu tetap login dan mengingat preferensi.</li>
              <li><strong>Google Analytics & Google Tag Manager</strong>: mengukur traffic dan perilaku pengguna secara agregat.</li>
              <li><strong>Meta Pixel & Conversions API</strong>: mengukur efektivitas iklan di Facebook/Instagram dan menampilkan konten yang relevan.</li>
            </ul>
            <p className="mt-3">
              Kamu bisa menonaktifkan cookie lewat pengaturan browser, tetapi sebagian fitur situs mungkin
              tidak berfungsi optimal.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              9. Hak Kamu (UU 27/2022 Pasal 5–6)
            </h2>
            <p>Sebagai subjek data, kamu berhak untuk:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Mengakses</strong> data pribadi yang kami simpan tentang kamu.</li>
              <li><strong>Memperbaiki</strong> data yang tidak akurat atau usang.</li>
              <li><strong>Menghapus</strong> data kamu (selama tidak bertentangan dengan kewajiban hukum yang masih berjalan, mis. kontrak aktif).</li>
              <li><strong>Menarik persetujuan</strong> kapan saja — perlu kamu tahu bahwa menarik persetujuan setelah lamaran berjalan dapat menghentikan proses penempatan.</li>
              <li><strong>Membatasi pemrosesan</strong> data tertentu.</li>
              <li><strong>Memindahkan data</strong> (portabilitas) dalam format yang umum digunakan.</li>
              <li><strong>Mengajukan keluhan</strong> ke lembaga pengawas perlindungan data di Indonesia.</li>
            </ul>
            <p className="mt-3">
              Untuk menggunakan hak ini, kirim email ke{" "}
              <a href="mailto:halo@perantauglobal.com" className="text-pg-red-600 font-bold no-underline hover:underline">halo@perantauglobal.com</a>{" "}
              dengan subjek <em>&ldquo;Permintaan Hak Subjek Data&rdquo;</em>. Kami akan merespons dalam 14 hari kerja.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              10. Keamanan
            </h2>
            <p>
              Data kamu disimpan di infrastruktur cloud yang ter-enkripsi (TLS in-transit, enkripsi at-rest)
              dan akses dibatasi oleh kontrol berbasis peran. Kami menjaga audit log untuk setiap akses
              admin ke data sensitif. Walaupun kami menerapkan standar industri, tidak ada sistem yang
              sepenuhnya kebal — kami akan memberitahu kamu dalam 3×24 jam jika ada insiden yang berpotensi
              memengaruhi data pribadi kamu (sesuai UU 27/2022 Pasal 46).
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              11. Perubahan Kebijakan
            </h2>
            <p>
              Kebijakan ini dapat diperbarui. Perubahan material akan diumumkan di halaman ini dengan
              tanggal &ldquo;Berlaku sejak&rdquo; yang diperbarui di bagian atas. Versi sebelumnya bisa kamu minta via
              email.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] md:text-[26px] font-extrabold text-pg-ink-900 tracking-tight mb-3">
              12. Kontak
            </h2>
            <p>
              Pertanyaan, keluhan, atau permintaan hak subjek data:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Email: <a href="mailto:halo@perantauglobal.com" className="text-pg-red-600 font-bold no-underline hover:underline">halo@perantauglobal.com</a></li>
              <li>WhatsApp: <a href="https://wa.me/6285211415104" className="text-pg-red-600 font-bold no-underline hover:underline">0852-1141-5104</a></li>
              <li>Alamat: PT Daya Talenta Global, Jakarta, Indonesia</li>
            </ul>
          </section>

          <hr className="border-pg-ink-100" />

          <p className="text-[14px] text-pg-ink-500">
            Untuk syarat penggunaan platform, lihat{" "}
            <Link href="/terms" className="text-pg-red-600 font-bold no-underline hover:underline">
              Syarat &amp; Ketentuan
            </Link>.
          </p>
        </div>
      </Section>
    </main>
  );
}
