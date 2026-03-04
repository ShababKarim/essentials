import { PrismaClient, QuestionTopic } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const releaseDate = new Date();
  releaseDate.setHours(0, 0, 0, 0);

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
  ]);

  const quiz = await prisma.quiz.upsert({
    where: { releaseDate },
    update: {
      isPublished: true,
      title: "Ramadan Essentials",
      slug: `ramadan-${releaseDate.toISOString().slice(0, 10)}`,
    },
    create: {
      releaseDate,
      isPublished: true,
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
