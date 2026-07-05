"use client";

import { useCallback, useState } from "react";
import {
  PERSONA_META,
  QUESTIONS,
  SECTOR_META,
  SECTOR_QUESTION,
  SESSION_KEY,
  scorePersona,
  type AnswerKey,
  type Persona,
  type QuestionId,
  type Sector,
} from "@/lib/cek-kesiapan";

const TOTAL = QUESTIONS.length + 1; // 6 readiness + 1 sector

type Answers = Partial<Record<QuestionId, AnswerKey>>;

// Happy + on-brand: Pemimpi = campus blue, Penjajak = gold, Siap = emerald.
const ACCENT: Record<Persona, string> = {
  pemimpi: "#1d5fd8",
  penjajak: "#e0a72b",
  siap: "#10b981",
};
const SOFT: Record<Persona, string> = {
  pemimpi: "#e9f1ff",
  penjajak: "#fdf4e0",
  siap: "#e6f9f0",
};
const PG_RED = "#d7262f";

export function CekKesiapanFlow() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [sector, setSector] = useState<Sector | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Persona | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = () => {
    if (name.trim().length < 1) {
      setError("Isi nama dulu ya.");
      return;
    }
    setError(null);
    setPhase("quiz");
  };

  const submit = useCallback(
    async (finalSector: Sector, finalAnswers: Answers) => {
      setSubmitting(true);
      setError(null);
      const localPersona = scorePersona(finalAnswers).persona;
      try {
        const res = await fetch("/api/cek-kesiapan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            answers: finalAnswers,
            sector: finalSector,
            session_key: SESSION_KEY,
            website,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { persona?: Persona };
        setResult(data.persona ?? localPersona);
      } catch {
        setResult(localPersona);
      } finally {
        setPhase("result");
        setSubmitting(false);
      }
    },
    [name, website],
  );

  const choose = (key: AnswerKey | Sector) => {
    if (step < QUESTIONS.length) {
      const qid = QUESTIONS[step].id;
      const next: Answers = { ...answers, [qid]: key as AnswerKey };
      setAnswers(next);
      setStep(step + 1);
    } else {
      const s = key as Sector;
      setSector(s);
      void submit(s, answers);
    }
  };

  // ---- INTRO ----
  if (phase === "intro") {
    return (
      <Shell>
        <Lockup />
        <h1 className="mt-4 text-3xl md:text-4xl font-extrabold leading-tight tracking-tight" style={{ color: "#1a1a1a" }}>
          Analisa Kesiapan{" "}
          <span style={{ color: PG_RED }}>Merantau</span>
        </h1>
        <p className="mt-3 text-base leading-relaxed" style={{ color: "#4a4a4a" }}>
          7 pertanyaan singkat buat tahu kamu di level mana buat berkarier ke luar negeri. Bukan ujian, nggak ada
          jawaban salah. Siapin nama kamu dulu, ya.
        </p>

        <label className="mt-7 block text-sm font-bold" style={{ color: "#1a1a1a" }}>
          Nama kamu
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && start()}
          maxLength={40}
          placeholder="Nama depan aja boleh"
          className="mt-2 w-full rounded-2xl border-2 bg-white px-4 py-3.5 text-base outline-none transition focus:border-[#d7262f]"
          style={{ borderColor: "#ece6d8", color: "#1a1a1a" }}
          autoFocus
        />
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        />
        {error && (
          <p className="mt-2 text-sm font-medium" style={{ color: PG_RED }}>
            {error}
          </p>
        )}
        <button
          onClick={start}
          className="mt-5 w-full rounded-2xl px-5 py-4 text-base font-bold text-white shadow-lg transition active:scale-[0.99]"
          style={{ background: PG_RED, boxShadow: "0 8px 20px rgba(215,38,47,0.28)" }}
        >
          Mulai analisa
        </button>
        <p className="mt-4 text-xs" style={{ color: "#9a9a9a" }}>
          Diselenggarakan oleh Perantau Global bersama Vokasi UI dan LSP UI.
        </p>
      </Shell>
    );
  }

  // ---- RESULT ----
  if (phase === "result" && result) {
    const meta = PERSONA_META[result];
    const accent = ACCENT[result];
    const sec = sector ? SECTOR_META[sector] : null;
    return (
      <Shell>
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: "#9a9a9a" }}>
          Hasil kamu, {name.trim().split(" ")[0]}
        </p>
        <div className="mt-3 rounded-3xl px-6 py-7" style={{ background: SOFT[result] }}>
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
            style={{ background: accent }}
          >
            Persona kamu
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight" style={{ color: accent }}>
            {meta.label}
          </h1>
          <p className="mt-1 text-base font-bold" style={{ color: "#1a1a1a" }}>
            {meta.tagline}
          </p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "#4a4a4a" }}>
            {meta.desc}
          </p>
        </div>

        {sec && (
          <div className="mt-4 rounded-3xl border-2 px-5 py-4" style={{ borderColor: "#f0ebdd" }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: PG_RED }}>
              Sektor minat: {sec.label}
            </p>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "#4a4a4a" }}>
              {sec.teaser}
            </p>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <a
            href="/lowongan"
            className="block w-full rounded-2xl px-5 py-4 text-center text-base font-bold text-white shadow-lg"
            style={{ background: PG_RED, boxShadow: "0 8px 20px rgba(215,38,47,0.28)" }}
          >
            Lihat lowongan yang cocok →
          </a>
          <a
            href="/paspor-gaji-ebook.pdf"
            target="_blank"
            rel="noopener"
            className="block w-full rounded-2xl border-2 px-5 py-3.5 text-center text-base font-bold"
            style={{ borderColor: "#ece6d8", color: "#1a1a1a" }}
          >
            Download e-book "Paspor Gaji"
          </a>
        </div>
        <p className="mt-4 text-xs leading-relaxed" style={{ color: "#9a9a9a" }}>
          Skor lengkap, rekomendasi sektor yang cocok, dan sertifikat kehadiran bisa kamu ambil gratis di app.
        </p>
      </Shell>
    );
  }

  // ---- QUIZ ----
  const isSector = step >= QUESTIONS.length;
  const q = isSector ? SECTOR_QUESTION : QUESTIONS[step];
  const options = isSector
    ? SECTOR_QUESTION.options
    : (QUESTIONS[step].options as { key: AnswerKey | Sector; label: string }[]);

  return (
    <Shell>
      <div className="flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full" style={{ background: "#f0ebdd" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((step + 1) / TOTAL) * 100}%`,
              background: "linear-gradient(90deg,#d7262f,#e0a72b)",
            }}
          />
        </div>
        <span className="font-mono text-xs font-bold" style={{ color: "#9a9a9a" }}>
          {step + 1}/{TOTAL}
        </span>
      </div>

      <h2 className="mt-7 text-2xl md:text-3xl font-extrabold leading-snug tracking-tight" style={{ color: "#1a1a1a" }}>
        {q.q}
      </h2>
      {"hint" in q && q.hint && (
        <p className="mt-2 text-sm" style={{ color: "#9a9a9a" }}>
          {q.hint}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => !submitting && choose(opt.key)}
            disabled={submitting}
            className="block w-full rounded-2xl border-2 bg-white px-5 py-4 text-left text-base font-semibold transition hover:-translate-y-0.5 hover:border-[#d7262f] active:scale-[0.99] disabled:opacity-60"
            style={{ borderColor: "#ece6d8", color: "#1a1a1a", boxShadow: "0 2px 10px rgba(20,20,20,0.04)" }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {submitting && (
        <p className="mt-5 text-center text-sm font-medium" style={{ color: "#9a9a9a" }}>
          Menghitung hasil kamu...
        </p>
      )}
    </Shell>
  );
}

function Lockup() {
  return (
    <p className="font-mono text-xs font-bold uppercase tracking-[0.18em]">
      <span style={{ color: "#d7262f" }}>Work</span>
      <span style={{ color: "#cdcdcd" }}> · </span>
      <span style={{ color: "#1d5fd8" }}>Travel</span>
      <span style={{ color: "#cdcdcd" }}> · </span>
      <span style={{ color: "#e0a72b" }}>Repeat</span>
    </p>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen w-full" style={{ background: "linear-gradient(180deg,#ffffff 0%,#fbf5e9 100%)" }}>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-10">
        <div className="relative">{children}</div>
      </div>
    </main>
  );
}
