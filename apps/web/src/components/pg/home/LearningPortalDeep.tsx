import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/pg/Icon";

/**
 * LearningPortalDeep — "rich coming soon" stub.
 *
 * Paspor Perantau Global is paid + per-country, but the schema for lessons
 * isn't shipped yet (per project_learning_platform_dev memory). This section
 * advertises the program with a hero photo + features, CTA goes to
 * /akademi marketing page where users get the WhatsApp waitlist link.
 */

const FEATURES = [
  {
    icon: "user" as const,
    title: "Psikotes & assessment",
    sub: "Tes kemampuan dasar dan kepribadian yang biasa dipakai employer luar negeri.",
  },
  {
    icon: "sparkle" as const,
    title: "Fundamental bahasa",
    sub: "Bahasa Arab dasar untuk Saudi · Bahasa Jepang JLPT N5 · Mandarin dasar untuk Taiwan.",
  },
  {
    icon: "passport" as const,
    title: "Modul kerja per negara",
    sub: "Etos kerja, hukum tenaga kerja setempat, do & don't budaya — dirangkum per posisi.",
  },
];

export function LearningPortalDeep() {
  return (
    <section className="relative py-14 md:py-20 px-5 md:px-8 bg-pg-paper border-t border-pg-ink-100" id="learning">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 items-center">
          {/* Left column: photo with stamp */}
          <div className="relative order-2 lg:order-1">
            <div
              className="relative overflow-hidden rounded-[24px]"
              style={{
                aspectRatio: "5/6",
                boxShadow: "var(--pg-shadow-3)",
              }}
            >
              <Image
                src="/images/program/global-talent-hub.jpg"
                alt="Persiapan sertifikasi Paspor Perantau Global"
                fill
                sizes="(min-width:1024px) 40vw, 100vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, transparent 50%, rgba(20,20,20,0.30) 100%)",
                }}
              />
            </div>

            {/* Floating Paspor stamp card */}
            <div
              className="absolute -bottom-6 -right-2 md:-right-6 flex items-center gap-3 bg-pg-white rounded-2xl p-3 md:p-4 max-w-[280px]"
              style={{
                boxShadow: "0 18px 36px rgba(138,94,10,0.18), 0 0 0 1px rgba(201,138,20,0.18)",
              }}
            >
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl grid place-items-center shrink-0"
                style={{ background: "rgba(201,138,20,0.18)", color: "var(--pg-gold-700)" }}
              >
                <Icon name="passport" size={22} stroke={2.2} />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="font-extrabold text-[14px] text-pg-ink-900 tracking-[-0.01em]">
                  Paspor Perantau Global
                </div>
                <div className="text-[11.5px] text-pg-ink-500 leading-snug">
                  Program persiapan opsional · per negara
                </div>
              </div>
            </div>
          </div>

          {/* Right column: copy + features */}
          <div className="flex flex-col gap-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 self-start">
              <span className="font-mono text-[15px] font-extrabold text-pg-gold-700">02</span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-gold-700">
                Akademi Perantau
              </span>
            </div>
            <h2 className="text-[28px] md:text-[44px] font-extrabold tracking-[-0.025em] leading-[1.05] text-pg-ink-900 text-balance">
              Bekal siap kerja, <span className="text-pg-gold-700">bukan janji manis.</span>
            </h2>
            <p className="text-[14px] md:text-[16px] text-pg-ink-700 leading-relaxed max-w-prose">
              Sebelum berangkat, kamu bisa ikut pelatihan bersertifikat bersama Lembaga Vokasi
              Universitas Indonesia, atau mulai dulu dari kelas gratis persiapan kerja. Bukan syarat
              melamar, tapi bekal yang bikin kamu lebih siap waktu diseleksi employer.
            </p>

            <div className="flex flex-col gap-3 mt-2">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 p-3.5 bg-pg-white rounded-2xl"
                  style={{ border: "1px solid rgba(201,138,20,0.18)" }}
                >
                  <div
                    className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
                    style={{ background: "rgba(201,138,20,0.18)", color: "var(--pg-gold-700)" }}
                  >
                    <Icon name={f.icon} size={18} stroke={2.2} />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="text-[14px] font-extrabold text-pg-ink-900">{f.title}</div>
                    <div className="text-[12.5px] text-pg-ink-500 leading-snug">{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/akademi"
              className="inline-flex self-start items-center gap-2 px-[22px] py-4 text-pg-ink-900 font-bold text-[15px] rounded-[14px] no-underline transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, var(--pg-gold-200), #d4a04a)",
                boxShadow: "0 4px 12px rgba(138,94,10,0.20)",
              }}
            >
              Lihat Akademi Perantau
              <Icon name="arrow_right" size={15} stroke={2.4} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
