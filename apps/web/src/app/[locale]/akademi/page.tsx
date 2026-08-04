import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon, type IconName } from "@/components/pg/Icon";
import { Section } from "@/components/pg/primitives";
import { WhatsAppFab } from "@/components/pg/WhatsAppFab";
import { AkademiCatalog, type CatalogCard } from "@/components/pg/akademi/AkademiCatalog";
import { PartnerMarks } from "@/components/pg/akademi/PartnerMarks";
import { ProgramFlow } from "@/components/pg/akademi/ProgramFlow";
import { waLink } from "@/lib/contact";
import {
  fetchPublishedPrograms,
  catalogPrograms,
  certificationPrograms,
  freePrograms,
  priceLabel,
  type AcademyProgram,
  type ProgramFlowStep,
} from "@/lib/academy";

export const metadata: Metadata = {
  title: "Akademi Perantau - Pelatihan, Sertifikasi, dan Kelas Gratis",
  description:
    "Sertifikat Perantau bersama Lembaga Vokasi UI untuk barista, waiter, dan caregiver, plus kelas gratis persiapan kerja ke luar negeri. Daftar gratis, biaya program diinformasikan setelah lolos screening.",
};

export const revalidate = 60;

export default async function AkademiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  const all = await fetchPublishedPrograms();
  const certs = certificationPrograms(all);
  const free = freePrograms(all);
  const cards = catalogPrograms(all).map((p) => toCard(p, p.slug === certs[0]?.slug));

  // The registration flow is identical across certification products, so the
  // page explains it once instead of repeating it on every card.
  const flow = certs.find((c) => (c.content.flow?.length ?? 0) > 0)?.content.flow ?? [];
  const feeNote = certs.find((c) => c.content.fee_note)?.content.fee_note;

  return (
    <>
      <main>
        <AkademiHero certCount={certs.length} freeCount={free.length} />
        {cards.length > 0 && <CatalogSection cards={cards} />}
        {flow.length > 0 && <FlowSection flow={flow} feeNote={feeNote} />}
        <TrustSection />
        <FinalCta />
      </main>
      <WhatsAppFab />
    </>
  );
}

function toCard(program: AcademyProgram, featured: boolean): CatalogCard {
  return {
    slug: program.slug,
    title: program.title,
    value: program.subtitle ?? "",
    price: priceLabel(program),
    // A paid card answers "do I have to pay to find out?"; a free card has no
    // such doubt to settle, so it spends the line on how long the class takes.
    priceSub: program.is_free ? shortDuration(program.duration_label) : "Daftar dulu, gratis",
    kindLabel: program.is_free ? "Gratis" : "Berbayar",
    isFree: program.is_free,
    cta: program.is_free ? "Mulai belajar" : "Lihat detail",
    featured: featured && !program.is_free,
    image: program.cover_image,
    imageAlt: program.title,
  };
}

/**
 * Duration labels are written for the product page, where there is room for
 * the full sentence ("Sekitar 45 menit, bisa dicicil per pelajaran"). In the
 * card footer that wraps to three lines of mono type and crowds the CTA, so
 * the card keeps only the headline duration.
 */
function shortDuration(label: string | null): string {
  if (!label) return "Belajar di aplikasi";
  return label.split(",")[0].trim();
}

/* ------------------------------------------------------------------ hero */

function AkademiHero({ certCount, freeCount }: { certCount: number; freeCount: number }) {
  return (
    <div className="bg-pg-cream">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-9 md:py-16 grid md:grid-cols-[1.05fr_.95fr] gap-6 md:gap-11 items-center">
        <div>
          <div className="font-mono text-[11px] md:text-[12px] font-bold uppercase tracking-[0.16em] text-pg-gold-700">
            Akademi Perantau
          </div>
          <h1 className="text-[28px] md:text-[45px] font-extrabold tracking-[-0.02em] leading-[1.05] mt-3 max-w-[15ch] text-pg-ink-900">
            Belajar dulu di sini, berangkat kerja lebih siap.
          </h1>
          <p className="text-[15px] md:text-[16px] font-medium leading-relaxed text-pg-ink-700 mt-4 max-w-[44ch]">
            Pelatihan bersertifikat bersama Lembaga Vokasi UI, plus kelas gratis yang bisa kamu mulai
            hari ini. Daftarnya gratis, semuanya.
          </p>

          <div className="flex flex-wrap gap-5 mt-6">
            <HeroStat value={certCount} label={"program\nsertifikasi"} />
            <span aria-hidden className="w-px self-stretch" style={{ background: "var(--pg-gold-border)" }} />
            <HeroStat value={freeCount} label={"kelas\ngratis"} />
            <span aria-hidden className="w-px self-stretch" style={{ background: "var(--pg-gold-border)" }} />
            <div className="flex items-center">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.04em] leading-tight text-pg-gold-700 whitespace-pre-line">
                {"Jalur resmi\nP3MI"}
              </span>
            </div>
          </div>

          <div
            className="inline-flex items-center gap-2 font-extrabold text-[13.5px] px-3.5 py-2.5 rounded-[11px] mt-5"
            style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
          >
            <Icon name="check" size={16} stroke={3} />
            Semua pendaftaran gratis
          </div>
        </div>

        <div
          className="relative rounded-[18px] overflow-hidden border-[5px] border-pg-white bg-pg-ink-50"
          style={{ aspectRatio: "4 / 3", boxShadow: "0 16px 40px rgba(20,20,20,0.12)" }}
        >
          <Image
            src="/images/akademi/hero-akademi.jpg"
            alt="Empat lulusan Akademi Perantau berdiri berjajar dengan seragam kerja masing-masing, menatap ke depan"
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}

