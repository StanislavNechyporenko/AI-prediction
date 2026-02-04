import type { AnalyzeRequest, NormalizedResponse, ProbabilityItem } from "./types";
import { clampProbability, normalizeProbabilities } from "./utils";

function extractText(payload: Record<string, unknown>): string | null {
  if (typeof payload.output_text === "string") return payload.output_text;
  const output = payload.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const content = (item as Record<string, unknown>).content;
      if (!Array.isArray(content)) continue;
      for (const chunk of content) {
        if ((chunk as Record<string, unknown>).type === "output_text") {
          const text = (chunk as Record<string, unknown>).text;
          if (typeof text === "string") return text;
        }
      }
    }
  }
  return null;
}

function toProbabilities(value: unknown): ProbabilityItem[] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const label = (item as Record<string, unknown>).label;
        const val = (item as Record<string, unknown>).value;
        if (typeof label !== "string" || typeof val !== "number") return null;
        return { label, value: clampProbability(val) };
      })
      .filter((item): item is ProbabilityItem => item !== null);
  }
  return [];
}

export async function callOpenAI(request: AnalyzeRequest, signal?: AbortSignal) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
      "Content-Type": "application/json"
    },
    signal,
    body: JSON.stringify({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "You are a prediction-market analyst. Return JSON only with keys: probabilities (array of {label, value 0..1}), summary (string), catalysts (string[]), flipSignals (string[]), confidenceNote (string|null)."
        },
        {
          role: "user",
          content: `Analyze this prediction market event URL: ${request.link}. Mode: ${request.mode}. Only results: ${request.onlyResult}. Prompt: ${request.customPrompt}`
        }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to reach OpenAI API");
  }

  return (await response.json()) as Record<string, unknown>;
}

export function normalizeOpenAIResponse(
  raw: Record<string, unknown>,
  request: AnalyzeRequest
): NormalizedResponse {
  const text = extractText(raw);
  let parsed: Record<string, unknown> | null = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
      parsed = null;
    }
  }

  const probabilities = normalizeProbabilities(
    toProbabilities(parsed?.probabilities)
  );

  const summary =
    (typeof parsed?.summary === "string" && parsed.summary.trim()) ||
    text ||
    "No summary available.";
  const catalysts = Array.isArray(parsed?.catalysts)
    ? parsed?.catalysts.filter((item) => typeof item === "string")
    : [];
  const flipSignals = Array.isArray(parsed?.flipSignals)
    ? parsed?.flipSignals.filter((item) => typeof item === "string")
    : [];
  const confidenceNote =
    typeof parsed?.confidenceNote === "string"
      ? parsed.confidenceNote
      : null;

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
