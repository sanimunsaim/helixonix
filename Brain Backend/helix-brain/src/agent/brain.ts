/**
 * HELIX-BRAIN Main Orchestrator
 * Builds Anthropic API calls, executes tool sequences, manages reasoning pipeline
 * This is the core intelligence engine of the service
 */

import type Anthropic from '@anthropic-ai/sdk';
import { callClaudeWithTools } from '../lib/anthropicClient';
import { executeToolByName } from './tools';
import { toolSchemas } from './toolSchemas';
import { HELIX_BRAIN_SYSTEM_PROMPT } from './systemPrompt';
import { logger, logAIDecision } from '../lib/logger';
import { logDecision } from '../lib/audit';
import { sendNotification } from './tools';
import type { ToolName } from '../types/tools';

interface BrainResponse {
  summary: string;
  actions_taken: Array<{ action: string; target: string; result: string }>;
  items_flagged: Array<{ reason: string; target: string; recommended_action: string }>;
  requires_human_review: boolean;
  review_reason: string | null;
  tool_results: Array<{ tool: string; result: unknown }>;
}

interface AdminContext {
  id: string;
  role: string;
  name: string;
}

interface PlatformContext {
  pending_moderation_count: number;
  open_disputes: number;
  payout_queue_count: number;
}

/**
 * Process a natural language admin command through the full HELIX-BRAIN pipeline
 */
export async function processAdminCommand(
  command: string,
  admin: AdminContext,
  platformContext: PlatformContext
): Promise<BrainResponse> {
  const startTime = Date.now();
  logger.info({ adminId: admin.id, command }, 'Processing admin command');

  try {
    // Step 1: Build the user message with full context
    const userMessage = buildUserMessage(command, admin, platformContext);

    // Step 2: Call Claude with all tools available
    const message = await callClaudeWithTools({
      systemPrompt: HELIX_BRAIN_SYSTEM_PROMPT,
      userMessage,
      tools: toolSchemas,
      maxTokens: 4096,
      temperature: 0.2,
    });

    // Step 3: Handle tool calls if any
    const toolResults: Array<{ tool: string; result: unknown }> = [];

    while (message.stop_reason === 'tool_use') {
      const toolUseBlocks = message.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      if (toolUseBlocks.length === 0) break;

      // Execute each tool call sequentially
      const toolResultsForAI: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const toolBlock of toolUseBlocks) {
        const toolName = toolBlock.name as ToolName;
        const toolParams = toolBlock.input as Record<string, unknown>;

        logger.info({ tool: toolName, params: toolParams }, 'Executing tool call');

        try {
          const result = await executeToolByName(toolName, toolParams);
          toolResults.push({ tool: toolName, result });

          toolResultsForAI.push({
            type: 'tool_result',
            tool_use_id: toolBlock.id,
            content: JSON.stringify(result),
          });
        } catch (error) {
          const errorMessage = (error as Error).message;
          logger.error({ tool: toolName, error: errorMessage }, 'Tool execution failed');

          toolResultsForAI.push({
            type: 'tool_result',
            tool_use_id: toolBlock.id,
            content: `Error: ${errorMessage}`,
            is_error: true,
          });
        }
      }

      // Continue conversation with tool results
      const toolUseMessage: Anthropic.MessageParam = {
        role: 'user',
        content: toolResultsForAI,
      };

      const followUp = await callClaudeWithTools({
        systemPrompt: HELIX_BRAIN_SYSTEM_PROMPT,
        userMessage: '', // Context is in the conversation
        tools: toolSchemas,
        maxTokens: 4096,
        temperature: 0.2,
      });

      // Merge follow-up content into main message
      message.content = followUp.content;
      message.stop_reason = followUp.stop_reason;
    }

    // Step 4: Parse structured response from final text
    const response = parseBrainResponse(message, toolResults);

    // Step 5: Log the decision
    const duration = Date.now() - startTime;
    logAIDecision({
      decision: response.summary.substring(0, 100),
      reasoning: response.review_reason || response.summary,
      inputs: { command, admin_id: admin.id, platform_context: platformContext },
      outputs: response,
      admin_id: admin.id,
      tool_calls: toolResults.map((t) => t.tool),
    });

    logDecision({
      decision: 'admin_command_processed',
      reasoning: response.summary,
      actor: `${admin.name} (${admin.role})`,
      target: 'platform_operations',
      inputs: { command, platform_context: platformContext },
      outputs: response,
      requires_human_review: response.requires_human_review,
      review_reason: response.review_reason || undefined,
    });

    logger.info(
      { duration_ms: duration, actions: response.actions_taken.length },
      'Admin command processed'
    );

    return response;
  } catch (error) {
    logger.error({ error, adminId: admin.id, command }, 'Failed to process admin command');

    // Fallback: return structured error
    return {
      summary: `Error processing command: ${(error as Error).message}. This has been logged for review.`,
      actions_taken: [],
      items_flagged: [
        {
          reason: `Command processing failed: ${(error as Error).message}`,
          target: 'admin_command',
          recommended_action: 'Manual review required',
        },
      ],
      requires_human_review: true,
      review_reason: `System error during command processing: ${(error as Error).message}`,
      tool_results: [],
    };
  }
}

/**
 * Process an automated task through HELIX-BRAIN (cron jobs use this)
 */
