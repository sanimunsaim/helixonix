/**
 * JOB: content_quality_indexing
 * Schedule: Daily at 5:00 AM UTC
 * Generates semantic embeddings for newly approved assets and updates search indexes
 * This is async and never blocks main flows
 */

import { Job } from 'bullmq';
import { logger } from '../lib/logger';
import { writeAudit } from '../lib/audit';
import { callClaudeReasoning } from '../lib/anthropicClient';
import { apiGet, apiPost } from '../lib/coreApiClient';

interface NewAsset {
  asset_id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  type: string;
  seller_id: string;
  approved_at: string;
}

export async function contentIndexingJob(job: Job): Promise<{
  processed: number;
  embeddings_generated: number;
  index_updated: number;
}> {
  logger.info({ jobId: job.id }, 'Starting content quality indexing');

  const stats = {
    processed: 0,
    embeddings_generated: 0,
    index_updated: 0,
  };

  try {
    // Get newly approved assets from last 24h
    const newAssets = await apiGet<NewAsset[]>('/internal/assets/newly-approved', {
      hours: 24,
    });

    stats.processed = newAssets.length;
    logger.info({ count: newAssets.length }, 'Found newly approved assets to index');

    // Process in batches — this is intentionally low priority and non-blocking
    const batchSize = 20;
    for (let i = 0; i < newAssets.length; i += batchSize) {
      const batch = newAssets.slice(i, i + batchSize);
      await Promise.all(
        batch.map((asset) => processAssetIndexing(asset, stats))
      );
    }

    // Update Typesense index
    try {
      await apiPost('/internal/search/reindex', {
        asset_ids: newAssets.map((a) => a.asset_id),
      });
      stats.index_updated = newAssets.length;
    } catch (error) {
      logger.error({ error }, 'Failed to update Typesense index');
    }

    // Audit log
    writeAudit({
      action: 'content_indexing_run',
      actor: 'helix-brain',
      target: 'search_index',
      result: `processed:${stats.processed}, embeddings:${stats.embeddings_generated}, indexed:${stats.index_updated}`,
      metadata: stats,
    });

    logger.info({ ...stats }, 'Content indexing completed');

    return stats;
  } catch (error) {
    logger.error({ error }, 'Content indexing job failed');
    // Don't throw — this is a background job that should never block
    return stats;
  }
}

/**
 * Generate semantic embedding for a single asset
 */
async function processAssetIndexing(
  asset: NewAsset,
  stats: { embeddings_generated: number }
): Promise<void> {
  try {
    // Generate embedding via Claude (title + description → semantic vector)
    const embeddingText = await callClaudeReasoning({
      systemPrompt:
        'You are a semantic embedding generator. Given an asset title and description, produce a concise semantic representation (1-2 sentences) that captures the key concepts, style, and use cases. This will be converted to a vector embedding.',
      userMessage: `Title: ${asset.title}\nDescription: ${asset.description}\nTags: ${asset.tags.join(', ')}\nCategory: ${asset.category}`,
      maxTokens: 150,
      temperature: 0.1,
    });

    // Store in pgvector (via Core API)
    await apiPost('/internal/search/embeddings', {
      asset_id: asset.asset_id,
      embedding_text: embeddingText,
      title: asset.title,
      description: asset.description,
      tags: asset.tags,
      category: asset.category,
      type: asset.type,
      seller_id: asset.seller_id,
    });

    stats.embeddings_generated++;
  } catch (error) {
    logger.error(
      { error, assetId: asset.asset_id },
      'Error generating embedding for asset'
    );
    // Continue — one asset failure shouldn't stop the batch
  }
}
