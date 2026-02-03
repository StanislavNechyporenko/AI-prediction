import type { ProbabilityItem } from "./types";

export const DEFAULT_PROMPT =
  "Return fair probabilities and short reasoning. Provide key catalysts, and 3 signals that would change the odds in the next 7 days. Be concise.";

export function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function clampProbability(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function normalizeProbabilities(items: ProbabilityItem[]) {
  return [...items]
    .map((item) => ({
      ...item,
      value: clampProbability(item.value)
    }))
    .sort((a, b) => b.value - a.value);
}

export function formatPercentage(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function toBulletLines(text: string) {
  return text
    .split(/\n|\r/)
    .map((line) => line.trim())
    .filter(Boolean);
}
