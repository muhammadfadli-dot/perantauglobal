"use client";

import { useState } from "react";
import { Icon } from "@/components/pg/Icon";
import { Button, Field, Input, Textarea } from "@/components/pg/primitives";
import { trackEvent, generateEventId, getMetaCookies } from "@/lib/tracking";
import { ACADEMY_CONSENT_TEXT, ACADEMY_CONSENT_REQUIRED_MSG } from "@/lib/academy-consent";
import {
  uploadPendingCv,
  validateCvFile,
  isCvUploadConfigured,
} from "@/lib/supabase-storage-anon";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";

/**
 * Nilai gender WAJIB salah satu dari CHECK di `candidates.gender`
 * ('male','female','other','prefer_not_to_say', migration 0001). Trigger
 * `handle_new_auth_user` menulis `form_data->>'gender'` langsung ke kolom itu
 * TANPA blok EXCEPTION, jadi label Indonesia yang bocor ke payload bukan cuma
 * bikin data kotor, tapi menggagalkan seluruh pendaftaran di detik verifikasi
 * email. Label di sini untuk manusia, `value` untuk basis data.
 */
const GENDER_OPTIONS = [
  { value: "male", label: "Laki-laki" },
  { value: "female", label: "Perempuan" },
] as const;

/** Rentang lahir yang masuk akal untuk kandidat kerja, dipakai sebagai batas input. */
const BIRTH_MIN = "1950-01-01";
const BIRTH_MAX = "2010-12-31";

export interface AcademyRegField {
  field_key: string;
  field_label: string;
  field_help: string | null;
  field_type: string;
  options: { value: string; label: string }[] | null;
  required: boolean;
}

type Identity = {
  fullName: string;
  email: string;
  whatsapp: string;
  city: string;
  gender: string;
  birthDate: string;
};

const EMPTY: Identity = {
  fullName: "",
  email: "",
  whatsapp: "",
  city: "",
  gender: "",
  birthDate: "",
};

type CvStatus = "idle" | "uploading" | "uploaded" | "error";

/**
 * Akademi Perantau web registration form. Mirrors the job ApplyForm account-
 * creation flow (bio + password + consent → POST /api/akademi/[slug]), which
 * stages an intent='academy' pending; on email verify the trigger materializes
 * the academy_enrollment. Amber-accented to match the learning brand.
 */
