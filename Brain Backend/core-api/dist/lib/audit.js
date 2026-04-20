/**
 * Audit Log — Async, non-blocking write via Redis queue → DB flush
 * Never blocks request handlers
 */
import { redis } from './redis.js';
const AUDIT_QUEUE_KEY = 'audit:queue';
/**
 * Write audit log entry — async, never throws, never blocks
 */
export async function writeAuditLog(entry) {
    try {
        const log = {
            ...entry,
            timestamp: entry.timestamp ?? Date.now(),
        };
        // Push to Redis list — background worker flushes to DB
        await redis.rpush(AUDIT_QUEUE_KEY, JSON.stringify(log));
    }
    catch {
        // Silently fail — audit logs must never break request flow
    }
}
/**
 * Drain audit queue to DB (called by background job)
 * Returns number of entries flushed
 */
export async function drainAuditQueue(db, batchSize = 100) {
    const entries = [];
    for (let i = 0; i < batchSize; i++) {
        const raw = await redis.lpop(AUDIT_QUEUE_KEY);
        if (!raw)
            break;
        try {
            entries.push(JSON.parse(raw));
        }
        catch {
            // Skip malformed entries
        }
    }
    if (entries.length === 0)
        return 0;
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
//# sourceMappingURL=audit.js.map