/**
 * Global Error Handler — normalizes all errors to consistent API format
 * Handles: AppError, ZodError, Fastify validation errors, and uncaught errors
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AppError, ErrorCodes } from '../types/index.js';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(async (error: Error, request: FastifyRequest, reply: FastifyReply) => {
    // Already-sent response
    if (reply.sent) return;

    // AppError — our custom typed errors
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
    }

    // ZodError — validation failures
    if (error instanceof ZodError) {
      return reply.status(422).send({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Validation failed',
          details: error.flatten().fieldErrors,
        },
      });
    }

    // Fastify validation errors (JSON schema)
    if ('validation' in error && error['validation']) {
      return reply.status(422).send({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: (error as any).message || 'Validation failed',
          details: (error as any).validation,
        },
      });
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return reply.status(401).send({
        success: false,
        error: { code: ErrorCodes.UNAUTHORIZED, message: 'Invalid or expired token' },
      });
    }

    // Fastify 404
    if ((error as any).statusCode === 404) {
      return reply.status(404).send({
        success: false,
        error: { code: ErrorCodes.NOT_FOUND, message: 'Route not found' },
      });
    }

    // Rate limit (fastify-rate-limit)
    if ((error as any).statusCode === 429) {
      return reply.status(429).send({
        success: false,
        error: { code: ErrorCodes.RATE_LIMITED, message: 'Too many requests, please slow down' },
      });
    }

    // Log unexpected errors
    request.log.error({ err: error, url: request.url, method: request.method }, 'Unhandled error');

    return reply.status(500).send({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
      },
    });
  });

  // 404 handler
  app.setNotFoundHandler((_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(404).send({
      success: false,
      error: { code: ErrorCodes.NOT_FOUND, message: 'Route not found' },
    });
  });
}
