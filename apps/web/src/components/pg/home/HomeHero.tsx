import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import { waLink } from "@/lib/contact";

type Country = {
  name: "Saudi Arabia" | "Jepang" | "Taiwan" | "Indonesia";
  short: string;
  flag: string;
  img: string;
  currency: string;
};

const COUNTRIES: Country[] = [
  { name: "Saudi Arabia", short: "Saudi", flag: "🇸🇦", img: "/images/countries/saudi.jpg", currency: "SAR riyal" },
  { name: "Jepang", short: "Jepang", flag: "🇯🇵", img: "/images/countries/jepang.jpg", currency: "¥ yen" },
  { name: "Taiwan", short: "Taiwan", flag: "🇹🇼", img: "/images/countries/taiwan.jpg", currency: "NT$ Taiwan" },
  { name: "Indonesia", short: "Indonesia", flag: "🇮🇩", img: "/images/countries/indonesia.jpg", currency: "Rupiah" },
];

const PORTRAIT_CARDS = [
  // objectPosition steers the crop on the landscape source so the subject
  // stays centered in the portrait 4/5 polaroid frame:
  // - sari (perawat): nurse is center-right of the hospital scene
  // - budi (truck driver): driver is left-of-center against the truck cab
  // - rini (caregiver): worker is center-left, elderly patient is right
  { src: "/images/people/sari.jpg", name: "Sari, 28", meta: "Perawat · 🇸🇦 Riyadh · 2025", objectPosition: "55% center" },
  { src: "/images/people/budi.jpg", name: "Budi, 32", meta: "Truck Driver · 🇯🇵 Osaka · 2025", objectPosition: "30% center" },
  { src: "/images/people/rini.jpg", name: "Rini, 26", meta: "Caregiver · 🇹🇼 Taipei · 2025", objectPosition: "58% center" },
];

