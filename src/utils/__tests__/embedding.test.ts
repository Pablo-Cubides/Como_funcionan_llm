import { generateEmbedding } from '../../utils/llm-simulation';

describe('generateEmbedding', () => {
  it('should produce deterministic embedding for same tokenId', () => {
    const a = generateEmbedding(123, 8);
    const b = generateEmbedding(123, 8);
    expect(a).toEqual(b);
  });

  it('should produce different embeddings for different tokenId', () => {
    const a = generateEmbedding(123, 8);
    const b = generateEmbedding(124, 8);
    expect(a).not.toEqual(b);
  });
});
