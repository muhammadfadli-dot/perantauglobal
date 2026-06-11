import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/pg/Icon";
import { FinalCTA, ButtonLink } from "@/components/pg/primitives";
import { ApplyForm } from "@/components/pg/ApplyForm";
import { ExistingUserShortcut } from "@/components/pg/ExistingUserShortcut";
import { EditorialHero } from "@/components/pg/detail/EditorialHero";
import { QuickFacts } from "@/components/pg/detail/QuickFacts";
import { NumberedSection } from "@/components/pg/detail/NumberedSection";
import { RelatedPositions } from "@/components/pg/detail/RelatedPositions";
import { TrustAndShare } from "@/components/pg/detail/TrustAndShare";
import {
  fetchOpenJobOrders,
  fetchAppliedFields,
  fetchPositionContent,
  fetchPositionForDetail,
  fetchPositionSlugsForBuild,
  fetchPositionsForCatalog,
} from "@/lib/positions-db";
import { resolvePositionDetail } from "@/lib/positionContent";
import { COUNTRY_META, countryKeyFromName, cityForSlug } from "@/lib/lowonganCountries";
import { waLink } from "@/lib/contact";
import { SITE_URL } from "@/lib/site";

type RouteParams = { locale: string; slug: string };

// Admin-authored media/SEO live in positions.content JSONB (set via the Media & SEO
// editor tab). The content blob is typed `unknown`; read these keys defensively.
type ContentMediaSeo = {
  media?: { heroUrl?: string | null; ogImageUrl?: string | null } | null;
  seo?: { metaTitle?: string | null; metaDescription?: string | null } | null;
};
function asMediaSeo(content: unknown): ContentMediaSeo | null {
  return content && typeof content === "object" ? (content as ContentMediaSeo) : null;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await fetchPositionSlugsForBuild();
  return slugs.map((slug) => ({ locale: "id", slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [p, content] = await Promise.all([
    fetchPositionForDetail(slug),
    fetchPositionContent(slug),
  ]);
  if (!p) return { title: "Lowongan tidak ditemukan" };
  const cms = asMediaSeo(content);
  const title =
    cms?.seo?.metaTitle?.trim() || `Lowongan ${p.role} ${p.country} — ${p.salary}/bulan`;
  const description =
    cms?.seo?.metaDescription?.trim() ||
    `Lowongan ${p.role} di ${p.country}. Gaji ${p.salary}, ${p.contractLabel ?? "kontrak resmi"}. Bebas biaya sebelum offering letter. Daftar di Perantau Global.`;
  const ogImage = cms?.media?.ogImageUrl?.trim() || cms?.media?.heroUrl?.trim();
  // Job-detail pages are id-only; emit a canonical so duplicate/query-string
  // URLs don't split ranking across the catalog's high-intent pages.
  const canonical = `${SITE_URL}/id/lowongan/${slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    ...(ogImage ? { openGraph: { images: [ogImage], url: canonical } } : {}),
  };
}

export default async function LowonganDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, slug } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  const [baseStatic, jobOrders, appliedFields, dbContent, allPositions] = await Promise.all([
    fetchPositionForDetail(slug),
    fetchOpenJobOrders(),
    fetchAppliedFields(slug),
    fetchPositionContent(slug),
    fetchPositionsForCatalog(),
  ]);
  if (!baseStatic) notFound();

  const detail = resolvePositionDetail(slug, dbContent);
  if (!detail) notFound();
  const jo = jobOrders.get(slug);
  const position = jo
    ? {
        ...baseStatic,
        status: "open" as const,
        batch: {
          label: jo.intake_label,
          slotsFilled: jo.slot_filled,
          slotsTotal: jo.slot_count,
          deadline: jo.deadline
            ? new Date(jo.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
            : "—",
        },
      }
    : { ...baseStatic, status: "queue" as const, batch: undefined };

  const countryKey = countryKeyFromName(position.country);
  const country = COUNTRY_META[countryKey];
  const city = cityForSlug(slug, countryKey);
  // Prefer the admin-authored hero (Media & SEO tab); fall back to the per-slug static asset.
  const heroImg =
    asMediaSeo(dbContent)?.media?.heroUrl?.trim() || `/images/lowongan/${slug}.jpg`;
  const waMessage = `Halo, saya mau tanya soal lowongan ${position.role} ${position.country}.`;

  return (
    <main className="pb-24 md:pb-0">
      {/* Editorial hero */}
      <EditorialHero
        role={position.role}
        country={country}
        city={city}
        heroImg={heroImg}
        waMessage={waMessage}
      />

      {/* Floating QuickFacts overlapping hero */}
      <QuickFacts
        salary={position.salary}
        salaryNote={position.salaryNote}
        salaryIdr={detail.salaryIdr}
        contractLabel={position.contractLabel}
        gender={position.gender}
        age={position.age}
        processDuration={detail.processDuration}
      />

      {/* Batch banner (open/queue) */}
      {position.status === "open" && position.batch ? (
        <section className="px-5 md:px-8 mb-8">
          <div className="max-w-6xl mx-auto">
            <div
              className="flex items-center gap-3 rounded-2xl px-5 py-4"
              style={{
                background: "var(--pg-ok-bg)",
                border: "1px solid rgba(15,138,74,0.18)",
              }}
            >
              <span
                aria-hidden
                className="w-2 h-2 rounded-full animate-pulse shrink-0"
                style={{ background: "var(--pg-ok)" }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] md:text-[15px] font-extrabold text-pg-ok">
                  {position.batch.label} · lagi buka
                </div>
                <div className="text-[12.5px] md:text-[13px] mt-0.5 text-pg-ok">
                  {position.batch.slotsFilled} / {position.batch.slotsTotal} terisi · deadline{" "}
                  {position.batch.deadline}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-5 md:px-8 mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start gap-3 rounded-2xl border border-pg-ink-200 bg-pg-ink-50 px-5 py-4">
              <Icon name="info" size={18} className="text-pg-ink-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-[14px] font-extrabold text-pg-ink-900">Belum ada batch aktif</div>
                <div className="text-[12.5px] text-pg-ink-500 mt-0.5 leading-relaxed">
                  Daftar antrian — kami hubungi via email saat batch baru dibuka.
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Article + sidebar grid */}
      <div className="px-5 md:px-8 pb-12">
        <div className="max-w-6xl mx-auto md:grid md:grid-cols-[1fr_400px] md:gap-14 items-start">
          <article>
            {/* 01 — Job description */}
            {detail.jobDescription && detail.jobDescription.length > 0 && (
              <NumberedSection
                num="01"
                eyebrow="Yang kamu kerjain"
                title={
                  <>
                    Tugas <span className="text-pg-red-600">harian.</span>
                  </>
                }
              >
                <div className="flex flex-col gap-3 mt-2">
                  {detail.jobDescription.map((d, i) => (
                    <div key={i} className="flex gap-3.5">
                      <span
                        className="w-7 h-7 rounded-full grid place-items-center shrink-0 mt-0.5 font-mono text-[12px] font-bold"
                        style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
                      >
                        {i + 1}
                      </span>
                      <div className="text-[15px] md:text-[16px] leading-relaxed text-pg-ink-700">
                        {d}
                      </div>
                    </div>
                  ))}
                </div>
              </NumberedSection>
            )}

            {/* 02 — Benefits (salary card + benefit grid) */}
            {detail.benefits && detail.benefits.length > 0 && (
              <NumberedSection
                num="02"
                eyebrow="Yang kamu dapat"
                title={
                  <>
                    Gaji &amp; <span className="text-pg-red-600">fasilitas.</span>
                  </>
                }
              >
                <div
                  className="grid md:grid-cols-[1.4fr_1fr] gap-0 rounded-2xl overflow-hidden mb-5"
                  style={{
                    background: "linear-gradient(135deg, #fff 0%, #fff7f7 100%)",
                    border: "1px solid var(--pg-red-100)",
                  }}
                >
                  <div className="flex flex-col gap-1 p-5 md:p-6 border-b md:border-b-0 md:border-r border-pg-red-100">
                    <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-pg-red-700">
                      Gaji pokok per bulan
                    </span>
                    <span
                      className="font-mono font-extrabold tracking-[-0.025em] text-pg-ink-900 leading-tight"
                      style={{ fontSize: "clamp(32px, 4.5vw, 44px)" }}
                    >
                      {position.salary}
                    </span>
                    {position.salaryNote && (
                      <span className="text-[13px] text-pg-ink-500 mt-0.5">
                        {position.salaryNote}
                      </span>
                    )}
                    {detail.salaryIdr && (
                      <span className="font-mono text-[13px] font-semibold text-pg-red-700">
                        ≈ {detail.salaryIdr}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 p-5 md:p-6">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-pg-ink-500">
                      Kontrak
                    </span>
                    <span className="text-[15px] font-bold text-pg-ink-900">
                      {position.contractLabel ?? "—"}
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-pg-ink-500 mt-2">
                      Lokasi
                    </span>
                    <span className="text-[15px] font-bold text-pg-ink-900">
                      {city}, {position.country}
                    </span>
                  </div>
                </div>

                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
                >
                  {detail.benefits
                    .filter((b) => b.icon !== "wallet")
                    .map((b) => (
                      <div
                        key={b.label}
                        className="flex items-start gap-3 p-3.5 rounded-2xl bg-pg-white border border-pg-ink-100"
                      >
                        <span
                          className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
                          style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
                        >
                          <Icon name={b.icon} size={18} stroke={2} />
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[12px] text-pg-ink-500">{b.label}</span>
                          <span className="text-[14px] font-extrabold text-pg-ink-900">
                            {b.value}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </NumberedSection>
            )}

            {/* 03 — Qualifications */}
            {detail.qualifications.length > 0 && (
              <NumberedSection
                num="03"
                eyebrow="Apa syaratnya"
                title={
                  <>
                    Syarat &amp; <span className="text-pg-red-600">kualifikasi.</span>
                  </>
                }
              >
                <div className="flex flex-col">
                  {detail.qualifications.map((q, i) => (
                    <div
                      key={q}
                      className={`flex gap-3 py-3 ${i ? "border-t border-pg-ink-100" : ""}`}
                    >
                      <span
                        className="w-6 h-6 rounded-full grid place-items-center shrink-0 mt-0.5"
                        style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
                      >
                        <Icon name="check" size={14} stroke={3} />
                      </span>
                      <span className="text-[15px] leading-relaxed text-pg-ink-700">{q}</span>
                    </div>
                  ))}
                </div>
              </NumberedSection>
            )}

            {/* 04 — Detail kontrak (table) */}
            {detail.details.length > 0 && (
              <NumberedSection
                num="04"
                eyebrow="Detail kontrak"
                title={
                  <>
                    Aturan <span className="text-pg-red-600">kerja.</span>
                  </>
                }
              >
                <div className="bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
                  {detail.details.map((row, i) => (
                    <div
                      key={row.label}
                      className={`flex justify-between items-center gap-4 px-5 py-3.5 ${
                        i ? "border-t border-pg-ink-100" : ""
                      }`}
                    >
                      <div className="text-[13px] md:text-[14px] text-pg-ink-500">{row.label}</div>
                      <div className="text-[13.5px] md:text-[14.5px] font-semibold text-pg-ink-900 text-right max-w-[60%]">
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>
              </NumberedSection>
            )}

            {/* 05 — Fee */}
            {detail.fee && (
              <NumberedSection
                num="05"
                eyebrow="Biaya keberangkatan"
                title={
                  <>
                    Yang harus kamu <span className="text-pg-red-600">siapkan.</span>
                  </>
                }
              >
                <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 md:p-6">
                  <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-pg-ink-500 mb-1">
                    Total biaya (setelah diterima)
                  </div>
                  <div
                    className="font-mono font-extrabold tracking-[-0.025em] text-pg-ink-900 leading-none"
                    style={{ fontSize: "clamp(28px, 4vw, 36px)" }}
                  >
                    {detail.fee.amount}
                  </div>
                  {detail.fee.breakdown.length > 0 && (
                    <>
                      <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-pg-ink-500 mt-5 mb-2">
                        Termasuk
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {detail.fee.breakdown.map((b) => (
                          <span
                            key={b}
                            className="inline-flex items-center px-2.5 py-1 rounded-full bg-pg-ink-50 text-pg-ink-700 font-mono text-[11px] font-semibold"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                  {detail.fee.note && (
                    <div
                      className="flex gap-2.5 items-start mt-5 px-4 py-3 rounded-xl"
                      style={{ background: "var(--pg-info-bg)" }}
                    >
                      <Icon name="info" size={18} className="text-pg-info shrink-0 mt-0.5" />
                      <div className="text-[13px] leading-relaxed text-pg-info">
                        {detail.fee.note}
                      </div>
                    </div>
                  )}
                </div>
              </NumberedSection>
            )}

            {/* 06 — Process timeline */}
            {detail.process && detail.process.length > 0 && (
              <NumberedSection
                num="06"
                eyebrow="Proses"
                title={
                  <>
                    Dari daftar sampai <span className="text-pg-red-600">berangkat.</span>
                  </>
                }
              >
                <div className="flex flex-col">
                  {detail.process.map((step, i, arr) => (
                    <div key={i} className="grid grid-cols-[32px_1fr] gap-3 pb-4">
                      <div className="relative">
                        <span className="w-7 h-7 rounded-full bg-pg-ink-900 text-white grid place-items-center font-mono text-[12px] font-extrabold">
                          {i + 1}
                        </span>
                        {i < arr.length - 1 && (
                          <div className="absolute left-[13px] top-7 -bottom-1 w-0.5 bg-pg-ink-200" />
                        )}
                      </div>
                      <div className="text-[15px] font-semibold pt-1 text-pg-ink-700 leading-snug">
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
                {detail.processDuration && (
                  <div
                    className="inline-flex items-center gap-1.5 mt-3 px-3 py-2 rounded-full font-mono text-[11.5px] font-bold tracking-[0.04em] text-pg-ink-700 bg-pg-ink-50"
                  >
                    <Icon name="clock" size={14} stroke={2.2} />
                    {detail.processDuration}
                  </div>
                )}
              </NumberedSection>
            )}
          </article>

          {/* Apply form sidebar (desktop) */}
          <aside className="hidden md:block">
            <div className="sticky top-24 grid gap-3">
              <div
                className="bg-pg-white border border-pg-ink-200 rounded-2xl"
                style={{ boxShadow: "var(--pg-shadow-2)" }}
              >
                <ApplyForm
                  positionSlug={position.slug}
                  positionRole={position.role}
                  positionCountry={position.country}
                  fields={appliedFields}
                />
              </div>
              <ExistingUserShortcut positionSlug={position.slug} />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile apply form (in-flow) */}
      <section className="md:hidden px-5 pt-2 pb-8">
        <div id="form" className="grid gap-3">
          <ApplyForm
            positionSlug={position.slug}
            positionRole={position.role}
            positionCountry={position.country}
            fields={appliedFields}
          />
          <ExistingUserShortcut positionSlug={position.slug} />
        </div>
      </section>

      {/* Related positions */}
      <RelatedPositions current={position} allPositions={allPositions} />

      {/* Trust block + share strip */}
      <TrustAndShare
        role={position.role}
        country={position.country}
        salary={position.salary}
      />

      {/* Final CTA bookend (desktop) */}
      <div className="hidden md:block">
        <FinalCTA
          eyebrow="Pertanyaan tentang lowongan ini?"
          title="Hubungi PIC Perantau Global."
          body="Balasan WhatsApp dalam jam kerja. Atau lihat lowongan lain yang mungkin lebih cocok."
          primaryHref="/lowongan"
          primaryLabel="Lihat lowongan lain"
          whatsappHref={waLink(waMessage)}
        />
      </div>

      {/* Mobile sticky CTA */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-5 py-3.5 pb-5 border-t border-pg-ink-100"
        style={{ background: "var(--pg-paper-blur)", backdropFilter: "blur(8px)" }}
      >
        <ButtonLink href="#form" variant="primary" size="md" block>
          Lamar posisi ini <Icon name="arrow_right" size={18} />
        </ButtonLink>
        <div className="text-[12px] text-pg-ink-500 text-center mt-2">
          Gratis sampai terima offering letter
        </div>
      </div>
    </main>
  );
}
