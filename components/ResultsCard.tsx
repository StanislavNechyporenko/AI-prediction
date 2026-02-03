import type { NormalizedResponse } from "@/lib/types";
import { formatPercentage } from "@/lib/utils";
import ProbabilityBars from "./ProbabilityBars";
import RawJsonCollapse from "./RawJsonCollapse";

function shareText(result: NormalizedResponse) {
  const lines = result.probabilities
    .slice(0, 3)
    .map((item) => `${item.label}: ${formatPercentage(item.value)}`)
    .join(" | ");
  const summaryLine = result.summary.split(". ").slice(0, 2).join(". ");
  return `OddsPulse update: ${lines}. ${summaryLine} ⚡️ (Not financial advice)`;
}

export default function ResultsCard({
  result,
  onReanalyze,
  onCopy
}: {
  result: NormalizedResponse;
  onReanalyze: () => void;
  onCopy: (text: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Latest analysis
          </p>
          <h2 className="text-xl font-semibold">Model-estimated odds</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReanalyze}
            className="rounded-full border border-black px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black transition hover:bg-black hover:text-white"
          >
            Re-analyze
          </button>
          <button
            type="button"
            onClick={() => onCopy(shareText(result))}
            className="rounded-full bg-brandOrange px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black transition hover:bg-black hover:text-white"
          >
            Copy share text
          </button>
        </div>
      </div>

      <div className="mt-5">
        <ProbabilityBars items={result.probabilities} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Summary
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            {result.summary
              .split(/\n|\r|•|- /)
              .map((line) => line.trim())
              .filter(Boolean)
              .slice(0, 6)
              .map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brandOrange" />
                  <span>{line}</span>
                </li>
              ))}
          </ul>
          {result.confidenceNote ? (
            <p className="mt-4 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700">
              Confidence note: {result.confidenceNote}
            </p>
          ) : null}
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Catalysts
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.catalysts.length ? (
                result.catalysts.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-black/10 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-sm text-neutral-500">No catalysts shared.</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              What could flip this
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              {result.flipSignals.length ? (
                result.flipSignals.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-black" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-neutral-500">No flip signals shared.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <RawJsonCollapse raw={result.raw} />
      </div>
    </div>
  );
}
