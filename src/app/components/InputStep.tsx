'use client';

import { useState } from 'react';

interface InputStepProps {
  demoTexts: string[];
  onStartProcess: (text: string) => void;
  isExplanationMode: boolean;
}

export default function InputStep({ demoTexts, onStartProcess, isExplanationMode }: InputStepProps) {
  const [inputText, setInputText] = useState('');
  const [selectedDemo, setSelectedDemo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText || selectedDemo;
    if (text.trim()) {
      onStartProcess(text.trim());
    }
  };

  const handleDemoSelect = (demo: string) => {
    setSelectedDemo(demo);
    setInputText(demo);
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="step-title">
          Bienvenido a ExploraModelo
        </h1>
        
        {isExplanationMode && (
          <div className="step-description">
            <p className="mb-4">
              Descubre cómo funcionan los modelos de lenguaje paso a paso.
              Escribe una frase y observa el proceso completo desde la entrada 
              hasta la generación de texto.
            </p>
            <p>
              Veremos: tokenización, vectores, atención, probabilidades y 
              generación autoregresiva.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="input-text" className="block text-xl font-semibold mb-4 text-white">
            Escribe una frase para analizar:
          </label>
          <textarea
            id="input-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ejemplo: Los pájaros vuelan porque tienen alas..."
            className="text-input w-full h-32 resize-none"
            maxLength={200}
          />
          <div className="text-right text-gray-400 mt-2">
            {inputText.length}/200 caracteres
          </div>
        </div>

        <div className="text-center">
          <span className="text-xl font-semibold text-gray-300">O selecciona un ejemplo:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoTexts.map((demo, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleDemoSelect(demo)}
              className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedDemo === demo
                  ? 'border-red-600 bg-[#2d1f1f] text-white'
                  : 'border-gray-600 bg-[#1f1f23] text-gray-300 hover:border-gray-500 hover:bg-[#252529]'
              }`}
            >
              <div className="text-lg font-medium">
                Ejemplo {index + 1}
              </div>
              <div className="text-base mt-1 leading-relaxed">
                {demo}
              </div>
            </button>
          ))}
        </div>

        <div className="text-center pt-8">
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="navigation-button text-xl px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Comenzar análisis →
          </button>
        </div>
      </form>

      {isExplanationMode && (
        <div className="mt-12 bg-[#1f1f23] border border-gray-600 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-white">
            💡 ¿Qué veremos?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">1. Tokenización</h4>
              <p>El texto se divide en tokens (palabras/símbolos)</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">2. Vectores</h4>
              <p>Cada token se convierte en números + posición</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">3. Atención</h4>
              <p>El modelo decide qué tokens son importantes</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">4. Predicción</h4>
              <p>Se calculan probabilidades para el siguiente token</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
