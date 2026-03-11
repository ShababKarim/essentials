export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DailyQuiz } from "@/app/components/daily-quiz";
import { QuizAuthButton } from "@/app/components/quiz-auth-button";
import { InstructionsModal } from "@/app/components/instructions-modal";
import { ProgressPanel } from "@/app/components/progress-panel";
import { SubmissionSync } from "@/app/components/submission-sync";
import { auth } from "@/lib/auth";

const GUEST_COOKIE = "essentials-guest";

export default async function QuizPage() {
  const session = await auth();
  const cookieStore = await cookies();
  if (!session?.user && cookieStore.get(GUEST_COOKIE)?.value !== "1") {
    redirect("/");
  }

  const testDate = process.env.TEST_DATE?.trim();

  return (
    <main className="container relative py-8 sm:py-12">
      <InstructionsModal />

      <div className="mb-6 flex justify-end">
        <QuizAuthButton
          isAuthenticated={Boolean(session?.user)}
          userName={session?.user?.name ?? null}
        />
      </div>

      <section className="mb-8 text-center sm:mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-700">Bismillah</p>
        <h1 className="font-[var(--font-heading)] text-5xl font-bold text-emerald-950 sm:text-6xl">
          Essentials
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-emerald-900/80 sm:text-lg">
          A daily quiz with questions across different Islamic categories.
        </p>
      </section>

      <div className="space-y-6">
        <SubmissionSync enabled={Boolean(session?.user)} />
        <DailyQuiz testDate={testDate} />
        <ProgressPanel testDate={testDate} />
      </div>
    </main>
  );
}
