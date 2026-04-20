/**
 * Redis Client Module
 * Handles pub/sub for event-driven triggers and BullMQ queue backend
 */

import Redis from 'ioredis';
import { logger } from './logger';

// Redis connection for BullMQ (requires enableReadyCheck: false)
export const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Dedicated Redis client for publishing events
export const redisPublisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Dedicated Redis client for subscribing to events
export const redisSubscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const EVENT_CHANNEL = process.env.REDIS_EVENT_CHANNEL || 'helixonix:events';

/**
 * Publish an event to the HelixOnix event channel
 */
export async function publishEvent(
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const message = JSON.stringify({
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
      source: 'helix-brain',
    });
    await redisPublisher.publish(EVENT_CHANNEL, message);
    logger.debug({ eventType }, 'Published event to Redis');
  } catch (error) {
    logger.error({ error, eventType }, 'Failed to publish event to Redis');
    throw error;
  }
}

/**
 * Subscribe to the event channel and dispatch to handlers
 */
export async function subscribeToEvents(
  handler: (eventType: string, payload: Record<string, unknown>) => Promise<void> | void
): Promise<void> {
  await redisSubscriber.subscribe(EVENT_CHANNEL);
  logger.info(`Subscribed to Redis channel: ${EVENT_CHANNEL}`);

  redisSubscriber.on('message', async (channel, message) => {
    if (channel !== EVENT_CHANNEL) return;

    try {
      const event = JSON.parse(message);
      logger.debug({ eventType: event.type }, 'Received event from Redis');
      await handler(event.type, event.payload);
    } catch (error) {
      logger.error({ error, rawMessage: message }, 'Error processing Redis event');
    }
  });
}

/**
 * Graceful shutdown of Redis connections
 */
export async function closeRedisConnections(): Promise<void> {
  await redisPublisher.quit();
  await redisSubscriber.quit();
  await redisConnection.quit();
  logger.info('Redis connections closed');
}

// Handle process exit
process.on('SIGINT', async () => {
  await closeRedisConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeRedisConnections();
  process.exit(0);
});
