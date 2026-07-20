import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/pg/Icon";
import { Section } from "@/components/pg/primitives";
import {
  AcademyRegisterForm,
  type AcademyRegField,
} from "@/components/pg/akademi/AcademyRegisterForm";
import { supabaseV2 } from "@/lib/supabase-v2";
import type { ProgramContent } from "@/lib/academy";

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
  none: "—",
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
  const price = program.is_free
    ? "Gratis"
    : program.price
      ? `Rp${program.price.toLocaleString("id-ID")}`
      : "Berbayar";

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
      {/* Hero */}
      <div
        className="text-white"
        style={{
          background: program.cover_image
            ? `linear-gradient(135deg, rgba(110,73,6,0.62), rgba(110,73,6,0.82)), url(${program.cover_image})`
            : "linear-gradient(135deg, var(--pa-amber-600), var(--pa-amber-700))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-[1100px] mx-auto px-5 py-12 md:py-16">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ background: "rgba(255,255,255,0.18)" }}
          >
            {MODE_LABEL[program.delivery_mode] ?? program.delivery_mode} · {program.facilitated_by}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-[-0.02em] leading-[1.08] mt-3 max-w-[18ch]">
            {program.title}
          </h1>
          {program.subtitle && (
            <p className="text-base md:text-lg opacity-90 mt-3 max-w-[52ch]">{program.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-5">
            <HeroChip>{price}</HeroChip>
            {program.duration_label && <HeroChip>{program.duration_label}</HeroChip>}
            <HeroChip>Output: {OUTPUT_LABEL[program.output_type] ?? program.output_type}</HeroChip>
          </div>
        </div>
      </div>

      <Section>
        <div className="grid md:grid-cols-[1fr_minmax(360px,420px)] gap-8 md:gap-12 items-start">
          {/* Left: program detail */}
          <div className="flex flex-col gap-8 order-2 md:order-1">
            {content.intro && (
              <p className="text-lg text-pg-ink-700 leading-relaxed">{content.intro}</p>
            )}

            {content.benefits && content.benefits.length > 0 && (
              <div>
                <h2 className="text-xl font-extrabold tracking-tight mb-3">Yang kamu dapat</h2>
                <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                  {content.benefits.map((b, i) => (
                    <li key={i} className="flex gap-3 text-[15px] text-pg-ink-700">
                      <span style={{ color: "var(--pa-amber-600)", marginTop: 2 }}>
                        <Icon name="check" size={18} stroke={2.6} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {content.curriculum && content.curriculum.length > 0 && (
              <div>
                <h2 className="text-xl font-extrabold tracking-tight mb-3">Yang kamu pelajari</h2>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {content.curriculum.map((c) => (
                    <div
                      key={c.title}
                      className="p-4 rounded-xl bg-pg-white border border-pg-ink-100"
                    >
                      <div className="text-[14px] font-bold text-pg-ink-900">{c.title}</div>
                      {c.detail && (
                        <div className="text-[13px] text-pg-ink-600 leading-relaxed mt-1">
                          {c.detail}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content.flow && content.flow.length > 0 && (
              <div>
                <h2 className="text-xl font-extrabold tracking-tight mb-3">
                  Alur dari daftar sampai berangkat
                </h2>
                <ol className="flex flex-col gap-0 list-none p-0 m-0">
                  {content.flow.map((step, i) => (
                    <li key={step.title} className="flex gap-3.5 pb-4 last:pb-0">
                      <div className="flex flex-col items-center shrink-0">
                        <span
                          className="grid place-items-center w-7 h-7 rounded-full font-mono text-[12px] font-bold"
                          style={{
                            background: "var(--pa-amber-100)",
                            color: "var(--pa-amber-700)",
                          }}
                        >
                          {i + 1}
                        </span>
                        {i < (content.flow?.length ?? 0) - 1 && (
                          <span
                            aria-hidden
                            className="w-px flex-1 mt-1.5"
                            style={{ background: "var(--pg-ink-200)" }}
                          />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <div className="text-[14.5px] font-bold text-pg-ink-900 leading-snug">
                          {step.title}
                        </div>
                        {step.detail && (
                          <p className="text-[13px] text-pg-ink-600 leading-relaxed m-0 mt-1">
                            {step.detail}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {content.fee_note && (
              <div
                className="rounded-xl p-4"
                style={{
                  background: "var(--pa-amber-50)",
                  border: "1px solid var(--pa-amber-200)",
                }}
              >
                <div className="flex items-center gap-2 text-[13px] font-extrabold text-pg-ink-900">
                  <span style={{ color: "var(--pa-amber-700)" }}>
                    <Icon name="wallet" size={16} />
                  </span>
                  Soal biaya
                </div>
                <p className="text-[13.5px] text-pg-ink-700 leading-relaxed m-0 mt-2">
                  {content.fee_note}
                </p>
              </div>
            )}

            {content.doc_checklist && content.doc_checklist.length > 0 && (
              <div>
                <h2 className="text-xl font-extrabold tracking-tight mb-3">Siapin dokumen ini</h2>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {content.doc_checklist.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3.5 rounded-xl bg-pg-white border border-pg-ink-100"
                    >
                      <span style={{ color: "var(--pg-ink-400)", marginTop: 1 }}>
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

            <div
              className="rounded-xl p-4 text-[13px] text-pg-ink-600 leading-relaxed"
              style={{ background: "var(--pa-amber-100)", border: "1px solid var(--pa-amber-200)" }}
            >
              {isScreened ? (
                <>
                  <b className="text-pg-ink-800">Cara kerjanya:</b> daftar di sini, cek email buat
                  verifikasi, lalu tim Perantau Global menghubungi kamu lewat WhatsApp untuk proses
                  screening. Kamu tidak diminta membayar apa pun di tahap ini.
                </>
              ) : (
                <>
                  <b className="text-pg-ink-800">Cara kerjanya:</b> daftar di sini, cek email buat
                  verifikasi, akun Perantau Global kamu langsung aktif, lalu buka tab Akademi buat
                  mulai kelasnya.
                </>
              )}
            </div>
          </div>

          {/* Right: registration form (sticky on desktop) */}
          <div className="order-1 md:order-2 md:sticky md:top-6">
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
    </>
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
