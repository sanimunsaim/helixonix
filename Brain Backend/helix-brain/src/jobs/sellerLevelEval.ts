/**
 * JOB: seller_level_evaluation
 * Schedule: Weekly, Sunday at 3:00 AM UTC
 * Evaluates and updates seller tier levels based on performance metrics
 */

import { Job } from 'bullmq';
import { logger } from '../lib/logger';
import { writeAudit } from '../lib/audit';
import { updateSellerLevel, sendNotification } from '../agent/tools';
import { apiGet } from '../lib/coreApiClient';

interface SellerStats {
  seller_id: string;
  user_id: string;
  seller_name: string;
  current_level: string;
  orders_completed: number;
  avg_rating: number;
  completion_rate: number;
  response_rate: number;
  stats_updated_this_week: boolean;
}

export async function sellerLevelEvalJob(job: Job): Promise<{
  evaluated: number;
  upgraded: number;
  downgraded: number;
  unchanged: number;
  errors: number;
}> {
  logger.info({ jobId: job.id }, 'Starting seller level evaluation');

  const stats = {
    evaluated: 0,
    upgraded: 0,
    downgraded: 0,
    unchanged: 0,
    errors: 0,
  };

  try {
    // Fetch all sellers with updated stats this week
    const sellers = await apiGet<SellerStats[]>('/internal/sellers/with-updated-stats', {
      days: 7,
    });

    stats.evaluated = sellers.length;
    logger.info({ count: sellers.length }, 'Found sellers to evaluate');

    // Process each seller
    for (const seller of sellers) {
      try {
        const result = await updateSellerLevel({ seller_id: seller.seller_id });

        if (result.new_level !== result.previous_level) {
          if (
            levelRank(result.new_level) > levelRank(result.previous_level)
          ) {
            // Upgraded
            stats.upgraded++;

            // Notify seller of upgrade
            await sendNotification({
              user_ids: [seller.user_id],
              type: 'success',
              title: 'Seller Level Upgraded!',
              message: `Congratulations! Your seller level has been upgraded from ${result.previous_level} to ${result.new_level}. You now have access to more benefits and reduced commission rates.`,
              action_url: '/seller/dashboard',
            });

            logger.info(
              { sellerId: seller.seller_id, from: result.previous_level, to: result.new_level },
              'Seller upgraded'
            );
          } else {
            // Downgraded
            stats.downgraded++;

            // Notify seller of downgrade
            await sendNotification({
              user_ids: [seller.user_id],
              type: 'warning',
              title: 'Seller Level Update',
              message: `Your seller level has been adjusted from ${result.previous_level} to ${result.new_level}. To regain your previous level, focus on: maintaining high ratings, completing orders on time, and responding quickly to messages.`,
              action_url: '/seller/dashboard',
            });

            logger.info(
              { sellerId: seller.seller_id, from: result.previous_level, to: result.new_level },
              'Seller downgraded'
            );
          }
        } else {
          stats.unchanged++;
        }
      } catch (error) {
        stats.errors++;
        logger.error({ error, sellerId: seller.seller_id }, 'Error evaluating seller');
      }
    }

    // Audit log
    writeAudit({
      action: 'seller_level_evaluation_run',
      actor: 'helix-brain',
      target: 'sellers',
      result: `evaluated:${stats.evaluated}, upgraded:${stats.upgraded}, downgraded:${stats.downgraded}, unchanged:${stats.unchanged}`,
      metadata: stats,
    });

    logger.info({ ...stats }, 'Seller level evaluation completed');

    return stats;
  } catch (error) {
    logger.error({ error }, 'Seller level evaluation job failed');
    throw error;
  }
}

/**
 * Convert level name to numeric rank for comparison
 */
function levelRank(level: string): number {
  const ranks: Record<string, number> = {
    new: 1,
    rising: 2,
    pro: 3,
    top_rated: 4,
    elite: 5,
  };
  return ranks[level.toLowerCase()] || 0;
}