export function HomeHero({
  totalPositions,
  openCount,
  positionsByCountry,
}: {
  totalPositions: number;
  openCount: number;
  positionsByCountry: Record<string, number>;
}) {
  return (
    <section className="relative overflow-hidden pt-10 pb-8 md:pt-14 md:pb-6 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* License eyebrow pill */}
        <div
          className="inline-flex items-center gap-2.5 pl-2 pr-3.5 py-2 bg-pg-white border border-pg-ink-100 rounded-full mb-7"
          style={{ boxShadow: "0 1px 3px rgba(20,20,20,0.04)" }}
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-pg-red-50 text-pg-red-700 rounded-full font-mono text-[10.5px] font-bold tracking-[0.06em]">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-pg-red-600" />
            P3MI Resmi
          </span>
          <span className="text-[12.5px] font-medium text-pg-ink-700">
            No. 1810240237512001
          </span>
        </div>

        {/* Hero grid: copy left, portrait collage right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
          {/* Copy column */}
          <div className="flex flex-col gap-5">
            <h1
              className="font-extrabold tracking-[-0.035em] leading-[1.02] text-pg-ink-900 text-balance"
              style={{ fontSize: "clamp(36px, 5.4vw, 64px)" }}
            >
              Banyak orang biasa udah berangkat.{" "}
              <span className="text-pg-red-600">Sekarang giliranmu.</span>
            </h1>
            <p
              className="text-pg-ink-700 leading-relaxed font-medium m-0"
              style={{ fontSize: "clamp(15px, 1.3vw, 18px)", maxWidth: "48ch" }}
            >
              Lowongan resmi kerja luar negeri di Saudi Arabia, Jepang, Taiwan &amp; Indonesia.
              Dari employer terverifikasi P3MI. Bebas calo. Gratis sampai offering letter.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link
                href="/lowongan"
                className="inline-flex items-center justify-center gap-2 px-[22px] py-4 bg-pg-red-600 text-white font-bold text-[15px] rounded-[14px] no-underline transition-all hover:bg-pg-red-700 hover:-translate-y-0.5"
                style={{ boxShadow: "0 4px 12px rgba(215,38,47,0.15)" }}
              >
                Lihat {totalPositions} lowongan
                <Icon name="arrow_right" size={16} stroke={2.4} />
              </Link>
              <a
                href={waLink("Halo, saya mau tanya soal kerja luar negeri.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-[22px] py-4 bg-pg-white text-pg-ink-900 font-bold text-[15px] rounded-[14px] border-[1.5px] border-pg-ink-200 no-underline transition-all hover:border-pg-ink-300 hover:-translate-y-0.5"
              >
                <span
                  aria-hidden
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#25D366", boxShadow: "0 0 0 4px rgba(37,211,102,0.18)" }}
                />
                Tanya via WhatsApp
              </a>
            </div>

            {/* Alumni strip — compact on mobile (smaller avatars + tighter copy)
                to avoid overflow / overlap on narrow viewports. */}
            <div className="flex items-center gap-2.5 md:gap-3.5 mt-3 min-w-0">
              <div className="flex items-center shrink-0">
                {PORTRAIT_CARDS.map((p, i) => (
                  <Image
                    key={p.src}
                    src={p.src}
                    alt={p.name}
                    width={36}
                    height={36}
                    className="w-7 h-7 md:w-9 md:h-9 rounded-full object-cover border-2 border-pg-paper"
                    style={{ marginLeft: i === 0 ? 0 : -6, objectPosition: p.objectPosition }}
                  />
                ))}
              </div>
              <div className="text-[12px] md:text-[13px] text-pg-ink-700 leading-snug min-w-0">
                Penempatan resmi ke Saudi, Jepang &amp; Taiwan — tiap tahap dikabarin PIC, bukan calo.
              </div>
            </div>
          </div>

          {/* Portrait collage column */}
          <div className="w-full">
          <div
            className="relative w-full mx-auto"
            style={{ maxWidth: 520, aspectRatio: "5/5" }}
          >
            {/* Floating destination tag — front of cards */}
            <div
              className="absolute inline-flex items-center gap-2 px-3.5 py-2 bg-pg-ink-900 text-white rounded-full font-mono text-[11.5px] font-bold tracking-[0.06em] uppercase"
              style={{
                top: "5%",
                left: "-4%",
                transform: "rotate(-6deg)",
                zIndex: 10,
                boxShadow: "0 8px 20px rgba(20,20,20,0.18)",
              }}
            >
              <span className="w-[7px] h-[7px] rounded-full bg-pg-red-500 animate-pulse" />
              {openCount} batch lagi buka
            </div>

            {/* Portrait cards */}
            {PORTRAIT_CARDS.map((p, i) => {
              const positions = [
                { top: 0, left: 0, rotate: -4, z: 2 },
                { top: "8%", right: 0, rotate: 3, z: 3 },
                { bottom: 0, left: "18%", rotate: -2, z: 4 },
              ];
              const pos = positions[i];
              return (
                <div
                  key={p.src}
                  className="absolute w-[56%] bg-pg-white rounded-[18px] p-2.5 pb-3.5 transition-transform hover:-translate-y-1 hover:rotate-0 hover:scale-[1.02] hover:z-10"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    right: pos.right,
                    bottom: pos.bottom,
                    transform: `rotate(${pos.rotate}deg)`,
                    zIndex: pos.z,
                    boxShadow: "0 18px 40px rgba(20,20,20,0.10), 0 0 0 1px rgba(20,20,20,0.04)",
                  }}
                >
                  <Image
                    src={p.src}
                    alt={p.name}
                    width={400}
                    height={500}
                    className="w-full rounded-[12px] block bg-pg-ink-100"
                    style={{ aspectRatio: "4/5", objectFit: "cover", objectPosition: p.objectPosition }}
                  />
                  <div className="mt-2.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-[14px] font-extrabold text-pg-ink-900">
                      {p.name}
                    </div>
                    <div className="font-mono text-[11.5px] text-pg-ink-500 tracking-[0.02em]">
                      {p.meta}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Floating "Bebas calo" pill — front of cards */}
            <div
              className="absolute inline-flex items-center gap-1.5 px-3 py-1.5 bg-pg-white border border-pg-ink-100 rounded-full font-mono text-[11px] font-semibold text-pg-ink-700"
              style={{
                bottom: "4%",
                right: "-4%",
                transform: "rotate(4deg)",
                zIndex: 10,
                boxShadow: "0 12px 28px rgba(20,20,20,0.16)",
              }}
            >
              <span
                aria-hidden
                className="w-[7px] h-[7px] rounded-full"
                style={{ background: "var(--pg-ok)" }}
              />
              Bebas calo
            </div>
          </div>
            {/* Authenticity disclaimer — these are sample faces/names until we
                publish consented real-candidate stories (matches Testimoni.tsx). */}
            <p
              className="mx-auto mt-4 text-center font-mono text-[10.5px] text-pg-ink-400 leading-snug"
              style={{ maxWidth: 520 }}
            >
              Ilustrasi — foto &amp; nama contoh, akan diganti kandidat asli.
            </p>
          </div>
        </div>

        {/* Country tiles strip */}
        <div className="mt-12 md:mt-16">
          <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-ink-500">
              Negara tujuan
            </span>
            <span className="text-[13px] text-pg-ink-500">
              Pilih negara untuk lihat lowongan, atau{" "}
              <Link href="/lowongan" className="text-pg-ink-900 font-semibold underline decoration-pg-ink-300 underline-offset-2 hover:text-pg-red-600">
                lihat semuanya
              </Link>
              .
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {COUNTRIES.map((c) => {
              const count = positionsByCountry[c.name] || 0;
              return (
                <Link
                  key={c.name}
                  href={`/lowongan?country=${encodeURIComponent(c.name)}`}
                  className="group relative aspect-[4/5] overflow-hidden rounded-[18px] bg-pg-ink-900 text-white no-underline transition-all hover:-translate-y-1 isolate"
                  style={{ boxShadow: "var(--pg-shadow-1)" }}
                  aria-label={`Lowongan di ${c.name}`}
                >
                  <Image
                    src={c.img}
                    alt={c.name}
                    fill
                    sizes="(min-width:1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  {/* Bottom-anchored dark scrim so white text stays legible on photo */}
                  <div
                    aria-hidden
                    className="absolute inset-0 z-[1]"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(20,20,20,0) 30%, rgba(20,20,20,0.62) 75%, rgba(20,20,20,0.88) 100%)",
                    }}
                  />
                  {/* Content overlay */}
                  <div className="absolute inset-0 z-[2] p-4 md:p-5 flex flex-col justify-between">
                    {/* Top-left flag pill (glass) */}
                    <span
                      className="self-start inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full font-mono text-[10px] md:text-[10.5px] font-bold uppercase tracking-[0.06em] text-white"
                      style={{
                        background: "rgba(255,255,255,0.16)",
                        border: "1px solid rgba(255,255,255,0.22)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                    >
                      <span
                        aria-hidden
                        className="inline-grid place-items-center w-[18px] h-[18px] rounded-full bg-pg-white text-[11px] leading-none"
                      >
                        {c.flag}
                      </span>
                      {c.short}
                    </span>
                    {/* Bottom: country name (on photo) + meta + arrow */}
                    <div className="flex flex-col gap-1">
                      <span
                        className="font-extrabold tracking-[-0.025em] leading-none text-white"
                        style={{ fontSize: "clamp(22px, 2.4vw, 28px)" }}
                      >
                        {c.name}
                      </span>
                      <div className="flex items-baseline justify-between gap-2 mt-1">
                        <span className="font-mono text-[12px] md:text-[12.5px] tracking-[0.02em] text-white/85">
                          {count} posisi · {c.currency}
                        </span>
                        <span className="w-8 h-8 rounded-full bg-pg-white text-pg-ink-900 grid place-items-center shrink-0 transition-transform group-hover:translate-x-0.5">
                          <Icon name="arrow_right" size={14} stroke={2.4} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
