"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/pg/Icon";
import {
  completeReadingAction,
  gradeQuizAction,
  type QuizGrade,
} from "@/app/(candidate)/akademi/actions";
import type {
  QuizContent,
  LessonMedia,
  ReadingCard,
  ReadingBlock,
} from "@/lib/academy-db";

interface PlayerProps {
  slug: string;
  enrollmentId: string;
  lessonId: string;
  lessonType: "reading" | "quiz";
  /** Reading lessons arrive pre-chunked from the server (keeps the server-only
   *  chunkBlocks out of this client bundle). */
  readingCards: ReadingCard[] | null;
  quizContent: QuizContent | null;
  alreadyDone: boolean;
  nextLessonId: string | null;
  /** First reading lesson of this module — fallback target of "Baca lagi". */
  moduleFirstReadingId: string | null;
  /** True when this is the last lesson of its module → completing earns a cap. */
  isLastInModule: boolean;
  /** Cap-ceremony route for this module: /akademi/{slug}/modul/{n}/selesai */
  capHref: string;
}

export function LessonPlayer(props: PlayerProps) {
  if (props.lessonType === "quiz") {
    return <QuizView {...props} content={props.quizContent ?? { questions: [] }} />;
  }
  return <ReadingView {...props} cards={props.readingCards ?? []} />;
}

// --------------------------------------------------------------------------
// Reading — chunked into tap-next cards (one idea per screen)
// --------------------------------------------------------------------------

