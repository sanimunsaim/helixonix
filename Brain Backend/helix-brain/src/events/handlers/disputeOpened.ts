/**
 * EVENT: dispute.opened
 * Handler:
 *   1. Immediately call assess_dispute
 *   2. Attach AI recommendation to dispute record
 *   3. Notify moderators
 *   4. Send both parties "dispute received" email with process explanation
 *   5. Restrict related order escrow from auto-release
 */

import { logger } from '../../lib/logger';
import { writeAudit } from '../../lib/audit';
import { assessDispute, sendNotification } from '../../agent/tools';
import { apiPost } from '../../lib/coreApiClient';
import type { DisputeOpenedPayload } from '../../types/events';

export async function handleDisputeOpened(
  payload: Record<string, unknown>
): Promise<void> {
  const dispute = payload as unknown as DisputeOpenedPayload;
  logger.info({ disputeId: dispute.dispute_id }, 'Handling dispute.opened event');

  // 1 & 2. Assess dispute and attach AI recommendation
  let assessment;
  try {
    assessment = await assessDispute({ dispute_id: dispute.dispute_id });

    // Attach to dispute record
    await apiPost(`/internal/disputes/${dispute.dispute_id}/ai-assessment`, {
      recommendation: assessment.recommendation,
      confidence: assessment.confidence,
      reasoning: assessment.reasoning,
      key_signals: assessment.key_signals,
      seller_fault_score: assessment.seller_fault_score,
      buyer_bad_faith_indicators: assessment.buyer_bad_faith_indicators,
      assessed_at: new Date().toISOString(),
    });

    logger.debug(
      { disputeId: dispute.dispute_id, recommendation: assessment.recommendation },
      'Dispute assessed by AI'
    );
  } catch (error) {
    logger.error({ error, disputeId: dispute.dispute_id }, 'Failed to assess dispute');
    // Continue — assessment failure shouldn't block other actions
  }

  // 3. Notify moderators
  try {
    const moderatorMessage = assessment
      ? `New dispute #${dispute.dispute_id} opened. AI Assessment: ${assessment.recommendation} (confidence: ${Math.round(assessment.confidence * 100)}%). Seller fault score: ${assessment.seller_fault_score}/100.`
      : `New dispute #${dispute.dispute_id} opened for order #${dispute.order_id}. AI assessment pending. Please review.`;

    await sendNotification({
      user_ids: ['all_admins'],
      type: 'alert',
      title: 'New Dispute Opened',
      message: moderatorMessage,
      action_url: `/admin/disputes/${dispute.dispute_id}`,
    });
  } catch (error) {
    logger.error({ error, disputeId: dispute.dispute_id }, 'Failed to notify moderators');
  }

  // 4. Send both parties "dispute received" email
  try {
    // Notify buyer
    await sendNotification({
      user_ids: [dispute.buyer_id],
      type: 'info',
      title: 'Your Dispute Has Been Received',
      message: `We've received your dispute for order #${dispute.order_id}. Our team will review all evidence and provide a resolution within 48 hours. Both parties will be notified of any updates. Please upload any additional evidence through your order page.`,
      email: true,
      email_template: 'dispute_received_buyer',
      action_url: `/orders/${dispute.order_id}/dispute`,
    });

    // Notify seller
    await sendNotification({
      user_ids: [dispute.seller_id],
      type: 'info',
      title: 'A Dispute Has Been Opened on Your Order',
      message: `A dispute has been opened for order #${dispute.order_id}. Please review the buyer's concerns and respond with your perspective. Upload any relevant evidence (delivery files, messages, etc.) through your order page. Our team will review and provide a fair resolution within 48 hours.`,
      email: true,
      email_template: 'dispute_received_seller',
      action_url: `/seller/orders/${dispute.order_id}/dispute`,
    });
  } catch (error) {
    logger.error(
      { error, disputeId: dispute.dispute_id },
      'Failed to send dispute received notifications'
    );
  }

  // 5. Restrict related order escrow from auto-release
  try {
    await apiPost(`/internal/orders/${dispute.order_id}/hold-escrow`, {
      reason: `Dispute #${dispute.dispute_id} opened`,
      hold_until: 'dispute_resolved',
    });
    logger.debug({ orderId: dispute.order_id }, 'Escrow held due to dispute');
  } catch (error) {
    logger.error(
      { error, orderId: dispute.order_id },
      'Failed to hold escrow'
    );
  }

  // Audit log
  writeAudit({
    action: 'dispute_opened_handled',
    actor: 'helix-brain',
    target: `dispute:${dispute.dispute_id}`,
    result: assessment
      ? `assessed_${assessment.recommendation}`
      : 'assessment_failed_notifications_sent',
    metadata: {
      dispute_id: dispute.dispute_id,
      order_id: dispute.order_id,
      buyer_id: dispute.buyer_id,
      seller_id: dispute.seller_id,
      amount: dispute.amount,
      ai_recommendation: assessment?.recommendation,
      ai_confidence: assessment?.confidence,
    },
  });
}
