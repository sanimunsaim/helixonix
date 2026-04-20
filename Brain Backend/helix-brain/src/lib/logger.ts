/**
 * Structured Logging Module (Pino)
 * All HELIX-BRAIN operations are logged with full context for auditability
 */

import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.AUDIT_LOG_LEVEL || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    service: 'helix-brain',
    version: '1.0.0',
  },
  redact: {
    paths: ['*.api_key', '*.password', '*.token', '*.secret', 'req.headers.authorization'],
    censor: '[REDACTED]',
  },
});

/**
 * Create a child logger with operation context
 */
export function createOperationLogger(
  operation: string,
  meta?: Record<string, unknown>
) {
  return logger.child({
    operation,
    ...meta,
  });
}

/**
 * Log AI decision with full reasoning chain
 */
export function logAIDecision(data: {
  decision: string;
  reasoning: string;
  confidence?: number;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  admin_id?: string;
  tool_calls?: string[];
}): void {
  logger.info(
    {
      type: 'ai_decision',
      timestamp: new Date().toISOString(),
      ...data,
    },
    `AI Decision: ${data.decision}`
  );
}

/**
 * Log tool execution
 */
export function logToolExecution(data: {
  tool: string;
  params: Record<string, unknown>;
  result: 'success' | 'error' | 'flagged';
  duration_ms: number;
  error?: string;
}): void {
  logger.info(
    {
      type: 'tool_execution',
      timestamp: new Date().toISOString(),
      ...data,
    },
    `Tool ${data.tool}: ${data.result} (${data.duration_ms}ms)`
  );
}

/**
 * Log audit event (non-blocking)
 */
export function logAudit(data: {
  action: string;
  actor: string;
  target: string;
  result: string;
  metadata?: Record<string, unknown>;
}): void {
  logger.info(
    {
      type: 'audit',
      timestamp: new Date().toISOString(),
      ...data,
    },
    `AUDIT: ${data.actor} performed ${data.action} on ${data.target}`
  );
}

export default logger;
