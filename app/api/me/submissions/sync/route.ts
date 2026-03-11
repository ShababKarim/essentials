import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SyncItem = {
  quizId?: string;
  selectedAnswers?: Record<string, number>;
  submittedAt?: string;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = (await req.json()) as {
    submissions?: SyncItem[];
  };

  if (!Array.isArray(payload.submissions)) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  let syncedCount = 0;

  for (const item of payload.submissions) {
    if (!item.quizId || !item.selectedAnswers || typeof item.selectedAnswers !== "object") {
      continue;
    }

    const existing = await prisma.quizResponse.findFirst({
      where: {
        quizId: item.quizId,
        userId: session.user.id,
      },
      select: { id: true },
    });
    if (existing) {
      continue;
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: item.quizId },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          include: { question: true },
        },
      },
    });
    if (!quiz) {
      continue;
    }

    const answers = quiz.questions.map((itemQuestion) => {
      const selected = item.selectedAnswers?.[itemQuestion.questionId];
      return {
        questionId: itemQuestion.questionId,
        choiceIndex: typeof selected === "number" ? selected : -1,
      };
    });

    if (answers.some((answer) => answer.choiceIndex < 0)) {
      continue;
    }

    const score = quiz.questions.reduce((sum, itemQuestion) => {
      const selected = item.selectedAnswers?.[itemQuestion.questionId];
      return sum + (selected === itemQuestion.question.answerIndex ? 1 : 0);
    }, 0);

    const submittedAt = item.submittedAt ? new Date(item.submittedAt) : new Date();
    const safeSubmittedAt = Number.isNaN(submittedAt.getTime()) ? new Date() : submittedAt;

    await prisma.quizResponse.create({
      data: {
        quizId: quiz.id,
        userId: session.user.id,
        answers,
        score,
        submittedAt: safeSubmittedAt,
      },
    });

    syncedCount += 1;
  }

  return NextResponse.json({ syncedCount });
}
