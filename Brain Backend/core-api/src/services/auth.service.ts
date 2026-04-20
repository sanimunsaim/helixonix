/**
 * Auth Service — register, login, token management
 */

import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { redis, RedisKeys } from '../lib/redis.js';
import { users } from '../schemas/db/users.js';
import { AppError, ErrorCodes } from '../types/index.js';
import { config } from '../config.js';
import { publishEvent } from '../lib/events.js';
import { writeAuditLog } from '../lib/audit.js';
import type { FastifyInstance } from 'fastify';

export interface RegisterParams {
  email: string;
  username: string;
  displayName: string;
  password: string;
  role?: 'buyer' | 'seller';
}

export interface LoginParams {
  email: string;
  password: string;
  ip?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Register a new user
 */
export async function registerUser(params: RegisterParams, fastify: FastifyInstance) {
  // Check uniqueness
  const existing = await db.query.users.findFirst({
    where: eq(users.email, params.email.toLowerCase()),
  });
  if (existing) {
    throw new AppError(ErrorCodes.ALREADY_EXISTS, 'Email is already registered', 409);
  }

  const existingUsername = await db.query.users.findFirst({
    where: eq(users.username, params.username.toLowerCase()),
  });
  if (existingUsername) {
    throw new AppError(ErrorCodes.ALREADY_EXISTS, 'Username is already taken', 409);
  }

  // Hash password
  const passwordHash = await argon2.hash(params.password, {
    memoryCost: config.ARGON2_MEMORY,
    timeCost: 2,
    parallelism: 1,
  });

  // Create user
  const [user] = await db.insert(users).values({
    email: params.email.toLowerCase(),
    username: params.username.toLowerCase(),
    displayName: params.displayName,
    passwordHash,
    role: params.role === 'seller' ? 'seller' : 'buyer',
    isSeller: params.role === 'seller',
    aiCredits: 50, // welcome credits
  }).returning();

  // Cache initial credits in Redis
  await redis.set(RedisKeys.credits(user.id), 50);

  // Emit event → helix-brain sends welcome email
  await publishEvent('user.registered', { userId: user.id, email: user.email, displayName: user.displayName });

  // Audit
  await writeAuditLog({ action: 'user.register', actorId: user.id, targetId: user.id, targetType: 'user' });

  // Generate tokens
  return generateTokens(user, fastify);
}

/**
 * Login with email + password
 */
export async function loginUser(params: LoginParams, fastify: FastifyInstance): Promise<TokenPair & { user: any }> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, params.email.toLowerCase()),
  });

  if (!user || !user.passwordHash) {
    throw new AppError(ErrorCodes.UNAUTHORIZED, 'Invalid email or password', 401);
  }

  const validPassword = await argon2.verify(user.passwordHash, params.password);
  if (!validPassword) {
    throw new AppError(ErrorCodes.UNAUTHORIZED, 'Invalid email or password', 401);
  }

  if (user.status === 'banned') {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Your account has been banned', 403);
  }
  if (user.status === 'suspended') {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Your account has been suspended', 403);
  }

  // Update last login
  await db.update(users).set({ lastLoginAt: new Date(), lastLoginIp: params.ip }).where(eq(users.id, user.id));

  await writeAuditLog({ action: 'user.login', actorId: user.id, ip: params.ip });

  const tokens = await generateTokens(user, fastify);
  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      isSeller: user.isSeller,
      avatarUrl: user.avatarUrl,
      aiCredits: user.aiCredits,
      subscriptionPlan: user.subscriptionPlan,
    },
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshTokens(refreshToken: string, fastify: FastifyInstance): Promise<TokenPair> {
  let payload: any;
  try {
    payload = fastify.jwt.verify(refreshToken, { key: config.JWT_REFRESH_SECRET });
  } catch {
    throw new AppError(ErrorCodes.UNAUTHORIZED, 'Invalid refresh token', 401);
  }

  // Verify session still valid in Redis
  const storedToken = await redis.get(RedisKeys.session(payload.userId));
  if (!storedToken || storedToken !== refreshToken) {
    throw new AppError(ErrorCodes.UNAUTHORIZED, 'Session expired, please login again', 401);
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, payload.userId) });
  if (!user || user.status === 'banned') {
    throw new AppError(ErrorCodes.UNAUTHORIZED, 'Account not found or banned', 401);
  }

  return generateTokens(user, fastify);
}

/**
 * Logout — invalidate session in Redis
 */
export async function logoutUser(userId: string): Promise<void> {
  await redis.del(RedisKeys.session(userId));
  await writeAuditLog({ action: 'user.logout', actorId: userId });
}

// ── Internal helpers ───────────────────────────────────────────────────────────

async function generateTokens(user: any, fastify: FastifyInstance): Promise<TokenPair> {
  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    isSeller: user.isSeller,
  };

  const accessToken = fastify.jwt.sign(jwtPayload, { expiresIn: config.JWT_ACCESS_TTL });
  const refreshToken = fastify.jwt.sign(jwtPayload, {
    key: config.JWT_REFRESH_SECRET,
    expiresIn: config.JWT_REFRESH_TTL,
  });

  // Store refresh token in Redis (TTL = 30 days)
  await redis.setex(RedisKeys.session(user.id), config.JWT_REFRESH_TTL, refreshToken);

  return { accessToken, refreshToken, expiresIn: config.JWT_ACCESS_TTL };
}
