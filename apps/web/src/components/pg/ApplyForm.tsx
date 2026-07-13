"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { Button, Field, Input, Textarea } from "./primitives";
import { trackEvent, generateEventId, getMetaCookies } from "@/lib/tracking";
import type { AppliedFormField } from "@/lib/positions-db";
import { uploadPendingCv, validateCvFile, isCvUploadConfigured } from "@/lib/supabase-storage-anon";
import { useTurnstile } from "./useTurnstile";
import { CV_UPLOAD_MICROCOPY, CV_CONSENT_TEXT } from "@/lib/cv-consent";
import { CvFitCard, type CvFitPreview } from "./CvFitCard";

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

// Codes are [A-Z0-9-], 4–32 (mirrors the DB CHECK). Only start the live check
// once enough characters are typed so we don't ping the API on every keystroke.
const REFERRAL_MIN_LEN = 4;

// "CV di depan" gate: skor kecocokan minimum ("lumayan cocok") supaya kandidat
// boleh submit lamaran. Di bawah ini, submit diblok + kandidat diarahkan
// memperkuat CV lalu unggah ulang. Gate ini soft/UX (bukan security boundary);
// admin tetap melihat fit asli setelah materialisasi.
const CV_FIT_THRESHOLD = 45;

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

  // Optional affiliate referral code ("kode agen"). Normalized on change; a
  // non-blocking debounced check just shows a subtle ✓/✗ hint. The code itself
  // travels in the POST payload as `ref` regardless of the hint - attribution
  // is resolved server-side by the DB trigger, never gated here.
  const [referralCode, setReferralCode] = useState("");
  const [referralCheck, setReferralCheck] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  // Fase 2 CV grader: CV di depan funnel. Variant + pendingId di-init client-side
  // via lazy initializer (LP statis SSG; bukan setState-in-effect biar lolos lint).
  // pendingId dipakai sebagai path upload anon DAN PK pending_submissions nanti.
  // DIREGENERATE per attempt upload (handleCvChange) - lihat catatan di sana:
  // bucket pending-cv anon INSERT-only tanpa upsert, jadi re-upload ke path yg
  // sama = 409. UUID baru tiap attempt = path baru = re-upload (loop gate) lolos.
  const [pendingId, setPendingId] = useState<string>(() =>
    typeof window !== "undefined" && typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : "",
  );
  // Treatment A/B "CV wajib" diaktifin lewat ?ab=cv_req (kontrol = opsional).
  const [cvRequired] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("ab") === "cv_req",
  );
  const cvUploadAvailable = isCvUploadConfigured();
  // Cloudflare Turnstile (managed, invisible-first). Inert when the site key is
  // absent (preview/dev) — runTurnstile() resolves null and callers proceed.
  const { setContainer: turnstileContainerRef, execute: runTurnstile } = useTurnstile(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
  const [cvStatus, setCvStatus] = useState<"idle" | "uploading" | "uploaded" | "error">("idle");
  const [cvPath, setCvPath] = useState("");
  const [cvMime, setCvMime] = useState("");
  const [cvSize, setCvSize] = useState(0);
  const [cvFileName, setCvFileName] = useState("");
  const [cvError, setCvError] = useState("");
  // "CV di depan": position-fit preview shown right after CV upload. Powered by
  // /api/lowongan/[slug]/cv-preview -> grade-cv preview mode (extract+fit
  // in-memory, nothing persisted). Non-blocking — the form stays usable while
  // this runs, and a miss just shows nothing.
  const [cvFit, setCvFit] = useState<CvFitPreview | null>(null);
  const [cvFitLoading, setCvFitLoading] = useState(false);

  // CV-gate derived state. Gate aktif kalau upload CV tersedia (di prod: selalu).
  // Fail-open: fitScore null setelah loading kelar (penilaian gagal / CV tak
  // terbaca) TIDAK memblok submit — jangan hukum kandidat karena error transient.
  const fitScore = cvFit?.fit_score ?? null;
  const cvGateActive = cvUploadAvailable;
  const cvGateReady = cvStatus === "uploaded" && !cvFitLoading;
  const cvGateBlocked = cvGateActive && cvGateReady && fitScore != null && fitScore < CV_FIT_THRESHOLD;
  const cvGatePassed =
    !cvGateActive || (cvGateReady && (fitScore == null || fitScore >= CV_FIT_THRESHOLD));
  // Honeypot: hidden field, bots fill it, humans never see/tab to it.
  const [honeypot, setHoneypot] = useState("");

  function setIdentityField<K extends keyof Identity>(key: K, value: Identity[K]) {
    setIdentity((prev) => ({ ...prev, [key]: value }));
  }

  function setAnswer(key: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function handleReferralChange(raw: string) {
    setReferralCode(normalizeReferral(raw));
    // Reset the hint on input (event handler - allowed). The effect below only
    // runs the async check and never sets state synchronously, satisfying the
    // react-hooks/set-state-in-effect rule.
    setReferralCheck("idle");
  }

  // Debounced, NON-blocking validity hint. Never gates submit - a bad/unknown
  // code is fine; the server still stages it and the trigger no-ops on
  // unresolved. Aborts in-flight checks on each keystroke; ignores network
  // errors (hint just goes back to neutral).
  useEffect(() => {
    // Only the async result is set here (inside the timeout/promise) - never a
    // synchronous setState in the effect body (react-hooks/set-state-in-effect).
    // The "idle"/"checking" reset happens in handleReferralChange on input.
    if (referralCode.length < REFERRAL_MIN_LEN) return;
    const controller = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/referral/validate?code=${encodeURIComponent(referralCode)}`, {
        signal: controller.signal,
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { valid?: boolean } | null) => {
          setReferralCheck(d?.valid ? "valid" : "invalid");
        })
        .catch(() => {
          // Abort or network error - drop the hint silently, don't block.
          if (!controller.signal.aborted) setReferralCheck("idle");
        });
    }, 400);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [referralCode]);

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

  // Fire the position-fit preview once a CV is staged. Best-effort + non-blocking:
  // any failure just leaves the card hidden (the route already 200s with no fit).
  async function runCvPreview(id: string, path: string, mime: string) {
    setCvFit(null);
    setCvFitLoading(true);
    try {
      const turnstileToken = await runTurnstile();
      const res = await fetch(`/api/lowongan/${positionSlug}/cv-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pending_id: id, cv_path: path, cv_mime: mime, answers, turnstile_token: turnstileToken }),
      });
      const data = res.ok ? await res.json().catch(() => null) : null;
      setCvFit((data?.fit as CvFitPreview | null) ?? null);
    } catch {
      setCvFit(null);
    } finally {
      setCvFitLoading(false);
    }
  }

  async function handleCvChange(file: File | null) {
    setCvError("");
    setCvFit(null);
    setCvFitLoading(false);
    if (!file) {
      setCvStatus("idle");
      setCvPath("");
      setCvMime("");
      setCvSize(0);
      setCvFileName("");
      return;
    }
    const v = validateCvFile(file);
    if (!v.ok) {
      setCvError(v.error);
      setCvStatus("error");
      return;
    }
    if (!pendingId) {
      setCvError("Sesi belum siap. Muat ulang halaman lalu coba lagi.");
      setCvStatus("error");
      return;
    }
    setCvFileName(file.name);
    setCvStatus("uploading");
    // Tiap attempt upload pakai pendingId BARU. Path pending-cv deterministic
    // (pending/<id>/cv.<ext>) + bucket anon INSERT-only tanpa upsert -> upload
    // ulang ke path yg sama balikin 409. UUID baru per attempt = path baru =
    // re-upload (mis. abis diblok gate lalu perbaiki CV) selalu lolos. File
    // attempt sebelumnya jadi orphan -> kepurge otomatis <=48 jam. pendingId
    // state jadi attemptId terakhir; dipakai submit sebagai PK + validasi path.
    const attemptId =
      typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : pendingId;
    setPendingId(attemptId);
    const res = await uploadPendingCv(attemptId, file);
    if (res.ok) {
      setCvPath(res.path);
      setCvMime(res.mime);
      setCvSize(res.size);
      setCvStatus("uploaded");
      void runCvPreview(attemptId, res.path, res.mime);
    } else {
      setCvError(res.error);
      setCvStatus("error");
      setCvPath("");
      setCvMime("");
      setCvSize(0);
    }
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

    // "CV di depan" gate: CV wajib + kecocokan >= threshold ("lumayan cocok").
    if (cvGateActive && cvStatus !== "uploaded") {
      setErrorMsg(
        cvStatus === "uploading"
          ? "Tunggu CV selesai diunggah dulu."
          : "Lampirkan CV dulu untuk lanjut daftar posisi ini.",
      );
      return;
    }
    if (cvGateActive && cvFitLoading) {
      setErrorMsg("Sebentar, kami sedang menilai kecocokan CV kamu.");
      return;
    }
    if (cvGateBlocked) {
      setErrorMsg(
        "CV kamu belum cukup cocok untuk posisi ini. Lihat bagian yang bisa diperkuat di atas, lalu unggah CV yang sudah diperbarui.",
      );
      return;
    }

    setStatus("loading");

    const turnstileToken = await runTurnstile();
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
      // Optional referral/agent code. Only stage a canonically-shaped code
      // (>= 4 chars, matching the server normalizeRef + DB CHECK); shorter input
      // can never resolve. The live ✓/✗ hint never blocks this from being sent.
      ...(referralCode.length >= REFERRAL_MIN_LEN ? { ref: referralCode } : {}),
      // Fase 2 CV grader: pending_id (path upload == PK) + pointer CV staged.
      ...(pendingId ? { pending_id: pendingId } : {}),
      ...(cvStatus === "uploaded" && cvPath
        ? { cv_path: cvPath, cv_mime: cvMime, cv_size: cvSize }
        : {}),
      ab_variant: cvRequired ? "cv_required" : "control",
      turnstile_token: turnstileToken,
      hp: honeypot,
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
        referralCode={referralCode}
        onReferralChange={handleReferralChange}
        referralCheck={referralCheck}
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

      {/* Cloudflare Turnstile (managed, interaction-only). Invisible for most
          visitors; renders a challenge here only when Cloudflare flags the
          request. Kept outside the step branches so it mounts once. */}
      <div ref={turnstileContainerRef} className="flex justify-center empty:hidden [&:not(:empty)]:mt-3" />

      {/* Honeypot: hidden anti-bot field. Humans never see it / tab to it. */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      {step === 1 ? (
        <>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">Mulai dari sini.</h3>
            <p className="text-sm text-pg-ink-500 mt-1.5 leading-relaxed">
              Isi data dasar - kami pakai untuk hubungi kamu kalau cocok.
            </p>
          </div>

          <div className="grid gap-3 mt-5">
            <Field label="Nama lengkap" required htmlFor="apply-fullName">
              <Input
                id="apply-fullName"
                type="text"
                required
                autoComplete="name"
                placeholder="Sesuai KTP"
                value={identity.fullName}
                onChange={(e) => setIdentityField("fullName", e.target.value)}
              />
            </Field>
            <Field label="Email" required htmlFor="apply-email">
              <Input
                id="apply-email"
                type="email"
                required
                autoComplete="email"
                placeholder="nama@email.com"
                value={identity.email}
                onChange={(e) => setIdentityField("email", e.target.value)}
              />
            </Field>
            <Field label="No. HP / WhatsApp" required htmlFor="apply-whatsapp">
              <Input
                id="apply-whatsapp"
                type="tel"
                required
                autoComplete="tel"
                placeholder="08xxxxxxxxxx"
                value={identity.whatsapp}
                onChange={(e) => setIdentityField("whatsapp", e.target.value)}
              />
            </Field>
            <Field label="Kota tinggal" htmlFor="apply-city">
              <Input
                id="apply-city"
                type="text"
                placeholder="Jakarta"
                value={identity.city}
                onChange={(e) => setIdentityField("city", e.target.value)}
              />
            </Field>
            <ReferralField
              value={referralCode}
              onChange={handleReferralChange}
              check={referralCheck}
            />
          </div>

          {errorMsg && (
            <div
              role="alert"
              aria-live="assertive"
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
                Belum bikin akun di langkah ini. {fields.length} pertanyaan kualifikasi dulu - baru
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

          {cvUploadAvailable && (
            <div className="mt-6 border-t border-pg-ink-100 pt-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-sm font-bold text-pg-ink-900">
                  Lampirkan CV {cvGateActive ? "(wajib)" : "(opsional)"}
                </div>
                {cvGateActive && (
                  <span
                    className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.06em] uppercase"
                    style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
                  >
                    Wajib
                  </span>
                )}
              </div>
              <p className="text-[13px] text-pg-ink-500 leading-relaxed mb-3">
                {`CV kamu langsung dinilai kecocokannya dengan posisi ini. Kalau sudah cukup cocok, kamu bisa lanjut daftar. ${CV_UPLOAD_MICROCOPY}`}
              </p>

              <label
                className={`flex items-center gap-3 px-3.5 py-3 min-h-[52px] rounded-xl border-[1.5px] cursor-pointer focus-within:ring-2 focus-within:ring-pg-red-600 focus-within:ring-offset-1 ${
                  cvStatus === "uploaded"
                    ? "border-pg-red-600 bg-pg-red-50"
                    : "border-pg-ink-200 bg-pg-white"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp,application/pdf,image/*"
                  className="sr-only"
                  disabled={cvStatus === "uploading"}
                  onChange={(e) => void handleCvChange(e.target.files?.[0] ?? null)}
                />
                <div
                  className="w-8 h-8 rounded-full grid place-items-center shrink-0"
                  style={{
                    background: cvStatus === "uploaded" ? "var(--pg-ok)" : "var(--pg-ink-50)",
                    color: cvStatus === "uploaded" ? "#fff" : "var(--pg-ink-500)",
                  }}
                >
                  <Icon
                    name={cvStatus === "uploaded" ? "check" : cvStatus === "error" ? "warn" : "upload"}
                    size={16}
                    stroke={2.4}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  {cvStatus === "uploading" ? (
                    <div className="text-[13px] font-bold text-pg-ink-900">Mengunggah CV…</div>
                  ) : cvStatus === "uploaded" ? (
                    <>
                      <div className="text-[13px] font-bold text-pg-ink-900 truncate">
                        {cvFileName || "CV terlampir"}
                      </div>
                      <div className="text-[12px] text-pg-ink-500">CV terunggah. Tap untuk ganti.</div>
                    </>
                  ) : (
                    <>
                      <div className="text-[13px] font-bold text-pg-ink-900">Pilih file CV</div>
                      <div className="text-[12px] text-pg-ink-500">PDF atau gambar, maks 5MB.</div>
                    </>
                  )}
                </div>
              </label>

              {cvError && (
                <div
                  className="text-[12px] mt-2 flex items-center gap-1.5"
                  style={{ color: "var(--pg-err)" }}
                >
                  <Icon name="warn" size={13} /> {cvError}
                </div>
              )}

              {/* Teks consent yang DI-LOG (shown == logged, PDP). Tampil saat ada CV. */}
              {cvStatus === "uploaded" && (
                <p className="text-[11px] text-pg-ink-400 leading-relaxed mt-2">
                  {CV_CONSENT_TEXT}
                </p>
              )}

              {/* "CV di depan": kecocokan CV ke posisi, langsung abis upload. */}
              {cvStatus === "uploaded" && cvFitLoading && (
                <div className="mt-3 flex items-center gap-2 text-[12.5px] text-pg-ink-500">
                  <span
                    className="inline-block w-3.5 h-3.5 rounded-full animate-spin"
                    style={{ border: "2px solid var(--pg-ink-200)", borderTopColor: "var(--pg-red-600)" }}
                  />
                  Menganalisis kecocokan CV kamu untuk posisi ini…
                </div>
              )}
              {cvStatus === "uploaded" && !cvFitLoading && cvFit && <CvFitCard fit={cvFit} />}
            </div>
          )}

          <div className="mt-6 border-t border-pg-ink-100 pt-5">
            <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-1">
              Buat akun
            </div>
            <div className="text-sm font-bold text-pg-ink-900 mb-3">Pilih password Perantau Global</div>
            <div className="grid gap-3">
              <Field label="Password" required htmlFor="apply-password">
                <div className="relative">
                  <Input
                    id="apply-password"
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
              <Field label="Konfirmasi password" required htmlFor="apply-confirmPassword">
                <Input
                  id="apply-confirmPassword"
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
                Huruf besar, kecil, dan angka. Disimpan aman - kami tidak bisa lihat password kamu.
              </div>
            </div>
          </div>

          {errorMsg && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
              style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
            >
              <Icon name="warn" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {cvGateActive && !cvGatePassed && !cvGateBlocked && status !== "loading" && (
            <div
              className="mt-4 px-3.5 py-3 rounded-lg flex items-start gap-2 text-[12px] leading-relaxed"
              style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
            >
              <Icon name="info" size={16} className="shrink-0 mt-0.5" />
              <span>
                {cvStatus === "uploaded"
                  ? "Menunggu hasil penilaian CV untuk bisa lanjut daftar."
                  : "Lampirkan CV kamu dulu - kami cek kecocokannya dengan posisi ini sebelum daftar."}
              </span>
            </div>
          )}
          {cvGateBlocked && (
            <div
              className="mt-4 px-3.5 py-3 rounded-lg flex items-start gap-2"
              style={{ background: "var(--pg-warn-bg)", color: "var(--pg-warn)" }}
            >
              <Icon name="warn" size={16} className="shrink-0 mt-0.5" />
              <div className="text-[12px] leading-relaxed">
                <b>CV kamu belum cukup cocok untuk posisi ini.</b> Perkuat CV kamu (tambah
                pengalaman atau sertifikat yang relevan), lalu unggah lagi untuk bisa lanjut daftar.
              </div>
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
            <Button
              type="submit"
              variant="primary"
              block
              disabled={status === "loading" || !cvGatePassed}
            >
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
              <b>Cek email setelah daftar</b> - kamu perlu klik link verifikasi di email untuk
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
          {identity.fullName || "-"}
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

function ReferralField({
  value,
  onChange,
  check,
}: {
  value: string;
  onChange: (raw: string) => void;
  check: "idle" | "checking" | "valid" | "invalid";
}) {
  const showHint = check === "valid" || check === "invalid";
  return (
    <Field
      label="Kode referral / kode agen (opsional)"
      htmlFor="apply-referral"
      helper={
        showHint ? undefined : "Isi kalau kamu didaftarin sama agen Perantau Global."
      }
    >
      <Input
        id="apply-referral"
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        placeholder="Misal: BUDI-2024"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {check === "valid" && (
        <div
          className="text-[12px] font-semibold flex items-center gap-1.5"
          style={{ color: "var(--pg-ok)" }}
        >
          <Icon name="check" size={13} stroke={2.6} /> Kode dikenali
        </div>
      )}
      {check === "invalid" && (
        <div className="text-[12px] font-medium flex items-center gap-1.5 text-pg-ink-500">
          <Icon name="x" size={13} stroke={2.4} /> Kode nggak ketemu
        </div>
      )}
    </Field>
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
                  className={`flex items-center gap-3 px-3.5 py-3 min-h-[52px] rounded-xl border-[1.5px] cursor-pointer focus-within:ring-2 focus-within:ring-pg-red-600 focus-within:ring-offset-1 ${
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
  referralCode,
  onReferralChange,
  referralCheck,
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
  referralCode: string;
  onReferralChange: (raw: string) => void;
  referralCheck: "idle" | "checking" | "valid" | "invalid";
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
        <Field label="Nama lengkap" required htmlFor="apply-ss-fullName">
          <Input
            id="apply-ss-fullName"
            type="text"
            required
            autoComplete="name"
            placeholder="Maya Sari"
            value={identity.fullName}
            onChange={(e) => setIdentityField("fullName", e.target.value)}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email" required htmlFor="apply-ss-email">
            <Input
              id="apply-ss-email"
              type="email"
              required
              autoComplete="email"
              placeholder="maya@email.com"
              value={identity.email}
              onChange={(e) => setIdentityField("email", e.target.value)}
            />
          </Field>
          <Field label="Nomor HP" required htmlFor="apply-ss-whatsapp">
            <Input
              id="apply-ss-whatsapp"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+62 812 …"
              value={identity.whatsapp}
              onChange={(e) => setIdentityField("whatsapp", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Kota tinggal" htmlFor="apply-ss-city">
          <Input
            id="apply-ss-city"
            type="text"
            placeholder="Jakarta (opsional, bisa diisi nanti di portal)"
            value={identity.city}
            onChange={(e) => setIdentityField("city", e.target.value)}
          />
        </Field>
        <ReferralField
          value={referralCode}
          onChange={onReferralChange}
          check={referralCheck}
        />
      </div>

      <div className="mt-5 border-t border-pg-ink-100 pt-5">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-3">
          Akun Perantau Global
        </div>
        <div className="grid gap-3">
          <Field label="Password" required htmlFor="apply-ss-password">
            <div className="relative">
              <Input
                id="apply-ss-password"
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
          <Field label="Konfirmasi password" required htmlFor="apply-ss-confirmPassword">
            <Input
              id="apply-ss-confirmPassword"
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
            Kombinasi huruf besar, huruf kecil, dan angka. Disimpan aman - kami nggak bisa lihat
            password kamu.
          </div>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          aria-live="assertive"
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

// Normalize a typed referral code: uppercase, strip ALL whitespace, keep only
// [A-Z0-9-], cap at 32. Matches the server-side normalize + the DB charset so
// what the candidate sees is exactly what gets staged.
function normalizeReferral(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

function validatePassword(pw: string): boolean {
  if (pw.length < 10) return false;
  if (!/[a-z]/.test(pw)) return false;
  if (!/[A-Z]/.test(pw)) return false;
  if (!/[0-9]/.test(pw)) return false;
  return true;
}

