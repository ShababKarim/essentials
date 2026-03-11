"use client";

import { useEffect } from "react";

import {
  SUBMISSION_STORAGE_PREFIX,
  type StoredSubmission,
} from "@/lib/local-submissions";

type SubmissionSyncProps = {
  enabled: boolean;
};

export function SubmissionSync({ enabled }: SubmissionSyncProps) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const entries = Object.entries(window.localStorage)
      .filter(([key]) => key.startsWith(`${SUBMISSION_STORAGE_PREFIX}:`))
      .map(([key, raw]) => {
        try {
          const parsed = JSON.parse(raw) as StoredSubmission;
          const quizId = key.slice(`${SUBMISSION_STORAGE_PREFIX}:`.length);
          if (
            !quizId ||
            typeof parsed.score !== "number" ||
            !Array.isArray(parsed.outcomeTiles) ||
            !parsed.selectedAnswers ||
            typeof parsed.selectedAnswers !== "object" ||
            typeof parsed.submittedAt !== "string"
          ) {
            return null;
          }

          return {
            quizId,
            selectedAnswers: parsed.selectedAnswers,
            submittedAt: parsed.submittedAt,
          };
        } catch {
          return null;
        }
      })
      .filter((entry) => entry !== null);

    if (entries.length === 0) {
      return;
    }

    void fetch("/api/me/submissions/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        submissions: entries,
      }),
    }).then((response) => {
      if (!response.ok) {
        return;
      }

      window.dispatchEvent(new CustomEvent("essentials:submission-saved"));
    });
  }, [enabled]);

  return null;
}
