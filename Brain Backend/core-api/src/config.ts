/**
 * Core API — Config
 * All environment variables validated at startup with Zod.
 * App refuses to start if any required variable is missing or invalid.
 */

// Load .env before anything else (no-op in production where env vars come from the host)
import * as dotenv from 'dotenv';
dotenv.config();

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

  // Stripe — optional, dummy values allowed for dev
  STRIPE_SECRET_KEY: z.string().default('sk_test_dummy_key'),
  STRIPE_WEBHOOK_SECRET: z.string().default('whsec_dummy'),
  STRIPE_CONNECT_CLIENT_ID: z.string().optional(),

  // Stripe Price IDs
  STRIPE_PRICE_PRO: z.string().optional(),
  STRIPE_PRICE_TEAM: z.string().optional(),
  STRIPE_PRICE_CREATOR: z.string().optional(),
  STRIPE_PRICE_PRO_CREATOR: z.string().optional(),
  STRIPE_PRICE_STUDIO: z.string().optional(),
  STRIPE_PRICE_CREDITS_100: z.string().optional(),
  STRIPE_PRICE_CREDITS_500: z.string().optional(),
  STRIPE_PRICE_CREDITS_2000: z.string().optional(),

  // R2 / S3 — optional for dev
  R2_ACCOUNT_ID: z.string().default('dummy'),
  R2_ACCESS_KEY_ID: z.string().default('dummy'),
  R2_SECRET_ACCESS_KEY: z.string().default('dummy'),
  R2_BUCKET_NAME: z.string().default('helixonix-assets'),
  R2_PUBLIC_URL: z.string().default('http://localhost:3000/placeholder'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(500),

  // AI Services — optional for dev
  REPLICATE_API_KEY: z.string().default('r8_dummy'),
  ELEVENLABS_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().default('sk-ant-dummy'),

  // Typesense
  TYPESENSE_HOST: z.string().default('localhost'),
  TYPESENSE_PORT: z.coerce.number().default(8108),
  TYPESENSE_PROTOCOL: z.enum(['http', 'https']).default('http'),
  TYPESENSE_API_KEY: z.string().default('local_typesense_key'),
  TYPESENSE_SEARCH_ONLY_KEY: z.string().optional(),

  // Email — optional for dev
  RESEND_API_KEY: z.string().default('re_dummy'),
  RESEND_FROM_EMAIL: z.string().default('noreply@helixonix.com'),

  // Internal services
  HELIX_BRAIN_URL: z.string().default('http://localhost:3001'),
  HELIX_BRAIN_INTERNAL_SECRET: z.string().default('helix-brain-dev-secret-456'),
  INTERNAL_API_SECRET: z.string().default('helix-internal-secret-dev-123'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174,http://localhost:5175'),

  // URLs
  BUYER_URL: z.string().default('http://localhost:5173'),
  CREATOR_URL: z.string().default('http://localhost:5174'),
  ADMIN_URL: z.string().default('http://localhost:5175'),

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

export type Config = typeof config;

// Derived helpers
export const corsOrigins = config.CORS_ORIGINS.split(',').map((o) => o.trim());

export const stripePriceMap: Record<string, string | undefined> = {
  pro: config.STRIPE_PRICE_PRO,
  team: config.STRIPE_PRICE_TEAM,
  creator: config.STRIPE_PRICE_CREATOR,
  pro_creator: config.STRIPE_PRICE_PRO_CREATOR,
  studio: config.STRIPE_PRICE_STUDIO,
};

export const creditPackMap: Record<string, { credits: number; priceId: string | undefined; amount: number }> = {
  '100': { credits: 100, priceId: config.STRIPE_PRICE_CREDITS_100, amount: 999 },
  '500': { credits: 500, priceId: config.STRIPE_PRICE_CREDITS_500, amount: 3999 },
  '2000': { credits: 2000, priceId: config.STRIPE_PRICE_CREDITS_2000, amount: 13999 },
};

export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';
