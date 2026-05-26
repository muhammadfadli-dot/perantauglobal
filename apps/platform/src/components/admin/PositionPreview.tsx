"use client";

import { Icon } from "@/components/pg/Icon";
import type { PositionContent } from "@/lib/position-content";

/**
 * Live preview of how a position will render on perantauglobal.com/lowongan/[slug].
 *
 * Read-only — no editing here. Renders from a working-copy `content` blob +
 * an array of application fields. Designed to update reactively as the admin
 * edits in ContentEditor / ApplicationFieldsEditor.
 *
 * Layout mirrors apps/web /lowongan/[slug]/page.tsx as closely as possible
 * without re-importing apps/web components (apps/platform shouldn't depend
 * on apps/web). Visual fidelity is "close enough" — exact pixel match isn't
 * the goal; faithful rendering of the data is.
 */
export default function PositionPreview({
  name,
  country,
  description,
  content,
  fields,
  viewport = "desktop",
}: {
  name: string;
  country: string;
  description?: string | null;
  content: PositionContent;
  fields: Array<{
    field_key: string;
    field_label: string;
    field_help: string | null;
    field_type: string;
    importance: "required" | "optional";
    section: "syarat_utama" | "kualifikasi" | "screening";
  }>;
  viewport?: "mobile" | "desktop";
}) {
  const isMobile = viewport === "mobile";
  const appliedFields = fields.filter((f) => f.section === "syarat_utama");

  return (
    <div
      className={`bg-pg-paper rounded-2xl overflow-hidden ${isMobile ? "max-w-[390px] mx-auto" : ""}`}
      style={{ border: "1px solid var(--pg-border)" }}
    >
      {/* Browser chrome stub */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 bg-pg-white"
        style={{ borderBottom: "1px solid var(--pg-border)" }}
      >
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pg-ink-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-pg-ink-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-pg-ink-200" />
        </div>
        <div
          className="flex-1 text-[11px] font-semibold text-pg-ink-tertiary text-center font-mono truncate"
        >
          perantauglobal.com/lowongan/{name ? name.toLowerCase().replace(/\s+/g, "-") : "[slug]"}
        </div>
      </div>

      <div className="bg-pg-white">
        {/* Hero — red */}
        <div
          className="px-6 py-7"
          style={{ background: "var(--pg-red-600)", color: "white" }}
        >
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase opacity-80 font-mono">
            {country}
          </div>
          <h1 className="text-[28px] font-extrabold leading-[32px] tracking-[-0.025em] mt-1">
            {name || "[Nama posisi]"}
          </h1>
          {content.hero?.metaLine && (
            <div className="text-[14px] font-semibold mt-2 opacity-90">{content.hero.metaLine}</div>
          )}
        </div>

        {description && (
          <div className="px-6 py-4 text-[14px] text-pg-ink-secondary leading-relaxed">
            {description}
          </div>
        )}

        {/* Job description */}
        {content.jobDescription && content.jobDescription.length > 0 && (
          <Section title="Deskripsi pekerjaan">
            <ul className="grid gap-2">
              {content.jobDescription.map((d, i) => (
                <li key={i} className="flex gap-2.5">
                  <span
                    className="w-5 h-5 rounded-full grid place-items-center shrink-0 mt-0.5 text-[11px] font-bold"
                    style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[14px] text-pg-ink-secondary leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Detail rows */}
        {content.details && content.details.length > 0 && (
          <Section title="Detail posisi">
            <div className="bg-pg-white rounded-xl" style={{ border: "1px solid var(--pg-border)" }}>
              {content.details.map((row, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center px-4 py-3"
                  style={{ borderTop: i > 0 ? "1px solid var(--pg-border-soft)" : undefined }}
                >
                  <div className="text-[13px] text-pg-ink-tertiary">{row.label}</div>
                  <div className="text-[13px] font-semibold text-pg-ink-primary text-right">
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Benefits */}
        {content.benefits && content.benefits.length > 0 && (
          <Section title="Yang kamu dapat">
            <div className={`grid gap-2 ${isMobile ? "" : "sm:grid-cols-2"}`}>
              {content.benefits.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-pg-white px-3 py-3 rounded-xl"
                  style={{ border: "1px solid var(--pg-border)" }}
                >
                  <div
                    className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
                    style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
                  >
                    <Icon name={b.icon as Parameters<typeof Icon>[0]["name"]} size={16} stroke={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-pg-ink-tertiary truncate">{b.label}</div>
                    <div className="text-[13px] font-bold text-pg-ink-primary truncate">
                      {b.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Qualifications */}
        {content.qualifications && content.qualifications.length > 0 && (
          <Section title="Kualifikasi">
            <div className="grid gap-2">
              {content.qualifications.map((q, i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className="w-5 h-5 rounded-full grid place-items-center shrink-0 mt-0.5"
                    style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
                  >
                    <Icon name="check" size={11} stroke={2.6} />
                  </div>
                  <span className="text-[14px] text-pg-ink-primary leading-relaxed">{q}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Trust signals */}
        {content.trustSignals?.pic?.name && (
          <Section title="PIC kamu di Perantau Global">
            <div
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: "var(--pg-info-bg)" }}
            >
              <div
                className="w-12 h-12 rounded-full grid place-items-center text-white font-extrabold shrink-0"
                style={{ background: "var(--pg-red-600)" }}
              >
                {content.trustSignals.pic.name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-pg-ink-primary">
                  {content.trustSignals.pic.name}
                </div>
                {content.trustSignals.pic.role && (
                  <div className="text-[12px] text-pg-ink-tertiary">{content.trustSignals.pic.role}</div>
                )}
                {content.trustSignals.pic.wa && (
                  <div
                    className="text-[12px] font-semibold mt-0.5 inline-flex items-center gap-1"
                    style={{ color: "var(--pg-info)" }}
                  >
                    WA: {content.trustSignals.pic.wa}
                  </div>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* Fee */}
        {content.fee && (
          <Section title="Biaya keberangkatan">
            <div className="bg-pg-white p-5 rounded-xl" style={{ border: "1px solid var(--pg-border)" }}>
              <div className="text-[24px] font-extrabold tracking-tight">{content.fee.amount}</div>
              {content.fee.breakdown.length > 0 && (
                <div className="text-[13px] text-pg-ink-tertiary mt-1.5">
                  Termasuk: {content.fee.breakdown.join(", ")}
                </div>
              )}
              {content.fee.note && (
                <div
                  className="mt-3 px-3 py-2.5 rounded-lg flex gap-2 items-start"
                  style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
                >
                  <span className="shrink-0 mt-0.5">
                    <Icon name="info" size={14} />
                  </span>
                  <div className="text-[12px] whitespace-pre-wrap">{content.fee.note}</div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Process */}
        {content.process && content.process.length > 0 && (
          <Section title="Proses">
            <ol className="grid gap-3">
              {content.process.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <div
                    className="w-7 h-7 rounded-full text-white grid place-items-center text-[11px] font-extrabold shrink-0"
                    style={{ background: "var(--pg-red-600)" }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[14px] font-semibold text-pg-ink-primary mt-1">{step}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Apply form snapshot — just titles */}
        {appliedFields.length > 0 && (
          <Section title="Yang ditanya di form lamar">
            <div className="grid gap-2">
              {appliedFields.map((f) => (
                <div
                  key={f.field_key}
                  className="flex items-start gap-2 px-3 py-2 rounded-lg bg-pg-white"
                  style={{ border: "1px solid var(--pg-border)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-pg-ink-primary truncate">
                      {f.field_label}
                    </div>
                    {f.field_help && (
                      <div className="text-[11px] text-pg-ink-tertiary mt-0.5 truncate">
                        {f.field_help}
                      </div>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-bold tracking-[0.08em] uppercase px-1.5 py-0.5 rounded shrink-0"
                    style={{
                      background:
                        f.importance === "required" ? "var(--pg-red-soft-bg)" : "var(--pg-ink-50)",
                      color:
                        f.importance === "required" ? "var(--pg-red-600)" : "var(--pg-ink-tertiary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {f.importance === "required" ? "Wajib" : "Bonus"}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Mock CTA */}
        <div className="px-6 py-6">
          <button
            type="button"
            disabled
            className="w-full min-h-[48px] px-5 text-base font-bold rounded-xl text-white"
            style={{ background: "var(--pg-red-600)" }}
          >
            Lamar Sekarang →
          </button>
          <div className="text-[12px] text-pg-ink-tertiary text-center mt-2">
            Gratis sampai terima offering letter
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-6 pt-5">
      <h2 className="text-[16px] font-bold tracking-tight text-pg-ink-primary">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
