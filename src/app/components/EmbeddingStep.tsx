'use client';

import { useEffect, useMemo, useState } from 'react';
import { generateEmbedding, generatePositionalEncoding, addVectors } from '../../utils/llm-simulation';
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
    const intensity = Math.round(Math.abs(value) * 255);
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
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <h4 className="font-bold text-slate-200 text-base">Embedding Semántico</h4>
                </div>
                <p className="text-xs text-slate-400 mb-3">Vector de 16 dimensiones que captura el <strong>significado</strong> de la palabra</p>
                <div className="bg-slate-900 p-3 rounded-lg">
                  <div className="flex flex-wrap gap-1.5">
                    {processData.embeddings[tokenIndex].map((value, dimIndex) => (
                      <div key={dimIndex} className="group relative">
                        <div 
                          style={{ backgroundColor: getValueColor(value) }} 
                          className="w-10 h-10 rounded border border-slate-700 flex items-center justify-center cursor-help transition-transform hover:scale-125 hover:z-10 hover:shadow-lg"
                        >
                          <span className="text-[10px] font-bold text-white opacity-70 group-hover:opacity-100">{dimIndex}</span>
                        </div>
                        <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-950 text-white text-xs rounded-lg shadow-xl border border-slate-600 whitespace-nowrap z-20">
                          Dim {dimIndex}: <strong>{value.toFixed(3)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Encoding Posicional */}
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <h4 className="font-bold text-slate-200 text-base">Codificación Posicional</h4>
                </div>
                <p className="text-xs text-slate-400 mb-3">Indica que esta palabra está en la <strong>posición #{tokenIndex + 1}</strong> de la secuencia</p>
                <div className="bg-slate-900 p-3 rounded-lg">
                  <div className="flex flex-wrap gap-1.5">
                    {processData.positionalEncodings[tokenIndex].map((value, dimIndex) => (
                      <div key={dimIndex} className="group relative">
                        <div 
                          style={{ backgroundColor: getValueColor(value) }} 
                          className="w-10 h-10 rounded border border-slate-700 flex items-center justify-center cursor-help transition-transform hover:scale-125 hover:z-10 hover:shadow-lg"
                        >
                          <span className="text-[10px] font-bold text-white opacity-70 group-hover:opacity-100">{dimIndex}</span>
                        </div>
                        <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-950 text-white text-xs rounded-lg shadow-xl border border-slate-600 whitespace-nowrap z-20">
                          Pos {dimIndex}: <strong>{value.toFixed(3)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vector Combinado */}
              <div className="bg-gradient-to-br from-blue-950/50 to-slate-950/50 rounded-xl p-4 border-2 border-blue-600/50 shadow-lg shadow-blue-900/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <h4 className="font-bold text-blue-300 text-base">Vector Final = Suma</h4>
                </div>
                <p className="text-xs text-slate-300 mb-3"><strong>Significado + Posición</strong> = Representación completa que entra al Transformer</p>
                <div className="bg-slate-900 p-3 rounded-lg ring-2 ring-blue-500/50">
                  <div className="flex flex-wrap gap-1.5">
                    {processData.combinedEmbeddings[tokenIndex].map((value, dimIndex) => (
                      <div key={dimIndex} className="group relative">
                        <div 
                          style={{ backgroundColor: getValueColor(value) }} 
                          className="w-10 h-10 rounded border border-blue-500/30 flex items-center justify-center cursor-help transition-transform hover:scale-125 hover:z-10 hover:shadow-lg"
                        >
                          <span className="text-[10px] font-bold text-white opacity-70 group-hover:opacity-100">{dimIndex}</span>
                        </div>
                        <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-blue-950 text-white text-xs rounded-lg shadow-xl border border-blue-600 whitespace-nowrap z-20">
                          Final {dimIndex}: <strong>{value.toFixed(3)}</strong>
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
          <div className="p-8 bg-gradient-to-br from-indigo-950/30 to-slate-900/50 rounded-2xl border-2 border-indigo-700/30">
            <h4 className="font-bold text-2xl text-indigo-300 mb-4 flex items-center gap-2">
              <span>🎓</span> Explicación Académica
            </h4>
            
            <div className="space-y-4 text-slate-300">
              <div className="pl-4 border-l-4 border-red-500/50">
                <h5 className="font-bold text-red-400 mb-2">🔴 Embeddings Semánticos - ¿Qué son?</h5>
                <p className="text-sm leading-relaxed mb-3">
                  💡 <strong>Imagina un diccionario mágico:</strong> Cada palabra se convierte en una lista de 16 números. 
                  Palabras similares tienen números parecidos. Por ejemplo, &quot;perro&quot; y &quot;gato&quot; tendrían números más cercanos entre sí 
                  que &quot;perro&quot; y &quot;piedra&quot;, porque perro y gato son ambos animales.
                </p>
                <div className="bg-slate-800/50 rounded-lg p-3 mb-2">
                  <p className="text-red-300 font-semibold font-mono text-sm mb-2">e<sub>t</sub> = W<sub>e</sub>[token_id]</p>
                  <div className="text-xs text-slate-400 space-y-1 pl-3">
                    <p>📦 <strong className="text-red-400">e<sub>t</sub></strong> = la caja con 16 números para nuestra palabra</p>
                    <p>📚 <strong className="text-red-400">W<sub>e</sub></strong> = el diccionario completo con todas las palabras</p>
                    <p>🔢 <strong className="text-red-400">token_id</strong> = el número de página donde está nuestra palabra</p>
                  </div>
                </div>
                <div className="bg-amber-950/30 rounded-lg p-3 border-l-2 border-amber-500">
                  <p className="text-xs text-amber-300">
                    <strong>⚠️ Nota importante:</strong> Usamos <strong>16 dimensiones</strong> aquí para que sea fácil de ver. 
                    Los modelos grandes reales como GPT-4 o Claude usan <strong>¡miles de dimensiones!</strong> (GPT-3 usa 12,288 dimensiones). 
                    Más dimensiones = el modelo puede entender significados más complejos y sutiles.
                  </p>
                </div>
              </div>

              <div className="pl-4 border-l-4 border-yellow-500/50">
                <h5 className="font-bold text-yellow-400 mb-2">🟡 Codificación Posicional - ¿Para qué sirve?</h5>
                <p className="text-sm leading-relaxed mb-3">
                  🎯 <strong>¿Por qué necesitamos esto?</strong> Imagina que le das al modelo las palabras &quot;gato come pescado&quot; 
                  pero sin orden. El modelo no sabría si el gato come el pescado o si el pescado come al gato. ¡La posición importa!
                  Por eso, le agregamos una &quot;etiqueta de posición&quot; a cada palabra usando funciones matemáticas especiales (seno y coseno).
                </p>
                <div className="bg-slate-800/50 rounded-lg p-3 mb-2">
                  <div className="text-yellow-300 font-semibold font-mono text-xs mb-2 space-y-1">
                    <p>PE(pos, 2i) = sin(pos / 10000<sup>2i/d</sup>)</p>
                    <p>PE(pos, 2i+1) = cos(pos / 10000<sup>2i/d</sup>)</p>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 pl-3">
                    <p>📍 <strong className="text-yellow-400">pos</strong> = en qué lugar va la palabra (1ra, 2da, 3ra...)</p>
                    <p>🔢 <strong className="text-yellow-400">i</strong> = cuál cajoncito estamos llenando (del 0 al 15)</p>
                    <p>📏 <strong className="text-yellow-400">d</strong> = cuántos cajoncitos hay en total (aquí son 16)</p>
                    <p>➗ <strong className="text-yellow-400">sin/cos</strong> = funciones matemáticas que crean patrones especiales de números</p>
                  </div>
                </div>
              </div>

              <div className="pl-4 border-l-4 border-blue-500/50">
                <h5 className="font-bold text-blue-400 mb-2">🔵 Vector Final - ¡Juntando Todo!</h5>
                <p className="text-sm leading-relaxed mb-3">
                  ✨ <strong>El truco final:</strong> Sumamos los 16 números del significado de la palabra CON los 16 números de su posición. 
                  Es como poner dos capas de información juntas. Así el modelo sabe <em>qué es</em> la palabra Y <em>dónde está</em> al mismo tiempo.
                </p>
                <div className="bg-slate-800/50 rounded-lg p-3 mb-2">
                  <p className="text-blue-300 font-semibold font-mono text-sm mb-2">x = Embedding(token) + PositionalEncoding(posición)</p>
                  <div className="text-xs text-slate-400 space-y-1 pl-3">
                    <p>🎁 <strong className="text-blue-400">x</strong> = el regalo final con toda la información (16 números)</p>
                    <p>💭 <strong className="text-blue-400">Embedding(token)</strong> = lo que significa la palabra</p>
                    <p>📌 <strong className="text-blue-400">PositionalEncoding</strong> = dónde está ubicada</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400">
                  🧩 Piénsalo como un rompecabezas: cada pieza (palabra) tiene un color (significado) y un número (posición). 
                  ¡Así el modelo puede armar la imagen completa correctamente!
                </p>
              </div>

              <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-400">
                  <strong className="text-slate-300">🎨 Cómo leer los colores:</strong> 
                  <span className="text-red-400 font-semibold"> ■ Rojo</span> = números positivos (van hacia arriba), 
                  <span className="text-blue-400 font-semibold"> ■ Azul</span> = números negativos (van hacia abajo). 
                  Si el color es más fuerte, el número es más grande. ¡Pasa el ratón sobre cada cuadrito para ver el número exacto!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <button className="navigation-button px-6 py-3" onClick={() => onNext ? onNext() : null}>Siguiente: Atención</button>
        </div>
    </div>
  );
}
