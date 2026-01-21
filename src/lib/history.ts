/**
 * ============================================================================
 * HISTORY MANAGEMENT SYSTEM
 * ============================================================================
 * 
 * Manages the history of humanization sessions for:
 * 1. User reference (view past conversions)
 * 2. Model learning (extract human writing patterns)
 * 3. Continuous improvement (learn from user feedback)
 * 
 * ============================================================================
 */

import { HistoryEntry, HumanizationMode, HumanizationIntensity } from './types';

const HISTORY_STORAGE_KEY = 'humanizer_history';
const MAX_HISTORY_ENTRIES = 100;
const HISTORY_FOR_LEARNING = 10; // Use last N entries for learning

/**
 * Get all history entries from localStorage
 */
export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((entry: any) => ({
      ...entry,
      createdAt: new Date(entry.createdAt)
    }));
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

/**
 * Add a new entry to history
 */
export function addToHistory(entry: Omit<HistoryEntry, 'id' | 'createdAt'>): HistoryEntry {
  const history = getHistory();
  
  const newEntry: HistoryEntry = {
    ...entry,
    id: generateId(),
    createdAt: new Date()
  };
  
  // Add to beginning of array
  history.unshift(newEntry);
  
  // Trim to max entries
  const trimmedHistory = history.slice(0, MAX_HISTORY_ENTRIES);
  
  saveHistory(trimmedHistory);
  
  return newEntry;
}

/**
 * Update user feedback for an entry
 */
export function updateFeedback(id: string, feedback: 'positive' | 'negative' | null): void {
  const history = getHistory();
  const index = history.findIndex(entry => entry.id === id);
  
  if (index !== -1) {
    history[index].userFeedback = feedback;
    saveHistory(history);
  }
}

/**
 * Delete a history entry
 */
export function deleteHistoryEntry(id: string): void {
  const history = getHistory();
  const filtered = history.filter(entry => entry.id !== id);
  saveHistory(filtered);
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}

/**
 * Get history entries for model learning
 * Returns humanized texts that received positive feedback or high scores
 */
export function getHistoryForLearning(): string[] {
  const history = getHistory();
  
  // Prioritize entries with positive feedback, then high scores
  const goodEntries = history
    .filter(entry => 
      entry.userFeedback === 'positive' || 
      (entry.userFeedback !== 'negative' && entry.finalScore >= 0.8)
    )
    .slice(0, HISTORY_FOR_LEARNING);
  
  return goodEntries.map(entry => entry.humanizedText);
}

/**
 * Get original texts from history for pattern analysis
 */
export function getOriginalTextsForAnalysis(): string[] {
  const history = getHistory();
  return history
    .filter(entry => entry.userFeedback !== 'negative')
    .slice(0, HISTORY_FOR_LEARNING)
    .map(entry => entry.originalText);
}

/**
 * Get statistics about humanization history
 */
export function getHistoryStats() {
  const history = getHistory();
  
  if (history.length === 0) {
    return {
      totalEntries: 0,
      averageScore: 0,
      successRate: 0,
      averageAttempts: 0,
      modeDistribution: {} as Record<HumanizationMode, number>,
      intensityDistribution: {} as Record<HumanizationIntensity, number>
    };
  }
  
  const totalScore = history.reduce((sum, entry) => sum + entry.finalScore, 0);
  const successCount = history.filter(entry => entry.finalScore >= 0.75).length;
  const totalAttempts = history.reduce((sum, entry) => sum + entry.attempts, 0);
  
  const modeDistribution: Record<HumanizationMode, number> = {
    casual: 0,
    professional: 0,
    academic: 0,
    creative: 0,
    conversational: 0
  };
  
  const intensityDistribution: Record<HumanizationIntensity, number> = {
    light: 0,
    medium: 0,
    heavy: 0
  };
  
  history.forEach(entry => {
    modeDistribution[entry.mode]++;
    intensityDistribution[entry.intensity]++;
  });
  
  return {
    totalEntries: history.length,
    averageScore: totalScore / history.length,
    successRate: successCount / history.length,
    averageAttempts: totalAttempts / history.length,
    modeDistribution,
    intensityDistribution
  };
}

/**
 * Export history as JSON
 */
export function exportHistory(): string {
  const history = getHistory();
  return JSON.stringify(history, null, 2);
}

/**
 * Import history from JSON
 */
export function importHistory(json: string): boolean {
  try {
    const imported = JSON.parse(json);
    if (!Array.isArray(imported)) return false;
    
    const currentHistory = getHistory();
    const mergedHistory = [...imported, ...currentHistory]
      .slice(0, MAX_HISTORY_ENTRIES);
    
    saveHistory(mergedHistory);
    return true;
  } catch (error) {
    console.error('Failed to import history:', error);
    return false;
  }
}

// Helper functions
function saveHistory(history: HistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
