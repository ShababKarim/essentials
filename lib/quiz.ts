export const QUIZ_CATEGORIES = ["fiqh", "aqeedah", "seerah", "akhlaq"] as const;

export type QuizCategory = (typeof QUIZ_CATEGORIES)[number];

export type QuizQuestion = {
  id: string;
  prompt: string;
  topic: QuizCategory;
  choices: string[];
  correctChoiceIndex: number;
};

export function isQuizCategory(value: string): value is QuizCategory {
  return (QUIZ_CATEGORIES as readonly string[]).includes(value);
}

export function formatCategoryLabel(category: QuizCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
