/**
 * Redis — ioredis client + pub/sub
 * Exports: redis (main client), subscriber (dedicated pub/sub), publisher
 */
import IORedis from 'ioredis';
import { config } from '../config.js';
const redisOptions = {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    lazyConnect: false,
    retryStrategy(times) {
        if (times > 10)
            return null; // Stop retrying after 10 attempts
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
    session: (userId) => `session:${userId}`,
    credits: (userId) => `credits:${userId}`,
    aiConfig: (toolType) => `ai:config:${toolType}`,
    trendingAssets: () => `trending:assets`,
    userRecommendations: (userId) => `user:${userId}:recommendations`,
    rateLimit: (ip, endpoint) => `rate_limit:${ip}:${endpoint}`,
    aiJobStatus: (jobId) => `ai:job:${jobId}:status`,
    moderationScore: (assetId) => `moderation:auto_score:${assetId}`,
    sellerStats: (sellerId) => `seller:${sellerId}:stats`,
    downloadCount: (assetId) => `download:count:${assetId}`,
    aiJobChannel: (jobId) => `helixonix:ai:job:${jobId}`,
};
// ── Pub/Sub Channels ─────────────────────────────────────────────────────────
export const PubSubChannels = {
    PLATFORM_EVENTS: 'helixonix:events',
    WS_EVENTS: 'helixonix:ws:events',
    HELIX_BRAIN_COMMANDS: 'helixonix:helix-brain:commands',
};
// ── Credit Operations ─────────────────────────────────────────────────────────
export async function getCredits(userId) {
    const val = await redis.get(RedisKeys.credits(userId));
    return val ? parseInt(val, 10) : 0;
}
export async function deductCredits(userId, amount) {
    const key = RedisKeys.credits(userId);
    const result = await redis.decrby(key, amount);
    return result;
}
export async function addCredits(userId, amount) {
    const key = RedisKeys.credits(userId);
    const result = await redis.incrby(key, amount);
    return result;
}
export async function setCredits(userId, amount, ttl) {
    const key = RedisKeys.credits(userId);
    if (ttl) {
        await redis.setex(key, ttl, amount);
    }
    else {
        await redis.set(key, amount);
    }
}
// ── Download Counter (batch flush to DB hourly) ───────────────────────────────
export async function incrementDownloadCount(assetId) {
    await redis.incr(RedisKeys.downloadCount(assetId));
}
// ── Health Check ──────────────────────────────────────────────────────────────
export async function pingRedis() {
    try {
        const result = await redis.ping();
        return result === 'PONG';
    }
    catch {
        return false;
    }
}
export async function closeRedis() {
    await Promise.all([
        redis.quit(),
        subscriber.quit(),
        publisher.quit(),
        bullmqConnection.quit(),
    ]);
}
//# sourceMappingURL=redis.js.map