"use client";

import { useEffect, useMemo } from 'react';
import { computeProbabilities, generateVocabulary } from '../../utils/llm-simulation';
import { useProcess } from '../../context/ProcessContext';

interface ProbabilityStepProps { onNext?: () => void }

export default function ProbabilityStep({ onNext }: ProbabilityStepProps) {
  const { state, dispatch } = useProcess();
  const { processData, isExplanationMode } = state;

  const embeddingsSnapshot = useMemo(() => processData?.combinedEmbeddings ?? null, [processData?.combinedEmbeddings]);

  useEffect(() => {
    if (embeddingsSnapshot && processData && !processData.probabilities?.length) {
      dispatch({ type: 'COMPUTE_PROBABILITIES', payload: { seed: 42 } });
    }
  }, [embeddingsSnapshot, processData, dispatch]);

  if (!processData?.probabilities?.length) {
    return <div className="p-8 sm:p-12 flex justify-center items-center min-h-[400px]">
      <div className="text-xl text-slate-400">Calculando Probabilidades...</div>
    </div>;
  }

  const maxProbability = processData.probabilities[0]?.probability || 0;

  return (
    <div className="p-8 sm:p-12 panel">
      <div className="text-center mb-12">
        <h2 className="step-title">Paso 4: Probabilidades</h2>
        {isExplanationMode && (
          <p className="step-description">
            🎲 <strong>Momento de adivinar:</strong> El modelo lee todas las palabras que ya tiene y piensa 
            &quot;¿Cuál palabra debería venir después?&quot;. Es como jugar a completar frases: si dices &quot;Me gusta comer...&quot;, 
            probablemente piensas en comida. El modelo hace lo mismo, pero con números que muestran qué tan seguro está de cada opción.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl border border-slate-700 p-8 shadow-xl">
          <h3 className="text-2xl font-bold mb-6 text-slate-200">Top 10 Tokens Más Probables</h3>
          <div className="space-y-3">
            {processData.probabilities.slice(0, 10).map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/60 transition-all group">
                <div className="flex items-center gap-3 min-w-[180px]">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-base shadow-lg flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="font-bold text-xl text-slate-100 font-mono">{item.token}</span>
                </div>
                <div className="flex-grow bg-slate-700/30 rounded-full h-12 overflow-hidden border border-slate-600 shadow-inner">
                  <div 
                    className="h-12 rounded-full flex items-center justify-end pr-4 text-base font-bold text-white transition-all duration-500 ease-out"
                    style={{ 
                      width: `${(item.probability / maxProbability) * 100}%`,
                      background: index === 0 
                        ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                        : `linear-gradient(90deg, #3b82f6 0%, #2563eb ${Math.min(100, item.probability * 1000)}%)`
                    }}
                  >
                    {(item.probability * 100).toFixed(2)}%
                  </div>
                </div>
                {index === 0 && (
                  <span className="text-sm font-semibold text-green-400 animate-pulse flex-shrink-0">★ Más probable</span>
                )}
              </div>
            ))}
          </div>
        </div>

    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl border border-slate-700 p-6 shadow-xl">
                <h3 className="text-xl font-bold mb-4 text-slate-200">Contexto Actual</h3>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
        {processData.tokens.map((token, index) => (
          <span key={index} className="px-3 py-2 bg-slate-700 text-slate-100 rounded-lg font-mono text-sm">
          {token === ' ' ? '␣' : token}
          </span>
        ))}
                <span className="px-3 py-2 bg-blue-500/30 text-blue-300 rounded-lg font-bold text-sm animate-pulse border-2 border-blue-500/50">
                  <span className="inline-block animate-bounce">?</span>
                </span>
                </div>
            </div>
            {isExplanationMode && (
                <div className="p-6 bg-gradient-to-br from-amber-950/30 to-slate-900/50 rounded-2xl border-2 border-amber-700/30">
                    <h4 className="font-bold text-xl text-amber-300 mb-3 flex items-center gap-2">
                      <span>📊</span> ¿Cómo Decide el Modelo?
                    </h4>
                    <div className="space-y-3 text-slate-300 text-sm">
                      <p>
                        🎯 <strong>El proceso es simple:</strong> El modelo toma toda la información que procesó (las palabras con su significado y posición) 
                        y la compara con todas las palabras que conoce. Es como tener un examen de opción múltiple: el modelo le da una &quot;nota&quot; 
                        a cada posible palabra, y luego convierte esas notas en porcentajes usando una fórmula llamada <strong className="text-amber-400">softmax</strong>.
                      </p>
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <p className="font-mono text-sm text-center mb-3">P(token<sub>i</sub>) = exp(z<sub>i</sub>) / Σ<sub>j</sub> exp(z<sub>j</sub>)</p>
                        <div className="text-xs text-slate-400 space-y-1 pl-3 border-l-2 border-amber-500/50">
                          <p>🎯 <strong className="text-amber-400">P(token<sub>i</sub>)</strong> = ¿Qué tan probable es esta palabra? (de 0% a 100%)</p>
                          <p>📝 <strong className="text-amber-400">z<sub>i</sub></strong> = la &quot;nota&quot; inicial de esta palabra</p>
                          <p>📈 <strong className="text-amber-400">exp()</strong> = una función matemática que hace las diferencias más claras</p>
                          <p>➕ <strong className="text-amber-400">Σ<sub>j</sub></strong> = suma las notas de TODAS las palabras posibles</p>
                        </div>
                      </div>
                      <p>
                        ✨ <strong>El truco:</strong> Dividir cada nota por la suma total hace que todos los porcentajes sumen exactamente 100%. 
                        La palabra con el porcentaje más alto es la que el modelo cree que debería ir después. ¡En modelos grandes como GPT-4, 
                        esto se hace con vocabularios de ¡más de 50,000 palabras!
                      </p>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="text-center mt-8">
        <button className="navigation-button px-8 py-3" onClick={() => onNext ? onNext() : null}>
          <span>Siguiente: Generación Autoregresiva</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
