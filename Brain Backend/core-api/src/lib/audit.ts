/**
 * Audit Log — Async, non-blocking write via Redis queue → DB flush
 * Never blocks request handlers
 */

import { redis } from './redis.js';

export type AuditAction =
  | 'user.register' | 'user.login' | 'user.logout' | 'user.ban' | 'user.unban'
  | 'asset.upload' | 'asset.approve' | 'asset.reject' | 'asset.delete'
  | 'asset.download' | 'asset.purchase'
  | 'gig.create' | 'gig.publish' | 'gig.delete'
  | 'order.create' | 'order.deliver' | 'order.complete' | 'order.cancel' | 'order.dispute'
  | 'payment.checkout' | 'payment.success' | 'payment.failed' | 'payment.refund'
  | 'payout.request' | 'payout.process' | 'payout.complete'
  | 'ai.generate' | 'ai.complete' | 'ai.failed'
  | 'admin.action' | 'system.event';

export interface AuditEntry {
  action: AuditAction;
  actorId?: string;
  actorRole?: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp?: number;
}

const AUDIT_QUEUE_KEY = 'audit:queue';

/**
 * Write audit log entry — async, never throws, never blocks
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    const log: AuditEntry = {
      ...entry,
      timestamp: entry.timestamp ?? Date.now(),
    };
    // Push to Redis list — background worker flushes to DB
    await redis.rpush(AUDIT_QUEUE_KEY, JSON.stringify(log));
  } catch {
    // Silently fail — audit logs must never break request flow
  }
}

/**
 * Drain audit queue to DB (called by background job)
 * Returns number of entries flushed
 */
export async function drainAuditQueue(db: any, batchSize = 100): Promise<number> {
  const entries: AuditEntry[] = [];

  for (let i = 0; i < batchSize; i++) {
    const raw = await redis.lpop(AUDIT_QUEUE_KEY);
    if (!raw) break;
    try {
      entries.push(JSON.parse(raw) as AuditEntry);
    } catch {
      // Skip malformed entries
    }
  }

  if (entries.length === 0) return 0;

  // Batch insert to DB
  await db.execute(`
    INSERT INTO audit_logs (action, actor_id, actor_role, target_id, target_type, metadata, ip, user_agent, created_at)
    VALUES ${entries.map(() => '(?,?,?,?,?,?,?,?,?)').join(',')}
  `, entries.flatMap((e) => [
    e.action,
    e.actorId ?? null,
    e.actorRole ?? null,
    e.targetId ?? null,
    e.targetType ?? null,
    e.metadata ? JSON.stringify(e.metadata) : null,
    e.ip ?? null,
    e.userAgent ?? null,
    new Date(e.timestamp ?? Date.now()),
  ]));

  return entries.length;
}
