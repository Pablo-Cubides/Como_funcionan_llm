'use client';

import { useEffect } from 'react';
import { computeProbabilities, generateVocabulary } from '../../utils/llm-simulation';
import { ProcessData } from '../../types';

interface ProbabilityStepProps {
  processData: ProcessData | null;
  setProcessData: (data: ProcessData) => void;
  isExplanationMode: boolean;
}

export default function ProbabilityStep({ 
  processData, 
  setProcessData, 
  isExplanationMode 
}: ProbabilityStepProps) {
  
  useEffect(() => {
    if (processData?.combinedEmbeddings && !processData.probabilities?.length) {
      const vocabulary = generateVocabulary();
      const lastEmbedding = processData.combinedEmbeddings[processData.combinedEmbeddings.length - 1];
      const probabilities = computeProbabilities(lastEmbedding, vocabulary, 42, processData.originalText);
      
      setProcessData({
        ...processData,
        vocabulary,
        probabilities
      });
    }
  }, [processData, setProcessData]);

  const getBarColor = (probability: number, index: number): string => {
    if (index === 0) return 'bg-red-600'; // Most likely
    if (index === 1) return 'bg-red-500';
    if (index === 2) return 'bg-red-400';
    return 'bg-red-300';
  };

  const formatProbability = (prob: number): string => {
    return (prob * 100).toFixed(2);
  };

  if (!processData?.probabilities?.length) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-xl">Calculando probabilidades...</div>
    </div>;
  }

  const maxProbability = processData.probabilities[0]?.probability || 0;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h2 className="step-title">
        Paso 4: Probabilidades del siguiente token
      </h2>
      
      {isExplanationMode && (
        <div className="step-description">
          Basándose en el contexto procesado, el modelo calcula las <strong>probabilidades</strong> 
          de cada posible token siguiente. Los tokens más probables aparecen en la parte superior.
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold mb-4 text-white">
            Contexto actual:
          </h3>
          <div className="bg-[#1f1f23] border border-gray-600 rounded-lg p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {processData.tokens.map((token, index) => (
                <span
                  key={index}
                  className={`px-3 py-2 rounded-lg text-white font-semibold
                            ${index === processData.tokens.length - 1 
                              ? 'bg-red-600 ring-2 ring-red-400' 
                              : 'bg-gray-600'}`}
                >
                  {token === ' ' ? '␣' : token}
                </span>
              ))}
              <span className="px-3 py-2 bg-yellow-600 text-white font-bold rounded-lg animate-pulse">
                ?
              </span>
            </div>
            <div className="text-gray-300">
              El modelo predice qué token viene después de: &ldquo;
              <span className="font-bold text-white">
                {processData.originalText}
              </span>
              &rdquo;
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-4 text-white">
            Top 10 tokens más probables:
          </h3>
          
          <div className="space-y-3">
            {processData.probabilities.slice(0, 10).map((item, index) => (
              <div
                key={index}
                className="bg-[#1f1f23] border border-gray-600 rounded-lg p-4 
                         hover:border-gray-500 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  {/* Ranking */}
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {index + 1}
                    </span>
                  </div>
                  
                  {/* Token */}
                  <div className="w-24">
                    <span className="text-xl font-bold text-white">
                      {item.token}
                    </span>
                  </div>
                  
                  {/* Probability bar */}
                  <div className="flex-1 relative">
                    <div className="bg-gray-700 h-8 rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${getBarColor(item.probability, index)} 
                                  transition-all duration-1000 ease-out flex items-center justify-end pr-3`}
                        style={{
                          width: `${(item.probability / maxProbability) * 100}%`
                        }}
                      >
                        <span className="text-white font-bold text-sm">
                          {formatProbability(item.probability)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Token ID */}
                  <div className="w-20 text-right">
                    <span className="text-gray-400 text-sm font-mono">
                      ID: {item.id}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-4 text-white">
            Distribución de probabilidades:
          </h3>
          <div className="bg-[#1f1f23] border border-gray-600 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">
                  {formatProbability(processData.probabilities[0]?.probability || 0)}%
                </div>
                <div className="text-gray-300">Más probable</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {processData.probabilities.slice(0, 3).reduce((sum, item) => sum + item.probability, 0).toFixed(2)}
                </div>
                <div className="text-gray-300">Top 3 acumulado</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {processData.probabilities.slice(0, 10).reduce((sum, item) => sum + item.probability, 0).toFixed(2)}
                </div>
                <div className="text-gray-300">Top 10 acumulado</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {processData.vocabulary.length}
                </div>
                <div className="text-gray-300">Vocabulario total</div>
              </div>
            </div>
            
            <div className="text-center text-gray-300">
              El modelo considera <span className="font-bold text-white">
                {processData.vocabulary.length} tokens posibles
              </span> del vocabulario para la predicción.
            </div>
          </div>
        </div>

        {isExplanationMode && (
          <div className="bg-[#1f1f23] border border-gray-600 rounded-lg p-6">
            <h4 className="text-xl font-bold mb-4 text-white">
              🔍 ¿Cómo se calculan las probabilidades?
            </h4>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong>1. Proyección:</strong> El último vector del contexto se proyecta 
                a un espacio del tamaño del vocabulario (una dimensión por token posible).
              </p>
              <p>
                <strong>2. Logits:</strong> Se obtienen valores &ldquo;crudos&rdquo; (logits) 
                que indican la preferencia del modelo por cada token.
              </p>
              <p>
                <strong>3. Softmax:</strong> Los logits se convierten en probabilidades 
                que suman 100%, favoreciendo los valores más altos.
              </p>
              <p>
                <strong>4. Selección:</strong> En el siguiente paso, el modelo elegirá 
                un token basándose en estas probabilidades.
              </p>
            </div>
          </div>
        )}

        <div className="bg-[#0d1f0d] border border-green-600 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-green-400 text-2xl">✓</div>
            <div>
              <div className="text-green-400 font-bold text-lg">Probabilidades calculadas</div>
              <div className="text-green-300">
                {processData.vocabulary.length} tokens evaluados • 
                Top 10 candidatos identificados • 
                Token más probable: &ldquo;{processData.probabilities[0]?.token}&rdquo; 
                ({formatProbability(processData.probabilities[0]?.probability || 0)}%)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
