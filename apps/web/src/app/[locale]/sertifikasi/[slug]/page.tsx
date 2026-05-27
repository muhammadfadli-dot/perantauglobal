import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/pg/Icon";
import {
  Eyebrow,
  FinalCTA,
  PageHero,
  Section,
} from "@/components/pg/primitives";
import { WhatsAppFab } from "@/components/pg/WhatsAppFab";
import {
  CERTIFICATIONS,
  getCertification,
  getPositionsForCert,
} from "@/lib/certifications";
import { getCertificationDetail } from "@/lib/certificationDetails";
import { waLink } from "@/lib/contact";

type RouteParams = { locale: string; slug: string };

export const dynamic = "force-static";

export function generateStaticParams() {
  return CERTIFICATIONS.map((c) => ({ locale: "id", slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCertification(slug);
  if (!c) return { title: "Sertifikasi tidak ditemukan" };
  return {
    title: `${c.name} — Perantau Global`,
    description: c.tagline,
  };
}

export default async function CertificationDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, slug } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  const cert = getCertification(slug);
  if (!cert) notFound();

  const detail = getCertificationDetail(slug);
  const positions = getPositionsForCert(slug);

  // Skill-specific / coming-soon state
  if (cert.status === "soon" || !detail) {
    return (
      <>
        <main className="px-5 md:px-8 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div
              className="w-16 h-16 rounded-2xl grid place-items-center mx-auto"
              style={{ background: "var(--pg-ink-100)", color: "var(--pg-ink-500)" }}
            >
              <Icon name={cert.icon} size={30} stroke={2} />
            </div>
            <Eyebrow tone="ink" className="mt-5">
              Segera
            </Eyebrow>
            <h1 className="text-[28px] md:text-4xl font-extrabold tracking-[-0.03em] mt-2">
              {cert.name}
            </h1>
            <p className="text-base text-pg-ink-700 leading-relaxed mt-3">
              {cert.tagline} Sedang kami siapkan lewat mitra resmi — akan
              diumumkan di aplikasi Perantau Global.
            </p>
            <Link
              href="/sertifikasi"
              className="inline-flex items-center gap-2 mt-7 text-pg-red-600 font-bold no-underline"
            >
              <Icon name="arrow_left" size={16} /> Lihat sertifikasi lain
            </Link>
          </div>
        </main>
        <WhatsAppFab />
      </>
    );
  }

  return (
    <>
      <main className="pb-24 md:pb-0">
        {/* Back link */}
        <div className="px-5 md:px-8 pt-8 md:pt-10">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/sertifikasi"
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-pg-ink-500 no-underline"
            >
              <Icon name="arrow_left" size={15} /> Semua sertifikasi
            </Link>
          </div>
        </div>

        <PageHero
          eyebrow="Paspor Perantau Global"
          title={cert.name}
        >
          <>
            {detail.intro.map((p, i) => (
              <p
                key={i}
                className="text-base md:text-[17px] text-pg-ink-700 leading-relaxed mt-4 max-w-prose"
              >
                {p}
              </p>
            ))}
            <div className="inline-flex items-center gap-2 mt-6 px-3.5 py-2 rounded-full text-[13px] font-bold bg-pg-gold-100 text-pg-gold-700">
              {cert.price}
              {cert.priceNote ? (
                <span className="font-medium opacity-80">· {cert.priceNote}</span>
              ) : null}
            </div>
          </>
        </PageHero>

        {/* YANG KAMU DAPAT */}
        <Section size="md" tone="transparent" shellClassName="max-w-4xl">
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">
            Yang kamu dapat
          </h2>
          <div className="mt-5 grid gap-3">
            {detail.includes.map((it) => (
              <div
                key={it.label}
                className="flex items-start gap-4 bg-white border border-pg-ink-100 rounded-2xl p-4 md:p-5"
              >
                <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0 bg-pg-gold-100 text-pg-gold-700">
                  <Icon name="check" size={20} stroke={2.4} />
                </div>
                <div>
                  <div className="text-[15px] md:text-base font-bold text-pg-ink-900">
                    {it.label}
                  </div>
                  <div className="text-[13.5px] md:text-[14.5px] text-pg-ink-600 leading-relaxed mt-1">
                    {it.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* CARA KERJA */}
        <Section size="md" tone="transparent" shellClassName="max-w-4xl" className="!pt-0">
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">
            Cara kerja
          </h2>
          <div className="mt-5">
            {detail.howItWorks.map((s, i, arr) => (
              <div
                key={s}
                className="grid grid-cols-[28px_1fr] gap-3"
                style={{ paddingBottom: i === arr.length - 1 ? 0 : 16 }}
              >
                <div className="relative">
                  <div className="w-6 h-6 rounded-full text-white grid place-items-center text-[11px] font-extrabold bg-pg-gold-700">
                    {i + 1}
                  </div>
                  {i < arr.length - 1 && (
                    <div
                      className="absolute left-[11px] top-[26px] -bottom-4 w-0.5 bg-pg-gold-200"
                    />
                  )}
                </div>
                <div className="text-[15px] font-semibold pt-0.5">{s}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* KREDENSIAL */}
        <Section size="md" tone="transparent" shellClassName="max-w-4xl" className="!pt-0">
          <div
            className="rounded-3xl p-6 md:p-8 text-white"
            style={{
              background:
                "linear-gradient(140deg, var(--pg-gold-500) 0%, var(--pg-gold-700) 55%, var(--pg-gold-900) 100%)",
              boxShadow: "0 20px 48px rgba(138,94,10,0.28)",
            }}
          >
            <div className="text-[10px] font-bold tracking-[0.22em] uppercase font-mono opacity-80">
              Kredensial yang kamu pegang
            </div>
            <div className="text-[22px] md:text-[28px] font-extrabold tracking-[-0.02em] leading-[1.15] mt-2">
              {detail.credential.title}
            </div>
            <p className="text-[14px] md:text-[15px] opacity-90 leading-relaxed mt-3">
              {detail.credential.body}
            </p>
          </div>
          <ul className="flex flex-col gap-2.5 mt-6">
            {detail.why.map((w) => (
              <li key={w} className="flex items-start gap-3 text-[14px] md:text-[15px] text-pg-ink-700">
                <span className="mt-0.5 shrink-0 text-pg-gold-700">
                  <Icon name="check" size={16} stroke={2.6} />
                </span>
                {w}
              </li>
            ))}
          </ul>
        </Section>

        {/* LOWONGAN YANG NYAMBUNG */}
        {positions.length > 0 && (
          <Section size="md" tone="transparent" shellClassName="max-w-4xl" className="!pt-0">
            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">
              Lowongan {cert.country} yang bisa kamu incar
            </h2>
            <p className="text-[14px] md:text-[15px] text-pg-ink-600 leading-relaxed mt-2">
              Paspor ini menyiapkan kamu untuk semua posisi {cert.country}. Bukan
              syarat — tapi bikin kamu lebih siap saat melamar.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {positions.map((p) => (
                <Link
                  key={p.slug}
                  href={`/lowongan/${p.slug}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white border border-pg-ink-200 text-[13px] font-semibold text-pg-ink-900 no-underline hover:border-pg-ink-300"
                >
                  {p.role}
                  <span className="text-pg-ink-400">· {p.salary}</span>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* FAQ */}
        {detail.faq && detail.faq.length > 0 && (
          <Section size="md" tone="transparent" shellClassName="max-w-3xl" className="!pt-0">
            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight mb-3">
              Pertanyaan umum
            </h2>
            <div>
              {detail.faq.map((item, i) => (
                <details
                  key={item.q}
                  className={`group py-4 ${i ? "border-t border-pg-ink-100" : ""}`}
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-[15px] md:text-base font-bold text-pg-ink-900 pr-3">
                      {item.q}
                    </span>
                    <Icon
                      name="chevron_down"
                      size={18}
                      className="text-pg-ink-400 group-open:rotate-180 transition-transform shrink-0"
                    />
                  </summary>
                  <div className="mt-2 text-[14.5px] text-pg-ink-700 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </Section>
        )}

        <FinalCTA
          eyebrow="Siap mulai?"
          title={<>Tertarik dengan {cert.name}?</>}
          body="Daftar di aplikasi Perantau Global, lalu pilih Paspor saat akun aktif."
          primaryHref="/lowongan"
          primaryLabel="Lihat lowongan terkait"
          whatsappHref={waLink(`Halo, saya mau tanya soal ${cert.name}.`)}
        />
      </main>
      <WhatsAppFab />
    </>
  );
}
