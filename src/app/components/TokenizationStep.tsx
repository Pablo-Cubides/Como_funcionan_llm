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
      'bg-cyan-500',
      'bg-rose-500',
      'bg-indigo-500'
    ];
    return colors[index % colors.length];
  };

  if (!processData?.tokens.length) {
    return <div className="p-8 sm:p-12 flex justify-center items-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="spinner"></div>
        <div className="text-xl text-slate-400">Tokenizando texto...</div>
      </div>
    </div>;
  }

  return (
    <div className="p-6 sm:p-10 panel">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 mb-6 shadow-2xl shadow-cyan-500/50">
          <span className="text-4xl">🔤</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, #06b6d4, #10b981)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em'
        }}>
          Tokenización
        </h2>
        {isExplanationMode && (
          <div className="explanation-box mx-auto max-w-3xl">
            <p className="explanation-text">
              El texto se divide en <strong>tokens</strong> (palabras o sub-palabras) y a cada uno se le asigna un <strong>ID numérico</strong> único de un vocabulario predefinido.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-10">
        {/* Texto Original */}
        <div className="card-glass p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📝</span>
            <h3 className="text-xl font-bold text-slate-200">Texto Original:</h3>
          </div>
          <p className="text-2xl font-light text-slate-100 leading-relaxed pl-12">
            {processData.originalText}
          </p>
        </div>

        {/* Visualización con flecha de transformación */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <div className="text-6xl animate-bounce">⬇️</div>
            <div className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-500/30">
              <span className="text-sm font-bold text-cyan-300">TOKENIZACIÓN</span>
            </div>
          </div>
        </div>

        {/* Tokens visualizados */}
        <div className="card-neuro p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="text-3xl">🎨</span>
            <h3 className="text-xl font-bold text-slate-200">Tokens & IDs:</h3>
            <div className="ml-auto px-4 py-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
              <span className="text-sm font-bold text-cyan-300">
                {processData.tokens.length} tokens detectados
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 justify-center">
            {processData.tokens.map((token, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center gap-3 group"
                style={{
                  animation: `tokenPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${index * 0.08}s backwards`
                }}
              >
                <div className={`chip ${getTokenColor(index)} relative`}>
                  <span className="text-2xl font-bold">
                    {token === ' ' ? '␣' : token}
                  </span>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-black text-slate-900 shadow-lg">
                    {index + 1}
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/90 rounded-xl border-2 border-slate-700 group-hover:border-cyan-500 group-hover:bg-slate-800 transition-all shadow-lg">
                  <span className="text-xs font-bold text-slate-400">ID:</span>
                  <span className="font-mono text-lg font-black text-cyan-400 group-hover:text-cyan-300 transition-colors">
                    {processData.tokenIds[index]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón de siguiente */}
        <div className="text-center pt-6">
          <button 
            onClick={() => onNext ? onNext() : null} 
            className="navigation-button px-8 py-4 group"
          >
            <span>Siguiente: Embeddings</span>
            <span className="text-2xl group-hover:translate-x-1 transition-transform inline-block">→</span>
          </button>
        </div>

        {/* Explicación detallada */}
        {isExplanationMode && (
        <div className="space-y-6">
          <div className="card-glass p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">❓</span>
              <h3 className="text-2xl font-bold text-slate-200">¿Cómo funciona la tokenización?</h3>
            </div>
            <ul className="list-none space-y-4 text-slate-300 text-base">
              <li className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl">
                <span className="text-2xl flex-shrink-0">✂️</span>
                <div>
                  <strong className="text-slate-100">División:</strong> El texto se corta en las piezas mínimas que el modelo puede reconocer.
                </div>
              </li>
              <li className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl">
                <span className="text-2xl flex-shrink-0">📖</span>
                <div>
                  <strong className="text-slate-100">Vocabulario:</strong> Cada token se busca en un vocabulario gigante. Ese vocabulario devuelve un número (ID).
                </div>
              </li>
              <li className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl">
                <span className="text-2xl flex-shrink-0">🔄</span>
                <div>
                  <strong className="text-slate-100">Consistencia:</strong> El mismo token siempre recibe el mismo ID. Ejemplo: &quot;Para&quot; siempre → ID 128.
                </div>
              </li>
              <li className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl">
                <span className="text-2xl flex-shrink-0">🧩</span>
                <div>
                  <strong className="text-slate-100">Sub-palabras:</strong> Palabras desconocidas se dividen en partes. Ejemplo: <em>resúmenes</em> → resú + menes.
                </div>
              </li>
              <li className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl">
                <span className="text-2xl flex-shrink-0">❗</span>
                <div>
                  <strong className="text-slate-100">Puntuación cuenta:</strong> Coma, punto, signos... todos reciben su propio ID para aprender tono y pausas.
                </div>
              </li>
            </ul>
          </div>

          <details className="card-hover bg-gradient-to-br from-blue-950/30 to-slate-900/50 rounded-2xl border-2 border-blue-700/30 p-6">
            <summary className="cursor-pointer text-blue-300 font-bold text-xl flex items-center gap-3 hover:text-blue-200 transition-colors">
              <span className="text-3xl">🔬</span>
              <span>Explicación Técnica Detallada</span>
            </summary>
            <div className="mt-6 text-slate-300 space-y-5">
              <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="font-bold text-red-400 text-lg mb-2">⚠ Mito:</p>
                <p className="text-slate-300">&ldquo;El modelo entiende texto tal cual lo escribimos.&rdquo;</p>
                <p className="font-bold text-green-400 text-lg mt-4 mb-2">✅ Realidad:</p>
                <p className="text-slate-300">&ldquo;El modelo solo ve números. El primer paso es romper el texto en tokens e IDs numéricos.&rdquo;</p>
              </div>

              <h4 className="font-bold text-lg text-cyan-300">1. ¿Qué es exactamente un token?</h4>
              <p>Un token es una unidad mínima que el modelo reconoce. Puede ser una palabra completa, una parte de palabra, o un signo de puntuación.</p>

              <h4 className="font-bold text-lg text-cyan-300">2. ¿Qué hace el tokenizer?</h4>
              <p>El tokenizer convierte texto en una lista ordenada de tokens y asigna a cada token un ID numérico único.</p>
              <div className="font-mono bg-slate-900 p-4 rounded-xl border border-slate-700 text-sm">
                <span className="text-slate-400">Ejemplo:</span> <strong className="text-white">Para</strong> → ID: <strong className="text-cyan-400">128</strong> · <strong className="text-white">estudiar</strong> → ID: <strong className="text-cyan-400">7787</strong>
              </div>

              <h4 className="font-bold text-lg text-cyan-300">3. ¿Por qué una palabra se parte en trozos?</h4>
              <p>Los modelos usan <strong>tokenización por sub-palabras</strong> (Byte Pair Encoding o WordPiece) para manejar palabras nuevas y errores ortográficos.</p>

              <h4 className="font-bold text-lg text-cyan-300">📚 Referencias</h4>
              <ul className="list-disc list-inside text-slate-400 space-y-2">
                <li><a className="text-blue-400 underline hover:text-blue-300" href="https://arxiv.org/abs/1508.07909" target="_blank" rel="noreferrer">Sennrich et al., &ldquo;Neural Machine Translation of Rare Words&rdquo; (BPE)</a></li>
                <li><a className="text-blue-400 underline hover:text-blue-300" href="https://arxiv.org/abs/1810.04805" target="_blank" rel="noreferrer">Devlin et al., &ldquo;BERT: Pre-training&rdquo; (WordPiece)</a></li>
              </ul>
            </div>
          </details>
        </div>
        )}
      </div>
    </div>
  );
}
