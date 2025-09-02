'use client';

import { useEffect } from 'react';
import { generateEmbedding, generatePositionalEncoding, addVectors } from '../../utils/llm-simulation';
import { ProcessData } from '../../types';

interface EmbeddingStepProps {
  processData: ProcessData | null;
  setProcessData: (data: ProcessData) => void;
  isExplanationMode: boolean;
}

export default function EmbeddingStep({ 
  processData, 
  setProcessData, 
  isExplanationMode 
}: EmbeddingStepProps) {
  
  useEffect(() => {
    if (processData?.tokenIds && !processData.embeddings?.length) {
      const embeddings = processData.tokenIds.map(id => generateEmbedding(id, 16));
      const positionalEncodings = processData.tokens.map((_, index) => 
        generatePositionalEncoding(index, 16)
      );
      const combinedEmbeddings = embeddings.map((emb, index) => 
        addVectors(emb, positionalEncodings[index])
      );
      
      setProcessData({
        ...processData,
        embeddings,
        positionalEncodings,
        combinedEmbeddings
      });
    }
  }, [processData, setProcessData]);

  const getValueColor = (value: number): string => {
    if (value > 0.5) return 'bg-red-600';
    if (value > 0) return 'bg-red-400';
    if (value > -0.5) return 'bg-blue-400';
    return 'bg-blue-600';
  };

  const formatValue = (value: number): string => {
    return value.toFixed(3);
  };

  if (!processData?.embeddings?.length) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-xl">Generando embeddings...</div>
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h2 className="step-title">
        Paso 2: Vectores + Posición
      </h2>
      
      {isExplanationMode && (
        <div className="step-description">
          Cada token se convierte en un <strong>vector de números</strong> (embedding) que 
          representa su significado. Además, se añade información de <strong>posición</strong> 
          para que el modelo sepa dónde está cada palabra.
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold mb-4 text-white">
            Embeddings de tokens:
          </h3>
          <div className="space-y-4">
            {processData.tokens.map((token, tokenIndex) => (
              <div key={tokenIndex} className="bg-[#1f1f23] border border-gray-600 rounded-lg p-4">
                <div className="mb-3">
                  <span className="text-lg font-bold text-white mr-3">
                    Token {tokenIndex}: {token === ' ' ? '␣' : token}
                  </span>
                  <span className="text-gray-400">
                    (ID: {processData.tokenIds[tokenIndex]})
                  </span>
                </div>
                
                <div className="grid grid-cols-8 gap-1">
                  {processData.embeddings[tokenIndex].map((value, dimIndex) => (
                    <div
                      key={dimIndex}
                      className={`h-12 w-full ${getValueColor(value)} 
                                flex items-center justify-center text-white text-xs font-bold
                                hover:scale-105 transition-transform duration-200 cursor-pointer
                                relative group`}
                      title={`Dimensión ${dimIndex}: ${formatValue(value)}`}
                    >
                      {formatValue(value)}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                                    bg-black text-white px-2 py-1 rounded text-xs 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                    pointer-events-none whitespace-nowrap z-10">
                        Dim {dimIndex}: {formatValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-4 text-white">
            Codificación posicional:
          </h3>
          <div className="bg-[#1f1f23] border border-gray-600 rounded-lg p-6">
            <div className="mb-4 text-gray-300">
              Ondas sinusoidales que indican la posición de cada token:
            </div>
            
            <div className="space-y-3">
              {processData.positionalEncodings.map((encoding, position) => (
                <div key={position} className="flex items-center gap-4">
                  <div className="w-20 text-white font-bold">
                    Pos {position}:
                  </div>
                  <div className="grid grid-cols-8 gap-1 flex-1">
                    {encoding.map((value, dimIndex) => (
                      <div
                        key={dimIndex}
                        className={`h-8 ${getValueColor(value)} 
                                  flex items-center justify-center text-white text-xs
                                  hover:scale-105 transition-transform duration-200`}
                        title={`Posición ${position}, Dim ${dimIndex}: ${formatValue(value)}`}
                      >
                        {formatValue(value)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-4 text-white">
            Vectores finales (Embedding + Posición):
          </h3>
          <div className="space-y-4">
            {processData.tokens.map((token, tokenIndex) => (
              <div key={tokenIndex} className="bg-[#1f1f23] border border-gray-600 rounded-lg p-4">
                <div className="mb-3">
                  <span className="text-lg font-bold text-white mr-3">
                    {token === ' ' ? '␣' : token}
                  </span>
                  <span className="text-gray-400">
                    (Embedding + Posición {tokenIndex})
                  </span>
                </div>
                
                <div className="grid grid-cols-8 gap-1">
                  {processData.combinedEmbeddings[tokenIndex].map((value, dimIndex) => (
                    <div
                      key={dimIndex}
                      className={`h-12 w-full ${getValueColor(value)} 
                                flex items-center justify-center text-white text-xs font-bold
                                hover:scale-105 transition-transform duration-200 cursor-pointer
                                relative group border-2 border-yellow-400`}
                      title={`Dimensión ${dimIndex}: ${formatValue(value)}`}
                    >
                      {formatValue(value)}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                                    bg-black text-white px-2 py-1 rounded text-xs 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                    pointer-events-none whitespace-nowrap z-10">
                        Final Dim {dimIndex}: {formatValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isExplanationMode && (
          <div className="bg-[#1f1f23] border border-gray-600 rounded-lg p-6">
            <h4 className="text-xl font-bold mb-4 text-white">
              🔍 ¿Qué representan los vectores?
            </h4>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong>Embedding:</strong> Cada color representa una dimensión del significado 
                del token. Tokens similares tienen vectores similares.
              </p>
              <p>
                <strong>Posición:</strong> Las ondas sinusoidales permiten al modelo distinguir 
                entre la misma palabra en diferentes posiciones.
              </p>
              <p>
                <strong>Combinación:</strong> El vector final (embedding + posición) contiene 
                tanto el significado como la ubicación del token.
              </p>
              <p>
                <strong>Colores:</strong> Rojo = valores positivos, Azul = valores negativos. 
                La intensidad indica la magnitud.
              </p>
            </div>
          </div>
        )}

        <div className="bg-[#0d1f0d] border border-green-600 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-green-400 text-2xl">✓</div>
            <div>
              <div className="text-green-400 font-bold text-lg">Vectorización completada</div>
              <div className="text-green-300">
                {processData.tokens.length} tokens convertidos a vectores • 
                Información posicional añadida • 
                Listo para el cálculo de atención
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
