/**
 * RBAC Middleware — Role-Based Access Control
 * Composable guards for route protection by role
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { AppError, ErrorCodes, type UserRole } from '../types/index.js';

/**
 * Require one of the specified roles
 * Must run AFTER verifyJwt
 */
export function requireRole(...roles: UserRole[]) {
  return async function (request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    if (!request.user) {
      throw new AppError(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
    }
    if (!roles.includes(request.user.role)) {
      throw new AppError(ErrorCodes.FORBIDDEN, 'Insufficient permissions', 403);
    }
  };
}

/**
 * Require admin or super_admin role
 */
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  return requireRole('admin', 'super_admin')(request, reply);
}

/**
 * Require seller status (isSeller flag OR seller/admin role)
 */
export async function requireSeller(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (!request.user) {
    throw new AppError(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
  }
  if (!request.user.isSeller && !['admin', 'super_admin'].includes(request.user.role)) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Seller account required', 403);
  }
}

/**
 * Ensure the requesting user owns the resource (by userId param)
 * Or is an admin
 */
export function requireOwnership(getUserId: (req: FastifyRequest) => string) {
  return async function (request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    if (!request.user) {
      throw new AppError(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
    }
    const resourceUserId = getUserId(request);
    const isOwner = request.user.userId === resourceUserId;
    const isAdmin = ['admin', 'super_admin'].includes(request.user.role);
    if (!isOwner && !isAdmin) {
      throw new AppError(ErrorCodes.FORBIDDEN, 'Access denied', 403);
    }
  };
}
