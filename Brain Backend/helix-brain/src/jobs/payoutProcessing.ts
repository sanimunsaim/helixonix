/**
 * JOB: payout_processing
 * Schedule: Daily at 2:00 AM UTC
 * Processes verified payout requests with automatic approval for amounts <= $500
 */

import { Job } from 'bullmq';
import { logger } from '../lib/logger';
import { writeAudit } from '../lib/audit';
import {
  processPayoutBatch,
  verifyPayoutEligibility,
  generateReport,
} from '../agent/tools';
import { apiGet, apiPost } from '../lib/coreApiClient';

interface PendingPayout {
  payout_id: string;
  seller_id: string;
  seller_name: string;
  amount: number;
  payment_method: string;
  requested_at: string;
  days_waiting: number;
}

export async function payoutProcessingJob(job: Job): Promise<{
  checked: number;
  auto_processed: number;
  flagged_for_admin: number;
  skipped: number;
  total_amount_processed: number;
}> {
  logger.info({ jobId: job.id }, 'Starting payout processing job');

  const stats = {
    checked: 0,
    auto_processed: 0,
    flagged_for_admin: 0,
    skipped: 0,
    total_amount_processed: 0,
  };

  try {
    // 1. Fetch pending payouts > $50 waiting > 7 days
    const pendingPayouts = await apiGet<PendingPayout[]>('/internal/payouts/pending', {
      min_amount: 50,
      min_days_waiting: 7,
    });

    stats.checked = pendingPayouts.length;
    logger.info({ count: pendingPayouts.length }, 'Found pending payouts to process');

    // 2. Process each payout individually for eligibility verification
    const autoProcessList: Array<{ seller_id: string; amount: number; method: string }> = [];
    const skipList: Array<{ seller_id: string; reason: string }> = [];

    for (const payout of pendingPayouts) {
      try {
        const result = await processIndividualPayout(payout);

        if (result.action === 'auto_process') {
          autoProcessList.push({
            seller_id: payout.seller_id,
            amount: payout.amount,
            method: payout.payment_method,
          });
        } else if (result.action === 'flag_admin') {
          stats.flagged_for_admin++;
        } else {
          skipList.push({ seller_id: payout.seller_id, reason: result.reason });
          stats.skipped++;
        }
      } catch (error) {
        logger.error({ error, payoutId: payout.payout_id }, 'Error processing individual payout');
        skipList.push({
          seller_id: payout.seller_id,
          reason: `Processing error: ${(error as Error).message}`,
        });
        stats.skipped++;
      }
    }

    // 3. Batch process auto-approved payouts
    if (autoProcessList.length > 0) {
      const batchResult = await processPayoutBatch({
        max_amount_per_payout: 500,
        only_verified_sellers: true,
      });

      stats.auto_processed = batchResult.processed.length;
      stats.total_amount_processed = batchResult.processed.reduce(
        (sum, p) => sum + p.amount,
        0
      );

      // Add skipped from batch to skip list
      for (const skipped of batchResult.skipped) {
        skipList.push(skipped);
        stats.skipped++;
      }
    }

    // 4. Notify sellers with critical issues (blocked payouts)
    for (const skipped of skipList) {
      if (skipped.reason.includes('fraud') || skipped.reason.includes('dispute')) {
        try {
          await apiPost('/internal/notifications/send', {
            user_ids: [skipped.seller_id],
            type: 'warning',
            title: 'Payout Processing Issue',
            message: `Your payout request could not be processed: ${skipped.reason}. Please contact support to resolve this issue.`,
          });
        } catch (notifyError) {
          logger.error(
            { notifyError, sellerId: skipped.seller_id },
            'Failed to notify seller about blocked payout'
          );
        }
      }
    }

    // 5. Generate and send report
    try {
      await generateReport({
        report_type: 'payout_summary',
        date_range: 'last_24h',
        format: 'email',
        recipient_email: process.env.FINANCE_ADMIN_EMAIL || 'finance@helixonix.com',
      });
    } catch (reportError) {
      logger.error({ reportError }, 'Failed to generate payout report');
    }

    // 6. Audit log
    writeAudit({
      action: 'payout_processing_run',
      actor: 'helix-brain',
      target: 'payout_queue',
      result: `checked:${stats.checked}, processed:${stats.auto_processed}, flagged:${stats.flagged_for_admin}, skipped:${stats.skipped}, total:$${stats.total_amount_processed.toFixed(2)}`,
      metadata: {
        ...stats,
        auto_processed_sellers: autoProcessList.map((p) => p.seller_id),
        flagged_sellers: pendingPayouts.slice(0, stats.flagged_for_admin).map((p) => p.seller_id),
      },
    });

    logger.info({ ...stats }, 'Payout processing job completed');

    return stats;
  } catch (error) {
    logger.error({ error }, 'Payout processing job failed');
    throw error;
  }
}

/**
 * Process a single payout — determine action based on eligibility and amount
 */
async function processIndividualPayout(payout: PendingPayout): Promise<
  | { action: 'auto_process' }
  | { action: 'flag_admin'; reason: string }
  | { action: 'skip'; reason: string }
> {
  // Verify eligibility
  const eligibility = await verifyPayoutEligibility(payout.seller_id, payout.amount);

  if (!eligibility.eligible) {
    return {
      action: 'skip',
      reason: eligibility.blocking_reason || 'Failed eligibility verification',
    };
  }

  // Check amount threshold
  if (payout.amount > 500) {
    // Flag for finance admin approval
    await apiPost(`/internal/payouts/${payout.payout_id}/flag`, {
      reason: `Amount $${payout.amount} exceeds auto-process threshold ($500). Eligibility checks passed.`,
      recommended_action: 'finance_admin_approval',
    });
    return {
      action: 'flag_admin',
      reason: `Amount $${payout.amount} exceeds $500 threshold`,
    };
  }

  // Eligible and under threshold — auto-process
  return { action: 'auto_process' };
}
