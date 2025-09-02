'use client';

import { useEffect } from 'react';
import { tokenize, hashToken } from '../../utils/llm-simulation';
import { ProcessData } from '../../types';

interface TokenizationStepProps {
  inputText: string;
  processData: ProcessData | null;
  setProcessData: (data: ProcessData) => void;
  isExplanationMode: boolean;
}

export default function TokenizationStep({ 
  inputText, 
  processData, 
  setProcessData, 
  isExplanationMode 
}: TokenizationStepProps) {
  
  useEffect(() => {
    if (inputText && processData && processData.originalText === inputText && processData.tokens.length === 0) {
      const tokens = tokenize(inputText);
      const tokenIds = tokens.map(token => hashToken(token));
      
      setProcessData({
        ...processData,
        tokens,
        tokenIds
      });
    }
  }, [inputText, processData, setProcessData]);

  const getTokenColor = (index: number) => {
    const colors = [
      'bg-blue-600',
      'bg-green-600', 
      'bg-purple-600',
      'bg-yellow-600',
      'bg-pink-600',
      'bg-indigo-600'
    ];
    return colors[index % colors.length];
  };

  if (!processData?.tokens) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-xl">Procesando...</div>
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h2 className="step-title">
        Paso 1: Tokenización → IDs
      </h2>
      
      {isExplanationMode && (
        <div className="step-description">
          El texto se divide en <strong>tokens</strong> (palabras, símbolos) y cada uno 
          recibe un <strong>ID numérico</strong> único. Esto permite al modelo trabajar 
          con números en lugar de texto.
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold mb-4 text-white">Texto original:</h3>
          <div className="bg-[#1f1f23] border border-gray-600 rounded-lg p-6">
            <span className="text-xl text-gray-300">&ldquo;{processData.originalText}&rdquo;</span>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-4 text-white">
            Tokens identificados ({processData.tokens.length}):
          </h3>
          <div className="flex flex-wrap gap-3">
            {processData.tokens.map((token: string, index: number) => (
              <div
                key={index}
                className={`token-chip ${getTokenColor(index)} relative group`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-white font-bold text-lg">
                    {token === ' ' ? '␣' : token}
                  </span>
                  <span className="text-sm text-gray-200 mt-1">
                    #{index}
                  </span>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                              bg-black text-white px-2 py-1 rounded text-sm 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200
                              pointer-events-none whitespace-nowrap z-10">
                  Token: &ldquo;{token}&rdquo; | Posición: {index}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-4 text-white">
            IDs de tokens:
          </h3>
          <div className="bg-[#1f1f23] border border-gray-600 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {processData.tokens.map((token: string, index: number) => (
                <div
                  key={index}
                  className="bg-[#2d2d33] border border-gray-500 rounded-lg p-3 text-center"
                >
                  <div className="text-sm text-gray-400 mb-1">Token {index}</div>
                  <div className="text-white font-bold text-lg mb-1">
                    {token === ' ' ? '␣' : token}
                  </div>
                  <div className="text-red-400 font-mono text-lg">
                    ID: {processData.tokenIds[index]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isExplanationMode && (
          <div className="bg-[#1f1f23] border border-gray-600 rounded-lg p-6">
            <h4 className="text-xl font-bold mb-4 text-white">
              🔍 ¿Cómo funciona?
            </h4>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong>1. División:</strong> El texto se separa en unidades básicas 
                (palabras, espacios, puntuación).
              </p>
              <p>
                <strong>2. Asignación de IDs:</strong> Cada token único recibe un 
                número identificador del vocabulario del modelo.
              </p>
              <p>
                <strong>3. Consistencia:</strong> La misma palabra siempre tiene 
                el mismo ID, sin importar dónde aparezca.
              </p>
              <p>
                <strong>Siguiente paso:</strong> Estos IDs se convertirán en vectores 
                que el modelo puede procesar matemáticamente.
              </p>
            </div>
          </div>
        )}

        <div className="bg-[#0d1f0d] border border-green-600 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-green-400 text-2xl">✓</div>
            <div>
              <div className="text-green-400 font-bold text-lg">Tokenización completada</div>
              <div className="text-green-300">
                {processData.tokens.length} tokens procesados • IDs asignados • 
                Listo para el siguiente paso
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
