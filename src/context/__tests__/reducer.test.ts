import { describe, it, expect } from 'vitest';
import { appReducer, initialState } from '../ProcessContext';

describe('appReducer COMPUTE_EMBEDDINGS', () => {
  it('computes embeddings and positional encodings and stores them', () => {
    const tokenIds = [1, 2, 3];
    const tokens = ['hola', 'mundo', '!'];

    const startState = {
      ...initialState,
      processData: {
        originalText: 'hola mundo !',
        tokens,
        tokenIds,
        embeddings: [],
        positionalEncodings: [],
        combinedEmbeddings: [],
        attentionHeads: [],
        attentionWeights: [],
        attentionScores: [],
        contextVectors: [],
        probabilities: [],
        generatedTokens: [],
        vocabulary: [],
      },
    };

    const next = appReducer(startState as any, { type: 'COMPUTE_EMBEDDINGS', payload: { tokenIds, tokens } } as any);

    expect(next.processData).toBeTruthy();
    expect(next.processData?.embeddings.length).toBe(3);
    expect(next.processData?.positionalEncodings.length).toBe(3);
    expect(next.processData?.combinedEmbeddings.length).toBe(3);
    // each embedding vector should have 16 dims
    expect(next.processData?.embeddings[0].length).toBe(16);
  });
});

describe('appReducer COMPUTE_ATTENTION and PROBABILITIES', () => {
  it('computes attention heads and combined weights', () => {
  const tokenIds = [1, 2, 3, 4];
    const tokens = ['a', 'b', 'c', 'd'];
    const startState = {
      ...initialState,
      processData: {
        originalText: 'a b c d',
        tokens,
        tokenIds,
          embeddings: tokenIds.map(_id => Array(16).fill(0)),
          positionalEncodings: tokenIds.map(_id => Array(16).fill(0)),
          combinedEmbeddings: tokenIds.map(_id => Array(16).fill(0)),
        attentionHeads: [],
        attentionWeights: [],
        attentionScores: [],
        contextVectors: [],
        probabilities: [],
        generatedTokens: [],
        vocabulary: [],
      },
    };

    const afterAttention = appReducer(startState as any, { type: 'COMPUTE_ATTENTION' } as any);
    expect(afterAttention.processData?.attentionHeads.length).toBeGreaterThan(0);
    expect(afterAttention.processData?.attentionWeights.length).toBeGreaterThan(0);
  });

  it('computes probabilities and vocab when absent', () => {
    const tokenIds = [1, 2];
    const tokens = ['x', 'y'];
    const startState = {
      ...initialState,
      processData: {
        originalText: 'x y',
        tokens,
        tokenIds,
          embeddings: tokenIds.map(_id => Array(16).fill(0)),
          positionalEncodings: tokenIds.map(_id => Array(16).fill(0)),
          combinedEmbeddings: tokenIds.map(_id => Array(16).fill(0)),
        attentionHeads: [],
        attentionWeights: [],
        attentionScores: [],
        contextVectors: [],
        probabilities: [],
        generatedTokens: [],
        vocabulary: [],
      },
    };

    const afterProbs = appReducer(startState as any, { type: 'COMPUTE_PROBABILITIES' } as any);
    expect(afterProbs.processData?.probabilities.length).toBeGreaterThan(0);
    expect(afterProbs.processData?.vocabulary.length).toBeGreaterThan(0);
  });
});
