'use client';

import { useEffect } from 'react';
import { tokenize, hashToken } from '../../utils/llm-simulation';
import { useProcess } from '../../context/ProcessContext';

interface TokenizationStepProps { onNext?: () => void }

export default function TokenizationStep({ onNext }: TokenizationStepProps) {
  const { state, dispatch } = useProcess();
  const { inputText, processData, isExplanationMode } = state;

  useEffect(() => {
    if (inputText && processData && processData.originalText === inputText && processData.tokens.length === 0) {
      const tokens = tokenize(inputText);
      const tokenIds = tokens.map(token => hashToken(token));
      
      dispatch({ type: 'SET_PROCESS_DATA', payload: { ...processData, tokens, tokenIds } });
    }
  }, [inputText, processData, dispatch]);

  const getTokenColor = (index: number) => {
    const colors = [
      'bg-sky-500',
      'bg-emerald-500',
      'bg-violet-500',
      'bg-amber-500',
      'bg-pink-500',
      'bg-cyan-500'
    ];
    return colors[index % colors.length];
  };

  if (!processData?.tokens.length) {
    return <div className="p-8 sm:p-12 flex justify-center items-center min-h-[400px]">
      <div className="text-xl text-slate-400">Tokenizando texto...</div>
    </div>;
  }

  return (
    <div className="p-8 sm:p-12 panel">
      <div className="text-center mb-12">
        <h2 className="step-title">Paso 1: Tokenización</h2>
        {isExplanationMode && (
          <p className="step-description">
            El texto se divide en <strong>tokens</strong> (palabras o sub-palabras) y a cada uno se le asigna un <strong>ID numérico</strong> único de un vocabulario predefinido.
          </p>
        )}
      </div>

      <div className="space-y-12">
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-slate-300">Texto Original:</h3>
          <p className="text-2xl font-light text-slate-100 leading-relaxed">{processData.originalText}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-6 text-slate-300">Tokens y IDs Asignados:</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {processData.tokens.map((token, index) => (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className={`chip ${getTokenColor(index)}`}>
                  {token === ' ' ? '␣' : token}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/70 rounded-lg border border-slate-700">
                  <span className="text-xs font-semibold text-slate-400">ID:</span>
                  <span className="font-mono text-base font-bold text-blue-400">{processData.tokenIds[index]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => onNext ? onNext() : null} className="navigation-button px-6 py-3">Siguiente: Embeddings</button>
        </div>

        {isExplanationMode && (
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <h4 className="font-bold text-lg text-slate-200 mb-2">¿Cómo funciona?</h4>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li><strong>División:</strong> El texto se descompone en las unidades más pequeñas que el modelo entiende.</li>
              <li><strong>Vocabulario:</strong> Cada token se busca en un vocabulario gigante para encontrar su ID correspondiente.</li>
              <li><strong>Consistencia:</strong> El mismo token siempre tendrá el mismo ID, permitiendo al modelo reconocer patrones.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
