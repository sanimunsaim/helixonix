/**
 * Fastify API Routes
 * Admin console integration endpoint for HELIX-BRAIN
 * POST /internal/helix-brain/command — natural language admin commands
 */

import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { processAdminCommand } from '../agent/brain';
import { getAnalytics, getPlatformHealth } from '../agent/tools';
import { logger } from '../lib/logger';
import { writeAudit } from '../lib/audit';
import { isAnthropicAvailable } from '../lib/anthropicClient';
import { isCoreApiHealthy } from '../lib/coreApiClient';

// In-memory rate limit tracking (per admin)
const adminCommandCounts = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = parseInt(process.env.ADMIN_COMMAND_RATE_LIMIT || '20', 10);
const RATE_WINDOW_MS = parseInt(
  process.env.ADMIN_COMMAND_WINDOW_MS || '3600000',
  10
); // 1 hour

/**
 * Create and configure the Fastify server
 */
export async function createServer() {
  const app = Fastify({
    logger: false, // Use our own pino logger
  });

  // Register rate limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // ============================================================
  // Health Check
  // ============================================================
  app.get('/health', async () => {
    const anthropicOk = await isAnthropicAvailable();
    const coreApiOk = await isCoreApiHealthy();

    const status = anthropicOk && coreApiOk ? 'healthy' : 'degraded';
    const code = status === 'healthy' ? 200 : 503;

    return app.injectResponse
      ? { status, anthropic: anthropicOk ? 'up' : 'down', core_api: coreApiOk ? 'up' : 'down' }
      : { status, anthropic: anthropicOk ? 'up' : 'down', core_api: coreApiOk ? 'up' : 'down' };
  });

  // ============================================================
  // Admin Command Endpoint
  // POST /internal/helix-brain/command
  // Body: { command: string, admin_id: string, admin_role: string, confirmation?: string }
  // ============================================================
  app.post<{
    Body: {
      command: string;
      admin_id: string;
      admin_role: string;
      admin_name?: string;
      confirmation?: string; // For destructive actions requiring explicit confirmation
    };
  }>('/internal/helix-brain/command', async (request, reply) => {
    const { command, admin_id, admin_role, admin_name, confirmation } = request.body;

    // Validate required fields
    if (!command || !admin_id || !admin_role) {
      return reply.status(400).send({
        error: 'Missing required fields: command, admin_id, admin_role',
      });
    }

    // Rate limiting per admin
    const rateCheck = checkRateLimit(admin_id);
    if (!rateCheck.allowed) {
      writeAudit({
        action: 'admin_command_rate_limited',
        actor: admin_id,
        target: 'helix-brain',
        result: 'rate_limited',
        metadata: { command, reset_at: rateCheck.resetAt },
      });

      return reply.status(429).send({
        error: 'Rate limit exceeded',
        limit: RATE_LIMIT,
        window: `${RATE_WINDOW_MS / 1000 / 60} minutes`,
        retry_after: rateCheck.resetAt,
      });
    }

    // Role validation
    const allowedRoles = ['admin', 'super_admin', 'moderator', 'finance_admin'];
    if (!allowedRoles.includes(admin_role)) {
      return reply.status(403).send({
        error: 'Insufficient permissions',
        required_roles: allowedRoles,
      });
    }

    // Check for destructive action confirmation
    if (isDestructiveCommand(command) && confirmation !== 'CONFIRM') {
      writeAudit({
        action: 'admin_command_confirmation_required',
        actor: admin_id,
        target: 'helix-brain',
        result: 'confirmation_required',
        metadata: { command },
      });

      return reply.status(403).send({
        error: 'Destructive action requires confirmation',
        message:
          'This command involves a destructive action (ban, refund > $500, etc.). To proceed, resend with confirmation: "CONFIRM"',
        requires_confirmation: true,
      });
    }

    try {
      // Get platform context for the AI
      const platformContext = await getPlatformContext();

      // Process the command through HELIX-BRAIN
      const result = await processAdminCommand(
        command,
        {
          id: admin_id,
          role: admin_role,
          name: admin_name || admin_id,
        },
        platformContext
      );

      // Log the command
      writeAudit({
        action: 'admin_command_processed',
        actor: `${admin_name || admin_id} (${admin_role})`,
        target: 'helix-brain',
        result: result.requires_human_review ? 'flagged_for_review' : 'completed',
        metadata: {
          command,
          actions_taken: result.actions_taken.length,
          requires_human_review: result.requires_human_review,
        },
      });

      return reply.send({
        success: !result.requires_human_review,
        ...result,
      });
    } catch (error) {
      logger.error({ error, adminId: admin_id, command }, 'Admin command processing failed');

      return reply.status(500).send({
        error: 'Command processing failed',
        message: (error as Error).message,
        helix_brain_status: 'error',
      });
    }
  });

  // ============================================================
  // Platform Health (Admin)
  // GET /internal/helix-brain/health
  // ============================================================
  app.get('/internal/helix-brain/platform-health', async (request, reply) => {
    try {
      const health = await getPlatformHealth({});
      return reply.send(health);
    } catch (error) {
      logger.error({ error }, 'Failed to get platform health');
      return reply.status(503).send({
        status: 'unknown',
        error: (error as Error).message,
      });
    }
  });

  // ============================================================
  // Analytics Endpoint
  // GET /internal/helix-brain/analytics?metric=...&date_range=...
  // ============================================================
  app.get<{
    Querystring: {
      metric: string;
      date_range: string;
      group_by?: string;
      top_n?: number;
    };
  }>('/internal/helix-brain/analytics', async (request, reply) => {
    const { metric, date_range, group_by, top_n } = request.query;

    if (!metric || !date_range) {
      return reply.status(400).send({
        error: 'Missing required query params: metric, date_range',
      });
    }

    try {
      const result = await getAnalytics({
        metric,
        date_range,
        group_by,
        top_n,
      });
      return reply.send(result);
    } catch (error) {
      logger.error({ error, metric }, 'Failed to fetch analytics');
      return reply.status(500).send({
        error: 'Analytics query failed',
        message: (error as Error).message,
      });
    }
  });

  // ============================================================
  // Audit Log Endpoint
  // GET /internal/helix-brain/audit-log?limit=...&offset=...
  // ============================================================
  app.get<{
    Querystring: {
      limit?: number;
      offset?: number;
    };
  }>('/internal/helix-brain/audit-log', async (request, reply) => {
    const limit = request.query.limit || 100;
    const offset = request.query.offset || 0;

    try {
      // Fetch from Core API
      const { getCoreApiClient } = await import('../lib/coreApiClient');
      const client = getCoreApiClient();
      const result = await client.get('/internal/audit-logs', {
        params: { limit, offset },
      });

      return reply.send(result.data);
    } catch (error) {
      logger.error({ error }, 'Failed to fetch audit log');
      return reply.status(500).send({
        error: 'Audit log query failed',
        message: (error as Error).message,
      });
    }
  });

  return app;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Check if admin is within rate limit
 */
function checkRateLimit(adminId: string): { allowed: boolean; resetAt: number } {
  const now = Date.now();
  const record = adminCommandCounts.get(adminId);

  if (!record || now > record.resetAt) {
    // New window
    adminCommandCounts.set(adminId, {
      count: 1,
      resetAt: now + RATE_WINDOW_MS,
    });
    return { allowed: true, resetAt: now + RATE_WINDOW_MS };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, resetAt: record.resetAt };
}

/**
 * Check if command involves destructive actions
 */
function isDestructiveCommand(command: string): boolean {
  const destructiveKeywords = [
    'ban',
    'suspend',
    'delete',
    'permanent',
    'refund',
    'cancel',
    'override',
    'commission',
  ];

  const lowerCommand = command.toLowerCase();
  return destructiveKeywords.some((keyword) => lowerCommand.includes(keyword));
}

/**
 * Get current platform context for AI
 */
async function getPlatformContext() {
  try {
    const { getCoreApiClient } = await import('../lib/coreApiClient');
    const client = getCoreApiClient();

    const [moderation, disputes, payouts] = await Promise.all([
      client.get('/internal/moderation/pending-count').catch(() => ({ data: { count: 0 } })),
      client.get('/internal/disputes/open-count').catch(() => ({ data: { count: 0 } })),
      client.get('/internal/payouts/pending-count').catch(() => ({ data: { count: 0 } })),
    ]);

    return {
      pending_moderation_count: moderation.data?.count || 0,
      open_disputes: disputes.data?.count || 0,
      payout_queue_count: payouts.data?.count || 0,
    };
  } catch {
    // Fallback if context fetch fails
    return {
      pending_moderation_count: 0,
      open_disputes: 0,
      payout_queue_count: 0,
    };
  }
}
