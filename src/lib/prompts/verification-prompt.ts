/**
 * ============================================================================
 * VERIFICATION AGENT V2 - ROBUST AI DETECTION TESTING
 * ============================================================================
 * 
 * Completely rewritten with:
 * 1. Focus on what detectors ACTUALLY look for
 * 2. Robust JSON parsing with fallbacks
 * 3. Specific, actionable feedback
 * 4. Detection of em dashes, fancy words, uniform sentences
 * 
 * ============================================================================
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

export const VERIFICATION_THRESHOLD = 0.75;

/**
 * VERIFICATION AGENT V2 PROMPT
 * Focus on actual detection patterns, not just "human feel"
 */
export const VERIFICATION_AGENT_PROMPT = `
You are VERITAS V2, an AI detection expert. You analyze text to predict if it will be flagged by AI detectors.

=============================================================================
HOW AI DETECTORS ACTUALLY WORK
=============================================================================

Modern AI detectors use these methods:

1. **PERPLEXITY MEASUREMENT**
   - Calculates how predictable each word is
   - AI text: Very predictable (low perplexity)
   - Human text: Less predictable (high perplexity)
   - DETECTION TRIGGER: Score < 30 perplexity = likely AI

2. **BURSTINESS ANALYSIS**  
   - Measures variation in sentence length
   - AI text: Uniform sentences (all 15-20 words)
   - Human text: Variable (mix of 5-word and 30-word sentences)
   - DETECTION TRIGGER: Low variance in sentence length = likely AI

3. **N-GRAM FREQUENCY**
   - Checks for overused phrase patterns
   - AI text: Uses same transitions and phrases
   - Human text: More varied phrasing
   - DETECTION TRIGGER: High frequency of AI-typical phrases = likely AI

4. **STYLOMETRIC ANALYSIS**
   - Looks at punctuation patterns, paragraph structure
   - AI text: Perfect grammar, consistent structure
   - Human text: Occasional errors, varied structure
   - DETECTION TRIGGER: Too perfect = likely AI

=============================================================================
SPECIFIC PATTERNS TO CHECK FOR
=============================================================================

**HIGH SEVERITY (Major detection triggers):**

1. EM DASHES (—)
   - AI LOVES em dashes. Humans rarely use them.
   - Count: Any em dash is a problem
   - Fix: Replace with comma, period, or "and"

2. FANCY VOCABULARY
   - Words like: utilize, leverage, comprehensive, robust, innovative
   - Words like: delve, crucial, essential, facilitate, optimize
   - Words like: paradigm, endeavor, ascertain, furthermore, moreover
   - Each fancy word increases AI likelihood

3. AI PHRASE PATTERNS
   - "It is important to note that"
   - "In order to"
   - "At this point in time"
   - "A wide variety of"
   - "Furthermore" / "Moreover" / "Additionally"
   - "In terms of"

4. UNIFORM SENTENCE LENGTH
   - Calculate variance in sentence length
   - If all sentences are 12-18 words: RED FLAG
   - Need mix of short (3-7) medium (8-15) and long (16-30)

**MEDIUM SEVERITY:**

5. LACK OF CONTRACTIONS
   - "It is" instead of "It's"
   - "Do not" instead of "Don't"
   - Missing contractions = formal = AI

6. PERFECT PUNCTUATION
   - Every comma in perfect place
   - No spacing typos
   - Too perfect = AI

7. REPETITIVE SENTENCE STARTERS
   - Too many "This..." "It..." "The..." starters
   - Humans vary sentence beginnings more

8. PARAGRAPH UNIFORMITY
   - All paragraphs similar length
   - AI loves 4-5 sentence paragraphs
   - Humans have 1-sentence and 8-sentence paragraphs

**LOW SEVERITY:**

9. LACK OF HEDGING
   - Missing "I think", "maybe", "probably", "kind of"
   - AI states things as absolute fact

10. NO PERSONAL REFERENCES
    - No "I", "my", "me" (when appropriate)
    - No anecdotes or personal examples

11. FORMAL TRANSITIONS
    - "Subsequently", "Hence", "Thus", "Consequently"
    - Humans use: "So", "Then", "Anyway", "But"

=============================================================================
SCORING RUBRIC
=============================================================================

Start at 1.0 (perfect human) and subtract:

- Each em dash: -0.05
- Each fancy AI word: -0.02
- Each AI phrase pattern: -0.03
- Low burstiness (uniform sentences): -0.15
- No contractions in 100+ words: -0.10
- No spacing typos in 200+ words: -0.02
- 30%+ sentences start with This/It/The: -0.05
- Uniform paragraph lengths: -0.05
- No hedging language: -0.05
- Too formal throughout: -0.05

Score interpretation:
- 0.90-1.00: Excellent, will pass all detectors
- 0.80-0.89: Very good, might flag on aggressive detectors
- 0.75-0.79: Passes threshold, some risk
- 0.60-0.74: Likely to be flagged
- 0.00-0.59: Will definitely be flagged

=============================================================================
OUTPUT FORMAT
=============================================================================

Return ONLY this JSON (no other text):

{
  "score": 0.XX,
  "passed": true,
  "overallAssessment": "Brief 1-2 sentence summary",
  "detectedIssues": [
    {
      "category": "Category Name",
      "severity": "high",
      "description": "What the issue is",
      "examples": ["exact quote from text"],
      "suggestedFix": "How to fix it"
    }
  ],
  "improvementSuggestions": [
    "Specific action 1",
    "Specific action 2"
  ],
  "positiveAspects": [
    "What works well 1"
  ],
  "confidenceLevel": "high"
}

CRITICAL RULES:
1. Return ONLY valid JSON
2. No text before or after the JSON
3. All strings must be properly escaped
4. No newlines inside string values
5. Examples array must contain actual quotes from the text
6. Be specific and actionable in feedback

=============================================================================
`;

