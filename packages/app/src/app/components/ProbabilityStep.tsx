"use client";

import { useEffect, useMemo } from 'react';
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
            <p className="step-description">
              🎲 <strong>Momento de adivinar:</strong> El modelo lee todo el contexto anterior, calcula una puntuación para cada posible siguiente token y convierte esas puntuaciones en porcentajes que suman 100%. Luego ordena las opciones y muestra las más probables en el Top 10.
            </p>
            {isExplanationMode && (
              <p className="step-description mt-3 text-sm text-slate-300">
                (Explicación extendida disponible abajo en &quot;Explicación Detallada&quot;)
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
      {/* New explanatory section requested by user: visible between Top10 and the detailed accordion */}
      <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700 p-6 shadow-inner">
        <h3 className="text-xl font-bold mb-3 text-slate-200">¿Qué está haciendo el modelo aquí?</h3>
        <p className="text-sm text-slate-300 leading-relaxed">Piensa en esto como completar la frase. Si lees: &ldquo;Para estudiar mejor, recomiendo hacer resúmenes&rdquo;, y luego ves &ldquo;Para estudiar mejor, recomiendo hacer resúmenes ___&rdquo;, tu cerebro ya está pensando en &ldquo;claros&rdquo;, &ldquo;diarios&rdquo;, &ldquo;detallados&rdquo;… Estás prediciendo la siguiente palabra.</p>
        <p className="text-sm text-slate-300 leading-relaxed mt-3">El modelo hace lo mismo:</p>
        <ul className="list-disc list-inside text-slate-300 mt-2">
          <li>Mira todo el contexto anterior.</li>
          <li>Calcula una puntuación para cada posible siguiente token.</li>
          <li>Convierte esas puntuaciones en porcentajes que suman 100%.</li>
          <li>Ordena de mayor a menor.</li>
        </ul>
        <p className="text-sm text-slate-300 mt-3 font-semibold">Eso es literalmente lo que estás viendo en el Top 10.</p>

        <h4 className="font-semibold text-slate-200 mt-4">🤔 ¿Cómo decide el modelo?</h4>
        <p className="text-sm text-slate-300 mt-2">Texto resumido: El modelo ya procesó el contexto con embeddings, posición y self-attention. Con todo eso genera una puntuación interna para cada posible siguiente token del vocabulario. Luego convierte esas puntuaciones en probabilidades usando una función llamada <strong>softmax</strong>, que asegura que todas las opciones sumen 100%.</p>
      </div>
            {isExplanationMode && (
                <details className="p-6 bg-gradient-to-br from-amber-950/30 to-slate-900/50 rounded-2xl border-2 border-amber-700/30">
                    <summary className="cursor-pointer font-bold text-xl text-amber-300 mb-3 flex items-center gap-2 hover:text-amber-200">
                      <span>🔎</span> Explicación Detallada (haz clic para expandir)
                    </summary>
                    <div className="mt-4 space-y-4 text-slate-300 text-sm">
                      <h5 className="font-semibold">1. Del puntaje crudo a probabilidad</h5>
                      <p>Primero, el modelo asigna a cada token un puntaje interno z<sub>i</sub>. Estos no son probabilidades. Luego aplica softmax para convertirlos en porcentajes:</p>
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <p className="font-mono text-sm text-center mb-3">P(token<sub>i</sub>) = exp(z<sub>i</sub>) / Σ<sub>j</sub> exp(z<sub>j</sub>)</p>
                        <p className="text-xs text-slate-400">z<sub>i</sub> = nota del modelo; exp() amplifica diferencias; la división normaliza entre 0–100%.</p>
                      </div>

                      <h5 className="font-semibold">2. ¿Por qué a veces no elige la #1?</h5>
                      <p>El modelo no siempre elige la palabra más probable. Para mayor naturalidad se usan muestreos:</p>
                      <ul className="list-disc list-inside text-slate-300">
                        <li><strong>Top-k:</strong> considerar solo las k opciones más probables.</li>
                        <li><strong>Top-p / Nucleus:</strong> tomar las opciones cuya probabilidad acumulada suma p (ej. 0.9).</li>
                        <li><strong>Temperature:</strong> controlar cuán arriesgado es el muestreo (alta = más creativo).</li>
                      </ul>

                      <h5 className="font-semibold">3. ¿Por qué dice “tokens”, no “palabras completas”?</h5>
                      <p>El modelo predice tokens: estos pueden ser palabras completas, subpalabras o signos de puntuación. Por eso el Top 10 muestra tokens, no siempre palabras enteras.</p>

                      <h5 className="font-semibold">4. ¿Y esto a dónde va?</h5>
                      <p>La probabilidad más alta (o la muestra seleccionada) se añade al texto; luego el proceso se repite: esto es la generación autoregresiva.</p>

                      <h5 className="font-semibold">5. Mito vs Realidad</h5>
                      <p><strong>⚠ Mito:</strong> &ldquo;El modelo sabe exactamente lo que quiero&rdquo;. <strong>✅ Realidad:</strong> &ldquo;El modelo elige token por token la mejor salida según patrones de entrenamiento&rdquo;.</p>

                      <h5 className="font-semibold">📚 Bibliografía / Lecturas recomendadas</h5>
                      <ul className="list-disc list-inside text-slate-400">
                        <li><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noreferrer" className="text-blue-300 underline">Vaswani et al., Attention Is All You Need (2017)</a></li>
                        <li><a href="https://arxiv.org/abs/1810.04805" target="_blank" rel="noreferrer" className="text-blue-300 underline">Devlin et al., BERT (2018)</a></li>
                        <li><a href="https://arxiv.org/abs/2005.14165" target="_blank" rel="noreferrer" className="text-blue-300 underline">Brown et al., GPT-3 (2020)</a></li>
                      </ul>
                    </div>
                </details>
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
