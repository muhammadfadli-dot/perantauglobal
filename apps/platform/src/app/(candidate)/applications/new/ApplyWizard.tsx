"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { Button, Badge } from "@/components/pg/primitives";
import { countryLabelFromDb } from "@perantauglobal/db/country";
import { submitApplication } from "./actions";

type Position = {
  slug: string;
  name: string;
  country: string;
  description: string | null;
};

type WizardDetail = {
  salary: string | null;
  salaryNote: string | null;
  jobDescription: string[];
  benefits: { icon: string; label: string; value: string }[];
  fee: { amount: string; breakdown: string[]; note?: string } | null;
};

type JobOrder = {
  id: string;
  intake_label: string;
  slot_count: number;
  slot_filled: number;
  deadline: string | null;
};

type ReqStatus = {
  key: string;
  label: string;
  type: "hard" | "soft";
  passed: boolean;
  currentValue: string | null;
  allowedValues: string[] | null;
};

type DocStatus = {
  type: "ktp" | "passport";
  status: "verified" | "pending" | "rejected" | "missing";
};

type FormField = {
  id: string;
  field_key: string;
  field_label: string;
  field_help: string | null;
  field_type: string;
  options: { value: string; label: string; qualifying?: boolean }[] | null;
  required: boolean;
  sort_order: number;
};

const DOC_LABEL: Record<DocStatus["type"], string> = {
  ktp: "KTP",
  passport: "Passport",
};