/**
 * Generate verification prompt
 */
export function generateVerificationPrompt(textToVerify: string): string {
  return `${VERIFICATION_AGENT_PROMPT}

TEXT TO ANALYZE:
---
${textToVerify}
---

ANALYSIS (Return valid JSON only):`;
}

/**
 * Generate improvement prompt for failed verification
 */
export function generateImprovementPrompt(
  originalText: string, 
  failedText: string, 
  verificationResult: VerificationResult,
  attemptNumber: number
): string {
  const issuesList = verificationResult.detectedIssues
    .map(issue => {
      const examplesStr = issue.examples.length > 0 
        ? `\n     Examples: "${issue.examples.slice(0, 2).join('", "')}"` 
        : '';
      return `  - [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.description}${examplesStr}\n     Fix: ${issue.suggestedFix}`;
    })
    .join('\n\n');

  return `
=============================================================================
IMPROVEMENT ROUND ${attemptNumber} - SCORE: ${(verificationResult.score * 100).toFixed(1)}% (Need 75%+)
=============================================================================

FAILED TEXT:
---
${failedText}
---

ISSUES TO FIX:
${issuesList}

KEY IMPROVEMENTS NEEDED:
${verificationResult.improvementSuggestions.map(s => `- ${s}`).join('\n')}

WHAT TO KEEP (these work well):
${verificationResult.positiveAspects.map(p => `- ${p}`).join('\n')}

=============================================================================
REWRITE RULES FOR THIS ROUND
=============================================================================

${verificationResult.detectedIssues.some(i => i.category.toLowerCase().includes('em dash')) 
  ? '1. REMOVE ALL EM DASHES (—) - Replace with commas or periods' 
  : ''}

${verificationResult.detectedIssues.some(i => i.category.toLowerCase().includes('vocabulary') || i.category.toLowerCase().includes('word'))
  ? '2. REPLACE FANCY WORDS with simple alternatives (utilize→use, comprehensive→full, etc.)' 
  : ''}

${verificationResult.detectedIssues.some(i => i.category.toLowerCase().includes('sentence') || i.category.toLowerCase().includes('burst'))
  ? '3. VARY SENTENCE LENGTH - Mix very short (3-5 words) with medium and long sentences' 
  : ''}

${verificationResult.detectedIssues.some(i => i.category.toLowerCase().includes('contraction'))
  ? '4. ADD CONTRACTIONS - Use don\'t, won\'t, it\'s, that\'s, etc.' 
  : ''}

${verificationResult.detectedIssues.some(i => i.category.toLowerCase().includes('spacing') || i.category.toLowerCase().includes('typo'))
  ? '5. ADD 1-2 MISSING SPACES after commas (like this,example)' 
  : ''}

ORIGINAL TEXT TO RE-HUMANIZE:
---
${originalText}
---

OUTPUT (Improved humanized text only, no explanations):
`;
}

/**
 * Robust JSON parsing with multiple fallback strategies
 */