function HeroStat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="font-mono text-[26px] md:text-[32px] font-bold leading-none" style={{ color: "var(--pa-amber-600)" }}>
        {value}
      </div>
      <div className="text-[12px] font-semibold text-pg-ink-500 mt-1 whitespace-pre-line leading-tight">{label}</div>
    </div>
  );
}

/* --------------------------------------------------------------- catalog */

function CatalogSection({ cards }: { cards: CatalogCard[] }) {
  return (
    <Section tone="paper" border="top">
      <div className="font-mono text-[11px] md:text-[12px] font-bold uppercase tracking-[0.16em] text-pg-gold-700">
        Kelas Akademi
      </div>
      <h2 className="text-[24px] md:text-[34px] font-extrabold tracking-[-0.02em] leading-[1.1] text-pg-ink-900 mt-2 max-w-[20ch] text-balance">
        Pilih kelas, mulai siapkan dirimu.
      </h2>
      <p className="text-[14px] md:text-[16px] font-medium leading-relaxed text-pg-ink-500 mt-2.5 max-w-[60ch]">
        Semua kelas Akademi ada di sini, dari sertifikasi bersama Lembaga Vokasi UI sampai kelas
        gratis yang bisa kamu mulai hari ini. Geser untuk lihat semua. Semua pendaftaran gratis.
      </p>
      <AkademiCatalog cards={cards} />
    </Section>
  );
}

/* ------------------------------------------------------------------ flow */

