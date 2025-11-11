import React, { useState, useEffect } from 'react';
import './ExploraModeloEmbed.css';

export interface ExploraModeloEmbedProps {
  width?: string;
  height?: string;
  className?: string;
  onStepChange?: (step: number) => void;
}

const ExploraModeloEmbed: React.FC<ExploraModeloEmbedProps> = ({
  width = '100%',
  height = '600px',
  className = '',
  onStepChange
}) => {
  // Simplified version of the LLM simulation utilities
  const tokenize = (text: string): string[] => {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  };

  const generateEmbedding = (tokenId: number, dimensions: number = 8): number[] => {
    const embedding: number[] = [];
    for (let i = 0; i < dimensions; i++) {
      const hash = (tokenId * 31 + i * 17) % 1000;
      embedding.push((hash / 1000) * 2 - 1); // Normalize to [-1, 1]
    }
    return embedding;
  };

  const generatePositionalEncoding = (position: number, dimensions: number = 8): number[] => {
    const encoding: number[] = [];
    for (let i = 0; i < dimensions; i++) {
      const angle = position / Math.pow(10000, (2 * i) / dimensions);
      encoding.push(i % 2 === 0 ? Math.sin(angle) : Math.cos(angle));
    }
    return encoding;
  };

  const addVectors = (a: number[], b: number[]): number[] => {
    return a.map((val, i) => val + (b[i] || 0));
  };

  const computeAttention = (query: number[], keys: number[][], values: number[][]): number[] => {
    const scores = keys.map(key => {
      let score = 0;
      for (let i = 0; i < query.length; i++) {
        score += query[i] * key[i];
      }
      return score;
    });

    const maxScore = Math.max(...scores);
    const expScores = scores.map(score => Math.exp(score - maxScore));
    const sumExpScores = expScores.reduce((a, b) => a + b, 0);
    const weights = expScores.map(score => score / sumExpScores);

    let result = new Array(values[0].length).fill(0);
    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < values[i].length; j++) {
        result[j] += weights[i] * values[i][j];
      }
    }

    return result;
  };
  const [currentStep, setCurrentStep] = useState(0);
  const [inputText, setInputText] = useState('');
  const [tokens, setTokens] = useState<string[]>([]);
  const [embeddings, setEmbeddings] = useState<number[][]>([]);
  const [attention, setAttention] = useState<number[][]>([]);
  const [probabilities, setProbabilities] = useState<{token: string, prob: number}[]>([]);
  const [generatedText, setGeneratedText] = useState('');

  const steps = [
    { id: 0, label: 'Entrada', icon: '✏️' },
    { id: 1, label: 'Tokenización', icon: '🔤' },
    { id: 2, label: 'Embeddings', icon: '📊' },
    { id: 3, label: 'Atención', icon: '🎯' },
    { id: 4, label: 'Probabilidades', icon: '📈' },
    { id: 5, label: 'Generación', icon: '✨' }
  ];

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    onStepChange?.(step);
  };

  const processText = () => {
    if (!inputText.trim()) return;

    // Step 1: Tokenization
    const tokenList = tokenize(inputText);
    setTokens(tokenList);

    // Step 2: Embeddings
    const tokenEmbeddings = tokenList.map((token, index) => {
      const tokenId = token.split('').reduce((hash, char) => {
        return ((hash << 5) - hash) + char.charCodeAt(0);
      }, 0) >>> 0; // Simple hash

      const embedding = generateEmbedding(tokenId % 1000, 8);
      const positional = generatePositionalEncoding(index, 8);
      return addVectors(embedding, positional);
    });
    setEmbeddings(tokenEmbeddings);

    // Step 3: Attention (simplified)
    if (tokenEmbeddings.length > 0) {
      const attentionMatrix = tokenEmbeddings.map((query, i) => {
        const keys = tokenEmbeddings;
        const values = tokenEmbeddings;
        return computeAttention(query, keys, values);
      });
      setAttention(attentionMatrix);
    }

    // Step 4: Probabilities (simplified vocabulary)
    const vocab = ['el', 'la', 'los', 'las', 'de', 'del', 'y', 'a', 'en', 'que', 'es', 'un', 'una', 'con', 'por', 'para', 'como', 'más', 'pero', 'o'];
    const probs = vocab.map(token => ({
      token,
      prob: Math.random() * 0.3 + 0.1 // Random probabilities for demo
    })).sort((a, b) => b.prob - a.prob);
    setProbabilities(probs);

    // Step 5: Generation
    const nextToken = probs[0].token;
    setGeneratedText(inputText + ' ' + nextToken);

    handleStepChange(1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="embed-step">
            <h3>Introduce un texto para analizar</h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe una frase..."
              className="embed-textarea"
            />
            <button onClick={processText} className="embed-button">
              Procesar Texto
            </button>
          </div>
        );

      case 1:
        return (
          <div className="embed-step">
            <h3>Tokenización</h3>
            <div className="embed-tokens">
              {tokens.map((token, index) => (
                <span key={index} className="embed-token">{token}</span>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="embed-step">
            <h3>Embeddings</h3>
            <div className="embed-embeddings">
              {embeddings.slice(0, 3).map((embedding, index) => (
                <div key={index} className="embed-embedding">
                  <span>{tokens[index]}</span>
                  <div className="embed-vector">
                    {embedding.slice(0, 4).map((val, i) => (
                      <div
                        key={i}
                        className="embed-vector-bar"
                        style={{
                          height: `${Math.abs(val) * 30 + 10}px`,
                          backgroundColor: val > 0 ? '#10b981' : '#ef4444'
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="embed-step">
            <h3>Self-Attention</h3>
            <div className="embed-attention">
              {attention.slice(0, 3).map((row, i) => (
                <div key={i} className="embed-attention-row">
                  {row.slice(0, 3).map((weight, j) => (
                    <div
                      key={j}
                      className="embed-attention-cell"
                      style={{
                        backgroundColor: `rgba(99, 102, 241, ${weight * 0.5})`,
                        opacity: weight
                      }}
                    >
                      {(weight * 100).toFixed(0)}%
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="embed-step">
            <h3>Probabilidades</h3>
            <div className="embed-probabilities">
              {probabilities.slice(0, 5).map((item, index) => (
                <div key={index} className="embed-prob-item">
                  <span className="embed-prob-token">{item.token}</span>
                  <div className="embed-prob-bar">
                    <div
                      className="embed-prob-fill"
                      style={{ width: `${item.prob * 100}%` }}
                    />
                  </div>
                  <span className="embed-prob-value">{(item.prob * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="embed-step">
            <h3>Texto Generado</h3>
            <div className="embed-generated">
              <p><strong>Original:</strong> {inputText}</p>
              <p><strong>Generado:</strong> {generatedText}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`exploramodelo-embed ${className}`} style={{ width, height }}>
      <div className="embed-header">
        <h2>🧠 ExploraModelo</h2>
        <p>Aprende cómo funcionan los LLM paso a paso</p>
      </div>

      <div className="embed-stepper">
        {steps.map((step) => (
          <button
            key={step.id}
            className={`embed-step-button ${currentStep === step.id ? 'active' : ''}`}
            onClick={() => handleStepChange(step.id)}
            disabled={step.id > 0 && tokens.length === 0}
          >
            <span className="embed-step-icon">{step.icon}</span>
            <span className="embed-step-label">{step.label}</span>
          </button>
        ))}
      </div>

      <div className="embed-content">
        {renderStepContent()}
      </div>

      <div className="embed-footer">
        <p>ExploraModelo - Educación interactiva sobre LLMs</p>
      </div>
    </div>
  );
};

export default ExploraModeloEmbed;