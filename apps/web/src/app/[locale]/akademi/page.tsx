import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/pg/Icon";
import { Section } from "@/components/pg/primitives";
import { WhatsAppFab } from "@/components/pg/WhatsAppFab";
import { waLink } from "@/lib/contact";
import {
  fetchPublishedPrograms,
  certificationPrograms,
  freePrograms,
  priceLabel,
  countryLabel,
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

  // The registration flow is the same across certification products, so the
  // page explains it once instead of repeating it on every card.
  const flow = certs.find((c) => (c.content.flow?.length ?? 0) > 0)?.content.flow ?? [];
  const feeNote = certs.find((c) => c.content.fee_note)?.content.fee_note;

  return (
    <>
      <main>
        <AkademiHero certCount={certs.length} freeCount={free.length} />

        {certs.length > 0 && <CertSection programs={certs} />}
        {flow.length > 0 && <FlowSection flow={flow} feeNote={feeNote} />}
        {free.length > 0 && <FreeSection programs={free} />}

        <FinalCta />
      </main>
      <WhatsAppFab />
    </>
  );
}

/* ------------------------------------------------------------------ hero */

function AkademiHero({ certCount, freeCount }: { certCount: number; freeCount: number }) {
  return (
    <div
      className="text-white"
      style={{
        background: "linear-gradient(135deg, var(--pa-amber-600) 0%, var(--pa-amber-700) 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[11px] font-bold uppercase tracking-[0.1em]"
          style={{ background: "rgba(255,255,255,0.18)" }}
        >
          Akademi Perantau
        </div>
        <h1 className="text-[30px] md:text-[52px] font-extrabold tracking-[-0.02em] leading-[1.06] mt-4 max-w-[19ch]">
          Siapkan dirimu dulu, baru berangkat.
        </h1>
        <p className="text-[15px] md:text-[18px] opacity-90 mt-4 max-w-[58ch] leading-relaxed">
          Pelatihan dan sertifikasi kompetensi bersama Lembaga Vokasi Universitas Indonesia, plus
          kelas gratis yang bisa kamu mulai hari ini juga. Semua pendaftaran di sini gratis.
        </p>
        <div className="flex flex-wrap gap-2 mt-6">
          <HeroChip>{certCount} program sertifikasi</HeroChip>
          <HeroChip>{freeCount} kelas gratis</HeroChip>
          <HeroChip>Jalur penempatan resmi P3MI</HeroChip>
        </div>
      </div>
    </div>
  );
}

function HeroChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1.5 rounded-lg font-mono text-[12px] font-bold tracking-[0.02em]"
      style={{ background: "rgba(255,255,255,0.2)" }}
    >
      {children}
    </span>
  );
}

/* ----------------------------------------------------- certification cards */

function CertSection({ programs }: { programs: AcademyProgram[] }) {
  return (
    <Section tone="paper" border="top">
      <div className="flex flex-col gap-2 max-w-2xl mb-9">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-gold-700">
          Sertifikat Perantau
        </div>
        <h2 className="text-[24px] md:text-[38px] font-extrabold tracking-[-0.02em] leading-[1.1] text-pg-ink-900 m-0 text-balance">
          Pelatihan bersertifikat, lalu jalur kerja ke luar negeri.
        </h2>
        <p className="text-[14px] md:text-[16px] font-medium leading-relaxed text-pg-ink-500 mt-2 max-w-[62ch]">
          Program bersama Lembaga Vokasi Universitas Indonesia. Kamu dilatih sampai standar kerja
          industri, diuji kompetensinya, lalu diarahkan ke lowongan Perantau Global lewat jalur
          penempatan resmi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {programs.map((p, i) => (
          <CertCard key={p.slug} program={p} highlight={i === 0} />
        ))}
      </div>
    </Section>
  );
}