function FlowSection({ flow, feeNote }: { flow: ProgramFlowStep[]; feeNote?: string }) {
  return (
    <Section tone="white" border="top">
      <div className="font-mono text-[11px] md:text-[12px] font-bold uppercase tracking-[0.16em] text-pg-gold-700">
        Alurnya
      </div>
      <h2 className="text-[24px] md:text-[34px] font-extrabold tracking-[-0.02em] leading-[1.1] text-pg-ink-900 mt-2 max-w-[20ch] text-balance">
        Dari daftar sampai berangkat kerja.
      </h2>

      <div className="grid md:grid-cols-[1fr_340px] gap-6 md:gap-9 items-start mt-6">
        <ProgramFlow flow={flow} />

        <div className="flex flex-col gap-3.5 md:sticky md:top-24">
          <div
            className="rounded-2xl p-[18px]"
            style={{ background: "var(--pa-amber-50)", border: "1px solid var(--pa-amber-200)" }}
          >
            <div className="flex items-center gap-2 text-[13.5px] font-extrabold text-pg-ink-900">
              <span style={{ color: "var(--pa-amber-700)" }}>
                <Icon name="wallet" size={18} />
              </span>
              Soal biaya, biar jelas dari awal
            </div>
            <div className="flex flex-col gap-2 mt-3">
              <FeePoint>
                Mendaftar di halaman ini <b className="text-pg-ink-900">gratis</b>.
              </FeePoint>
              <FeePoint>
                Sertifikat Perantau itu <b className="text-pg-ink-900">satu paket</b>: pelatihan,
                sertifikasi, sampai kesempatan masuk tahap screening penempatan.
              </FeePoint>
              <FeePoint>
                <b className="text-pg-ink-900">Commitment fee</b> (uang muka 30% dari biaya program)
                baru dibahas setelah kamu lolos screening, dan dibayarkan ke lembaga pelatihan, bukan
                ke Perantau Global.
              </FeePoint>
              <FeePoint>
                Biaya keberangkatan dihitung terpisah, dan bisa ditanggung dulu lewat dana talang.
              </FeePoint>
            </div>
            {feeNote && (
              <p
                className="text-[12px] leading-relaxed mt-3 pt-3 m-0"
                style={{ color: "var(--pa-amber-700)", borderTop: "1px dashed var(--pg-gold-border)" }}
              >
                {feeNote}
              </p>
            )}
          </div>

          <div className="rounded-2xl p-[18px] bg-pg-ink-50 border border-pg-ink-200">
            <div className="flex items-center gap-2 text-[13.5px] font-extrabold text-pg-ink-900">
              <span className="text-pg-ink-500">
                <Icon name="shield" size={18} />
              </span>
              Masih ragu?
            </div>
            <p className="text-[12.5px] leading-relaxed text-pg-ink-500 mt-2 m-0">
              Tanya dulu ke tim kami sebelum daftar. Konsultasinya gratis dan tidak ada kewajiban apa
              pun.
            </p>
            <a
              href={waLink("Halo Perantau Global, saya mau tanya soal program Sertifikat Perantau.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-extrabold text-[14px] px-4 py-3 rounded-xl no-underline text-white mt-3.5 bg-pg-wa hover:opacity-90 transition-opacity"
            >
              <Icon name="phone" size={16} />
              Konsultasi via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

function FeePoint({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex gap-2 text-[12.5px] leading-relaxed text-pg-ink-700">
      <span className="flex-none mt-0.5" style={{ color: "var(--pg-ok)" }}>
        <Icon name="check" size={14} stroke={3} />
      </span>
      <span>{children}</span>
    </span>
  );
}

/* ----------------------------------------------------------------- trust */

function TrustSection() {
  return (
    <Section className="bg-pg-cream" border="top">
      <div className="font-mono text-[11px] md:text-[12px] font-bold uppercase tracking-[0.16em] text-pg-gold-700">
        Kenapa ini resmi
      </div>
      <h2 className="text-[24px] md:text-[34px] font-extrabold tracking-[-0.02em] leading-[1.1] text-pg-ink-900 mt-2 max-w-[22ch] text-balance">
        Lembaga resmi, jalur resmi, biaya yang jujur.
      </h2>

      {/* Mark + peran tiap lembaga hidup di PartnerMarks, dipakai bersama
          halaman detail program. Alasan pasangan logo-dan-peran ada di sana. */}
      <div className="mt-5">
        <PartnerMarks />
      </div>

      <div className="grid sm:grid-cols-2 gap-3.5 mt-3.5">
        <TrustCard
          title="Jalur penempatan resmi P3MI"
          body="Penempatan kerja lewat izin resmi Kemnaker, bukan calo. Kamu diarahkan ke lowongan Perantau Global."
          icon="shield"
          tone="amber"
        />
        {/* Do not restore the old copy here ("Perantau Global tidak menarik
            biaya penempatan dari kandidat"). Ifa (PO) corrected it on 30 Jul
            2026: the departure cost IS charged to the candidate. What changes
            with Sertifikat Perantau is that the cost is carried by dana talang
            and repaid later, not waived. Denying the charge on a public page
            that sells the program is the kind of error a candidate can hold us
            to. */}
        <TrustCard
          title="Biaya dirinci, bukan disembunyikan"
          body="Uang muka yang kamu bayar untuk masuk program disebut commitment fee (30% dari biaya program), dibayarkan ke lembaga pelatihan. Biaya keberangkatan dihitung terpisah dan bisa ditanggung dulu lewat dana talang."
          icon="check"
          tone="ok"
        />
      </div>
    </Section>
  );
}

const TRUST_TONES = {
  gold: { background: "var(--pg-gold-100)", color: "var(--pg-gold-700)" },
  amber: { background: "var(--pa-amber-50)", color: "var(--pa-amber-600)" },
  ok: { background: "var(--pg-ok-bg)", color: "var(--pg-ok)" },
} as const;

function TrustCard({
  title,
  body,
  icon,
  tone,
}: {
  title: string;
  body: string;
  icon: IconName;
  tone: keyof typeof TRUST_TONES;
}) {
  return (
    <div className="bg-pg-white rounded-2xl p-5" style={{ border: "1px solid var(--pg-switch-border)" }}>
      <div className="w-11 h-11 rounded-[9px] grid place-items-center" style={TRUST_TONES[tone]}>
        <Icon name={icon} size={22} />
      </div>
      <h3 className="text-[15px] font-extrabold text-pg-ink-900 mt-3 leading-tight m-0">{title}</h3>
      <p className="text-[12.5px] leading-relaxed text-pg-ink-500 mt-1.5 m-0">{body}</p>
    </div>
  );
}

/* ------------------------------------------------------------- final cta */

function FinalCta() {
  return (
    <Section tone="white" border="top">
      <div className="max-w-[640px] mx-auto text-center">
        <h2 className="text-[24px] md:text-[34px] font-extrabold tracking-[-0.02em] leading-[1.1] text-pg-ink-900 m-0 text-balance">
          Belum yakin mau ambil yang mana?
        </h2>
        <p className="text-[14.5px] md:text-[16px] text-pg-ink-500 leading-relaxed mt-3.5 max-w-[52ch] mx-auto">
          Ceritakan dulu rencana kerjamu ke tim Perantau Global. Kami bantu memilih jalur yang paling
          masuk akal buat kondisimu sekarang, termasuk kalau ternyata kamu lebih cocok langsung
          melamar lowongan.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <a
            href={waLink("Halo Perantau Global, saya mau tanya soal Akademi Perantau.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-extrabold text-[14px] no-underline text-white bg-pg-wa hover:opacity-90 transition-opacity"
          >
            <Icon name="phone" size={17} />
            Konsultasi gratis via WhatsApp
          </a>
          <Link
            href="/lowongan"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-extrabold text-[14px] no-underline text-pg-ink-900 bg-pg-white border-[1.5px] border-pg-ink-200 hover:bg-pg-ink-50 transition-colors"
          >
            Lihat lowongan dulu
            <Icon name="arrow_right" size={16} stroke={2.2} />
          </Link>
        </div>
      </div>
    </Section>
  );
}
