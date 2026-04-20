/**
 * Redis — ioredis client + pub/sub
 * Exports: redis (main client), subscriber (dedicated pub/sub), publisher
 */
import IORedis from 'ioredis';
export declare const redis: IORedis;
export declare const subscriber: IORedis;
export declare const publisher: IORedis;
export declare const bullmqConnection: IORedis;
export declare const RedisKeys: {
    readonly session: (userId: string) => string;
    readonly credits: (userId: string) => string;
    readonly aiConfig: (toolType: string) => string;
    readonly trendingAssets: () => string;
    readonly userRecommendations: (userId: string) => string;
    readonly rateLimit: (ip: string, endpoint: string) => string;
    readonly aiJobStatus: (jobId: string) => string;
    readonly moderationScore: (assetId: string) => string;
    readonly sellerStats: (sellerId: string) => string;
    readonly downloadCount: (assetId: string) => string;
    readonly aiJobChannel: (jobId: string) => string;
};
export declare const PubSubChannels: {
    readonly PLATFORM_EVENTS: "helixonix:events";
    readonly WS_EVENTS: "helixonix:ws:events";
    readonly HELIX_BRAIN_COMMANDS: "helixonix:helix-brain:commands";
};
export declare function getCredits(userId: string): Promise<number>;
export declare function deductCredits(userId: string, amount: number): Promise<number>;
export declare function addCredits(userId: string, amount: number): Promise<number>;
export declare function setCredits(userId: string, amount: number, ttl?: number): Promise<void>;
export declare function incrementDownloadCount(assetId: string): Promise<void>;
export declare function pingRedis(): Promise<boolean>;
export declare function closeRedis(): Promise<void>;
//# sourceMappingURL=redis.d.ts.map