export function AcademyRegisterForm({
  programSlug,
  programTitle,
  fields,
  isFree,
  isScreened = false,
}: {
  programSlug: string;
  programTitle: string;
  fields: AcademyRegField[];
  isFree: boolean;
  /**
   * Classroom-delivered paid program: registration is followed by a screening
   * call, and the fee is only discussed after passing. Nothing unlocks in the
   * app right away, so the confirmation copy must not promise that.
   */
  isScreened?: boolean;
}) {
  const [identity, setIdentity] = useState<Identity>(EMPTY);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  // PDP UU 27/2022 Pasal 20: consent must be affirmative - default UNCHECKED.
  // Gates submit here and is re-validated in /api/akademi/[slug]; the route
  // refuses to write a consent row it was not explicitly given.
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  // CV di depan funnel, sama polanya dengan lamaran kerja: file diunggah anon ke
  // `pending-cv/pending/<pendingId>/cv.*` SEBELUM akun ada, dan `pendingId`
  // dipakai lagi sebagai PK pending_submissions supaya trigger bisa
  // menyambungkan file ke kandidat. Tanpa kesamaan id itu, filenya jadi orphan
  // dan kepurge dalam 48 jam tanpa ada yang tahu.
  const [pendingId, setPendingId] = useState<string>(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "",
  );
  const cvUploadAvailable = isCvUploadConfigured();
  // CV wajib di program screening (permintaan Ifa 4 Agu): tanpa berkasnya di
  // depan, tim harus mengejar CV satu per satu lewat WhatsApp dan screening
  // berhenti di situ. Masterclass gratis sengaja tidak ikut, CV tidak dipakai
  // sama sekali di sana.
  //
  // Digandeng ke `cvUploadAvailable` bukan karena rapi-rapian: kalau env unggah
  // tidak terpasang, blok CV di bawah tidak dirender sama sekali, jadi
  // mewajibkannya akan mengunci form pada syarat yang tidak punya kolom isian.
  const cvRequired = isScreened && cvUploadAvailable;
  const [cvStatus, setCvStatus] = useState<CvStatus>("idle");
  const [cvFileName, setCvFileName] = useState("");
  const [cvPath, setCvPath] = useState("");
  const [cvMime, setCvMime] = useState("");
  const [cvSize, setCvSize] = useState(0);
  const [cvError, setCvError] = useState("");

  function setId<K extends keyof Identity>(key: K, value: Identity[K]) {
    setIdentity((p) => ({ ...p, [key]: value }));
  }
  function setAnswer(key: string, value: string | string[]) {
    setAnswers((p) => ({ ...p, [key]: value }));
  }
  async function handleCvPick(file: File | null) {
    if (!file) return;
    setCvError("");
    const v = validateCvFile(file);
    if (!v.ok) {
      setCvError(v.error);
      setCvStatus("error");
      return;
    }
    setCvFileName(file.name);
    setCvStatus("uploading");

    // UUID baru tiap percobaan. Path pending-cv deterministic dan bucket menolak
    // timpa, jadi mengunggah ulang ke path yang sama balikin 409. File percobaan
    // sebelumnya jadi orphan lalu kepurge otomatis dalam 48 jam.
    const attemptId =
      typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : pendingId;
    if (!attemptId) {
      setCvError("Browser kamu tidak mendukung unggah CV. Lanjut tanpa CV dulu ya.");
      setCvStatus("error");
      return;
    }
    setPendingId(attemptId);

    const res = await uploadPendingCv(
      attemptId,
      file,
      `/api/akademi/${programSlug}/cv-upload-url`,
    );
    if (res.ok) {
      setCvPath(res.path);
      setCvMime(res.mime);
      setCvSize(res.size);
      setCvStatus("uploaded");
      trackEvent("cv_upload_success", { program: programSlug });
    } else {
      setCvError(res.error);
      setCvStatus("error");
    }
  }

  function toggleMulti(key: string, optValue: string) {
    setAnswers((p) => {
      const cur = Array.isArray(p[key]) ? (p[key] as string[]) : [];
      return {
        ...p,
        [key]: cur.includes(optValue) ? cur.filter((x) => x !== optValue) : [...cur, optValue],
      };
    });
  }

  async function handleSubmit() {
    setErrorMsg("");
    if (!identity.fullName.trim() || !identity.email.trim() || !identity.whatsapp.trim()) {
      setErrorMsg("Lengkapi dulu nama, email, dan nomor WhatsApp.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email)) {
      setErrorMsg("Format email tidak valid.");
      return;
    }
    if (!identity.gender) {
      setErrorMsg("Pilih dulu jenis kelamin.");
      return;
    }
    if (!identity.birthDate) {
      setErrorMsg("Isi dulu tanggal lahir.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(identity.birthDate)) {
      setErrorMsg("Tanggal lahir belum lengkap.");
      return;
    }
    // Batas ini bukan soal rapi-rapian: tanggal lahir dicast ke DATE oleh
    // trigger saat verifikasi email, jadi nilai yang aneh baru meledak jauh di
    // belakang, di tempat yang tidak dilihat pendaftar.
    if (identity.birthDate < BIRTH_MIN || identity.birthDate > BIRTH_MAX) {
      setErrorMsg("Tanggal lahir tidak masuk akal. Cek lagi ya.");
      return;
    }
    // CV yang gagal diunggah tidak boleh diam-diam ikut submit: pendaftar
    // mengira CV-nya terkirim padahal tidak ada apa pun di bucket.
    if (cvStatus === "uploading") {
      setErrorMsg("CV kamu masih diunggah. Tunggu sebentar ya.");
      return;
    }
    if (cvRequired && cvStatus !== "uploaded") {
      setErrorMsg("Unggah dulu CV kamu. Boleh PDF atau foto CV, maksimal 5MB.");
      return;
    }
    const missingQ = fields.filter((f) => f.required && isEmpty(answers[f.field_key]));
    if (missingQ.length > 0) {
      setErrorMsg(`Isi dulu: ${missingQ.map((m) => m.field_label).join(", ")}`);
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
    // PDP: affirmative consent is the last gate before anything is sent.
    if (!consent) {
      setErrorMsg(ACADEMY_CONSENT_REQUIRED_MSG);
      return;
    }

    setStatus("loading");
    const eventId = generateEventId(`akademi_${programSlug}`);
    const { fbp, fbc } = getMetaCookies();
    const cleanedEmail = identity.email.trim().toLowerCase();

    const payload = {
      full_name: identity.fullName,
      whatsapp: identity.whatsapp,
      email: cleanedEmail,
      city: identity.city || null,
      gender: identity.gender,
      birth_date: identity.birthDate,
      password,
      answers,
      // Pointer CV yang sudah di-stage. `pending_id` WAJIB ikut supaya PK
      // pending_submissions sama dengan folder tempat filenya diunggah.
      ...(cvStatus === "uploaded" && cvPath
        ? { pending_id: pendingId, cv: { path: cvPath, mime: cvMime, size: cvSize } }
        : {}),
      source_url: typeof window !== "undefined" ? window.location.href : "",
      // PDP: the ticked box travels with the payload. The route rejects the
      // submit when this is absent, so no consent row is ever written by default.
      consent_granted: consent,
      eventId,
      fbp,
      fbc,
    };

    try {
      const res = await fetch(`/api/akademi/${programSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmittedEmail(cleanedEmail);
        setStatus("success");
        trackEvent(
          "form_submission",
          { form_name: `akademi_${programSlug}`, form_location: window.location.pathname },
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
          style={{ background: "var(--pa-amber-600)" }}
        >
          <Icon name="check" size={32} stroke={3} />
        </div>
        <h3 className="text-xl font-extrabold tracking-tight mt-4">Pendaftaran kamu masuk!</h3>
        <p className="text-base text-pg-ink-700 leading-relaxed mt-2">
          Kami kirim email verifikasi ke <b className="text-pg-ink-900">{submittedEmail}</b>.{" "}
          {isScreened
            ? "Klik link di email untuk mengaktifkan akunmu. Setelah itu tim Perantau Global akan menghubungi kamu lewat WhatsApp untuk proses screening."
            : "Klik link di email untuk aktifkan akun lalu mulai kelasnya."}
        </p>
        {isScreened && (
          <p className="text-[13px] text-pg-ink-500 leading-relaxed mt-2">
            Kamu belum perlu membayar apa pun. Biaya program baru kami informasikan setelah kamu
            lolos screening.
          </p>
        )}
        <a
          href={`${APP_URL}/auth/sign-in?email=${encodeURIComponent(submittedEmail)}`}
          className="mt-5 inline-flex items-center gap-2 font-bold no-underline"
          style={{ color: "var(--pa-amber-700)" }}
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 md:p-6"
    >
      <div
        className="text-[12px] font-bold tracking-[0.12em] uppercase"
        style={{ color: "var(--pa-amber-700)" }}
      >
        Daftar kelas
      </div>
      <h3 className="text-xl md:text-2xl font-extrabold tracking-tight mt-1">{programTitle}</h3>
      <p className="text-sm text-pg-ink-500 mt-1.5">
        {isScreened
          ? "Pendaftaran gratis. Isi data dan pilih password, kami buatkan akun Perantau Global kamu sekaligus."
          : "Isi data + pilih password. Kami buatkan akun Perantau Global kamu sekaligus."}
      </p>

      <div className="grid gap-3 mt-5">
        <Field label="Nama lengkap" required htmlFor="ak-fullName">
          <Input id="ak-fullName" type="text" required autoComplete="name" placeholder="Sesuai KTP"
            value={identity.fullName} onChange={(e) => setId("fullName", e.target.value)} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email" required htmlFor="ak-email">
            <Input id="ak-email" type="email" required autoComplete="email" placeholder="nama@email.com"
              value={identity.email} onChange={(e) => setId("email", e.target.value)} />
          </Field>
          <Field label="No. HP / WhatsApp" required htmlFor="ak-whatsapp">
            <Input id="ak-whatsapp" type="tel" required autoComplete="tel" placeholder="08xxxxxxxxxx"
              value={identity.whatsapp} onChange={(e) => setId("whatsapp", e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Tanggal lahir" required htmlFor="ak-birthDate">
            <Input id="ak-birthDate" type="date" required
              min={BIRTH_MIN} max={BIRTH_MAX} autoComplete="bday"
              value={identity.birthDate} onChange={(e) => setId("birthDate", e.target.value)} />
          </Field>
          <Field label="Kota tinggal" htmlFor="ak-city">
            <Input id="ak-city" type="text" placeholder="Jakarta (opsional)"
              value={identity.city} onChange={(e) => setId("city", e.target.value)} />
          </Field>
        </div>

        <div>
          <div className="text-[14px] font-bold leading-snug">
            Jenis kelamin<span style={{ color: "var(--pg-err)" }}> *</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {GENDER_OPTIONS.map((o) => {
              const selected = identity.gender === o.value;
              return (
                <label key={o.value}
                  className="flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-xl border-[1.5px] cursor-pointer bg-pg-white border-pg-ink-200"
                  style={selected
                    ? { borderColor: "var(--pa-amber-500)", background: "var(--pa-amber-100)" }
                    : undefined}>
                  <input type="radio" name="ak-gender" checked={selected}
                    onChange={() => setId("gender", o.value)} className="sr-only" />
                  <div className="w-5 h-5 rounded-full border-2 grid place-items-center shrink-0"
                    style={{ borderColor: selected ? "var(--pa-amber-600)" : "var(--pg-ink-300)" }}>
                    {selected && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--pa-amber-600)" }} />}
                  </div>
                  <span className={`text-[15px] flex-1 ${selected ? "font-bold" : "font-medium"}`}>
                    {o.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Wajib di program screening, opsional di masterclass. Yang wajib
          menanggung ongkosnya: sebagian kandidat berhenti persis di sini karena
          belum punya CV rapi, jadi teksnya sengaja menurunkan ambang ("foto CV
          juga boleh") alih-alih cuma menuntut. */}
      {cvUploadAvailable && (
        <div className="mt-5">
          <div className="text-[14px] font-bold leading-snug">
            CV kamu{" "}
            <span className="font-medium text-pg-ink-500">
              {cvRequired ? "(wajib)" : "(opsional)"}
            </span>
          </div>
          <div className="text-[12.5px] text-pg-ink-500 mt-0.5 leading-relaxed">
            {cvRequired
              ? "PDF atau foto, maksimal 5MB. Belum punya CV rapi? Foto CV tulis tangan atau berkas lama tetap kami terima."
              : "PDF atau foto, maksimal 5MB. Belum punya CV? Lewati saja, tidak mengurangi peluang."}
          </div>

          <label
            className="mt-2 flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-xl border-[1.5px] border-dashed cursor-pointer bg-pg-white"
            style={{
              borderColor:
                cvStatus === "uploaded" ? "var(--pa-amber-500)" : "var(--pg-ink-300)",
              background: cvStatus === "uploaded" ? "var(--pa-amber-100)" : undefined,
            }}
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp"
              className="sr-only"
              onChange={(e) => {
                void handleCvPick(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            <span style={{ color: "var(--pa-amber-700)" }}>
              <Icon name={cvStatus === "uploaded" ? "check" : "doc"} size={18} stroke={2.2} />
            </span>
            <span className="text-[14px] flex-1 text-pg-ink-700">
              {cvStatus === "uploading"
                ? "Mengunggah CV…"
                : cvStatus === "uploaded"
                  ? cvFileName || "CV terlampir"
                  : "Pilih file CV"}
            </span>
          </label>

          {cvError && (
            <div className="text-[12.5px] mt-1.5" style={{ color: "var(--pg-err)" }}>
              {cvError}
            </div>
          )}
        </div>
      )}

      {fields.length > 0 && (
        <div className="mt-5 grid gap-4">
          {fields.map((f) => (
            <div key={f.field_key}>
              <div className="text-[14px] font-bold leading-snug">
                {f.field_label}
                {f.required && <span style={{ color: "var(--pg-err)" }}> *</span>}
              </div>
              {f.field_help && (
                <div className="text-[12.5px] text-pg-ink-500 mt-0.5 leading-relaxed">{f.field_help}</div>
              )}
              <div className="mt-2">
                {renderField(f, answers[f.field_key], setAnswer, toggleMulti)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 border-t border-pg-ink-100 pt-5">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-3">
          Akun Perantau Global
        </div>
        <div className="grid gap-3">
          <Field label="Password" required htmlFor="ak-password">
            <div className="relative">
              <Input id="ak-password" type={showPw ? "text" : "password"} required
                autoComplete="new-password" minLength={10} placeholder="Minimal 10 karakter"
                value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold p-1"
                style={{ color: "var(--pa-amber-700)" }}
                aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}>
                {showPw ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>
          </Field>
          <Field label="Konfirmasi password" required htmlFor="ak-confirmPassword">
            <Input id="ak-confirmPassword" type={showPw ? "text" : "password"} required
              autoComplete="new-password" minLength={10} placeholder="Ketik ulang password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </Field>
        </div>
      </div>

      {/* PDP UU 27/2022 Pasal 20: persetujuan afirmatif, default KOSONG.
          Teks di dalam <span> WAJIB sama persis dengan yang di-log server
          (SoT: lib/academy-consent.ts), jadi tautan kebijakan sengaja ditaruh di
          baris terpisah supaya string-nya tetap utuh. */}
      <label className="flex items-start gap-2.5 mt-4 cursor-pointer">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
          aria-required
          className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--pa-amber-600)]" />
        <span className="text-[12px] text-pg-ink-600 leading-snug">
          {ACADEMY_CONSENT_TEXT}
        </span>
      </label>
      <div className="text-[12px] text-pg-ink-500 mt-1.5 leading-relaxed pl-[26px]">
        Baca{" "}
        <a href="/privacy" target="_blank" rel="noreferrer" className="font-bold no-underline"
          style={{ color: "var(--pa-amber-700)" }}>
          Kebijakan Privasi
        </a>{" "}
        dan{" "}
        <a href="/terms" target="_blank" rel="noreferrer" className="font-bold no-underline"
          style={{ color: "var(--pa-amber-700)" }}>
          Syarat &amp; Ketentuan
        </a>
        .
      </div>

      {errorMsg && (
        <div className="mt-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}>
          <Icon name="warn" size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="mt-5">
        <Button type="submit" variant="primary" block disabled={status === "loading"}>
          {status === "loading" ? "Mengirim…" : (
            <>
              {isFree
                ? "Daftar gratis & buat akun"
                : isScreened
                  ? "Daftar gratis & ikut screening"
                  : "Daftar kelas & buat akun"}
              <Icon name="arrow_right" size={18} />
            </>
          )}
        </Button>
        {/* What happens next, kept next to the button rather than elsewhere on
            the page: this is the moment the candidate is deciding, and it is
            also where the "no payment yet" promise has to be visible. */}
        <div
          className="mt-3.5 px-3.5 py-3 rounded-[11px] text-[12.5px] leading-relaxed"
          style={{
            background: "var(--pa-amber-100)",
            border: "1px solid var(--pa-amber-200)",
            color: "var(--pa-amber-700)",
          }}
        >
          <b className="text-pg-ink-900">Cara kerjanya:</b>{" "}
          {isScreened
            ? "daftar di sini, cek email buat verifikasi, lalu tim Perantau Global menghubungi kamu lewat WhatsApp untuk proses screening. Kamu tidak diminta membayar apa pun di tahap ini."
            : "daftar di sini, cek email buat verifikasi, akun Perantau Global kamu langsung aktif, lalu buka tab Akademi buat mulai kelasnya."}
        </div>

        <div className="text-[12px] text-pg-ink-500 mt-3 text-center">
          Sudah punya akun?{" "}
          <a href={`${APP_URL}/auth/sign-in`} className="font-bold no-underline" style={{ color: "var(--pa-amber-700)" }}>
            Masuk di sini
          </a>
        </div>
      </div>
    </form>
  );
}

function renderField(
  f: AcademyRegField,
  value: string | string[] | undefined,
  setAnswer: (key: string, value: string | string[]) => void,
  toggleMulti: (key: string, optValue: string) => void,
) {
  const opts = f.options ?? [];
  switch (f.field_type) {
    case "select":
      return (
        <select
          className="w-full min-h-[48px] px-3.5 rounded-xl border-[1.5px] border-pg-ink-200 bg-pg-white text-[15px]"
          value={(value as string) ?? ""} onChange={(e) => setAnswer(f.field_key, e.target.value)}>
          <option value="">Pilih…</option>
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case "radio":
      return (
        <div className="grid gap-2">
          {opts.map((o) => {
            const selected = value === o.value;
            return (
              <label key={o.value}
                className={`flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-xl border-[1.5px] cursor-pointer ${selected ? "bg-pg-white" : "bg-pg-white border-pg-ink-200"}`}
                style={selected ? { borderColor: "var(--pa-amber-500)", background: "var(--pa-amber-100)" } : undefined}>
                <input type="radio" name={f.field_key} checked={selected}
                  onChange={() => setAnswer(f.field_key, o.value)} className="sr-only" />
                <div className="w-5 h-5 rounded-full border-2 grid place-items-center shrink-0"
                  style={{ borderColor: selected ? "var(--pa-amber-600)" : "var(--pg-ink-300)" }}>
                  {selected && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--pa-amber-600)" }} />}
                </div>
                <span className={`text-[15px] flex-1 ${selected ? "font-bold" : "font-medium"}`}>{o.label}</span>
              </label>
            );
          })}
        </div>
      );
    case "multiselect":
      return (
        <div className="flex gap-2 flex-wrap">
          {opts.map((o) => {
            const arr = Array.isArray(value) ? value : [];
            const selected = arr.includes(o.value);
            return (
              <button key={o.value} type="button" onClick={() => toggleMulti(f.field_key, o.value)}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 text-sm font-bold rounded-full border-[1.5px]"
                style={selected
                  ? { background: "var(--pa-amber-100)", borderColor: "var(--pa-amber-500)", color: "var(--pa-amber-700)" }
                  : { background: "var(--pg-white)", borderColor: "var(--pg-ink-200)", color: "var(--pg-ink-700)" }}>
                {selected && <Icon name="check" size={12} stroke={2.4} />}{o.label}
              </button>
            );
          })}
        </div>
      );
    case "textarea":
      return <Textarea rows={3} value={typeof value === "string" ? value : ""} onChange={(e) => setAnswer(f.field_key, e.target.value)} />;
    case "number":
      return <Input type="number" value={typeof value === "string" ? value : ""} onChange={(e) => setAnswer(f.field_key, e.target.value)} />;
    default:
      return <Input type="text" value={typeof value === "string" ? value : ""} onChange={(e) => setAnswer(f.field_key, e.target.value)} />;
  }
}

function isEmpty(v: string | string[] | undefined): boolean {
  if (v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  return v.length === 0;
}

function validatePassword(pw: string): boolean {
  return pw.length >= 10 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
}
