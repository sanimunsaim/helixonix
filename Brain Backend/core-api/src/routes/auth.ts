/**
 * Routes — Auth
 * POST /auth/register, /auth/login, /auth/logout, /auth/refresh
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { registerUser, loginUser, logoutUser, refreshTokens } from '../services/auth.service.js';
import { verifyJwt } from '../middleware/auth.js';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/),
  displayName: z.string().min(2).max(60),
  password: z.string().min(8).max(128),
  role: z.enum(['buyer', 'seller']).optional().default('buyer'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({ refreshToken: z.string().min(1) });

export async function authRoutes(app: FastifyInstance) {

  app.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const result = await registerUser(body, app);
    return reply.status(201).send({ success: true, data: result });
  });

  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const result = await loginUser({ ...body, ip: request.ip }, app);
    return reply.send({ success: true, data: result });
  });

  app.post('/logout', { preHandler: [verifyJwt] }, async (request, reply) => {
    await logoutUser(request.user.userId);
    return reply.send({ success: true, data: { message: 'Logged out successfully' } });
  });

  app.post('/refresh', async (request, reply) => {
    const { refreshToken } = refreshSchema.parse(request.body);
    const tokens = await refreshTokens(refreshToken, app);
    return reply.send({ success: true, data: tokens });
  });

  app.get('/me', { preHandler: [verifyJwt] }, async (request, reply) => {
    const { db } = await import('../lib/db.js');
    const { users } = await import('../schemas/db/index.js');
    const { eq } = await import('drizzle-orm');
    const user = await db.query.users.findFirst({ where: eq(users.id, request.user.userId) });
    if (!user) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    const { passwordHash, twoFactorSecret, ...safeUser } = user;
    return reply.send({ success: true, data: safeUser });
  });
}
