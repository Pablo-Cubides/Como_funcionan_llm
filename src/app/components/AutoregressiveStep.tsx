'use client';

import { useState } from 'react';
import { sampleNextToken, tokenize, hashToken, generateEmbedding, generatePositionalEncoding, addVectors, computeAttention, computeProbabilities } from '../../utils/llm-simulation';
import { ProcessData } from '../../types';

interface AutoregressiveStepProps {
  processData: ProcessData | null;
  setProcessData: (data: ProcessData) => void;
  isExplanationMode: boolean;
  onRestart: () => void;
}

export default function AutoregressiveStep({ 
  processData, 
  setProcessData, 
  isExplanationMode,
  onRestart
}: AutoregressiveStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<Array<{
    step: number;
    addedToken: string;
    fullText: string;
    probabilities: { token: string; probability: number; id: number }[];
  }>>([]);

  const generateNextToken = async () => {
    if (!processData?.probabilities?.length || isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // Select next token (most probable for demo)
      const nextToken = sampleNextToken(processData.probabilities);
      
      // Create new text with added token
      const newText = processData.originalText + ' ' + nextToken;
      const newTokens = tokenize(newText);
      const newTokenIds = newTokens.map(token => hashToken(token));
      
      // Recalculate embeddings for the extended sequence
      const embeddings = newTokenIds.map(id => generateEmbedding(id, 16));
      const positionalEncodings = newTokens.map((_, index) => 
        generatePositionalEncoding(index, 16)
      );
      const combinedEmbeddings = embeddings.map((emb, index) => 
        addVectors(emb, positionalEncodings[index])
      );
      
      // Recalculate attention
      const { weights } = computeAttention(combinedEmbeddings);
      
      // Calculate new probabilities for next token
      const lastEmbedding = combinedEmbeddings[combinedEmbeddings.length - 1];
      const newProbabilities = computeProbabilities(lastEmbedding, processData.vocabulary, 42, newText);
      
      // Update process data
      const updatedData = {
        ...processData,
        originalText: newText,
        tokens: newTokens,
        tokenIds: newTokenIds,
        embeddings,
        positionalEncodings,
        combinedEmbeddings,
        attentionWeights: weights,
        probabilities: newProbabilities,
        generatedTokens: [...(processData.generatedTokens || []), nextToken]
      };
      
      setProcessData(updatedData);
      
      // Add to generation steps for visualization
      setGenerationSteps(prev => [...prev, {
        step: prev.length + 1,
        addedToken: nextToken,
        fullText: newText,
        probabilities: newProbabilities.slice(0, 5)
      }]);
      
    } catch (error) {
      console.error('Error generating token:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGeneration = () => {
    if (!processData) return;
    
    setGenerationSteps([]);
    // In a full implementation, you would recalculate everything here for the original text
  };

  if (!processData?.probabilities?.length) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-xl">Cargando...</div>
    </div>;
  }

  const maxGenerations = 3;
  const canGenerate = (processData.generatedTokens?.length || 0) < maxGenerations;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h2 className="step-title">
        Paso 5: Bucle autoregresivo
      </h2>
      
      {isExplanationMode && (
        <div className="step-description">
          El modelo repite el proceso: toma el token más probable, lo añade al contexto, 
          y calcula nuevas probabilidades. Este <strong>bucle autoregresivo</strong> es 
          como el modelo genera texto palabra por palabra.
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold mb-4 text-white">
            Texto en construcción:
          </h3>
          <div className="bg-[#1f1f23] border border-gray-600 rounded-lg p-6">
            <div className="flex flex-wrap gap-2 items-center text-xl">
              {processData.tokens.slice(0, processData.tokens.length - (processData.generatedTokens?.length || 0)).map((token, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg"
                >
                  {token === ' ' ? '␣' : token}
                </span>
              ))}
              
              {processData.generatedTokens?.map((token, index) => (
                <span
                  key={`gen-${index}`}
                  className="px-3 py-2 bg-green-600 text-white font-semibold rounded-lg 
                           animate-pulse border-2 border-green-400"
                >
                  {token}
                </span>
              ))}
              
              {canGenerate && (
                <span className="px-3 py-2 bg-yellow-600 text-white font-bold rounded-lg animate-pulse">
                  ?
                </span>
              )}
            </div>
            
            <div className="mt-4 text-gray-300">
              <span className="font-bold text-blue-400">Azul:</span> Texto original • 
              <span className="font-bold text-green-400 ml-4">Verde:</span> Tokens generados • 
              <span className="font-bold text-yellow-400 ml-4">Amarillo:</span> Siguiente predicción
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-4 text-white">
            Controles de generación:
          </h3>
          <div className="flex gap-4 items-center">
            <button
              onClick={generateNextToken}
              disabled={!canGenerate || isGenerating}
              className="navigation-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '🔄 Generando...' : '▶️ Generar siguiente token'}
            </button>
            
            <div className="text-gray-300">
              {processData.generatedTokens?.length || 0} / {maxGenerations} tokens generados
            </div>
            
            {(processData.generatedTokens?.length || 0) > 0 && (
              <button
                onClick={resetGeneration}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
              >
                🔄 Reiniciar
              </button>
            )}
          </div>
        </div>

        {processData.probabilities && (
          <div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              Próximo token más probable:
            </h3>
            <div className="bg-[#1f1f23] border border-gray-600 rounded-lg p-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {processData.probabilities[0]?.token}
                  </div>
                  <div className="text-gray-300">Token candidato</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {(processData.probabilities[0]?.probability * 100 || 0).toFixed(1)}%
                  </div>
                  <div className="text-gray-300">Probabilidad</div>
                </div>
                
                <div className="flex-1">
                  <div className="bg-gray-700 h-6 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-1000"
                      style={{
                        width: `${(processData.probabilities[0]?.probability || 0) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {generationSteps.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              Historial de generación:
            </h3>
            <div className="space-y-4">
              {generationSteps.map((step, index) => (
                <div
                  key={index}
                  className="bg-[#1f1f23] border border-gray-600 rounded-lg p-4"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {step.step}
                    </span>
                    <span className="text-xl font-bold text-white">
                      Token añadido: <span className="text-green-400">{step.addedToken}</span>
                    </span>
                  </div>
                  
                  <div className="text-gray-300 mb-3">
                    Texto resultante: &ldquo;{step.fullText}&rdquo;
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    Próximas opciones: {step.probabilities.map(p => 
                      `${p.token} (${(p.probability * 100).toFixed(1)}%)`
                    ).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!canGenerate && (
          <div className="bg-[#1f1f0d] border border-yellow-600 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-yellow-400 text-2xl">⚠️</div>
              <div>
                <div className="text-yellow-400 font-bold text-lg">Límite alcanzado</div>
                <div className="text-yellow-300">
                  Se han generado {maxGenerations} tokens. En un modelo real, 
                  la generación continuaría hasta encontrar un token de fin o 
                  alcanzar un límite máximo.
                </div>
              </div>
            </div>
          </div>
        )}

        {isExplanationMode && (
          <div className="bg-[#1f1f23] border border-gray-600 rounded-lg p-6">
            <h4 className="text-xl font-bold mb-4 text-white">
              🔍 ¿Cómo funciona la generación autoregresiva?
            </h4>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong>1. Predicción:</strong> El modelo calcula probabilidades para 
                el siguiente token basándose en todo el contexto anterior.
              </p>
              <p>
                <strong>2. Selección:</strong> Se elige un token (aquí usamos el más 
                probable, pero se podrían usar estrategias como muestreo).
              </p>
              <p>
                <strong>3. Actualización:</strong> El token elegido se añade al contexto, 
                y todo el proceso se repite desde el paso de tokenización.
              </p>
              <p>
                <strong>4. Iteración:</strong> Este bucle continúa hasta generar 
                el texto deseado o alcanzar un criterio de parada.
              </p>
            </div>
          </div>
        )}

        <div className="bg-[#0d1f0d] border border-green-600 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-green-400 text-2xl">✓</div>
            <div>
              <div className="text-green-400 font-bold text-lg">Proceso completado</div>
              <div className="text-green-300">
                Has visto todo el pipeline de un modelo de lenguaje: desde tokenización 
                hasta generación autoregresiva. ¡Ya entiendes cómo funcionan los LLMs!
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onRestart}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-lg 
                     transition-colors duration-200 border-2 border-blue-500 hover:border-blue-400"
          >
            🔄 Comenzar nueva explicación
          </button>
          <div className="mt-3 text-gray-400 text-lg">
            Vuelve al inicio para explorar con otro texto
          </div>
        </div>
      </div>
    </div>
  );
}
