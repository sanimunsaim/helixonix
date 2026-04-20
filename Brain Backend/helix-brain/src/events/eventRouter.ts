/**
 * Redis Pub/Sub Event Router
 * Dispatches incoming events to the appropriate handler
 * All handlers are wrapped in try/catch — one bad event never kills the listener
 */

import { subscribeToEvents } from '../lib/redis';
import { logger } from '../lib/logger';
import { handleOrderCompleted } from './handlers/orderCompleted';
import { handleUserRegistered } from './handlers/userRegistered';
import { handleSellerOnboardingComplete } from './handlers/sellerOnboarding';
import { handleDisputeOpened } from './handlers/disputeOpened';
import { handlePaymentFailed } from './handlers/paymentFailed';
import { handleAssetQualityBelowThreshold } from './handlers/assetQuality';
import { handleSellerFraudSignal } from './handlers/sellerFraudSignal';

/**
 * Event handler registry — maps event types to handler functions
 */
const eventHandlers: Record<
  string,
  (payload: Record<string, unknown>) => Promise<void>
> = {
  'order.completed': handleOrderCompleted,
  'user.registered': handleUserRegistered,
  'seller.onboarding_complete': handleSellerOnboardingComplete,
  'dispute.opened': handleDisputeOpened,
  'payment.failed': handlePaymentFailed,
  'asset.quality_score_below_threshold': handleAssetQualityBelowThreshold,
  'seller.fraud_signal_detected': handleSellerFraudSignal,
};

/**
 * Initialize the event router and start listening
 */
export async function initializeEventRouter(): Promise<void> {
  logger.info('Initializing event router');

  await subscribeToEvents(async (eventType, payload) => {
    const handler = eventHandlers[eventType];

    if (!handler) {
      logger.warn({ eventType }, 'No handler registered for event type');
      return;
    }

    // Wrap in try/catch — one bad event never kills the listener
    try {
      logger.info({ eventType }, 'Handling event');
      await handler(payload);
      logger.debug({ eventType }, 'Event handled successfully');
    } catch (error) {
      logger.error({ error, eventType, payload }, 'Event handler failed');
      // The error is logged but the listener continues — this is critical for resilience
    }
  });

  logger.info(
    { handlerCount: Object.keys(eventHandlers).length },
    'Event router initialized and listening'
  );
}

export { eventHandlers };
