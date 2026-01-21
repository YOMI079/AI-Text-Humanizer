/**
 * ============================================================================
 * GLOBAL STATE MANAGEMENT WITH ZUSTAND
 * ============================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  HumanizationMode, 
  HumanizationIntensity, 
  ProcessingStatus,
  HumanizationResult,
  ProcessingUpdate,
  HistoryEntry,
  UserPreferences,
  AIProvider
} from './types';

interface AppState {
  // Input/Output
  inputText: string;
  outputText: string;
  
  // Settings
  mode: HumanizationMode;
  intensity: HumanizationIntensity;
  preserveKeyPoints: boolean;
  targetAudience: string;
  provider: AIProvider;
  
  // Processing State
  status: ProcessingStatus;
  currentAttempt: number;
  maxAttempts: number;
  currentScore: number | null;
  statusMessage: string;
  
  // Results
  lastResult: HumanizationResult | null;
  
  // History
  history: HistoryEntry[];
  
  // Actions
  setInputText: (text: string) => void;
  setOutputText: (text: string) => void;
  setMode: (mode: HumanizationMode) => void;
  setIntensity: (intensity: HumanizationIntensity) => void;
  setPreserveKeyPoints: (preserve: boolean) => void;
  setTargetAudience: (audience: string) => void;
  setProvider: (provider: AIProvider) => void;
  updateProcessingStatus: (update: ProcessingUpdate) => void;
  setLastResult: (result: HumanizationResult) => void;
  addHistoryEntry: (entry: HistoryEntry) => void;
  updateHistoryFeedback: (id: string, feedback: 'positive' | 'negative' | null) => void;
  deleteHistoryEntry: (id: string) => void;
  clearHistory: () => void;
  reset: () => void;
}

const initialState = {
  inputText: '',
  outputText: '',
  mode: 'casual' as HumanizationMode,
  intensity: 'medium' as HumanizationIntensity,
  preserveKeyPoints: true,
  targetAudience: '',
  provider: 'groq' as AIProvider,
  status: 'idle' as ProcessingStatus,
  currentAttempt: 0,
  maxAttempts: 4,
  currentScore: null,
  statusMessage: '',
  lastResult: null,
  history: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setInputText: (text) => set({ inputText: text }),
      
      setOutputText: (text) => set({ outputText: text }),
      
      setMode: (mode) => set({ mode }),
      
      setIntensity: (intensity) => set({ intensity }),
      
      setPreserveKeyPoints: (preserve) => set({ preserveKeyPoints: preserve }),
      
      setTargetAudience: (audience) => set({ targetAudience: audience }),
      
      setProvider: (provider) => set({ provider }),
      
      updateProcessingStatus: (update) => set({
        status: update.status,
        currentAttempt: update.currentAttempt,
        maxAttempts: update.maxAttempts,
        currentScore: update.currentScore ?? null,
        statusMessage: update.message,
      }),
      
      setLastResult: (result) => set({ 
        lastResult: result,
        outputText: result.finalText,
        status: 'completed',
        currentScore: result.finalScore,
      }),
      
      addHistoryEntry: (entry) => set((state) => ({
        history: [entry, ...state.history].slice(0, 100),
      })),
      
      updateHistoryFeedback: (id, feedback) => set((state) => ({
        history: state.history.map((entry) =>
          entry.id === id ? { ...entry, userFeedback: feedback } : entry
        ),
      })),
      
      deleteHistoryEntry: (id) => set((state) => ({
        history: state.history.filter((entry) => entry.id !== id),
      })),
      
      clearHistory: () => set({ history: [] }),
      
      reset: () => set({
        ...initialState,
        history: get().history, // Preserve history on reset
      }),
    }),
    {
      name: 'humanizer-storage',
      partialize: (state) => ({
        mode: state.mode,
        intensity: state.intensity,
        preserveKeyPoints: state.preserveKeyPoints,
        provider: state.provider,
        history: state.history,
      }),
    }
  )
);

/**
 * Get user's historical texts for model learning
 */
export function getHistoryTextsForLearning(): string[] {
  const state = useAppStore.getState();
  return state.history
    .filter(entry => 
      entry.userFeedback === 'positive' || 
      (entry.userFeedback !== 'negative' && entry.finalScore >= 0.8)
    )
    .slice(0, 10)
    .map(entry => entry.humanizedText);
}
