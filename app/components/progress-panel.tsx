"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Flame, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
type ProgressResponse = {
  authenticated: boolean;
  name: string | null;
  streakCount: number;
  week: Array<{
    date: string;
    label: string;
    dayNumber: number;
    completed: boolean;
    isToday: boolean;
  }>;
  stats: Array<{
    label: string;
    value: string;
  }>;
};

type ProgressPanelProps = {
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

export function ProgressPanel({ testDate }: ProgressPanelProps) {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const clientDate = useMemo(() => getClientDateString(testDate), [testDate]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch(
          `/api/me/progress?clientDate=${encodeURIComponent(clientDate)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          if (active) {
            setData(null);
          }
          return;
        }

        const payload = (await response.json()) as ProgressResponse;
        if (active) {
          setData(payload);
        }
      } catch {
        if (active) {
          setData(null);
        }
      }
    };

    void load();

    const handleRefresh = () => {
      void load();
    };

    window.addEventListener("essentials:submission-saved", handleRefresh);

    return () => {
      active = false;
      window.removeEventListener("essentials:submission-saved", handleRefresh);
    };
  }, [clientDate]);

  if (!data?.authenticated) {
    return (
      <section className="rounded-[2rem] border border-amber-200 bg-card/95 p-6 shadow-xl sm:p-8">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-inner">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-[var(--font-heading)] text-4xl font-bold text-emerald-950">
            Save Your Ramadan Progress
          </h2>
          <p className="mt-3 text-base leading-relaxed text-emerald-900/75">
            Sign in with Google to keep your streak, see your completed week, and track
            your quiz journey across Ramadan.
          </p>
          <Button
            onClick={() => void signIn("google", { callbackUrl: "/quiz" })}
            className="mt-6 rounded-full bg-emerald-900 px-6 text-amber-50 hover:bg-emerald-800"
          >
            Sign In To Save Progress
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-amber-200 bg-card/95 p-6 shadow-xl sm:p-8">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-6 py-8 text-center">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-amber-200 bg-white/90 shadow-sm">
          <Flame className="h-10 w-10 text-amber-500" />
        </div>
        <p className="mt-4 text-6xl font-black tracking-tight text-emerald-950">
          {data.streakCount}
        </p>
        <h2 className="font-[var(--font-heading)] text-4xl font-bold text-emerald-950">
          {data.streakCount === 1 ? "Day" : `Days`}
        </h2>
        <p className="mt-2 text-base text-emerald-900/70">
          {data.name ? `${data.name}, you are building steady khayr.` : "You are building steady khayr."}
        </p>

        <div className="mt-8 grid grid-cols-7 gap-1.5 sm:gap-3">
          {data.week.map((day) => (
            <div key={day.date} className="space-y-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/45 sm:text-sm">
                {day.label}
              </p>
              <div
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold sm:h-11 sm:w-11 sm:text-sm ${
                  day.completed
                    ? "border-amber-300 bg-gradient-to-br from-amber-300 to-orange-300 text-white shadow-sm"
                    : day.isToday
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-amber-100 bg-white/90 text-emerald-900/55"
                }`}
              >
                {day.completed ? <Check className="h-5 w-5" /> : day.dayNumber}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-amber-100 bg-amber-50/60 p-5 sm:p-6">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-emerald-900/50">
          Your Stats
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {data.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/80 bg-white/80 px-4 py-5 text-center shadow-sm"
            >
              <p className="text-sm font-medium text-emerald-900/55">{stat.label}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-emerald-950">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
