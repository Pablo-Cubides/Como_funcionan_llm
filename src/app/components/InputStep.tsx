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
    <div className="p-8 sm:p-12">
      <div className="text-center mb-12">
        <h1 className="step-title">
          Bienvenido a ExploraModelo
        </h1>
        
        {isExplanationMode && (
          <div className="step-description">
            <p>
              Descubre cómo funcionan los modelos de lenguaje paso a paso.
              Escribe una frase y observa el proceso completo desde la entrada 
              hasta la generación de texto.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="mb-8">
          <label htmlFor="input-text" className="block text-lg font-medium mb-2 text-slate-300">
            Escribe una frase para analizar:
          </label>
          <div className="relative">
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ej: La inteligencia artificial es fascinante..."
              className="text-input w-full h-28 resize-none pr-24"
              maxLength={200}
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-400">
              {inputText.length} / 200
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm text-slate-400">Tokens: {tokenCount} / {MAX_TOKENS}</div>
            {tokenCount > MAX_TOKENS && (
              <div className="text-sm" style={{ color: 'var(--danger)' }}>
                Límite de tokens superado — acorta tu frase (máx. {MAX_TOKENS}).
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-8">
          <span className="text-slate-400">— O —</span>
        </div>

        <div className="mb-8">
            <label htmlFor="demo-select" className="block text-sm font-medium text-slate-300 mb-2">Selecciona un ejemplo:</label>
            <select id="demo-select" value={selectedDemo} onChange={(e) => handleDemoSelect(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-md p-3 text-slate-100">
              <option value="">-- Elige un ejemplo --</option>
              {demoTexts.map((demo, index) => (
                <option key={index} value={demo}>{demo}</option>
              ))}
            </select>
        </div>

        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={!inputText.trim() || tokenCount > MAX_TOKENS}
            className="navigation-button text-lg px-10 py-3"
            aria-disabled={!inputText.trim() || tokenCount > MAX_TOKENS}
          >
            Comenzar Análisis
          </button>
        </div>
      </form>
    </div>
  );
}
