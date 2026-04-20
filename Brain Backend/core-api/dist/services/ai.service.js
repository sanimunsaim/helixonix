/**
 * AI Service — job creation, credit management, SSE streaming
 */
import { eq, desc } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { aiGenerations, creditTransactions } from '../schemas/db/index.js';
import { deductCredits, addCredits, getCredits, subscriber } from '../lib/redis.js';
import { publishEvent, publishAiJobProgress } from '../lib/events.js';
import { AppError, ErrorCodes } from '../types/index.js';
import { DEFAULT_MODEL_CONFIG } from '../lib/replicate.js';
import { Queue } from 'bullmq';
import { bullmqConnection } from '../lib/redis.js';
import crypto from 'node:crypto';
const aiQueue = new Queue('ai-generation', { connection: bullmqConnection });
// ── Generate ──────────────────────────────────────────────────────────────────
export async function createGenerationJob(params) {
    const modelConfig = DEFAULT_MODEL_CONFIG[params.toolType];
    if (!modelConfig) {
        throw new AppError(ErrorCodes.VALIDATION_ERROR, `Unknown tool type: ${params.toolType}`, 422);
    }
    if (!modelConfig.enabled) {
        throw new AppError(ErrorCodes.VALIDATION_ERROR, `Tool ${params.toolType} is currently disabled`, 422);
    }
    // Check credits (Redis first, fast path)
    const currentCredits = await getCredits(params.userId);
    if (currentCredits < modelConfig.creditCost) {
        throw new AppError(ErrorCodes.INSUFFICIENT_CREDITS, `Not enough AI credits. Need ${modelConfig.creditCost}, have ${currentCredits}`, 402);
    }
    // Deduct credits optimistically (Redis) — refunded on failure
    await deductCredits(params.userId, modelConfig.creditCost);
    const jobId = crypto.randomUUID();
    // Create DB record
    await db.insert(aiGenerations).values({
        id: jobId,
        userId: params.userId,
        toolType: params.toolType,
        prompt: params.prompt,
        parameters: params.parameters,
        modelVersion: modelConfig.model,
        status: 'queued',
        creditsUsed: modelConfig.creditCost,
    });
    // Log credit deduction
    const newBalance = await getCredits(params.userId);
    await db.insert(creditTransactions).values({
        userId: params.userId,
        type: 'deduct',
        amount: -modelConfig.creditCost,
        balanceAfter: newBalance,
        reason: `AI generation: ${params.toolType}`,
        referenceId: jobId,
        referenceType: 'ai_generation',
    });
    // Enqueue BullMQ job
    await aiQueue.add('generate', {
        jobId,
        userId: params.userId,
        toolType: params.toolType,
        parameters: params.parameters,
        creditCost: modelConfig.creditCost,
    }, {
        jobId: `ai-${jobId}`,
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
    });
    await publishAiJobProgress(jobId, { progress: 0, status: 'queued' });
    await publishEvent('ai.job.queued', { jobId, userId: params.userId, toolType: params.toolType });
    return {
        jobId,
        creditsDeducted: modelConfig.creditCost,
        estimatedSeconds: modelConfig.estimatedSeconds,
        status: 'queued',
    };
}
// ── SSE Streaming ─────────────────────────────────────────────────────────────
export async function streamJobProgress(params) {
    // Verify ownership
    const job = await db.query.aiGenerations.findFirst({ where: eq(aiGenerations.id, params.jobId) });
    if (!job)
        throw new AppError(ErrorCodes.NOT_FOUND, 'Job not found', 404);
    if (job.userId !== params.userId)
        throw new AppError(ErrorCodes.FORBIDDEN, 'Access denied', 403);
    // If already complete, return immediately
    if (job.status === 'completed') {
        params.reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        });
        params.reply.raw.write(`data: ${JSON.stringify({ progress: 100, status: 'completed', output_urls: job.outputUrls })}\n\n`);
        params.reply.raw.write('data: {"done": true}\n\n');
        params.reply.raw.end();
        return;
    }
    params.reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
    });
    const channel = `helixonix:ai:job:${params.jobId}`;
    const subClient = subscriber.duplicate();
    let heartbeatInterval;
    await subClient.subscribe(channel);
    // Heartbeat every 15s
    heartbeatInterval = setInterval(() => {
        params.reply.raw.write(`data: {"heartbeat": true}\n\n`);
    }, 15000);
    subClient.on('message', (_ch, message) => {
        params.reply.raw.write(`data: ${message}\n\n`);
        try {
            const parsed = JSON.parse(message);
            if (parsed.status === 'completed' || parsed.status === 'failed') {
                clearInterval(heartbeatInterval);
                subClient.unsubscribe(channel);
                subClient.quit();
                params.reply.raw.write('data: {"done": true}\n\n');
                params.reply.raw.end();
            }
        }
        catch { /* ignore */ }
    });
    // Cleanup on client disconnect
    params.reply.raw.on('close', () => {
        clearInterval(heartbeatInterval);
        subClient.unsubscribe(channel).catch(() => { });
        subClient.quit().catch(() => { });
    });
}
// ── Credit Refund (called by worker on failure) ────────────────────────────────
export async function refundCredits(params) {
    await addCredits(params.userId, params.creditCost);
    const newBalance = await getCredits(params.userId);
    await db.insert(creditTransactions).values({
        userId: params.userId,
        type: 'refund',
        amount: params.creditCost,
        balanceAfter: newBalance,
        reason: 'AI generation failed — credits refunded',
        referenceId: params.jobId,
        referenceType: 'ai_generation',
    });
}
// ── History ───────────────────────────────────────────────────────────────────
export async function getUserGenerations(userId, page = 1, perPage = 20) {
    const offset = (page - 1) * perPage;
    return db.select().from(aiGenerations)
        .where(eq(aiGenerations.userId, userId))
        .orderBy(desc(aiGenerations.createdAt))
        .limit(perPage)
        .offset(offset);
}
//# sourceMappingURL=ai.service.js.map