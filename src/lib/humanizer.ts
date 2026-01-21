/**
 * ============================================================================
 * CORE HUMANIZER ENGINE V2 - THREE-PHASE PROCESSING
 * ============================================================================
 * 
 * New Architecture:
 * 
 * PHASE 1: DE-AI (Strip AI patterns)
 *   - Remove em dashes
 *   - Replace fancy words with simple ones
 *   - Break uniform sentence structures
 *   - Remove AI phrase patterns
 * 
 * PHASE 2: HUMANIZE (Add human patterns)
 *   - Add contractions
 *   - Add natural speech patterns
 *   - Create burstiness
 *   - Add occasional typos/spacing
 * 
 * PHASE 3: VERIFY (Test and improve)
 *   - Run through verification agent
 *   - If fails, send back with specific feedback
 *   - Up to 3 improvement loops
 * 
 * ============================================================================
 */

import { generateContent } from './gemini';
import { generateDeAIPrompt } from './prompts/deai-prompt';
import { 
  generateHumanizerPrompt, 
  generateInputPrompt,
  HumanizerConfig 
} from './prompts/humanizer-prompt';
import { 
  generateVerificationPrompt, 
  generateImprovementPrompt,
  parseVerificationResult,
  VERIFICATION_THRESHOLD,
  VerificationResult 
} from './prompts/verification-prompt';
import { 
  HumanizationRequest, 
  HumanizationResult, 
  HumanizationAttempt,
  ProcessingUpdate,
  AIProvider 
} from './types';

const MAX_IMPROVEMENT_ATTEMPTS = 3;

/**
 * Main humanization function with three-phase processing
 */
