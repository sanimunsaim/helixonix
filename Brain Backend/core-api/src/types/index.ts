/**
 * Shared TypeScript types for Core API
 */

import type { FastifyRequest, FastifyReply } from 'fastify';

// ── Authenticated Request ──────────────────────────────────────────────────────

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  isSeller: boolean;
  iat?: number;
  exp?: number;
}

export type UserRole = 'buyer' | 'seller' | 'admin' | 'super_admin';

export interface AuthenticatedRequest extends FastifyRequest {
  user: JwtPayload;
}

// ── Standard API Responses ────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  perPage: number;
  offset: number;
}

export function parsePagination(query: { page?: unknown; per_page?: unknown }): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(String(query.per_page ?? '24'), 10) || 24));
  return { page, perPage, offset: (page - 1) * perPage };
}

// ── Error Codes ───────────────────────────────────────────────────────────────

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  AI_GENERATION_FAILED: 'AI_GENERATION_FAILED',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_WEBHOOK: 'INVALID_WEBHOOK',
  ASSET_NOT_OWNED: 'ASSET_NOT_OWNED',
  ORDER_STATUS_INVALID: 'ORDER_STATUS_INVALID',
  SELLER_NOT_ONBOARDED: 'SELLER_NOT_ONBOARDED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// ── Custom Error ──────────────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// ── Helper: send success response ────────────────────────────────────────────

export function sendSuccess<T>(reply: FastifyReply, data: T, meta?: ApiSuccess['meta'], statusCode = 200) {
  return reply.status(statusCode).send({ success: true, data, ...(meta ? { meta } : {}) });
}

export function sendError(reply: FastifyReply, code: ErrorCode, message: string, statusCode = 400, details?: unknown) {
  return reply.status(statusCode).send({ success: false, error: { code, message, details } });
}
