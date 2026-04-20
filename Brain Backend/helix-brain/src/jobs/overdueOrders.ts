/**
 * JOB: overdue_order_monitor
 * Schedule: Every 30 minutes
 * Monitors overdue orders and escalates through notification → warning → restriction → auto-cancel pipeline
 */

import { Job } from 'bullmq';
import { logger } from '../lib/logger';
import { writeAudit } from '../lib/audit';
import { apiGet, apiPost } from '../lib/coreApiClient';
import { sendNotification } from '../agent/tools';

interface OverdueOrder {
  order_id: string;
  seller_id: string;
  seller_name: string;
  buyer_id: string;
  buyer_name: string;
  deadline_at: string;
  hours_overdue: number;
  total_amount: number;
  status: string;
}

export async function overdueOrderMonitorJob(job: Job): Promise<{
  checked: number;
  notifications_sent: number;
  warnings_sent: number;
  flagged: number;
  restricted: number;
  auto_cancel_recommended: number;
}> {
  logger.info({ jobId: job.id }, 'Starting overdue order monitor');

  const stats = {
    checked: 0,
    notifications_sent: 0,
    warnings_sent: 0,
    flagged: 0,
    restricted: 0,
    auto_cancel_recommended: 0,
  };

  try {
    // Query Core API for overdue orders
    const overdueOrders = await apiGet<OverdueOrder[]>('/internal/orders/overdue');
    stats.checked = overdueOrders.length;

    logger.info({ count: overdueOrders.length }, 'Found overdue orders');

    // Process each order based on hours overdue
    for (const order of overdueOrders) {
      try {
        await processOverdueOrder(order, stats);
      } catch (error) {
        logger.error({ error, orderId: order.order_id }, 'Error processing overdue order');
      }
    }

    // Log to audit
    writeAudit({
      action: 'overdue_order_monitor',
      actor: 'helix-brain',
      target: 'orders',
      result: `checked:${stats.checked}, notifications:${stats.notifications_sent}, warnings:${stats.warnings_sent}, restricted:${stats.restricted}, auto_cancel:${stats.auto_cancel_recommended}`,
      metadata: stats,
    });

    logger.info({ ...stats }, 'Overdue order monitor completed');

    return stats;
  } catch (error) {
    logger.error({ error }, 'Overdue order monitor job failed');
    throw error;
  }
}

/**
 * Process a single overdue order based on escalation rules
 */
async function processOverdueOrder(
  order: OverdueOrder,
  stats: {
    notifications_sent: number;
    warnings_sent: number;
    flagged: number;
    restricted: number;
    auto_cancel_recommended: number;
  }
): Promise<void> {
  const hoursOverdue = order.hours_overdue;

  if (hoursOverdue < 6) {
    // < 6 hours: Send notification to seller
    await sendNotification({
      user_ids: [order.seller_id],
      type: 'warning',
      title: 'Order Deadline Approached',
      message: `Your order #${order.order_id} is now ${Math.floor(hoursOverdue)} hours overdue. Please deliver as soon as possible to avoid penalties.`,
      action_url: `/seller/orders/${order.order_id}`,
    });
    stats.notifications_sent++;

  } else if (hoursOverdue >= 6 && hoursOverdue < 24) {
    // 6-24 hours: Send warning + flag order
    await sendNotification({
      user_ids: [order.seller_id],
      type: 'alert',
      title: 'URGENT: Order Significantly Overdue',
      message: `Your order #${order.order_id} is ${Math.floor(hoursOverdue)} hours overdue. This has been flagged for admin review. Please deliver immediately or contact support.`,
      action_url: `/seller/orders/${order.order_id}`,
    });

    // Flag order in system
    await apiPost(`/internal/orders/${order.order_id}/flag`, {
      reason: `Order overdue by ${Math.floor(hoursOverdue)} hours`,
      severity: 'warning',
    });
    stats.warnings_sent++;
    stats.flagged++;

  } else if (hoursOverdue >= 24 && hoursOverdue < 48) {
    // 24-48 hours: Create admin alert + restrict seller
    await sendNotification({
      user_ids: ['all_admins'],
      type: 'alert',
      title: 'Seller Restriction Applied — Overdue Order',
      message: `Seller ${order.seller_name} has order #${order.order_id} overdue by ${Math.floor(hoursOverdue)} hours. Seller restricted from accepting new orders until resolved.`,
    });

    // Restrict seller from new orders
    await apiPost(`/internal/sellers/${order.seller_id}/restrict`, {
      reason: `Overdue order #${order.order_id} (${Math.floor(hoursOverdue)} hours)`,
      restriction_type: 'no_new_orders',
    });
    stats.restricted++;

  } else if (hoursOverdue >= 48) {
    // > 48 hours: HELIX-BRAIN recommendation to auto-cancel + full refund
    await sendNotification({
      user_ids: ['all_admins'],
      type: 'alert',
      title: 'Auto-Cancel Recommended — Severely Overdue Order',
      message: `Order #${order.order_id} is ${Math.floor(hoursOverdue)} hours overdue. HELIX-BRAIN recommends auto-cancellation with full refund to buyer ($${order.total_amount}). Seller: ${order.seller_name}`,
    });

    // Create AI recommendation record
    await apiPost(`/internal/orders/${order.order_id}/ai-recommendation`, {
      recommendation: 'auto_cancel_full_refund',
      reason: `Order overdue by ${Math.floor(hoursOverdue)} hours. No delivery received. Automatic cancellation and full refund recommended.`,
      confidence: 0.95,
      requires_admin_approval: true,
    });
    stats.auto_cancel_recommended++;
  }
}
