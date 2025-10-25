
 'use client';

import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { ProcessData } from '../types';
import { generateEmbedding, generatePositionalEncoding, addVectors, computeMultiHeadAttention, generateVocabulary, computeProbabilities, sampleNextToken, runLLMStep } from '../utils/llm-simulation';

// 1. Definir el estado y las acciones
export interface AppState {
  currentStep: number;
  inputText: string;
  isExplanationMode: boolean;
  processData: ProcessData | null;
}

export type Action =
  | { type: 'START_PROCESS'; payload: { text: string } }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'RESTART' }
  | { type: 'TOGGLE_EXPLANATION_MODE' }
  | { type: 'SET_PROCESS_DATA'; payload: ProcessData }
  | { type: 'COMPUTE_EMBEDDINGS'; payload: { tokenIds: number[]; tokens: string[] } }
  | { type: 'COMPUTE_ATTENTION'; payload?: { numHeads?: number } }
  | { type: 'COMPUTE_PROBABILITIES'; payload?: { seed?: number } }
  | { type: 'GENERATE_NEXT'; payload?: { strategy?: 'greedy' | 'random' | 'top-k' | number; k?: number } };

export const initialState: AppState = {
  currentStep: 0,
  inputText: '',
  isExplanationMode: true,
  processData: null,
};

// 2. Crear el reducer
export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'START_PROCESS':
      return {
        ...state,
        currentStep: 1,
        inputText: action.payload.text,
        processData: {
          originalText: action.payload.text,
          tokens: [],
          tokenIds: [],
          embeddings: [],
          positionalEncodings: [],
          combinedEmbeddings: [],
          attentionHeads: [],
          attentionWeights: [],
          attentionScores: [],
          contextVectors: [],
          probabilities: [],
          generatedTokens: [],
          vocabulary: [],
        },
      };
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'RESTART':
      return {
        ...initialState,
        isExplanationMode: state.isExplanationMode, // Mantener el modo explicación
      };
    case 'TOGGLE_EXPLANATION_MODE':
      return {
        ...state,
        isExplanationMode: !state.isExplanationMode,
      };
    case 'SET_PROCESS_DATA':
      return {
        ...state,
        processData: action.payload,
      };
    case 'COMPUTE_EMBEDDINGS': {
      const { tokenIds, tokens } = action.payload;
      const embeddings = tokenIds.map(id => generateEmbedding(id, 16));
      const positionalEncodings = tokens.map((_, index) => generatePositionalEncoding(index, 16));
      const combinedEmbeddings = embeddings.map((emb, index) => addVectors(emb, positionalEncodings[index]));
      return {
        ...state,
        processData: state.processData ? { ...state.processData, embeddings, positionalEncodings, combinedEmbeddings } : state.processData,
      };
    }
    case 'COMPUTE_ATTENTION': {
      if (!state.processData?.combinedEmbeddings) return state;
      const { numHeads = 4 } = action.payload ?? {};
      const { heads, combinedWeights } = computeMultiHeadAttention(state.processData.combinedEmbeddings, numHeads, 16);
      return {
        ...state,
        processData: { ...state.processData, attentionHeads: heads, attentionWeights: combinedWeights },
      };
    }
    case 'COMPUTE_PROBABILITIES': {
      if (!state.processData?.combinedEmbeddings) return state;
      const { seed = 42 } = action.payload ?? {};
      const vocabulary = state.processData.vocabulary && state.processData.vocabulary.length ? state.processData.vocabulary : generateVocabulary();
      const lastEmbedding = state.processData.combinedEmbeddings[state.processData.combinedEmbeddings.length - 1];
      const probabilities = computeProbabilities(lastEmbedding, vocabulary, seed, state.processData.originalText);
      return {
        ...state,
        processData: { ...state.processData, vocabulary, probabilities },
      };
    }
    case 'GENERATE_NEXT': {
      if (!state.processData) return state;
      const strategy = action.payload?.strategy ?? 'greedy';
      const k = action.payload?.k ?? 5;
      const probs = state.processData.probabilities || [];
      if (!probs.length) return state;

  const nextToken = typeof strategy === 'number' ? sampleNextToken(probs, strategy) : sampleNextToken(probs, strategy as 'greedy' | 'random' | 'top-k', k);
      const newText = (state.processData.originalText || '') + ' ' + nextToken;
      const updated = runLLMStep(state.processData, newText);

      return {
        ...state,
        processData: { ...updated, generatedTokens: [...(state.processData.generatedTokens || []), nextToken] },
      };
    }
    default:
      return state;
  }
}

// 3. Crear el Context
const ProcessContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

// 4. Crear el Provider
export function ProcessProvider({ children }: { children: ReactNode }) {
  // Siempre iniciar desde el paso 0 para evitar problemas de hidratación
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Limpiar localStorage al montar para evitar estados inconsistentes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('exploramodelo_state');
    }
  }, []);

  // Persist a safe subset of state to localStorage with debounce
  useEffect(() => {
    if (typeof window === 'undefined') return;

  const toPersist: unknown = {
      currentStep: state.currentStep,
      inputText: state.inputText,
      isExplanationMode: state.isExplanationMode,
        processData: state.processData
        ? ({
            originalText: state.processData.originalText,
            tokens: state.processData.tokens,
            tokenIds: state.processData.tokenIds,
            generatedTokens: state.processData.generatedTokens,
            vocabulary: state.processData.vocabulary,
          } as unknown as Partial<ProcessData>)
        : null,
    };

    const id = setTimeout(() => {
      try {
        window.localStorage.setItem('exploramodelo_state', JSON.stringify(toPersist));
      } catch (e) {
        // ignore quota errors
      }
    }, 300);

    return () => clearTimeout(id);
  }, [state.currentStep, state.inputText, state.isExplanationMode, state.processData]);

  return (
    <ProcessContext.Provider value={{ state, dispatch }}>
      {children}
    </ProcessContext.Provider>
  );
}

// 5. Crear el custom hook
export function useProcess() {
  const context = useContext(ProcessContext);
  if (context === undefined) {
    throw new Error('useProcess must be used within a ProcessProvider');
  }
  return context;
}
