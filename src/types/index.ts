export interface ProcessData {
  originalText: string;
  tokens: string[];
  tokenIds: number[];
  embeddings: number[][];
  positionalEncodings: number[][];
  combinedEmbeddings: number[][];
  attentionWeights: number[][];
  attentionScores: number[][];
  contextVectors: number[][];
  probabilities: { token: string; probability: number; id: number }[];
  generatedTokens: string[];
  vocabulary: string[];
}

export interface StepProps {
  processData: ProcessData | null;
  setProcessData: (data: ProcessData) => void;
  isExplanationMode: boolean;
}
