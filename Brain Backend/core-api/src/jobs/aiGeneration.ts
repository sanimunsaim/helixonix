/**
 * BullMQ Worker — AI Generation
 * Processes AI generation jobs: calls Replicate/ElevenLabs, uploads to R2, notifies via Redis
 */

import { Worker, type Job } from 'bullmq';
import { bullmqConnection } from '../lib/redis.js';
import { replicate, pollPrediction, DEFAULT_MODEL_CONFIG, type ToolType } from '../lib/replicate.js';
import { textToSpeech } from '../lib/elevenlabs.js';
import { uploadBuffer, R2Keys, getPublicUrl } from '../lib/r2.js';
import { publishAiJobProgress, notifyUser } from '../lib/events.js';
import { db } from '../lib/db.js';
import { aiGenerations } from '../schemas/db/index.js';
import { eq } from 'drizzle-orm';
import { refundCredits } from '../services/ai.service.js';

interface AiJobData {
  jobId: string;
  userId: string;
  toolType: ToolType;
  parameters: Record<string, unknown>;
  creditCost: number;
}

async function processAiGeneration(job: Job<AiJobData>): Promise<void> {
  const { jobId, userId, toolType, parameters, creditCost } = job.data;
  const startTime = Date.now();

  await publishAiJobProgress(jobId, { progress: 5, status: 'processing' });
  await db.update(aiGenerations).set({ status: 'processing' }).where(eq(aiGenerations.id, jobId));

  try {
    let outputUrls: string[] = [];

    if (toolType === 'text_to_audio') {
      // ElevenLabs path
      const audioBuffer = await textToSpeech({
        text: (parameters.text as string) ?? (parameters.prompt as string) ?? '',
        voiceId: parameters.voice_id as string | undefined,
      });
      await publishAiJobProgress(jobId, { progress: 70, status: 'processing' });

      const key = R2Keys.aiOutput(userId, jobId, 0, 'mp3');
      await uploadBuffer({ key, buffer: audioBuffer, contentType: 'audio/mpeg' });
      outputUrls = [getPublicUrl(key)];
    } else {
      // Replicate path
      const modelConfig = DEFAULT_MODEL_CONFIG[toolType];
      const prediction = await replicate.predictions.create({
        version: modelConfig.model,
        input: parameters,
      } as any);

      let lastProgress = 10;
      const result = await pollPrediction(prediction.id, async (progress) => {
        if (progress > lastProgress) {
          lastProgress = progress;
          await publishAiJobProgress(jobId, { progress, status: 'processing' });
        }
      });

      if (result.status === 'failed') {
        throw new Error(result.error ?? 'Replicate prediction failed');
      }

      await publishAiJobProgress(jobId, { progress: 85, status: 'processing' });

      // Download outputs and upload to R2
      const outputs = Array.isArray(result.output) ? result.output : [result.output];
      for (let i = 0; i < outputs.length; i++) {
        const url = outputs[i] as string;
        if (!url) continue;
        const response = await fetch(url);
        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') ?? 'application/octet-stream';
        const ext = contentType.includes('video') ? 'mp4' : contentType.includes('audio') ? 'mp3' : 'png';
        const key = R2Keys.aiOutput(userId, jobId, i, ext);
        await uploadBuffer({ key, buffer, contentType });
        outputUrls.push(getPublicUrl(key));
      }
    }

    const processingTimeMs = Date.now() - startTime;

    // Update DB
    await db.update(aiGenerations).set({
      status: 'completed',
      outputUrls,
      processingTimeMs,
      completedAt: new Date(),
    }).where(eq(aiGenerations.id, jobId));

    // Publish completion
    await publishAiJobProgress(jobId, { progress: 100, status: 'completed', output_urls: outputUrls, credits_used: creditCost });

    // WebSocket backup (if SSE dropped)
    await notifyUser(userId, 'generation:complete', { jobId, outputUrls, creditsUsed: creditCost });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';

    await db.update(aiGenerations).set({ status: 'failed', errorMessage }).where(eq(aiGenerations.id, jobId));
    await publishAiJobProgress(jobId, { progress: 0, status: 'failed', error_message: errorMessage });
    await notifyUser(userId, 'generation:failed', { jobId, errorMessage });

    // Refund credits
    await refundCredits({ userId, jobId, creditCost });

    throw err; // Re-throw for BullMQ retry
  }
}

export function startAiGenerationWorker() {
  return new Worker<AiJobData>('ai-generation', processAiGeneration, {
    connection: bullmqConnection,
    concurrency: 5,
    limiter: { max: 10, duration: 60000 },
  });
}
