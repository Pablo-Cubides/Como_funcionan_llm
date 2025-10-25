"use client"

import React, { useState, useEffect } from 'react'
import InputStep from './components/InputStep'
import TokenizationStep from './components/TokenizationStep'
import EmbeddingStep from './components/EmbeddingStep'
import AttentionStep from './components/AttentionStep'
import ProbabilityStep from './components/ProbabilityStep'
import AutoregressiveStep from './components/AutoregressiveStep'
import BibliographyStep from './components/BibliographyStep'
import { ProcessProvider, useProcess } from '../context/ProcessContext'

const DEMO_TEXTS = [
  "Los pájaros vuelan porque tienen alas",
  "La inteligencia artificial es una tecnología fascinante",
  "Para estudiar mejor, recomiendo hacer resúmenes",
  "El agua hierve cuando alcanza cien grados",
]

export default function Page(){
  return (
    <ProcessProvider>
      <ExploraModeloApp />
    </ProcessProvider>
  )
}

function ExploraModeloApp(){
  const { state, dispatch } = useProcess()
  const currentStep = state.currentStep ?? 0
  const [isMounted, setIsMounted] = useState(false)

  // Evitar error de hidratación - solo renderizar checkmarks en el cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const steps = [
    { id: 0, label: 'Entrada', icon: '✏️' },
    { id: 1, label: 'Tokenización', icon: '🔤' },
    { id: 2, label: 'Embeddings', icon: '📊' },
    { id: 3, label: 'Atención', icon: '🎯' },
    { id: 4, label: 'Probabilidades', icon: '📈' },
    { id: 5, label: 'Generación', icon: '✨' },
    { id: 6, label: 'Bibliografía', icon: '📚' }
  ]

  const goToStep = (stepId: number) => {
    dispatch({ type: 'SET_STEP', payload: stepId })
  }

  const goNext = () => {
    if (currentStep < 6) {
      dispatch({ type: 'SET_STEP', payload: currentStep + 1 })
    }
  }

  const restart = () => {
    dispatch({ type: 'RESTART' })
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <div className="brand-icon">🧠</div>
            <div className="brand-text">
              <h1>ExploraModelo</h1>
              <p>Aprende cómo funcionan los LLM paso a paso</p>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="toggle-container">
              <span className="toggle-label">Modo Explicación</span>
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={state.isExplanationMode} 
                  onChange={() => dispatch({ type: 'TOGGLE_EXPLANATION_MODE' })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Progress Stepper */}
        <div className="progress-container">
          <div className="stepper">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div 
                  className={`step-item ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                  onClick={() => goToStep(step.id)}
                >
                  <div className="step-circle">
                    {isMounted && currentStep > step.id ? '✓' : step.icon}
                  </div>
                  <span className="step-label">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`step-connector ${currentStep > step.id ? 'completed' : ''}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{steps[currentStep].label}</h2>
            <p className="card-subtitle">
              {currentStep === 0 && 'Escribe o selecciona un texto de ejemplo para comenzar el proceso'}
              {currentStep === 1 && 'Observa cómo el texto se divide en tokens individuales'}
              {currentStep === 2 && 'Cada token se convierte en un vector de números (embedding) más codificación posicional'}
              {currentStep === 3 && 'El modelo aprende qué tokens son relevantes entre sí mediante self-attention'}
              {currentStep === 4 && 'El modelo calcula la probabilidad para cada posible siguiente token'}
              {currentStep === 5 && 'Generamos texto autoregresivamente: predecir → agregar → repetir'}
              {currentStep === 6 && 'Explora papers fundamentales y recursos para profundizar en cada concepto'}
            </p>
          </div>

          <div className="card-body">
            {currentStep === 0 && (
              <InputStep 
                demoTexts={DEMO_TEXTS} 
                onNext={goNext}
              />
            )}
            
            {currentStep === 1 && (
              <TokenizationStep 
                onNext={goNext}
              />
            )}
            
            {currentStep === 2 && (
              <EmbeddingStep 
                onNext={goNext}
              />
            )}
            
            {currentStep === 3 && (
              <AttentionStep 
                onNext={goNext}
              />
            )}
            
            {currentStep === 4 && (
              <ProbabilityStep 
                onNext={goNext}
              />
            )}
            
            {currentStep === 5 && (
              <AutoregressiveStep 
                onRestart={restart}
                onNext={goNext}
              />
            )}
            
            {currentStep === 6 && (
              <BibliographyStep 
                onRestart={restart}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