function CertCard({ program, highlight }: { program: AcademyProgram; highlight: boolean }) {
  const country = countryLabel(program.country);
  const curriculum = program.content.curriculum ?? [];

  return (
    <div
      className="flex flex-col gap-3.5 p-5 md:p-6 rounded-[20px] h-full"
      style={{
        background: "var(--pg-white)",
        border: highlight
          ? "1.5px solid var(--pa-amber-500)"
          : "1px solid var(--pg-ink-200)",
        boxShadow: "var(--shadow-pg-1)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        {country && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.04em] text-pg-ink-600">
            <Icon name="location" size={13} />
            {country}
          </span>
        )}
        {highlight && (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.08em]"
            style={{ background: "var(--pa-amber-100)", color: "var(--pa-amber-700)" }}
          >
            Dibuka duluan
          </span>
        )}
      </div>

      <h3 className="text-[19px] md:text-[21px] font-extrabold tracking-[-0.018em] text-pg-ink-900 m-0 leading-snug">
        {program.title}
      </h3>

      {program.subtitle && (
        <p className="text-[13.5px] text-pg-ink-600 leading-relaxed m-0">{program.subtitle}</p>
      )}

      {curriculum.length > 0 && (
        <ul className="flex flex-col gap-1.5 list-none p-0 m-0 mt-0.5">
          {curriculum.slice(0, 4).map((c) => (
            <li key={c.title} className="flex items-start gap-2 text-[13px] text-pg-ink-700">
              <span style={{ color: "var(--pa-amber-600)", marginTop: 2 }}>
                <Icon name="check" size={13} stroke={3} />
              </span>
              {c.title}
            </li>
          ))}
        </ul>
      )}

      <div
        className="flex items-center justify-between gap-3 mt-auto pt-3.5"
        style={{ borderTop: "1px dashed var(--pg-ink-200)" }}
      >
        <div className="flex flex-col">
          <span className="text-[13.5px] font-bold text-pg-ink-900">{priceLabel(program)}</span>
          <span className="font-mono text-[11px] text-pg-ink-500">Daftar dulu, gratis</span>
        </div>
        <Link
          href={`/akademi/kelas/${program.slug}`}
          className="inline-flex items-center gap-1.5 font-bold text-[13px] no-underline"
          style={{ color: "var(--pa-amber-700)" }}
        >
          Lihat detail
          <Icon name="arrow_right" size={14} stroke={2.4} />
        </Link>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- the flow */

function FlowSection({ flow, feeNote }: { flow: ProgramFlowStep[]; feeNote?: string }) {
  return (
    <Section tone="white" border="top">
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] gap-8 md:gap-12 items-start">
        <div>
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-gold-700">
            Alurnya
          </div>
          <h2 className="text-[22px] md:text-[32px] font-extrabold tracking-[-0.02em] leading-[1.12] text-pg-ink-900 m-0 mt-2 text-balance">
            Dari daftar sampai berangkat kerja.
          </h2>

          <ol className="flex flex-col gap-0 list-none p-0 m-0 mt-6">
            {flow.map((step, i) => (
              <li key={step.title} className="flex gap-4 pb-5 last:pb-0">
                <div className="flex flex-col items-center shrink-0">
                  <span
                    className="grid place-items-center w-8 h-8 rounded-full font-mono text-[13px] font-bold"
                    style={{ background: "var(--pa-amber-100)", color: "var(--pa-amber-700)" }}
                  >
                    {i + 1}
                  </span>
                  {i < flow.length - 1 && (
                    <span
                      aria-hidden
                      className="w-px flex-1 mt-1.5"
                      style={{ background: "var(--pg-ink-200)" }}
                    />
                  )}
                </div>
                <div className="pt-1">
                  <div className="text-[15px] font-bold text-pg-ink-900 leading-snug">
                    {step.title}
                  </div>
                  {step.detail && (
                    <p className="text-[13.5px] text-pg-ink-600 leading-relaxed m-0 mt-1">
                      {step.detail}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="md:sticky md:top-6 flex flex-col gap-4">
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--pa-amber-50)", border: "1px solid var(--pa-amber-200)" }}
          >
            <div className="flex items-center gap-2 text-[13px] font-extrabold text-pg-ink-900">
              <span style={{ color: "var(--pa-amber-700)" }}>
                <Icon name="wallet" size={17} />
              </span>
              Soal biaya, biar jelas dari awal
            </div>
            <p className="text-[13.5px] text-pg-ink-700 leading-relaxed m-0 mt-2.5">
              Mendaftar di halaman ini <b className="text-pg-ink-900">gratis</b>. Biaya program baru
              kami informasikan setelah kamu lolos screening, jadi kamu tidak diminta membayar apa
              pun sebelum tahu kamu cocok.
            </p>
            {feeNote && (
              <p className="text-[13px] text-pg-ink-600 leading-relaxed m-0 mt-3 pt-3" style={{ borderTop: "1px dashed var(--pa-amber-200)" }}>
                {feeNote}
              </p>
            )}
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--pg-ink-50)", border: "1px solid var(--pg-ink-200)" }}
          >
            <div className="flex items-center gap-2 text-[13px] font-extrabold text-pg-ink-900">
              <span style={{ color: "var(--pg-ink-500)" }}>
                <Icon name="shield" size={17} />
              </span>
              Masih ragu?
            </div>
            <p className="text-[13.5px] text-pg-ink-700 leading-relaxed m-0 mt-2.5">
              Tanya dulu ke tim kami sebelum daftar. Konsultasinya gratis dan tidak ada kewajiban
              apa pun.
            </p>
            <a
              href={waLink("Halo Perantau Global, saya mau tanya soal program Sertifikat Perantau.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-[13px] no-underline mt-3"
              style={{ color: "var(--pa-amber-700)" }}
            >
              Konsultasi via WhatsApp
              <Icon name="arrow_right" size={14} stroke={2.4} />
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ free classes */

function FreeSection({ programs }: { programs: AcademyProgram[] }) {
  return (
    <Section tone="paper" border="top">
      <div className="flex flex-col gap-2 max-w-2xl mb-9">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-gold-700">
          Belajar gratis
        </div>
        <h2 className="text-[24px] md:text-[38px] font-extrabold tracking-[-0.02em] leading-[1.1] text-pg-ink-900 m-0 text-balance">
          Mulai sekarang, tanpa bayar apa pun.
        </h2>
        <p className="text-[14px] md:text-[16px] font-medium leading-relaxed text-pg-ink-500 mt-2 max-w-[62ch]">
          Kelas singkat yang bisa kamu selesaikan sambil menunggu proses lamaranmu berjalan. Cukup
          daftar, lalu belajar lewat aplikasi kapan saja.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {programs.map((p) => (
          <FreeCard key={p.slug} program={p} />
        ))}
      </div>
    </Section>
  );
}

function FreeCard({ program }: { program: AcademyProgram }) {
  return (
    <Link
      href={`/akademi/kelas/${program.slug}`}
      className="flex flex-col gap-3 p-5 md:p-6 rounded-[20px] h-full no-underline"
      style={{
        background: "var(--pg-white)",
        border: "1px solid var(--pg-ink-200)",
        boxShadow: "var(--shadow-pg-1)",
      }}
    >
      <span
        className="inline-flex items-center self-start px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.08em]"
        style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
      >
        Gratis
      </span>

      <h3 className="text-[18px] md:text-[20px] font-extrabold tracking-[-0.018em] text-pg-ink-900 m-0 leading-snug">
        {program.title}
      </h3>

      {program.subtitle && (
        <p className="text-[13.5px] text-pg-ink-600 leading-relaxed m-0">{program.subtitle}</p>
      )}

      <div className="flex items-center gap-3 mt-auto pt-3 text-[12.5px] text-pg-ink-500">
        {program.duration_label && (
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" size={13} />
            {program.duration_label}
          </span>
        )}
      </div>

      <span
        className="inline-flex items-center gap-1.5 font-bold text-[13px]"
        style={{ color: "var(--pa-amber-700)" }}
      >
        Mulai belajar
        <Icon name="arrow_right" size={14} stroke={2.4} />
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------- final block */

function FinalCta() {
  return (
    <Section tone="white" border="top">
      <div className="max-w-[52ch]">
        <h2 className="text-[22px] md:text-[32px] font-extrabold tracking-[-0.02em] leading-[1.12] text-pg-ink-900 m-0 text-balance">
          Belum yakin mau ambil yang mana?
        </h2>
        <p className="text-[14.5px] md:text-[16px] text-pg-ink-600 leading-relaxed mt-3">
          Ceritakan dulu rencana kerjamu ke tim Perantau Global. Kami bantu memilih jalur yang paling
          masuk akal buat kondisimu sekarang, termasuk kalau ternyata kamu lebih cocok langsung
          melamar lowongan.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <a
            href={waLink("Halo Perantau Global, saya mau tanya soal Akademi Perantau.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[14px] no-underline text-white"
            style={{ background: "var(--pa-amber-600)" }}
          >
            Konsultasi gratis via WhatsApp
            <Icon name="arrow_right" size={16} stroke={2.4} />
          </a>
          <Link
            href="/lowongan"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[14px] no-underline text-pg-ink-900"
            style={{ background: "var(--pg-white)", border: "1.5px solid var(--pg-ink-200)" }}
          >
            Lihat lowongan dulu
            <Icon name="arrow_right" size={16} stroke={2.4} />
          </Link>
        </div>
      </div>
    </Section>
  );
}
