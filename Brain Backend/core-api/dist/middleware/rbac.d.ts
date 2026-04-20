/**
 * RBAC Middleware — Role-Based Access Control
 * Composable guards for route protection by role
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { type UserRole } from '../types/index.js';
/**
 * Require one of the specified roles
 * Must run AFTER verifyJwt
 */
export declare function requireRole(...roles: UserRole[]): (request: FastifyRequest, _reply: FastifyReply) => Promise<void>;
/**
 * Require admin or super_admin role
 */
export declare function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void>;
/**
 * Require seller status (isSeller flag OR seller/admin role)
 */
export declare function requireSeller(request: FastifyRequest, _reply: FastifyReply): Promise<void>;
/**
 * Ensure the requesting user owns the resource (by userId param)
 * Or is an admin
 */
export declare function requireOwnership(getUserId: (req: FastifyRequest) => string): (request: FastifyRequest, _reply: FastifyReply) => Promise<void>;
//# sourceMappingURL=rbac.d.ts.map