/**
 * ============================================================================
 * AI CLIENT - MULTI-PROVIDER SUPPORT
 * ============================================================================
 * 
 * Supports:
 * - Groq: llama-3.3-70b-versatile (FREE)
 * - Hugging Face: meta-llama/Llama-3.1-8B-Instruct (FREE)
 * 
 * ============================================================================
 */

import Groq from 'groq-sdk';
import { AIProvider } from './types';

let groqClient: Groq | null = null;

// Model configurations
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const HF_MODEL = 'openai/gpt-oss-20b';
const HF_API_URL = 'https://router.huggingface.co/novita/v3/openai/chat/completions';

// Current provider (default to groq)
let currentProvider: AIProvider = 'groq';

/**
 * Set the AI provider to use
 */
export function setProvider(provider: AIProvider): void {
  currentProvider = provider;
}

/**
 * Get the current provider
 */
export function getProvider(): AIProvider {
  return currentProvider;
}

/**
 * Initialize the Groq client
 */
export function initializeGroq(apiKey: string): void {
  if (!apiKey) {
    throw new Error('Groq API key is required');
  }
  groqClient = new Groq({ apiKey });
}

/**
 * Get the initialized Groq client
 */
export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    initializeGroq(apiKey);
  }
  return groqClient!;
}

/**
 * Generate content using Groq
 */
async function generateWithGroq(prompt: string): Promise<string> {
  const client = getGroqClient();
  
  const completion = await client.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.9,
    top_p: 0.95,
    max_tokens: 8192,
  });
  
  return completion.choices[0]?.message?.content || '';
}

/**
 * Generate content using Hugging Face Inference API
 */
async function generateWithHuggingFace(prompt: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY environment variable is not set');
  }

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      top_p: 0.95,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Generate content using the selected provider
 */
export async function generateContent(prompt: string, provider?: AIProvider): Promise<string> {
  const useProvider = provider || currentProvider;
  
  try {
    if (useProvider === 'huggingface') {
      return await generateWithHuggingFace(prompt);
    } else {
      return await generateWithGroq(prompt);
    }
  } catch (error) {
    console.error(`${useProvider} API error:`, error);
    throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate content with streaming (Groq only for now)
 */
export async function* generateContentStream(prompt: string): AsyncGenerator<string, void, unknown> {
  const client = getGroqClient();
  
  try {
    const stream = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      top_p: 0.95,
      max_tokens: 8192,
      stream: true,
    });
    
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error('Groq streaming error:', error);
    throw new Error(`Failed to stream content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
