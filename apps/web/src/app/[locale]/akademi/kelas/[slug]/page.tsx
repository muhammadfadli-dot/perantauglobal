import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/pg/Icon";
import { Section } from "@/components/pg/primitives";
import {
  AcademyRegisterForm,
  type AcademyRegField,
} from "@/components/pg/akademi/AcademyRegisterForm";
import { PartnerMarks } from "@/components/pg/akademi/PartnerMarks";
import { ProgramFlow } from "@/components/pg/akademi/ProgramFlow";
import { supabaseV2 } from "@/lib/supabase-v2";
import { countryLabel, priceLabel, type ProgramContent } from "@/lib/academy";
import { waLink } from "@/lib/contact";

type RouteParams = { locale: string; slug: string };

export const dynamic = "force-dynamic";

const MODE_LABEL: Record<string, string> = {
  in_app: "Belajar di aplikasi",
  webinar: "Webinar live",
  offline: "Tatap muka",
  external: "Tes eksternal",
};
const OUTPUT_LABEL: Record<string, string> = {
  certificate: "Sertifikat",
  psikotes_result: "Hasil psikotes",
  completion: "Bukti penyelesaian",
  none: "Tanpa sertifikat",
};

async function getProgram(slug: string) {
  const db = supabaseV2();
  const { data: program } = await db
    .from("academy_programs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!program) return null;
  const { data: fields } = await db
    .from("program_registration_fields")
    .select("*")
    .eq("program_slug", slug)
    .order("sort_order", { ascending: true });
  return { program, fields: fields ?? [] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProgram(slug);
  if (!result) return { title: "Kelas tidak ditemukan" };
  return {
    title: `${result.program.title} - Akademi Perantau`,
    description: result.program.subtitle ?? "Daftar kelas persiapan kerja ke luar negeri.",
  };
}

export default async function AcademyClassPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, slug } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  const result = await getProgram(slug);
  if (!result) notFound();
  const { program } = result;
  const content = (program.content ?? {}) as ProgramContent;
  const price = priceLabel(program);
  const country = countryLabel(program.country);

  // Classroom-delivered paid programs follow register -> screening -> pay.
  // Their copy must not promise instant access to in-app lessons.
  const isScreened = !program.is_free && program.delivery_mode !== "in_app";

  const regFields: AcademyRegField[] = result.fields.map((f) => ({
    field_key: f.field_key,
    field_label: f.field_label,
    field_help: f.field_help,
    field_type: f.field_type,
    options: (f.options as { value: string; label: string }[] | null) ?? null,
    required: f.required,
  }));

  return (
    <>
      <main className="pb-[74px] md:pb-0">
        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-3.5">
          <Link
            href="/akademi"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-pg-ink-500 no-underline hover:text-pg-ink-900"
          >
            <Icon name="arrow_left" size={15} stroke={2.2} />
            Akademi Perantau
          </Link>
        </div>

        {/* C1 hero */}
        <div
          className="text-white mt-3.5"
          style={{
            background: "linear-gradient(135deg, var(--pa-amber-600) 0%, var(--pa-amber-700) 100%)",
          }}
        >
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-13 grid md:grid-cols-[1.05fr_.95fr] gap-6 md:gap-10 items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                <HeroChip>
                  {MODE_LABEL[program.delivery_mode] ?? program.delivery_mode} ·{" "}
                  {program.facilitated_by}
                </HeroChip>
                {country && (
                  <span
                    className="inline-flex items-center gap-1.5 font-mono text-[12px] font-bold px-3 py-2 rounded-[10px] bg-pg-white"
                    style={{ color: "var(--pa-amber-700)" }}
                  >
                    <Icon name="location" size={13} stroke={2.2} />
                    Tujuan kerja: {country}
                  </span>
                )}
              </div>

              <h1 className="text-[28px] md:text-[42px] font-extrabold tracking-[-0.02em] leading-[1.06] mt-4 max-w-[16ch]">
                {program.title}
              </h1>
              {program.subtitle && (
                <p className="text-[15px] md:text-[17px] font-medium leading-relaxed opacity-90 mt-3 max-w-[50ch]">
                  {program.subtitle}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-5">
                <HeroChip>{price}</HeroChip>
                {program.duration_label && <HeroChip>{program.duration_label}</HeroChip>}
                <HeroChip>
                  Output: {OUTPUT_LABEL[program.output_type] ?? program.output_type}
                </HeroChip>
              </div>
            </div>

            {program.cover_image && (
              <div
                className="relative rounded-2xl overflow-hidden border-[5px] border-white/90"
                style={{ aspectRatio: "4 / 3", boxShadow: "0 18px 42px rgba(0,0,0,0.28)" }}
              >
                <Image
                  src={program.cover_image}
                  alt={program.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>

        <Section>
          <div className="grid md:grid-cols-[1fr_minmax(360px,420px)] gap-8 md:gap-11 items-start">
            {/* Left: program detail */}
            {/* No order swap: on a phone the details come first and the form
                follows, which is what the sticky bottom CTA jumps to. Putting
                the form first would leave that CTA pointing at content the
                candidate has already scrolled past. */}
            <div className="flex flex-col gap-8 md:gap-10">
              {content.intro && (
                <p className="text-[15px] md:text-[17px] leading-relaxed text-pg-ink-700">
                  {content.intro}
                </p>
              )}

              {content.benefits && content.benefits.length > 0 && (
                <div>
                  <SubHeading>Yang kamu dapat</SubHeading>
                  <div className="flex flex-col gap-3 mt-3.5">
                    {content.benefits.map((b, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="flex-none mt-0.5" style={{ color: "var(--pa-amber-600)" }}>
                          <Icon name="check" size={19} stroke={2.6} />
                        </span>
                        <span className="text-[14.5px] leading-relaxed text-pg-ink-700">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {content.curriculum && content.curriculum.length > 0 && (
                <div>
                  <SubHeading>Yang kamu pelajari</SubHeading>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3.5">
                    {content.curriculum.map((c, i) => (
                      <div
                        key={c.title}
                        className="p-4 rounded-2xl bg-pg-white border border-pg-ink-100"
                      >
                        <div
                          className="font-mono text-[12px] font-bold"
                          style={{ color: "var(--pa-amber-600)" }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="text-[14.5px] font-extrabold text-pg-ink-900 mt-1.5">
                          {c.title}
                        </div>
                        {c.detail && (
                          <p className="text-[12.5px] leading-relaxed text-pg-ink-500 mt-1">
                            {c.detail}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {content.flow && content.flow.length > 0 && (
                <div>
                  <SubHeading>Alur dari daftar sampai berangkat</SubHeading>
                  <div className="mt-3.5">
                    <ProgramFlow flow={content.flow} compact />
                  </div>
                </div>
              )}

              {(content.fee_note || (content.fee_breakdown?.length ?? 0) > 0) && (
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: "var(--pa-amber-50)",
                    border: "1px solid var(--pa-amber-200)",
                  }}
                >
                  <div className="flex items-center gap-2 text-[14px] font-extrabold text-pg-ink-900">
                    <span style={{ color: "var(--pa-amber-700)" }}>
                      <Icon name="wallet" size={18} />
                    </span>
                    Soal biaya, biar jelas dari awal
                  </div>

                  {/* Angka lebih dulu, paragraf sesudahnya. Permintaan Ifa 3 Agu
                      adalah biaya "dicantumkan secara eksplisit", dan satu
                      paragraf panjang membuat nominal harus dicari dulu. Baris
                      terpisah bikin totalnya, uang mukanya, dan sisanya
                      terbaca sekali lihat. */}
                  {content.fee_breakdown && content.fee_breakdown.length > 0 && (
                    <div className="mt-3.5 flex flex-col gap-2">
                      {content.fee_breakdown.map((line) => (
                        <div
                          key={line.label}
                          className="bg-pg-white rounded-xl px-3.5 py-3"
                          style={{ border: "1px solid var(--pa-amber-200)" }}
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-[13.5px] font-bold text-pg-ink-900">
                              {line.label}
                            </span>
                            <span
                              className="font-mono text-[14px] font-extrabold whitespace-nowrap"
                              style={{ color: "var(--pa-amber-700)" }}
                            >
                              {line.amount}
                            </span>
                          </div>
                          {line.note && (
                            <p className="text-[12px] leading-relaxed text-pg-ink-500 mt-1 m-0">
                              {line.note}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {content.fee_note && (
                    <p
                      className="text-[13.5px] leading-relaxed mt-3 m-0"
                      style={{ color: "var(--pa-amber-700)" }}
                    >
                      {content.fee_note}
                    </p>
                  )}
                </div>
              )}

              {/* Lembaga di balik sertifikatnya. Cuma untuk produk yang memang
                  disertifikasi mitra: kelas gratis tidak boleh ikut memakai
                  mark UI. Ifa melaporkan 3 Agu logonya belum muncul di halaman
                  ini padahal sudah tayang di /akademi. */}
              {program.credential_issuer === "Lembaga Vokasi UI" && (
                <div>
                  <SubHeading>Lembaga di balik sertifikatnya</SubHeading>
                  <div className="mt-3.5">
                    <PartnerMarks accent="amber" />
                  </div>
                </div>
              )}

              {content.doc_checklist && content.doc_checklist.length > 0 && (
                <div>
                  <SubHeading>Siapin dokumen ini</SubHeading>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3.5">
                    {content.doc_checklist.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-pg-white border border-pg-ink-100"
                      >
                        <span className="text-pg-ink-400 mt-0.5">
                          <Icon name="doc" size={16} />
                        </span>
                        <div>
                          <div className="text-[14px] font-semibold text-pg-ink-800">{d.label}</div>
                          {d.note && <div className="text-[12.5px] text-pg-ink-500">{d.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: registration form (sticky on desktop) */}
            <div
              id="daftar"
              /* Anchor offset has to clear the sticky header, which is taller
                 on mobile (two rows, ~125px) than on desktop (~76px). Too
                 small an offset lands the form title underneath it. */
              className="md:sticky md:top-24 scroll-mt-[136px] md:scroll-mt-24"
            >
              <AcademyRegisterForm
                programSlug={program.slug}
                programTitle={program.title}
                fields={regFields}
                isFree={program.is_free}
                isScreened={isScreened}
              />
            </div>
          </div>
        </Section>

        {/* C7 closing */}
        <Section tone="ink" border="top" size="md">
          <div className="flex items-center justify-between gap-5 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <SubHeading>Masih ada yang mau ditanya?</SubHeading>
              <p className="text-[13.5px] leading-relaxed text-pg-ink-500 mt-2 max-w-[52ch]">
                Tanya dulu ke tim kami sebelum daftar. Konsultasinya gratis dan tidak ada kewajiban
                apa pun.
              </p>
            </div>
            <a
              href={waLink(`Halo Perantau Global, saya mau tanya soal ${program.title}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-extrabold text-[14px] no-underline text-white bg-pg-wa hover:opacity-90 transition-opacity"
            >
              <Icon name="phone" size={17} />
              Konsultasi via WhatsApp
            </a>
          </div>
        </Section>
      </main>

      {/* Mobile sticky CTA: the form is below the fold on a phone, so the price
          and the way to reach it stay pinned. Plain anchor, works without JS. */}
      <div className="md:hidden fixed left-0 right-0 bottom-0 z-40 flex items-center gap-3 bg-pg-white border-t border-pg-ink-200 px-4 py-2.5 shadow-[0_-4px_20px_rgba(20,20,20,0.08)]">
        <div className="flex-none">
          <div className="text-[14px] font-extrabold text-pg-ink-900 leading-none">{price}</div>
          <div className="font-mono text-[10.5px] text-pg-ink-500 mt-0.5">
            {program.is_free ? "Langsung bisa mulai" : "Daftar dulu, gratis"}
          </div>
        </div>
        <a
          href="#daftar"
          className="flex-1 inline-flex items-center justify-center gap-2 min-h-[46px] px-4 rounded-xl font-extrabold text-[14px] no-underline text-white"
          style={{ background: "var(--pa-amber-600)" }}
        >
          {program.is_free ? "Daftar gratis" : "Daftar gratis"}
          <Icon name="arrow_right" size={16} stroke={2.4} />
        </a>
      </div>
    </>
  );
}

function HeroChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[12px] font-bold tracking-[0.02em] px-3 py-2 rounded-[10px]"
      style={{ background: "var(--pg-overlay-white-strong)" }}
    >
      {children}
    </span>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[19px] md:text-[23px] font-extrabold tracking-[-0.02em] leading-tight text-pg-ink-900 m-0">
      {children}
    </h2>
  );
}
