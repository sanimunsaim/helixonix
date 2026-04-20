/**
 * EVENT: payment.failed
 * Handler:
 *   1. Log failed payment
 *   2. If subscription: send dunning email (retry in 3 days)
 *   3. If order payment: cancel order + notify buyer
 *   4. Check if repeated failure: flag for fraud review
 */

import { logger } from '../../lib/logger';
import { writeAudit } from '../../lib/audit';
import { sendNotification, flagTransaction } from '../../agent/tools';
import { apiPost, apiGet } from '../../lib/coreApiClient';
import type { PaymentFailedPayload } from '../../types/events';

export async function handlePaymentFailed(
  payload: Record<string, unknown>
): Promise<void> {
  const payment = payload as unknown as PaymentFailedPayload;
  logger.info({ paymentId: payment.payment_id }, 'Handling payment.failed event');

  // 1. Log the failed payment
  try {
    await apiPost('/internal/payments/failure-log', {
      payment_id: payment.payment_id,
      order_id: payment.order_id,
      user_id: payment.user_id,
      amount: payment.amount,
      payment_type: payment.payment_type,
      failure_reason: payment.failure_reason,
      retry_count: payment.retry_count,
      failed_at: payment.failed_at,
    });
  } catch (error) {
    logger.error({ error, paymentId: payment.payment_id }, 'Failed to log payment failure');
  }

  // 2 & 3. Handle based on payment type
  if (payment.payment_type === 'subscription') {
    // Subscription: send dunning email
    try {
      await sendNotification({
        user_ids: [payment.user_id],
        type: 'warning',
        title: 'Payment Failed — Please Update Your Billing Info',
        message: `We couldn't process your subscription payment of $${payment.amount}. Please update your payment method within 3 days to avoid service interruption. After 3 days, we'll retry automatically.`,
        email: true,
        email_template: 'dunning_subscription',
        action_url: '/account/billing',
      });
      logger.debug({ paymentId: payment.payment_id }, 'Dunning email sent');
    } catch (error) {
      logger.error(
        { error, paymentId: payment.payment_id },
        'Failed to send dunning email'
      );
    }
  } else if (payment.payment_type === 'order') {
    // Order payment: cancel order + notify buyer
    try {
      if (payment.order_id) {
        await apiPost(`/internal/orders/${payment.order_id}/cancel`, {
          reason: 'payment_failed',
          payment_failure_reason: payment.failure_reason,
        });
      }

      await sendNotification({
        user_ids: [payment.user_id],
        type: 'warning',
        title: 'Order Cancelled — Payment Failed',
        message: `Your order #${payment.order_id} has been cancelled because we couldn't process your payment of $${payment.amount}. Reason: ${payment.failure_reason}. You can place a new order with a different payment method.`,
        email: true,
        email_template: 'order_payment_failed',
        action_url: '/orders',
      });

      logger.debug({ paymentId: payment.payment_id }, 'Order cancelled due to payment failure');
    } catch (error) {
      logger.error(
        { error, paymentId: payment.payment_id },
        'Failed to handle order payment failure'
      );
    }
  }

  // 4. Check if repeated failure — flag for fraud review
  try {
    // Get recent failure count for this user
    const recentFailures = await apiGet<{ count: number }>('/internal/payments/recent-failures', {
      user_id: payment.user_id,
      hours: 24,
    });

    if (recentFailures.count >= 3) {
      // 3+ failures in 24 hours — flag for fraud review
      await flagTransaction({
        transaction_id: payment.payment_id,
        reason: `Repeated payment failures: ${recentFailures.count} failures in 24 hours for user ${payment.user_id}. Last failure: ${payment.failure_reason}`,
        action: 'monitor',
        notify_finance_admin: true,
      });

      logger.warn(
        { userId: payment.user_id, failureCount: recentFailures.count },
        'Flagged repeated payment failures for fraud review'
      );
    }
  } catch (error) {
    logger.error(
      { error, paymentId: payment.payment_id },
      'Failed to check repeated payment failures'
    );
  }

  // Audit log
  writeAudit({
    action: 'payment_failed_handled',
    actor: 'helix-brain',
    target: `payment:${payment.payment_id}`,
    result: `${payment.payment_type}_${payment.retry_count > 2 ? 'flagged_repeated' : 'notified'}`,
    metadata: {
      payment_id: payment.payment_id,
      order_id: payment.order_id,
      user_id: payment.user_id,
      amount: payment.amount,
      payment_type: payment.payment_type,
      failure_reason: payment.failure_reason,
      retry_count: payment.retry_count,
    },
  });
}