export async function processAutomatedTask(params: {
  taskName: string;
  systemMessage: string;
  maxToolCalls?: number;
}): Promise<BrainResponse> {
  const { taskName, systemMessage, maxToolCalls = 10 } = params;
  const startTime = Date.now();

  logger.info({ taskName }, 'Processing automated task');

  try {
    const message = await callClaudeWithTools({
      systemPrompt: HELIX_BRAIN_SYSTEM_PROMPT,
      userMessage: systemMessage,
      tools: toolSchemas,
      maxTokens: 4096,
      temperature: 0.2,
    });

    const toolResults: Array<{ tool: string; result: unknown }> = [];
    let toolCallCount = 0;

    // Handle tool calls with safety limit
    while (message.stop_reason === 'tool_use' && toolCallCount < maxToolCalls) {
      const toolUseBlocks = message.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      if (toolUseBlocks.length === 0) break;

      const toolResultsForAI: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const toolBlock of toolUseBlocks) {
        const toolName = toolBlock.name as ToolName;
        const toolParams = toolBlock.input as Record<string, unknown>;

        try {
          const result = await executeToolByName(toolName, toolParams);
          toolResults.push({ tool: toolName, result });

          toolResultsForAI.push({
            type: 'tool_result',
            tool_use_id: toolBlock.id,
            content: JSON.stringify(result),
          });
        } catch (error) {
          const errorMessage = (error as Error).message;
          toolResultsForAI.push({
            type: 'tool_result',
            tool_use_id: toolBlock.id,
            content: `Error: ${errorMessage}`,
            is_error: true,
          });
        }

        toolCallCount++;
      }

      // Continue conversation
      const followUp = await callClaudeWithTools({
        systemPrompt: HELIX_BRAIN_SYSTEM_PROMPT,
        userMessage: '',
        tools: toolSchemas,
        maxTokens: 4096,
        temperature: 0.2,
      });

      message.content = followUp.content;
      message.stop_reason = followUp.stop_reason;
    }

    const response = parseBrainResponse(message, toolResults);
    const duration = Date.now() - startTime;

    logAIDecision({
      decision: `${taskName} completed`,
      reasoning: response.summary,
      inputs: { task_name: taskName },
      outputs: response,
      tool_calls: toolResults.map((t) => t.tool),
    });

    logger.info({ taskName, duration_ms: duration }, 'Automated task completed');

    return response;
  } catch (error) {
    logger.error({ error, taskName }, 'Automated task failed');

    return {
      summary: `Task ${taskName} failed: ${(error as Error).message}`,
      actions_taken: [],
      items_flagged: [
        {
          reason: `Automated task error: ${(error as Error).message}`,
          target: taskName,
          recommended_action: 'Investigate and retry',
        },
      ],
      requires_human_review: true,
      review_reason: `Task ${taskName} failed: ${(error as Error).message}`,
      tool_results: [],
    };
  }
}

/**
 * Build the user message with admin context
 */
function buildUserMessage(
  command: string,
  admin: AdminContext,
  platformContext: PlatformContext
): string {
  return `Admin command from ${admin.name} (${admin.role}, ID: ${admin.id}):

"${command}"

Current platform context:
- Pending moderation items: ${platformContext.pending_moderation_count}
- Open disputes: ${platformContext.open_disputes}
- Payout queue items: ${platformContext.payout_queue_count}
- Timestamp: ${new Date().toISOString()}

Analyze the command, use the appropriate tools, and provide a structured response.`;
}

/**
 * Parse the final AI message into a structured BrainResponse
 */
function parseBrainResponse(
  message: Anthropic.Messages.Message,
  toolResults: Array<{ tool: string; result: unknown }>
): BrainResponse {
  // Extract text content
  const textBlocks = message.content.filter((block) => block.type === 'text');
  const fullText = textBlocks.map((block) => block.text).join('\n');

  // Try to parse JSON from the response
  let structured: Partial<BrainResponse> = {};

  try {
    // Look for JSON in the response
    const jsonMatch = fullText.match(/\{[\s\S]*"summary"[\s\S]*\}/);
    if (jsonMatch) {
      structured = JSON.parse(jsonMatch[0]) as Partial<BrainResponse>;
    }
  } catch {
    // JSON parsing failed, use defaults
    logger.warn('Failed to parse structured response from AI, using defaults');
  }

  return {
    summary: structured.summary || fullText.substring(0, 500) || 'No summary provided',
    actions_taken: structured.actions_taken || [],
    items_flagged: structured.items_flagged || [],
    requires_human_review: structured.requires_human_review || false,
    review_reason: structured.review_reason || null,
    tool_results: toolResults,
  };
}

/**
 * Send offline alert to super admin when AI is unavailable
 */
export async function sendOfflineAlert(reason: string): Promise<void> {
  try {
    await sendNotification({
      user_ids: ['all_admins'],
      type: 'alert',
      title: 'HELIX-BRAIN Offline Alert',
      message: `HELIX-BRAIN is temporarily offline. Reason: ${reason}. Automated tasks are running in rule-based fallback mode. Admin commands require manual processing.`,
      email: true,
      email_template: 'admin_alert',
    });
  } catch (error) {
    logger.error({ error }, 'Failed to send offline alert');
  }
}

export type { BrainResponse, AdminContext, PlatformContext };
