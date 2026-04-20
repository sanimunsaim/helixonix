/**
 * Redis Pub/Sub Event Publisher
 * Publishes platform events to Redis channels for cross-service communication
 */
export type EventType = 'user.registered' | 'user.updated' | 'user.banned' | 'asset.uploaded' | 'asset.approved' | 'asset.rejected' | 'asset.purchased' | 'asset.downloaded' | 'gig.created' | 'gig.published' | 'gig.updated' | 'order.created' | 'order.accepted' | 'order.delivered' | 'order.completed' | 'order.cancelled' | 'order.disputed' | 'payment.succeeded' | 'payment.failed' | 'payment.refunded' | 'payout.requested' | 'payout.processed' | 'ai.job.queued' | 'ai.job.completed' | 'ai.job.failed' | 'dispute.opened' | 'dispute.resolved' | 'seller.level_changed';
export interface PlatformEvent {
    type: EventType;
    payload: Record<string, unknown>;
    timestamp?: number;
    source?: string;
}
/**
 * Publish a platform event to the events channel (helix-brain subscribes)
 */
export declare function publishEvent(type: EventType, payload: Record<string, unknown>): Promise<void>;
/**
 * Publish a WebSocket event — forwarded by WS server to appropriate rooms
 */
export declare function publishWsEvent(params: {
    room: string;
    event: string;
    data: Record<string, unknown>;
}): Promise<void>;
/**
 * Publish an AI job progress event — picked up by SSE endpoint
 */
export declare function publishAiJobProgress(jobId: string, data: {
    progress: number;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    preview_url?: string;
    output_urls?: string[];
    credits_used?: number;
    error_message?: string;
}): Promise<void>;
/**
 * Send a command to HELIX-BRAIN via Redis pub/sub
 */
export declare function sendHelixBrainCommand(command: {
    type: string;
    params: Record<string, unknown>;
}): Promise<void>;
export declare function notifyUser(userId: string, event: string, data: Record<string, unknown>): Promise<void>;
export declare function notifyOrder(orderId: string, event: string, data: Record<string, unknown>): Promise<void>;
export declare function notifyAdmins(event: string, data: Record<string, unknown>): Promise<void>;
//# sourceMappingURL=events.d.ts.map