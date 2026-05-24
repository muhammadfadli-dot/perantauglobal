import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/pg/Icon";
import { StatusDot } from "@/components/pg/primitives";
import { RedHero } from "@/components/pg/RedHero";
import { ApplyForm } from "@/components/pg/ApplyForm";
import { ExistingUserShortcut } from "@/components/pg/ExistingUserShortcut";
import { getPosition, POSITIONS } from "@/lib/positions";
import { fetchOpenJobOrders, fetchAppliedFields, fetchPositionContent } from "@/lib/positions-db";
import { resolvePositionDetail } from "@/lib/positionContent";

type RouteParams = { locale: string; slug: string };

export const revalidate = 60;

export function generateStaticParams() {
  return POSITIONS.map((p) => ({ locale: "id", slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPosition(slug);
  if (!p) return { title: "Lowongan tidak ditemukan" };
  return {
    title: `Lowongan ${p.role} ${p.country} — ${p.salary}/bulan`,
    description: `Lowongan ${p.role} di ${p.country}. Gaji ${p.salary}, ${p.contractLabel ?? "kontrak resmi"}. Bebas biaya sebelum offering letter. Daftar di Perantau Global.`,
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

  const baseStatic = getPosition(slug);
  if (!baseStatic) notFound();

  // Overlay live job_order, fetch apply-stage qualifying fields, and admin-
  // authored landing content in parallel. positions.content takes priority
  // over static lib/positionDetails (fallback if not yet authored).
  const [jobOrders, appliedFields, dbContent] = await Promise.all([
    fetchOpenJobOrders(),
    fetchAppliedFields(slug),
    fetchPositionContent(slug),
  ]);
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

  return (
    <main className="pb-24 md:pb-0">
      <div className="md:grid md:grid-cols-[1fr_400px] md:gap-10 max-w-6xl mx-auto md:px-8 md:pt-8">
        {/* Main content column */}
        <article>
          <RedHero
            role={position.role}
            country={position.country}
            meta={[
              { icon: "wallet", label: `${position.salary}/bulan` },
              ...(position.contractLabel
                ? [{ icon: "clock" as const, label: position.contractLabel }]
                : []),
            ]}
          />

          {/* Batch status */}
          <section className="px-5 md:px-8 pt-5">
            {position.status === "open" && position.batch ? (
              <div
                className="flex items-center gap-3 rounded-2xl border px-4 py-3.5"
                style={{ background: "var(--pg-ok-bg)", borderColor: "#c6e6d2" }}
              >
                <StatusDot tone="ok" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-pg-ok">
                    {position.batch.label} · lagi buka
                  </div>
                  <div className="text-sm mt-0.5" style={{ color: "#1a5f36" }}>
                    {position.batch.slotsFilled} / {position.batch.slotsTotal} terisi · deadline{" "}
                    {position.batch.deadline}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-2xl border border-pg-ink-200 bg-pg-ink-50 px-4 py-3.5">
                <div className="mt-0.5">
                  <Icon name="info" size={18} className="text-pg-ink-500" />
                </div>
                <div>
                  <div className="text-sm font-bold text-pg-ink-900">Belum ada batch aktif</div>
                  <div className="text-[13px] text-pg-ink-500 mt-0.5 leading-relaxed">
                    Daftar antrian — kami hubungi via email saat batch baru dibuka.
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Job description */}
          {detail.jobDescription && detail.jobDescription.length > 0 && (
            <section className="px-5 md:px-8 pt-6">
              <h2 className="text-lg font-bold tracking-tight">Deskripsi pekerjaan</h2>
              <ul className="mt-3 space-y-2">
                {detail.jobDescription.map((d, i) => (
                  <li key={i} className="flex gap-3">
                    <div
                      className="w-5 h-5 rounded-full grid place-items-center shrink-0 mt-0.5"
                      style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
                    >
                      <span className="text-[11px] font-bold">{i + 1}</span>
                    </div>
                    <div className="text-[15px] leading-relaxed text-pg-ink-700">{d}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Detail */}
          <section className="px-5 md:px-8 pt-6">
            <h2 className="text-lg font-bold tracking-tight">Detail posisi</h2>
            <div className="mt-3 bg-pg-white border border-pg-ink-100 rounded-2xl">
              {detail.details.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex justify-between items-center px-4 py-3.5 ${
                    i ? "border-t border-pg-ink-100" : ""
                  }`}
                >
                  <div className="text-sm text-pg-ink-500">{row.label}</div>
                  <div className="text-sm font-semibold text-pg-ink-900 text-right max-w-[60%]">
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Benefit */}
          <section className="px-5 md:px-8 pt-6">
            <h2 className="text-lg font-bold tracking-tight">Yang kamu dapat</h2>
            <div className="mt-3 grid sm:grid-cols-2 gap-2.5">
              {detail.benefits.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-3.5 bg-pg-white border border-pg-ink-100 rounded-xl px-3.5 py-3"
                >
                  <div
                    className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
                    style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
                  >
                    <Icon name={b.icon} size={18} stroke={2} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-pg-ink-500">{b.label}</div>
                    <div className="text-[15px] font-bold text-pg-ink-900 mt-0.5">{b.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Kualifikasi */}
          <section className="px-5 md:px-8 pt-6">
            <h2 className="text-lg font-bold tracking-tight">Kualifikasi</h2>
            <div className="mt-3">
              {detail.qualifications.map((q, i) => (
                <div
                  key={q}
                  className={`flex gap-3 py-3 ${i ? "border-t border-pg-ink-100" : ""}`}
                >
                  <div
                    className="w-6 h-6 rounded-full grid place-items-center shrink-0 mt-0.5"
                    style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
                  >
                    <Icon name="check" size={14} stroke={2.6} />
                  </div>
                  <div className="text-[15px] leading-relaxed">{q}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Biaya */}
          {detail.fee && (
            <section className="px-5 md:px-8 pt-6">
              <h2 className="text-lg font-bold tracking-tight">Biaya keberangkatan</h2>
              <div className="mt-3 bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
                <div className="text-[28px] font-extrabold tracking-tight">
                  {detail.fee.amount}
                </div>
                {detail.fee.breakdown.length > 0 && (
                  <div className="text-sm text-pg-ink-500 mt-1">
                    Termasuk: {detail.fee.breakdown.join(", ")}
                  </div>
                )}
                {detail.fee.note && (
                  <div
                    className="mt-4 px-3.5 py-3 rounded-lg flex gap-2.5 items-start"
                    style={{ background: "var(--pg-info-bg)" }}
                  >
                    <Icon name="info" size={18} className="text-pg-info shrink-0 mt-0.5" />
                    <div className="text-[13px] leading-relaxed text-pg-info">
                      <b>Gratis sampai kamu terima offering letter.</b> Biaya baru muncul setelah
                      employer menerima kamu.
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Process */}
          {detail.process && detail.process.length > 0 && (
            <section className="px-5 md:px-8 pt-6 pb-8">
              <h2 className="text-lg font-bold tracking-tight">Proses (±4 bulan)</h2>
              <div className="mt-3.5">
                {detail.process.map((s, i, arr) => (
                  <div
                    key={s}
                    className="grid grid-cols-[28px_1fr] gap-2.5"
                    style={{ paddingBottom: i === arr.length - 1 ? 0 : 16 }}
                  >
                    <div className="relative">
                      <div
                        className="w-6 h-6 rounded-full text-white grid place-items-center text-[11px] font-extrabold"
                        style={{ background: "var(--pg-red-600)" }}
                      >
                        {i + 1}
                      </div>
                      {i < arr.length - 1 && (
                        <div className="absolute left-[11px] top-[26px] -bottom-4 w-0.5 bg-pg-ink-200" />
                      )}
                    </div>
                    <div className="text-[15px] font-semibold pt-0.5">{s}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Apply form sidebar (desktop) */}
        <aside className="hidden md:block">
          <div className="sticky top-24 grid gap-3">
            <ApplyForm
              positionSlug={position.slug}
              positionRole={position.role}
              positionCountry={position.country}
              fields={appliedFields}
            />
            <ExistingUserShortcut positionSlug={position.slug} />
          </div>
        </aside>
      </div>

      {/* Mobile apply form (in-flow at bottom) */}
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

      {/* Mobile sticky CTA */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-5 py-3.5 pb-5 border-t border-pg-ink-100"
        style={{ background: "rgba(255,255,255,.96)", backdropFilter: "blur(8px)" }}
      >
        <Link
          href="#form"
          className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-base font-semibold rounded-xl bg-pg-red-600 text-white no-underline transition-colors hover:bg-pg-red-700"
        >
          Lamar posisi ini <Icon name="arrow_right" size={18} />
        </Link>
        <div className="text-[12px] text-pg-ink-500 text-center mt-2">
          Gratis sampai terima offering letter
        </div>
      </div>
    </main>
  );
}
