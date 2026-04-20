/**
 * EVENT: asset.quality_score_below_threshold
 * Handler:
 *   1. Do NOT auto-reject (conservative approach)
 *   2. Flag for manual review with quality details
 *   3. Queue moderator notification
 */

import { logger } from '../../lib/logger';
import { writeAudit } from '../../lib/audit';
import { flagAssetForReview, sendNotification } from '../../agent/tools';
import type { AssetQualityBelowThresholdPayload } from '../../types/events';

export async function handleAssetQualityBelowThreshold(
  payload: Record<string, unknown>
): Promise<void> {
  const asset = payload as unknown as AssetQualityBelowThresholdPayload;
  logger.info(
    { assetId: asset.asset_id, qualityScore: asset.quality_score },
    'Handling asset.quality_score_below_threshold event'
  );

  // 1 & 2. Flag for manual review (do NOT auto-reject)
  try {
    await flagAssetForReview({
      asset_id: asset.asset_id,
      flag_reason: `Quality score below threshold: ${asset.quality_score} (threshold: ${asset.threshold}). Asset type: ${asset.asset_type}. Details: ${JSON.stringify(asset.details)}. AI recommends manual review — asset NOT auto-rejected per conservative policy.`,
      priority: 'medium',
    });

    logger.debug({ assetId: asset.asset_id }, 'Asset flagged for quality review');
  } catch (error) {
    logger.error(
      { error, assetId: asset.asset_id },
      'Failed to flag asset for quality review'
    );
    throw error;
  }

  // 3. Notify moderators
  try {
    await sendNotification({
      user_ids: ['all_admins'],
      type: 'warning',
      title: 'Asset Quality Review Needed',
      message: `Asset #${asset.asset_id} from seller ${asset.seller_id} has a quality score of ${asset.quality_score} (below ${asset.threshold} threshold). Flagged for manual review. Auto-reject was NOT applied per conservative policy.`,
      action_url: `/admin/moderation/review/${asset.asset_id}`,
    });
  } catch (error) {
    logger.error({ error, assetId: asset.asset_id }, 'Failed to notify moderators');
  }

  // Audit log
  writeAudit({
    action: 'asset_quality_flagged',
    actor: 'helix-brain',
    target: `asset:${asset.asset_id}`,
    result: 'flagged_for_manual_review_not_rejected',
    metadata: {
      asset_id: asset.asset_id,
      seller_id: asset.seller_id,
      quality_score: asset.quality_score,
      threshold: asset.threshold,
      asset_type: asset.asset_type,
      details: asset.details,
    },
  });
}
