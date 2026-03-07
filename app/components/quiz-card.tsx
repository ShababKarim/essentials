"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  formatCategoryLabel,
  QUIZ_CATEGORIES,
  type QuizQuestion,
} from "@/lib/quiz";

type QuizCardProps = {
  quizId: string;
  quizTitle: string;
  questions: QuizQuestion[];
};

type StoredSubmission = {
  score: number;
  outcomeTiles: string[];
  selectedAnswers: Record<string, number>;
  submittedAt: string;
};

const SUBMISSION_STORAGE_PREFIX = "essentials-submission-v1";

export function QuizCard({ quizId, quizTitle, questions }: QuizCardProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [storedSubmission, setStoredSubmission] = useState<StoredSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value !== undefined).length,
    [answers]
  );

  const totalQuestions = questions.length;
  const categoryCounts = QUIZ_CATEGORIES
    .map((topic) => ({
      topic,
      count: questions.filter((question) => question.topic === topic).length,
    }))
    .filter((entry) => entry.count > 0);

  const outcomeTiles = useMemo(
    () =>
      questions.map((question) =>
        answers[question.id] === question.correctChoiceIndex ? "🟩" : "🟨"
      ),
    [answers, questions]
  );
  const displayOutcomeTiles = storedSubmission?.outcomeTiles ?? outcomeTiles;
  const isLocked = storedSubmission !== null;
  const storageKey = `${SUBMISSION_STORAGE_PREFIX}:${quizId}`;

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      setStoredSubmission(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredSubmission;
      if (
        typeof parsed.score === "number" &&
        Array.isArray(parsed.outcomeTiles) &&
        parsed.selectedAnswers &&
        typeof parsed.selectedAnswers === "object" &&
        typeof parsed.submittedAt === "string"
      ) {
        setStoredSubmission(parsed);
        setScore(parsed.score);
        setAnswers(parsed.selectedAnswers);
      } else {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const resultMessage =
    score === totalQuestions
      ? "MashaAllah, perfect score. You got every question correct."
      : "Great effort. Keep going, each day builds your essentials.";

  const copyResults = async () => {
    const scoreToShare = storedSubmission?.score ?? score;
    const content = [
      `Essentials • ${quizTitle} •`,
      `Score: ${scoreToShare}/${totalQuestions}`,
      displayOutcomeTiles.join(""),
    ].join("\n");

    await navigator.clipboard.writeText(content);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2200);
  };

  const handleSubmit = async () => {
    if (isLocked) {
      return;
    }

    setSubmissionError(null);
    setIsSubmitting(true);

    const answerPayload = questions.map((question) => ({
      questionId: question.id,
      choiceIndex: answers[question.id],
    }));

    let nextScore: number;
    try {
      const response = await fetch("/api/response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId,
          answers: answerPayload,
        }),
      });

      if (!response.ok) {
        throw new Error("We could not submit your quiz right now. Please try again.");
      }

      const payload = (await response.json()) as { score: number };
      nextScore = payload.score;
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "We could not submit your quiz right now. Please try again."
      );
      setIsSubmitting(false);
      return;
    }

    const nextOutcomeTiles = questions.map((question) =>
      answers[question.id] === question.correctChoiceIndex ? "🟩" : "🟨"
    );
    const nextSubmission: StoredSubmission = {
      score: nextScore,
      outcomeTiles: nextOutcomeTiles,
      selectedAnswers: answers,
      submittedAt: new Date().toISOString(),
    };

    setScore(nextScore);
    setStoredSubmission(nextSubmission);
    window.localStorage.setItem(storageKey, JSON.stringify(nextSubmission));
    setShowResults(true);
    setIsSubmitting(false);
  };

  return (
    <>
      <section className="rounded-2xl border border-amber-100 bg-card/95 p-5 shadow-xl backdrop-blur sm:p-7">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Daily Quiz</p>
            <h2 className="font-[var(--font-heading)] text-3xl font-bold">{quizTitle}</h2>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {categoryCounts.map(({ topic, count }) => (
              <p
                key={topic}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
              >
                {formatCategoryLabel(topic)}: {count}
              </p>
            ))}
          </div>
        </header>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <article
              key={question.id}
              className="rounded-xl border border-amber-100 bg-background/70 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-semibold">
                  Q{index + 1}. {question.prompt}
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs uppercase tracking-wide text-emerald-800">
                  {formatCategoryLabel(question.topic)}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {question.choices.map((choice, choiceIndex) => {
                  const selected = answers[question.id] === choiceIndex;
                  const isCorrectChoice = choiceIndex === question.correctChoiceIndex;
                  const showCorrectChoice = isLocked && isCorrectChoice;
                  const showIncorrectSelection = isLocked && selected && !isCorrectChoice;
                  return (
                    <button
                      key={choice}
                      type="button"
                      disabled={isLocked}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [question.id]: choiceIndex,
                        }))
                      }
                      className={`rounded-md border px-3 py-2 text-sm transition ${
                        showCorrectChoice
                          ? "border-emerald-600 bg-emerald-100 text-emerald-900"
                          : showIncorrectSelection
                            ? "border-amber-500 bg-amber-100 text-amber-900"
                          : selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-amber-200 bg-white/90 hover:bg-amber-50"
                      }`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <footer className="mt-6 flex flex-wrap items-center gap-3">
          {isLocked ? (
            <Button onClick={() => setShowResults(true)}>View Results</Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount !== questions.length || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
          <p className="text-sm text-muted-foreground">
            {isLocked
              ? "You already submitted this quiz on this device."
              : `${answeredCount}/${questions.length} answered`}
          </p>
          {submissionError ? (
            <p className="text-sm font-semibold text-amber-700">{submissionError}</p>
          ) : null}
        </footer>
      </section>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quiz Results</DialogTitle>
            <DialogDescription>{resultMessage}</DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-center">
            <p className="text-sm uppercase tracking-wide text-amber-900">Your Score</p>
            <p className="font-[var(--font-heading)] text-5xl font-bold text-emerald-900">
              {(storedSubmission?.score ?? score)}/{totalQuestions}
            </p>
          </div>

          <div className="flex justify-center gap-2 text-2xl" aria-label="result-outcomes">
            {displayOutcomeTiles.map((tile, idx) => (
              <span key={`${tile}-${idx}`}>{tile}</span>
            ))}
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={copyResults} className="flex-1">
              Copy Results
            </Button>
            <Button onClick={() => setShowResults(false)} variant="secondary" className="flex-1">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showCopyToast ? (
        <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Results copied to clipboard
        </div>
      ) : null}
    </>
  );
}
