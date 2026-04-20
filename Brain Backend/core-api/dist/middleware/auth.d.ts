/**
 * Auth Middleware — JWT verification for Fastify
 * Attaches decoded user payload to request.user
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
/**
 * Verify JWT — throws 401 if missing or invalid
 * Used as preHandler on protected routes
 */
export declare function verifyJwt(request: FastifyRequest, reply: FastifyReply): Promise<void>;
/**
 * Optionally verify JWT — attaches user if present, continues if not
 * Used on routes that behave differently for authenticated vs guest users
 */
export declare function optionalJwt(request: FastifyRequest, _reply: FastifyReply): Promise<void>;
/**
 * Verify internal service secret header
 * Used for helix-brain → core-api internal calls
 */
export declare function verifyInternalSecret(request: FastifyRequest, _reply: FastifyReply): Promise<void>;
/**
 * Verify HELIX-BRAIN service key
 */
export declare function verifyHelixBrainKey(request: FastifyRequest, _reply: FastifyReply): Promise<void>;
//# sourceMappingURL=auth.d.ts.map