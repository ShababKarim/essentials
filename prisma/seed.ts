import { PrismaClient, QuestionTopic } from "@prisma/client";

const prisma = new PrismaClient();

function getRamadanDayForDate(releaseDate: Date): number {
  // User-provided anchor: March 4, 2026 is Ramadan Day 15.
  const anchorDate = new Date("2026-03-04T00:00:00");
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const dayOffset = Math.round(
    (releaseDate.getTime() - anchorDate.getTime()) / millisecondsPerDay
  );

  return 15 + dayOffset;
}

async function main() {
  const releaseDate = new Date();
  releaseDate.setHours(0, 0, 0, 0);
  const ramadanDay = getRamadanDayForDate(releaseDate);
  const quizName = `Ramadan Day ${ramadanDay}`;

  const questions = await Promise.all([
    prisma.question.upsert({
      where: { id: "q-fiqh-niyyah" },
      update: {},
      create: {
        id: "q-fiqh-niyyah",
        prompt: "Which intention is required before beginning the fast?",
        topic: QuestionTopic.FIQH,
        options: ["Niyyah", "Wudu", "Khutbah"],
        answerIndex: 0,
      },
    }),
    prisma.question.upsert({
      where: { id: "q-aqeedah-angels" },
      update: {},
      create: {
        id: "q-aqeedah-angels",
        prompt: "Belief in Allah's angels is part of:",
        topic: QuestionTopic.AQEEDAH,
        options: ["Pillars of Islam", "Pillars of Iman", "Sunnah acts"],
        answerIndex: 1,
      },
    }),
    prisma.question.upsert({
      where: { id: "q-fiqh-suhur" },
      update: {},
      create: {
        id: "q-fiqh-suhur",
        prompt: "What meal is recommended before Fajr during fasting?",
        topic: QuestionTopic.FIQH,
        options: ["Iftar", "Suhur", "Qiyam"],
        answerIndex: 1,
      },
    }),
    prisma.question.upsert({
      where: { id: "q-seerah-hijrah" },
      update: {},
      create: {
        id: "q-seerah-hijrah",
        prompt: "What is the name of the migration from Makkah to Madinah?",
        topic: QuestionTopic.SEERAH,
        options: ["Hijrah", "Isra", "Fath"],
        answerIndex: 0,
      },
    }),
    prisma.question.upsert({
      where: { id: "q-akhlaq-amanah" },
      update: {},
      create: {
        id: "q-akhlaq-amanah",
        prompt: "Which action best represents amanah (trustworthiness)?",
        topic: QuestionTopic.AKHLAQ,
        options: [
          "Returning something borrowed on time",
          "Keeping extra change by mistake",
          "Sharing private information",
        ],
        answerIndex: 0,
      },
    }),
  ]);

  const quiz = await prisma.quiz.upsert({
    where: { releaseDate },
    update: {
      isPublished: true,
      name: quizName,
      title: "Ramadan Essentials",
      slug: `ramadan-${releaseDate.toISOString().slice(0, 10)}`,
    },
    create: {
      releaseDate,
      isPublished: true,
      name: quizName,
      title: "Ramadan Essentials",
      slug: `ramadan-${releaseDate.toISOString().slice(0, 10)}`,
    },
  });

  await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } });

  await prisma.quizQuestion.createMany({
    data: questions.map((question, idx) => ({
      quizId: quiz.id,
      questionId: question.id,
      sortOrder: idx,
    })),
  });

  console.log(`Seeded quiz ${quiz.slug} with ${questions.length} questions.`);
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
