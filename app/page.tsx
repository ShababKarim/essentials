import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { MoonStar, Sparkles, Star } from "lucide-react";

import { LoginActions } from "@/app/components/login-actions";
import { auth } from "@/lib/auth";

const GUEST_COOKIE = "essentials-guest";

export default async function LoginPage() {
  const session = await auth();
  const cookieStore = await cookies();
  if (session?.user || cookieStore.get(GUEST_COOKIE)?.value === "1") {
    redirect("/quiz");
  }

  return (
    <main className="container flex flex-1 items-center py-10 sm:py-16">
      <section className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-100/80 via-white to-emerald-50 p-8 shadow-xl sm:p-10">
          <div className="absolute -left-12 top-12 h-40 w-40 rounded-full bg-amber-200/45 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-emerald-200/35 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm">
              <MoonStar className="h-4 w-4 text-amber-500" />
              Ramadan Progress, Faithfully Saved
            </div>
            <h1 className="mt-6 max-w-xl font-[var(--font-heading)] text-5xl font-bold leading-tight text-emerald-950 sm:text-6xl">
              Keep your daily quiz journey with you.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-emerald-900/75">
              Sign in with Google to save your completed days, build your streak, and
              watch your Ramadan learning grow across the week.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <p className="mt-3 text-sm font-semibold text-emerald-950">Weekly streak</p>
                <p className="mt-1 text-sm text-emerald-900/65">See every completed day at a glance.</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <Star className="h-5 w-5 text-amber-500" />
                <p className="mt-3 text-sm font-semibold text-emerald-950">Saved stats</p>
                <p className="mt-1 text-sm text-emerald-900/65">Track quizzes solved, averages, and perfect runs.</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <MoonStar className="h-5 w-5 text-amber-500" />
                <p className="mt-3 text-sm font-semibold text-emerald-950">Guest option</p>
                <p className="mt-1 text-sm text-emerald-900/65">Skip sign-in if you just want today&apos;s quiz.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-amber-200 bg-card/95 p-8 shadow-xl sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
            Essentials
          </p>
          <h2 className="mt-4 font-[var(--font-heading)] text-4xl font-bold text-emerald-950">
            Sign in before the quiz
          </h2>
          <p className="mt-3 text-base leading-relaxed text-emerald-900/70">
            Save your responses to your account with Google, or continue as a guest if
            you prefer a lighter path for now.
          </p>
          <div className="mt-8">
            <LoginActions />
          </div>
        </div>
      </section>
    </main>
  );
}
