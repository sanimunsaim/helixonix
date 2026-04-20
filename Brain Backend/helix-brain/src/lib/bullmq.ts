/**
 * BullMQ Queue & Scheduler Setup
 * Manages all automated cron jobs for HELIX-BRAIN
 */

import { Queue, Worker, Job, QueueScheduler } from 'bullmq';
import { redisConnection } from './redis';
import { logger } from './logger';

// Job queues
export const moderationQueue = new Queue('auto-moderation', { connection: redisConnection });
export const overdueOrderQueue = new Queue('overdue-orders', { connection: redisConnection });
export const payoutQueue = new Queue('payout-processing', { connection: redisConnection });
export const fraudQueue = new Queue('fraud-sweep', { connection: redisConnection });
export const sellerEvalQueue = new Queue('seller-evaluation', { connection: redisConnection });
export const weeklyReportQueue = new Queue('weekly-report', { connection: redisConnection });
export const disputeQueue = new Queue('dispute-escalation', { connection: redisConnection });
export const recommendationQueue = new Queue('recommendation-refresh', { connection: redisConnection });
export const contentIndexQueue = new Queue('content-indexing', { connection: redisConnection });

// All queues registry
export const queues = {
  'auto-moderation': moderationQueue,
  'overdue-orders': overdueOrderQueue,
  'payout-processing': payoutQueue,
  'fraud-sweep': fraudQueue,
  'seller-evaluation': sellerEvalQueue,
  'weekly-report': weeklyReportQueue,
  'dispute-escalation': disputeQueue,
  'recommendation-refresh': recommendationQueue,
  'content-indexing': contentIndexQueue,
};

/**
 * Add a repeatable (cron) job to a queue
 */
export async function scheduleCronJob(
  queue: Queue,
  name: string,
  pattern: string,
  data?: Record<string, unknown>
): Promise<void> {
  // Remove existing job with same name to prevent duplicates
  const existingJobs = await queue.getRepeatableJobs();
  const existing = existingJobs.find((j) => j.name === name);
  if (existing) {
    await queue.removeRepeatableByKey(existing.key);
  }

  await queue.add(
    name,
    { ...data, idempotencyKey: `${name}-${Date.now()}` },
    {
      repeat: { pattern },
      jobId: name, // Idempotency key
      removeOnComplete: { age: 86400, count: 100 }, // Keep last 100 jobs for 24h
      removeOnFail: { age: 604800, count: 50 }, // Keep failed jobs for 7 days
    }
  );

  logger.info({ jobName: name, pattern }, 'Scheduled cron job');
}

/**
 * Create a worker with standardized error handling
 */
export function createWorker(
  queueName: string,
  processor: (job: Job) => Promise<unknown>,
  options?: { concurrency?: number; limiter?: { max: number; duration: number } }
): Worker {
  const worker = new Worker(
    queueName,
    async (job) => {
      const startTime = Date.now();
      logger.info({ jobId: job.id, name: job.name, queue: queueName }, 'Job started');

      try {
        const result = await processor(job);
        const duration = Date.now() - startTime;

        logger.info(
          { jobId: job.id, name: job.name, duration_ms: duration },
          'Job completed successfully'
        );

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(
          {
            jobId: job.id,
            name: job.name,
            duration_ms: duration,
            error: (error as Error).message,
            stack: (error as Error).stack,
          },
          'Job failed'
        );
        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: options?.concurrency || 1,
      ...options,
    }
  );

  // Worker event handlers
  worker.on('completed', (job) => {
    logger.debug({ jobId: job?.id, queue: queueName }, 'Worker confirmed job complete');
  });

  worker.on('failed', (job, error) => {
    logger.error(
      { jobId: job?.id, queue: queueName, error: error.message },
      'Worker confirmed job failed'
    );
  });

  return worker;
}

/**
 * Graceful shutdown of all queues and workers
 */
export async function closeQueues(): Promise<void> {
  for (const [name, queue] of Object.entries(queues)) {
    await queue.close();
    logger.info({ queue: name }, 'Queue closed');
  }
}

// Handle process exit
process.on('SIGINT', async () => {
  await closeQueues();
});

process.on('SIGTERM', async () => {
  await closeQueues();
});
