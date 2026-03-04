"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type QuizQuestion = {
  id: string;
  prompt: string;
  topic: "fiqh" | "aqeedah";
  choices: string[];
};

type QuizCardProps = {
  quizName: string;
  quizTitle: string;
  questions: QuizQuestion[];
};

export function QuizCard({ quizName, quizTitle, questions }: QuizCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers]
  );

  const copyResults = async () => {
    const content = [
      `Essentials ${quizTitle}`,
      `${answeredCount}/3 answered`,
      "#RamadanQuiz #Essentials",
    ].join("\n");

    await navigator.clipboard.writeText(content);
  };

  return (
    <section className="rounded-2xl border border-amber-100 bg-card/95 p-5 shadow-xl backdrop-blur sm:p-7">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Daily Quiz</p>
          <h2 className="font-[var(--font-heading)] text-3xl font-bold">{quizTitle}</h2>
        </div>
        <p className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
          Quiz: {quizName}
        </p>
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
                {question.topic}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {question.choices.map((choice) => {
                const selected = answers[question.id] === choice;
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: choice,
                      }))
                    }
                    className={`rounded-md border px-3 py-2 text-sm transition ${
                      selected
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
        <Button
          onClick={() => setSubmitted(true)}
          disabled={answeredCount !== questions.length}
        >
          Submit Quiz
        </Button>
        <Button onClick={copyResults} variant="secondary" disabled={!submitted}>
          Copy Results
        </Button>
        <p className="text-sm text-muted-foreground">{answeredCount}/3 answered</p>
      </footer>
    </section>
  );
}
