import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { generateMeta } from "@/lib/seo";
import { Icon } from "@/components/pg/Icon";
import { ButtonLink } from "@/components/pg/primitives";
import { PositionCard } from "@/components/pg/PositionCard";
import { TrustStrip } from "@/components/pg/TrustStrip";
import { WhatsAppFab } from "@/components/pg/WhatsAppFab";
import { POSITIONS } from "@/lib/positions";
import { fetchOpenJobOrders, mergePositionsWithJobOrders } from "@/lib/positions-db";

export const revalidate = 60;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";
const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER?.replace(/\D/g, "") || "6281200000000";

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
    a: "Iya. Kamu bebas biaya sebelum menerima offering letter dari employer. Setelah diterima, baru muncul biaya keberangkatan untuk dokumen (MCU, apostille, dll.) — Rp 15-25 juta tergantung posisi dan negara.",
    open: true,
  },
  {
    q: "Berapa lama proses dari daftar sampai berangkat?",
    a: "Rata-rata 4 bulan. Truck Driver Jepang bisa secepat 3 bulan; Perawat Saudi bisa 5-6 bulan. Bergantung pada kelengkapan dokumen kamu dan jadwal employer.",
    open: true,
  },
  {
    q: "Bagaimana jika saya belum punya passport?",
    a: "Tidak masalah. Kamu bisa daftar dulu — kami pandu cara mengurus passport sambil proses berjalan. Tim PIC kami sudah bantu ratusan kandidat dari nol.",
    open: true,
  },
  {
    q: "Apakah harus sudah pernah kerja di luar negeri?",
    a: "Tidak. Kebanyakan PMI yang kami tempatkan adalah first-timer. Yang kami butuhkan: kamu memenuhi hard requirement posisi (umur, gender, pendidikan, sertifikat tertentu kalau ada).",
  },
  {
    q: "Apakah kontrak bisa diperpanjang?",
    a: "Bisa. Setelah kontrak pertama selesai (umumnya 2 tahun), kamu bisa perpanjang langsung dengan employer atau ambil posisi baru via DTG.",
  },
];

type CountryDef = {
  display: string;
  short: string;
  flag: string;
  image: string; // background image path under /public
  imageAlt: string;
  salaryRange: string;
  roles: string;
};

const COUNTRIES: CountryDef[] = [
  {
    display: "Saudi Arabia",
    short: "Saudi",
    flag: "🇸🇦",
    image: "/images/countries/saudi.jpg",
    imageAlt: "Riyadh skyline saat golden hour",
    salaryRange: "SAR 1.500–3.200",
    roles: "Perawat, Barista, Waiter, Spa Therapist, Chef, dll.",
  },
  {
    display: "Jepang",
    short: "Jepang",
    flag: "🇯🇵",
    image: "/images/countries/jepang.jpg",
    imageAlt: "Tokyo skyline dengan Mt Fuji di kejauhan",
    salaryRange: "¥190–250rb",
    roles: "Truck Driver, Food Service (SSW), Caregiver Panti, Pengolahan Makanan",
  },
  {
    display: "Taiwan",
    short: "Taiwan",
    flag: "🇹🇼",
    image: "/images/countries/taiwan.jpg",
    imageAlt: "Taipei 101 di senja",
    salaryRange: "NT$ 29.500",
    roles: "Caregiver — kontrak 3 tahun, panti & rumah.",
  },
  {
    display: "Indonesia",
    short: "Indonesia",
    flag: "🇮🇩",
    image: "/images/countries/indonesia.jpg",
    imageAlt: "Jakarta skyline dengan Monas",
    salaryRange: "Sesuai brand",
    roles: "SPG — penempatan domestic multi-kota.",
  },
];

type CostStep = {
  label: string;
  cost: string;
  desc: string;
  state: "free" | "milestone" | "paid";
};

