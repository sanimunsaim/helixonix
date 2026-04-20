/**
 * AI Service — job creation, credit management, SSE streaming
 */
import { type ToolType } from '../lib/replicate.js';
import type { FastifyReply } from 'fastify';
export declare function createGenerationJob(params: {
    userId: string;
    toolType: ToolType;
    prompt?: string;
    parameters: Record<string, unknown>;
}): Promise<{
    jobId: `${string}-${string}-${string}-${string}-${string}`;
    creditsDeducted: number;
    estimatedSeconds: number;
    status: string;
}>;
export declare function streamJobProgress(params: {
    jobId: string;
    userId: string;
    reply: FastifyReply;
}): Promise<void>;
export declare function refundCredits(params: {
    userId: string;
    jobId: string;
    creditCost: number;
}): Promise<void>;
export declare function getUserGenerations(userId: string, page?: number, perPage?: number): Promise<{
    id: string;
    userId: string;
    toolType: string;
    prompt: string | null;
    parameters: unknown;
    modelVersion: string | null;
    replicatePredictionId: string | null;
    status: "completed" | "cancelled" | "failed" | "processing" | "queued";
    outputUrls: string[] | null;
    outputKeys: string[] | null;
    creditsUsed: number;
    processingTimeMs: number | null;
    errorMessage: string | null;
    isPublished: string | null;
    publishedAssetId: string | null;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
}[]>;
//# sourceMappingURL=ai.service.d.ts.map