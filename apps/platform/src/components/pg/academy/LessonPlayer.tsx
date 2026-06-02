"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/pg/Icon";
import {
  completeReadingAction,
  gradeQuizAction,
  type QuizGrade,
} from "@/app/(candidate)/akademi/actions";
import type {
  ReadingContent,
  QuizContent,
} from "@/lib/academy-db";

export function LessonPlayer(props: {
  slug: string;
  enrollmentId: string;
  lessonId: string;
  lessonType: "reading" | "quiz";
  readingContent: ReadingContent | null;
  quizContent: QuizContent | null;
  alreadyDone: boolean;
  nextLessonId: string | null;
}) {
  if (props.lessonType === "quiz") {
    return <QuizView {...props} content={props.quizContent ?? { questions: [] }} />;
  }
  return <ReadingView {...props} content={props.readingContent ?? { blocks: [] }} />;
}

// --------------------------------------------------------------------------

function ReadingView({
  slug,
  enrollmentId,
  lessonId,
  content,
  alreadyDone,
  nextLessonId,
}: {
  slug: string;
  enrollmentId: string;
  lessonId: string;
  content: ReadingContent;
  alreadyDone: boolean;
  nextLessonId: string | null;
}) {
  const router = useRouter();
  const [done, setDone] = useState(alreadyDone);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function finish() {
    setError(null);
    startTransition(async () => {
      const res = await completeReadingAction(slug, enrollmentId, lessonId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone(true);
      goNext(router, slug, nextLessonId);
    });
  }

  return (
    <div className="px-5">
      <article className="flex flex-col gap-3.5">
        {(content.blocks ?? []).map((b, i) => (
          <ReadingBlockView key={i} block={b} />
        ))}
        {(content.blocks ?? []).length === 0 && (
          <p className="text-[13px] text-pg-ink-500">Materi bacaan belum tersedia.</p>
        )}
      </article>

      {error && <ErrorBox text={error} />}

      <div className="pt-6">
        <button
          type="button"
          onClick={finish}
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-[15px] font-bold rounded-xl text-white disabled:opacity-60"
          style={{
            background: done
              ? "var(--pg-ok)"
              : "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))",
          }}
        >
          {pending
            ? "Menyimpan…"
            : done
              ? nextLessonId
                ? "Lanjut ke berikutnya"
                : "Selesai"
              : "Tandai selesai"}
          <Icon name={done ? "arrow_right" : "check"} size={18} stroke={2.4} />
        </button>
      </div>
    </div>
  );
}

function ReadingBlockView({ block }: { block: ReadingContent["blocks"][number] }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="text-[16px] font-extrabold tracking-[-0.01em] text-pg-ink-900 m-0 mt-1">
          {block.text}
        </h2>
      );
    case "list":
      return (
        <ul className="flex flex-col gap-1.5 m-0 pl-0 list-none">
          {(block.items ?? []).map((it, i) => (
            <li key={i} className="flex gap-2.5 text-[14px] text-pg-ink-700 leading-relaxed">
              <span style={{ color: "var(--pa-amber-600)", marginTop: 2 }}>
                <Icon name="check" size={15} stroke={2.6} />
              </span>
              {it}
            </li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div
          className="p-3.5 rounded-[12px] text-[13.5px] text-pg-ink-700 leading-relaxed"
          style={{ background: "var(--pa-amber-100)", border: "1px solid var(--pa-amber-200)" }}
        >
          {block.text}
        </div>
      );
    default:
      return (
        <p className="text-[14px] text-pg-ink-700 leading-relaxed m-0">{block.text}</p>
      );
  }
}

// --------------------------------------------------------------------------

function QuizView({
  slug,
  enrollmentId,
  lessonId,
  content,
  nextLessonId,
}: {
  slug: string;
  enrollmentId: string;
  lessonId: string;
  content: QuizContent;
  nextLessonId: string | null;
}) {
  const router = useRouter();
  const questions = content.questions ?? [];
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizGrade | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function pick(qid: string, key: string, multiple: boolean) {
    setAnswers((a) => {
      const cur = a[qid] ?? [];
      if (multiple) {
        return {
          ...a,
          [qid]: cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key],
        };
      }
      return { ...a, [qid]: [key] };
    });
  }

  function submit() {
    for (const q of questions) {
      if (!answers[q.id] || answers[q.id]!.length === 0) {
        setError("Jawab semua pertanyaan dulu ya.");
        return;
      }
    }
    setError(null);
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
  }

  if (result) {
    return (
      <QuizResult
        result={result}
        questions={questions}
        onRetry={retry}
        onNext={() => goNext(router, slug, nextLessonId)}
        nextLessonId={nextLessonId}
      />
    );
  }

  return (
    <div className="px-5">
      <div className="flex flex-col gap-5">
        {questions.map((q, qi) => (
          <div key={q.id}>
            <div className="text-[14.5px] font-semibold text-pg-ink-900 leading-snug mb-2.5">
              {qi + 1}. {q.prompt}
              {q.multiple && (
                <span className="text-[11px] font-normal text-pg-ink-500"> (boleh pilih lebih dari satu)</span>
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
                    className="flex items-center gap-3 p-3 rounded-[12px] text-left text-[13.5px]"
                    style={{
                      background: selected ? "var(--pa-amber-100)" : "var(--pg-white)",
                      border: selected
                        ? "1px solid var(--pa-amber-500)"
                        : "1px solid var(--pg-ink-100)",
                      color: "var(--pg-ink-800)",
                    }}
                  >
                    <span
                      className="w-5 h-5 rounded-full grid place-items-center shrink-0"
                      style={{
                        border: selected
                          ? "none"
                          : "2px solid var(--pg-ink-200)",
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
          </div>
        ))}
      </div>

      {error && <ErrorBox text={error} />}

      <div className="pt-6">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-[15px] font-bold rounded-xl text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
        >
          {pending ? "Menilai…" : "Kumpulkan jawaban"}
        </button>
      </div>
    </div>
  );
}

function QuizResult({
  result,
  questions,
  onRetry,
  onNext,
  nextLessonId,
}: {
  result: QuizGrade;
  questions: QuizContent["questions"];
  onRetry: () => void;
  onNext: () => void;
  nextLessonId: string | null;
}) {
  const passed = result.lesson_passed;
  return (
    <div className="px-5">
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
            ? "Lulus kuis ini!"
            : `Belum lulus — minimal ${result.pass_threshold}%. Coba lagi.`}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {questions.map((q, i) => {
          // A question with no matching answer key wasn't graded — render it
          // neutral instead of painting it wrong (guards admin authoring drift).
          const graded = Object.prototype.hasOwnProperty.call(result.per_question, q.id);
          const correct = result.per_question[q.id];
          return (
            <div
              key={q.id}
              className="flex items-center gap-2.5 p-3 rounded-[12px]"
              style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)" }}
            >
              <span
                className="w-6 h-6 rounded-full grid place-items-center shrink-0 text-white"
                style={{
                  background: !graded
                    ? "var(--pg-ink-300)"
                    : correct
                      ? "var(--pg-ok)"
                      : "var(--pg-err)",
                }}
              >
                <Icon name={!graded ? "info" : correct ? "check" : "x"} size={13} stroke={3} />
              </span>
              <span className="text-[12.5px] text-pg-ink-700 leading-snug">
                {i + 1}. {q.prompt}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-6">
        {passed ? (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-[15px] font-bold rounded-xl text-white"
            style={{ background: "var(--pg-ok)" }}
          >
            {nextLessonId ? "Lanjut ke berikutnya" : "Selesai"}
            <Icon name="arrow_right" size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-[15px] font-bold rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
          >
            Coba lagi
          </button>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------

function goNext(
  router: ReturnType<typeof useRouter>,
  slug: string,
  nextLessonId: string | null,
) {
  if (nextLessonId) {
    router.push(`/akademi/${slug}/lesson/${nextLessonId}`);
  } else {
    router.push(`/akademi/${slug}`);
  }
  router.refresh();
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
