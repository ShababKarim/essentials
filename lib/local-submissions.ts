export const SUBMISSION_STORAGE_PREFIX = "essentials-submission-v1";

export type StoredSubmission = {
  score: number;
  outcomeTiles: string[];
  selectedAnswers: Record<string, number>;
  submittedAt: string;
};

type AnswerEntry = {
  questionId: string;
  choiceIndex: number;
};

export function normalizeSelectedAnswers(
  value: unknown
): Record<string, number> | null {
  if (Array.isArray(value)) {
    const entries = value as AnswerEntry[];
    const normalized = Object.fromEntries(
      entries
        .filter(
          (entry) =>
            entry &&
            typeof entry.questionId === "string" &&
            typeof entry.choiceIndex === "number"
        )
        .map((entry) => [entry.questionId, entry.choiceIndex])
    );

    return Object.keys(normalized).length > 0 ? normalized : null;
  }

  if (value && typeof value === "object") {
    const normalized = Object.fromEntries(
      Object.entries(value)
        .filter(
          ([questionId, choiceIndex]) =>
            typeof questionId === "string" && typeof choiceIndex === "number"
        )
        .map(([questionId, choiceIndex]) => [questionId, choiceIndex])
    );

    return Object.keys(normalized).length > 0 ? normalized : null;
  }

  return null;
}
