import { formatPercentage, normalizeProbabilities } from "@/lib/utils";
import type { ProbabilityItem } from "@/lib/types";

export default function ProbabilityBars({
  items
}: {
  items: ProbabilityItem[];
}) {
  const normalized = normalizeProbabilities(items);

  if (!normalized.length) {
    return (
      <p className="text-sm text-neutral-600">
        No probabilities returned. Check the raw JSON for details.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {normalized.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>{item.label}</span>
            <span>{formatPercentage(item.value)}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-neutral-100">
            <div
              className="h-3 rounded-full bg-brandOrange transition-all duration-700"
              style={{ width: `${Math.round(item.value * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
