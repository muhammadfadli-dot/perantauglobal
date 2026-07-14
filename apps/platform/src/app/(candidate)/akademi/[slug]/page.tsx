import { notFound } from "next/navigation";
import Link from "next/link";
import { BottomNav, TopBarApp } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import { requireCandidate } from "@/lib/supabase-server";
import { waLink } from "@/lib/contact";
import {
  getPublishedProgram,
  getProgramOutline,
  getMyEnrollment,
  getLessonProgress,
  getRegistrationFields,
  flattenLessons,
  hasPaidAccess,
  deriveCaps,
  psikotesStatus,
  type ProgramContent,
} from "@/lib/academy-db";
import { EnrollPanel } from "@/components/pg/academy/EnrollPanel";
import { PayButton } from "@/components/pg/academy/PayButton";
import { PassportProgress } from "@/components/pg/academy/PassportProgress";

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

export default async function ProgramDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bayar?: string }>;
}) {
  const { slug } = await params;
  const { bayar } = await searchParams;
  const { candidateId } = await requireCandidate();

  const program = await getPublishedProgram(slug);
  if (!program) notFound();

  const [outline, enrollment, fields] = await Promise.all([
    getProgramOutline(slug),
    getMyEnrollment(candidateId, slug),
    getRegistrationFields(slug),
  ]);
  const progress = enrollment ? await getLessonProgress(enrollment.id) : [];
  const content = (program.content ?? {}) as ProgramContent;

  const flat = flattenLessons(outline);
  const doneIds = new Set(progress.filter((p) => p.status !== "failed").map((p) => p.lesson_id));
  const failedIds = new Set(progress.filter((p) => p.status === "failed").map((p) => p.lesson_id));
  const firstIncomplete = flat.findIndex((f) => !doneIds.has(f.lesson.id));
  const currentIdx = firstIncomplete === -1 ? flat.length : firstIncomplete;
  const paid = hasPaidAccess(program, enrollment);

  const caps = deriveCaps(outline, doneIds);
  const courseDone =
    outline.length > 0 && outline.every((m) => m.lessons.every((l) => doneIds.has(l.id)));
  const psikotes = psikotesStatus(enrollment);
  // The passport metaphor (stamps card + dual cert path + psikotes) is specific
  // to the Paspor product. Other courses (e.g. the free finansial course) keep a
  // plain progress + single-certificate treatment.
  const isPaspor = program.category === "paspor";

  // Resume target: enter via module intro when starting a fresh module, else
  // jump straight to the current lesson (mid-module resume).
  const current = currentIdx < flat.length ? flat[currentIdx] : null;
  const curMod = current
    ? outline.find((m) => m.lessons.some((l) => l.id === current.lesson.id))
    : null;
  const resumeIsModuleStart = curMod ? curMod.lessons[0]?.id === current!.lesson.id : false;
  const resumeHref = current
    ? resumeIsModuleStart && curMod
      ? `/akademi/${slug}/modul/${curMod.module_num}`
      : `/akademi/${slug}/lesson/${current.lesson.id}`
    : null;

  const showPaidGate = Boolean(enrollment) && !paid && !program.is_free;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <TopBarApp title="Akademi" back backHref="/akademi" />
      <main className="flex-1 pb-10">
        {/* Cover paspor — amber hero */}
        <div
          className="px-5 pt-5 pb-6 text-white"
          style={{
            background: program.cover_image
              ? `linear-gradient(135deg, rgba(110,73,6,0.55), rgba(110,73,6,0.80)), url(${program.cover_image})`
              : "linear-gradient(135deg, var(--pa-amber-600), var(--pa-amber-700))",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] opacity-90">
            {MODE_LABEL[program.delivery_mode] ?? program.delivery_mode} · {program.facilitated_by}
          </span>
          <h1
            className="font-extrabold tracking-[-0.02em] leading-[1.12] text-[22px] mt-1.5 mb-0"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.25)" }}
          >
            {program.title}
          </h1>
          {program.subtitle && <p className="text-[13px] opacity-90 mt-1.5 mb-0">{program.subtitle}</p>}
          <div className="flex flex-wrap gap-2 mt-3">
            <HeroChip>
              {program.is_free
                ? "Gratis"
                : program.price
                  ? `Rp${program.price.toLocaleString("id-ID")}`
                  : "Berbayar"}
            </HeroChip>
            {program.duration_label && <HeroChip>{program.duration_label}</HeroChip>}
            <HeroChip>
              {isPaspor
                ? "Output: 2 Sertifikat"
                : `Output: ${OUTPUT_LABEL[program.output_type] ?? program.output_type}`}
            </HeroChip>
          </div>
        </div>

        {/* Progress (enrolled) — passport for Paspor, plain bar otherwise */}
        {enrollment && (
          <div className="px-5 -mt-3">
            {isPaspor ? (
              <PassportProgress
                caps={caps}
                pct={enrollment.progress_pct}
                psikotes={psikotes}
                courseDone={courseDone}
              />
            ) : (
              <SimpleStatusCard
                pct={enrollment.progress_pct}
                status={enrollment.status}
                certificateId={enrollment.certificate_id}
              />
            )}
          </div>
        )}

        {bayar && (
          <div className="px-5 pt-3">
            <PaymentBanner state={bayar} paid={paid} />
          </div>
        )}

        {/* ── Terminal: course done → certificate (dual path only for Paspor) ── */}
        {enrollment && paid && courseDone && isPaspor && (
          <CertificateTerminal
            program={program}
            certificateId={enrollment.certificate_id}
            certificateUrl={enrollment.certificate_url}
            psikotes={psikotes}
          />
        )}
        {enrollment && paid && courseDone && !isPaspor && (
          <SimpleDoneCard certificateId={enrollment.certificate_id} certificateUrl={enrollment.certificate_url} />
        )}

        {/* ── Paid gate: value first, price last ── */}
        {showPaidGate ? (
          <>
            <Section>
              <div
                className="rounded-[12px] p-3.5 flex gap-2.5"
                style={{ background: "#FFFBEB", border: "1px solid var(--pa-amber-200)" }}
              >
                <span style={{ color: "var(--pa-amber-700)" }} className="shrink-0 mt-0.5">
                  <Icon name="lock" size={16} />
                </span>
                <div className="text-[13px] text-pg-ink-700 leading-relaxed">
                  <b className="text-pg-ink-900">Selesaikan pembayaran dulu.</b> Akses{" "}
                  {flat.length} pelajaran &amp; sertifikat terbuka begitu pembayaran dikonfirmasi.
                </div>
              </div>
            </Section>
            {content.benefits && content.benefits.length > 0 && (
              <Section title="Yang kamu dapat">
                <BenefitsList items={content.benefits} />
              </Section>
            )}
            <Section title="Tujuanmu">
              <DualPathCard />
            </Section>
            <PayButton slug={slug} price={program.price ?? 0} />
          </>
        ) : (
          <>
            {/* Intro + benefits (not-enrolled or free preview) */}
            {!courseDone && content.intro && (
              <Section>
                <p className="text-[14px] text-pg-ink-700 leading-relaxed m-0">{content.intro}</p>
              </Section>
            )}
            {!enrollment && content.benefits && content.benefits.length > 0 && (
              <Section title="Yang kamu dapat">
                <BenefitsList items={content.benefits} />
              </Section>
            )}
            {!enrollment && content.doc_checklist && content.doc_checklist.length > 0 && (
              <Section title="Siapin dokumen ini">
                <div className="flex flex-col gap-2">
                  {content.doc_checklist.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-[12px]"
                      style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)" }}
                    >
                      <span style={{ color: "var(--pg-ink-400)", marginTop: 1 }}>
                        <Icon name="doc" size={16} />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-pg-ink-800">{d.label}</span>
                        {d.note && <span className="text-[11.5px] text-pg-ink-500">{d.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Resume CTA (enrolled + paid + in progress) */}
            {enrollment && paid && !courseDone && resumeHref && (
              <div className="px-5 pt-6">
                <Link
                  href={resumeHref}
                  className="flex items-center gap-3 p-3.5 rounded-[14px] bg-pg-white no-underline"
                  style={{ border: "1px solid var(--pa-amber-200)", boxShadow: "var(--pa-shadow-card)" }}
                >
                  <span
                    className="w-11 h-11 rounded-[12px] grid place-items-center shrink-0 text-white"
                    style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
                  >
                    <Icon name="arrow_right" size={20} stroke={2.4} />
                  </span>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span
                      className="font-mono text-[9.5px] font-bold uppercase tracking-[0.07em]"
                      style={{ color: "var(--pa-amber-700)" }}
                    >
                      {currentIdx === 0 ? "Mulai belajar" : "Lanjut di sini"}
                    </span>
                    <span className="text-[14px] font-extrabold tracking-[-0.01em] text-pg-ink-900 truncate">
                      {current!.lesson.title}
                    </span>
                    <span className="text-[11.5px] text-pg-ink-500">
                      Modul {current!.moduleNum} · Pelajaran {currentIdx + 1} dari {flat.length}
                    </span>
                  </div>
                </Link>
              </div>
            )}

            {/* Outline */}
            {outline.length > 0 && (
              <Section title={`Materi · ${flat.length} pelajaran`}>
                <div className="flex flex-col gap-4">
                  {outline.map((m) => {
                    const cap = caps.find((c) => c.moduleNum === m.module_num);
                    const moduleDone = cap?.status === "done";
                    const tappable = Boolean(enrollment) && paid;
                    const headerInner = (
                      <>
                        {moduleDone && (
                          <span
                            className="w-[18px] h-[18px] rounded-full grid place-items-center text-white shrink-0"
                            style={{ background: "var(--pa-amber-500)" }}
                          >
                            <Icon name="check" size={11} stroke={3} />
                          </span>
                        )}
                        <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-pg-ink-500">
                          Modul {m.module_num} · {m.title}
                        </span>
                        {tappable && (
                          <Icon name="chevron_right" size={14} className="text-pg-ink-300 ml-auto shrink-0" />
                        )}
                      </>
                    );
                    return (
                      <div key={m.id}>
                        {tappable ? (
                          <Link
                            href={`/akademi/${slug}/modul/${m.module_num}`}
                            className="flex items-center gap-2 mb-1.5 no-underline"
                          >
                            {headerInner}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2 mb-1.5">{headerInner}</div>
                        )}
                        <div className="flex flex-col gap-2">
                          {m.lessons.map((lesson) => {
                            const idx = flat.findIndex((f) => f.lesson.id === lesson.id);
                            const isDone = doneIds.has(lesson.id);
                            const isFailed = failedIds.has(lesson.id);
                            const isCurrent = idx === currentIdx;
                            const locked = !paid || (idx > currentIdx && !isDone);
                            return (
                              <LessonRow
                                key={lesson.id}
                                slug={slug}
                                lessonId={lesson.id}
                                title={lesson.title}
                                type={lesson.lesson_type}
                                minutes={lesson.estimated_minutes}
                                done={isDone}
                                failed={isFailed}
                                current={isCurrent && Boolean(enrollment)}
                                locked={locked}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Enroll panel (not enrolled) */}
            {!enrollment && (
              <Section title="Daftar kelas ini">
                <EnrollPanel
                  slug={slug}
                  fields={fields.map((f) => ({
                    key: f.field_key,
                    label: f.field_label,
                    help: f.field_help,
                    type: f.field_type,
                    options: (f.options as { value: string; label: string }[] | null) ?? null,
                    required: f.required,
                  }))}
                  isFree={program.is_free}
                />
              </Section>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function SimpleStatusCard({
  pct,
  status,
  certificateId,
}: {
  pct: number;
  status: string;
  certificateId: string | null;
}) {
  const done = status === "passed" || status === "completed";
  const failed = status === "failed";
  return (
    <div
      className="rounded-[16px] p-4"
      style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", boxShadow: "0 8px 24px rgba(20,16,12,0.06)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-pg-ink-500">
          {done ? "Selesai" : failed ? "Belum lulus" : "Progress kamu"}
        </span>
        <span className="font-mono text-[12px] font-bold" style={{ color: "var(--pa-amber-700)" }}>
          {pct}%
        </span>
      </div>
      <div className="mt-2 h-2 bg-pg-ink-50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: failed ? "var(--pg-err)" : "linear-gradient(90deg, var(--pa-amber-500), var(--pa-amber-600))",
          }}
        />
      </div>
      {done && certificateId && (
        <div className="mt-3 flex items-center gap-2 text-[12.5px] text-pg-ink-700">
          <span style={{ color: "var(--pa-amber-700)", display: "inline-flex" }}>
            <Icon name="sparkle" size={15} />
          </span>
          Sertifikat terbit · <span className="font-mono font-bold">{certificateId}</span>
        </div>
      )}
    </div>
  );
}

function SimpleDoneCard({
  certificateId,
  certificateUrl,
}: {
  certificateId: string | null;
  certificateUrl: string | null;
}) {
  return (
    <section className="px-5 pt-6">
      <div
        className="rounded-[16px] p-4 text-center"
        style={{ background: "linear-gradient(135deg,#fffaef,var(--pa-amber-100))", border: "1px solid var(--pa-amber-200)" }}
      >
        <div className="w-12 h-12 rounded-full grid place-items-center mx-auto text-white" style={{ background: "var(--pg-ok)" }}>
          <Icon name="check" size={24} stroke={2.6} />
        </div>
        <div className="text-[15px] font-extrabold text-pg-ink-900 mt-2">Kursus selesai 🎉</div>
        {certificateId && (
          <div className="font-mono text-[12px] mt-1" style={{ color: "var(--pa-amber-700)" }}>
            Sertifikat No. {certificateId}
          </div>
        )}
        {certificateUrl && (
          <a
            href={certificateUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full min-h-[46px] px-5 mt-3 text-[14px] font-bold rounded-xl no-underline"
            style={{ background: "var(--pg-white)", border: "1.5px solid var(--pg-ink-200)", color: "var(--pg-ink-800)" }}
          >
            <Icon name="doc_check" size={16} /> Lihat sertifikat
          </a>
        )}
      </div>
    </section>
  );
}

function CertificateTerminal({
  program,
  certificateId,
  certificateUrl,
  psikotes,
}: {
  program: { title: string };
  certificateId: string | null;
  certificateUrl: string | null;
  psikotes: "not_started" | "scheduled" | "done";
}) {
  const both = Boolean(certificateId) && psikotes === "done";
  return (
    <section className="px-5 pt-6">
      <div className="text-center">
        <div className="text-[15px] font-extrabold text-pg-ink-900">
          {both ? "Paspormu lengkap 🎉" : "Kursus selesai 🎉"}
        </div>
        <p className="text-[13px] text-pg-ink-600 mt-1 leading-relaxed">
          {both
            ? "Dua sertifikatmu sudah terbit. Kamu siap berangkat lebih percaya diri."
            : "Sertifikat kursus sudah terbit. Satu langkah lagi: psikotes Dayalima untuk sertifikat kedua."}
        </p>
      </div>

      <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-pg-ink-900 m-0 mt-5 mb-2.5">
        Sertifikatmu
      </h2>
      <div className="flex flex-col gap-2.5">
        {/* Course certificate */}
        <div
          className="rounded-[16px] p-4"
          style={{ background: "linear-gradient(135deg,#fffaef,var(--pa-amber-100))", border: "1px solid var(--pa-amber-200)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-11 h-11 rounded-full grid place-items-center shrink-0"
              style={{ border: "2px solid var(--pa-amber-600)", color: "var(--pa-amber-700)" }}
            >
              <Icon name="sparkle" size={20} />
            </span>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[13.5px] font-bold text-pg-ink-900 leading-snug">
                Sertifikat Kursus {program.title}
              </span>
              <span className="text-[11px] font-semibold" style={{ color: "var(--pg-ok)" }}>
                Terbit
              </span>
              {certificateId && (
                <span className="font-mono text-[11px] mt-0.5" style={{ color: "var(--pa-amber-700)" }}>
                  No. {certificateId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Psikotes certificate */}
        <div
          className="rounded-[16px] p-4"
          style={{
            background: psikotes === "done" ? "linear-gradient(135deg,#fffaef,var(--pa-amber-100))" : "var(--pg-white)",
            border: psikotes === "done" ? "1px solid var(--pa-amber-200)" : "1px dashed var(--pg-ink-200)",
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-11 h-11 rounded-full grid place-items-center shrink-0"
              style={
                psikotes === "done"
                  ? { border: "2px solid var(--pa-amber-600)", color: "var(--pa-amber-700)" }
                  : { border: "2px dashed var(--pg-ink-300)", color: "var(--pg-ink-400)" }
              }
            >
              <Icon name={psikotes === "done" ? "sparkle" : "clock"} size={20} />
            </span>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[13.5px] font-bold text-pg-ink-900 leading-snug">
                Sertifikat Psikotes Dayalima
              </span>
              <span
                className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] mt-0.5"
                style={{ color: psikotes === "done" ? "var(--pg-ok)" : "var(--pg-ink-400)" }}
              >
                {psikotes === "done" ? "Terbit" : psikotes === "scheduled" ? "Terjadwal" : "Menunggu"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {psikotes !== "done" && (
        <>
          <p className="text-[12px] text-pg-ink-500 mt-3 leading-relaxed">
            Psikotes sudah termasuk di harga &amp; dipandu tim Perantau Global. Setelah selesai,
            dua sertifikat terbit bersama.
          </p>
          <a
            href={waLink(
              `Halo Perantau Global, saya sudah selesai kursus ${program.title} dan mau jadwalkan psikotes Dayalima.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 mt-3 text-[15px] font-bold rounded-xl text-white no-underline"
            style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
          >
            Jadwalkan psikotes Dayalima
            <Icon name="arrow_right" size={18} />
          </a>
        </>
      )}
      {certificateUrl && (
        <a
          href={certificateUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full min-h-[48px] px-5 mt-2.5 text-[14.5px] font-bold rounded-xl no-underline"
          style={{ background: "var(--pg-white)", border: "1.5px solid var(--pg-ink-200)", color: "var(--pg-ink-800)" }}
        >
          <Icon name="doc_check" size={17} /> Lihat &amp; bagikan sertifikat
        </a>
      )}
    </section>
  );
}

function DualPathCard() {
  return (
    <div
      className="rounded-[16px] p-4 flex items-center justify-center gap-3 text-center"
      style={{ background: "linear-gradient(135deg,#fffaef,var(--pa-amber-100))", border: "1px solid var(--pa-amber-200)" }}
    >
      <PathBox label="Kursus" />
      <span className="text-[18px] font-extrabold" style={{ color: "var(--pa-amber-600)" }}>+</span>
      <PathBox label="Psikotes" />
      <span className="text-[18px] font-extrabold" style={{ color: "var(--pa-amber-600)" }}>=</span>
      <div className="flex flex-col">
        <span className="text-[18px] font-extrabold leading-none" style={{ color: "var(--pa-amber-700)" }}>2</span>
        <span className="text-[11px] font-bold" style={{ color: "var(--pa-amber-700)" }}>sertifikat</span>
      </div>
    </div>
  );
}

function PathBox({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-3 py-2 rounded-[10px] text-[12.5px] font-bold"
      style={{ background: "var(--pg-white)", color: "var(--pg-ink-800)", border: "1px solid var(--pa-amber-200)" }}
    >
      {label}
    </span>
  );
}

function BenefitsList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 m-0 p-0 list-none">
      {items.map((b, i) => (
        <li key={i} className="flex gap-2.5 text-[13px] text-pg-ink-700">
          <span style={{ color: "var(--pa-amber-600)", marginTop: 1 }}>
            <Icon name="check" size={16} stroke={2.6} />
          </span>
          {b}
        </li>
      ))}
    </ul>
  );
}

function PaymentBanner({ state, paid }: { state: string; paid: boolean }) {
  let msg = "";
  let bg = "var(--pg-ink-100)";
  let color = "var(--pg-ink-700)";
  if (paid && state === "sukses") {
    msg = "Pembayaran berhasil. Akses kelas kamu sudah terbuka 🎉";
    bg = "#ECFDF5";
    color = "var(--pg-ok)";
  } else if (state === "sukses") {
    msg =
      "Pembayaran sedang diproses. Akses terbuka begitu pembayaran dikonfirmasi (biasanya beberapa menit).";
    bg = "#FFFBEB";
    color = "var(--pa-amber-700)";
  } else if (state === "gagal") {
    msg = "Pembayaran belum selesai. Kamu bisa coba bayar lagi.";
    bg = "#FCF0F1";
    color = "var(--pg-err)";
  } else if (state === "perlu") {
    msg = "Selesaikan pembayaran dulu untuk membuka kelas ini.";
    bg = "#FFFBEB";
    color = "var(--pa-amber-700)";
  }
  if (!msg) return null;
  return (
    <div className="rounded-[12px] p-3 text-[12.5px] font-medium" style={{ background: bg, color }}>
      {msg}
    </div>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="px-5 pt-6">
      {title && (
        <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-pg-ink-900 m-0 mb-2.5">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function HeroChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded font-mono text-[10.5px] font-bold tracking-[0.03em]"
      style={{ background: "rgba(255,255,255,0.22)", color: "#fff" }}
    >
      {children}
    </span>
  );
}

function LessonRow({
  slug,
  lessonId,
  title,
  type,
  minutes,
  done,
  failed,
  current,
  locked,
}: {
  slug: string;
  lessonId: string;
  title: string;
  type: string;
  minutes: number | null;
  done: boolean;
  failed: boolean;
  current: boolean;
  locked: boolean;
}) {
  const icon = done ? "check" : failed ? "warn" : type === "quiz" ? "sparkle" : "doc";
  const inner = (
    <>
      <span
        className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0 text-white"
        style={{
          background: done
            ? "var(--pg-ok)"
            : failed
              ? "var(--pg-err)"
              : locked
                ? "var(--pg-ink-200)"
                : "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))",
        }}
      >
        <Icon name={locked ? "lock" : icon} size={16} stroke={done ? 3 : 2} />
      </span>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[13.5px] font-semibold text-pg-ink-800 truncate">{title}</span>
        <span className="text-[11px] text-pg-ink-500">
          {type === "quiz" ? "Kuis" : "Bacaan"}
          {minutes ? ` · ${minutes} mnt` : ""}
          {failed ? " · belum lulus, coba lagi" : current ? " · lanjut di sini" : ""}
        </span>
      </div>
      {!locked && !done && <Icon name="chevron_right" size={16} className="text-pg-ink-400" />}
      {locked && (
        <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] text-pg-ink-400">
          {type === "quiz" ? "Kuis terkunci" : "Terbuka nanti"}
        </span>
      )}
    </>
  );

  const cls = "flex items-center gap-3 p-3 rounded-[12px] bg-pg-white text-pg-ink-900";
  const style = {
    border: failed
      ? "1px solid var(--pg-err)"
      : current
        ? "1px solid var(--pa-amber-300)"
        : "1px solid var(--pg-ink-100)",
    opacity: locked ? 0.65 : 1,
  };

  if (locked) {
    return (
      <div className={cls} style={style}>
        {inner}
      </div>
    );
  }
  return (
    <Link href={`/akademi/${slug}/lesson/${lessonId}`} className={`${cls} no-underline`} style={style}>
      {inner}
    </Link>
  );
}
