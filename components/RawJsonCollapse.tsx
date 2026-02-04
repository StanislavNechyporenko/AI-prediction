export default function RawJsonCollapse({ raw }: { raw: unknown }) {
  return (
    <details className="rounded-xl border border-neutral-200 bg-white p-4">
      <summary className="details-summary cursor-pointer text-sm font-semibold">
        Show raw JSON
      </summary>
      <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-neutral-100 p-3 text-xs text-neutral-700">
        {JSON.stringify(raw, null, 2)}
      </pre>
    </details>
  );
}
