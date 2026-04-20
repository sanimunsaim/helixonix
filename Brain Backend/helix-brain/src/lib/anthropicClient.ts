/**
 * Anthropic SDK Wrapper
 * Handles all AI reasoning calls with retry logic and error resilience
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger, logAIDecision } from './logger';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

let client: Anthropic | null = null;

/**
 * Get or create Anthropic client (singleton)
 */
export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Execute Anthropic API call with exponential backoff retry
 */
export async function callAnthropic<T>(
  operation: () => Promise<T>,
  context: { operation: string; [key: string]: unknown }
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const startTime = Date.now();
      const result = await operation();
      const duration = Date.now() - startTime;

      logger.debug(
        { attempt, duration_ms: duration, ...context },
        'Anthropic API call successful'
      );

      return result;
    } catch (error) {
      lastError = error as Error;
      const isRetryable =
        error instanceof Anthropic.APIError &&
        (error.status === 429 || error.status === 500 || error.status === 503);

      if (!isRetryable || attempt === MAX_RETRIES) {
        logger.error(
          { error, attempt, ...context },
          'Anthropic API call failed (non-retryable or max retries reached)'
        );
        throw error;
      }

      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      logger.warn(
        { attempt, delay_ms: delay, ...context },
        'Anthropic API call failed, retrying...'
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Unknown error in Anthropic call');
}

/**
 * Call Claude with tools (function calling)
 */
export async function callClaudeWithTools(params: {
  systemPrompt: string;
  userMessage: string;
  tools: Anthropic.Tool[];
  toolChoice?: Anthropic.MessageCreateParams['tool_choice'];
  maxTokens?: number;
  temperature?: number;
}): Promise<Anthropic.Messages.Message> {
  const { systemPrompt, userMessage, tools, toolChoice, maxTokens, temperature } = params;

  return callAnthropic(
    () =>
      getAnthropicClient().messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: maxTokens || 4096,
        temperature: temperature ?? 0.2,
        system: systemPrompt,
        tools,
        tool_choice: toolChoice || { type: 'auto' },
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    { operation: 'claude_with_tools', toolCount: tools.length }
  );
}

/**
 * Call Claude for simple reasoning (no tools)
 */
export async function callClaudeReasoning(params: {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const { systemPrompt, userMessage, maxTokens, temperature } = params;

  const response = await callAnthropic(
    () =>
      getAnthropicClient().messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: maxTokens || 4096,
        temperature: temperature ?? 0.2,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    { operation: 'claude_reasoning' }
  );

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }

  throw new Error('Unexpected response type from Claude');
}

/**
 * Check if Anthropic API is available (health check)
 */
export async function isAnthropicAvailable(): Promise<boolean> {
  try {
    await getAnthropicClient().messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }],
    });
    return true;
  } catch {
    return false;
  }
}

export { ANTHROPIC_MODEL };
