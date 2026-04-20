/**
 * Auth Service — register, login, token management
 */
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
export declare function registerUser(params: RegisterParams, fastify: FastifyInstance): Promise<TokenPair>;
/**
 * Login with email + password
 */
export declare function loginUser(params: LoginParams, fastify: FastifyInstance): Promise<TokenPair & {
    user: any;
}>;
/**
 * Refresh access token using refresh token
 */
export declare function refreshTokens(refreshToken: string, fastify: FastifyInstance): Promise<TokenPair>;
/**
 * Logout — invalidate session in Redis
 */
export declare function logoutUser(userId: string): Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map