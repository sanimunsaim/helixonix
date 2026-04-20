import 'dotenv/config';
/**
 * Core API — Entry Point
 * Bootstraps Fastify server, WebSocket server, BullMQ workers, and connects DB/Redis
 */

import { config } from './config.js';
import { buildApp } from './app.js';
import { createWebSocketServer } from './websocket/server.js';
import { pingDatabase } from './lib/db.js';
import { pingRedis } from './lib/redis.js';
import { pingTypesense } from './lib/typesense.js';

// Workers
import { startAiGenerationWorker } from './jobs/aiGeneration.js';
import { startEmailWorker } from './jobs/emailDispatch.js';
import { startSearchIndexingWorker } from './jobs/searchIndexing.js';
import { startThumbnailWorker, startWatermarkWorker } from './jobs/thumbnailGeneration.js';

async function bootstrap() {
  const app = await buildApp();

  try {
    // 1. Verify infrastructure connections
    app.log.info('Checking infrastructure...');
    await Promise.all([pingDatabase(), pingRedis(), pingTypesense()]);
    app.log.info('Infrastructure OK: Postgres, Redis, Typesense');

    // 2. Start BullMQ Workers
    app.log.info('Starting background workers...');
    const workers = [
      startAiGenerationWorker(),
      startEmailWorker(),
      startSearchIndexingWorker(),
      startThumbnailWorker(),
      startWatermarkWorker(),
    ];

    // Handle worker errors globally to prevent silent crashes
    workers.forEach((worker) => {
      worker.on('error', (err) => app.log.error({ err }, `[Worker ${worker.name}] Error`));
      worker.on('failed', (job, err) => app.log.error({ err, jobId: job?.id }, `[Worker ${worker.name}] Job failed`));
    });

    // 3. Start HTTP Server
    await app.listen({ port: config.PORT, host: config.HOST });

    // 4. Attach WebSocket Server
    const io = createWebSocketServer(app.server);
    app.log.info('WebSocket Server attached');

    // Graceful Shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
      process.on(signal, async () => {
        app.log.info(`Received ${signal}, shutting down gracefully...`);
        
        await Promise.allSettled(workers.map(w => w.close()));
        app.log.info('Workers stopped');
        
        await new Promise<void>((resolve) => {
          io.close(() => resolve());
        });
        app.log.info('WebSocket stopped');
        
        await app.close();
        process.exit(0);
      });
    }

  } catch (err) {
    app.log.error({ err }, 'Startup failed');
    process.exit(1);
  }
}

// Ensure unhandled rejections log and exit
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

bootstrap();
