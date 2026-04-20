/**
 * Redis Pub/Sub Event Publisher
 * Publishes platform events to Redis channels for cross-service communication
 */
import { publisher, PubSubChannels } from './redis.js';
/**
 * Publish a platform event to the events channel (helix-brain subscribes)
 */
export async function publishEvent(type, payload) {
    try {
        const event = {
            type,
            payload,
            timestamp: Date.now(),
            source: 'core-api',
        };
        await publisher.publish(PubSubChannels.PLATFORM_EVENTS, JSON.stringify(event));
    }
    catch {
        // Never break request flow on publish failure
    }
}
/**
 * Publish a WebSocket event — forwarded by WS server to appropriate rooms
 */
export async function publishWsEvent(params) {
    try {
        await publisher.publish(PubSubChannels.WS_EVENTS, JSON.stringify(params));
    }
    catch {
        // Never throw
    }
}
/**
 * Publish an AI job progress event — picked up by SSE endpoint
 */
export async function publishAiJobProgress(jobId, data) {
    try {
        await publisher.publish(`helixonix:ai:job:${jobId}`, JSON.stringify(data));
    }
    catch {
        // Never throw
    }
}
/**
 * Send a command to HELIX-BRAIN via Redis pub/sub
 */
export async function sendHelixBrainCommand(command) {
    try {
        await publisher.publish(PubSubChannels.HELIX_BRAIN_COMMANDS, JSON.stringify({
            ...command,
            timestamp: Date.now(),
        }));
    }
    catch {
        // Never throw
    }
}
// ── Notification to specific user via WebSocket ───────────────────────────────
export async function notifyUser(userId, event, data) {
    return publishWsEvent({ room: `user:${userId}`, event, data });
}
export async function notifyOrder(orderId, event, data) {
    return publishWsEvent({ room: `order:${orderId}`, event, data });
}
export async function notifyAdmins(event, data) {
    return publishWsEvent({ room: 'admin:alerts', event, data });
}
//# sourceMappingURL=events.js.map