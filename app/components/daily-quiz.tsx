"use client";

import { useEffect, useMemo, useState } from "react";

import { QuizCard } from "@/app/components/quiz-card";
import { isQuizCategory, type QuizQuestion } from "@/lib/quiz";

type ApiQuestion = {
  id: string;
  prompt: string;
  topic: string;
  choices: string[];
  correctChoiceIndex: number;
};

type ApiQuiz = {
  id: string;
  title: string;
  questions: ApiQuestion[];
};

type DailyQuizProps = {
  testDate?: string;
};

function getClientDateString(testDate?: string): string {
  if (testDate && /^\d{4}-\d{2}-\d{2}$/.test(testDate)) {
    return testDate;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DailyQuiz({ testDate }: DailyQuizProps) {
  const [quiz, setQuiz] = useState<ApiQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clientDate = useMemo(() => getClientDateString(testDate), [testDate]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/quiz/today?clientDate=${encodeURIComponent(clientDate)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          if (active) {
            setQuiz(null);
          }
          return;
        }

        const payload = (await response.json()) as ApiQuiz;
        if (active) {
          setQuiz(payload);
        }
      } catch {
        if (active) {
          setQuiz(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [clientDate]);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-card/95 p-6 text-center shadow-xl">
        <h2 className="font-[var(--font-heading)] text-3xl font-bold text-emerald-950">
          Loading Today&apos;s Quiz
        </h2>
      </section>
    );
  }

  if (!quiz) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-card/95 p-6 text-center shadow-xl">
        <h2 className="font-[var(--font-heading)] text-3xl font-bold text-emerald-950">
          Today&apos;s Quiz Is Not Ready Yet
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-emerald-900/80">
          Please check back soon with sabr. A new quiz is released daily at midnight
          in your local time.
        </p>
      </section>
    );
  }

  const questions: QuizQuestion[] = quiz.questions
    .map((item) => {
      const topic = item.topic.toLowerCase();
      if (!isQuizCategory(topic)) {
        return null;
      }

      return {
        id: item.id,
        topic,
        prompt: item.prompt,
        choices: item.choices,
        correctChoiceIndex: item.correctChoiceIndex,
      };
    })
    .filter((question): question is QuizQuestion => question !== null);

  return <QuizCard quizId={quiz.id} quizTitle={quiz.title} questions={questions} />;
}