export default function ApplyWizard({
  position,
  detail,
  jobOrder,
  reqStatus,
  hardMissingCount,
  docStatus,
  docMissingCount,
  fields,
}: {
  position: Position;
  detail: WizardDetail;
  jobOrder: JobOrder | null;
  reqStatus: ReqStatus[];
  hardMissingCount: number;
  docStatus: DocStatus[];
  docMissingCount: number;
  fields: FormField[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // PDP UU 27/2022: consent must be affirmative — default UNCHECKED, candidate ticks it.
  const [agree, setAgree] = useState(false);

  const totalSteps = fields.length > 0 ? 3 : 2;

  function setAnswer(key: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setError(null);
    if (step === 1) {
      // Allow proceed even with missing — block at submit if hard requirements still missing
      setStep(fields.length > 0 ? 2 : 3);
    } else if (step === 2) {
      // Validate required custom fields
      const missing = fields.filter((f) => f.required && !answers[f.field_key]);
      if (missing.length > 0) {
        setError(`Isi dulu pertanyaan wajib: ${missing.map((m) => m.field_label).join(", ")}`);
        return;
      }
      setStep(3);
    }
  }

  function prev() {
    setError(null);
    if (step === 3 && fields.length > 0) setStep(2);
    else if (step === 3) setStep(1);
    else setStep(1);
  }

  function submit() {
    setError(null);
    if (!agree) {
      setError("Centang dulu pernyataan persetujuan.");
      return;
    }
    start(async () => {
      try {
        const result = await submitApplication({
          position_slug: position.slug,
          job_order_id: jobOrder?.id ?? null,
          answers,
          agreed: agree,
        });
        if (result.ok) {
          router.push(`/applications/${result.applicationId}/welcome`);
        } else {
          setError(result.error);
        }
      } catch {
        // Last-resort guard for unexpected throws (network, server crash).
        setError("Gagal kirim lamaran. Coba lagi sebentar.");
      }
    });
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNum = (i + 1) as 1 | 2 | 3;
            const reached = step >= stepNum;
            return (
              <div
                key={i}
                className="flex-1 h-1.5 rounded-full"
                style={{ background: reached ? "var(--pg-red-600)" : "var(--pg-ink-100)" }}
              />
            );
          })}
        </div>
        <div className="text-[12px] font-bold tracking-[0.08em] uppercase text-pg-ink-500 mt-2">
          Langkah {step === 3 ? totalSteps : step} dari {totalSteps}
        </div>
      </div>

      {step === 1 && (
        <Step1
          position={position}
          detail={detail}
          jobOrder={jobOrder}
          reqStatus={reqStatus}
          hardMissingCount={hardMissingCount}
          docStatus={docStatus}
          docMissingCount={docMissingCount}
        />
      )}
      {step === 2 && fields.length > 0 && (
        <Step2 fields={fields} answers={answers} setAnswer={setAnswer} />
      )}
      {step === 3 && (
        <Step3
          position={position}
          jobOrder={jobOrder}
          fields={fields}
          answers={answers}
          agree={agree}
          setAgree={setAgree}
        />
      )}

      {error && (
        <div className="px-5 pt-3">
          <div
            role="alert"
            aria-live="assertive"
            className="px-3.5 py-3 rounded-lg flex items-start gap-2 text-sm"
            style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
          >
            <Icon name="warn" size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Sticky footer */}
      <div
        className="sticky bottom-0 z-30 px-5 py-3.5 pb-5 border-t border-pg-ink-100 flex gap-2"
        style={{ background: "rgba(255,255,255,.96)", backdropFilter: "blur(8px)" }}
      >
        {step > 1 && (
          <button
            type="button"
            onClick={prev}
            disabled={pending}
            className="inline-flex items-center justify-center gap-1 min-h-[52px] px-4 text-base font-semibold rounded-xl border-[1.5px] border-pg-ink-200 text-pg-ink-900 disabled:opacity-50"
          >
            <Icon name="arrow_left" size={18} /> Mundur
          </button>
        )}
        {step < 3 ? (
          <Button onClick={next} variant="primary" block>
            Lanjut <Icon name="arrow_right" size={18} />
          </Button>
        ) : (
          <Button onClick={submit} variant="primary" block disabled={pending || hardMissingCount > 0}>
            {pending ? "Mengirim…" : (
              <>
                Kirim lamaran <Icon name="check" size={18} stroke={2.6} />
              </>
            )}
          </Button>
        )}
      </div>

      {hardMissingCount > 0 && step === 3 && (
        <div className="fixed bottom-[88px] left-0 right-0 px-5 z-30">
          <div
            className="px-3.5 py-2.5 rounded-lg text-[12px] flex items-center gap-2"
            style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
          >
            <Icon name="warn" size={14} />
            <span>Masih ada {hardMissingCount} syarat wajib yang belum kamu penuhi. Lengkapi profil dulu.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Step1({
  position,
  detail,
  jobOrder,
  reqStatus,
  hardMissingCount,
  docStatus,
  docMissingCount,
}: {
  position: Position;
  detail: WizardDetail;
  jobOrder: JobOrder | null;
  reqStatus: ReqStatus[];
  hardMissingCount: number;
  docStatus: DocStatus[];
  docMissingCount: number;
}) {
  const hasDetail =
    !!detail.salary ||
    detail.jobDescription.length > 0 ||
    detail.benefits.length > 0 ||
    !!detail.fee;
  return (
    <div>
      <section className="px-5 pt-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Cek dulu sebelum lamar.</h1>
        <p className="text-base text-pg-ink-700 mt-2 leading-relaxed">
          Pastikan kamu memenuhi syarat dan dokumen sudah siap.
        </p>
      </section>

      <section className="px-5 pt-4">
        <div className="bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
          <div
            className="px-5 py-4 text-white relative"
            style={{
              background:
                "radial-gradient(ellipse at 80% 10%, rgba(255,255,255,.18), transparent 60%), var(--pg-red-600)",
            }}
          >
            <div className="text-[11px] font-bold tracking-[0.14em] uppercase opacity-85">
              {countryLabelFromDb(position.country, position.country)}
            </div>
            <div className="text-2xl font-extrabold tracking-tight mt-1">{position.name}.</div>
          </div>
          <div className="px-5 py-4">
            {jobOrder ? (
              <div className="grid gap-1.5">
                <Row k="Batch" v={jobOrder.intake_label} />
                <Row k="Slot" v={`${jobOrder.slot_filled} / ${jobOrder.slot_count} terisi`} />
                <Row
                  k="Deadline"
                  v={jobOrder.deadline ? new Date(jobOrder.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                />
              </div>
            ) : (
              <div className="text-sm text-pg-ink-500">
                Belum ada batch aktif. Lamaran kamu masuk daftar antrian — kami hubungi via email
                saat batch baru dibuka.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Decision content — salary, job description, benefits, fee (parity with
          the public lowongan detail; previously hidden from logged-in users). */}
      {hasDetail && (
        <section className="px-5 pt-4">
          <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 flex flex-col gap-4">
            {detail.salary && (
              <div>
                <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-pg-ink-500">
                  Gaji
                </div>
                <div className="text-[20px] font-extrabold tracking-tight mt-0.5">
                  {detail.salary}{" "}
                  {detail.salaryNote && (
                    <span className="text-[13px] font-medium text-pg-ink-500">
                      {detail.salaryNote}
                    </span>
                  )}
                </div>
              </div>
            )}
            {detail.jobDescription.length > 0 && (
              <div>
                <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-1.5">
                  Deskripsi kerja
                </div>
                <ul className="flex flex-col gap-1.5">
                  {detail.jobDescription.slice(0, 6).map((d, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[14px] text-pg-ink-700 leading-snug"
                    >
                      <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-pg-red-600 shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {detail.benefits.length > 0 && (
              <div>
                <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-1.5">
                  Benefit
                </div>
                <div className="grid gap-1.5">
                  {detail.benefits.slice(0, 6).map((b, i) => (
                    <div
                      key={i}
                      className="flex items-baseline justify-between gap-3 text-[14px]"
                    >
                      <span className="text-pg-ink-700">{b.label}</span>
                      <span className="font-bold text-right">{b.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {detail.fee && (
              <div className="rounded-xl p-3" style={{ background: "var(--pg-ok-bg)" }}>
                <div className="text-[13px] font-bold" style={{ color: "var(--pg-ok)" }}>
                  Biaya: {detail.fee.amount}
                </div>
                {detail.fee.note && (
                  <div className="text-[12px] text-pg-ink-600 mt-0.5">{detail.fee.note}</div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Requirements check */}
      <section className="px-5 pt-5">
        <h2 className="text-lg font-bold tracking-tight">Cek syarat</h2>
        <div className="mt-3 grid gap-2">
          {reqStatus.length === 0 ? (
            <div className="bg-pg-white border border-pg-ink-100 rounded-xl px-4 py-3.5 text-sm text-pg-ink-500">
              Tidak ada syarat khusus untuk posisi ini.
            </div>
          ) : (
            reqStatus.map((r) => (
              <div
                key={r.key}
                className="bg-pg-white border border-pg-ink-100 rounded-xl px-4 py-3 flex items-start gap-3"
              >
                <div
                  className="w-7 h-7 rounded-full grid place-items-center shrink-0 mt-0.5"
                  style={{
                    background: r.passed
                      ? "var(--pg-ok)"
                      : r.type === "hard"
                        ? "var(--pg-err-bg)"
                        : "var(--pg-ink-100)",
                    color: r.passed ? "#fff" : r.type === "hard" ? "var(--pg-err)" : "var(--pg-ink-500)",
                  }}
                >
                  <Icon name={r.passed ? "check" : "x"} size={14} stroke={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold">{r.label}</div>
                  {r.passed ? (
                    <div className="text-[12px] text-pg-ok mt-0.5">
                      ✓ Cocok ({r.currentValue})
                    </div>
                  ) : (
                    <div className={`text-[12px] mt-0.5 ${r.type === "hard" ? "text-pg-err" : "text-pg-ink-500"}`}>
                      {r.currentValue
                        ? `Kamu isi "${r.currentValue}", butuh: ${r.allowedValues?.join(", ") ?? "—"}`
                        : "Belum diisi"}
                    </div>
                  )}
                </div>
                <Badge variant={r.type === "hard" ? "err" : "info"}>
                  {r.type === "hard" ? "Wajib" : "Opsional"}
                </Badge>
              </div>
            ))
          )}
        </div>
        {hardMissingCount > 0 && (
          <Link
            href="/profile"
            className="mt-3 flex items-center gap-2 px-3.5 py-3 rounded-lg text-sm font-bold no-underline"
            style={{ background: "var(--pg-warn-bg)", color: "var(--pg-warn)" }}
          >
            <Icon name="user" size={16} stroke={2} />
            <span className="flex-1">Lengkapi {hardMissingCount} syarat wajib di profil →</span>
            <Icon name="arrow_right" size={16} />
          </Link>
        )}
      </section>

      {/* Docs */}
      <section className="px-5 pt-5 pb-6">
        <h2 className="text-lg font-bold tracking-tight">Dokumen wajib</h2>
        <div className="mt-3 grid gap-2">
          {docStatus.map((d) => (
            <div
              key={d.type}
              className="bg-pg-white border border-pg-ink-100 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div className="flex-1 text-[14px] font-bold">{DOC_LABEL[d.type]}</div>
              {d.status === "verified" && <Badge variant="ok" icon="check">Verified</Badge>}
              {d.status === "pending" && <Badge variant="warn">Review</Badge>}
              {d.status === "rejected" && <Badge variant="err">Tolak</Badge>}
              {d.status === "missing" && <Badge variant="mute">Belum upload</Badge>}
            </div>
          ))}
        </div>
        {docMissingCount > 0 && (
          <Link
            href="/profile"
            className="mt-3 flex items-center gap-2 px-3.5 py-3 rounded-lg text-sm font-bold no-underline"
            style={{ background: "var(--pg-warn-bg)", color: "var(--pg-warn)" }}
          >
            <Icon name="upload" size={16} />
            <span className="flex-1">Upload {docMissingCount} dokumen di profil →</span>
            <Icon name="arrow_right" size={16} />
          </Link>
        )}
        <div className="mt-3 text-[12px] text-pg-ink-500 leading-relaxed">
          Dokumen tidak wajib lengkap sekarang. KTP yang utama; paspor, foto, &
          CV diminta nanti di tahap Cek Dokumen.
        </div>
      </section>
    </div>
  );
}

function Step2({
  fields,
  answers,
  setAnswer,
}: {
  fields: FormField[];
  answers: Record<string, string | string[]>;
  setAnswer: (key: string, value: string | string[]) => void;
}) {
  return (
    <div>
      <section className="px-5 pt-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Pertanyaan tambahan.</h1>
        <p className="text-base text-pg-ink-700 mt-2 leading-relaxed">
          Bantu kami cocokkan kamu dengan employer yang tepat.
        </p>
      </section>

      <section className="px-5 pt-4 pb-6 grid gap-3">
        {fields.map((f) => (
          <FieldInput
            key={f.id}
            field={f}
            value={answers[f.field_key]}
            setValue={(v) => setAnswer(f.field_key, v)}
          />
        ))}
      </section>
    </div>
  );
}

function FieldInput({
  field,
  value,
  setValue,
}: {
  field: FormField;
  value: string | string[] | undefined;
  setValue: (v: string | string[]) => void;
}) {
  return (
    <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-4 md:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[15px] font-bold">{field.field_label}</div>
        {field.required && <Badge variant="err">Wajib</Badge>}
      </div>
      {field.field_help && (
        <div className="text-[13px] text-pg-ink-500 mt-1 leading-relaxed">{field.field_help}</div>
      )}
      <div className="mt-3">
        {(field.field_type === "radio" || field.field_type === "select") && field.options && (
          <div className="grid gap-2">
            {field.options.map((opt) => {
              const selected = value === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-xl border-[1.5px] cursor-pointer focus-within:ring-2 focus-within:ring-pg-red-600 focus-within:ring-offset-1 ${
                    selected
                      ? "border-pg-red-600 bg-pg-red-50"
                      : "border-pg-ink-200 bg-pg-white hover:border-pg-ink-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={field.field_key}
                    value={opt.value}
                    checked={selected}
                    onChange={() => setValue(opt.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${
                      selected ? "border-pg-red-600" : "border-pg-ink-300"
                    }`}
                  >
                    {selected && <div className="w-2.5 h-2.5 rounded-full bg-pg-red-600" />}
                  </div>
                  <span className={`text-[15px] flex-1 ${selected ? "font-bold" : "font-medium"}`}>
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
        {field.field_type === "multiselect" && field.options && (
          <div className="flex gap-2 flex-wrap">
            {field.options.map((opt) => {
              const arr = Array.isArray(value) ? value : [];
              const selected = arr.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setValue(selected ? arr.filter((v) => v !== opt.value) : [...arr, opt.value])
                  }
                  className={`inline-flex items-center gap-1.5 min-h-[44px] px-3.5 text-sm font-bold rounded-full border-[1.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-pg-red-600 focus-visible:ring-offset-1 ${
                    selected
                      ? "bg-pg-red-50 border-pg-red-600 text-pg-red-800"
                      : "bg-pg-white border-pg-ink-200 text-pg-ink-700"
                  }`}
                  aria-pressed={selected}
                >
                  {selected && <Icon name="check" size={12} stroke={2.4} />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
        {(field.field_type === "text" || field.field_type === "number") && (
          <input
            type={field.field_type === "number" ? "number" : "text"}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => setValue(e.target.value)}
            aria-required={field.required}
            aria-label={field.field_label}
            className="w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3.5 py-3 text-base focus:border-pg-red-600 outline-none focus-visible:ring-2 focus-visible:ring-pg-red-200"
          />
        )}
        {field.field_type === "textarea" && (
          <textarea
            value={typeof value === "string" ? value : ""}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            aria-required={field.required}
            aria-label={field.field_label}
            className="w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3.5 py-3 text-base focus:border-pg-red-600 outline-none focus-visible:ring-2 focus-visible:ring-pg-red-200"
          />
        )}
      </div>
    </div>
  );
}

function Step3({
  position,
  jobOrder,
  fields,
  answers,
  agree,
  setAgree,
}: {
  position: Position;
  jobOrder: JobOrder | null;
  fields: FormField[];
  answers: Record<string, string | string[]>;
  agree: boolean;
  setAgree: (v: boolean) => void;
}) {
  return (
    <div>
      <section className="px-5 pt-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Periksa sebelum kirim.</h1>
        <p className="text-base text-pg-ink-700 mt-2 leading-relaxed">
          Pastikan semua benar. Setelah dikirim, tim kami akan review dalam 3–5 hari.
        </p>
      </section>

      <section className="px-5 pt-4">
        <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            Posisi
          </div>
          <div className="text-xl font-extrabold tracking-tight mt-1">
            {position.name} · {countryLabelFromDb(position.country, position.country)}
          </div>
          {jobOrder && (
            <div className="text-sm text-pg-ink-500 mt-1">{jobOrder.intake_label}</div>
          )}
        </div>
      </section>

      {fields.length > 0 && (
        <section className="px-5 pt-4">
          <div className="bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-pg-ink-100 text-[12px] font-bold tracking-[0.08em] uppercase text-pg-ink-500">
              Jawaban kamu
            </div>
            {fields.map((f, i) => {
              const v = answers[f.field_key];
              const display = Array.isArray(v) ? v.join(", ") : (v ?? "—");
              return (
                <div
                  key={f.id}
                  className={`px-5 py-3 flex justify-between gap-3 ${i ? "border-t border-pg-ink-100" : ""}`}
                >
                  <div className="text-sm text-pg-ink-500">{f.field_label}</div>
                  <div className="text-sm font-bold text-right">{display || "—"}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="px-5 pt-5 pb-6">
        <label className="flex gap-3 items-start cursor-pointer rounded-xl p-1 -m-1 focus-within:ring-2 focus-within:ring-pg-red-600 focus-within:ring-offset-1">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            aria-required
            className="sr-only"
          />
          <div
            className={`w-[22px] h-[22px] rounded-md grid place-items-center shrink-0 mt-0.5 ${
              agree ? "bg-pg-red-600" : "border-[1.5px] border-pg-ink-300"
            }`}
          >
            {agree && <Icon name="check" size={14} stroke={3} className="text-white" />}
          </div>
          <div className="text-[14px] leading-relaxed text-pg-ink-700">
            Saya menyatakan semua data yang saya berikan benar dan saya setuju dengan{" "}
            <a
              href="https://perantauglobal.com/id/terms"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-pg-red-600 underline"
            >
              syarat &amp; ketentuan
            </a>{" "}
            Perantau Global.
          </div>
        </label>
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 py-1">
      <div className="text-sm text-pg-ink-500">{k}</div>
      <div className="text-sm font-semibold text-right">{v}</div>
    </div>
  );
}
