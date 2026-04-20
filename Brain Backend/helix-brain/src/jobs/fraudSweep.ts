/**
 * JOB: fraud_sweep
 * Schedule: Every hour
 * Scans new users and recent transactions for fraud patterns
 */

import { Job } from 'bullmq';
import { logger } from '../lib/logger';
import { writeAudit } from '../lib/audit';
import {
  getUserRiskProfile,
  suspendUser,
  flagTransaction,
  sendNotification,
} from '../agent/tools';
import { apiGet, apiPost } from '../lib/coreApiClient';

interface NewUser {
  user_id: string;
  email: string;
  name: string;
  signup_at: string;
  device_fingerprint: string;
  ip_address: string;
}

interface RecentTransaction {
  transaction_id: string;
  user_id: string;
  amount: number;
  currency: string;
  created_at: string;
  payment_method: string;
  billing_country: string;
  ip_country: string;
}

// Known fraud patterns (would be loaded from database in production)
const FRAUD_PATTERNS = {
  high_risk_countries: ['XX', 'YY', 'ZZ'], // Placeholder — loaded from config
  rapid_transaction_threshold_ms: 60000, // 1 minute
  large_transaction_threshold: 200,
  new_account_large_threshold: 500,
};

export async function fraudSweepJob(job: Job): Promise<{
  users_checked: number;
  users_restricted: number;
  users_suspended: number;
  transactions_checked: number;
  transactions_flagged: number;
}> {
  logger.info({ jobId: job.id }, 'Starting fraud sweep');

  const stats = {
    users_checked: 0,
    users_restricted: 0,
    users_suspended: 0,
    transactions_checked: 0,
    transactions_flagged: 0,
  };

  try {
    // 1. Get new users in last hour
    const newUsers = await apiGet<NewUser[]>('/internal/users/new', {
      hours: 1,
    });
    stats.users_checked = newUsers.length;

    // 2. Check each new user's risk profile
    for (const user of newUsers) {
      try {
        await checkUserRisk(user, stats);
      } catch (error) {
        logger.error({ error, userId: user.user_id }, 'Error checking user risk');
      }
    }

    // 3. Get transactions in last hour with amount > $200
    const recentTransactions = await apiGet<RecentTransaction[]>('/internal/transactions/recent', {
      hours: 1,
      min_amount: FRAUD_PATTERNS.large_transaction_threshold,
    });
    stats.transactions_checked = recentTransactions.length;

    // 4. Cross-check against fraud patterns
    for (const transaction of recentTransactions) {
      try {
        await checkTransactionFraud(transaction, stats);
      } catch (error) {
        logger.error(
          { error, transactionId: transaction.transaction_id },
          'Error checking transaction fraud'
        );
      }
    }

    // 5. Audit log
    writeAudit({
      action: 'fraud_sweep_run',
      actor: 'helix-brain',
      target: 'fraud_detection',
      result: `users_checked:${stats.users_checked}, restricted:${stats.users_restricted}, suspended:${stats.users_suspended}, tx_checked:${stats.transactions_checked}, tx_flagged:${stats.transactions_flagged}`,
      metadata: stats,
    });

    logger.info({ ...stats }, 'Fraud sweep completed');

    return stats;
  } catch (error) {
    logger.error({ error }, 'Fraud sweep job failed');
    throw error;
  }
}

/**
 * Check a user's risk profile and take action
 */
async function checkUserRisk(
  user: NewUser,
  stats: { users_restricted: number; users_suspended: number }
): Promise<void> {
  const riskProfile = await getUserRiskProfile(user.user_id);

  if (riskProfile.risk_score >= 81) {
    // High risk — auto-suspend with restrict_only, flag for super_admin
    await suspendUser({
      user_id: user.user_id,
      reason: `Fraud sweep: Risk score ${riskProfile.risk_score}/100. Signals: ${riskProfile.signals.map((s) => s.signal).join(', ')}`,
      duration_days: 30, // Temporary, not permanent — super_admin must review
      internal_notes: `Auto-suspended by fraud sweep. Risk signals: ${JSON.stringify(riskProfile.signals)}`,
      notify_user: true,
      restrict_only: true,
    });

    // Alert admins
    await sendNotification({
      user_ids: ['all_admins'],
      type: 'alert',
      title: 'High-Risk User Auto-Suspended',
      message: `User ${user.name} (${user.email}) auto-suspended. Risk score: ${riskProfile.risk_score}/100. Restricted mode applied. Super admin review required.`,
    });

    stats.users_suspended++;
  } else if (riskProfile.risk_score >= 61) {
    // Medium-high risk — add restriction flag, notify admin
    await apiPost(`/internal/users/${user.user_id}/add-flag`, {
      flag_type: 'fraud_monitoring',
      reason: `Fraud sweep: Risk score ${riskProfile.risk_score}/100. Added monitoring flag.`,
      severity: 'medium',
    });

    await sendNotification({
      user_ids: ['all_admins'],
      type: 'warning',
      title: 'User Flagged for Fraud Monitoring',
      message: `User ${user.name} (${user.email}) flagged. Risk score: ${riskProfile.risk_score}/100. Under enhanced monitoring.`,
    });

    stats.users_restricted++;
  }

  // Log the risk assessment
  await apiPost('/internal/fraud/risk-assessment-log', {
    user_id: user.user_id,
    risk_score: riskProfile.risk_score,
    signals: riskProfile.signals,
    checked_at: new Date().toISOString(),
  });
}

/**
 * Check a transaction for fraud patterns
 */
async function checkTransactionFraud(
  transaction: RecentTransaction,
  stats: { transactions_flagged: number }
): Promise<void> {
  const anomalies: string[] = [];

  // Check billing/IP country mismatch
  if (transaction.billing_country !== transaction.ip_country) {
    anomalies.push(`Billing country (${transaction.billing_country}) != IP country (${transaction.ip_country})`);
  }

  // Check high-risk country
  if (FRAUD_PATTERNS.high_risk_countries.includes(transaction.billing_country)) {
    anomalies.push(`High-risk billing country: ${transaction.billing_country}`);
  }

  // Check very large amount from new account
  if (transaction.amount > FRAUD_PATTERNS.new_account_large_threshold) {
    anomalies.push(`Large transaction from new account: $${transaction.amount}`);
  }

  // Flag if anomalies detected
  if (anomalies.length > 0) {
    const action = transaction.amount > 500 ? 'freeze' : 'monitor';

    await flagTransaction({
      transaction_id: transaction.transaction_id,
      reason: `Fraud sweep anomalies: ${anomalies.join('; ')}`,
      action,
      notify_finance_admin: true,
    });

    stats.transactions_flagged++;
  }
}
