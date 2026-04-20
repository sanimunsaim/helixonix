/**
 * Shared TypeScript types for Core API
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
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
export interface PaginationParams {
    page: number;
    perPage: number;
    offset: number;
}
export declare function parsePagination(query: {
    page?: unknown;
    per_page?: unknown;
}): PaginationParams;
export declare const ErrorCodes: {
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly ALREADY_EXISTS: "ALREADY_EXISTS";
    readonly INSUFFICIENT_CREDITS: "INSUFFICIENT_CREDITS";
    readonly PAYMENT_FAILED: "PAYMENT_FAILED";
    readonly UPLOAD_FAILED: "UPLOAD_FAILED";
    readonly AI_GENERATION_FAILED: "AI_GENERATION_FAILED";
    readonly RATE_LIMITED: "RATE_LIMITED";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly INVALID_WEBHOOK: "INVALID_WEBHOOK";
    readonly ASSET_NOT_OWNED: "ASSET_NOT_OWNED";
    readonly ORDER_STATUS_INVALID: "ORDER_STATUS_INVALID";
    readonly SELLER_NOT_ONBOARDED: "SELLER_NOT_ONBOARDED";
};
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
export declare class AppError extends Error {
    code: ErrorCode;
    statusCode: number;
    details?: unknown | undefined;
    constructor(code: ErrorCode, message: string, statusCode?: number, details?: unknown | undefined);
}
export declare function sendSuccess<T>(reply: FastifyReply, data: T, meta?: ApiSuccess['meta'], statusCode?: number): FastifyReply<import("fastify").RouteGenericInterface, import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, unknown, import("fastify").FastifySchema, import("fastify").FastifyTypeProviderDefault, unknown>;
export declare function sendError(reply: FastifyReply, code: ErrorCode, message: string, statusCode?: number, details?: unknown): FastifyReply<import("fastify").RouteGenericInterface, import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, unknown, import("fastify").FastifySchema, import("fastify").FastifyTypeProviderDefault, unknown>;
//# sourceMappingURL=index.d.ts.map