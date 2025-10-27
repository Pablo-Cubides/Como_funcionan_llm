"use client";

import { useState } from 'react';
import { tokenize } from '../../utils/llm-simulation';
import { useProcess } from '../../context/ProcessContext';
import { logEvent } from '../../utils/analytics';

interface InputStepProps {
  demoTexts?: string[];
  onNext?: () => void;
}

export default function InputStep({ demoTexts = [], onNext }: InputStepProps) {
  const { state, dispatch } = useProcess();
  const { isExplanationMode } = state;
  const [inputText, setInputText] = useState('');
  const [selectedDemo, setSelectedDemo] = useState('');
  const MAX_TOKENS = 50;

  const tokenCount = tokenize(inputText || selectedDemo || '').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText || selectedDemo;
    if (text.trim()) {
      logEvent('start_process', { text });
      dispatch({ type: 'START_PROCESS', payload: { text: text.trim() } });
      // advance to next step in the flow if the parent provided a handler
      if (typeof onNext === 'function') setTimeout(() => onNext(), 60);
    }
  };

  const handleDemoSelect = (demo: string) => {
    setSelectedDemo(demo);
    setInputText(demo);
  };

  return (
    <div className="p-6 sm:p-10">
      <div className="text-center mb-12 animate-fadeInUp">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-6 shadow-2xl shadow-violet-500/50 animate-pulse">
          <span className="text-4xl">✏️</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em'
        }}>
          Bienvenido a ExploraModelo
        </h1>
        
        {isExplanationMode && (
          <div className="explanation-box mx-auto max-w-3xl">
            <p className="explanation-text">
              Descubre cómo funcionan los modelos de lenguaje paso a paso.
              Escribe una frase y observa el proceso completo desde la entrada 
              hasta la generación de texto.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
        {/* Input de texto principal */}
        <div className="card-glass p-8 rounded-2xl space-y-4">
          <label htmlFor="input-text" className="block text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
            <span className="text-2xl">💭</span>
            Escribe una frase para analizar:
          </label>
          <div className="relative">
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ej: La inteligencia artificial es fascinante..."
              className="text-input w-full h-32 resize-none text-lg font-medium"
              maxLength={200}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${
                tokenCount > MAX_TOKENS 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
              }`}>
                {tokenCount} / {MAX_TOKENS} tokens
              </div>
              <div className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm font-medium">
                {inputText.length} / 200
              </div>
            </div>
          </div>
          {tokenCount > MAX_TOKENS && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <p className="text-red-400 text-sm font-medium">
                Límite de tokens superado — acorta tu frase (máximo {MAX_TOKENS} tokens)
              </p>
            </div>
          )}
        </div>

        {/* Divisor */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 py-2 bg-black text-slate-400 font-semibold rounded-full border border-slate-700">
              O selecciona un ejemplo
            </span>
          </div>
        </div>

        {/* Demos grid */}
        <div className="card-glass p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Ejemplos rápidos:
          </h3>
          <div className="demo-grid">
            {demoTexts.map((demo, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDemoSelect(demo)}
                className="demo-btn group text-left"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {index === 0 ? '🐦' : index === 1 ? '🤖' : index === 2 ? '📚' : '💧'}
                  </span>
                  <span className="text-slate-200 group-hover:text-white transition-colors line-clamp-2">
                    {demo}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Botón de submit */}
        <div className="text-center pt-6">
          <button
            type="submit"
            disabled={!inputText.trim() || tokenCount > MAX_TOKENS}
            className="navigation-button text-lg px-12 py-4 group"
            aria-disabled={!inputText.trim() || tokenCount > MAX_TOKENS}
          >
            <span className="text-2xl group-hover:rotate-12 transition-transform inline-block">
              🚀
            </span>
            <span>Comenzar Análisis</span>
            <span className="text-2xl group-hover:translate-x-1 transition-transform inline-block">
              →
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