export async function humanizeText(
  request: HumanizationRequest,
  userHistory: string[] = [],
  onUpdate?: (update: ProcessingUpdate) => void
): Promise<HumanizationResult> {
  const startTime = Date.now();
  const attempts: HumanizationAttempt[] = [];
  const provider = request.provider || 'groq';
  
  const config: HumanizerConfig = {
    mode: request.mode,
    intensity: request.intensity,
    preserveKeyPoints: request.preserveKeyPoints,
    targetAudience: request.targetAudience,
    userHistory: userHistory
  };

  let currentText = request.text;
  let finalText = '';
  let finalScore = 0;
  let attemptNumber = 0;

  try {
    // =========================================================================
    // PHASE 1: DE-AI - Strip AI patterns
    // =========================================================================
    onUpdate?.({
      status: 'deai',
      currentAttempt: 0,
      maxAttempts: MAX_IMPROVEMENT_ATTEMPTS + 1,
      message: 'Phase 1: Stripping AI patterns from text...'
    });

    const deaiPrompt = generateDeAIPrompt(request.text);
    let deaidText = await generateContent(deaiPrompt, provider);
    deaidText = cleanOutput(deaidText);
    
    // Post-process to ensure em dashes are removed
    deaidText = removeEmDashes(deaidText);

    // =========================================================================
    // PHASE 2: HUMANIZE - Add human patterns
    // =========================================================================
    onUpdate?.({
      status: 'humanizing',
      currentAttempt: 1,
      maxAttempts: MAX_IMPROVEMENT_ATTEMPTS + 1,
      message: 'Phase 2: Adding human patterns...'
    });

    const humanizerPrompt = generateHumanizerPrompt(config);
    const inputPrompt = generateInputPrompt(deaidText);
    
    let humanizedText = await generateContent(humanizerPrompt + inputPrompt, provider);
    humanizedText = cleanOutput(humanizedText);
    humanizedText = removeEmDashes(humanizedText);
    humanizedText = postProcessHumanText(humanizedText);
    
    attemptNumber = 1;

    // =========================================================================
    // PHASE 3: VERIFY - Test and improve
    // =========================================================================
    onUpdate?.({
      status: 'verifying',
      currentAttempt: attemptNumber,
      maxAttempts: MAX_IMPROVEMENT_ATTEMPTS + 1,
      message: 'Phase 3: Testing with verification agent...'
    });

    let verificationResult = await verifyText(humanizedText, provider);
    
    attempts.push({
      attemptNumber,
      humanizedText,
      verificationScore: verificationResult.score,
      passed: verificationResult.passed,
      feedback: verificationResult.overallAssessment,
      timestamp: new Date()
    });

    finalText = humanizedText;
    finalScore = verificationResult.score;

    // =========================================================================
    // IMPROVEMENT LOOP - If verification fails
    // =========================================================================
    while (!verificationResult.passed && attemptNumber < MAX_IMPROVEMENT_ATTEMPTS + 1) {
      attemptNumber++;

      onUpdate?.({
        status: 'improving',
        currentAttempt: attemptNumber,
        maxAttempts: MAX_IMPROVEMENT_ATTEMPTS + 1,
        currentScore: verificationResult.score,
        message: `Score ${(verificationResult.score * 100).toFixed(1)}% (need 75%+). Improving... (Attempt ${attemptNumber})`
      });

      // Generate improved version using feedback
      const improvementPrompt = generateImprovementPrompt(
        request.text,
        humanizedText,
        verificationResult,
        attemptNumber
      );

      humanizedText = await generateContent(humanizerPrompt + improvementPrompt, provider);
      humanizedText = cleanOutput(humanizedText);
      humanizedText = removeEmDashes(humanizedText);
      humanizedText = postProcessHumanText(humanizedText);

      // Verify the improved version
      onUpdate?.({
        status: 'verifying',
        currentAttempt: attemptNumber,
        maxAttempts: MAX_IMPROVEMENT_ATTEMPTS + 1,
        message: `Verifying improved version (Attempt ${attemptNumber})...`
      });

      verificationResult = await verifyText(humanizedText, provider);

      attempts.push({
        attemptNumber,
        humanizedText,
        verificationScore: verificationResult.score,
        passed: verificationResult.passed,
        feedback: verificationResult.overallAssessment,
        timestamp: new Date()
      });

      // Keep the best version
      if (verificationResult.score > finalScore) {
        finalText = humanizedText;
        finalScore = verificationResult.score;
      }
    }

    const totalProcessingTime = Date.now() - startTime;

    onUpdate?.({
      status: 'completed',
      currentAttempt: attemptNumber,
      maxAttempts: MAX_IMPROVEMENT_ATTEMPTS + 1,
      currentScore: finalScore,
      message: finalScore >= VERIFICATION_THRESHOLD 
        ? `✓ Success! Score: ${(finalScore * 100).toFixed(1)}%` 
        : `Best result: ${(finalScore * 100).toFixed(1)}%`
    });

    return {
      success: finalScore >= VERIFICATION_THRESHOLD,
      originalText: request.text,
      finalText,
      finalScore,
      attempts,
      totalProcessingTime,
      mode: request.mode,
      intensity: request.intensity
    };

  } catch (error) {
    console.error('Humanization error:', error);
    
    onUpdate?.({
      status: 'error',
      currentAttempt: attemptNumber,
      maxAttempts: MAX_IMPROVEMENT_ATTEMPTS + 1,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });

    throw error;
  }
}

/**
 * Verify text using the verification agent
 */
async function verifyText(text: string, provider: AIProvider = 'groq'): Promise<VerificationResult> {
  const verificationPrompt = generateVerificationPrompt(text);
  const response = await generateContent(verificationPrompt, provider);
  return parseVerificationResult(response);
}

/**
 * Remove ALL em dashes and replace with appropriate alternatives
 */
function removeEmDashes(text: string): string {
  // Replace em dash with comma-space or period-space depending on context
  let result = text;
  
  // Em dash (—)
  result = result.replace(/—/g, ', ');
  
  // En dash (–) 
  result = result.replace(/–/g, ', ');
  
  // Double hyphen sometimes used as em dash
  result = result.replace(/--/g, ', ');
  
  // Clean up double commas or comma-periods that might result
  result = result.replace(/,\s*,/g, ',');
  result = result.replace(/,\s*\./g, '.');
  result = result.replace(/\s+,/g, ',');
  
  return result;
}

