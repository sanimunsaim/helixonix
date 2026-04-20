/**
 * Redis Pub/Sub Event Publisher
 * Publishes platform events to Redis channels for cross-service communication
 */

import { publisher, PubSubChannels } from './redis.js';

export type EventType =
  | 'user.registered' | 'user.updated' | 'user.banned'
  | 'asset.uploaded' | 'asset.approved' | 'asset.rejected' | 'asset.purchased' | 'asset.downloaded'
  | 'gig.created' | 'gig.published' | 'gig.updated'
  | 'order.created' | 'order.accepted' | 'order.delivered' | 'order.completed' | 'order.cancelled' | 'order.disputed'
  | 'payment.succeeded' | 'payment.failed' | 'payment.refunded'
  | 'payout.requested' | 'payout.processed'
  | 'ai.job.queued' | 'ai.job.completed' | 'ai.job.failed'
  | 'dispute.opened' | 'dispute.resolved'
  | 'seller.level_changed';

export interface PlatformEvent {
  type: EventType;
  payload: Record<string, unknown>;
  timestamp?: number;
  source?: string;
}

/**
 * Publish a platform event to the events channel (helix-brain subscribes)
 */
export async function publishEvent(type: EventType, payload: Record<string, unknown>): Promise<void> {
  try {
    const event: PlatformEvent = {
      type,
      payload,
      timestamp: Date.now(),
      source: 'core-api',
    };
    await publisher.publish(PubSubChannels.PLATFORM_EVENTS, JSON.stringify(event));
  } catch {
    // Never break request flow on publish failure
  }
}

/**
 * Publish a WebSocket event — forwarded by WS server to appropriate rooms
 */
export async function publishWsEvent(params: {
  room: string;
  event: string;
  data: Record<string, unknown>;
}): Promise<void> {
  try {
    await publisher.publish(PubSubChannels.WS_EVENTS, JSON.stringify(params));
  } catch {
    // Never throw
  }
}

/**
 * Publish an AI job progress event — picked up by SSE endpoint
 */
export async function publishAiJobProgress(jobId: string, data: {
  progress: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  preview_url?: string;
  output_urls?: string[];
  credits_used?: number;
  error_message?: string;
}): Promise<void> {
  try {
    await publisher.publish(`helixonix:ai:job:${jobId}`, JSON.stringify(data));
  } catch {
    // Never throw
  }
}

/**
 * Send a command to HELIX-BRAIN via Redis pub/sub
 */
export async function sendHelixBrainCommand(command: {
  type: string;
  params: Record<string, unknown>;
}): Promise<void> {
  try {
    await publisher.publish(PubSubChannels.HELIX_BRAIN_COMMANDS, JSON.stringify({
      ...command,
      timestamp: Date.now(),
    }));
  } catch {
    // Never throw
  }
}

// ── Notification to specific user via WebSocket ───────────────────────────────

export async function notifyUser(userId: string, event: string, data: Record<string, unknown>): Promise<void> {
  return publishWsEvent({ room: `user:${userId}`, event, data });
}

export async function notifyOrder(orderId: string, event: string, data: Record<string, unknown>): Promise<void> {
  return publishWsEvent({ room: `order:${orderId}`, event, data });
}

export async function notifyAdmins(event: string, data: Record<string, unknown>): Promise<void> {
  return publishWsEvent({ room: 'admin:alerts', event, data });
}
