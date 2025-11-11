'use client';

import { useEffect, useState, useMemo } from 'react';
import { useProcess } from '../../context/ProcessContext';

interface AttentionStepProps { onNext?: () => void }
export default function AttentionStep({ onNext }: AttentionStepProps) {
  const { state, dispatch } = useProcess();
  const { processData, isExplanationMode } = state;
  const [hoveredCell, setHoveredCell] = useState<{row: number, col: number} | null>(null);
  const [selectedHead, setSelectedHead] = useState(0);

    // snapshot embeddings to a stable reference for hook dependencies
    const embeddingsSnapshot = useMemo(() => processData?.combinedEmbeddings ?? null, [processData?.combinedEmbeddings]);

    // (combinedKey removed) embeddingsSnapshot is used for effect dependencies

    useEffect(() => {
      if (embeddingsSnapshot && processData && !processData.attentionHeads?.length) {
        dispatch({ type: 'COMPUTE_ATTENTION', payload: { numHeads: 4 } });
      }
    }, [embeddingsSnapshot, processData, dispatch]);

  const getAttentionColor = (weight: number): string => {
    if (weight === 0) return 'bg-slate-800';
    const alpha = Math.pow(weight, 0.5);
    return `rgba(59, 130, 246, ${alpha})`;
  };

  const attentionData = useMemo(() => {
    if (!processData?.attentionHeads?.length) return [];
    if (selectedHead === -1) {
      return processData.attentionWeights || [];
    }
    return processData.attentionHeads[selectedHead]?.weights || [];
  }, [processData?.attentionHeads, processData?.attentionWeights, selectedHead]);

  if (!processData?.attentionHeads?.length) {
    return <div className="p-8 sm:p-12 flex justify-center items-center min-h-[400px]">
      <div className="text-xl text-slate-400">Calculando Atención...</div>
    </div>;
  }

  return (
    <div className="p-8 sm:p-12 panel">
      <div className="text-center mb-12">
        <h2 className="step-title">🧠 ¿Cómo funciona Self-Attention?</h2>
        {isExplanationMode && (
          <p className="step-description">
            🧠 <strong>Imagina que cada palabra puede &quot;mirar&quot; a todas las demás palabras para entenderlas mejor.</strong> 
            Es como cuando lees una frase: tu cerebro conecta automáticamente las palabras relacionadas. 
            El modelo hace esto con <strong>4 &quot;cerebros pequeños&quot;</strong> (cabezas) trabajando al mismo tiempo, 
            cada uno buscando diferentes tipos de conexiones entre las palabras.
          </p>
        )}
      </div>

  <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl border border-slate-700 p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-slate-200">Matriz de Pesos de Atención</h3>
            <div className="flex items-center gap-3">
                <label htmlFor="head-selector" className="text-sm font-semibold text-slate-300">Seleccionar Cabeza:</label>
                <select 
                    id="head-selector"
                    value={selectedHead}
                    onChange={(e) => setSelectedHead(Number(e.target.value))}
                    className="bg-slate-800 text-white text-base font-medium rounded-xl px-4 py-2.5 border-2 border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all cursor-pointer">
                    <option value={-1}>🔗 Vista Combinada (todas)</option>
                    {processData.attentionHeads.map((_, i) => (
                        <option key={i} value={i}>🎯 Cabeza {i + 1}</option>
                    ))}
                </select>
            </div>
        </div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-slate-900/75 backdrop-blur-sm"></th>
                  {processData.tokens.map((token, index) => (
                    <th key={index} className="text-center font-medium text-slate-400 p-2">
                      {token === ' ' ? '␣' : token}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attentionData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <th className="sticky left-0 bg-slate-900/75 backdrop-blur-sm text-right font-medium text-slate-400 p-2">
                      {processData.tokens[rowIndex] === ' ' ? '␣' : processData.tokens[rowIndex]}
                    </th>
                    {row.map((weight, colIndex) => (
                      <td
                        key={colIndex}
                        className="relative rounded-md transition-all duration-150 ease-in-out"
                        style={{ backgroundColor: getAttentionColor(weight) }}
                        onMouseEnter={() => setHoveredCell({row: rowIndex, col: colIndex})}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <div className="w-16 h-16 flex items-center justify-center text-sm font-bold text-white/90">
                          {(weight * 100).toFixed(0)}%
                        </div>
                        {hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex && (
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-950 text-white text-xs rounded-md shadow-lg z-10 whitespace-nowrap border border-slate-600">
                                {processData.tokens[rowIndex]} → {processData.tokens[colIndex]}: {(weight * 100).toFixed(1)}%
                            </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    {isExplanationMode && (
      <div className="mt-6 p-6 bg-gradient-to-br from-purple-950/6 to-slate-900/20 rounded-2xl">
        {/* General explanation visible first */}
        <div className="mb-4 text-slate-300">
          <h4 className="font-bold text-2xl text-purple-300 mb-2 flex items-center gap-2">🧠 ¿Cómo funciona Self-Attention?</h4>
              <p className="text-sm leading-relaxed">
                Self-attention es la forma en que el modelo decide qué partes de la frase son importantes para cada palabra. Cada palabra &ldquo;mira&rdquo; a todas las demás palabras y les asigna un peso de importancia (atención). Las más relevantes reciben puntajes altos; las menos relevantes, puntajes bajos. Esta es la base de los Transformers y de casi todos los LLMs modernos.
              </p>
          <h5 className="font-semibold text-lg text-slate-200 mt-4">📊 Cómo leer la matriz de atención</h5>
          <ul className="list-disc list-inside text-slate-300 text-sm mt-2 space-y-2">
            <li>Cada fila representa una palabra que está &ldquo;prestando atención&rdquo;.</li>
            <li>Cada columna representa una palabra que podría ser importante para ella.</li>
            <li>El número (porcentaje) indica cuánta atención le dedica una palabra a otra.</li>
            <li>100% → súper importante en ese momento. 0% → prácticamente ignorada. El color más oscuro significa &ldquo;más atención&rdquo;.</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3">Ejemplo de lectura: si en la fila de una palabra ves porcentajes altos sobre otra palabra, significa &ldquo;esta palabra necesita a esa otra para entender su propio significado en contexto&rdquo;.</p>
          <h5 className="font-semibold text-lg text-slate-200 mt-4">� ¿Por qué hace eso?</h5>
          <p className="text-sm leading-relaxed">Porque entender una frase no es solo leer palabras aisladas. El modelo necesita saber quién hace la acción, qué acción ocurre, a qué se refiere esa acción y con qué matiz. Self-attention permite que el modelo aprenda todas esas relaciones en paralelo, capturando contexto largo y dependencias complejas.</p>
        </div>

        {/* Detailed accordion */}
        <details className="bg-slate-900/50 rounded-2xl border border-slate-700 p-4">
            <summary className="cursor-pointer font-bold text-lg text-purple-300">🔍 Explicación Detallada (haz clic para expandir)</summary>
          <div className="mt-4 text-slate-300 space-y-4 text-sm">
            <h5 className="font-semibold">💡 Resumen rápido</h5>
            <p>Self-attention responde: ¿A qué otras palabras debería mirar esta palabra para entender su rol? ¿Quién hace qué? ¿Sobre qué? ¿En qué contexto? Los números de la matriz indican cuánta atención se presta a cada otra palabra; eso se calcula matemáticamente.</p>

            <h5 className="font-semibold">⚠ Mito vs Realidad</h5>
            <p><strong>⚠ Mito:</strong> &ldquo;El modelo solo lee palabra por palabra, como nosotros en voz alta.&rdquo;</p>
            <p><strong>✅ Realidad:</strong> &ldquo;El modelo conecta todas las palabras entre sí en paralelo y les asigna pesos de importancia. Eso es self-attention.&rdquo;</p>

            <h5 className="font-semibold">🧠 Q / K / V (Query, Key, Value)</h5>
            <p>Para cada palabra el modelo genera tres vectores distintos:</p>
            <ul className="list-disc list-inside">
              <li><strong>🔍 Query (Q)</strong> = &ldquo;lo que estoy buscando&rdquo;</li>
              <li><strong>🔑 Key (K)</strong> = &ldquo;qué ofrezco&rdquo; (tarjeta de identificación)</li>
              <li><strong>📦 Value (V)</strong> = &ldquo;mi contenido útil&rdquo;</li>
            </ul>
            <p>Flujo: comparamos Query de una palabra con los Keys de TODAS las palabras → obtenemos pesos → hacemos un promedio ponderado de los Values.</p>

            <h5 className="font-semibold">🔢 Fórmula</h5>
            <p className="font-mono">Attention = Softmax(Q · K<sup>T</sup> / √d<sub>k</sub>) · V</p>
            <p>Q · K<sup>T</sup> = qué tan bien encaja lo que busco (Q) con lo que cada palabra ofrece (K). √d<sub>k</sub> = factor de escala. Softmax = convierte esos puntajes en porcentajes. Multiplicar por V mezcla la información de las palabras más relevantes.</p>

            <h5 className="font-semibold">👥 ¿Por qué varias cabezas?</h5>
            <p>No usamos una sola matriz sino varias en paralelo (multi-head). Cada cabeza se enfoca en diferentes relaciones (sujeto-verbo, verbo-objeto, modificadores, puntuación). Luego se combinan para una comprensión más rica. Modelos grandes usan muchas cabezas.</p>

            <h5 className="font-semibold">📌 Conexión con el resto del modelo</h5>
            <p>El resultado de self-attention es una nueva versión de cada palabra contextualizada; esa representación pasa a las siguientes capas y finalmente se usa para predecir la siguiente palabra con una distribución de probabilidad.</p>
          <h5 className="font-semibold text-lg text-slate-200 mt-4">🎯 ¿Qué es una &ldquo;cabeza de atención&rdquo;?</h5>
          <p className="text-sm leading-relaxed">El modelo usa varias &ldquo;cabezas de atención&rdquo; al mismo tiempo. Cada cabeza actúa como un lector distinto: una puede enfocarse en sujeto ↔ verbo, otra en objeto, otra en matices, etc. En el selector de &quot;Cabeza&quot; puedes ver cada una de esas perspectivas por separado.</p>
          <p className="text-sm leading-relaxed mt-2">El resultado de self-attention es una versión contextualizada de cada palabra. Después de este paso, el modelo ya no ve palabras aisladas, sino ideas conectadas en contexto; esa representación contextual se usa en el siguiente paso para calcular probabilidades.</p>
            <h5 className="font-semibold">📚 Bibliografía / Lecturas recomendadas</h5>
            <ul className="list-disc list-inside text-slate-400">
              <li><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noreferrer" className="text-blue-300 underline">Vaswani, A. et al. (2017). Attention Is All You Need</a></li>
              <li><a href="https://arxiv.org/abs/1810.04805" target="_blank" rel="noreferrer" className="text-blue-300 underline">Devlin, J. et al. (2018). BERT: Pre-training of Deep Bidirectional Transformers</a></li>
              <li><a href="https://arxiv.org/abs/1508.07909" target="_blank" rel="noreferrer" className="text-blue-300 underline">Sennrich, R. et al. (2016). Neural Machine Translation of Rare Words with Subword Units</a></li>
            </ul>
          </div>
        </details>
      </div>
    )}
      </div>

      <div className="text-center mt-8">
        <button className="navigation-button px-8 py-3" onClick={() => onNext ? onNext() : null}>
          <span>Siguiente: Probabilidades</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