/**
 * Post-process to add subtle human imperfections
 */
function postProcessHumanText(text: string): string {
  let result = text;
  
  // Randomly remove space after comma in 1-2 places for longer text
  if (text.length > 300) {
    const commaMatches = Array.from(result.matchAll(/, /g));
    if (commaMatches.length > 5) {
      // Pick 1-2 random positions to remove space
      const numToRemove = Math.min(2, Math.floor(commaMatches.length / 10));
      const indices: number[] = [];
      for (let i = 0; i < numToRemove; i++) {
        const randomIndex = Math.floor(Math.random() * commaMatches.length);
        if (!indices.includes(randomIndex)) {
          indices.push(randomIndex);
        }
      }
      
      // Replace from end to start to preserve indices
      indices.sort((a, b) => b - a);
      for (const idx of indices) {
        const match = commaMatches[idx];
        if (match.index !== undefined) {
          result = result.slice(0, match.index) + ',' + result.slice(match.index + 2);
        }
      }
    }
  }
  
  return result;
}

/**
 * Clean the output by removing any meta-commentary
 */
function cleanOutput(text: string): string {
  const prefixesToRemove = [
    /^Here'?s? (?:is )?(?:the )?(?:humanized|de-AI'd|cleaned|improved) (?:version|text):?\s*/i,
    /^(?:Humanized|De-AI'd|Cleaned|Improved) (?:version|text):?\s*/i,
    /^Here you go:?\s*/i,
    /^Sure[,!]?\s*/i,
    /^Okay[,!]?\s*/i,
    /^Certainly[,!]?\s*/i,
    /^Of course[,!]?\s*/i,
    /^Absolutely[,!]?\s*/i,
    /^I've (?:humanized|processed|transformed).*?:\s*/i,
  ];

  let cleaned = text.trim();
  
  for (const prefix of prefixesToRemove) {
    cleaned = cleaned.replace(prefix, '');
  }

  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
  
  // Remove leading/trailing quotes if the whole text is quoted
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }

  return cleaned.trim();
}

/**
 * Quick humanization without verification (for preview/draft)
 */
export async function quickHumanize(
  text: string,
  mode: HumanizationRequest['mode'] = 'casual',
  intensity: HumanizationRequest['intensity'] = 'medium',
  provider: AIProvider = 'groq'
): Promise<string> {
  // Phase 1: De-AI
  const deaiPrompt = generateDeAIPrompt(text);
  let deaidText = await generateContent(deaiPrompt, provider);
  deaidText = cleanOutput(deaidText);
  deaidText = removeEmDashes(deaidText);
  
  // Phase 2: Humanize
  const config: HumanizerConfig = {
    mode,
    intensity,
    preserveKeyPoints: true
  };

  const humanizerPrompt = generateHumanizerPrompt(config);
  const inputPrompt = generateInputPrompt(deaidText);
  
  let result = await generateContent(humanizerPrompt + inputPrompt, provider);
  result = cleanOutput(result);
  result = removeEmDashes(result);
  result = postProcessHumanText(result);
  
  return result;
}

/**
 * Just verify text without humanizing (for testing)
 */
export async function verifyOnly(text: string, provider: AIProvider = 'groq'): Promise<VerificationResult> {
  return verifyText(text, provider);
}

/**
 * Just de-AI text without full humanization
 */
export async function deAIOnly(text: string, provider: AIProvider = 'groq'): Promise<string> {
  const deaiPrompt = generateDeAIPrompt(text);
  let result = await generateContent(deaiPrompt, provider);
  result = cleanOutput(result);
  result = removeEmDashes(result);
  return result;
}
