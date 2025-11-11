'use client';

import { useState, useRef, useEffect } from 'react';
import { useProcess } from '../../context/ProcessContext';
import { logEvent } from '../../utils/analytics';

interface AutoregressiveStepProps { 
  onRestart?: () => void;
  onNext?: () => void;
}

export default function AutoregressiveStep({ onRestart, onNext }: AutoregressiveStepProps) {
  const { state, dispatch } = useProcess();
  const { processData, isExplanationMode } = state;
  const [isGenerating, setIsGenerating] = useState(false);
  const [samplingStrategy, setSamplingStrategy] = useState<'greedy' | 'random' | 'top-k'>('greedy');
  const [generationSteps, setGenerationSteps] = useState<Array<{
    step: number;
    addedToken: string;
    fullText: string;
    probabilities: { token: string; probability: number; id: number }[];
  }>>([]);

  const handleGenerate = async () => {
    if (!processData?.probabilities?.length || isGenerating) return;

    logEvent('generate_token', { strategy: samplingStrategy });
    setIsGenerating(true);

    // Dispatch generation to reducer — reducer will append generated token and compute next step
    dispatch({ type: 'GENERATE_NEXT', payload: { strategy: samplingStrategy } });
    // will be marked not generating when effect detects new generated token
  };

  const handleRestart = () => {
    logEvent('restart');
    dispatch({ type: 'RESTART' });
    if (typeof onRestart === 'function') onRestart();
  };

  const handleStrategyChange = (strategy: 'greedy' | 'random' | 'top-k') => {
    logEvent('change_sampling_strategy', { strategy });
    setSamplingStrategy(strategy);
  };

  // Keep local history in sync with generatedTokens in state
  const prevGeneratedRef = useRef<number>(processData?.generatedTokens?.length ?? 0);
  useEffect(() => {
    const gen = processData?.generatedTokens ?? [];
    if (gen.length > prevGeneratedRef.current) {
      const added = gen[gen.length - 1];
      const fullText = (processData?.originalText ?? '') + ' ' + gen.join(' ');
      setGenerationSteps(prev => [...prev, {
        step: prev.length + 1,
        addedToken: added,
        fullText,
        probabilities: processData?.probabilities?.slice(0, 5) ?? []
      }]);
      setIsGenerating(false);
      prevGeneratedRef.current = gen.length;
    }
  }, [processData?.generatedTokens, processData?.originalText, processData?.probabilities]);

  if (!processData?.probabilities?.length) {
    return <div className="p-8 sm:p-12 flex justify-center items-center min-h-[400px]">
      <div className="text-xl text-slate-400">Cargando...</div>
    </div>;
  }

  const maxGenerations = 5;
  const canGenerate = (processData.generatedTokens?.length || 0) < maxGenerations;

  return (
    <div className="p-8 sm:p-12 panel">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="step-title">Paso 5: Generación Autoregresiva</h2>
        {isExplanationMode && (
          <p className="step-description mt-4">
            El modelo añade su predicción al texto de entrada y repite todo el proceso para generar el siguiente token. Este <strong>bucle de retroalimentación</strong> es la base de la generación de texto.
          </p>
        )}
      </div>

      <div className="space-y-10">
        {/* Texto en Construcción */}
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl border-2 border-slate-700 p-10 shadow-2xl">
          <h3 className="text-3xl font-bold mb-8 text-slate-200 flex items-center gap-3 justify-center">
            <span className="text-4xl">✨</span> 
            <span>Texto en Construcción</span>
          </h3>
          
          {/* Vista principal - Texto legible */}
          <div className="mb-8 p-8 bg-slate-950/70 rounded-xl border-2 border-slate-600">
            <p className="text-2xl sm:text-3xl leading-relaxed text-center font-light">
              {processData.tokens
                .slice(0, processData.tokens.length - (processData.generatedTokens?.length || 0))
                .map((token, index) => (
                  <span key={`orig-${index}`} className="text-slate-300">
                    {token}{index < processData.tokens.length - (processData.generatedTokens?.length || 0) - 1 ? ' ' : ''}
                  </span>
                ))}
              {processData.generatedTokens && processData.generatedTokens.length > 0 && (
                <>
                  {' '}
                  {processData.generatedTokens.map((token, index) => (
                    <span key={`newgen-${index}`} className="text-emerald-400 font-bold">
                      {token}{index < processData.generatedTokens.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </>
              )}
              {canGenerate && <span className="inline-block ml-2 text-blue-400 text-3xl animate-pulse">▌</span>}
            </p>
          </div>

          {/* Vista secundaria - Tokens individuales */}
          <details className="mt-4">
            <summary className="cursor-pointer text-slate-400 hover:text-slate-300 text-center font-semibold">
              👁️ Ver tokens individuales
            </summary>
            <div className="flex flex-wrap gap-3 items-center justify-center text-lg p-6 mt-4 bg-slate-950/50 rounded-xl border border-slate-700">
              {processData.tokens.slice(0, processData.tokens.length - (processData.generatedTokens?.length || 0)).map((token, index) => (
                <span key={index} className="px-3 py-2 bg-slate-700/70 text-slate-200 rounded-lg font-mono text-sm shadow-sm transition-transform hover:scale-105">
                  {token}
                </span>
              ))}
              {processData.generatedTokens?.map((token, index) => (
                <span 
                  key={`gen-${index}`} 
                  className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-bold text-sm shadow-lg transform hover:scale-110 transition-transform"
                  style={{
                    animation: `tokenPop 0.4s ease ${index * 0.1}s`
                  }}
                >
                  {token}
                </span>
              ))}
              {canGenerate && (
                <span className="px-4 py-2 bg-blue-500/30 text-blue-300 rounded-lg font-bold animate-pulse border-2 border-blue-500/50 shadow-lg text-sm">
                  ?
                </span>
              )}
            </div>
          </details>
        </div>

        {/* Controles de Generación */}
        <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700 p-8 shadow-lg">
          <div className="flex flex-col gap-6">
            {/* Selector de Estrategia */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <label htmlFor="sampling-strategy" className="text-lg font-bold text-slate-200">
                Estrategia de Muestreo:
              </label>
              <select 
                id="sampling-strategy"
                value={samplingStrategy}
                onChange={(e) => handleStrategyChange(e.target.value as 'greedy' | 'random' | 'top-k')}
                className="bg-slate-800 text-white text-lg font-medium rounded-xl px-6 py-3 border-2 border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all cursor-pointer min-w-[280px]"
              >
                <option value="greedy">🎯 Greedy (el más probable)</option>
                <option value="random">🎲 Random (aleatorio)</option>
                <option value="top-k">🔝 Top-k (top 5)</option>
              </select>
            </div>
            
            {/* Botón de Generación */}
            <div className="flex justify-center">
              <button 
                onClick={handleGenerate} 
                disabled={!canGenerate || isGenerating} 
                className="navigation-button px-12 py-4 text-xl"
              >
                {isGenerating ? (
                  <>
                    <span className="inline-block animate-spin text-2xl">⚙️</span>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <span>Generar Siguiente Token</span>
                    <span className="text-2xl">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Historial de Generación */}
        {generationSteps.length > 0 && (
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl border border-slate-700 p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-8 text-slate-200 flex items-center gap-3">
              <span className="text-3xl">📜</span> 
              <span>Historial de Generación</span>
            </h3>
            <div className="space-y-4">
              {generationSteps.map((step, index) => (
                <div 
                  key={index} 
                  className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl border border-slate-700 hover:border-emerald-600/50 transition-all hover:transform hover:scale-[1.02]"
                  style={{
                    animation: `fadeInUp 0.4s ease ${index * 0.1}s backwards`
                  }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold text-base shadow-lg">
                      {step.step}
                    </div>
                    <p className="font-semibold text-slate-200 text-lg">
                      Se añadió <span className="px-3 py-1.5 bg-emerald-500/80 text-white rounded-lg font-mono text-base ml-2 shadow-md">{step.addedToken}</span>
                    </p>
                  </div>
                  <p className="text-base text-slate-400 ml-14 pl-3 border-l-2 border-slate-700">
                    <strong className="text-slate-300">Resultado:</strong> &quot;{step.fullText}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explicación del Bucle Autoregresivo (colapsable) */}
        {isExplanationMode && generationSteps.length > 0 && (
          <details className="p-10 bg-gradient-to-br from-green-950/30 to-slate-900/50 rounded-2xl border-2 border-green-700/30 shadow-xl">
            <summary className="cursor-pointer font-bold text-3xl text-green-300 mb-6 flex items-center gap-3 hover:text-green-200">
              <span className="text-4xl">🔄</span>
              <span>Bucle Autoregresivo — Explicación Detallada</span>
            </summary>
            <div className="mt-6 space-y-5 text-slate-300">
              <p className="text-lg leading-relaxed">
                La generación autoregresiva es un <strong className="text-green-400">bucle de retroalimentación</strong>:
              </p>
              <ol className="list-decimal list-inside space-y-3 pl-6 text-base">
                <li className="leading-relaxed"><strong className="text-green-400">Predecir:</strong> El modelo calcula probabilidades para el siguiente token</li>
                <li className="leading-relaxed"><strong className="text-green-400">Muestrear:</strong> Se selecciona un token según la estrategia elegida</li>
                <li className="leading-relaxed"><strong className="text-green-400">Agregar:</strong> El token se añade al contexto</li>
                <li className="leading-relaxed"><strong className="text-green-400">Repetir:</strong> Todo el proceso se ejecuta nuevamente con el contexto actualizado</li>
              </ol>
              <div className="mt-6 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-sm text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 text-base">Estrategias de Muestreo:</strong>
                  <br/><br/>
                  • <strong className="text-blue-400">Greedy:</strong> Siempre elige el token más probable (determinista, pero puede ser repetitivo)
                  <br/><br/>
                  • <strong className="text-purple-400">Random:</strong> Escoge aleatoriamente según probabilidades (más diverso)
                  <br/><br/>
                  • <strong className="text-green-400">Top-k:</strong> Limita la selección a los k tokens más probables
                </p>
              </div>
            </div>
          </details>
        )}

        {/* Mensaje de Completado */}
        {!canGenerate && (
          <div className="text-center p-12 bg-gradient-to-br from-emerald-900/50 to-green-900/30 border-2 border-emerald-600 rounded-2xl shadow-2xl">
            <div className="text-7xl mb-6 animate-bounce">🎉</div>
            <h3 className="text-4xl font-bold text-emerald-300 mb-5">¡Generación Completa!</h3>
            <p className="text-slate-300 text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
              Has visto cómo un LLM construye texto token por token usando el proceso completo: tokenización, embeddings, atención, probabilidades y generación autoregresiva.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                onClick={handleRestart}
                className="px-10 py-4 bg-slate-700 text-slate-200 rounded-xl font-bold text-lg hover:bg-slate-600 transition-all border-2 border-slate-600 hover:border-slate-500 flex items-center gap-3 shadow-lg hover:transform hover:scale-105"
              >
                <span className="text-2xl">🔄</span>
              </button>
              {onNext && (
                <button 
                  onClick={() => {
                    logEvent('go_to_bibliography');
                    onNext();
                  }}
                  className="navigation-button px-12 py-5 text-xl"
                >
                  <span>Explorar Bibliografía</span>
                  <span className="text-2xl">📚</span>
                  <span className="text-2xl">→</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
