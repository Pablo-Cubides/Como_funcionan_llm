import { sampleWithTemperature, sampleNextToken, computeProbabilities, generateEmbedding, generateVocabulary } from '../llm-simulation';

describe('sampling', () => {
  it('sampleWithTemperature returns token from vocabulary', () => {
    const vocab = generateVocabulary().slice(0, 10);
    const emb = generateEmbedding(5, 8);
    const probs = computeProbabilities(emb, vocab);
    const token = sampleWithTemperature(probs, 1.0);
    expect(vocab).toContain(token);
  });

  it('sampleNextToken greedy returns top token', () => {
    const vocab = ['a','b','c','d'];
    const emb = generateEmbedding(7, 8);
    const probs = computeProbabilities(emb, vocab);
    const top = probs[0].token;
    const pick = sampleNextToken(probs, 'greedy');
    expect(pick).toBe(top);
  });
});
