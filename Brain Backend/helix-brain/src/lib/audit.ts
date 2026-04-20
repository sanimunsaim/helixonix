/**
 * Audit Log Writer
 * All HELIX-BRAIN decisions and actions are logged for full transparency
 * Writes are non-blocking (fire-and-forget with error logging)
 */

import { logger } from './logger';
import { getCoreApiClient } from './coreApiClient';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  actor_role?: string;
  target: string;
  target_type: string;
  result: string;
  reasoning?: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  requires_human_review?: boolean;
  review_reason?: string;
}

/**
 * Write an audit log entry (non-blocking)
 */
export function writeAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
  const fullEntry: AuditEntry = {
    id: generateAuditId(),
    timestamp: new Date().toISOString(),
    ...entry,
  };

  // Fire-and-forget: don't await
  persistAudit(fullEntry).catch((error) => {
    logger.error({ error, entry: fullEntry }, 'Failed to persist audit log');
  });

  // Always log locally
  logger.info(
    {
      type: 'audit',
      auditId: fullEntry.id,
      action: fullEntry.action,
      actor: fullEntry.actor,
      target: fullEntry.target,
    },
    `AUDIT: ${fullEntry.actor} → ${fullEntry.action} → ${fullEntry.target}`
  );
}

/**
 * Persist audit to Core API (async, non-blocking)
 */
async function persistAudit(entry: AuditEntry): Promise<void> {
  try {
    await getCoreApiClient().post('/internal/audit-logs', entry as unknown as Record<string, unknown>);
  } catch (error) {
    // Log locally but don't throw — audit must never block operations
    logger.error({ error, auditId: entry.id }, 'Audit persist failed (logged locally)');
  }
}

/**
 * Log an AI decision with full context
 */
export function logDecision(data: {
  decision: string;
  reasoning: string;
  actor: string;
  target: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  confidence?: number;
  requires_human_review?: boolean;
  review_reason?: string;
}): void {
  writeAudit({
    action: `ai_decision_${data.decision}`,
    actor: data.actor,
    target: data.target,
    target_type: 'ai_decision',
    result: data.decision,
    reasoning: data.reasoning,
    inputs: data.inputs,
    outputs: data.outputs,
    metadata: {
      confidence: data.confidence,
      model: process.env.ANTHROPIC_MODEL,
    },
    requires_human_review: data.requires_human_review,
    review_reason: data.review_reason,
  });
}

/**
 * Log a destructive action (bans, refunds, etc.)
 */
export function logDestructiveAction(data: {
  action: string;
  actor: string;
  target: string;
  reason: string;
  confirmed: boolean;
  metadata?: Record<string, unknown>;
}): void {
  writeAudit({
    action: `destructive_${data.action}`,
    actor: data.actor,
    target: data.target,
    target_type: 'destructive_action',
    result: data.confirmed ? 'executed' : 'pending_confirmation',
    reasoning: data.reason,
    metadata: data.metadata,
    requires_human_review: !data.confirmed,
  });
}

/**
 * Generate unique audit ID
 */
function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export type { AuditEntry };
