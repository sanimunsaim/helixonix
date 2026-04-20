/**
 * Unit Tests for HELIX-BRAIN Brain Orchestrator
 * Tests the admin command processing pipeline with mocked Anthropic API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processAdminCommand, processAutomatedTask } from '../agent/brain';

// Mock Anthropic client
vi.mock('../lib/anthropicClient', () => ({
  callClaudeWithTools: vi.fn(),
  callClaudeReasoning: vi.fn(),
  isAnthropicAvailable: vi.fn().mockResolvedValue(true),
  sendOfflineAlert: vi.fn(),
  ANTHROPIC_MODEL: 'claude-sonnet-4-20250514',
}));

// Mock tools
vi.mock('../agent/tools', async () => {
  const actual = await vi.importActual<typeof import('../agent/tools')>('../agent/tools');
  return {
    ...actual,
    executeToolByName: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue({ sent_count: 1, failed_count: 0 }),
  };
});

import { callClaudeWithTools } from '../lib/anthropicClient';
import { executeToolByName } from '../agent/tools';

const mockedCallClaude = vi.mocked(callClaudeWithTools);
const mockedExecuteTool = vi.mocked(executeToolByName);

describe('HELIX-BRAIN Brain Orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processAdminCommand', () => {
    it('should process a simple query without tool calls', async () => {
      mockedCallClaude.mockResolvedValueOnce({
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        model: 'claude-sonnet-4-20250514',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: 'Platform is healthy with 42 pending moderation items',
              actions_taken: [],
              items_flagged: [],
              requires_human_review: false,
              review_reason: null,
            }),
          },
        ],
        stop_reason: 'end_turn',
        usage: { input_tokens: 100, output_tokens: 50 },
      } as unknown as Awaited<ReturnType<typeof callClaudeWithTools>>);

      const result = await processAdminCommand(
        'How many items are pending moderation?',
        { id: 'admin_1', role: 'admin', name: 'Test Admin' },
        { pending_moderation_count: 42, open_disputes: 5, payout_queue_count: 12 }
      );

      expect(result.summary).toContain('42');
      expect(result.requires_human_review).toBe(false);
      expect(mockedCallClaude).toHaveBeenCalledTimes(1);
    });

    it('should execute tool calls and return results', async () => {
      // First call — tool use
      mockedCallClaude.mockResolvedValueOnce({
        id: 'msg_124',
        type: 'message',
        role: 'assistant',
        model: 'claude-sonnet-4-20250514',
        content: [
          {
            type: 'tool_use',
            id: 'tool_1',
            name: 'get_moderation_queue',
            input: { limit: 10, type: 'all' },
          },
        ],
        stop_reason: 'tool_use',
        usage: { input_tokens: 100, output_tokens: 30 },
      } as unknown as Awaited<ReturnType<typeof callClaudeWithTools>>);

      // Tool result
      mockedExecuteTool.mockResolvedValueOnce([
        {
          asset_id: 'asset_1',
          title: 'Test Asset',
          quality_score: 0.85,
          nsfw_score: 0.02,
        },
      ]);

      // Follow-up call — final response
      mockedCallClaude.mockResolvedValueOnce({
        id: 'msg_125',
        type: 'message',
        role: 'assistant',
        model: 'claude-sonnet-4-20250514',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: 'Found 1 asset in moderation queue. Test Asset has quality score 0.85 and is safe to approve.',
              actions_taken: [{ action: 'fetched_moderation_queue', target: 'moderation_queue', result: '1_asset_found' }],
              items_flagged: [],
              requires_human_review: false,
              review_reason: null,
            }),
          },
        ],
        stop_reason: 'end_turn',
        usage: { input_tokens: 200, output_tokens: 80 },
      } as unknown as Awaited<ReturnType<typeof callClaudeWithTools>>);

      const result = await processAdminCommand(
        'Show me the first 10 items in moderation queue',
        { id: 'admin_1', role: 'admin', name: 'Test Admin' },
        { pending_moderation_count: 42, open_disputes: 5, payout_queue_count: 12 }
      );

      expect(result.actions_taken).toHaveLength(1);
      expect(result.tool_results).toHaveLength(1);
      expect(result.requires_human_review).toBe(false);
    });

    it('should require human review for destructive commands', async () => {
      mockedCallClaude.mockResolvedValueOnce({
        id: 'msg_126',
        type: 'message',
        role: 'assistant',
        model: 'claude-sonnet-4-20250514',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: 'Ban request received. This is a destructive action requiring human review.',
              actions_taken: [],
              items_flagged: [{ reason: 'ban_request', target: 'user_123', recommended_action: 'human_review' }],
              requires_human_review: true,
              review_reason: 'Account ban requires super admin confirmation per escalation rules',
            }),
          },
        ],
        stop_reason: 'end_turn',
        usage: { input_tokens: 100, output_tokens: 60 },
      } as unknown as Awaited<ReturnType<typeof callClaudeWithTools>>);

      const result = await processAdminCommand(
        'Ban user user_123 for spamming',
        { id: 'admin_1', role: 'admin', name: 'Test Admin' },
        { pending_moderation_count: 0, open_disputes: 0, payout_queue_count: 0 }
      );

      expect(result.requires_human_review).toBe(true);
      expect(result.review_reason).toContain('super admin');
    });

    it('should handle errors gracefully', async () => {
      mockedCallClaude.mockRejectedValueOnce(new Error('Anthropic API error'));

      const result = await processAdminCommand(
        'Get analytics for last 7 days',
        { id: 'admin_1', role: 'admin', name: 'Test Admin' },
        { pending_moderation_count: 0, open_disputes: 0, payout_queue_count: 0 }
      );

      expect(result.requires_human_review).toBe(true);
      expect(result.review_reason).toContain('System error');
      expect(result.actions_taken).toHaveLength(0);
    });
  });

  describe('processAutomatedTask', () => {
    it('should process automated moderation task', async () => {
      mockedCallClaude.mockResolvedValueOnce({
        id: 'msg_200',
        type: 'message',
        role: 'assistant',
        model: 'claude-sonnet-4-20250514',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: 'Auto-moderation completed: 50 assets reviewed, 35 approved, 15 flagged',
              actions_taken: [
                { action: 'auto_approve', target: '35_assets', result: 'approved' },
                { action: 'flag_review', target: '15_assets', result: 'flagged' },
              ],
              items_flagged: [],
              requires_human_review: false,
              review_reason: null,
            }),
          },
        ],
        stop_reason: 'end_turn',
        usage: { input_tokens: 300, output_tokens: 100 },
      } as unknown as Awaited<ReturnType<typeof callClaudeWithTools>>);

      const result = await processAutomatedTask({
        taskName: 'auto_moderation',
        systemMessage: 'Process the moderation queue with current thresholds',
      });

      expect(result.summary).toContain('Auto-moderation completed');
      expect(result.actions_taken).toHaveLength(2);
    });

    it('should respect max tool call limit', async () => {
      // Simulate a response that wants to use tools
      mockedCallClaude.mockResolvedValueOnce({
        id: 'msg_201',
        type: 'message',
        role: 'assistant',
        model: 'claude-sonnet-4-20250514',
        content: [
          {
            type: 'tool_use',
            id: 'tool_loop',
            name: 'get_moderation_queue',
            input: { limit: 10 },
          },
        ],
        stop_reason: 'tool_use',
        usage: { input_tokens: 100, output_tokens: 20 },
      } as unknown as Awaited<ReturnType<typeof callClaudeWithTools>>);

      mockedExecuteTool.mockResolvedValue([]);

      // After max calls, return end_turn
      mockedCallClaude.mockResolvedValueOnce({
        id: 'msg_202',
        type: 'message',
        role: 'assistant',
        model: 'claude-sonnet-4-20250514',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: 'Task partially completed due to tool call limit',
              actions_taken: [],
              items_flagged: [],
              requires_human_review: true,
              review_reason: 'Max tool calls reached',
            }),
          },
        ],
        stop_reason: 'end_turn',
        usage: { input_tokens: 100, output_tokens: 40 },
      } as unknown as Awaited<ReturnType<typeof callClaudeWithTools>>);

      const result = await processAutomatedTask({
        taskName: 'test_task',
        systemMessage: 'Test with limited tool calls',
        maxToolCalls: 1,
      });

      expect(result.requires_human_review).toBe(true);
      expect(mockedExecuteTool).toHaveBeenCalledTimes(1);
    });
  });
});
