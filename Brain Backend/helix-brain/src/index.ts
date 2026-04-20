/**
 * HELIX-BRAIN — Main Entry Point
 * Initializes the Fastify API server, BullMQ cron jobs, and Redis event listeners
 */

import 'dotenv/config';
import { createServer } from './api/routes';
import { initializeEventRouter } from './events/eventRouter';
import { scheduleCronJob, createWorker } from './lib/bullmq';
import {
  moderationQueue,
  overdueOrderQueue,
  payoutQueue,
  fraudQueue,
  sellerEvalQueue,
  weeklyReportQueue,
  disputeQueue,
  recommendationQueue,
  contentIndexQueue,
} from './lib/bullmq';
import { logger } from './lib/logger';
import { isAnthropicAvailable, sendOfflineAlert } from './agent/brain';

// Import job processors
import { autoModerationJob } from './jobs/autoModeration';
import { overdueOrderMonitorJob } from './jobs/overdueOrders';
import { payoutProcessingJob } from './jobs/payoutProcessing';
import { fraudSweepJob } from './jobs/fraudSweep';
import { sellerLevelEvalJob } from './jobs/sellerLevelEval';
import { weeklyReportJob } from './jobs/weeklyReport';
import { disputeEscalationJob } from './jobs/disputeEscalation';
import { recommendationRefreshJob } from './jobs/recommendationRefresh';
import { contentIndexingJob } from './jobs/contentIndexing';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Initialize all scheduled cron jobs
 */
async function initializeCronJobs(): Promise<void> {
  logger.info('Initializing cron jobs');

  // JOB: auto_moderation — Every 5 minutes
  if (process.env.ENABLE_AUTO_MODERATION !== 'false') {
    await scheduleCronJob(moderationQueue, 'auto-moderation', '*/5 * * * *');
    createWorker('auto-moderation', autoModerationJob, { concurrency: 1 });
    logger.info('auto_moderation job scheduled (every 5 minutes)');
  }

  // JOB: overdue_order_monitor — Every 30 minutes
  if (process.env.ENABLE_FRAUD_SWEEP !== 'false') {
    await scheduleCronJob(overdueOrderQueue, 'overdue-order-monitor', '*/30 * * * *');
    createWorker('overdue-orders', overdueOrderMonitorJob, { concurrency: 1 });
    logger.info('overdue_order_monitor job scheduled (every 30 minutes)');
  }

  // JOB: payout_processing — Daily at 2:00 AM UTC
  if (process.env.ENABLE_PAYOUT_PROCESSING !== 'false') {
    await scheduleCronJob(payoutQueue, 'payout-processing', '0 2 * * *');
    createWorker('payout-processing', payoutProcessingJob, { concurrency: 1 });
    logger.info('payout_processing job scheduled (daily 2:00 AM UTC)');
  }

  // JOB: fraud_sweep — Every hour
  if (process.env.ENABLE_FRAUD_SWEEP !== 'false') {
    await scheduleCronJob(fraudQueue, 'fraud-sweep', '0 * * * *');
    createWorker('fraud-sweep', fraudSweepJob, { concurrency: 1 });
    logger.info('fraud_sweep job scheduled (every hour)');
  }

  // JOB: seller_level_evaluation — Weekly, Sunday at 3:00 AM UTC
  if (process.env.ENABLE_SELLER_EVALUATION !== 'false') {
    await scheduleCronJob(sellerEvalQueue, 'seller-level-eval', '0 3 * * 0');
    createWorker('seller-evaluation', sellerLevelEvalJob, { concurrency: 1 });
    logger.info('seller_level_evaluation job scheduled (Sunday 3:00 AM UTC)');
  }

  // JOB: weekly_platform_report — Every Monday at 7:00 AM UTC
  if (process.env.ENABLE_WEEKLY_REPORT !== 'false') {
    await scheduleCronJob(weeklyReportQueue, 'weekly-platform-report', '0 7 * * 1');
    createWorker('weekly-report', weeklyReportJob, { concurrency: 1 });
    logger.info('weekly_platform_report job scheduled (Monday 7:00 AM UTC)');
  }

  // JOB: dispute_escalation_monitor — Every 2 hours
  if (process.env.ENABLE_DISPUTE_MONITOR !== 'false') {
    await scheduleCronJob(disputeQueue, 'dispute-escalation', '0 */2 * * *');
    createWorker('dispute-escalation', disputeEscalationJob, { concurrency: 1 });
    logger.info('dispute_escalation_monitor job scheduled (every 2 hours)');
  }

  // JOB: recommendation_refresh — Daily at 4:00 AM UTC
  if (process.env.ENABLE_RECOMMENDATION_REFRESH !== 'false') {
    await scheduleCronJob(recommendationQueue, 'recommendation-refresh', '0 4 * * *');
    createWorker('recommendation-refresh', recommendationRefreshJob, { concurrency: 1 });
    logger.info('recommendation_refresh job scheduled (daily 4:00 AM UTC)');
  }

  // JOB: content_quality_indexing — Daily at 5:00 AM UTC
  await scheduleCronJob(contentIndexQueue, 'content-indexing', '0 5 * * *');
  createWorker('content-indexing', contentIndexingJob, { concurrency: 2 });
  logger.info('content_quality_indexing job scheduled (daily 5:00 AM UTC)');

  logger.info('All cron jobs initialized');
}

/**
 * Check Anthropic API availability on startup
 */
async function checkAIService(): Promise<void> {
  const available = await isAnthropicAvailable();
  if (!available) {
    logger.warn('Anthropic API is not available — HELIX-BRAIN running in fallback mode');
    await sendOfflineAlert('Anthropic API unavailable at startup');
  } else {
    logger.info('Anthropic API is available');
  }
}

/**
 * Main startup sequence
 */
async function main(): Promise<void> {
  logger.info('Starting HELIX-BRAIN...');

  // 1. Check AI service
  await checkAIService();

  // 2. Initialize cron jobs
  await initializeCronJobs();

  // 3. Initialize event router (Redis pub/sub)
  await initializeEventRouter();

  // 4. Create and start Fastify server
  const app = await createServer();

  await app.listen({ port: PORT, host: HOST });
  logger.info(`HELIX-BRAIN server listening on ${HOST}:${PORT}`);

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);

    await app.close();
    logger.info('Fastify server closed');

    process.exit(0);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.fatal({ error }, 'Uncaught exception');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'Unhandled rejection');
    process.exit(1);
  });
}

// Start the service
main().catch((error) => {
  logger.fatal({ error }, 'Failed to start HELIX-BRAIN');
  process.exit(1);
});
