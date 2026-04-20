/**
 * Routes — AI Generation
 * POST /ai/generate, GET /ai/generate/:jobId/stream, GET /ai/history
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { verifyJwt } from '../middleware/auth.js';
import { createGenerationJob, streamJobProgress, getUserGenerations } from '../services/ai.service.js';
import type { ToolType } from '../lib/replicate.js';

const generateSchema = z.object({
  tool_type: z.enum(['text_to_image', 'text_to_video', 'image_to_video', 'text_to_audio', 'upscale', 'remove_bg', 'image_to_image']),
  prompt: z.string().max(2000).optional(),
  parameters: z.record(z.unknown()).default({}),
});

export async function aiRoutes(app: FastifyInstance) {

  // ── Create generation job ────────────────────────────────────────────────

  app.post('/generate', { preHandler: [verifyJwt] }, async (request, reply) => {
    const body = generateSchema.parse(request.body);
    const result = await createGenerationJob({
      userId: request.user.userId,
      toolType: body.tool_type as ToolType,
      prompt: body.prompt,
      parameters: body.parameters,
    });
    return reply.status(202).send({ success: true, data: result });
  });

  // ── SSE stream for job progress ──────────────────────────────────────────

  app.get('/generate/:jobId/stream', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };

    // Auth via query param (EventSource can't send headers)
    const { token } = request.query as { token?: string };
    if (!token) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token required' } });
    }

    let userId: string;
    try {
      const payload = app.jwt.verify(token) as { userId: string };
      userId = payload.userId;
    } catch {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
    }

    await streamJobProgress({ jobId, userId, reply });
  });

  // ── Generation history ────────────────────────────────────────────────────

  app.get('/history', { preHandler: [verifyJwt] }, async (request, reply) => {
    const { page = '1' } = request.query as { page?: string };
    const generations = await getUserGenerations(request.user.userId, parseInt(page, 10), 20);
    return reply.send({ success: true, data: generations });
  });
}
