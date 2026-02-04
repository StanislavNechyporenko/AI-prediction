# OddsPulse

OddsPulse is a fast, clean prediction-market analyzer powered by the Minara Agent API. Paste a public event URL, run analysis, and get model-estimated probabilities, catalysts, flip signals, and share-ready summaries.

## Getting started

```bash
npm install
```

Create a `.env.local` file:

```bash
MINARA_API_KEY=your_api_key_here
OPENAI_API_KEY=your_openai_key_here
```

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Project structure

- `app/` – Next.js App Router pages and API route handler.
- `components/` – UI building blocks (form, results, history, mouse trail).
- `lib/` – Minara API integration, parsing, storage helpers, and shared types.

## Parsing notes

Minara/OpenAI responses can vary. The API handler normalizes responses by:

- Inspecting known probability fields (`probabilities`, `outcomes`, or key/value objects).
- Extracting summary, catalysts, flip signals, and confidence from multiple possible fields.
- Returning the raw JSON so you can inspect if a field is missing.

The analyzer lets you switch between Minara and OpenAI from the Provider toggle.

Update `lib/minara.ts` if you want to extend parsing rules.

## Styling notes

- Theme colors live in `tailwind.config.ts` under `colors`.
- Global styles live in `app/globals.css`.
- The mouse trail uses `data-trail="dark"` or `data-trail="light"` on sections to switch colors.

## History

History is stored in `localStorage` (latest 10 items). Use the history panel to re-open or export prior analyses.
