/**
 * Audit Log — Async, non-blocking write via Redis queue → DB flush
 * Never blocks request handlers
 */
export type AuditAction = 'user.register' | 'user.login' | 'user.logout' | 'user.ban' | 'user.unban' | 'asset.upload' | 'asset.approve' | 'asset.reject' | 'asset.delete' | 'asset.download' | 'asset.purchase' | 'gig.create' | 'gig.publish' | 'gig.delete' | 'order.create' | 'order.deliver' | 'order.complete' | 'order.cancel' | 'order.dispute' | 'payment.checkout' | 'payment.success' | 'payment.failed' | 'payment.refund' | 'payout.request' | 'payout.process' | 'payout.complete' | 'ai.generate' | 'ai.complete' | 'ai.failed' | 'admin.action' | 'system.event';
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
/**
 * Write audit log entry — async, never throws, never blocks
 */
export declare function writeAuditLog(entry: AuditEntry): Promise<void>;
/**
 * Drain audit queue to DB (called by background job)
 * Returns number of entries flushed
 */
export declare function drainAuditQueue(db: any, batchSize?: number): Promise<number>;
//# sourceMappingURL=audit.d.ts.map