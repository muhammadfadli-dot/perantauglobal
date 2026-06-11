import { notFound } from "next/navigation";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import { getApplicationCompleteness } from "@/lib/applicationCompleteness";
import ApplicationFieldForm from "./ApplicationFieldForm";
import { countryLabelFromDb } from "@perantauglobal/db/country";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LengkapiLamaranPage({ params }: PageProps) {
  const { id } = await params;
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const { data: appData } = await supabase
    .from("applications")
    .select("id, candidate_id, position_slug, positions (slug, name, country)")
    .eq("id", id)
    .eq("candidate_id", candidateId)
    .single();

  const application = appData as unknown as {
    id: string;
    candidate_id: string;
    position_slug: string;
    positions: { slug: string; name: string; country: string } | null;
  } | null;
  if (!application || !application.positions) notFound();

  const { fields, hard_pass, score_pct } = await getApplicationCompleteness(id, supabase);

  // Group by section. Each section = a step in the candidate's mental model.
  const sekarang = fields.filter((f) => f.section === "syarat_utama" && !f.passed);
  const berikutnya = fields.filter((f) => f.section === "kualifikasi" && !f.passed);
  const nanti = fields.filter((f) => f.section === "screening" && !f.passed);
  const completed = fields.filter((f) => f.passed);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <TopBarApp title="Lengkapi lamaran" back backHref={`/applications/${id}`} />

      <main className="flex-1 pb-8">
        {/* Position context */}
        <section className="px-5 pt-3">
          <div
            className="text-[11px] font-semibold tracking-[0.1em] uppercase"
            style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
          >
            {application.positions.name} —{" "}
            {countryLabelFromDb(application.positions.country, application.positions.country)}
          </div>
        </section>

        {/* Progress card */}
        <section className="px-5 pt-4">
          <div
            className="rounded-2xl p-5 flex flex-col gap-2.5"
            style={{ background: "var(--pg-red-soft-bg)" }}
          >
            <div
              className="text-[10px] font-semibold tracking-[0.12em] uppercase"
              style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
            >
              Progress kelengkapan
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-[36px] font-extrabold leading-[40px] text-pg-ink-primary tabular-nums">
                  {completed.length}
                </span>
                <span className="text-[16px] font-semibold text-pg-ink-tertiary">
                  / {fields.length} selesai
                </span>
              </div>
              <span
                className="text-[16px] font-bold"
                style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
              >
                {score_pct}%
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(215,38,47,0.15)" }}
            >
              <div
                className="h-full"
                style={{ width: `${score_pct}%`, background: "var(--pg-red-600)" }}
              />
            </div>
            <p className="text-[13px] text-pg-ink-secondary mt-1 leading-tight">
              {hard_pass
                ? "Semua syarat utama udah terpenuhi. Tambahkan kualifikasi tambahan biar peluang makin gede."
                : sekarang.length > 0
                  ? `Tinggal ${sekarang.length} hal wajib biar lamaran lanjut ke tahap berikutnya.`
                  : "Lengkapi syarat tambahan biar makin kompetitif."}
            </p>
          </div>
        </section>

        {/* Section 1 — syarat utama */}
        {sekarang.length > 0 && (
          <NumberedSection
            num={1}
            eyebrow="Sekarang"
            title="Syarat utama"
            subtitle={`${sekarang.length} hal wajib`}
          >
            <div className="flex flex-col gap-3">
              {sekarang.map((field) => (
                <ApplicationFieldForm
                  key={field.field_key}
                  field={field}
                  applicationId={id}
                  candidateId={candidateId}
                />
              ))}
            </div>
          </NumberedSection>
        )}

        {/* Section 2 — kualifikasi */}
        {berikutnya.length > 0 && (
          <NumberedSection
            num={2}
            eyebrow="Berikutnya"
            title="Kualifikasi"
            subtitle="Diisi kalau lolos seleksi awal — atau isi sekarang biar lebih cepat."
          >
            <div className="flex flex-col gap-3">
              {berikutnya.map((field) => (
                <ApplicationFieldForm
                  key={field.field_key}
                  field={field}
                  applicationId={id}
                  candidateId={candidateId}
                />
              ))}
            </div>
          </NumberedSection>
        )}

        {/* Section 3 — screening (later) */}
        {nanti.length > 0 && (
          <NumberedSection
            num={3}
            eyebrow="Nanti"
            title="Screening"
            subtitle="Diminta kalau lolos kualifikasi — atau isi sekarang biar siap."
          >
            <div className="flex flex-col gap-2">
              {nanti.map((field) => (
                <ApplicationFieldForm
                  key={field.field_key}
                  field={field}
                  applicationId={id}
                  candidateId={candidateId}
                />
              ))}
            </div>
          </NumberedSection>
        )}

        {/* Completed — collapsed */}
        {completed.length > 0 && (
          <section className="px-5 pt-6">
            <div
              className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-3"
              style={{ color: "var(--pg-ok-soft-fg)", fontFamily: "var(--font-mono)" }}
            >
              Sudah terpenuhi · {completed.length}
            </div>
            <div className="flex flex-col gap-2">
              {completed.map((field) => (
                <div
                  key={field.field_key}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-pg-white"
                  style={{ border: "1px solid var(--pg-border)" }}
                >
                  <div
                    className="w-7 h-7 rounded-full grid place-items-center shrink-0"
                    style={{ background: "var(--pg-ok-soft-bg)", color: "var(--pg-ok-soft-fg)" }}
                  >
                    <Icon name="check" size={14} stroke={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold truncate text-pg-ink-primary">
                      {field.field_label}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--pg-ok-soft-fg)" }}>
                      {field.doc_uploaded ? "Dokumen diupload" : "Sudah diisi"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="px-5 pt-6">
          <div
            className="text-[12px] font-semibold flex items-center justify-center gap-1.5"
            style={{ color: "var(--pg-ink-tertiary)" }}
          >
            <Icon name="check" size={12} stroke={2} className="text-pg-ok-soft-fg" />
            Progress kamu disimpan otomatis
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function NumberedSection({
  num,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  num: number;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 pt-7">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold text-white"
          style={{ background: "var(--pg-red-600)" }}
        >
          {num}
        </span>
        <span
          className="text-[10px] font-semibold tracking-[0.12em] uppercase"
          style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
        >
          {eyebrow}
        </span>
      </div>
      <h2 className="text-[24px] font-extrabold tracking-[-0.015em] text-pg-ink-primary leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[13px] text-pg-ink-tertiary mt-1 mb-4 leading-tight">{subtitle}</p>
      )}
      {!subtitle && <div className="mt-3" />}
      {children}
    </section>
  );
}
