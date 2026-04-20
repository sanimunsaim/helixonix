/**
 * JOB: weekly_platform_report
 * Schedule: Every Monday at 7:00 AM UTC
 * Generates and sends the weekly platform performance report
 */

import { Job } from 'bullmq';
import { logger } from '../lib/logger';
import { writeAudit } from '../lib/audit';
import { generateReport } from '../agent/tools';

export async function weeklyReportJob(job: Job): Promise<{
  report_sent: boolean;
  report_type: string;
}> {
  logger.info({ jobId: job.id }, 'Starting weekly platform report generation');

  try {
    const result = await generateReport({
      report_type: 'weekly_platform',
      date_range: 'last_7d',
      format: 'email',
      recipient_email: process.env.TEAM_EMAIL || 'team@helixonix.com',
    });

    // Audit log
    writeAudit({
      action: 'weekly_report_generated',
      actor: 'helix-brain',
      target: 'platform_reporting',
      result: result.sent ? 'sent' : 'failed',
      metadata: {
        report_url: result.report_url,
        sent: result.sent,
      },
    });

    logger.info({ sent: result.sent }, 'Weekly report job completed');

    return {
      report_sent: result.sent,
      report_type: 'weekly_platform',
    };
  } catch (error) {
    logger.error({ error }, 'Weekly report job failed');
    throw error;
  }
}
