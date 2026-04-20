/**
 * Auth Middleware — JWT verification for Fastify
 * Attaches decoded user payload to request.user
 */
import { AppError, ErrorCodes } from '../types/index.js';
/**
 * Verify JWT — throws 401 if missing or invalid
 * Used as preHandler on protected routes
 */
export async function verifyJwt(request, reply) {
    try {
        await request.jwtVerify();
    }
    catch {
        throw new AppError(ErrorCodes.UNAUTHORIZED, 'Invalid or expired token', 401);
    }
}
/**
 * Optionally verify JWT — attaches user if present, continues if not
 * Used on routes that behave differently for authenticated vs guest users
 */
export async function optionalJwt(request, _reply) {
    try {
        await request.jwtVerify();
    }
    catch {
        // Not authenticated — continue without user
    }
}
/**
 * Verify internal service secret header
 * Used for helix-brain → core-api internal calls
 */
export async function verifyInternalSecret(request, _reply) {
    const secret = request.headers['x-internal-secret'];
    if (secret !== process.env.INTERNAL_API_SECRET) {
        throw new AppError(ErrorCodes.UNAUTHORIZED, 'Invalid internal secret', 401);
    }
}
/**
 * Verify HELIX-BRAIN service key
 */
export async function verifyHelixBrainKey(request, _reply) {
    const key = request.headers['x-helix-brain-secret'];
    if (key !== process.env.HELIX_BRAIN_INTERNAL_SECRET) {
        throw new AppError(ErrorCodes.UNAUTHORIZED, 'Invalid HELIX-BRAIN secret', 401);
    }
}
//# sourceMappingURL=auth.js.map