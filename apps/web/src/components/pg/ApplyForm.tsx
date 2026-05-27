"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { Button, Field, Input, Textarea } from "./primitives";
import { trackEvent, generateEventId, getMetaCookies } from "@/lib/tracking";
import type { AppliedFormField } from "@/lib/positions-db";

type ApplyFormProps = {
  positionSlug: string;
  positionRole: string;
  positionCountry: string;
  /**
   * Apply-stage qualifying questions for this position. When non-empty, the
   * form renders as a 2-step wizard: identitas → kualifikasi + password.
   * When empty, falls back to legacy single-step layout.
   */
  fields?: AppliedFormField[];
  apiEndpoint?: string;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";

type Identity = {
  fullName: string;
  email: string;
  whatsapp: string;
  city: string;
  birthDate: string;
  gender: string;
  education: string;
};

const EMPTY_IDENTITY: Identity = {
  fullName: "",
  email: "",
  whatsapp: "",
  city: "",
  birthDate: "",
  gender: "",
  education: "",
};

export function ApplyForm({
  positionSlug,
  positionRole,
  positionCountry,
  fields = [],
  apiEndpoint,
}: ApplyFormProps) {
  const endpoint = apiEndpoint ?? `/api/lowongan/${positionSlug}`;
  const hasFields = fields.length > 0;

  const [step, setStep] = useState<1 | 2>(1);
  const [identity, setIdentity] = useState<Identity>(EMPTY_IDENTITY);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  function setIdentityField<K extends keyof Identity>(key: K, value: Identity[K]) {
    setIdentity((prev) => ({ ...prev, [key]: value }));
  }

  function setAnswer(key: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function validateIdentityAndAdvance() {
    setErrorMsg("");
    // Sub-5-field LP capture (recruitment CRO research): required = name + WA
    // + email. City + education + birth_date + gender ditanya post-apply di
    // portal onboarding biar drop-off di LP minim.
    const required: Array<keyof Identity> = ["fullName", "email", "whatsapp"];
    const missing = required.filter((k) => !identity[k].trim());
    if (missing.length > 0) {
      setErrorMsg("Lengkapi dulu data wajib (yang ada tanda *).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email)) {
      setErrorMsg("Format email tidak valid.");
      return;
    }
    setStep(2);
  }

  async function handleSubmit() {
    setErrorMsg("");

    // Validate qualifying answers (required only)
    const missingQ = fields.filter((f) => f.required && isEmpty(answers[f.field_key]));
    if (missingQ.length > 0) {
      setErrorMsg(`Isi dulu pertanyaan wajib: ${missingQ.map((m) => m.field_label).join(", ")}`);
      return;
    }

    if (!validatePassword(password)) {
      setErrorMsg("Password minimal 10 karakter, dengan huruf besar, kecil, dan angka.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Password dan konfirmasi tidak cocok.");
      return;
    }

    setStatus("loading");

    const eventId = generateEventId(`lowongan_${positionSlug}`);
    const { fbp, fbc } = getMetaCookies();
    const cleanedEmail = identity.email.trim().toLowerCase();

    const payload = {
      full_name: identity.fullName,
      whatsapp: identity.whatsapp,
      email: cleanedEmail,
      city: identity.city,
      birth_date: identity.birthDate || null,
      gender: identity.gender || null,
      education: identity.education,
      password,
      role: positionSlug,
      country: positionCountry,
      source_url: typeof window !== "undefined" ? window.location.href : "",
      role_data: answers,
      eventId,
      fbp,
      fbc,
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmittedEmail(cleanedEmail);
        setStatus("success");
        trackEvent(
          "form_submission",
          { form_name: `lowongan_${positionSlug}`, form_location: window.location.pathname },
          eventId,
        );
      } else {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setErrorMsg(data?.error ?? "Maaf, ada masalah saat mengirim. Coba lagi sebentar.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Gagal terhubung ke server. Cek koneksi internet kamu.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-6 text-center">
        <div
          className="w-16 h-16 rounded-full grid place-items-center mx-auto text-white"
          style={{ background: "var(--pg-red-600)" }}
        >
          <Icon name="check" size={32} stroke={3} />
        </div>
        <h3 className="text-xl font-extrabold tracking-tight mt-4">Lamaran kamu masuk!</h3>
        <p className="text-base text-pg-ink-700 leading-relaxed mt-2">
          Kami kirim email verifikasi ke <b className="text-pg-ink-900">{submittedEmail}</b>. Klik
          link di email untuk aktifkan akun kamu.
        </p>
        <p className="text-sm text-pg-ink-500 mt-3">
          Setelah verifikasi, masuk ke Perantau Global pakai email dan password yang baru kamu buat.
        </p>
        <a
          href={`${APP_URL}/auth/sign-in?email=${encodeURIComponent(submittedEmail)}`}
          className="mt-5 inline-flex items-center gap-2 font-bold text-pg-red-600 no-underline"
        >
          Masuk ke Perantau Global <Icon name="arrow_right" size={18} />
        </a>
        <div
          className="mt-4 px-4 py-3 rounded-lg text-left text-[13px]"
          style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
        >
          Belum ada email verifikasi? Cek folder Spam atau Promosi.
        </div>
      </div>
    );
  }

  // Legacy single-step layout: no qualifying fields configured for this slug
  if (!hasFields) {
    return (
      <SingleStepForm
        identity={identity}
        setIdentityField={setIdentityField}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        showPw={showPw}
        setShowPw={setShowPw}
        positionRole={positionRole}
        status={status}
        errorMsg={errorMsg}
        onSubmit={handleSubmit}
      />
    );
  }

  // 2-step layout
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (step === 1) validateIdentityAndAdvance();
        else void handleSubmit();
      }}
      className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 md:p-6"
    >
      <StepIndicator step={step} />

      {step === 1 ? (
        <>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">Mulai dari sini.</h3>
            <p className="text-sm text-pg-ink-500 mt-1.5 leading-relaxed">
              Isi data dasar — kami pakai untuk hubungi kamu kalau cocok.
            </p>
          </div>

          <div className="grid gap-3 mt-5">
            <Field label="Nama lengkap" required>
              <Input
                type="text"
                required
                autoComplete="name"
                placeholder="Sesuai KTP"
                value={identity.fullName}
                onChange={(e) => setIdentityField("fullName", e.target.value)}
              />
            </Field>
            <Field label="Email" required>
              <Input
                type="email"
                required
                autoComplete="email"
                placeholder="nama@email.com"
                value={identity.email}
                onChange={(e) => setIdentityField("email", e.target.value)}
              />
            </Field>
            <Field label="No. HP / WhatsApp" required>
              <Input
                type="tel"
                required
                autoComplete="tel"
                placeholder="08xxxxxxxxxx"
                value={identity.whatsapp}
                onChange={(e) => setIdentityField("whatsapp", e.target.value)}
              />
            </Field>
            <Field label="Kota tinggal">
              <Input
                type="text"
                placeholder="Jakarta"
                value={identity.city}
                onChange={(e) => setIdentityField("city", e.target.value)}
              />
            </Field>
          </div>

          {errorMsg && (
            <div
              className="mt-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
              style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
            >
              <Icon name="warn" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="mt-5">
            <Button type="submit" variant="primary" block>
              Lanjut ke kualifikasi <Icon name="arrow_right" size={18} />
            </Button>
            <div
              className="mt-3 px-3.5 py-2.5 rounded-lg flex items-start gap-2"
              style={{ background: "var(--pg-ink-50)", color: "var(--pg-ink-500)" }}
            >
              <Icon name="info" size={14} className="shrink-0 mt-0.5" />
              <div className="text-[12px] leading-relaxed">
                Belum bikin akun di langkah ini. {fields.length} pertanyaan kualifikasi dulu — baru
                daftar.
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <IdentitySummary identity={identity} onEdit={() => setStep(1)} />

          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
              Pertanyaan kualifikasi.
            </h3>
            <p className="text-sm text-pg-ink-500 mt-1.5 leading-relaxed">
              {fields.length} pertanyaan singkat. Recruiter pakai jawaban ini untuk hubungi kamu
              kalau cocok.
            </p>
          </div>

          <div className="mt-5 grid gap-5">
            {fields.map((f, i) => (
              <FieldQuestion
                key={f.id}
                field={f}
                index={i}
                total={fields.length}
                value={answers[f.field_key]}
                setValue={(v) => setAnswer(f.field_key, v)}
              />
            ))}
          </div>

          <div className="mt-6 border-t border-pg-ink-100 pt-5">
            <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-1">
              Buat akun
            </div>
            <div className="text-sm font-bold text-pg-ink-900 mb-3">Pilih password Perantau Global</div>
            <div className="grid gap-3">
              <Field label="Password" required>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    minLength={10}
                    placeholder="Minimal 10 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-pg-red-600 p-1"
                    aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPw ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </Field>
              <Field label="Konfirmasi password" required>
                <Input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  minLength={10}
                  placeholder="Ketik ulang password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>
              <div className="text-[12px] text-pg-ink-500 leading-relaxed">
                Huruf besar, kecil, dan angka. Disimpan aman — kami tidak bisa lihat password kamu.
              </div>
            </div>
          </div>

          {errorMsg && (
            <div
              className="mt-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
              style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
            >
              <Icon name="warn" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setErrorMsg("");
                setStep(1);
              }}
              disabled={status === "loading"}
              className="inline-flex items-center justify-center gap-1 min-h-[52px] px-4 text-base font-semibold rounded-xl border-[1.5px] border-pg-ink-200 text-pg-ink-900 disabled:opacity-50"
            >
              <Icon name="arrow_left" size={18} /> Kembali
            </button>
            <Button type="submit" variant="primary" block disabled={status === "loading"}>
              {status === "loading" ? (
                "Mengirim…"
              ) : (
                <>
                  Daftar &amp; buat akun <Icon name="arrow_right" size={18} />
                </>
              )}
            </Button>
          </div>

          <div
            className="mt-4 px-3.5 py-3 rounded-lg flex items-start gap-2"
            style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
          >
            <Icon name="info" size={16} className="shrink-0 mt-0.5" />
            <div className="text-[12px] leading-relaxed">
              <b>Cek email setelah daftar</b> — kamu perlu klik link verifikasi di email untuk
              aktifkan akun Perantau Global.
            </div>
          </div>

          <div className="text-[12px] text-pg-ink-500 mt-3 text-center">
            Sudah punya akun?{" "}
            <a href={`${APP_URL}/auth/sign-in`} className="text-pg-red-600 font-bold no-underline">
              Masuk di sini
            </a>
          </div>
          <div className="text-[12px] text-pg-ink-500 mt-2 text-center leading-relaxed">
            Dengan mendaftar, kamu setuju Syarat Layanan &amp; Kebijakan Privasi UU PDP 27/2022.
          </div>
        </>
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <div
          className="w-[22px] h-[22px] rounded-full grid place-items-center"
          style={{
            background: step === 2 ? "var(--pg-ok)" : "var(--pg-red-600)",
          }}
        >
          {step === 2 ? (
            <Icon name="check" size={12} stroke={3.5} className="text-white" />
          ) : (
            <span className="text-[11px] font-extrabold text-white">1</span>
          )}
        </div>
        <span
          className="text-[12px] font-bold"
          style={{ color: step === 2 ? "var(--pg-ok)" : "var(--pg-ink-900)" }}
        >
          Identitas
        </span>
      </div>
      <div
        className="flex-1 h-[2px] rounded-full"
        style={{ background: step === 2 ? "var(--pg-red-600)" : "var(--pg-ink-100)" }}
      />
      <div className="flex items-center gap-1.5">
        <div
          className="w-[22px] h-[22px] rounded-full grid place-items-center"
          style={{
            background: step === 2 ? "var(--pg-red-600)" : "var(--pg-ink-50)",
            border: step === 1 ? "1.5px solid var(--pg-ink-200)" : "none",
          }}
        >
          <span
            className="text-[11px] font-extrabold"
            style={{ color: step === 2 ? "#fff" : "var(--pg-ink-500)" }}
          >
            2
          </span>
        </div>
        <span
          className="text-[12px] font-bold"
          style={{ color: step === 2 ? "var(--pg-ink-900)" : "var(--pg-ink-500)" }}
        >
          Kualifikasi
        </span>
      </div>
    </div>
  );
}

function IdentitySummary({ identity, onEdit }: { identity: Identity; onEdit: () => void }) {
  const subtitle = [identity.email, identity.whatsapp].filter(Boolean).join(" · ");
  return (
    <div
      className="mt-4 flex items-center gap-3 px-3.5 py-3 rounded-xl"
      style={{ background: "var(--pg-ink-50)" }}
    >
      <div
        className="w-8 h-8 rounded-full grid place-items-center shrink-0"
        style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
      >
        <Icon name="user" size={16} stroke={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold text-pg-ink-900 truncate">
          {identity.fullName || "—"}
          {identity.city && <span className="text-pg-ink-500"> · {identity.city}</span>}
        </div>
        {subtitle && (
          <div className="text-[12px] text-pg-ink-500 truncate">{subtitle}</div>
        )}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-[13px] font-bold text-pg-red-600 shrink-0 px-1 py-1"
      >
        Ubah
      </button>
    </div>
  );
}

function FieldQuestion({
  field,
  index,
  total,
  value,
  setValue,
}: {
  field: AppliedFormField;
  index: number;
  total: number;
  value: string | string[] | undefined;
  setValue: (v: string | string[]) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-pg-ink-500">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
        <span
          className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.06em] uppercase"
          style={{
            background: field.required ? "var(--pg-err-bg)" : "var(--pg-warn-bg)",
            color: field.required ? "var(--pg-err)" : "var(--pg-warn)",
          }}
        >
          {field.required ? "Wajib" : "Bonus"}
        </span>
      </div>
      <div className="text-[16px] font-bold leading-snug">{field.field_label}</div>
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
                  className={`flex items-center gap-3 px-3.5 py-3 min-h-[52px] rounded-xl border-[1.5px] cursor-pointer ${
                    selected
                      ? "border-pg-red-600 bg-pg-red-50"
                      : "border-pg-ink-200 bg-pg-white"
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
                  <span
                    className={`text-[15px] flex-1 ${selected ? "font-bold" : "font-medium"}`}
                  >
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
                  className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 text-sm font-bold rounded-full border-[1.5px] ${
                    selected
                      ? "bg-pg-red-50 border-pg-red-600 text-pg-red-800"
                      : "bg-pg-white border-pg-ink-200 text-pg-ink-700"
                  }`}
                >
                  {selected && <Icon name="check" size={12} stroke={2.4} />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
        {(field.field_type === "text" || field.field_type === "number") && (
          <Input
            type={field.field_type === "number" ? "number" : "text"}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => setValue(e.target.value)}
          />
        )}
        {field.field_type === "textarea" && (
          <Textarea
            value={typeof value === "string" ? value : ""}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
          />
        )}
      </div>
    </div>
  );
}

// Single-step legacy fallback (positions without seeded apply-stage fields).
function SingleStepForm({
  identity,
  setIdentityField,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPw,
  setShowPw,
  positionRole,
  status,
  errorMsg,
  onSubmit,
}: {
  identity: Identity;
  setIdentityField: <K extends keyof Identity>(key: K, value: Identity[K]) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPw: boolean;
  setShowPw: (fn: (prev: boolean) => boolean) => void;
  positionRole: string;
  status: "idle" | "loading" | "success" | "error";
  errorMsg: string;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 md:p-6"
    >
      <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
        Daftar untuk {positionRole}
      </div>
      <h3 className="text-xl md:text-2xl font-extrabold tracking-tight mt-1">Mulai dari sini.</h3>
      <p className="text-sm text-pg-ink-500 mt-1.5">
        Isi data + pilih password. Kami buatkan akun Perantau Global kamu sekaligus.
      </p>

      <div className="grid gap-3 mt-5">
        <Field label="Nama lengkap" required>
          <Input
            type="text"
            required
            autoComplete="name"
            placeholder="Maya Sari"
            value={identity.fullName}
            onChange={(e) => setIdentityField("fullName", e.target.value)}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email" required>
            <Input
              type="email"
              required
              autoComplete="email"
              placeholder="maya@email.com"
              value={identity.email}
              onChange={(e) => setIdentityField("email", e.target.value)}
            />
          </Field>
          <Field label="Nomor HP" required>
            <Input
              type="tel"
              required
              autoComplete="tel"
              placeholder="+62 812 …"
              value={identity.whatsapp}
              onChange={(e) => setIdentityField("whatsapp", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Kota tinggal">
          <Input
            type="text"
            placeholder="Jakarta (opsional, bisa diisi nanti di portal)"
            value={identity.city}
            onChange={(e) => setIdentityField("city", e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-5 border-t border-pg-ink-100 pt-5">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-3">
          Akun Perantau Global
        </div>
        <div className="grid gap-3">
          <Field label="Password" required>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                required
                autoComplete="new-password"
                minLength={10}
                placeholder="Minimal 10 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-pg-red-600 p-1"
                aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPw ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>
          </Field>
          <Field label="Konfirmasi password" required>
            <Input
              type={showPw ? "text" : "password"}
              required
              autoComplete="new-password"
              minLength={10}
              placeholder="Ketik ulang password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>
          <div className="text-[12px] text-pg-ink-500 leading-relaxed">
            Kombinasi huruf besar, huruf kecil, dan angka. Disimpan aman — kami nggak bisa lihat
            password kamu.
          </div>
        </div>
      </div>

      {errorMsg && (
        <div
          className="mt-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
        >
          <Icon name="warn" size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="mt-5">
        <Button type="submit" variant="primary" block disabled={status === "loading"}>
          {status === "loading" ? (
            "Mengirim…"
          ) : (
            <>
              Daftar &amp; buat akun <Icon name="arrow_right" size={18} />
            </>
          )}
        </Button>
        <div className="text-[12px] text-pg-ink-500 mt-3 text-center">
          Sudah punya akun?{" "}
          <a href={`${APP_URL}/auth/sign-in`} className="text-pg-red-600 font-bold no-underline">
            Masuk di sini
          </a>
        </div>
        <div className="text-[12px] text-pg-ink-500 mt-2 text-center">
          Kami tidak kirim spam. Data kamu aman & sesuai UU PDP.
        </div>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isEmpty(v: string | string[] | undefined): boolean {
  if (v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  return v.length === 0;
}

function validatePassword(pw: string): boolean {
  if (pw.length < 10) return false;
  if (!/[a-z]/.test(pw)) return false;
  if (!/[A-Z]/.test(pw)) return false;
  if (!/[0-9]/.test(pw)) return false;
  return true;
}

