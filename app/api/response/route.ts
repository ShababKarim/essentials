import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AnswerPayload = {
  questionId: string;
  choiceIndex: number;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  const payload = (await req.json()) as {
    quizId?: string;
    answers?: AnswerPayload[];
  };

  if (!payload.quizId || !Array.isArray(payload.answers)) {
    return NextResponse.json({ message: "Invalid submission." }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: payload.quizId },
    include: {
      questions: {
        include: {
          question: true,
        },
      },
    },
  });

  if (!quiz) {
    return NextResponse.json({ message: "Quiz not found." }, { status: 404 });
  }

  if (payload.answers.length !== quiz.questions.length) {
    return NextResponse.json({ message: "Invalid answer count." }, { status: 400 });
  }

  if (session?.user?.id) {
    const existing = await prisma.quizResponse.findFirst({
      where: {
        quizId: quiz.id,
        userId: session.user.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "You already submitted this quiz.", score: existing.score },
        { status: 409 }
      );
    }
  }

  const correctByQuestion = new Map(
    quiz.questions.map((item) => [item.questionId, item.question.answerIndex])
  );

  let score = 0;
  for (const answer of payload.answers) {
    if (correctByQuestion.get(answer.questionId) === answer.choiceIndex) {
      score += 1;
    }
  }

  const response = await prisma.quizResponse.create({
    data: {
      quizId: quiz.id,
      userId: session?.user?.id ?? null,
      answers: payload.answers,
      score,
    },
  });

  return NextResponse.json({ id: response.id, score, total: quiz.questions.length });
}
