import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { generateMeta } from "@/lib/seo";
import { Icon } from "@/components/pg/Icon";
import { ButtonLink } from "@/components/pg/primitives";
import { PositionCard } from "@/components/pg/PositionCard";
import { POSITIONS } from "@/lib/positions";
import { fetchOpenJobOrders, mergePositionsWithJobOrders } from "@/lib/positions-db";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  await params;
  return generateMeta({
    title: "P3MI Resmi — Penempatan Kerja ke Saudi Arabia, Jepang, Taiwan",
    description:
      "Perantau Global (PT Daya Talenta Global) — P3MI resmi sejak 1998. Kami bantu kamu kerja di luar negeri: bebas biaya sebelum terima offering letter, proses transparan, sesuai regulasi.",
    locale: "id",
  });
}

const FAQ_ITEMS = [
  {
    q: "Apakah benar-benar bebas biaya?",
    a: "Iya. Kamu bebas biaya sebelum menerima offering letter dari employer. Setelah diterima, baru muncul biaya keberangkatan untuk dokumen (MCU, apostille, dll.) — angkanya berbeda per posisi.",
  },
  {
    q: "Berapa lama proses dari daftar sampai berangkat?",
    a: "Rata-rata 4 bulan, dari kamu daftar sampai berangkat. Bergantung pada posisi, kelengkapan dokumen, dan jadwal employer.",
  },
  {
    q: "Bagaimana jika saya belum punya passport?",
    a: "Tidak masalah. Kamu bisa daftar dulu, kami pandu cara mengurus passport sambil proses berjalan.",
  },
  {
    q: "Apakah kontrak bisa diperpanjang?",
    a: "Bisa. Setelah kontrak pertama selesai (umumnya 2 tahun), kamu bisa perpanjang langsung dengan employer atau ambil posisi baru via DTG.",
  },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const jobOrders = await fetchOpenJobOrders();
  const merged = mergePositionsWithJobOrders(jobOrders);
  const openPositions = merged.filter((p) => p.status === "open");
  const featured = openPositions.length >= 3 ? openPositions.slice(0, 3) : [...openPositions, ...merged.filter((p) => p.status === "queue").slice(0, 3 - openPositions.length)];

  return (
    <main>
      {/* HERO */}
      <section className="px-5 md:px-8 pt-8 md:pt-16 pb-10">
        <div className="max-w-6xl mx-auto md:grid md:grid-cols-2 md:gap-12 md:items-center">
          <div>
            <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
              Perantau Global · Sejak 1998
            </div>
            <h1 className="text-[34px] md:text-6xl font-extrabold leading-[1.1] tracking-tight mt-3">
              Kerja luar negeri
              <br />
              yang <span className="text-pg-red-600">sah & terjamin.</span>
            </h1>
            <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed mt-4 max-w-prose">
              Lisensi resmi P3MI. Kami bantu kamu dari daftar sampai berangkat — bebas biaya sebelum
              terima offering letter dari employer.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 mt-6 max-w-md">
              <ButtonLink href="/lowongan" variant="primary" block>
                Lihat lowongan <Icon name="arrow_right" size={18} />
              </ButtonLink>
              <ButtonLink href="/talent-hub" variant="ghost" block>
                Buka Talent Hub
              </ButtonLink>
            </div>

            {/* Proof strip */}
            <div className="mt-8 grid grid-cols-3 bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden max-w-md">
              {[
                { k: "28", l: "Tahun\npengalaman" },
                { k: "P3MI", l: "Lisensi\nresmi" },
                { k: `${POSITIONS.length}`, l: "Posisi\ntersedia" },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`px-3 py-3.5 text-center ${i ? "border-l border-pg-ink-100" : ""}`}
                >
                  <div className="text-xl font-extrabold tracking-tight text-pg-red-600">{s.k}</div>
                  <div className="text-sm text-pg-ink-500 leading-tight whitespace-pre-line mt-0.5">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Desktop hero photo — inspirational perantau imagery */}
          <div className="hidden md:block">
            <div className="relative rounded-3xl overflow-hidden text-white aspect-[4/5]">
              <Image
                src="/images/home-hero.jpg"
                alt="Perantau Indonesia siap berangkat di Bandara Soekarno-Hatta"
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(14,14,16,.05) 0%, rgba(14,14,16,.15) 50%, rgba(14,14,16,.78) 100%)",
                }}
              />
              {/* Brand corner badge */}
              <div className="absolute top-5 left-5 inline-flex items-center gap-2 bg-white/95 backdrop-blur text-pg-ink-900 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.12em] uppercase">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--pg-red-600)" }}
                />
                P3MI Resmi
              </div>
              {/* Bottom content */}
              <div className="absolute inset-x-0 bottom-0 p-8">
                <div
                  className="text-[11px] font-bold tracking-[0.14em] uppercase"
                  style={{ color: "var(--pg-red-500)" }}
                >
                  Perantau
                </div>
                <div className="text-5xl font-extrabold leading-[0.98] tracking-tight mt-2 text-balance">
                  Berangkat
                  <br />
                  dengan tenang.
                </div>
                <div className="flex items-center gap-3 mt-4 text-sm font-semibold text-white/90">
                  <Icon name="shield" size={16} stroke={2} /> Legal & tercatat
                  <span className="opacity-50">·</span>
                  <Icon name="clock" size={16} stroke={2} /> ~4 bulan proses
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOWONGAN AKTIF */}
      <section className="px-5 md:px-8 pb-10 md:pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-4 md:mb-6">
            <div>
              <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
                Lowongan
              </div>
              <h2 className="text-[22px] md:text-4xl font-extrabold tracking-tight mt-1.5">
                Lagi buka sekarang
              </h2>
            </div>
            <Link
              href="/lowongan"
              className="hidden md:inline-flex items-center gap-1 text-pg-red-600 font-bold no-underline"
            >
              Lihat semua <Icon name="arrow_right" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {featured.slice(0, 3).map((p) => (
              <PositionCard key={p.slug} p={p} />
            ))}
          </div>
          <div className="mt-4 md:hidden">
            <ButtonLink href="/lowongan" variant="ghost" block>
              Lihat semua {POSITIONS.length} lowongan <Icon name="arrow_right" size={16} />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="bg-pg-ink-900 text-white px-5 md:px-8 py-10 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div
            className="text-[12px] font-bold tracking-[0.14em] uppercase"
            style={{ color: "var(--pg-red-500)" }}
          >
            Cara kerja
          </div>
          <h2 className="text-2xl md:text-5xl font-extrabold tracking-tight mt-1.5 mb-6 md:mb-12">
            4 langkah
            <br />
            sampai berangkat.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-6">
            {[
              { n: "01", t: "Daftar", d: "Isi data singkat, kami kirim link lewat email." },
              {
                n: "02",
                t: "Lengkapi profil",
                d: "Upload KTP, passport, foto, dan CV — sekali saja.",
              },
              { n: "03", t: "Apply lowongan", d: "Pilih posisi, jawab pertanyaan tambahan." },
              {
                n: "04",
                t: "Berangkat",
                d: "Rata-rata 4 bulan dari daftar sampai terbang.",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="grid grid-cols-[44px_1fr] md:grid-cols-1 gap-3.5 py-3.5 md:py-0 md:px-0 border-t border-white/10 md:border-0"
              >
                <div
                  className="text-[13px] font-mono font-semibold"
                  style={{ color: "var(--pg-red-500)" }}
                >
                  {s.n}
                </div>
                <div>
                  <div className="text-base md:text-xl font-bold tracking-tight">{s.t}</div>
                  <div className="text-sm md:text-base text-white/70 leading-snug mt-0.5">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TENTANG */}
      <section className="px-5 md:px-8 py-10 md:py-16">
        <div className="max-w-6xl mx-auto md:grid md:grid-cols-[1fr_2fr] md:gap-12">
          <div>
            <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
              Tentang kami
            </div>
            <h2 className="text-[22px] md:text-4xl font-extrabold tracking-tight mt-1.5">
              DTG — 28 tahun bantu PMI Indonesia.
            </h2>
          </div>
          <div className="mt-3 md:mt-0">
            <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed">
              Kami perusahaan penempatan PMI dengan lisensi resmi P3MI dari Kementerian Tenaga Kerja
              Republik Indonesia. Semua proses transparan, tercatat, dan sesuai regulasi.
            </p>
            <ButtonLink href="/tentang" variant="ghost" small className="mt-4">
              Pelajari lebih lanjut <Icon name="arrow_right" size={16} />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 md:px-8 pb-12 md:pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">FAQ</div>
          <h2 className="text-[22px] md:text-4xl font-extrabold tracking-tight mt-1.5 mb-3">
            Pertanyaan umum
          </h2>
          <div>
            {FAQ_ITEMS.map((item, i) => (
              <details
                key={i}
                className={`group py-4 ${i ? "border-t border-pg-ink-100" : ""}`}
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-base font-semibold text-pg-ink-900 pr-3">{item.q}</span>
                  <Icon
                    name="chevron_down"
                    size={18}
                    className="text-pg-ink-400 group-open:rotate-180 transition-transform shrink-0"
                  />
                </summary>
                <div className="mt-2 text-[15px] text-pg-ink-700 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
          <div className="mt-6">
            <ButtonLink href="/faq" variant="ghost" small>
              Lihat semua FAQ <Icon name="arrow_right" size={16} />
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
