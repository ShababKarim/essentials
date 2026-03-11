import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseClientDateOrNow(rawClientDate: string | null): Date {
  if (rawClientDate && /^\d{4}-\d{2}-\d{2}$/.test(rawClientDate)) {
    const [yearString, monthString, dayString] = rawClientDate.split("-");
    const year = Number(yearString);
    const month = Number(monthString);
    const day = Number(dayString);
    const parsed = new Date(year, month - 1, day);
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getStartOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ authenticated: false });
  }

  const url = new URL(req.url);
  const clientDate = parseClientDateOrNow(url.searchParams.get("clientDate"));
  const weekStart = getStartOfWeek(clientDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const responses = await prisma.quizResponse.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      quiz: {
        select: {
          releaseDate: true,
        },
      },
    },
    orderBy: {
      submittedAt: "asc",
    },
  });

  const completedDateKeys = new Set(
    responses.map((response) => dateKey(new Date(response.quiz.releaseDate)))
  );

  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const key = dateKey(date);
    return {
      date: key,
      label: date.toLocaleDateString("en-US", { weekday: "narrow" }),
      dayNumber: date.getDate(),
      completed: completedDateKeys.has(key),
      isToday: key === dateKey(clientDate),
    };
  });

  let streakCount = 0;
  const uniqueDates = [...completedDateKeys].sort().reverse();
  const cursor = new Date(clientDate);
  for (const key of uniqueDates) {
    if (key !== dateKey(cursor)) {
      break;
    }
    streakCount += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const totalQuizzes = responses.length;
  const totalCorrect = responses.reduce((sum, response) => sum + response.score, 0);
  const averageScore = totalQuizzes > 0 ? (totalCorrect / totalQuizzes).toFixed(1) : "0.0";
  const perfectScores = responses.filter((response) => {
    const answerCount = Array.isArray(response.answers) ? response.answers.length : 0;
    return answerCount > 0 && response.score === answerCount;
  }).length;

  return NextResponse.json({
    authenticated: true,
    name: session.user.name ?? null,
    streakCount,
    week,
    stats: [
      { label: "Days", value: String(completedDateKeys.size) },
      { label: "Quizzes", value: String(totalQuizzes) },
      { label: "Avg Score", value: averageScore },
      { label: "Perfects", value: String(perfectScores) },
    ],
  });
}