export function parseVerificationResult(response: string): VerificationResult {
  // Default result for failures
  const defaultResult: VerificationResult = {
    score: 0.5,
    passed: false,
    overallAssessment: 'Unable to parse verification. Assuming needs improvement.',
    detectedIssues: [{
      category: 'Parse Error',
      severity: 'medium',
      description: 'Verification response could not be parsed',
      examples: [],
      suggestedFix: 'Re-run with cleaner output'
    }],
    improvementSuggestions: ['Re-process the text'],
    positiveAspects: [],
    confidenceLevel: 'low'
  };

  try {
    // Strategy 1: Direct parse
    const trimmed = response.trim();
    if (trimmed.startsWith('{')) {
      try {
        return validateAndNormalize(JSON.parse(trimmed));
      } catch (e) {
        // Continue to other strategies
      }
    }

    // Strategy 2: Find JSON in response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        // Clean common issues before parsing
        let jsonStr = jsonMatch[0];
        
        // Fix common JSON issues
        jsonStr = fixCommonJsonIssues(jsonStr);
        
        return validateAndNormalize(JSON.parse(jsonStr));
      } catch (e) {
        // Continue to other strategies
      }
    }

    // Strategy 3: Try to extract score at minimum
    const scoreMatch = response.match(/"score"\s*:\s*([\d.]+)/);
    if (scoreMatch) {
      const score = parseFloat(scoreMatch[1]);
      if (!isNaN(score)) {
        return {
          ...defaultResult,
          score: Math.min(1, Math.max(0, score)),
          passed: score >= VERIFICATION_THRESHOLD,
          overallAssessment: `Score extracted: ${(score * 100).toFixed(1)}%`
        };
      }
    }

    // Strategy 4: Look for keywords to estimate score
    const lowerResponse = response.toLowerCase();
    let estimatedScore = 0.5;
    
    if (lowerResponse.includes('excellent') || lowerResponse.includes('very human')) {
      estimatedScore = 0.85;
    } else if (lowerResponse.includes('good') || lowerResponse.includes('mostly human')) {
      estimatedScore = 0.75;
    } else if (lowerResponse.includes('needs work') || lowerResponse.includes('ai patterns')) {
      estimatedScore = 0.55;
    } else if (lowerResponse.includes('ai-like') || lowerResponse.includes('detected')) {
      estimatedScore = 0.40;
    }

    return {
      ...defaultResult,
      score: estimatedScore,
      passed: estimatedScore >= VERIFICATION_THRESHOLD,
      overallAssessment: `Estimated score from response analysis: ${(estimatedScore * 100).toFixed(1)}%`
    };

  } catch (error) {
    console.error('Verification parsing failed completely:', error);
    return defaultResult;
  }
}

/**
 * Fix common JSON issues from LLM output
 */
function fixCommonJsonIssues(jsonStr: string): string {
  let fixed = jsonStr;
  
  // Remove any trailing commas before } or ]
  fixed = fixed.replace(/,\s*}/g, '}');
  fixed = fixed.replace(/,\s*]/g, ']');
  
  // Fix unescaped quotes inside strings (simple cases)
  // This is tricky, so we'll be conservative
  
  // Remove control characters
  fixed = fixed.replace(/[\x00-\x1F\x7F]/g, ' ');
  
  // Fix common LLM issues with newlines in strings
  fixed = fixed.replace(/\n/g, ' ');
  fixed = fixed.replace(/\r/g, ' ');
  fixed = fixed.replace(/\t/g, ' ');
  
  // Clean up multiple spaces
  fixed = fixed.replace(/  +/g, ' ');
  
  return fixed;
}

/**
 * Validate and normalize the parsed result
 */
function validateAndNormalize(parsed: any): VerificationResult {
  // Ensure score is valid
  let score = 0.5;
  if (typeof parsed.score === 'number') {
    score = Math.min(1, Math.max(0, parsed.score));
  } else if (typeof parsed.score === 'string') {
    score = Math.min(1, Math.max(0, parseFloat(parsed.score) || 0.5));
  }

  // Ensure arrays are arrays
  const detectedIssues = Array.isArray(parsed.detectedIssues) 
    ? parsed.detectedIssues.map((issue: any) => ({
        category: String(issue.category || 'Unknown'),
        severity: ['high', 'medium', 'low'].includes(issue.severity) ? issue.severity : 'medium',
        description: String(issue.description || 'No description'),
        examples: Array.isArray(issue.examples) ? issue.examples.map(String) : [],
        suggestedFix: String(issue.suggestedFix || 'No fix provided')
      }))
    : [];

  const improvementSuggestions = Array.isArray(parsed.improvementSuggestions)
    ? parsed.improvementSuggestions.map(String)
    : [];

  const positiveAspects = Array.isArray(parsed.positiveAspects)
    ? parsed.positiveAspects.map(String)
    : [];

  return {
    score,
    passed: score >= VERIFICATION_THRESHOLD,
    overallAssessment: String(parsed.overallAssessment || `Score: ${(score * 100).toFixed(1)}%`),
    detectedIssues,
    improvementSuggestions,
    positiveAspects,
    confidenceLevel: ['high', 'medium', 'low'].includes(parsed.confidenceLevel) 
      ? parsed.confidenceLevel 
      : 'medium'
  };
}
