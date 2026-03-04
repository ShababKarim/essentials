import { Prisma, QuestionTopic } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { isQuizCategory } from "@/lib/quiz";

const ADMIN_HEADER = "x-admin-token";

type CreateQuizQuestionInput = {
  prompt?: string;
  topic?: string;
  options?: string[];
  answerIndex?: number;
  explanation?: string;
};

type CreateQuizPayload = {
  title?: string;
  releaseDate?: string;
  isPublished?: boolean;
  questions?: CreateQuizQuestionInput[];
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function makeUniqueSlug(base: string): Promise<string> {
  const existing = await prisma.quiz.findMany({
    where: {
      slug: {
        startsWith: base,
      },
    },
    select: { slug: true },
  });

  if (!existing.some((quiz) => quiz.slug === base)) {
    return base;
  }

  let suffix = 2;
  while (existing.some((quiz) => quiz.slug === `${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
}

export async function POST(req: NextRequest) {
  const expectedAdminToken = process.env.ADMIN_TOKEN;
  const requestAdminToken = req.headers.get(ADMIN_HEADER);

  if (!expectedAdminToken) {
    return NextResponse.json(
      { message: "Server misconfigured: ADMIN_TOKEN is not set." },
      { status: 500 }
    );
  }

  if (!requestAdminToken || requestAdminToken !== expectedAdminToken) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = (await req.json()) as CreateQuizPayload;
  console.log(`Creating question with payload: \n${JSON.stringify(payload)}`);

  if (!payload.title?.trim() || !payload.releaseDate || !Array.isArray(payload.questions)) {
    return NextResponse.json(
      {
        message:
          "Invalid payload. Required fields: title, releaseDate, questions[].",
      },
      { status: 400 }
    );
  }

  if (payload.questions.length === 0) {
    return NextResponse.json(
      { message: "At least one question is required." },
      { status: 400 }
    );
  }

  const parsedDate = new Date(payload.releaseDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json(
      { message: "releaseDate must be a valid date string." },
      { status: 400 }
    );
  }

  try {
    const normalizedQuestions = payload.questions.map((question, index) => {
      if (!question.prompt?.trim()) {
        throw new Error(`Question ${index + 1}: prompt is required.`);
      }

      if (!question.topic || !isQuizCategory(question.topic.toLowerCase())) {
        throw new Error(
          `Question ${index + 1}: topic must be one of fiqh, aqeedah, seerah, akhlaq.`
        );
      }

      if (!Array.isArray(question.options) || question.options.length < 2) {
        throw new Error(`Question ${index + 1}: at least two options are required.`);
      }

      const hasEmptyOption = question.options.some((option) => !option?.trim());
      if (hasEmptyOption) {
        throw new Error(`Question ${index + 1}: options cannot be empty.`);
      }

      if (
        typeof question.answerIndex !== "number" ||
        question.answerIndex < 0 ||
        question.answerIndex >= question.options.length
      ) {
        throw new Error(
          `Question ${index + 1}: answerIndex must be within options range.`
        );
      }

      return {
        prompt: question.prompt.trim(),
        topic: question.topic.toUpperCase() as QuestionTopic,
        options: question.options.map((option) => option.trim()),
        answerIndex: question.answerIndex,
        explanation: question.explanation?.trim() || null,
      };
    });

    const releaseDateString = parsedDate.toISOString().slice(0, 10);
    const slugBase = slugify(`${payload.title}-${releaseDateString}`);
    const slug = await makeUniqueSlug(slugBase || `quiz-${releaseDateString}`);

    const created = await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: {
          title: payload.title!.trim(),
          releaseDate: parsedDate,
          isPublished: payload.isPublished ?? true,
          slug,
        },
      });

      for (const [index, question] of normalizedQuestions.entries()) {
        const createdQuestion = await tx.question.create({
          data: {
            prompt: question.prompt,
            topic: question.topic,
            options: question.options,
            answerIndex: question.answerIndex,
            explanation: question.explanation,
          },
        });

        await tx.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionId: createdQuestion.id,
            sortOrder: index,
          },
        });
      }

      return quiz;
    });

    return NextResponse.json(
      {
        id: created.id,
        slug: created.slug,
        title: created.title,
        releaseDate: created.releaseDate,
        isPublished: created.isPublished,
        questionCount: normalizedQuestions.length,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "A quiz already exists with this unique value (date or slug)." },
        { status: 409 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Failed to create quiz." }, { status: 500 });
  }
}
