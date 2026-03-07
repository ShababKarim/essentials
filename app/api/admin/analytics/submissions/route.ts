import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const ADMIN_HEADER = "x-admin-token";

function calculateScoreStats(scores: number[]) {
  if (scores.length === 0) {
    return {
      totalSubmissionCount: 0,
      meanScore: null,
      medianScore: null,
      modeScore: null,
    };
  }

  const sorted = [...scores].sort((a, b) => a - b);
  const total = sorted.length;
  const sum = sorted.reduce((acc, score) => acc + score, 0);
  const mean = Number((sum / total).toFixed(2));

  const middle = Math.floor(total / 2);
  const median =
    total % 2 === 0
      ? Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2))
      : sorted[middle];

  const frequency = new Map<number, number>();
  let maxFreq = 0;
  for (const score of sorted) {
    const next = (frequency.get(score) ?? 0) + 1;
    frequency.set(score, next);
    if (next > maxFreq) {
      maxFreq = next;
    }
  }

  const modeCandidates = [...frequency.entries()]
    .filter(([, count]) => count === maxFreq)
    .map(([score]) => score)
    .sort((a, b) => a - b);
  const mode = modeCandidates[0] ?? null;

  return {
    totalSubmissionCount: total,
    meanScore: mean,
    medianScore: median,
    modeScore: mode,
  };
}

export async function GET(req: NextRequest) {
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

  const byQuizRows = await prisma.quiz.findMany({
    orderBy: { releaseDate: "asc" },
    select: {
      id: true,
      title: true,
      releaseDate: true,
      responses: {
        select: {
          score: true,
        },
      },
    },
  });

  const allScores = byQuizRows.flatMap((quiz) => quiz.responses.map((r) => r.score));
  const overallStats = calculateScoreStats(allScores);
  const byQuiz = byQuizRows.map((quiz) => {
    const quizScores = quiz.responses.map((response) => response.score);
    const stats = calculateScoreStats(quizScores);

    return {
      quizId: quiz.id,
      title: quiz.title,
      releaseDate: quiz.releaseDate,
      ...stats,
    };
  });

  return NextResponse.json({
    ...overallStats,
    byQuiz,
  });
}
