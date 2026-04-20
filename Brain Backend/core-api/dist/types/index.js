/**
 * Shared TypeScript types for Core API
 */
export function parsePagination(query) {
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
};
// ── Custom Error ──────────────────────────────────────────────────────────────
export class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(code, message, statusCode = 400, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
    }
}
// ── Helper: send success response ────────────────────────────────────────────
export function sendSuccess(reply, data, meta, statusCode = 200) {
    return reply.status(statusCode).send({ success: true, data, ...(meta ? { meta } : {}) });
}
export function sendError(reply, code, message, statusCode = 400, details) {
    return reply.status(statusCode).send({ success: false, error: { code, message, details } });
}
//# sourceMappingURL=index.js.map