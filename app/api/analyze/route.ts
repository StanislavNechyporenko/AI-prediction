import { NextResponse } from "next/server";
import { callMinara, normalizeMinaraResponse } from "@/lib/minara";
import { isValidUrl } from "@/lib/utils";
import type { AnalyzeRequest } from "@/lib/types";

export const runtime = "nodejs";

function asErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

export async function POST(request: Request) {
  if (!process.env.MINARA_API_KEY) {
    return NextResponse.json(
      { error: "MINARA_API_KEY is not configured." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as Partial<AnalyzeRequest>;
  const link = body.link?.trim();
  if (!link || !isValidUrl(link)) {
    return NextResponse.json({ error: "Please provide a valid URL." }, { status: 400 });
  }

  const mode = body.mode === "fast" ? "fast" : "expert";
  const onlyResult = Boolean(body.onlyResult);
  const customPrompt = body.customPrompt?.trim() ?? "";

  const payload: AnalyzeRequest = {
    link,
    mode,
    onlyResult,
    customPrompt
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
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
