'use client';

import { useEffect, useState } from 'react';
import { computeAttention } from '../../utils/llm-simulation';
import { ProcessData } from '../../types';

interface AttentionStepProps {
  processData: ProcessData | null;
  setProcessData: (data: ProcessData) => void;
  isExplanationMode: boolean;
}

export default function AttentionStep({ 
  processData, 
  setProcessData, 
  isExplanationMode 
}: AttentionStepProps) {
  const [hoveredCell, setHoveredCell] = useState<{row: number, col: number} | null>(null);
  
  useEffect(() => {
    if (processData?.combinedEmbeddings && !processData.attentionWeights?.length) {
      const { scores, weights } = computeAttention(processData.combinedEmbeddings);
      
      setProcessData({
        ...processData,
        attentionScores: scores,
        attentionWeights: weights
      });
    }
  }, [processData, setProcessData]);

  const getAttentionOpacity = (weight: number): string => {
    if (weight === 0) return 'opacity-20';
    const intensity = Math.min(weight * 3, 1);
    return `opacity-${Math.round(intensity * 100)}`;
  };

  if (!processData?.attentionWeights?.length) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-xl">Calculando atención...</div>
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h2 className="step-title">
        Paso 3: Self-Attention (Autoatención)
      </h2>
      
      {isExplanationMode && (
        <div className="step-description">
          El mecanismo de <strong>atención</strong> permite al modelo decidir qué tokens 
          son importantes para entender cada palabra. Cada token &ldquo;mira&rdquo; a los 
          tokens anteriores con diferentes pesos de atención.
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold mb-4 text-white">
            Matriz de atención:
          </h3>
          <div className="bg-[#1f1f23] border border-gray-600 rounded-lg p-6">
            <div className="mb-4 text-gray-300">
              Cada fila muestra a qué tokens atiende el token correspondiente.
              Hover sobre una celda para ver los detalles.
            </div>
            
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Header con tokens */}
                <div className="flex mb-2">
                  <div className="w-20"></div>
                  {processData.tokens.map((token, index) => (
                    <div 
                      key={index} 
                      className="w-16 h-16 flex items-center justify-center bg-gray-700 
                               text-white text-sm font-bold border border-gray-600 
                               transform -rotate-45 origin-center"
                    >
                      {token === ' ' ? '␣' : token.slice(0, 4)}
                    </div>
                  ))}
                </div>
                
                {/* Matriz de atención */}
                {processData.attentionWeights.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex mb-1">
                    {/* Label del token */}
                    <div className="w-20 h-16 flex items-center justify-center bg-gray-700 
                                  text-white text-sm font-bold border border-gray-600">
                      {processData.tokens[rowIndex] === ' ' ? '␣' : processData.tokens[rowIndex].slice(0, 4)}
                    </div>
                    
                    {/* Celdas de atención */}
                    {row.map((weight, colIndex) => (
                      <div
                        key={colIndex}
                        className={`w-16 h-16 border border-gray-600 cursor-pointer
                                  transition-all duration-200 flex items-center justify-center
                                  text-white text-xs font-bold relative group
                                  ${weight === 0 ? 'bg-gray-800' : 'bg-red-600'} 
                                  ${getAttentionOpacity(weight)}
                                  ${hoveredCell?.row === rowIndex ? 'ring-2 ring-yellow-400' : ''}
                                  ${hoveredCell?.col === colIndex ? 'ring-2 ring-blue-400' : ''}
                                  hover:scale-105 hover:z-10`}
                        onMouseEnter={() => setHoveredCell({row: rowIndex, col: colIndex})}
                        onMouseLeave={() => setHoveredCell(null)}
                        title={`${processData.tokens[rowIndex]} → ${processData.tokens[colIndex]}: ${(weight * 100).toFixed(1)}%`}
                      >
                        {weight > 0 ? (weight * 100).toFixed(0) : '—'}
                        
                        {/* Tooltip detallado */}
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                                      bg-black text-white px-3 py-2 rounded text-sm 
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                      pointer-events-none whitespace-nowrap z-20 border border-gray-500">
                          <div className="font-bold">
                            {processData.tokens[rowIndex]} → {processData.tokens[colIndex]}
                          </div>
                          <div>Peso: {(weight * 100).toFixed(2)}%</div>
                          {weight === 0 && <div className="text-gray-400">Máscara causal</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {hoveredCell && (
          <div className="bg-[#1f1f23] border border-yellow-400 rounded-lg p-6">
            <h4 className="text-xl font-bold mb-3 text-white">
              Detalles de atención seleccionada:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-lg font-semibold text-white mb-2">
                  Token consultante:
                </div>
                <div className="bg-[#2d2d33] border border-gray-500 rounded-lg p-4">
                  <span className="text-xl font-bold text-blue-400">
                    {processData.tokens[hoveredCell.row] === ' ' ? '␣' : processData.tokens[hoveredCell.row]}
                  </span>
                  <span className="text-gray-400 ml-2">
                    (posición {hoveredCell.row})
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-lg font-semibold text-white mb-2">
                  Token atendido:
                </div>
                <div className="bg-[#2d2d33] border border-gray-500 rounded-lg p-4">
                  <span className="text-xl font-bold text-red-400">
                    {processData.tokens[hoveredCell.col] === ' ' ? '␣' : processData.tokens[hoveredCell.col]}
                  </span>
                  <span className="text-gray-400 ml-2">
                    (posición {hoveredCell.col})
                  </span>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="text-lg font-semibold text-white mb-2">
                  Peso de atención:
                </div>
                <div className="bg-[#2d2d33] border border-gray-500 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-white">
                      {(processData.attentionWeights[hoveredCell.row][hoveredCell.col] * 100).toFixed(2)}%
                    </span>
                    <div className="flex-1 bg-gray-600 h-4 rounded-lg overflow-hidden">
                      <div 
                        className="h-full bg-red-500"
                        style={{
                          width: `${Math.min(processData.attentionWeights[hoveredCell.row][hoveredCell.col] * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  {processData.attentionWeights[hoveredCell.row][hoveredCell.col] === 0 && (
                    <div className="text-gray-400 mt-2">
                      ⚠️ Bloqueado por máscara causal (no puede mirar tokens futuros)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {isExplanationMode && (
          <div className="bg-[#1f1f23] border border-gray-600 rounded-lg p-6">
            <h4 className="text-xl font-bold mb-4 text-white">
              🔍 ¿Cómo funciona la atención?
            </h4>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong>Consulta:</strong> Cada token (fila) pregunta qué otros tokens 
                son relevantes para entenderlo mejor.
              </p>
              <p>
                <strong>Atención:</strong> Los números muestran cuánta importancia se 
                da a cada token anterior (columnas). 100% = máxima atención.
              </p>
              <p>
                <strong>Máscara causal:</strong> Los tokens no pueden &ldquo;mirar al futuro&rdquo; 
                (área gris), solo a tokens anteriores o a sí mismos.
              </p>
              <p>
                <strong>Colores:</strong> Rojo más intenso = mayor atención. 
                Gris = prohibido por la máscara causal.
              </p>
            </div>
          </div>
        )}

        <div className="bg-[#0d1f0d] border border-green-600 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-green-400 text-2xl">✓</div>
            <div>
              <div className="text-green-400 font-bold text-lg">Atención calculada</div>
              <div className="text-green-300">
                Matriz de atención {processData.tokens.length}×{processData.tokens.length} generada • 
                Máscara causal aplicada • 
                Listo para calcular probabilidades
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