const COST_STEPS: CostStep[] = [
  {
    label: "Daftar akun",
    cost: "Rp 0",
    desc: "Email + nomor HP, 2 menit selesai.",
    state: "free",
  },
  {
    label: "Isi profil",
    cost: "Rp 0",
    desc: "KTP, ijazah, CV — upload sekali.",
    state: "free",
  },
  {
    label: "Apply lowongan",
    cost: "Rp 0",
    desc: "Pilih posisi, kirim lamaran tanpa batas.",
    state: "free",
  },
  {
    label: "Wawancara",
    cost: "Rp 0",
    desc: "Online atau di kantor, sesuai jadwal.",
    state: "free",
  },
  {
    label: "Offer letter diterima",
    cost: "Rp 0",
    desc: "Kontrak resmi dari employer, kamu setuju dulu.",
    state: "milestone",
  },
  {
    label: "Siap berangkat",
    cost: "Rp 15–25 jt",
    desc: "MCU, paspor, apostille, BP2MI — angka tertera per posisi.",
    state: "paid",
  },
];

function StepCheckIcon({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function StepPlaneIcon({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1L15 22v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

function StepCircle({
  state,
  index,
  size,
}: {
  state: CostStep["state"];
  index: number;
  size: number;
}) {
  if (state === "free") {
    return (
      <div
        className="rounded-full bg-white flex items-center justify-center font-extrabold tracking-[-0.01em]"
        style={{
          width: size,
          height: size,
          border: "2px solid #0a6e3a",
          color: "#0a6e3a",
          fontSize: Math.round(size * 0.34),
          boxShadow: "0 4px 12px rgba(15,138,74,0.18)",
        }}
      >
        {index + 1}
      </div>
    );
  }
  if (state === "milestone") {
    return (
      <div
        className="rounded-full flex items-center justify-center text-white"
        style={{
          width: size,
          height: size,
          background: "#0a6e3a",
          border: "2px solid #0a6e3a",
          boxShadow: "0 6px 16px rgba(15,138,74,0.32)",
        }}
      >
        <StepCheckIcon size={Math.round(size * 0.42)} />
      </div>
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: "#fbf3e2",
        border: "2px dashed #c98a14",
        color: "#8a5e0a",
        boxShadow: "0 6px 16px rgba(138,94,10,0.22)",
      }}
    >
      <StepPlaneIcon size={Math.round(size * 0.42)} />
    </div>
  );
}

function CostPill({
  state,
  cost,
  small = false,
}: {
  state: CostStep["state"];
  cost: string;
  small?: boolean;
}) {
  const padding = small ? "px-2 py-1" : "px-2.5 py-1";
  const fontSize = small ? "text-[9.5px]" : "text-[10px]";
  const bg =
    state === "paid"
      ? "#8a5e0a"
      : state === "milestone"
        ? "#0a6e3a"
        : "rgba(15,138,74,0.10)";
  const color = state === "free" ? "#0a6e3a" : "#ffffff";
  return (
    <span
      className={`inline-flex items-center font-mono font-bold uppercase tracking-[0.2em] rounded-full ${padding} ${fontSize}`}
      style={{ background: bg, color }}
    >
      {cost}
    </span>
  );
}

function CostStepDesktop({
  step,
  index,
}: {
  step: CostStep;
  index: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3.5 flex-1 max-w-[170px]">
      <StepCircle state={step.state} index={index} size={64} />
      <div className="flex flex-col items-center gap-1.5">
        <div className="text-[15px] font-bold tracking-[-0.01em] text-pg-ink-900 text-center">
          {step.label}
        </div>
        <CostPill state={step.state} cost={step.cost} />
        <div className="text-[12px] font-medium text-pg-ink-500 text-center leading-snug max-w-[152px]">
          {step.desc}
        </div>
      </div>
    </div>
  );
}

function CostStepMobile({
  step,
  index,
  isLast,
}: {
  step: CostStep;
  index: number;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div
        className="flex flex-col items-center flex-shrink-0"
        style={{ width: 52 }}
      >
        <StepCircle state={step.state} index={index} size={52} />
        {!isLast && (
          <div
            className="flex-1 mt-1"
            style={{
              width: 0,
              borderLeft: "2px dashed #b7c9be",
              minHeight: 32,
            }}
          />
        )}
      </div>
      <div className={`flex-1 flex flex-col gap-1.5 pt-1 ${isLast ? "" : "pb-6"}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-[15.5px] font-bold tracking-[-0.01em] text-pg-ink-900">
            {step.label}
          </div>
          <CostPill state={step.state} cost={step.cost} small />
        </div>
        <div className="text-[13px] font-medium text-pg-ink-600 leading-snug">
          {step.desc}
        </div>
      </div>
    </div>
  );
}

const DIFFERENTIATORS = [
  {
    icon: "shield" as const,
    iconBg: "var(--pg-red-50)",
    iconColor: "var(--pg-red-600)",
    title: "Lisensi resmi P3MI",
    body:
      "Terdaftar di Kementerian Tenaga Kerja. Ada nomor SIPPTKI yang bisa kamu cek di website resmi pemerintah. Anggota Asosiasi P3MI.",
    meta: "Cek di sipptki.kemnaker.go.id",
  },
  {
    icon: "wallet" as const,
    iconBg: "var(--ok-bg)",
    iconColor: "var(--ok)",
    title: "Bebas biaya sebelum offering letter",
    body:
      "Kamu nggak bayar apa-apa sampai employer terima kamu secara resmi. Biaya keberangkatan transparan, tertulis di setiap halaman lowongan.",
    meta: "Rp 0 di awal · Rp 15–25 jt saat berangkat",
  },
  {
    icon: "clock" as const,
    iconBg: "var(--pg-amber-50)",
    iconColor: "var(--pg-amber-600)",
    title: "Pantau status real-time di portal kamu",
    body:
      "Setelah daftar, kamu dapat akun Talent Hub untuk lihat tahap lamaran kamu live: lagi diseleksi, wawancara, dokumen, atau diterima.",
    meta: "PIC dampingi via WhatsApp & portal",
  },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const jobOrders = await fetchOpenJobOrders();
  const merged = mergePositionsWithJobOrders(jobOrders);
  const openPositions = merged.filter((p) => p.status === "open");
  const featured =
    openPositions.length >= 3
      ? openPositions.slice(0, 3)
      : [
          ...openPositions,
          ...merged.filter((p) => p.status === "queue").slice(0, 3 - openPositions.length),
        ];

  // Country counts from static catalog
  const countryCounts = new Map<string, number>();
  for (const p of POSITIONS) {
    countryCounts.set(p.country, (countryCounts.get(p.country) || 0) + 1);
  }

  return (
    <>
      <TrustStrip />
      <main>
        {/* HERO */}
        <section className="px-5 md:px-8 pt-6 md:pt-16 pb-12 md:pb-20">
          {/* Mobile-only hero photo card (above text) */}
          <div className="md:hidden mb-6 relative rounded-3xl overflow-hidden text-white aspect-[5/4] max-w-md mx-auto">
            <Image
              src="/images/home-hero.jpg"
              alt="Perantau Indonesia siap berangkat"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(14,14,16,0) 0%, rgba(14,14,16,.10) 50%, rgba(14,14,16,.82) 100%)",
              }}
            />
            <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-2 bg-white/95 backdrop-blur text-pg-ink-900 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.14em] uppercase font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-pg-red-600" />
              P3MI Resmi
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="text-[10px] font-bold tracking-[0.18em] uppercase font-mono text-white/70">
                Cerita PMI · Berangkat 2024
              </div>
              <div className="text-2xl font-extrabold leading-[1.05] tracking-tight mt-1">
                Sari Wahyuni, 32 th
              </div>
              <div className="text-[12.5px] text-white/80 mt-1">
                Perawat · King Faisal Hospital, Riyadh
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto md:grid md:grid-cols-2 md:gap-12 md:items-center">
            <div>
              <div className="text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase text-pg-amber-700 font-mono">
                Perantau Global · Sejak 1998
              </div>
              <h1 className="text-[40px] md:text-6xl font-extrabold leading-[1.02] tracking-[-0.035em] mt-5">
                Kerja luar negeri.
                <br />
                Aman, jelas,
                <br />
                <span className="text-pg-red-600">gak pakai calo.</span>
              </h1>
              <p className="text-base md:text-[17px] text-pg-ink-700 leading-relaxed mt-5 max-w-prose">
                Lisensi resmi P3MI Kemnaker. Bebas biaya sebelum offering letter.
                Rata-rata 4 bulan dari daftar sampai berangkat — semua tahap transparan.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 mt-7 max-w-md">
                <Link
                  href="/lowongan"
                  className="inline-flex flex-1 items-center justify-center gap-2 min-h-[52px] px-5 text-base font-bold rounded-2xl text-white no-underline transition-all hover:opacity-90"
                  style={{
                    background: "var(--pg-red-600)",
                    boxShadow: "0 3px 10px rgba(215,38,47,0.30)",
                  }}
                >
                  Cari lowongan <Icon name="arrow_right" size={18} />
                </Link>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo Perantau Global, saya mau tanya tentang lowongan kerja luar negeri.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 min-h-[52px] px-5 text-base font-bold rounded-2xl text-white no-underline transition-all hover:opacity-90"
                  style={{
                    background: "#25D366",
                    boxShadow: "0 3px 10px rgba(37,211,102,0.30)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.4A10 10 0 1012 2z" />
                  </svg>
                  Tanya via WhatsApp
                </a>
              </div>

              {/* Kredensial stat table */}
              <div className="mt-7 max-w-md">
                <div
                  className="grid grid-cols-3 bg-white rounded-2xl overflow-hidden"
                  style={{
                    border: "1px solid rgba(14,14,14,0.08)",
                    boxShadow:
                      "0 1px 0 rgba(14,14,14,0.04), 0 4px 14px rgba(14,14,14,0.05)",
                  }}
                >
                  {[
                    { value: "28", label: "Tahun pengalaman" },
                    { value: "P3MI", label: "Lisensi resmi" },
                    {
                      value: String(POSITIONS.length),
                      label: "Posisi tersedia",
                    },
                  ].map((k, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center py-4 px-2 text-center"
                      style={
                        i > 0
                          ? { borderLeft: "1px solid rgba(14,14,14,0.08)" }
                          : undefined
                      }
                    >
                      <div
                        className="text-[24px] md:text-[26px] font-extrabold tracking-[-0.02em] leading-none"
                        style={{ color: "var(--pg-red-600)" }}
                      >
                        {k.value}
                      </div>
                      <div className="text-[11.5px] md:text-[12px] font-semibold leading-tight text-pg-ink-500 mt-1.5">
                        {k.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero photo */}
            <div className="hidden md:block">
              <div className="relative rounded-3xl overflow-hidden text-white aspect-[4/5]">
                <Image
                  src="/images/home-hero.jpg"
                  alt="Perantau Indonesia siap berangkat"
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(14,14,16,0) 0%, rgba(14,14,16,.15) 50%, rgba(14,14,16,.82) 100%)",
                  }}
                />
                <div className="absolute top-5 left-5 inline-flex items-center gap-2 bg-white/95 backdrop-blur text-pg-ink-900 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.14em] uppercase font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-pg-red-600" />
                  P3MI Resmi
                </div>
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <div className="text-[11px] font-bold tracking-[0.18em] uppercase font-mono text-white/70">
                    Cerita PMI · Berangkat 2024
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold leading-[1.05] tracking-tight mt-2">
                    Sari Wahyuni, 32 th
                  </div>
                  <div className="text-sm md:text-base text-white/80 mt-1.5">
                    Perawat · King Faisal Hospital, Riyadh
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COUNTRY SELECTOR */}
        <section className="px-5 md:px-8 py-16 md:py-24 bg-white border-y border-pg-ink-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div className="max-w-2xl">
                <div className="text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase text-pg-red-600 font-mono mb-3">
                  Pilih negara tujuan
                </div>
                <h2 className="text-[28px] md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05]">
                  Mau kerja di negara mana?
                </h2>
                <p className="text-[15px] md:text-[17px] text-pg-ink-700 leading-relaxed mt-3">
                  Pilih dulu negaranya, kita tunjukkin posisi yang lagi buka. Gaji, syarat, dan deadline-nya jelas di muka.
                </p>
              </div>
              <Link
                href="/lowongan"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full border border-pg-ink-200 bg-pg-paper text-pg-ink-900 font-bold text-sm no-underline hover:bg-pg-ink-50 self-start md:self-auto"
              >
                Lihat semua {POSITIONS.length} lowongan
                <Icon name="arrow_right" size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {COUNTRIES.map((c) => {
                const count = countryCounts.get(c.display) || 0;
                return (
                  <Link
                    key={c.display}
                    href={`/lowongan?country=${encodeURIComponent(c.display)}`}
                    className="flex flex-col bg-white border border-pg-ink-100 rounded-2xl overflow-hidden no-underline transition-all hover:-translate-y-1 hover:shadow-lg"
                    style={{
                      boxShadow:
                        "0 1px 2px rgba(20,20,20,0.04), 0 8px 24px rgba(20,20,20,0.06)",
                    }}
                  >
                    <div className="relative h-[140px] md:h-[200px] overflow-hidden">
                      <Image
                        src={c.image}
                        alt={c.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover"
                      />
                      {/* Dark gradient overlay for legibility */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.20) 40%, rgba(0,0,0,0.75) 100%)",
                        }}
                      />
                      {/* Top-left flag chip */}
                      <span
                        className="absolute top-2.5 left-2.5 md:top-3 md:left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] md:text-[11px] font-bold tracking-wider uppercase font-mono text-white"
                        style={{
                          background: "rgba(0,0,0,0.35)",
                          border: "1px solid rgba(255,255,255,0.18)",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <span className="text-sm md:text-base leading-none">{c.flag}</span>
                        {c.short}
                      </span>
                      {/* Big typography on image */}
                      <div className="absolute inset-x-0 bottom-0 p-3 md:p-5">
                        <div className="text-white text-[26px] md:text-[36px] font-extrabold leading-[1.0] tracking-[-0.025em]">
                          {c.display}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 md:gap-3 p-3.5 md:p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className="inline-flex items-center px-2 py-1 rounded-full text-[9px] md:text-[10px] font-bold font-mono tracking-wider"
                          style={{
                            background: "var(--ok-bg)",
                            border: "1px solid #b9e8c5",
                            color: "var(--ok)",
                          }}
                        >
                          {count} POSISI BUKA
                        </div>
                        <div className="text-[8px] md:text-[9px] font-bold tracking-widest uppercase text-pg-ink-400 font-mono">
                          {c.salaryRange}
                        </div>
                      </div>
                      <p className="text-[11.5px] md:text-[13px] text-pg-ink-500 leading-snug">
                        {c.roles}
                      </p>
                      <div className="flex items-center justify-between pt-2.5 md:pt-3.5 border-t border-pg-ink-100">
                        <div className="text-[12.5px] md:text-[14px] font-bold text-pg-ink-900">
                          Lihat lowongan
                        </div>
                        <div className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-pg-ink-900 text-white">
                          <Icon name="arrow_right" size={13} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURED LOWONGAN */}
        <section className="px-5 md:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-6 md:mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: "var(--ok)",
                      boxShadow: "0 0 6px rgba(15,138,74,0.5)",
                    }}
                  />
                  <div className="text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase text-ok font-mono" style={{ color: "var(--ok)" }}>
                    Lagi buka batch terbaru
                  </div>
                </div>
                <h2 className="text-[26px] md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05]">
                  Posisi yang bisa kamu apply sekarang.
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
            <div className="mt-5 md:hidden">
              <ButtonLink href="/lowongan" variant="ghost" block>
                Lihat semua {POSITIONS.length} lowongan <Icon name="arrow_right" size={16} />
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* BIAYA TRANSPARENCY — Timeline 6 tahap (Variasi C dari Paper) */}
        <section
          className="relative overflow-hidden px-5 md:px-8 py-16 md:py-24"
          style={{
            background:
              "linear-gradient(135deg, var(--ok-bg) 0%, #cfe9d8 60%, #b9e0c8 100%)",
            borderTop: "1px solid #b9e8c5",
            borderBottom: "1px solid #a8d8b6",
          }}
        >
          {/* Decorative radial glow */}
          <div
            aria-hidden
            className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, var(--ok) 0%, transparent 65%)",
              opacity: 0.12,
            }}
          />
          <div
            aria-hidden
            className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, #c98a14 0%, transparent 65%)",
              opacity: 0.08,
            }}
          />
          <div className="max-w-6xl mx-auto relative">
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-3 md:gap-4 max-w-2xl mx-auto">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono font-bold uppercase text-[10px] md:text-[11px] tracking-[0.22em]"
                style={{
                  color: "#0a6e3a",
                  border: "1.5px dashed #0a6e3a",
                  background: "rgba(255,255,255,0.4)",
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "#0a6e3a" }}
                />
                Kapan biaya muncul?
              </div>
              <h2 className="text-[28px] md:text-[44px] font-extrabold tracking-[-0.028em] leading-[1.05]">
                Biaya muncul satu kali —{" "}
                <span style={{ color: "#0a6e3a" }}>setelah</span> kamu diterima.
              </h2>
              <p className="text-[14px] md:text-[16px] font-medium text-pg-ink-700 leading-relaxed max-w-xl">
                Lima tahap pertama gratis. Biaya keberangkatan baru muncul
                setelah employer kirim offer letter resmi — bukan rolling fee,
                bukan biaya tersembunyi.
              </p>
            </div>

            {/* Timeline — desktop horizontal */}
            <div className="hidden md:block mt-14">
              <div className="relative px-12">
                {/* Track line */}
                <div
                  aria-hidden
                  className="absolute top-8 left-[12%] right-[12%]"
                  style={{ borderTop: "2px dashed #b7c9be" }}
                />
                <div className="flex items-start justify-between gap-2 relative">
                  {COST_STEPS.map((s, i) => (
                    <CostStepDesktop key={s.label} step={s} index={i} />
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline — mobile vertical */}
            <div className="md:hidden mt-10">
              <div className="flex flex-col">
                {COST_STEPS.map((s, i) => (
                  <CostStepMobile
                    key={s.label}
                    step={s}
                    index={i}
                    isLast={i === COST_STEPS.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Warning band — hati-hati calo */}
            <div
              className="mt-10 md:mt-14 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 p-5 md:px-6 md:py-5 rounded-2xl bg-white"
              style={{
                border: "1.5px solid rgba(215,38,47,0.30)",
                boxShadow:
                  "0 2px 0 rgba(215,38,47,0.08), 0 0 0 4px rgba(215,38,47,0.05)",
              }}
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div
                  className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "var(--pg-red-50, #fdecee)",
                    color: "var(--pg-red-600, #d7262f)",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1 max-w-xl">
                  <div
                    className="text-[10.5px] md:text-[11px] font-bold tracking-[0.18em] uppercase font-mono"
                    style={{ color: "var(--pg-red-600, #d7262f)" }}
                  >
                    Hati-hati calo
                  </div>
                  <p className="text-[13.5px] md:text-[14.5px] font-semibold leading-snug text-pg-ink-900">
                    Perantau Global <span className="underline decoration-2 underline-offset-2" style={{ textDecorationColor: "var(--pg-red-600, #d7262f)" }}>tidak pernah</span> minta uang di tahap 1–5.
                  </p>
                  <p className="text-[12.5px] md:text-[13.5px] font-medium leading-snug text-pg-ink-600">
                    Kalau ada orang yang minta biaya pendaftaran, biaya
                    wawancara, atau &quot;uang pengurus&quot; — bahkan kalau dia
                    mengaku dari Perantau Global — itu calo. Lapor ke kami via
                    WhatsApp, gratis.
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo, saya mau lapor dugaan calo yang mengatasnamakan Perantau Global.")}`}
                className="inline-flex items-center justify-center gap-1.5 px-4 md:px-5 py-3 md:py-3.5 rounded-xl text-white font-bold text-sm no-underline flex-shrink-0 transition-colors"
                style={{
                  background: "var(--pg-red-600, #d7262f)",
                  boxShadow: "0 3px 10px rgba(215,38,47,0.32)",
                }}
              >
                Lapor calo via WA <Icon name="arrow_right" size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* DIFFERENTIATOR */}
        <section className="px-5 md:px-8 py-14 md:py-20 bg-white border-y border-pg-ink-100">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl mb-10">
              <div className="text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase text-pg-red-600 font-mono mb-3">
                Kenapa Perantau Global
              </div>
              <h2 className="text-[28px] md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05]">
                3 hal yang bedakan kami dari <em className="text-pg-red-600 not-italic" style={{ fontStyle: "italic" }}>calo</em>.
              </h2>
              <p className="text-[15px] md:text-[17px] text-pg-ink-700 leading-relaxed mt-3">
                Banyak yang mengaku PJTKI tapi belum tentu resmi. Berikut yang bisa kamu cek di Perantau Global.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
              {DIFFERENTIATORS.map((d, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 md:gap-4.5 p-5 md:p-8 rounded-3xl bg-pg-paper border border-pg-ink-100"
                >
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: d.iconBg, color: d.iconColor }}
                  >
                    <Icon name={d.icon} size={26} stroke={2.2} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[18px] md:text-[22px] font-extrabold tracking-[-0.018em] leading-[1.2]">
                      {d.title}
                    </h3>
                    <p className="text-[13.5px] md:text-[14.5px] text-pg-ink-700 leading-relaxed">
                      {d.body}
                    </p>
                  </div>
                  <div className="mt-auto pt-3 md:pt-4 border-t border-pg-ink-100">
                    <div className="text-[9.5px] md:text-[10px] font-bold tracking-widest uppercase font-mono text-pg-ink-500">
                      {d.meta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS — hidden until real PMI testimonials with consent are collected.
            Components retained: TestimonialCard, TestimonialMobileSwitcher, /data/testimonials.ts.
            Restore: re-import + re-add section below the differentiator section. */}

        {/* FAQ */}
        <section className="px-5 md:px-8 py-14 md:py-20 bg-white border-t border-pg-ink-100">
          <div className="max-w-5xl mx-auto md:grid md:grid-cols-[1fr_1.5fr] md:gap-16">
            <div>
              <div className="text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase text-pg-red-600 font-mono mb-3">
                Pertanyaan umum
              </div>
              <h2 className="text-[28px] md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05]">
                Yang sering kami jawab.
              </h2>
              <p className="text-[15px] md:text-[16px] text-pg-ink-700 leading-relaxed mt-3">
                Top 5 pertanyaan dari kandidat. Kalau masih ada yang ditanya, langsung WhatsApp tim PIC kami.
              </p>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo Perantau Global, saya mau tanya.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 mt-5 rounded-2xl text-white font-bold text-sm no-underline"
                style={{ background: "#25D366", boxShadow: "0 3px 10px rgba(37,211,102,0.30)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.4A10 10 0 1012 2z" />
                </svg>
                Tanya via WhatsApp
              </a>
            </div>
            <div className="mt-8 md:mt-0">
              {FAQ_ITEMS.map((item, i) => (
                <details
                  key={i}
                  open={item.open}
                  className={`group py-5 ${i ? "border-t border-pg-ink-100" : "border-t border-pg-ink-100"} ${i === FAQ_ITEMS.length - 1 ? "border-b border-pg-ink-100" : ""}`}
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                    <h3 className="text-base md:text-[17px] font-extrabold text-pg-ink-900 tracking-[-0.012em]">
                      {item.q}
                    </h3>
                    <div
                      className="w-9 h-9 rounded-full grid place-items-center transition-all flex-shrink-0 group-open:bg-pg-ink-900 group-open:text-white"
                      style={{ background: "var(--pg-paper)", border: "1px solid var(--pg-border)", color: "var(--pg-ink-secondary)" }}
                    >
                      <Icon
                        name="chevron_down"
                        size={16}
                        stroke={2.5}
                        className="group-open:rotate-180 transition-transform"
                      />
                    </div>
                  </summary>
                  <p className="mt-3 text-[14.5px] md:text-[15px] text-pg-ink-700 leading-relaxed pr-12">
                    {item.a}
                  </p>
                </details>
              ))}
              <Link
                href="/faq"
                className="inline-flex items-center gap-1 text-pg-red-600 font-bold text-sm no-underline mt-5"
              >
                Lihat semua FAQ <Icon name="arrow_right" size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* FINAL CTA — Journey hero (wireframe globe, light & cheerful) */}
        <section
          className="relative overflow-hidden isolate"
          style={{ background: "#faf2dc" }}
        >
          {/* Smooth fade-in from previous white FAQ section */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-32 md:h-44 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, #ffffff 0%, rgba(250,242,220,0.7) 60%, rgba(250,242,220,0) 100%)",
            }}
          />
          {/* Background image: rendered at natural aspect, pinned to bottom — pure cream above */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 aspect-[16/9] w-full">
            <Image
              src="/images/cta/journey-globe-v4.jpg"
              alt=""
              fill
              className="object-cover object-bottom"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1440px"
              quality={90}
              priority={false}
            />
            {/* Softly fade the image's top edge into the cream bg above */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-20 md:h-28"
              style={{
                background:
                  "linear-gradient(180deg, #faf2dc 0%, rgba(250,242,220,0.6) 60%, rgba(250,242,220,0) 100%)",
              }}
            />
          </div>

          <div className="relative px-5 md:px-8 pt-20 md:pt-24 pb-[58vw] md:pb-[42vw] text-center">
            <div className="max-w-3xl mx-auto">
              <div
                className="inline-flex items-center gap-2 text-[11px] md:text-[12px] font-bold tracking-[0.22em] uppercase font-mono mb-5"
                style={{ color: "var(--pg-red-600)" }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--pg-red-600)" }}
                />
                Siap mulai?
              </div>
              <h2
                className="text-[36px] md:text-[68px] font-extrabold tracking-[-0.035em] leading-[1.02]"
                style={{ color: "#0e0e0e" }}
              >
                Perjalanan kamu ke
                <br />
                <span
                  style={{
                    color: "var(--pg-red-600)",
                    fontStyle: "italic",
                  }}
                >
                  luar negeri
                </span>
                <br />
                dimulai dari satu langkah.
              </h2>
              <p
                className="text-[15px] md:text-[18px] leading-relaxed mt-6 max-w-prose mx-auto"
                style={{ color: "#3a3a3a" }}
              >
                Daftar gratis, bikin akun Talent Hub kamu. Lengkapi profil
                sekali, pakai untuk apply ke semua posisi yang cocok.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9 max-w-md mx-auto">
                <a
                  href={APP_URL}
                  className="inline-flex items-center justify-center gap-2 min-h-[56px] px-6 text-base font-bold rounded-2xl text-white no-underline transition-all hover:opacity-90"
                  style={{
                    background: "var(--pg-red-600)",
                    boxShadow:
                      "0 8px 22px rgba(215,38,47,0.32), 0 0 0 1px rgba(255,255,255,0.10) inset",
                  }}
                >
                  Daftar di Talent Hub <Icon name="arrow_right" size={18} />
                </a>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo, saya mau tanya soal kerja luar negeri.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[56px] px-6 text-base font-bold rounded-2xl no-underline transition-all hover:bg-pg-ink-50"
                  style={{
                    background: "#ffffff",
                    color: "#0e0e0e",
                    border: "1.5px solid #e6dcc1",
                    boxShadow: "0 2px 0 rgba(14,14,14,0.04)",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="#25D366"
                    aria-hidden
                  >
                    <path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.4A10 10 0 1012 2z" />
                  </svg>
                  Tanya via WhatsApp
                </a>
              </div>
              <div
                className="flex flex-wrap gap-x-6 gap-y-2 justify-center mt-10 text-[11px] font-semibold tracking-widest uppercase font-mono"
                style={{ color: "rgba(14,14,14,0.45)" }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="check" size={12} stroke={2.5} /> Gratis daftar
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="check" size={12} stroke={2.5} /> Bebas biaya di
                  awal
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="check" size={12} stroke={2.5} /> 1 akun, semua
                  lamaran
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <WhatsAppFab />
    </>
  );
}
