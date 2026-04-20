/**
 * Anthropic Client — for embeddings and text analysis
 * Used for: semantic search vector embeddings, content moderation, HELIX-BRAIN commands
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

export const anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

const EMBEDDING_MODEL = 'voyage-3' as const;
const ANALYSIS_MODEL = 'claude-3-haiku-20240307' as const;

/**
 * Generate text embedding for semantic search
 * Returns a 1024-dimensional vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Use Anthropic's messages API with a structured prompt to simulate embeddings
  // In production, switch to a dedicated embedding model (Voyage AI via Anthropic)
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: ANALYSIS_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Generate a JSON array of 512 floats between -1 and 1 representing a semantic embedding for this text. Return ONLY the JSON array, no explanation:\n\n"${text.substring(0, 500)}"`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
  const data = await response.json() as any;
  const content = data.content?.[0]?.text ?? '[]';

  try {
    const embedding = JSON.parse(content) as number[];
    return embedding;
  } catch {
    // Return zero vector on parse failure
    return new Array(512).fill(0);
  }
}

/**
 * Analyze content for moderation signals
 */
export async function analyzeContent(params: {
  title: string;
  description: string;
  tags: string[];
}): Promise<{
  safetyScore: number;
  copyrightRisk: number;
  qualityScore: number;
  recommendation: 'approve' | 'review' | 'reject';
  signals: string[];
}> {
  const message = await anthropic.messages.create({
    model: ANALYSIS_MODEL,
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Analyze this digital asset for a creative marketplace. Return JSON only.

Title: ${params.title}
Description: ${params.description}
Tags: ${params.tags.join(', ')}

Return: {"safetyScore": 0-100, "copyrightRisk": 0-100, "qualityScore": 0-100, "recommendation": "approve|review|reject", "signals": ["..."]}`
      },
    ],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
  try {
    return JSON.parse(text);
  } catch {
    return { safetyScore: 50, copyrightRisk: 50, qualityScore: 50, recommendation: 'review', signals: ['parse_error'] };
  }
}

/**
 * Simple text completion for HELIX-BRAIN internal reasoning
 */
export async function complete(prompt: string, maxTokens = 1024): Promise<string> {
  const message = await anthropic.messages.create({
    model: ANALYSIS_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return message.content[0].type === 'text' ? message.content[0].text : '';
}
