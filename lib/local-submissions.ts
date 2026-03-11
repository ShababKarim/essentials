export const SUBMISSION_STORAGE_PREFIX = "essentials-submission-v1";

export type StoredSubmission = {
  score: number;
  outcomeTiles: string[];
  selectedAnswers: Record<string, number>;
  submittedAt: string;
};
