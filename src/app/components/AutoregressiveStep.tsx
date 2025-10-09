'use client';

import { useState, useRef, useEffect } from 'react';
import { useProcess } from '../../context/ProcessContext';
import { logEvent } from '../../utils/analytics';

interface AutoregressiveStepProps { onRestart?: () => void }

export default function AutoregressiveStep({ onRestart }: AutoregressiveStepProps) {
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
      <div className="text-center mb-12">
        <h2 className="step-title">Paso 5: Generación Autoregresiva</h2>
        {isExplanationMode && (
          <p className="step-description">
            El modelo añade su predicción al texto de entrada y repite todo el proceso para generar el siguiente token. Este <strong>bucle de retroalimentación</strong> es la base de la generación de texto.
          </p>
        )}
      </div>

  <div className="space-y-8">
  <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl border border-slate-700 p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-6 text-slate-200 flex items-center gap-2">
              <span>✨</span> Texto en Construcción
            </h3>
            <div className="flex flex-wrap gap-3 items-center text-lg p-6 bg-slate-950/50 rounded-xl border border-slate-700 min-h-[120px]">
                {processData.tokens.slice(0, processData.tokens.length - (processData.generatedTokens?.length || 0)).map((token, index) => (
                    <span key={index} className="px-4 py-2 bg-slate-700/70 text-slate-200 rounded-lg font-mono shadow-sm">
                    {token === ' ' ? '␣' : token}
                    </span>
                ))}
                {processData.generatedTokens?.map((token, index) => (
                    <span 
                      key={`gen-${index}`} 
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-bold shadow-lg"
                      style={{
                        animation: `tokenPop 0.4s ease ${index * 0.1}s`
                      }}
                    >
                    {token}
                    </span>
                ))}
                {canGenerate && (
                  <span className="px-4 py-2 bg-blue-500/30 text-blue-300 rounded-lg font-bold animate-pulse border-2 border-blue-500/50 shadow-lg">
                    <span className="inline-block animate-bounce">?</span>
                  </span>
                )}
            </div>
        </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center bg-slate-900/40 rounded-2xl border border-slate-700 p-6">
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <label htmlFor="sampling-strategy" className="text-sm font-bold text-slate-300">Estrategia de Muestreo:</label>
        <select 
          id="sampling-strategy"
          value={samplingStrategy}
          onChange={(e) => handleStrategyChange(e.target.value as 'greedy' | 'random' | 'top-k')}
                    className="bg-slate-800 text-white text-base font-medium rounded-xl px-4 py-2.5 border-2 border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all cursor-pointer">
                    <option value="greedy">🎯 Greedy (el más probable)</option>
                    <option value="random">🎲 Random (aleatorio)</option>
                    <option value="top-k">🔝 Top-k (top 5)</option>
                </select>
            </div>
            <button 
              onClick={handleGenerate} 
              disabled={!canGenerate || isGenerating} 
              className="navigation-button px-8 py-3"
            >
                {isGenerating ? (
                  <>
                    <span className="inline-block animate-spin">⚙️</span>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <span>Generar Siguiente Token</span>
                    <span>→</span>
                  </>
                )}
            </button>
            <button 
              onClick={handleRestart} 
              className="px-6 py-3 bg-slate-700 text-slate-200 rounded-xl font-semibold hover:bg-slate-600 transition-all border border-slate-600 hover:border-slate-500"
            >
                🔄 Reiniciar
            </button>
        </div>

    {generationSteps.length > 0 && (
      <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl border border-slate-700 p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 text-slate-200 flex items-center gap-2">
                  <span>📜</span> Historial de Generación
                </h3>
                <div className="space-y-3">
                {generationSteps.map((step, index) => (
                    <div 
                      key={index} 
                      className="p-5 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl border border-slate-700 hover:border-emerald-600/50 transition-all"
                      style={{
                        animation: `fadeInUp 0.4s ease ${index * 0.1}s backwards`
                      }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold text-sm shadow-lg">
                            {step.step}
                          </div>
                          <p className="font-semibold text-slate-200">
                            Se añadió <span className="px-2 py-1 bg-emerald-500/80 text-white rounded-lg font-mono text-sm ml-1">{step.addedToken}</span>
                          </p>
                        </div>
                        <p className="text-sm text-slate-400 ml-11 pl-2 border-l-2 border-slate-700">
                          <strong className="text-slate-300">Resultado:</strong> &quot;{step.fullText}&quot;
                        </p>
                    </div>
                ))}
                </div>
            </div>
        )}

    {isExplanationMode && generationSteps.length > 0 && (
      <div className="p-8 bg-gradient-to-br from-green-950/30 to-slate-900/50 rounded-2xl border-2 border-green-700/30">
        <h4 className="font-bold text-2xl text-green-300 mb-4 flex items-center gap-2">
          <span>🔄</span> Bucle Autoregresivo
        </h4>
        <div className="space-y-3 text-slate-300 text-sm">
          <p>
            La generación autoregresiva es un <strong className="text-green-400">bucle de retroalimentación</strong>:
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-4">
            <li><strong>Predecir:</strong> El modelo calcula probabilidades para el siguiente token</li>
            <li><strong>Muestrear:</strong> Se selecciona un token según la estrategia elegida</li>
            <li><strong>Agregar:</strong> El token se añade al contexto</li>
            <li><strong>Repetir:</strong> Todo el proceso se ejecuta nuevamente con el contexto actualizado</li>
          </ol>
          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Estrategias de Muestreo:</strong>
              <br/>• <strong className="text-blue-400">Greedy:</strong> Siempre elige el token más probable (determinista, pero puede ser repetitivo)
              <br/>• <strong className="text-purple-400">Random:</strong> Escoge aleatoriamente según probabilidades (más diverso)
              <br/>• <strong className="text-green-400">Top-k:</strong> Limita la selección a los k tokens más probables
            </p>
          </div>
        </div>
      </div>
    )}

        {!canGenerate && (
            <div className="text-center p-8 bg-gradient-to-br from-emerald-900/50 to-green-900/30 border-2 border-emerald-600 rounded-2xl shadow-2xl">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold text-emerald-300 mb-3">¡Generación Completa!</h3>
                <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                  Has visto cómo un LLM construye texto token por token usando el proceso completo: tokenización, embeddings, atención, probabilidades y generación autoregresiva.
                </p>
                <button 
                  onClick={handleRestart}
                  className="mt-6 navigation-button px-10 py-4"
                >
                  <span>🔄</span>
                  <span>Probar con Otra Frase</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
