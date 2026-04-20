/**
 * JOB: recommendation_refresh
 * Schedule: Daily at 4:00 AM UTC
 * Recomputes trending scores and personalized recommendation feeds
 */

import { Job } from 'bullmq';
import { logger } from '../lib/logger';
import { writeAudit } from '../lib/audit';
import { redisConnection } from '../lib/redis';
import { apiGet, apiPost } from '../lib/coreApiClient';

interface AssetEngagement {
  asset_id: string;
  clicks_7d: number;
  saves_7d: number;
  purchases_7d: number;
  category: string;
  type: string;
}

interface BuyerProfile {
  user_id: string;
  purchase_history: string[];
  categories_viewed: string[];
  similar_user_ids: string[];
}

export async function recommendationRefreshJob(job: Job): Promise<{
  assets_indexed: number;
  buyer_feeds_updated: number;
}> {
  logger.info({ jobId: job.id }, 'Starting recommendation refresh');

  const stats = {
    assets_indexed: 0,
    buyer_feeds_updated: 0,
  };

  try {
    // 1. Recompute trending scores for all assets
    const engagements = await apiGet<AssetEngagement[]>('/internal/analytics/asset-engagement', {
      days: 7,
    });

    const trendingAssets: Array<{ asset_id: string; score: number }> = [];
    const trendingGigs: Array<{ asset_id: string; score: number }> = [];

    for (const asset of engagements) {
      // Trending score = weighted combination of CTR, saves, purchases
      const score =
        asset.clicks_7d * 0.3 + asset.saves_7d * 2.0 + asset.purchases_7d * 5.0;

      if (asset.type === 'gig') {
        trendingGigs.push({ asset_id: asset.asset_id, score });
      } else {
        trendingAssets.push({ asset_id: asset.asset_id, score });
      }
    }

    // Sort by score descending and keep top 1000
    trendingAssets.sort((a, b) => b.score - a.score);
    trendingGigs.sort((a, b) => b.score - a.score);

    const topAssets = trendingAssets.slice(0, 1000);
    const topGigs = trendingGigs.slice(0, 1000);

    // 2. Update Redis cache
    const pipeline = redisConnection.pipeline();

    // Store trending assets
    pipeline.del('trending:assets');
    if (topAssets.length > 0) {
      pipeline.zadd(
        'trending:assets',
        ...topAssets.flatMap((a) => [a.score, a.asset_id])
      );
    }
    pipeline.expire('trending:assets', 86400); // 24h TTL

    // Store trending gigs
    pipeline.del('trending:gigs');
    if (topGigs.length > 0) {
      pipeline.zadd(
        'trending:gigs',
        ...topGigs.flatMap((g) => [g.score, g.asset_id])
      );
    }
    pipeline.expire('trending:gigs', 86400);

    await pipeline.exec();
    stats.assets_indexed = topAssets.length + topGigs.length;

    // 3. Update personalized feeds for top 1000 buyers
    const topBuyers = await apiGet<BuyerProfile[]>('/internal/buyers/top', {
      limit: 1000,
    });

    // Process in batches of 50 to avoid overwhelming the API
    const batchSize = 50;
    for (let i = 0; i < topBuyers.length; i += batchSize) {
      const batch = topBuyers.slice(i, i + batchSize);
      await Promise.all(
        batch.map((buyer) => updateBuyerRecommendations(buyer))
      );
      stats.buyer_feeds_updated += batch.length;
    }

    // Audit log
    writeAudit({
      action: 'recommendation_refresh_run',
      actor: 'helix-brain',
      target: 'recommendations',
      result: `assets_indexed:${stats.assets_indexed}, buyer_feeds:${stats.buyer_feeds_updated}`,
      metadata: stats,
    });

    logger.info({ ...stats }, 'Recommendation refresh completed');

    return stats;
  } catch (error) {
    logger.error({ error }, 'Recommendation refresh job failed');
    throw error;
  }
}

/**
 * Update personalized recommendations for a single buyer
 */
async function updateBuyerRecommendations(buyer: BuyerProfile): Promise<void> {
  try {
    // Get recommendations from Core API
    const recommendations = await apiPost<string[]>('/internal/recommendations/personalized', {
      user_id: buyer.user_id,
      purchase_history: buyer.purchase_history,
      categories_viewed: buyer.categories_viewed,
      similar_user_ids: buyer.similar_user_ids,
      limit: 100,
    });

    // Store in Redis with 24h TTL
    const key = `user:${buyer.user_id}:recommendations`;
    const pipeline = redisConnection.pipeline();
    pipeline.del(key);
    if (recommendations.length > 0) {
      pipeline.rpush(key, ...recommendations);
    }
    pipeline.expire(key, 86400);
    await pipeline.exec();
  } catch (error) {
    logger.error(
      { error, userId: buyer.user_id },
      'Error updating buyer recommendations'
    );
    // Continue — one buyer failure shouldn't stop the batch
  }
}
