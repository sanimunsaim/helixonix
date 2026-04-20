/**
 * Redis — ioredis client + pub/sub
 * Exports: redis (main client), subscriber (dedicated pub/sub), publisher
 */

import IORedis from 'ioredis';
import { config } from '../config.js';

const redisOptions: any = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  lazyConnect: false,
  retryStrategy(times: number) {
    if (times > 10) return null; // Stop retrying after 10 attempts
    return Math.min(times * 500, 5000);
  },
};

// Main Redis client — used for get/set/hash operations
export const redis = new IORedis(config.REDIS_URL, redisOptions);

// Dedicated subscriber client — never use for commands
export const subscriber = new IORedis(config.REDIS_URL, redisOptions);

// Dedicated publisher client
export const publisher = new IORedis(config.REDIS_URL, redisOptions);

// BullMQ connection (separate instance, no ready check)
export const bullmqConnection = new IORedis(config.REDIS_URL, {
  ...redisOptions,
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => console.error('[Redis] Client error:', err.message));
subscriber.on('error', (err) => console.error('[Redis] Subscriber error:', err.message));
publisher.on('error', (err) => console.error('[Redis] Publisher error:', err.message));

// ── Key Helpers ──────────────────────────────────────────────────────────────

export const RedisKeys = {
  session: (userId: string) => `session:${userId}`,
  credits: (userId: string) => `credits:${userId}`,
  aiConfig: (toolType: string) => `ai:config:${toolType}`,
  trendingAssets: () => `trending:assets`,
  userRecommendations: (userId: string) => `user:${userId}:recommendations`,
  rateLimit: (ip: string, endpoint: string) => `rate_limit:${ip}:${endpoint}`,
  aiJobStatus: (jobId: string) => `ai:job:${jobId}:status`,
  moderationScore: (assetId: string) => `moderation:auto_score:${assetId}`,
  sellerStats: (sellerId: string) => `seller:${sellerId}:stats`,
  downloadCount: (assetId: string) => `download:count:${assetId}`,
  aiJobChannel: (jobId: string) => `helixonix:ai:job:${jobId}`,
} as const;

// ── Pub/Sub Channels ─────────────────────────────────────────────────────────

export const PubSubChannels = {
  PLATFORM_EVENTS: 'helixonix:events',
  WS_EVENTS: 'helixonix:ws:events',
  HELIX_BRAIN_COMMANDS: 'helixonix:helix-brain:commands',
} as const;

// ── Credit Operations ─────────────────────────────────────────────────────────

export async function getCredits(userId: string): Promise<number> {
  const val = await redis.get(RedisKeys.credits(userId));
  return val ? parseInt(val, 10) : 0;
}

export async function deductCredits(userId: string, amount: number): Promise<number> {
  const key = RedisKeys.credits(userId);
  const result = await redis.decrby(key, amount);
  return result;
}

export async function addCredits(userId: string, amount: number): Promise<number> {
  const key = RedisKeys.credits(userId);
  const result = await redis.incrby(key, amount);
  return result;
}

export async function setCredits(userId: string, amount: number, ttl?: number): Promise<void> {
  const key = RedisKeys.credits(userId);
  if (ttl) {
    await redis.setex(key, ttl, amount);
  } else {
    await redis.set(key, amount);
  }
}

// ── Download Counter (batch flush to DB hourly) ───────────────────────────────

export async function incrementDownloadCount(assetId: string): Promise<void> {
  await redis.incr(RedisKeys.downloadCount(assetId));
}

// ── Health Check ──────────────────────────────────────────────────────────────

export async function pingRedis(): Promise<boolean> {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  await Promise.all([
    redis.quit(),
    subscriber.quit(),
    publisher.quit(),
    bullmqConnection.quit(),
  ]);
}
