import type { AnalyzeRequest, NormalizedResponse, ProbabilityItem } from "./types";
import { clampProbability, normalizeProbabilities, toBulletLines } from "./utils";

type MinaraResponse = Record<string, unknown>;

type PossibleProbItem =
  | {
      label?: string;
      outcome?: string;
      name?: string;
      value?: number;
      probability?: number;
      prob?: number;
    }
  | Record<string, unknown>;

function toProbabilityItems(value: unknown): ProbabilityItem[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        const candidate = item as PossibleProbItem;
        const label =
          typeof candidate.label === "string"
            ? candidate.label
            : typeof candidate.outcome === "string"
              ? candidate.outcome
              : typeof candidate.name === "string"
                ? candidate.name
                : undefined;
        const numeric =
          typeof candidate.value === "number"
            ? candidate.value
            : typeof candidate.probability === "number"
              ? candidate.probability
              : typeof candidate.prob === "number"
                ? candidate.prob
                : undefined;
        if (!label || typeof numeric !== "number") return null;
        return { label, value: clampProbability(numeric) };
      })
      .filter((item): item is ProbabilityItem => item !== null);
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => {
        if (typeof val === "number") {
          return { label: key, value: clampProbability(val) };
        }
        if (typeof val === "string" && !Number.isNaN(Number(val))) {
          return { label: key, value: clampProbability(Number(val)) };
        }
        return null;
      })
      .filter((item): item is ProbabilityItem => item !== null);
  }
  return [];
}

function pickString(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    const joined = value.filter((item) => typeof item === "string").join("\n");
    return joined.trim() || null;
  }
  return null;
}

function pickStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return toBulletLines(value);
  }
  return [];
}

function firstNonEmptyArray(...values: unknown[]) {
  for (const value of values) {
    const parsed = pickStringArray(value);
    if (parsed.length) return parsed;
  }
  return [];
}

function findProbabilities(raw: MinaraResponse): ProbabilityItem[] {
  const candidates = [
    raw.probabilities,
    raw.outcomes,
    raw.result && (raw.result as Record<string, unknown>).probabilities,
    raw.data && (raw.data as Record<string, unknown>).probabilities,
    raw.prediction && (raw.prediction as Record<string, unknown>).probabilities
  ];
  for (const candidate of candidates) {
    const parsed = toProbabilityItems(candidate);
    if (parsed.length) return parsed;
  }
  if (typeof raw.yes === "number" || typeof raw.no === "number") {
    const yes = typeof raw.yes === "number" ? raw.yes : 1 - (raw.no as number);
    const no = typeof raw.no === "number" ? raw.no : 1 - (raw.yes as number);
    return [
      { label: "Yes", value: clampProbability(yes) },
      { label: "No", value: clampProbability(no) }
    ];
  }
  return [];
}

export function normalizeMinaraResponse(
  raw: MinaraResponse,
  request: AnalyzeRequest
): NormalizedResponse {
  const probabilities = normalizeProbabilities(findProbabilities(raw));
  const summary =
    pickString(raw.summary) ||
    pickString(raw.reasoning) ||
    pickString(raw.analysis) ||
    pickString((raw.result as Record<string, unknown>)?.summary) ||
    "No summary available.";
  const catalysts = firstNonEmptyArray(
    raw.catalysts,
    raw.keyCatalysts,
    (raw.result as Record<string, unknown>)?.catalysts
  );
  const flipSignals = firstNonEmptyArray(
    raw.flipSignals,
    raw.whatCouldFlip,
    (raw.result as Record<string, unknown>)?.flipSignals
  );
  const confidenceNote =
    pickString(raw.confidence) ||
    pickString(raw.uncertainty) ||
    pickString((raw.result as Record<string, unknown>)?.confidence) ||
    null;

  return {
    link: request.link,
    mode: request.mode,
    probabilities,
    summary,
    catalysts,
    flipSignals,
    confidenceNote,
    raw
  };
}

export async function callMinara(
  request: AnalyzeRequest,
  signal?: AbortSignal
) {
  const response = await fetch(
    "https://api.minara.ai/v1/developer/prediction-market-ask",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MINARA_API_KEY ?? ""}`,
        "Content-Type": "application/json"
      },
      signal,
      body: JSON.stringify({
        link: request.link,
        mode: request.mode,
        only_result: request.onlyResult,
        customPrompt: request.customPrompt
      })
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to reach Minara API");
  }

  return (await response.json()) as MinaraResponse;
}
