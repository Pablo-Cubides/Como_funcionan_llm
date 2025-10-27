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
            <h2 className="step-title">🔢 Embeddings: Cómo el modelo convierte palabras en números</h2>
            {isExplanationMode && (
              <p className="step-description">
                Los modelos de lenguaje grande (LLMs) no entienden letras. Entienden números. En este paso, cada palabra se convierte en un vector numérico llamado embedding, y también le damos al modelo información sobre la posición de esa palabra en la frase. Así puede entender el significado y el orden.
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
              {/* Block 1: Significado */}
              <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl">🧠</div>
                  <h3 className="font-bold text-slate-200 text-lg">1. Significado de la palabra (Embedding Semántico)</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                  Cada palabra se convierte en una <strong>lista de números</strong> que describe su significado. Palabras parecidas generan listas parecidas. Por ejemplo, &ldquo;perro&rdquo; y &ldquo;gato&rdquo; tendrán representaciones similares, mientras que &ldquo;perro&rdquo; y &ldquo;edificio&rdquo; no.
                  A esa lista de números la llamamos <strong>embedding semántico</strong> o <strong>representación vectorial</strong>.
                </p>
                <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400">Ejemplo ilustrativo:</p>
                  <pre className="text-sm font-mono text-slate-200 mt-2">&quot;para&quot; → [0.84, -0.10, 0.33, …]</pre>
                <div className="mt-3 flex items-center gap-2">
                  {processData.embeddings[tokenIndex].slice(0, 4).map((v: number, i: number) => (
                    <div key={i} title={`Dim ${i}: ${v.toFixed(3)}`} style={{ backgroundColor: getValueColor(v) }} className="w-6 h-6 rounded" />
                  ))}
                </div>
                </div>
              </div>

              {/* Block 2: Posición */}
              <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl">📍</div>
                  <h3 className="font-bold text-slate-200 text-lg">2. Posición en la frase (Embedding Posicional)</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                  El orden cambia el significado. &ldquo;No es lo mismo ‘Juan besa a María’ que ‘María besa a Juan’&rdquo;. Los <strong>Transformers</strong> leen todas las palabras a la vez, por eso necesitan saber la posición de cada palabra en la oración.
                  Cada posición tiene su propia <strong>lista de números</strong>, llamada <strong>embedding posicional</strong> o <strong>codificación posicional</strong> (positional embedding / positional encoding).
                </p>
                <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400">Ejemplo ilustrativo:</p>
                  <pre className="text-sm font-mono text-slate-200 mt-2">Posición #1 → [0.10, 0.90, -0.20, …]</pre>
                  <p className="text-xs text-slate-400 mt-3">Referencia clásica: <a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noreferrer" className="text-blue-400 underline">Vaswani et al., &ldquo;Attention Is All You Need&rdquo; (2017)</a></p>
                </div>
              </div>

              {/* Block 3: Mezcla final */}
              <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl">➕</div>
                  <h3 className="font-bold text-slate-200 text-lg">3. Lo que el modelo realmente ve</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                  El modelo no usa &quot;significado&quot; y &quot;posición&quot; por separado. Suma las dos listas número a número para crear un solo vector final por palabra. Ese vector final ya contiene qué palabra es y dónde está. Ese vector combinado es lo que entra a la primera capa de self-attention del modelo.
                </p>
                <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400">Visualización simplificada (4 dimensiones):</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-20">Significado:</span>
                      <div className="flex gap-1">
                        {processData.embeddings[tokenIndex].slice(0, 4).map((v: number, i: number) => (
                          <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: getValueColor(v) }} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-20">Posición:</span>
                      <div className="flex gap-1">
                        {[0.1, 0.9, -0.2, 0.4].map((v: number, i: number) => (
                          <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: getValueColor(v) }} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-20">Final:</span>
                      <div className="flex gap-1">
                        {processData.embeddings[tokenIndex].slice(0, 4).map((v: number, i: number) => {
                          const pos = [0.1, 0.9, -0.2, 0.4][i];
                          const final = v + pos;
                          return <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: getValueColor(final) }} />;
                        })}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">El modelo trabaja con este vector final.</p>
                </div>
                <p className="text-xs text-slate-400 mt-3">Esta representación interna es la forma matemática que usa el LLM para razonar sobre el contexto y producir la siguiente palabra.</p>
              </div>
            </div>
          </div>
          );
        })()}
      </div>

        {isExplanationMode && (
          <details className="mt-6 p-6 bg-gradient-to-br from-indigo-950/30 to-slate-900/50 rounded-2xl border-2 border-indigo-700/30">
            <summary className="cursor-pointer font-bold text-xl text-indigo-300 flex items-center gap-2 hover:text-indigo-200 transition-colors">
              <span>🔬</span> explicación detallada
            </summary>
            <div className="mt-6 space-y-6 text-slate-300">
              <p className="text-sm leading-relaxed">
                Intro técnica corta: En la práctica cada token no se convierte en 4 números sino en cientos o miles de números. Ese vector es el embedding. Los modelos grandes (por ejemplo, modelos tipo GPT entrenados con Transformers) usan dimensiones del orden de 768, 1024 o más.
              </p>

              <div className="bg-slate-900 p-4 rounded border border-slate-700">
                <h5 className="font-bold text-sm text-amber-300 mb-2">Ejemplo de embedding semántico (16 dimensiones simplificadas):</h5>
                <pre className="text-xs text-slate-200 bg-slate-800 p-3 rounded">[ -0.246, 0.839, 0.129, -0.630, -0.050, 0.597, -0.442, 0.332, 0.326, -0.270, 0.493, -0.115, -0.514, -0.221, -0.567, -0.140 ]</pre>
              </div>

              <div className="bg-slate-900 p-4 rounded border border-slate-700">
                <h5 className="font-bold text-sm text-amber-300 mb-2">Ejemplo de embedding posicional para la posición #1:</h5>
                <pre className="text-xs text-slate-200 bg-slate-800 p-3 rounded">[ 0.000, 1.000, 0.000, 1.000, 0.000, 1.000, 0.000, 1.000, 0.000, 1.000, 0.000, 1.000, 0.000, 1.000, 0.000, 1.000 ]</pre>
              </div>

              <div className="bg-slate-900 p-4 rounded border border-slate-700">
                <h5 className="font-bold text-sm text-amber-300 mb-2">Suma = vector final que entra al modelo:</h5>
                <pre className="text-xs text-slate-200 bg-slate-800 p-3 rounded">[-0.246, 1.839, 0.129, 0.370, -0.050, 1.597, -0.442, 1.332, 0.326, 0.730, 0.493, 0.885, -0.514, 0.779, -0.567, 0.860]</pre>
              </div>

              <p className="text-sm leading-relaxed">
                Esta suma (embedding semántico + embedding posicional) es la entrada estándar a las capas de atención del Transformer. El mecanismo de <button onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })} className="text-blue-300 underline">self-attention (atención)</button> fue descrito originalmente por Vaswani et al. (2017) y desde entonces es la base de la mayoría de los modelos de lenguaje grande actuales.
              </p>
            </div>
                    {/* Nota de bibliografía breve */}
        <div className="mt-6 text-xs text-slate-400">
          <p>Referencias recomendadas para profundizar en embeddings, codificación posicional y Transformers:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noreferrer" className="text-blue-400 underline">Vaswani, A. et al. &ldquo;Attention Is All You Need&rdquo;, 2017</a></li>
            <li><a href="https://arxiv.org/abs/1301.3781" target="_blank" rel="noreferrer" className="text-blue-400 underline">Mikolov, T. et al. &ldquo;Efficient Estimation of Word Representations in Vector Space&rdquo;, 2013</a></li>
          </ul>
        </div>
          </details>
        )}

        <div className="text-center mt-6">
          <button className="navigation-button px-6 py-3" onClick={() => onNext ? onNext() : null}>Siguiente: Atención</button>
        </div>
    </div>
  );
}
