/**
 * Core API — Config
 * All environment variables validated at startup with Zod.
 * App refuses to start if any required variable is missing or invalid.
 */
import { z } from 'zod';
const configSchema = z.object({
    // App
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default('0.0.0.0'),
    API_VERSION: z.string().default('v1'),
    LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    // Database
    DATABASE_URL: z.string().url(),
    DATABASE_POOL_MAX: z.coerce.number().default(20),
    DATABASE_POOL_MIN: z.coerce.number().default(5),
    // Redis
    REDIS_URL: z.string().url(),
    // Auth
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_TTL: z.coerce.number().default(900),
    JWT_REFRESH_TTL: z.coerce.number().default(2592000),
    ARGON2_MEMORY: z.coerce.number().default(65536),
    // OAuth (optional for dev)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    // Stripe
    STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
    STRIPE_CONNECT_CLIENT_ID: z.string().optional(),
    // Stripe Price IDs
    STRIPE_PRICE_BUYER_PRO: z.string().optional(),
    STRIPE_PRICE_BUYER_TEAM: z.string().optional(),
    STRIPE_PRICE_SELLER_CREATOR: z.string().optional(),
    STRIPE_PRICE_SELLER_PRO: z.string().optional(),
    STRIPE_PRICE_SELLER_STUDIO: z.string().optional(),
    STRIPE_PRICE_CREDITS_100: z.string().optional(),
    STRIPE_PRICE_CREDITS_500: z.string().optional(),
    STRIPE_PRICE_CREDITS_2000: z.string().optional(),
    // R2 / S3
    R2_ACCOUNT_ID: z.string(),
    R2_ACCESS_KEY_ID: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
    R2_BUCKET_NAME: z.string().default('helixonix-assets'),
    R2_PUBLIC_URL: z.string().url(),
    MAX_UPLOAD_SIZE_MB: z.coerce.number().default(500),
    // AI Services
    REPLICATE_API_KEY: z.string().startsWith('r8_'),
    ELEVENLABS_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
    // Typesense
    TYPESENSE_HOST: z.string(),
    TYPESENSE_PORT: z.coerce.number().default(8108),
    TYPESENSE_PROTOCOL: z.enum(['http', 'https']).default('https'),
    TYPESENSE_API_KEY: z.string(),
    TYPESENSE_SEARCH_ONLY_KEY: z.string().optional(),
    // Email
    RESEND_API_KEY: z.string().startsWith('re_'),
    EMAIL_FROM: z.string().email(),
    EMAIL_SUPPORT: z.string().email(),
    // Internal services
    HELIX_BRAIN_URL: z.string().url(),
    HELIX_BRAIN_INTERNAL_SECRET: z.string().min(16),
    INTERNAL_API_SECRET: z.string().min(16),
    // CORS
    CORS_ORIGINS: z.string().default('http://localhost:5173'),
    // URLs
    BUYER_URL: z.string().url().default('http://localhost:5173'),
    CREATOR_URL: z.string().url().default('http://localhost:5174'),
    ADMIN_URL: z.string().url().default('http://localhost:5175'),
    // Monitoring (optional)
    SENTRY_DSN: z.string().optional(),
    SENTRY_ENVIRONMENT: z.string().optional(),
});
function loadConfig() {
    const result = configSchema.safeParse(process.env);
    if (!result.success) {
        console.error('❌ Invalid environment configuration:');
        const errors = result.error.flatten().fieldErrors;
        for (const [field, messages] of Object.entries(errors)) {
            console.error(`  ${field}: ${messages?.join(', ')}`);
        }
        process.exit(1);
    }
    return result.data;
}
export const config = loadConfig();
// Derived helpers
export const corsOrigins = config.CORS_ORIGINS.split(',').map((o) => o.trim());
export const stripePriceMap = {
    pro: config.STRIPE_PRICE_BUYER_PRO,
    team: config.STRIPE_PRICE_BUYER_TEAM,
    creator: config.STRIPE_PRICE_SELLER_CREATOR,
    pro_creator: config.STRIPE_PRICE_SELLER_PRO,
    studio: config.STRIPE_PRICE_SELLER_STUDIO,
};
export const creditPackMap = {
    '100': { credits: 100, priceId: config.STRIPE_PRICE_CREDITS_100, amount: 999 },
    '500': { credits: 500, priceId: config.STRIPE_PRICE_CREDITS_500, amount: 3999 },
    '2000': { credits: 2000, priceId: config.STRIPE_PRICE_CREDITS_2000, amount: 13999 },
};
export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';
//# sourceMappingURL=config.js.map