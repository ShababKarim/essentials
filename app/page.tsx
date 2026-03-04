import { InstructionsModal } from "@/app/components/instructions-modal";
import { QuizCard } from "@/app/components/quiz-card";
import { isQuizCategory } from "@/lib/quiz";
import { prisma } from "@/lib/prisma";

function getLocalTodayFromEnvOrNow(): Date {
  const testDate = process.env.TEST_DATE?.trim();
  if (!testDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(testDate);
  if (!match) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  parsed.setHours(0, 0, 0, 0);
  console.log(parsed);
  return parsed;
}

export default async function Home() {
  const localDayStart = getLocalTodayFromEnvOrNow();
  const localNextDayStart = new Date(localDayStart);
  localNextDayStart.setDate(localNextDayStart.getDate() + 1);

  const todaysQuiz = await prisma.quiz.findFirst({
    where: {
      isPublished: true,
      releaseDate: {
        gte: localDayStart,
        lt: localNextDayStart,
      },
    },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
        include: { question: true },
      },
    },
  });

  return (
    <main className="container relative py-8 sm:py-12">
      <InstructionsModal />

      <section className="mb-8 text-center sm:mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-700">Bismillah</p>
        <h1 className="font-[var(--font-heading)] text-5xl font-bold text-emerald-950 sm:text-6xl">
          Essentials
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-emerald-900/80 sm:text-lg">
          A daily quiz with questions across different Islamic categories.
        </p>
      </section>

      {todaysQuiz ? (
        <QuizCard
          quizTitle={todaysQuiz.title}
          questions={todaysQuiz.questions
            .map((item) => {
              const topic = item.question.topic.toLowerCase();
              if (!isQuizCategory(topic)) {
                return null;
              }

              return {
                id: item.question.id,
                topic,
                prompt: item.question.prompt,
                choices: item.question.options,
                correctChoiceIndex: item.question.answerIndex,
              };
            })
            .filter((question) => question !== null)}
        />
      ) : (
        <section className="rounded-2xl border border-amber-200 bg-card/95 p-6 text-center shadow-xl">
          <h2 className="font-[var(--font-heading)] text-3xl font-bold text-emerald-950">
            Today&apos;s Quiz Is Not Ready Yet
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-emerald-900/80">
            Please check back soon with sabr. A new quiz is released daily at midnight
            once it is published.
          </p>
        </section>
      )}
    </main>
  );
}
