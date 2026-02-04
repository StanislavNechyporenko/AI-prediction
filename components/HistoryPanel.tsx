import type { HistoryEntry } from "@/lib/types";
import { formatPercentage } from "@/lib/utils";

export default function HistoryPanel({
  history,
  activeId,
  onSelect,
  onClear,
  onExport
}: {
  history: HistoryEntry[];
  activeId: string | null;
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
  onExport: () => void;
}) {
  return (
    <aside className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Recent history</h2>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="text-xs font-semibold text-neutral-600 hover:text-black"
            type="button"
          >
            Export
          </button>
          <button
            onClick={onClear}
            className="text-xs font-semibold text-neutral-600 hover:text-black"
            type="button"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {history.length === 0 ? (
          <p className="text-sm text-neutral-500">No analyses yet.</p>
        ) : (
          history.map((entry) => {
            const top = entry.response.probabilities[0];
            return (
              <button
                key={entry.id}
                onClick={() => onSelect(entry)}
                className={`w-full rounded-xl border px-3 py-2 text-left transition hover:border-black/40 hover:bg-neutral-50 ${
                  activeId === entry.id
                    ? "border-black bg-neutral-50"
                    : "border-neutral-200"
                }`}
                type="button"
              >
                <p className="text-xs text-neutral-500">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
                <p className="truncate text-sm font-semibold">{entry.request.link}</p>
                <p className="text-xs text-neutral-600">
                  {top
                    ? `${top.label}: ${formatPercentage(top.value)}`
                    : "No probabilities"}
                </p>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
