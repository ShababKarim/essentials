import { readFile } from "node:fs/promises";
import path from "node:path";

import { PrismaClient, QuestionTopic } from "@prisma/client";

const prisma = new PrismaClient();

type RawQuizQuestion = {
  id: string;
  prompt: string;
  topic: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

type RawQuiz = {
  title: string;
  releaseDate: string;
  isPublished?: boolean;
  questions: RawQuizQuestion[];
};

type RawQuizzesFile = {
  quizzes: RawQuiz[];
};

function parseLocalDate(dateString: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString.trim());
  if (!match) {
    throw new Error(`Invalid date format "${dateString}". Use YYYY-MM-DD.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseTopic(topic: string): QuestionTopic {
  const normalized = topic.trim().toUpperCase();

  switch (normalized) {
    case "FIQH":
      return QuestionTopic.FIQH;
    case "AQEEDAH":
      return QuestionTopic.AQEEDAH;
    case "SEERAH":
      return QuestionTopic.SEERAH;
    case "AKHLAQ":
      return QuestionTopic.AKHLAQ;
    default:
      throw new Error(
        `Invalid topic \"${topic}\". Expected one of: fiqh, aqeedah, seerah, akhlaq.`
      );
  }
}

async function loadQuizzesFile(): Promise<RawQuiz[]> {
  const filePath = path.join(process.cwd(), "prisma", "quizzes.json");
  const file = await readFile(filePath, "utf8");
  const parsed = JSON.parse(file) as RawQuizzesFile;

  if (!Array.isArray(parsed.quizzes) || parsed.quizzes.length === 0) {
    throw new Error("prisma/quizzes.json must include a non-empty quizzes array.");
  }

  return parsed.quizzes;
}

async function main() {
  const quizzes = await loadQuizzesFile();

  for (const quizInput of quizzes) {
    const releaseDate = parseLocalDate(quizInput.releaseDate);

    if (!quizInput.title?.trim()) {
      throw new Error(`Quiz with releaseDate ${quizInput.releaseDate} is missing title.`);
    }

    if (!Array.isArray(quizInput.questions) || quizInput.questions.length === 0) {
      throw new Error(`Quiz \"${quizInput.title}\" must include at least one question.`);
    }

    const slug = `${slugify(quizInput.title)}-${quizInput.releaseDate}`;

    const normalizedQuestions = quizInput.questions.map((question, index) => {
      if (!question.id?.trim()) {
        throw new Error(`Quiz \"${quizInput.title}\" question ${index + 1}: id is required.`);
      }

      if (!question.prompt?.trim()) {
        throw new Error(
          `Quiz \"${quizInput.title}\" question ${index + 1}: prompt is required.`
        );
      }

      if (!Array.isArray(question.options) || question.options.length < 2) {
        throw new Error(
          `Quiz \"${quizInput.title}\" question ${index + 1}: at least two options are required.`
        );
      }

      if (
        question.answerIndex < 0 ||
        question.answerIndex >= question.options.length
      ) {
        throw new Error(
          `Quiz \"${quizInput.title}\" question ${index + 1}: answerIndex is out of bounds.`
        );
      }

      return {
        id: question.id.trim(),
        prompt: question.prompt.trim(),
        topic: parseTopic(question.topic),
        options: question.options.map((option) => option.trim()),
        answerIndex: question.answerIndex,
        explanation: question.explanation?.trim() || null,
      };
    });

    await prisma.$transaction(async (tx) => {
      for (const question of normalizedQuestions) {
        await tx.question.upsert({
          where: { id: question.id },
          update: {
            prompt: question.prompt,
            topic: question.topic,
            options: question.options,
            answerIndex: question.answerIndex,
            explanation: question.explanation,
          },
          create: {
            id: question.id,
            prompt: question.prompt,
            topic: question.topic,
            options: question.options,
            answerIndex: question.answerIndex,
            explanation: question.explanation,
          },
        });
      }

      const quiz = await tx.quiz.upsert({
        where: { releaseDate },
        update: {
          title: quizInput.title.trim(),
          slug,
          isPublished: quizInput.isPublished ?? true,
        },
        create: {
          title: quizInput.title.trim(),
          slug,
          releaseDate,
          isPublished: quizInput.isPublished ?? true,
        },
      });

      await tx.quizQuestion.deleteMany({ where: { quizId: quiz.id } });

      await tx.quizQuestion.createMany({
        data: normalizedQuestions.map((question, idx) => ({
          quizId: quiz.id,
          questionId: question.id,
          sortOrder: idx,
        })),
      });

      console.log(
        `Seeded quiz ${quiz.slug} (${normalizedQuestions.length} questions).`
      );
    });
  }
}

main()
  .catch((err) => {
    if (err?.code === "P2021") {
      console.error(
        "Prisma tables are missing. Run `bun run prisma:push` (or `bun run prisma:setup`) first."
      );
    } else {
      console.error(err);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
