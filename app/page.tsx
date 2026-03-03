import { InstructionsModal } from "@/app/components/instructions-modal";
import { QuizCard } from "@/app/components/quiz-card";

const todaysQuiz = {
  id: "ramadan-day-01",
  title: "Ramadan Essentials",
  questions: [
    {
      id: "q-1",
      topic: "fiqh" as const,
      prompt: "Which intention is required before beginning the fast?",
      choices: ["Niyyah", "Wudu", "Khutbah"],
    },
    {
      id: "q-2",
      topic: "aqeedah" as const,
      prompt: "Belief in Allah's angels is part of:",
      choices: ["Pillars of Islam", "Pillars of Iman", "Sunnah acts"],
    },
    {
      id: "q-3",
      topic: "fiqh" as const,
      prompt: "What meal is recommended before Fajr during fasting?",
      choices: ["Iftar", "Suhur", "Qiyam"],
    },
  ],
};

export default function Home() {
  return (
    <main className="container relative py-8 sm:py-12">
      <InstructionsModal />

      <section className="mb-8 text-center sm:mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-700">Bismillah</p>
        <h1 className="font-[var(--font-heading)] text-5xl font-bold text-emerald-950 sm:text-6xl">
          Essentials
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-emerald-900/80 sm:text-lg">
          A warm daily Ramadan challenge to strengthen your essentials in fiqh and
          aqeedah.
        </p>
      </section>

      <QuizCard
        quizId={todaysQuiz.id}
        quizTitle={todaysQuiz.title}
        questions={todaysQuiz.questions}
      />
    </main>
  );
}
