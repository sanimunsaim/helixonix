/**
 * Core API — Config
 * All environment variables validated at startup with Zod.
 * App refuses to start if any required variable is missing or invalid.
 */
export declare const config: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    HOST: string;
    API_VERSION: string;
    LOG_LEVEL: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
    DATABASE_URL: string;
    DATABASE_POOL_MAX: number;
    DATABASE_POOL_MIN: number;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_TTL: number;
    JWT_REFRESH_TTL: number;
    ARGON2_MEMORY: number;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    R2_ACCOUNT_ID: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_BUCKET_NAME: string;
    R2_PUBLIC_URL: string;
    MAX_UPLOAD_SIZE_MB: number;
    REPLICATE_API_KEY: string;
    ANTHROPIC_API_KEY: string;
    TYPESENSE_HOST: string;
    TYPESENSE_PORT: number;
    TYPESENSE_PROTOCOL: "http" | "https";
    TYPESENSE_API_KEY: string;
    RESEND_API_KEY: string;
    EMAIL_FROM: string;
    EMAIL_SUPPORT: string;
    HELIX_BRAIN_URL: string;
    HELIX_BRAIN_INTERNAL_SECRET: string;
    INTERNAL_API_SECRET: string;
    CORS_ORIGINS: string;
    BUYER_URL: string;
    CREATOR_URL: string;
    ADMIN_URL: string;
    GOOGLE_CLIENT_ID?: string | undefined;
    GOOGLE_CLIENT_SECRET?: string | undefined;
    STRIPE_CONNECT_CLIENT_ID?: string | undefined;
    STRIPE_PRICE_BUYER_PRO?: string | undefined;
    STRIPE_PRICE_BUYER_TEAM?: string | undefined;
    STRIPE_PRICE_SELLER_CREATOR?: string | undefined;
    STRIPE_PRICE_SELLER_PRO?: string | undefined;
    STRIPE_PRICE_SELLER_STUDIO?: string | undefined;
    STRIPE_PRICE_CREDITS_100?: string | undefined;
    STRIPE_PRICE_CREDITS_500?: string | undefined;
    STRIPE_PRICE_CREDITS_2000?: string | undefined;
    ELEVENLABS_API_KEY?: string | undefined;
    TYPESENSE_SEARCH_ONLY_KEY?: string | undefined;
    SENTRY_DSN?: string | undefined;
    SENTRY_ENVIRONMENT?: string | undefined;
};
export type Config = typeof config;
export declare const corsOrigins: string[];
export declare const stripePriceMap: Record<string, string | undefined>;
export declare const creditPackMap: Record<string, {
    credits: number;
    priceId: string | undefined;
    amount: number;
}>;
export declare const isProduction: boolean;
export declare const isDevelopment: boolean;
//# sourceMappingURL=config.d.ts.map