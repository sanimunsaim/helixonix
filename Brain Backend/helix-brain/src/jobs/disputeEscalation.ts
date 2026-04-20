/**
 * JOB: dispute_escalation_monitor
 * Schedule: Every 2 hours
 * Monitors open disputes for timely resolution and escalates stale ones
 */

import { Job } from 'bullmq';
import { logger } from '../lib/logger';
import { writeAudit } from '../lib/audit';
import { assessDispute, sendNotification } from '../agent/tools';
import { apiGet, apiPost } from '../lib/coreApiClient';

interface OpenDispute {
  dispute_id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  opened_at: string;
  hours_open: number;
  moderator_id: string | null;
  moderator_assigned_at: string | null;
  hours_since_moderator_action: number | null;
  ai_assessed: boolean;
}

export async function disputeEscalationJob(job: Job): Promise<{
  checked: number;
  urgent_alerts: number;
  escalated: number;
  ai_assessed: number;
}> {
  logger.info({ jobId: job.id }, 'Starting dispute escalation monitor');

  const stats = {
    checked: 0,
    urgent_alerts: 0,
    escalated: 0,
    ai_assessed: 0,
  };

  try {
    // Get open disputes older than 48 hours
    const openDisputes = await apiGet<OpenDispute[]>('/internal/disputes/open', {
      min_hours_open: 48,
    });

    stats.checked = openDisputes.length;
    logger.info({ count: openDisputes.length }, 'Found open disputes to check');

    for (const dispute of openDisputes) {
      try {
        await processDispute(dispute, stats);
      } catch (error) {
        logger.error({ error, disputeId: dispute.dispute_id }, 'Error processing dispute');
      }
    }

    // Audit log
    writeAudit({
      action: 'dispute_escalation_run',
      actor: 'helix-brain',
      target: 'disputes',
      result: `checked:${stats.checked}, urgent:${stats.urgent_alerts}, escalated:${stats.escalated}, ai_assessed:${stats.ai_assessed}`,
      metadata: stats,
    });

    logger.info({ ...stats }, 'Dispute escalation monitor completed');

    return stats;
  } catch (error) {
    logger.error({ error }, 'Dispute escalation job failed');
    throw error;
  }
}

/**
 * Process a single dispute based on its age and moderator status
 */
async function processDispute(
  dispute: OpenDispute,
  stats: { urgent_alerts: number; escalated: number; ai_assessed: number }
): Promise<void> {
  // 1. If no moderator assigned after 48h → urgent admin alert
  if (!dispute.moderator_id) {
    await sendNotification({
      user_ids: ['all_admins'],
      type: 'alert',
      title: 'URGENT: Dispute Unassigned for 48+ Hours',
      message: `Dispute #${dispute.dispute_id} has been open for ${Math.floor(dispute.hours_open)} hours with NO moderator assigned. Immediate attention required.`,
    });
    stats.urgent_alerts++;
    return;
  }

  // 2. If moderator assigned but no action in 72h → escalate to senior admin
  if (
    dispute.hours_since_moderator_action !== null &&
    dispute.hours_since_moderator_action > 72
  ) {
    await apiPost(`/internal/disputes/${dispute.dispute_id}/escalate`, {
      reason: `No moderator action for ${Math.floor(dispute.hours_since_moderator_action)} hours`,
      escalate_to: 'senior_admin',
    });

    await sendNotification({
      user_ids: ['all_admins'],
      type: 'alert',
      title: 'Dispute Escalated to Senior Admin',
      message: `Dispute #${dispute.dispute_id} escalated. Moderator assigned but no action for ${Math.floor(dispute.hours_since_moderator_action)} hours.`,
    });
    stats.escalated++;
    return;
  }

  // 3. If not yet AI-assessed → call assess_dispute
  if (!dispute.ai_assessed) {
    try {
      const assessment = await assessDispute({ dispute_id: dispute.dispute_id });

      // Attach AI recommendation to dispute record
      await apiPost(`/internal/disputes/${dispute.dispute_id}/ai-assessment`, {
        recommendation: assessment.recommendation,
        confidence: assessment.confidence,
        reasoning: assessment.reasoning,
        key_signals: assessment.key_signals,
        seller_fault_score: assessment.seller_fault_score,
        buyer_bad_faith_indicators: assessment.buyer_bad_faith_indicators,
      });

      stats.ai_assessed++;
    } catch (error) {
      logger.error(
        { error, disputeId: dispute.dispute_id },
        'Error assessing dispute with AI'
      );
    }
  }
}
