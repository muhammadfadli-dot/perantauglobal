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
        // Network hiccup: still show the result. Engagement first.
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
        <p className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--pg-red-600)" }}>
          Work. Travel. Repeat.
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight" style={{ color: "var(--pg-ink-900)" }}>
          Analisa Kesiapan Merantau
        </h1>
        <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--pg-ink-700)" }}>
          7 pertanyaan singkat buat tahu kamu di level mana buat berkarier ke luar negeri. Bukan ujian, nggak ada
          jawaban salah. Siapin nama kamu dulu, ya.
        </p>

        <label className="mt-7 block text-sm font-semibold" style={{ color: "var(--pg-ink-900)" }}>
          Nama kamu
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && start()}
          maxLength={40}
          placeholder="Nama depan aja boleh"
          className="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-base outline-none focus:ring-2"
          style={{ borderColor: "var(--pg-ink-200)", color: "var(--pg-ink-900)" }}
          autoFocus
        />
        {/* honeypot: hidden from humans */}
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
          <p className="mt-2 text-sm" style={{ color: "var(--pg-red-700)" }}>
            {error}
          </p>
        )}
        <button
          onClick={start}
          className="mt-5 w-full rounded-xl px-5 py-4 text-base font-bold text-white transition active:scale-[0.99]"
          style={{ background: "var(--pg-red-600)" }}
        >
          Mulai analisa
        </button>
        <p className="mt-4 text-xs" style={{ color: "var(--pg-ink-500)" }}>
          Diselenggarakan oleh Perantau Global bersama Vokasi UI dan LSP UI.
        </p>
      </Shell>
    );
  }

  // ---- RESULT ----
  if (phase === "result" && result) {
    const meta = PERSONA_META[result];
    const sec = sector ? SECTOR_META[sector] : null;
    return (
      <Shell>
        <p className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--pg-ink-500)" }}>
          Hasil kamu, {name.trim().split(" ")[0]}
        </p>
        <div className={`mt-3 rounded-2xl px-5 py-6 ${meta.soft}`}>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white ${meta.bg}`}
          >
            Persona kamu
          </span>
          <h1 className={`mt-3 text-3xl md:text-4xl font-extrabold ${meta.text}`}>{meta.label}</h1>
          <p className="mt-1 text-base font-semibold" style={{ color: "var(--pg-ink-900)" }}>
            {meta.tagline}
          </p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--pg-ink-700)" }}>
            {meta.desc}
          </p>
        </div>

        {sec && (
          <div className="mt-4 rounded-2xl border px-5 py-4" style={{ borderColor: "var(--pg-ink-100)" }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--pg-red-600)" }}>
              Sektor minat: {sec.label}
            </p>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--pg-ink-700)" }}>
              {sec.teaser}
            </p>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <a
            href="https://app.perantauglobal.com"
            className="block w-full rounded-xl px-5 py-4 text-center text-base font-bold text-white"
            style={{ background: "var(--pg-red-600)" }}
          >
            Naik level di app Perantau Global
          </a>
          <a
            href="/paspor-gaji-ebook.pdf"
            target="_blank"
            rel="noopener"
            className="block w-full rounded-xl border px-5 py-3.5 text-center text-base font-semibold"
            style={{ borderColor: "var(--pg-ink-200)", color: "var(--pg-ink-900)" }}
          >
            Download e-book "Paspor Gaji"
          </a>
        </div>
        <p className="mt-4 text-xs leading-relaxed" style={{ color: "var(--pg-ink-500)" }}>
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
        <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--pg-ink-100)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((step + 1) / TOTAL) * 100}%`, background: "var(--pg-red-600)" }}
          />
        </div>
        <span className="font-mono text-xs" style={{ color: "var(--pg-ink-500)" }}>
          {step + 1}/{TOTAL}
        </span>
      </div>

      <h2 className="mt-7 text-2xl md:text-3xl font-extrabold leading-snug" style={{ color: "var(--pg-ink-900)" }}>
        {q.q}
      </h2>
      {"hint" in q && q.hint && (
        <p className="mt-2 text-sm" style={{ color: "var(--pg-ink-500)" }}>
          {q.hint}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => !submitting && choose(opt.key)}
            disabled={submitting}
            className="block w-full rounded-xl border bg-white px-5 py-4 text-left text-base font-medium transition hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60"
            style={{ borderColor: "var(--pg-ink-200)", color: "var(--pg-ink-900)" }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {submitting && (
        <p className="mt-5 text-center text-sm" style={{ color: "var(--pg-ink-500)" }}>
          Menghitung hasil kamu...
        </p>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen w-full" style={{ background: "var(--pg-cream)" }}>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-10">
        <div className="relative">{children}</div>
      </div>
    </main>
  );
}
