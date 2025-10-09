import { AttentionHead, ProcessData } from '../types';

// Simple hash function for deterministic token IDs
export function hashToken(token: string): number {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 10000; // Expanded vocabulary size
}

// Simple tokenizer - splits on whitespace and punctuation
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/(\s+|[.,!?;:()"\-])/)
    .filter(token => token.trim().length > 0);
}

// Generate deterministic embedding vector for a token
export function generateEmbedding(tokenId: number, dimensions: number = 16): number[] {
  const embedding: number[] = [];
  const seed = tokenId;
  
  for (let i = 0; i < dimensions; i++) {
    const x = Math.sin(seed * (i + 1)) * 10000;
    embedding.push((x - Math.floor(x)) * 2 - 1);
  }
  
  return embedding;
}

// Generate positional encoding using sinusoidal functions
export function generatePositionalEncoding(position: number, dimensions: number = 16): number[] {
  const encoding: number[] = [];
  
  for (let i = 0; i < dimensions; i++) {
    if (i % 2 === 0) {
      encoding.push(Math.sin(position / Math.pow(10000, i / dimensions)));
    } else {
      encoding.push(Math.cos(position / Math.pow(10000, (i - 1) / dimensions)));
    }
  }
  
  return encoding;
}

// Add two vectors
export function addVectors(a: number[], b: number[]): number[] {
  return a.map((val, i) => val + b[i]);
}

// Compute a single attention head
function computeAttentionHead(
  embeddings: number[][],
  head_dimensions: number,
  seed: number
): AttentionHead {
  const seqLength = embeddings.length;
  const scores: number[][] = [];
  const weights: number[][] = [];

  // Generate deterministic Q, K matrices for this head
  const Q = embeddings.map(emb => generateEmbedding(hashToken(emb.join('') + `Q${seed}`), head_dimensions));
  const K = embeddings.map(emb => generateEmbedding(hashToken(emb.join('') + `K${seed}`), head_dimensions));

  for (let i = 0; i < seqLength; i++) {
    scores[i] = [];
    for (let j = 0; j < seqLength; j++) {
      let score = 0;
      for (let k = 0; k < head_dimensions; k++) {
        score += Q[i][k] * K[j][k];
      }
      score /= Math.sqrt(head_dimensions);
      if (j > i) {
        score = -Infinity;
      }
      scores[i][j] = score;
    }

    const maxScore = Math.max(...scores[i].filter(s => isFinite(s)));
    const expScores = scores[i].map(s => isFinite(s) ? Math.exp(s - maxScore) : 0);
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    weights[i] = expScores.map(s => sumExp > 0 ? s / sumExp : 0);
  }

  return { scores, weights };
}

// Compute multi-head attention
export function computeMultiHeadAttention(
  embeddings: number[][],
  num_heads: number = 4,
  dimensions: number = 16
): { heads: AttentionHead[], combinedWeights: number[][] } {
  const head_dimensions = dimensions / num_heads;
  const heads: AttentionHead[] = [];

  for (let i = 0; i < num_heads; i++) {
    heads.push(computeAttentionHead(embeddings, head_dimensions, i));
  }

  // Combine weights for visualization (simple average)
  const combinedWeights: number[][] = Array(embeddings.length).fill(0).map(() => Array(embeddings.length).fill(0));
  for (let i = 0; i < embeddings.length; i++) {
    for (let j = 0; j < embeddings.length; j++) {
      let sum = 0;
      for (let h = 0; h < num_heads; h++) {
        sum += heads[h].weights[i][j];
      }
      combinedWeights[i][j] = sum / num_heads;
    }
  }

  return { heads, combinedWeights };
}

// Generate expanded vocabulary
export function generateVocabulary(): string[] {
    const commonWords = [
    'el', 'la', 'de', 'que', 'y', 'es', 'en', 'un', 'se', 'no',
    'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al',
    'una', 'sus', 'del', 'las', 'como', 'pero', 'más', 'muy', 'ya', 'todo',
    'casa', 'vida', 'día', 'agua', 'tiempo', 'año', 'trabajo', 'persona', 'hombre', 'mujer',
    'niño', 'país', 'ciudad', 'mundo', 'lugar', 'momento', 'forma', 'manera', 'parte', 'problema',
    'hacer', 'decir', 'estar', 'tener', 'llegar', 'pasar', 'deber', 'poner', 'parecer', 'quedar',
    'creer', 'hablar', 'llevar', 'dejar', 'seguir', 'encontrar', 'llamar', 'venir', 'pensar', 'salir',
    'volver', 'tomar', 'conocer', 'vivir', 'sentir', 'tratar', 'mirar', 'contar', 'empezar', 'esperar',
    'bueno', 'grande', 'nuevo', 'primer', 'último', 'largo', 'pequeño', 'mismo', 'mejor', 'mayor',
    'propio', 'general', 'público', 'cierto', 'poco', 'mucho', 'tanto', 'otro', 'todo', 'cada',
    'bien', 'también', 'aquí', 'donde', 'cuando', 'como', 'tanto', 'mientras', 'según', 'entre',
    'sin', 'sobre', 'hasta', 'desde', 'durante', 'contra', 'hacia', 'mediante', 'excepto', 'salvo',
    'hermano', 'hermana', 'padre', 'madre', 'hijo', 'hija', 'amigo', 'amiga', 'familia', 'gente',
    'escuela', 'universidad', 'colegio', 'libro', 'mesa', 'silla', 'puerta', 'ventana', 'carro', 'coche',
    'perro', 'gato', 'animal', 'árbol', 'flor', 'montaña', 'río', 'mar', 'cielo', 'sol',
    'luna', 'estrella', 'noche', 'mañana', 'tarde', 'hora', 'minuto', 'segundo', 'semana', 'mes',
    'rojo', 'azul', 'verde', 'amarillo', 'negro', 'blanco', 'gris', 'marrón', 'rosa', 'naranja',
    'comer', 'beber', 'dormir', 'caminar', 'correr', 'jugar', 'estudiar', 'trabajar', 'leer', 'escribir',
    'música', 'película', 'juego', 'deporte', 'fútbol', 'tenis', 'natación', 'comida', 'bebida', 'pan',
    'feliz', 'triste', 'contento', 'enojado', 'cansado', 'enfermo', 'sano', 'fuerte', 'débil', 'rápido',
    'inteligencia', 'artificial', 'modelo', 'lenguaje', 'algoritmo', 'red', 'neuronal', 'aprendizaje', 'profundo'
  ];
  return commonWords;
}

// Compute probability distribution over vocabulary
export function computeProbabilities(
  lastEmbedding: number[],
  vocabulary: string[],
  seed: number = 42,
  contextText?: string
): { token: string; probability: number; id: number }[] {
  const probabilities: { token: string; probability: number; id: number }[] = [];
  
  const contextualPredictions: { [key: string]: string[] } = {
    'porque tienen alas': ['fuertes', 'ligeras', 'grandes', 'poderosas', 'hermosas'],
    'tecnología fascinante': ['que', 'para', 'con', 'muy', 'realmente'],
    'hacer resúmenes': ['claros', 'detallados', 'útiles', 'completos', 'efectivos'],
    'cien grados': ['celsius', 'centígrados', 'de', 'y', 'aproximadamente'],
    'sabores únicos': ['y', 'que', 'muy', 'con', 'de'],
    'tus gastos': ['mensuales', 'diarios', 'cuidadosamente', 'y', 'bien'],
    'es nadar': ['porque', 'ya', 'pues', 'dado', 'y'],
    'la playa': ['y', 'para', 'durante', 'con', 'en'],
    'es Barcelona': ['por', 'debido', 'porque', 'ya', 'pues'],
    'su equipo': ['hacia', 'a', 'para', 'con', 'y']
  };
  
  let preferredTokens: string[] = [];
  if (contextText) {
    for (const [context, tokens] of Object.entries(contextualPredictions)) {
      if (contextText.toLowerCase().includes(context.toLowerCase())) {
        preferredTokens = tokens;
        break;
      }
    }
  }
  
  vocabulary.forEach((token) => {
    const tokenId = hashToken(token);
    let logit = 0;
    for (let i = 0; i < lastEmbedding.length; i++) {
      const weight = Math.sin((tokenId + seed) * (i + 1)) * 0.1;
      logit += lastEmbedding[i] * weight;
    }
    if (preferredTokens.includes(token)) {
      logit += 2.0;
    }
    probabilities.push({ token, probability: logit, id: tokenId });
  });
  
  const maxLogit = Math.max(...probabilities.map(p => p.probability));
  const expProbs = probabilities.map(p => ({ ...p, probability: Math.exp(p.probability - maxLogit) }));
  const sumExp = expProbs.reduce((sum, p) => sum + p.probability, 0);
  const normalizedProbs = expProbs.map(p => ({ ...p, probability: sumExp > 0 ? p.probability / sumExp : 1 / expProbs.length }));

  // Sort by probability and return top candidates
  const top = normalizedProbs.sort((a, b) => b.probability - a.probability).slice(0, 10);
  return top;
}

// Sampling helpers
export function sampleWithTemperature(
  probabilities: { token: string; probability: number; id?: number }[],
  temperature: number = 1.0
): string {
  if (!probabilities || probabilities.length === 0) return '';
  if (temperature <= 0) temperature = 1e-6;

  // Use probabilities as weights; apply temperature by exponentiation
  const adjusted = probabilities.map(p => ({ ...p, score: Math.pow(p.probability, 1 / temperature) }));
  const sum = adjusted.reduce((s, a) => s + a.score, 0);
  if (sum <= 0) return probabilities[0].token;

  let r = Math.random() * sum;
  for (const a of adjusted) {
    r -= a.score;
    if (r <= 0) return a.token;
  }
  return adjusted[adjusted.length - 1].token;
}

export function sampleNextToken(
  probabilities: { token: string; probability: number; id?: number }[],
  strategyOrTemp: 'greedy' | 'random' | 'top-k' | number = 'greedy',
  k: number = 5
): string {
  if (!probabilities || probabilities.length === 0) return '';

  if (typeof strategyOrTemp === 'number') {
    return sampleWithTemperature(probabilities, strategyOrTemp);
  }

  switch (strategyOrTemp) {
    case 'random': {
      const sum = probabilities.reduce((s, p) => s + p.probability, 0);
      let r = Math.random() * sum;
      for (const p of probabilities) {
        r -= p.probability;
        if (r <= 0) return p.token;
      }
      return probabilities[probabilities.length - 1].token;
    }
    case 'top-k': {
      const topK = probabilities.slice(0, k);
      const sum = topK.reduce((s, p) => s + p.probability, 0);
      let r = Math.random() * sum;
      for (const p of topK) {
        r -= p.probability;
        if (r <= 0) return p.token;
      }
      return topK[topK.length - 1].token;
    }
    case 'greedy':
    default:
      return probabilities[0].token;
  }
}

export function runLLMStep(processData: ProcessData, text: string): ProcessData {
    const newTokens = tokenize(text);
    const newTokenIds = newTokens.map(token => hashToken(token));
    const embeddings = newTokenIds.map(id => generateEmbedding(id, 16));
    const positionalEncodings = newTokens.map((_, index) => generatePositionalEncoding(index, 16));
    const combinedEmbeddings = embeddings.map((emb, index) => addVectors(emb, positionalEncodings[index]));
    const { heads, combinedWeights } = computeMultiHeadAttention(combinedEmbeddings);
    const lastEmbedding = combinedEmbeddings[combinedEmbeddings.length - 1];
    const newProbabilities = computeProbabilities(lastEmbedding, processData.vocabulary, 42, text);

    return {
        ...processData,
        originalText: text,
        tokens: newTokens,
        tokenIds: newTokenIds,
        embeddings,
        positionalEncodings,
        combinedEmbeddings,
        attentionHeads: heads,
        attentionWeights: combinedWeights,
        probabilities: newProbabilities,
    };
}
