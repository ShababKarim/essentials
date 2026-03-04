import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const localMidnight = new Date();
  localMidnight.setHours(0, 0, 0, 0);

  const quiz = await prisma.quiz.findFirst({
    where: {
      releaseDate: localMidnight,
      isPublished: true,
    },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
        include: { question: true },
      },
    },
  });

  if (!quiz) {
    return NextResponse.json({ message: "No quiz published for today." }, { status: 404 });
  }

  return NextResponse.json({
    id: quiz.id,
    slug: quiz.slug,
    name: quiz.name,
    title: quiz.title,
    releaseDate: quiz.releaseDate,
    questions: quiz.questions.map((q) => ({
      id: q.question.id,
      prompt: q.question.prompt,
      topic: q.question.topic.toLowerCase(),
      choices: q.question.options,
    })),
  });
}
