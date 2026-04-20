/**
 * Fastify App Setup — Plugins, error handling, route registration
 */
import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastifyRawBody from 'fastify-raw-body';
import { config, corsOrigins } from './config.js';
import { registerErrorHandler } from './middleware/errorHandler.js';
// Route imports
import { authRoutes } from './routes/auth.js';
import { assetRoutes } from './routes/assets.js';
import { gigRoutes } from './routes/gigs.js';
import { aiRoutes } from './routes/ai.js';
import { paymentRoutes } from './routes/payments.js';
import { orderRoutes } from './routes/orders.js';
import { searchRoutes } from './routes/search.js';
import { notificationRoutes } from './routes/notifications.js';
import { messageRoutes } from './routes/messages.js';
import { adminRoutes } from './routes/admin/index.js';
import { internalHelixBrainRoutes } from './routes/internal/helixbrain.js';
export async function buildApp() {
    const app = fastify({
        logger: {
            level: config.NODE_ENV === 'development' ? 'debug' : 'info',
            transport: config.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
        },
        disableRequestLogging: config.NODE_ENV !== 'development',
    });
    // ── Plugins ─────────────────────────────────────────────────────────────
    await app.register(helmet, { global: true, contentSecurityPolicy: false }); // Disable CSP for swagger
    await app.register(cors, {
        origin: corsOrigins,
        credentials: true,
    });
    await app.register(fastifyRawBody, {
        field: 'rawBody',
        global: false,
        encoding: 'utf8',
        runFirst: true, // Needed for Stripe webhooks
    });
    await app.register(jwt, {
        secret: config.JWT_SECRET,
        sign: { expiresIn: config.JWT_ACCESS_TTL },
    });
    await app.register(multipart, {
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB fallback, main uploads via R2 presigned
    });
    await app.register(rateLimit, {
        max: 1000,
        timeWindow: '1 minute',
        redis: (await import('./lib/redis.js')).redis,
    });
    // Swagger setup
    await app.register(swagger, {
        openapi: {
            info: { title: 'HelixOnix Core API', version: '1.0.0' },
            components: {
                securitySchemes: {
                    bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
                },
            },
        },
    });
    await app.register(swaggerUi, { routePrefix: '/docs' });
    // ── Error Handling ──────────────────────────────────────────────────────
    registerErrorHandler(app);
    // ── Routes ──────────────────────────────────────────────────────────────
    app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
    await app.register(async (api) => {
        await api.register(authRoutes, { prefix: '/auth' });
        await api.register(assetRoutes, { prefix: '/assets' });
        await api.register(gigRoutes, { prefix: '/gigs' });
        await api.register(aiRoutes, { prefix: '/ai' });
        await api.register(paymentRoutes, { prefix: '/payments' });
        await api.register(orderRoutes, { prefix: '/orders' });
        await api.register(searchRoutes, { prefix: '/search' });
        await api.register(notificationRoutes, { prefix: '/notifications' });
        await api.register(messageRoutes, { prefix: '/messages' });
        await api.register(adminRoutes, { prefix: '/admin' });
        await api.register(internalHelixBrainRoutes, { prefix: '/internal/helix-brain' });
    }, { prefix: '/v1' });
    return app;
}
//# sourceMappingURL=app.js.map