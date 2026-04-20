/**
 * JOB: auto_moderation
 * Schedule: Every 5 minutes
 * Fetches pending moderation queue and auto-approves or flags assets based on AI scores
 */

import { Job } from 'bullmq';
import { logger } from '../lib/logger';
import { writeAudit } from '../lib/audit';
import {
  getModerationQueue,
  approveAsset,
  flagAssetForReview,
} from '../agent/tools';
import type { ModerationAsset } from '../types/tools';

// Quality thresholds for auto-approval
const AUTO_APPROVE_THRESHOLDS = {
  nsfw_max: 0.15,
  copyright_max: 0.10,
  quality_min: 0.65,
};

export async function autoModerationJob(job: Job): Promise<{
  processed: number;
  approved: number;
  flagged: number;
  errors: number;
}> {
  logger.info({ jobId: job.id }, 'Starting auto-moderation job');

  const stats = { processed: 0, approved: 0, flagged: 0, errors: 0 };

  try {
    // 1. Fetch moderation queue
    const queue = await getModerationQueue({
      limit: 100,
      type: 'all',
      oldest_first: true,
    });

    logger.info({ count: queue.length }, 'Fetched moderation queue');

    // 2. Process each asset with concurrency limit of 10
    const batchSize = 10;
    for (let i = 0; i < queue.length; i += batchSize) {
      const batch = queue.slice(i, i + batchSize);
      await Promise.all(batch.map((asset) => processAsset(asset, stats)));
    }

    // 3. Log summary to audit trail
    writeAudit({
      action: 'auto_moderation_run',
      actor: 'helix-brain',
      target: 'moderation_queue',
      result: `processed:${stats.processed}, approved:${stats.approved}, flagged:${stats.flagged}, errors:${stats.errors}`,
      metadata: { queue_size: queue.length, ...stats },
    });

    logger.info({ ...stats }, 'Auto-moderation job completed');

    return stats;
  } catch (error) {
    logger.error({ error }, 'Auto-moderation job failed');
    throw error;
  }
}

/**
 * Process a single moderation asset
 */
async function processAsset(
  asset: ModerationAsset,
  stats: { processed: number; approved: number; flagged: number; errors: number }
): Promise<void> {
  stats.processed++;

  try {
    const { nsfw_score, copyright_score, quality_score, metadata_complete } = asset;

    // Check auto-approve criteria
    const canAutoApprove =
      nsfw_score < AUTO_APPROVE_THRESHOLDS.nsfw_max &&
      copyright_score < AUTO_APPROVE_THRESHOLDS.copyright_max &&
      quality_score > AUTO_APPROVE_THRESHOLDS.quality_min &&
      metadata_complete;

    if (canAutoApprove) {
      // Auto-approve
      await approveAsset({
        asset_id: asset.asset_id,
        reason: `Auto-approved: nsfw=${nsfw_score.toFixed(3)}, copyright=${copyright_score.toFixed(3)}, quality=${quality_score.toFixed(3)}, metadata_complete=${metadata_complete}`,
        featured: false,
      });
      stats.approved++;

      logger.debug({ assetId: asset.asset_id }, 'Auto-approved asset');
    } else {
      // Flag for human review with detailed reason
      const reasons: string[] = [];
      if (nsfw_score >= AUTO_APPROVE_THRESHOLDS.nsfw_max)
        reasons.push(`NSFW score ${nsfw_score.toFixed(3)} exceeds threshold ${AUTO_APPROVE_THRESHOLDS.nsfw_max}`);
      if (copyright_score >= AUTO_APPROVE_THRESHOLDS.copyright_max)
        reasons.push(`Copyright score ${copyright_score.toFixed(3)} exceeds threshold ${AUTO_APPROVE_THRESHOLDS.copyright_max}`);
      if (quality_score <= AUTO_APPROVE_THRESHOLDS.quality_min)
        reasons.push(`Quality score ${quality_score.toFixed(3)} below threshold ${AUTO_APPROVE_THRESHOLDS.quality_min}`);
      if (!metadata_complete) reasons.push('Metadata incomplete');

      const priority = determinePriority(asset);

      await flagAssetForReview({
        asset_id: asset.asset_id,
        flag_reason: `Auto-moderation flag: ${reasons.join('; ')}. Seller: ${asset.seller_name} (${asset.seller_level}). Submitted: ${asset.submitted_at}`,
        priority,
      });
      stats.flagged++;

      logger.debug({ assetId: asset.asset_id, reasons }, 'Flagged asset for review');
    }
  } catch (error) {
    stats.errors++;
    logger.error({ error, assetId: asset.asset_id }, 'Error processing moderation asset');
    // Continue processing other assets — one failure shouldn't stop the batch
  }
}

/**
 * Determine priority based on asset characteristics
 */
function determinePriority(asset: ModerationAsset): 'low' | 'medium' | 'high' | 'urgent' {
  // New sellers get higher priority (more scrutiny needed)
  if (asset.seller_level === 'new') return 'high';

  // High NSFW or copyright scores need urgent attention
  if (asset.nsfw_score > 0.5 || asset.copyright_score > 0.5) return 'urgent';

  // Borderline scores
  if (asset.quality_score < 0.4) return 'high';
  if (asset.quality_score < 0.6) return 'medium';

  return 'low';
}
