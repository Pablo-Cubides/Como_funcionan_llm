import { generateEmbedding, computeProbabilities } from '../../utils/llm-simulation';

describe('computeProbabilities', () => {
  it('should return normalized probabilities that sum to ~1', () => {
    const emb = generateEmbedding(10, 16);
    const vocab = ['a', 'b', 'c', 'd', 'e'];
    const probs = computeProbabilities(emb, vocab);
    const sum = probs.reduce((s, p) => s + p.probability, 0);
    expect(sum).toBeGreaterThan(0.9999);
    expect(sum).toBeLessThan(1.0001);
  });

  it('should return top tokens sorted by probability', () => {
    const emb = generateEmbedding(11, 16);
    const vocab = ['el', 'la', 'de', 'que', 'y'];
    const probs = computeProbabilities(emb, vocab);
    for (let i = 1; i < probs.length; i++) {
      expect(probs[i-1].probability).toBeGreaterThanOrEqual(probs[i].probability);
    }
  });
});
