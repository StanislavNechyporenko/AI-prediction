"use client";

import { useEffect, useMemo, useState } from "react";
import AnalyzerForm, { AnalyzerFormValues } from "@/components/AnalyzerForm";
import HistoryPanel from "@/components/HistoryPanel";
import MouseTrail from "@/components/MouseTrail";
import ResultsCard from "@/components/ResultsCard";
import { DEFAULT_PROMPT, isValidUrl } from "@/lib/utils";
import { clearHistory, loadHistory, saveHistory } from "@/lib/storage";
import type { HistoryEntry, NormalizedResponse } from "@/lib/types";

const initialForm: AnalyzerFormValues = {
  link: "",
  mode: "expert",
  onlyResult: false,
  customPrompt: DEFAULT_PROMPT
};

export default function HomePage() {
  const [formValues, setFormValues] = useState<AnalyzerFormValues>(initialForm);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<NormalizedResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const canAnalyze = useMemo(
    () => isValidUrl(formValues.link),
    [formValues.link]
  );

  const handleSubmit = async () => {
    setErrorMessage(null);
    setCopied(false);
    if (!canAnalyze) {
      setErrorMessage("Please enter a valid prediction market URL.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link: formValues.link,
          mode: formValues.mode,
          onlyResult: formValues.onlyResult,
          customPrompt: formValues.customPrompt
        })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Request failed.");
      }

      const data = (await response.json()) as NormalizedResponse;
      setResult(data);

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        request: {
          link: formValues.link,
          mode: formValues.mode,
          onlyResult: formValues.onlyResult,
          customPrompt: formValues.customPrompt
        },
        response: data
      };
      setHistory((prev) => [entry, ...prev].slice(0, 10));
      setActiveId(entry.id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (entry: HistoryEntry) => {
    setResult(entry.response);
    setFormValues({
      link: entry.request.link,
      mode: entry.request.mode,
      onlyResult: entry.request.onlyResult,
      customPrompt: entry.request.customPrompt
    });
    setActiveId(entry.id);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setActiveId(null);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "odds-pulse-history.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="relative">
      <MouseTrail />
      <section
        className="bg-brandOrange px-6 py-16 text-black"
        data-trail="dark"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/70">
            OddsPulse
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Fast, clean prediction-event analysis powered by OpenAI.
          </h1>
          <p className="max-w-2xl text-base text-black/80 md:text-lg">
            Paste any prediction market event link, surface model-estimated
            probabilities, catalysts, and flip signals, then share the readout in
            seconds.
          </p>
        </div>
      </section>

      <section className="px-6 py-12" data-trail="light">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <AnalyzerForm
              values={formValues}
              onChange={setFormValues}
              onSubmit={handleSubmit}
              loading={loading}
              errorMessage={errorMessage}
            />
            {loading ? (
              <div className="animate-pulse rounded-3xl border border-neutral-200 bg-white p-6">
                <div className="h-4 w-32 rounded bg-neutral-200" />
                <div className="mt-4 h-3 w-full rounded bg-neutral-200" />
                <div className="mt-2 h-3 w-5/6 rounded bg-neutral-200" />
                <div className="mt-6 h-32 w-full rounded bg-neutral-200" />
              </div>
            ) : result ? (
              <ResultsCard
                result={result}
                onReanalyze={handleSubmit}
                onCopy={handleCopy}
              />
            ) : (
              <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/70 p-8 text-center text-sm text-neutral-500">
                Paste a prediction market link and click Analyze to see the
                model readout.
              </div>
            )}
            {copied ? (
              <p className="text-sm font-semibold text-brandOrange">
                Share text copied to clipboard.
              </p>
            ) : null}
          </div>
          <HistoryPanel
            history={history}
            activeId={activeId}
            onSelect={handleSelectHistory}
            onClear={handleClearHistory}
            onExport={handleExport}
          />
        </div>
      </section>

      <section className="bg-black px-6 py-10 text-white" data-trail="dark">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-white/70">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
            OddsPulse
          </p>
          <p>
            Built for fast decision-making. Customize prompts in the analyzer
            card, or update the theme in <code>tailwind.config.ts</code>.
          </p>
        </div>
      </section>
    </main>
  );
}
