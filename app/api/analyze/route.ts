import { NextResponse } from "next/server";
import { callMinara, normalizeMinaraResponse } from "@/lib/minara";
import { callOpenAI, normalizeOpenAIResponse } from "@/lib/openai";
import { isValidUrl } from "@/lib/utils";
import type { AnalyzeRequest } from "@/lib/types";

export const runtime = "nodejs";

function asErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AnalyzeRequest>;
  const link = body.link?.trim();
  if (!link || !isValidUrl(link)) {
    return NextResponse.json({ error: "Please provide a valid URL." }, { status: 400 });
  }

  const provider =
    body.provider === "openai" || body.provider === "minara"
      ? body.provider
      : process.env.OPENAI_API_KEY
        ? "openai"
        : "minara";
  const mode = body.mode === "fast" ? "fast" : "expert";
  const onlyResult = Boolean(body.onlyResult);
  const customPrompt = body.customPrompt?.trim() ?? "";

  const payload: AnalyzeRequest = {
    link,
    provider,
    mode,
    onlyResult,
    customPrompt
  };

  if (provider === "openai" && !process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 }
    );
  }
  if (provider === "minara" && !process.env.MINARA_API_KEY) {
    return NextResponse.json(
      { error: "MINARA_API_KEY is not configured." },
      { status: 500 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    if (provider === "openai") {
      const raw = await callOpenAI(payload, controller.signal);
      const normalized = normalizeOpenAIResponse(raw, payload);
      return NextResponse.json(normalized);
    }
    const raw = await callMinara(payload, controller.signal);
    const normalized = normalizeMinaraResponse(raw, payload);
    return NextResponse.json(normalized);
  } catch (error) {
    return NextResponse.json(
      { error: asErrorMessage(error) },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
