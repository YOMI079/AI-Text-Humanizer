/**
 * ============================================================================
 * TYPE DEFINITIONS FOR AI TEXT HUMANIZER V2
 * ============================================================================
 */

export type HumanizationMode = 'casual' | 'professional' | 'academic' | 'creative' | 'conversational';
export type HumanizationIntensity = 'light' | 'medium' | 'heavy';
export type ProcessingStatus = 'idle' | 'deai' | 'humanizing' | 'verifying' | 'improving' | 'completed' | 'error';
export type AIProvider = 'groq' | 'huggingface';

/**
 * Configuration for humanization request
 */
export interface HumanizationRequest {
  text: string;
  mode: HumanizationMode;
  intensity: HumanizationIntensity;
  preserveKeyPoints: boolean;
  targetAudience?: string;
  provider?: AIProvider;
}

/**
 * Result from a single humanization attempt
 */
export interface HumanizationAttempt {
  attemptNumber: number;
  humanizedText: string;
  verificationScore: number;
  passed: boolean;
  feedback?: string;
  timestamp: Date;
}

/**
 * Complete humanization result with all attempts
 */
export interface HumanizationResult {
  success: boolean;
  originalText: string;
  finalText: string;
  finalScore: number;
  attempts: HumanizationAttempt[];
  totalProcessingTime: number;
  mode: HumanizationMode;
  intensity: HumanizationIntensity;
}

/**
 * Verification result from the testing agent
 */
export interface VerificationResult {
  score: number;
  passed: boolean;
  overallAssessment: string;
  detectedIssues: DetectedIssue[];
  improvementSuggestions: string[];
  positiveAspects: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface DetectedIssue {
  category: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  examples: string[];
  suggestedFix: string;
}

/**
 * History entry for learning from user patterns
 */
export interface HistoryEntry {
  id: string;
  originalText: string;
  humanizedText: string;
  mode: HumanizationMode;
  intensity: HumanizationIntensity;
  finalScore: number;
  attempts: number;
  createdAt: Date;
  userFeedback?: 'positive' | 'negative' | null;
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  defaultMode: HumanizationMode;
  defaultIntensity: HumanizationIntensity;
  preserveKeyPoints: boolean;
  maxRetries: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Real-time processing update for UI
 */
export interface ProcessingUpdate {
  status: ProcessingStatus;
  currentAttempt: number;
  maxAttempts: number;
  currentScore?: number;
  message: string;
}
