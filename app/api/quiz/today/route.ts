import { NextResponse } from "next/server";

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

  const localDayStart = new Date();
  localDayStart.setHours(0, 0, 0, 0);
  return localDayStart;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const localDayStart = parseClientDateOrNow(url.searchParams.get("clientDate"));
  const localNextDayStart = new Date(localDayStart);
  localNextDayStart.setDate(localNextDayStart.getDate() + 1);

  const quiz = await prisma.quiz.findFirst({
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

  if (!quiz) {
    return NextResponse.json(
      { message: "No quiz published for today yet. Please check back with sabr." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: quiz.id,
    slug: quiz.slug,
    title: quiz.title,
    releaseDate: quiz.releaseDate,
    questions: quiz.questions.map((q) => ({
      id: q.question.id,
      prompt: q.question.prompt,
      topic: q.question.topic.toLowerCase(),
      choices: q.question.options,
      correctChoiceIndex: q.question.answerIndex,
    })),
  });
}
