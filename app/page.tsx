export const dynamic = "force-dynamic";

import { DailyQuiz } from "@/app/components/daily-quiz";
import { InstructionsModal } from "@/app/components/instructions-modal";

export default async function Home() {
  const testDate = process.env.TEST_DATE?.trim();

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

      <DailyQuiz testDate={testDate} />
    </main>
  );
}
