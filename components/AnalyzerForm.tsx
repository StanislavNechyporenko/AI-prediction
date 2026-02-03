import { DEFAULT_PROMPT } from "@/lib/utils";

export type AnalyzerFormValues = {
  link: string;
  mode: "fast" | "expert";
  onlyResult: boolean;
  customPrompt: string;
};

export default function AnalyzerForm({
  values,
  onChange,
  onSubmit,
  loading,
  errorMessage
}: {
  values: AnalyzerFormValues;
  onChange: (values: AnalyzerFormValues) => void;
  onSubmit: () => void;
  loading: boolean;
  errorMessage: string | null;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-card">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold" htmlFor="link">
            Prediction market URL
          </label>
          <input
            id="link"
            type="url"
            placeholder="https://polymarket.com/..."
            value={values.link}
            onChange={(event) =>
              onChange({ ...values, link: event.target.value })
            }
            className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">Mode</p>
            <div className="mt-2 flex rounded-xl border border-neutral-200 bg-neutral-50 p-1">
              {["fast", "expert"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() =>
                    onChange({ ...values, mode: mode as "fast" | "expert" })
                  }
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase transition ${
                    values.mode === mode
                      ? "bg-black text-white"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Output</p>
            <div className="mt-2 flex rounded-xl border border-neutral-200 bg-neutral-50 p-1">
              {[
                { label: "Explain", value: false },
                { label: "Only results", value: true }
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() =>
                    onChange({ ...values, onlyResult: option.value })
                  }
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase transition ${
                    values.onlyResult === option.value
                      ? "bg-black text-white"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="customPrompt">
            Custom prompt
          </label>
          <textarea
            id="customPrompt"
            value={values.customPrompt}
            onChange={(event) =>
              onChange({ ...values, customPrompt: event.target.value })
            }
            rows={4}
            className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
          />
          <button
            type="button"
            onClick={() =>
              onChange({ ...values, customPrompt: DEFAULT_PROMPT })
            }
            className="mt-2 text-xs font-semibold text-neutral-500 hover:text-black"
          >
            Reset to default prompt
          </button>
        </div>
        {errorMessage ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="rounded-xl bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brandOrange disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>
    </div>
  );
}
