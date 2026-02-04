export type ProbabilityItem = {
  label: string;
  value: number;
};

export type NormalizedResponse = {
  link: string;
  mode: "fast" | "expert";
  probabilities: ProbabilityItem[];
  summary: string;
  catalysts: string[];
  flipSignals: string[];
  confidenceNote: string | null;
  raw: unknown;
};

export type AnalyzeRequest = {
  link: string;
  mode: "fast" | "expert";
  onlyResult: boolean;
  customPrompt: string;
};

export type HistoryEntry = {
  id: string;
  timestamp: number;
  request: AnalyzeRequest;
  response: NormalizedResponse;
};
