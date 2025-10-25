'use client';

import { useEffect, useState } from 'react';
import { useProcess } from '../../context/ProcessContext';

interface EmbeddingStepProps { onNext?: () => void }

export default function EmbeddingStep({ onNext }: EmbeddingStepProps) {
  const { state, dispatch } = useProcess();
  const { processData, isExplanationMode } = state;
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);

  // snapshot tokenIds & tokens for stable dependencies
  // If we have tokenIds but no embeddings yet, ask the reducer to compute them
  useEffect(() => {
    if (processData?.tokenIds?.length && processData?.tokens?.length && !processData.embeddings?.length) {
      dispatch({ type: 'COMPUTE_EMBEDDINGS', payload: { tokenIds: processData.tokenIds, tokens: processData.tokens } });
    }
  }, [processData?.tokenIds, processData?.tokens, processData?.embeddings, dispatch]);

  const getValueColor = (value: number): string => {
    // Keep this helper small; intensity variable removed to satisfy linter
    return value > 0 ? `rgb(239, 68, 68, ${Math.abs(value)})` : `rgb(59, 130, 246, ${Math.abs(value)})`;
  };

  if (!processData?.embeddings?.length) {
    return <div className="p-8 sm:p-12 flex justify-center items-center min-h-[400px]">
      <div className="text-xl text-slate-400">Generando Embeddings...</div>
    </div>;
  }

  return (
    <div className="p-8 sm:p-12 panel">
      <div className="text-center mb-12">
        <h2 className="step-title">Paso 2: Embeddings y Posición</h2>
        {isExplanationMode && (
          <p className="step-description">
            🎨 Imagina que cada palabra es como un juguete que guardamos en una caja especial con <strong>16 cajoncitos numerados</strong>. 
            Cada cajoncito guarda un número que describe algo sobre la palabra (su significado). 
            Además, le ponemos una <strong>etiqueta de posición</strong> para saber en qué lugar de la frase va.
          </p>
        )}
      </div>

      {/* Selector de palabra */}
      <div className="mb-8 bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl border border-slate-700 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-200 mb-1">📚 Selecciona una Palabra</h3>
            <p className="text-sm text-slate-400">Elige qué palabra quieres explorar en detalle</p>
          </div>
          <select 
            value={selectedTokenIndex}
            onChange={(e) => setSelectedTokenIndex(Number(e.target.value))}
            className="bg-slate-800 text-white text-lg font-medium rounded-xl px-5 py-3 border-2 border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all cursor-pointer min-w-[200px]">
            {processData.tokens.map((token, index) => (
              <option key={index} value={index}>
                {index + 1}. &quot;{token === ' ' ? '␣ (espacio)' : token}&quot;
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mostrar solo la palabra seleccionada */}
      <div className="space-y-8">
        {(() => {
          const tokenIndex = selectedTokenIndex;
          const token = processData.tokens[tokenIndex];
          return (
            <div className="p-6 bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl border border-slate-700 shadow-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg">
                  <span className="text-xl font-mono font-bold text-white">&quot;{token === ' ' ? '␣' : token}&quot;</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-600">
                  <span className="text-xs font-semibold text-slate-400">Palabra #{tokenIndex + 1} </span>
                  <span className="text-sm font-mono font-bold text-blue-400">ID:{processData.tokenIds[tokenIndex]}</span>
                </div>
              </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Embedding del Token */}
              <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <h4 className="font-bold text-slate-200 text-sm">Embedding Semántico</h4>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">Significado (16 dims)</p>
                <div className="bg-slate-900 p-2 rounded-lg">
                  <div className="grid grid-cols-8 gap-1">
                    {processData.embeddings[tokenIndex].map((value, dimIndex) => (
                      <div key={dimIndex} className="group relative">
                        <div 
                          style={{ backgroundColor: getValueColor(value) }} 
                          className="w-7 h-7 rounded border border-slate-700 cursor-help transition-all hover:scale-150 hover:z-20 hover:shadow-xl"
                          title={`Dim ${dimIndex}: ${value.toFixed(3)}`}
                        />
                        <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-950 text-white text-[10px] rounded-lg shadow-xl border border-slate-600 whitespace-nowrap z-30">
                          <strong>{value.toFixed(3)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Encoding Posicional */}
              <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <h4 className="font-bold text-slate-200 text-sm">Codificación Posicional</h4>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">Posición #{tokenIndex + 1}</p>
                <div className="bg-slate-900 p-2 rounded-lg">
                  <div className="grid grid-cols-8 gap-1">
                    {processData.positionalEncodings[tokenIndex].map((value, dimIndex) => (
                      <div key={dimIndex} className="group relative">
                        <div 
                          style={{ backgroundColor: getValueColor(value) }} 
                          className="w-7 h-7 rounded border border-slate-700 cursor-help transition-all hover:scale-150 hover:z-20 hover:shadow-xl"
                          title={`Pos ${dimIndex}: ${value.toFixed(3)}`}
                        />
                        <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-950 text-white text-[10px] rounded-lg shadow-xl border border-slate-600 whitespace-nowrap z-30">
                          <strong>{value.toFixed(3)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vector Combinado */}
              <div className="bg-gradient-to-br from-blue-950/50 to-slate-950/50 rounded-xl p-3 border-2 border-blue-600/50 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <h4 className="font-bold text-blue-300 text-sm">Vector Final</h4>
                </div>
                <p className="text-[11px] text-slate-300 mb-2">Significado + Posición</p>
                <div className="bg-slate-900 p-2 rounded-lg ring-2 ring-blue-500/50">
                  <div className="grid grid-cols-8 gap-1">
                    {processData.combinedEmbeddings[tokenIndex].map((value, dimIndex) => (
                      <div key={dimIndex} className="group relative">
                        <div 
                          style={{ backgroundColor: getValueColor(value) }} 
                          className="w-7 h-7 rounded border border-blue-500/30 cursor-help transition-all hover:scale-150 hover:z-20 hover:shadow-xl"
                          title={`Final ${dimIndex}: ${value.toFixed(3)}`}
                        />
                        <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-blue-950 text-white text-[10px] rounded-lg shadow-xl border border-blue-600 whitespace-nowrap z-30">
                          <strong>{value.toFixed(3)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          );
        })()}
      </div>

        {isExplanationMode && (
          <details className="mt-6 p-6 bg-gradient-to-br from-indigo-950/30 to-slate-900/50 rounded-2xl border-2 border-indigo-700/30">
            <summary className="cursor-pointer font-bold text-xl text-indigo-300 flex items-center gap-2 hover:text-indigo-200 transition-colors">
              <span>📖</span> Explicación Detallada (click para expandir)
            </summary>
            
            <div className="mt-6 space-y-6 text-slate-300">
              {/* Embedding Semántico */}
              <div className="pl-4 border-l-4 border-red-500/50">
                <h5 className="font-bold text-red-400 mb-3 text-lg">🔴 Embeddings = Significado en Números</h5>
                <p className="text-sm leading-relaxed">
                  💡 <strong>La idea simple:</strong> Convertimos palabras en listas de números. 
                  Palabras similares tienen números parecidos. Por ejemplo: &quot;perro&quot; y &quot;gato&quot; 
                  son más parecidos que &quot;perro&quot; y &quot;piedra&quot;.
                </p>
                <div className="mt-3 bg-amber-950/30 rounded-lg p-3 border-l-2 border-amber-500">
                  <p className="text-xs text-amber-300">
                    <strong>💡 Dato curioso:</strong> Usamos 16 números aquí para simplificar. 
                    Los modelos reales como GPT-4 usan <strong>¡más de 10,000 números por palabra!</strong>
                  </p>
                </div>
              </div>

              {/* Codificación Posicional */}
              <div className="pl-4 border-l-4 border-yellow-500/50">
                <h5 className="font-bold text-yellow-400 mb-3 text-lg">🟡 Posición = Dónde va la Palabra</h5>
                <p className="text-sm leading-relaxed">
                  🎯 <strong>¿Por qué?</strong> &quot;El perro muerde al hombre&quot; es muy diferente a 
                  &quot;El hombre muerde al perro&quot;. El orden importa, por eso añadimos información de posición 
                  usando funciones matemáticas (seno y coseno).
                </p>
              </div>

              {/* Vector Final */}
              <div className="pl-4 border-l-4 border-blue-500/50">
                <h5 className="font-bold text-blue-400 mb-3 text-lg">🔵 Vector Final = Todo Junto</h5>
                <p className="text-sm leading-relaxed">
                  ✨ <strong>El truco:</strong> Sumamos los números del significado CON los números de la posición. 
                  Así el modelo sabe <em>qué es</em> la palabra Y <em>dónde está</em>.
                </p>
              </div>

              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-400">
                  <strong>🎨 Cómo leer los colores:</strong> 
                  <span className="text-red-400"> ■ Rojo</span> = positivo, 
                  <span className="text-blue-400"> ■ Azul</span> = negativo. 
                  Pasa el mouse sobre los cuadros para ver los valores exactos.
                </p>
              </div>
            </div>
          </details>
        )}

        <div className="text-center mt-6">
          <button className="navigation-button px-6 py-3" onClick={() => onNext ? onNext() : null}>Siguiente: Atención</button>
        </div>
    </div>
  );
}
