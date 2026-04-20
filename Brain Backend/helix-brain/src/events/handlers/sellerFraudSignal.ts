/**
 * EVENT: seller.fraud_signal_detected
 * Handler:
 *   1. Immediately call get_user_risk_profile
 *   2. If score > 80: suspend_user(restrict_only: true) + admin alert
 *   3. If score 61-80: add monitoring flag + admin alert (low priority)
 *   4. Log reasoning chain
 */

import { logger } from '../../lib/logger';
import { writeAudit } from '../../lib/audit';
import {
  getUserRiskProfile,
  suspendUser,
  sendNotification,
} from '../../agent/tools';
import { apiPost } from '../../lib/coreApiClient';
import type { SellerFraudSignalPayload } from '../../types/events';

export async function handleSellerFraudSignal(
  payload: Record<string, unknown>
): Promise<void> {
  const signal = payload as unknown as SellerFraudSignalPayload;
  logger.info(
    { sellerId: signal.seller_id, signalType: signal.signal_type },
    'Handling seller.fraud_signal_detected event'
  );

  // 1. Get full risk profile
  let riskProfile;
  try {
    riskProfile = await getUserRiskProfile(signal.seller_id);
    logger.info(
      { sellerId: signal.seller_id, riskScore: riskProfile.risk_score },
      'Risk profile retrieved'
    );
  } catch (error) {
    logger.error(
      { error, sellerId: signal.seller_id },
      'Failed to get risk profile'
    );
    throw error; // Can't proceed without risk profile
  }

  // 2. If score > 80: auto-suspend with restrict_only + admin alert
  if (riskProfile.risk_score > 80) {
    try {
      await suspendUser({
        user_id: signal.seller_id,
        reason: `Fraud signal detected: ${signal.signal_type}. Risk score: ${riskProfile.risk_score}/100. Auto-suspended pending super admin review.`,
        duration_days: 30, // Temporary — super_admin must review for permanent
        internal_notes: `Signal: ${JSON.stringify(signal.signal_details)}. Full risk signals: ${JSON.stringify(riskProfile.signals)}`,
        notify_user: true,
        restrict_only: true, // Allow existing orders to complete, block new activity
      });

      // Urgent admin alert
      await sendNotification({
        user_ids: ['all_admins'],
        type: 'alert',
        title: 'URGENT: High-Risk Seller Auto-Suspended',
        message: `Seller ${signal.seller_id} auto-suspended due to fraud signal "${signal.signal_type}". Risk score: ${riskProfile.risk_score}/100. Restriction mode applied. Super admin review required for permanent action.`,
      });

      logger.warn(
        { sellerId: signal.seller_id, riskScore: riskProfile.risk_score },
        'High-risk seller auto-suspended'
      );
    } catch (error) {
      logger.error(
        { error, sellerId: signal.seller_id },
        'Failed to suspend high-risk seller'
      );
    }
  }
  // 3. If score 61-80: add monitoring flag + low-priority admin alert
  else if (riskProfile.risk_score >= 61) {
    try {
      await apiPost(`/internal/sellers/${signal.seller_id}/add-flag`, {
        flag_type: 'fraud_monitoring',
        reason: `Fraud signal: ${signal.signal_type}. Risk score: ${riskProfile.risk_score}/100. Under enhanced monitoring.`,
        severity: 'medium',
        signal_details: signal.signal_details,
      });

      // Low-priority admin alert
      await sendNotification({
        user_ids: ['all_admins'],
        type: 'warning',
        title: 'Seller Under Enhanced Monitoring',
        message: `Seller ${signal.seller_id} flagged for enhanced monitoring. Signal: "${signal.signal_type}". Risk score: ${riskProfile.risk_score}/100. No action taken — monitoring in place.`,
      });

      logger.info(
        { sellerId: signal.seller_id, riskScore: riskProfile.risk_score },
        'Seller added to fraud monitoring'
      );
    } catch (error) {
      logger.error(
        { error, sellerId: signal.seller_id },
        'Failed to add monitoring flag'
      );
    }
  }

  // 4. Log reasoning chain
  writeAudit({
    action: 'fraud_signal_handled',
    actor: 'helix-brain',
    target: `seller:${signal.seller_id}`,
    result:
      riskProfile.risk_score > 80
        ? 'auto_suspended_restrict_only'
        : riskProfile.risk_score >= 61
          ? 'monitoring_flag_added'
          : 'no_action_low_risk',
    reasoning: `Fraud signal "${signal.signal_type}" triggered risk assessment. Score: ${riskProfile.risk_score}/100. Signals: ${riskProfile.signals.map((s) => s.signal).join(', ')}`,
    metadata: {
      seller_id: signal.seller_id,
      signal_type: signal.signal_type,
      signal_details: signal.signal_details,
      risk_score: riskProfile.risk_score,
      risk_signals: riskProfile.signals,
      transaction_anomalies: riskProfile.transaction_anomalies,
      chargeback_history: riskProfile.chargeback_history,
    },
    requires_human_review: riskProfile.risk_score > 80,
    review_reason:
      riskProfile.risk_score > 80
        ? `Seller auto-suspended (risk score ${riskProfile.risk_score}). Super admin review required for permanent action.`
        : undefined,
  });
}
