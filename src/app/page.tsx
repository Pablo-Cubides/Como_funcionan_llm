'use client';

import { useState, useCallback } from 'react';
import InputStep from './components/InputStep';
import TokenizationStep from './components/TokenizationStep';
import EmbeddingStep from './components/EmbeddingStep';
import AttentionStep from './components/AttentionStep';
import ProbabilityStep from './components/ProbabilityStep';
import AutoregressiveStep from './components/AutoregressiveStep';
import Stepper from './components/Stepper';
import { ProcessData } from '../types';

const DEMO_TEXTS = [
  "Los pájaros vuelan porque tienen alas",
  "La inteligencia artificial es una tecnología fascinante",
  "Para estudiar mejor, recomiendo hacer resúmenes",
  "El agua hierve cuando alcanza cien grados",
  "La comida colombiana tiene sabores únicos",
  "Para ahorrar dinero, planifica tus gastos",
  "El mejor deporte para la salud es nadar",
  "En vacaciones, quiero visitar la playa",
  "La ciudad que más me gusta es Barcelona",
  "Un buen líder inspira a su equipo"
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputText, setInputText] = useState('');
  const [isExplanationMode, setIsExplanationMode] = useState(true);
  const [processData, setProcessData] = useState<ProcessData | null>(null);

  const stableSetProcessData = useCallback((data: ProcessData) => {
    setProcessData(data);
  }, []);

  const steps = [
    'Entrada de texto',
    'Tokenización → IDs',
    'Vectores + Posición',
    'Self-Attention',
    'Probabilidades',
    'Bucle autoregresivo'
  ];

  const handleStartProcess = (text: string) => {
    setInputText(text);
    setCurrentStep(1);
    // Initialize process data that will be passed between steps
    setProcessData({
      originalText: text,
      tokens: [],
      tokenIds: [],
      embeddings: [],
      positionalEncodings: [],
      combinedEmbeddings: [],
      attentionWeights: [],
      attentionScores: [],
      contextVectors: [],
      probabilities: [],
      generatedTokens: [],
      vocabulary: []
    });
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setInputText('');
    setProcessData(null);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <InputStep
            demoTexts={DEMO_TEXTS}
            onStartProcess={handleStartProcess}
            isExplanationMode={isExplanationMode}
          />
        );
      case 1:
        return (
          <TokenizationStep
            inputText={inputText}
            processData={processData}
            setProcessData={stableSetProcessData}
            isExplanationMode={isExplanationMode}
          />
        );
      case 2:
        return (
          <EmbeddingStep
            processData={processData}
            setProcessData={stableSetProcessData}
            isExplanationMode={isExplanationMode}
          />
        );
      case 3:
        return (
          <AttentionStep
            processData={processData}
            setProcessData={stableSetProcessData}
            isExplanationMode={isExplanationMode}
          />
        );
      case 4:
        return (
          <ProbabilityStep
            processData={processData}
            setProcessData={stableSetProcessData}
            isExplanationMode={isExplanationMode}
          />
        );
      case 5:
        return (
          <AutoregressiveStep
            processData={processData}
            setProcessData={stableSetProcessData}
            isExplanationMode={isExplanationMode}
            onRestart={handleRestart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white">
      <header className="p-6 border-b border-gray-600">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">
            ExploraModelo
          </h1>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-lg">
              <input
                type="checkbox"
                checked={isExplanationMode}
                onChange={(e) => setIsExplanationMode(e.target.checked)}
                className="w-5 h-5"
              />
              Modo explicación
            </label>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {currentStep > 0 && (
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
        )}
        
        <div className="step-container">
          {renderCurrentStep()}
        </div>
      </main>
    </div>
  );
}
