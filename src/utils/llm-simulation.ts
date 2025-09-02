// Utility functions for simulating LLM operations

// Simple hash function for deterministic token IDs
export function hashToken(token: string): number {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 5000; // Map to vocabulary size
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
    // Seeded pseudo-random number generator
    const x = Math.sin(seed * (i + 1)) * 10000;
    embedding.push((x - Math.floor(x)) * 2 - 1); // Map to [-1, 1]
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

// Simple toy attention mechanism
export function computeAttention(
  embeddings: number[][],
  dimensions: number = 16
): { scores: number[][], weights: number[][] } {
  const seqLength = embeddings.length;
  const scores: number[][] = [];
  const weights: number[][] = [];
  
  // Generate simple Q, K, V matrices (deterministic)
  const Q = embeddings.map(emb => emb.slice(0, dimensions));
  const K = embeddings.map(emb => emb.slice(0, dimensions));
  
  // Compute attention scores
  for (let i = 0; i < seqLength; i++) {
    scores[i] = [];
    weights[i] = [];
    
    for (let j = 0; j < seqLength; j++) {
      // Dot product attention
      let score = 0;
      for (let k = 0; k < dimensions; k++) {
        score += Q[i][k] * K[j][k];
      }
      score = score / Math.sqrt(dimensions); // Scale
      
      // Apply causal mask (no looking at future tokens)
      if (j > i) {
        score = -Infinity;
      }
      
      scores[i][j] = score;
    }
    
    // Apply softmax to get attention weights
    const maxScore = Math.max(...scores[i].filter(s => s !== -Infinity));
    const expScores = scores[i].map(s => s === -Infinity ? 0 : Math.exp(s - maxScore));
    const sumExp = expScores.reduce((sum, exp) => sum + exp, 0);
    weights[i] = expScores.map(exp => exp / sumExp);
  }
  
  return { scores, weights };
}

// Generate vocabulary for probability distribution
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
    'feliz', 'triste', 'contento', 'enojado', 'cansado', 'enfermo', 'sano', 'fuerte', 'débil', 'rápido'
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
  
  // Predefined logical continuations for demo texts
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
  
  // Check if we have contextual predictions for the current text
  let preferredTokens: string[] = [];
  if (contextText) {
    for (const [context, tokens] of Object.entries(contextualPredictions)) {
      if (contextText.toLowerCase().includes(context.toLowerCase())) {
        preferredTokens = tokens;
        break;
      }
    }
  }
  
  // Generate logits for each token in vocabulary
  vocabulary.forEach((token) => {
    const tokenId = hashToken(token);
    
    // Simple projection to logit (deterministic based on embedding and token)
    let logit = 0;
    for (let i = 0; i < lastEmbedding.length; i++) {
      const weight = Math.sin((tokenId + seed) * (i + 1)) * 0.1;
      logit += lastEmbedding[i] * weight;
    }
    
    // Boost probability for contextually relevant tokens
    if (preferredTokens.includes(token)) {
      logit += 2.0; // Significant boost for contextual relevance
    }
    
    probabilities.push({ token, probability: logit, id: tokenId });
  });
  
  // Apply softmax
  const maxLogit = Math.max(...probabilities.map(p => p.probability));
  const expProbs = probabilities.map(p => ({
    ...p,
    probability: Math.exp(p.probability - maxLogit)
  }));
  
  const sumExp = expProbs.reduce((sum, p) => sum + p.probability, 0);
  const normalizedProbs = expProbs.map(p => ({
    ...p,
    probability: p.probability / sumExp
  }));
  
  // Sort by probability and return top candidates
  return normalizedProbs
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 10);
}

// Sample next token (deterministic for demo purposes)
export function sampleNextToken(probabilities: { token: string; probability: number }[]): string {
  // For demo, just return the most likely token
  return probabilities[0]?.token || '';
}
