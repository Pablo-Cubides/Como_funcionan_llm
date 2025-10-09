import { tokenize } from '../../utils/llm-simulation';

describe('tokenize', () => {
  it('should split simple spanish sentence into tokens', () => {
    const text = 'Los pájaros vuelan, porque tienen alas.';
    const tokens = tokenize(text);
    expect(tokens).toContain('los');
    expect(tokens).toContain('pájaros');
    expect(tokens).toContain('vuelan');
    expect(tokens).toContain('porque');
    expect(tokens).toContain('tienen');
    expect(tokens).toContain('alas');
  });
});
