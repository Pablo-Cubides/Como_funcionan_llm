export interface AttentionHead {
  scores: number[][];
  weights: number[][];
}

export interface ProcessData {
  originalText: string;
  tokens: string[];
  tokenIds: number[];
  embeddings: number[][];
  positionalEncodings: number[][];
  combinedEmbeddings: number[][];
  attentionHeads: AttentionHead[];
  attentionWeights: number[][];
  attentionScores: number[][];
  contextVectors: number[][];
  probabilities: { token: string; probability: number; id: number }[];
  generatedTokens: string[];
  vocabulary: string[];
}

export interface StepProps {
  // The application uses a global ProcessContext; this legacy interface
  // is intentionally empty to avoid accidental prop drilling.
  // Components should use `useProcess()` instead.
}
