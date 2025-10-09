'use client';

import { useEffect, useState, useMemo } from 'react';
import { computeMultiHeadAttention } from '../../utils/llm-simulation';
import { useProcess } from '../../context/ProcessContext';
import { AttentionHead } from '../../types';

interface AttentionStepProps { onNext?: () => void }
export default function AttentionStep({ onNext }: AttentionStepProps) {
  const { state, dispatch } = useProcess();
  const { processData, isExplanationMode } = state;
  const [hoveredCell, setHoveredCell] = useState<{row: number, col: number} | null>(null);
  const [selectedHead, setSelectedHead] = useState(0);

    // snapshot embeddings to a stable reference for hook dependencies
    const embeddingsSnapshot = useMemo(() => processData?.combinedEmbeddings ?? null, [processData?.combinedEmbeddings]);

    // create a stable key for dependency based on length and first/last values to avoid deep equality
    const combinedKey = useMemo(() => {
      const arr = embeddingsSnapshot;
      if (!arr) return '';
      const first = arr[0]?.slice?.(0, 2) ?? [];
      const last = arr[arr.length - 1]?.slice?.(-2) ?? [];
      return `${arr.length}:${first.join(',')}:${last.join(',')}`;
    }, [embeddingsSnapshot]);

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
        <h2 className="step-title">Paso 3: Multi-Head Self-Attention</h2>
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
      <div className="mt-6 p-6 bg-gradient-to-br from-purple-950/30 to-slate-900/50 rounded-2xl border-2 border-purple-700/30">
        <h4 className="font-bold text-xl text-purple-300 mb-3 flex items-center gap-2">
          <span>🧠</span> ¿Cómo funciona Self-Attention?
        </h4>
        <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
          <p>
            👀 <strong className="text-purple-400">La idea principal:</strong> Imagina que estás leyendo &quot;El gato comió pescado&quot;. 
            Cuando lees &quot;comió&quot;, tu cerebro automáticamente piensa &quot;¿Quién comió? ¿Qué comió?&quot; y conecta &quot;gato&quot; con &quot;comió&quot; 
            y &quot;comió&quot; con &quot;pescado&quot;. ¡Eso es exactamente lo que hace la atención! Los números en la tabla muestran qué tan conectadas están las palabras 
            (100% = muy conectadas, 0% = no relacionadas).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="font-semibold text-blue-400 mb-2">🔍 Query (Q): &quot;¿Qué busco?&quot;</p>
              <p className="text-xs">Como cuando preguntas &quot;¿Quién comió?&quot; - es lo que una palabra quiere encontrar en las demás</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="font-semibold text-green-400 mb-2">🔑 Key (K): &quot;¿Qué soy yo?&quot;</p>
              <p className="text-xs">La &quot;tarjeta de identificación&quot; de cada palabra que dice qué tipo de información tiene</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="font-semibold text-yellow-400 mb-2">📦 Value (V): &quot;¿Qué información llevo?&quot;</p>
              <p className="text-xs">El contenido real que una palabra aporta cuando otras la necesitan</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="font-semibold text-purple-400 mb-2 font-mono text-sm">🔢 Attention = Softmax(QK<sup>T</sup>/√d<sub>k</sub>)V</p>
              <div className="text-xs text-slate-400 space-y-1 pl-2">
                <p>🔍 <strong className="text-purple-300">Q</strong> = lista de preguntas de cada palabra</p>
                <p>🔑 <strong className="text-purple-300">K</strong> = lista de respuestas que cada palabra puede dar</p>
                <p>📦 <strong className="text-purple-300">V</strong> = el contenido real de cada palabra</p>
                <p>📏 <strong className="text-purple-300">d<sub>k</sub></strong> = número mágico para que los cálculos no se vuelvan locos</p>
                <p>🎯 <strong className="text-purple-300">Softmax</strong> = convierte números en porcentajes que suman 100%</p>
              </div>
            </div>
          </div>
          <p className="mt-4">
            👥 <strong className="text-purple-400">¿Por qué {processData.attentionHeads.length} &quot;cabezas&quot;?</strong> 
            Es como tener {processData.attentionHeads.length} amigos diferentes leyendo la misma frase. Uno se fija en quién hace qué, 
            otro en los objetos, otro en el tiempo, etc. Al final juntas lo que todos vieron y ¡tienes una comprensión mucho más completa! 
            Los LLMs grandes usan ¡decenas de cabezas!
          </p>
        </div>
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