function ReadingView({
  slug,
  enrollmentId,
  lessonId,
  cards,
  alreadyDone,
  nextLessonId,
  isLastInModule,
  capHref,
}: PlayerProps & { cards: ReadingCard[] }) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Each card opens at the top — keeps the "one idea per screen" feeling.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [idx]);

  const total = cards.length;
  const isLastCard = idx >= total - 1;
  const card = cards[Math.min(idx, total - 1)];

  function next() {
    if (!isLastCard) {
      setIdx((i) => i + 1);
      return;
    }
    // Last card → mark the lesson complete, then advance.
    setError(null);
    startTransition(async () => {
      const res = await completeReadingAction(slug, enrollmentId, lessonId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (isLastInModule) {
        router.push(capHref);
        router.refresh();
      } else {
        setAdvancing(true);
      }
    });
  }

  if (advancing) {
    return <AdvanceTransition router={router} slug={slug} nextLessonId={nextLessonId} />;
  }

  if (total === 0 || !card) {
    return (
      <div className="max-w-[640px] mx-auto px-5">
        <p className="text-[13px] text-pg-ink-500">Materi bacaan belum tersedia.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto px-5">
      <CardMedia media={card.media} />

      <article className="flex flex-col gap-4">
        {card.blocks.map((b, i) => (
          <ReadingBlockView key={i} block={b} />
        ))}
      </article>

      {error && <ErrorBox text={error} />}

      {/* Card progress dots */}
      {total > 1 && (
        <div className="flex gap-[5px] mt-7">
          {cards.map((_, i) => (
            <span
              key={i}
              className="h-1 rounded-full flex-1"
              style={{
                background:
                  i < idx
                    ? "var(--pa-amber-600)"
                    : i === idx
                      ? "var(--pa-amber-500)"
                      : "var(--pg-ink-200)",
              }}
            />
          ))}
        </div>
      )}

      <div className="pt-4">
        <button
          type="button"
          onClick={next}
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-[15px] font-bold rounded-xl text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
        >
          {pending
            ? "Menyimpan…"
            : isLastCard
              ? alreadyDone
                ? "Lanjut"
                : "Tandai selesai & lanjut"
              : "Lanjut"}
          <Icon name={pending ? "clock" : "arrow_right"} size={18} stroke={2.4} />
        </button>
        <div className="flex items-center justify-between mt-2.5">
          {idx > 0 ? (
            <button
              type="button"
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              className="text-[12px] font-semibold text-pg-ink-500 inline-flex items-center gap-1"
            >
              <Icon name="arrow_left" size={13} /> Sebelumnya
            </button>
          ) : (
            <span />
          )}
          <span className="text-[11.5px] text-pg-ink-400">
            Kartu {idx + 1} dari {total}
          </span>
        </div>
      </div>
    </div>
  );
}

function CardMedia({ media }: { media: LessonMedia | null }) {
  if (!media) return null;
  if (media.image_url) {
    return (
      <div className="mb-4 rounded-[14px] overflow-hidden" style={{ border: "1px solid var(--pa-amber-200)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.image_url}
          alt={media.alt ?? ""}
          loading="lazy"
          className="w-full h-auto block"
        />
      </div>
    );
  }
  // No image yet → tasteful illustration placeholder carrying the alt as a hint.
  return (
    <div
      className="mb-4 rounded-[14px] grid place-items-center text-center p-4"
      style={{
        border: "1.5px dashed #e0c47c",
        background:
          "repeating-linear-gradient(135deg,#fff7e8,#fff7e8 9px,#fbe9c0 9px,#fbe9c0 18px)",
        color: "var(--pa-amber-700)",
        minHeight: 96,
      }}
    >
      <div className="flex flex-col items-center gap-1.5">
        <Icon name="camera" size={18} />
        <span className="font-mono text-[10px] uppercase tracking-[0.04em]">
          {media.alt ? `Ilustrasi · ${media.alt}` : "Ilustrasi"}
        </span>
        {media.audio_url ? (
          <span
            className="inline-flex items-center gap-1.5 mt-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
            style={{ background: "rgba(255,255,255,0.7)" }}
          >
            <Icon name="phone" size={11} /> Dengar
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ReadingBlockView({ block }: { block: ReadingBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <div className="mt-1">
          <span
            aria-hidden
            className="block w-8 h-[3px] rounded-full mb-2"
            style={{ background: "var(--pa-amber-500)" }}
          />
          <h2 className="text-[19px] font-extrabold tracking-[-0.01em] text-pg-ink-900 m-0 leading-snug">
            {block.text}
          </h2>
        </div>
      );

    case "list":
      return (
        <ul className="flex flex-col gap-2.5 m-0 pl-0 list-none">
          {(block.items ?? []).map((it, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] text-pg-ink-700 leading-relaxed">
              <span
                className="grid place-items-center w-5 h-5 rounded-full shrink-0 mt-0.5"
                style={{ background: "var(--pa-amber-100)", color: "var(--pa-amber-700)" }}
              >
                <Icon name="check" size={12} stroke={3} />
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );

    case "steps":
      return (
        <div className="flex flex-col gap-2.5">
          {(block.items ?? []).map((it, i) => (
            <div
              key={i}
              className="flex gap-3 p-3.5 rounded-[14px]"
              style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)" }}
            >
              <span
                className="grid place-items-center w-7 h-7 rounded-[9px] shrink-0 font-mono text-[13px] font-extrabold text-white"
                style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
              >
                {i + 1}
              </span>
              <span className="text-[14.5px] text-pg-ink-700 leading-relaxed">{it}</span>
            </div>
          ))}
        </div>
      );

    case "stat":
      return (
        <div
          className="rounded-[16px] p-5 text-center"
          style={{
            background: "linear-gradient(135deg, #fffaef 0%, var(--pa-amber-100) 100%)",
            border: "1px solid var(--pa-amber-200)",
          }}
        >
          <div className="text-[30px] font-extrabold tracking-[-0.02em]" style={{ color: "var(--pa-amber-700)" }}>
            {block.value}
          </div>
          {block.label && (
            <div className="text-[14px] font-bold text-pg-ink-800 mt-0.5">{block.label}</div>
          )}
          {block.sub && <div className="text-[12.5px] text-pg-ink-500 mt-1">{block.sub}</div>}
        </div>
      );

    case "quote":
      return (
        <div
          className="pl-4 py-1 text-[15px] italic text-pg-ink-600 leading-relaxed"
          style={{ borderLeft: "3px solid var(--pg-ink-200)" }}
        >
          {block.text}
        </div>
      );

    case "callout": {
      const v = block.variant ?? "tip";
      const tone =
        v === "warn"
          ? { bg: "var(--pg-err-bg)", border: "var(--pg-err)", icon: "warn" as IconName, fg: "var(--pg-err)" }
          : v === "info"
            ? { bg: "var(--pg-info-bg)", border: "var(--pg-info)", icon: "info" as IconName, fg: "var(--pg-info)" }
            : { bg: "var(--pa-amber-100)", border: "var(--pa-amber-300)", icon: "sparkle" as IconName, fg: "var(--pa-amber-700)" };
      return (
        <div
          className="flex gap-3 p-4 rounded-[14px]"
          style={{ background: tone.bg, border: `1px solid ${tone.border}` }}
        >
          <span className="shrink-0 mt-0.5" style={{ color: tone.fg }}>
            <Icon name={tone.icon} size={18} />
          </span>
          <div className="flex flex-col gap-0.5">
            {block.title && (
              <span className="text-[14px] font-bold text-pg-ink-900">{block.title}</span>
            )}
            <span className="text-[14px] text-pg-ink-700 leading-relaxed">{block.text}</span>
          </div>
        </div>
      );
    }

    default:
      return <p className="text-[15px] text-pg-ink-700 leading-[1.75] m-0">{block.text}</p>;
  }
}

// --------------------------------------------------------------------------
// Quiz — one question per screen, rationale on fail
// --------------------------------------------------------------------------

function QuizView({
  slug,
  enrollmentId,
  lessonId,
  content,
  nextLessonId,
  moduleFirstReadingId,
  isLastInModule,
  capHref,
}: PlayerProps & { content: QuizContent }) {
  const router = useRouter();
  const questions = content.questions ?? [];
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizGrade | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [qIdx, result]);

  function pick(qid: string, key: string, multiple: boolean) {
    setError(null);
    setAnswers((a) => {
      const cur = a[qid] ?? [];
      if (multiple) {
        return { ...a, [qid]: cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key] };
      }
      return { ...a, [qid]: [key] };
    });
  }

  function advanceQuestion() {
    const q = questions[qIdx];
    if (!q) return;
    if (!answers[q.id] || answers[q.id]!.length === 0) {
      setError("Pilih jawabanmu dulu ya.");
      return;
    }
    setError(null);
    if (qIdx < questions.length - 1) {
      setQIdx((i) => i + 1);
    } else {
      submit();
    }
  }

  function submit() {
    for (const q of questions) {
      if (!answers[q.id] || answers[q.id]!.length === 0) {
        setError("Jawab semua pertanyaan dulu ya.");
        return;
      }
    }
    startTransition(async () => {
      const res = await gradeQuizAction(slug, enrollmentId, lessonId, answers);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(res.data);
    });
  }

  function retry() {
    setResult(null);
    setAnswers({});
    setQIdx(0);
  }

  function reread() {
    if (moduleFirstReadingId) {
      router.push(`/akademi/${slug}/lesson/${moduleFirstReadingId}`);
    } else {
      router.push(`/akademi/${slug}`);
    }
    router.refresh();
  }

  if (advancing) {
    return <AdvanceTransition router={router} slug={slug} nextLessonId={nextLessonId} />;
  }

  if (result) {
    return (
      <QuizResult
        result={result}
        questions={questions}
        answers={answers}
        nextLessonId={nextLessonId}
        isLastInModule={isLastInModule}
        onRetry={retry}
        onReread={reread}
        onNext={() => {
          if (isLastInModule) {
            router.push(capHref);
            router.refresh();
          } else {
            setAdvancing(true);
          }
        }}
      />
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-[640px] mx-auto px-5">
        <p className="text-[13px] text-pg-ink-500">Kuis belum tersedia.</p>
      </div>
    );
  }

  const q = questions[Math.min(qIdx, questions.length - 1)]!;
  const isLastQ = qIdx >= questions.length - 1;

  return (
    <div className="max-w-[640px] mx-auto px-5">
      {/* Question progress dots */}
      <div className="flex gap-[5px] mb-4">
        {questions.map((_, i) => (
          <span
            key={i}
            className="h-1 rounded-full flex-1"
            style={{
              background:
                i < qIdx ? "var(--pa-amber-600)" : i === qIdx ? "var(--pa-amber-500)" : "var(--pg-ink-200)",
            }}
          />
        ))}
      </div>

      <div className="text-[16px] font-bold text-pg-ink-900 leading-snug mb-3">
        {qIdx + 1}. {q.prompt}
        {q.multiple && (
          <span className="block text-[11.5px] font-normal text-pg-ink-500 mt-1">
            (boleh pilih lebih dari satu)
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {(q.options ?? []).map((o) => {
          const selected = (answers[q.id] ?? []).includes(o.key);
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => pick(q.id, o.key, Boolean(q.multiple))}
              className="flex items-center gap-3 p-3.5 rounded-[13px] text-left text-[14px]"
              style={{
                background: selected ? "var(--pa-amber-100)" : "var(--pg-white)",
                border: selected ? "1px solid var(--pa-amber-500)" : "1px solid var(--pg-ink-100)",
                color: "var(--pg-ink-800)",
              }}
            >
              <span
                className="w-5 h-5 rounded-full grid place-items-center shrink-0"
                style={{
                  border: selected ? "none" : "2px solid var(--pg-ink-200)",
                  background: selected ? "var(--pa-amber-600)" : "transparent",
                  color: "#fff",
                }}
              >
                {selected && <Icon name="check" size={12} stroke={3} />}
              </span>
              {o.label}
            </button>
          );
        })}
      </div>

      {error && <ErrorBox text={error} />}

      <div className="pt-7">
        <button
          type="button"
          onClick={advanceQuestion}
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-[15px] font-bold rounded-xl text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
        >
          {pending ? "Menilai…" : isLastQ ? "Lihat hasil" : "Lanjut ke soal berikutnya"}
          {!pending && <Icon name="arrow_right" size={18} />}
        </button>
        <div className="text-center text-[11.5px] text-pg-ink-400 mt-2.5">
          Soal {qIdx + 1} dari {questions.length}
        </div>
      </div>
    </div>
  );
}

function QuizResult({
  result,
  questions,
  answers,
  nextLessonId,
  isLastInModule,
  onRetry,
  onReread,
  onNext,
}: {
  result: QuizGrade;
  questions: QuizContent["questions"];
  answers: Record<string, string[]>;
  nextLessonId: string | null;
  isLastInModule: boolean;
  onRetry: () => void;
  onReread: () => void;
  onNext: () => void;
}) {
  const passed = result.lesson_passed;
  const wrong = questions.filter((q) => result.per_question[q.id] === false);
  const optLabel = (qid: string, key: string) =>
    questions.find((q) => q.id === qid)?.options?.find((o) => o.key === key)?.label ?? key;

  return (
    <div className="max-w-[640px] mx-auto px-5">
      <div
        className="rounded-[16px] p-5 text-center"
        style={{
          background: passed ? "var(--pg-ok-bg)" : "var(--pg-err-bg)",
          border: `1px solid ${passed ? "var(--pg-ok)" : "var(--pg-err)"}`,
        }}
      >
        <div
          className="w-14 h-14 rounded-full grid place-items-center mx-auto text-white"
          style={{ background: passed ? "var(--pg-ok)" : "var(--pg-err)" }}
        >
          <Icon name={passed ? "check" : "info"} size={26} stroke={2.6} />
        </div>
        <div className="text-[26px] font-extrabold mt-2" style={{ color: passed ? "var(--pg-ok)" : "var(--pg-err)" }}>
          {result.score}%
        </div>
        <div className="text-[13px] text-pg-ink-700 mt-0.5">
          {passed
            ? "Lulus kuis ini! 🎉"
            : `Belum lulus — minimal ${result.pass_threshold}%. Tenang, ini bukan jalan buntu.`}
        </div>
      </div>

      {/* Pass: compact per-question summary. Fail: rationale for picked wrongs. */}
      {passed ? (
        <div className="flex flex-col gap-2 mt-4">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className="flex items-center gap-2.5 p-3 rounded-[12px]"
              style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)" }}
            >
              <span
                className="w-6 h-6 rounded-full grid place-items-center shrink-0 text-white"
                style={{ background: "var(--pg-ok)" }}
              >
                <Icon name="check" size={13} stroke={3} />
              </span>
              <span className="text-[12.5px] text-pg-ink-700 leading-snug">
                {i + 1}. {q.prompt}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <div className="text-[14px] font-extrabold text-pg-ink-900 mb-2">Yang perlu dilihat lagi</div>
          <div className="flex flex-col gap-2.5">
            {wrong.map((q) => {
              const picks = answers[q.id] ?? [];
              const fb = result.feedback?.[q.id];
              const correctSet = new Set<string>(); // never revealed; we only echo picks
              const pickedWrong = picks.filter((k) => !correctSet.has(k));
              return (
                <div
                  key={q.id}
                  className="rounded-[12px] p-3.5"
                  style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)" }}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="w-6 h-6 rounded-full grid place-items-center shrink-0 text-white mt-0.5"
                      style={{ background: "var(--pg-err)" }}
                    >
                      <Icon name="x" size={13} stroke={3} />
                    </span>
                    <span className="text-[13px] font-semibold text-pg-ink-800 leading-snug">{q.prompt}</span>
                  </div>
                  {pickedWrong.map((k) => {
                    const rat = fb?.rationale?.[k];
                    return (
                      <div key={k} className="mt-2.5 ml-[34px]">
                        <div
                          className="rounded-[10px] px-3 py-2 text-[13px]"
                          style={{ background: "var(--pg-err-bg)", color: "var(--pg-ink-800)" }}
                        >
                          <span className="font-semibold">Pilihanmu: </span>
                          {optLabel(q.id, k)}
                          {rat && (
                            <div className="mt-1.5 flex gap-1.5 text-[12px] text-pg-ink-700 leading-relaxed">
                              <span style={{ color: "var(--pg-err)" }}>⚠</span>
                              <span>{rat}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className="text-[10.5px] text-pg-ink-400 mt-2.5 font-mono">
            Penjelasan tampil hanya untuk pilihanmu · kunci jawaban tetap rahasia
          </div>
        </div>
      )}

      <div className="pt-6 flex flex-col gap-2.5">
        {passed ? (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-[15px] font-bold rounded-xl text-white"
            style={{ background: "var(--pg-ok)" }}
          >
            {isLastInModule
              ? "Selesaikan modul & dapat cap"
              : nextLessonId
                ? "Lanjut ke berikutnya"
                : "Selesai kursus"}
            <Icon name="arrow_right" size={18} />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onReread}
              className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-[15px] font-bold rounded-xl text-white"
              style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
            >
              <Icon name="doc" size={18} /> Baca lagi materi
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 w-full min-h-[48px] px-5 text-[14.5px] font-bold rounded-xl"
              style={{ background: "var(--pg-white)", border: "1.5px solid var(--pg-ink-200)", color: "var(--pg-ink-800)" }}
            >
              Coba lagi kuisnya
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Shared
// --------------------------------------------------------------------------

function AdvanceTransition({
  router,
  slug,
  nextLessonId,
}: {
  router: ReturnType<typeof useRouter>;
  slug: string;
  nextLessonId: string | null;
}) {
  useEffect(() => {
    const t = setTimeout(() => {
      router.push(nextLessonId ? `/akademi/${slug}/lesson/${nextLessonId}` : `/akademi/${slug}`);
      router.refresh();
    }, 850);
    return () => clearTimeout(t);
  }, [router, slug, nextLessonId]);

  return (
    <div className="px-5 py-20 text-center flex flex-col items-center">
      <div
        className="w-16 h-16 rounded-full grid place-items-center text-white"
        style={{ background: "var(--pg-ok)", animation: "pg-pop 0.35s ease-out" }}
      >
        <Icon name="check" size={32} stroke={3} />
      </div>
      <div className="text-[17px] font-extrabold text-pg-ink-900 mt-3">Mantap, selesai!</div>
      <div className="text-[13px] text-pg-ink-500 mt-1">
        {nextLessonId ? "Lanjut ke bagian berikutnya…" : "Kembali ke halaman kelas…"}
      </div>
      <style>{`@keyframes pg-pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div
      className="mt-4 text-[12.5px] px-3 py-2 rounded-[10px]"
      style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
    >
      {text}
    </div>
  );
}
