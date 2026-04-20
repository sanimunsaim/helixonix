/**
 * EVENT: order.completed
 * Handler:
 *   1. Release escrow
 *   2. Credit seller earnings
 *   3. Update seller stats
 *   4. Check seller level upgrade
 *   5. Trigger recommendation refresh for buyer
 */

import { logger } from '../../lib/logger';
import { writeAudit } from '../../lib/audit';
import { updateSellerLevel } from '../../agent/tools';
import { apiPost, apiGet } from '../../lib/coreApiClient';
import { recommendationQueue } from '../../lib/bullmq';
import type { OrderCompletedPayload } from '../../types/events';

export async function handleOrderCompleted(
  payload: Record<string, unknown>
): Promise<void> {
  const order = payload as unknown as OrderCompletedPayload;
  logger.info({ orderId: order.order_id }, 'Handling order.completed event');

  // 1. Release escrow
  try {
    await apiPost(`/internal/orders/${order.order_id}/release-escrow`, {
      released_at: new Date().toISOString(),
    });
    logger.debug({ orderId: order.order_id }, 'Escrow released');
  } catch (error) {
    logger.error({ error, orderId: order.order_id }, 'Failed to release escrow');
    throw error; // Re-throw to trigger retry
  }

  // 2. Credit seller earnings
  try {
    await apiPost(`/internal/sellers/${order.seller_id}/credit-earnings`, {
      order_id: order.order_id,
      amount: order.total_amount - order.commission_amount,
      commission_amount: order.commission_amount,
      credited_at: new Date().toISOString(),
    });
    logger.debug({ sellerId: order.seller_id }, 'Seller earnings credited');
  } catch (error) {
    logger.error({ error, orderId: order.order_id }, 'Failed to credit seller earnings');
    throw error;
  }

  // 3. Update seller stats (total_orders_completed++, update avg_rating)
  try {
    await apiPost(`/internal/sellers/${order.seller_id}/update-stats`, {
      event: 'order_completed',
      order_id: order.order_id,
      completed_at: order.completed_at,
    });
  } catch (error) {
    logger.error({ error, sellerId: order.seller_id }, 'Failed to update seller stats');
    // Don't throw — this is non-critical
  }

  // 4. Check if seller qualifies for level upgrade
  try {
    const levelResult = await updateSellerLevel({ seller_id: order.seller_id });
    if (levelResult.new_level !== levelResult.previous_level) {
      logger.info(
        {
          sellerId: order.seller_id,
          from: levelResult.previous_level,
          to: levelResult.new_level,
        },
        'Seller level changed after order completion'
      );
    }
  } catch (error) {
    logger.error(
      { error, sellerId: order.seller_id },
      'Failed to evaluate seller level'
    );
    // Don't throw — this is non-critical
  }

  // 5. Trigger recommendation refresh for buyer (queue low-priority job)
  try {
    await recommendationQueue.add(
      'refresh-buyer-feed',
      {
        user_id: order.buyer_id,
        trigger_event: 'order.completed',
        order_id: order.order_id,
      },
      {
        priority: 5, // Low priority
        delay: 5000, // Small delay to batch multiple rapid events
      }
    );
    logger.debug({ buyerId: order.buyer_id }, 'Queued recommendation refresh');
  } catch (error) {
    logger.error(
      { error, buyerId: order.buyer_id },
      'Failed to queue recommendation refresh'
    );
    // Don't throw — this is non-critical
  }

  // Audit log
  writeAudit({
    action: 'order_completed_handled',
    actor: 'helix-brain',
    target: `order:${order.order_id}`,
    result: 'escrow_released_earnings_credited',
    metadata: {
      order_id: order.order_id,
      buyer_id: order.buyer_id,
      seller_id: order.seller_id,
      amount: order.total_amount,
    },
  });
}
