/**
 * EVENT: user.registered
 * Handler:
 *   1. Send welcome email
 *   2. Award 10 signup credits
 *   3. Create initial risk profile baseline
 *   4. Track in acquisition analytics
 */

import { logger } from '../../lib/logger';
import { writeAudit } from '../../lib/audit';
import { sendNotification } from '../../agent/tools';
import { apiPost } from '../../lib/coreApiClient';
import type { UserRegisteredPayload } from '../../types/events';

export async function handleUserRegistered(
  payload: Record<string, unknown>
): Promise<void> {
  const user = payload as unknown as UserRegisteredPayload;
  logger.info({ userId: user.user_id }, 'Handling user.registered event');

  // 1. Send welcome email
  try {
    await sendNotification({
      user_ids: [user.user_id],
      type: 'info',
      title: 'Welcome to HelixOnix!',
      message: `Hi ${user.name}, welcome to HelixOnix — the premium creative marketplace! Your account comes with 10 free credits to get started. Explore thousands of templates, stock media, and creative services from top sellers.`,
      email: true,
      email_template: 'welcome_new_user',
      action_url: '/explore',
    });
    logger.debug({ userId: user.user_id }, 'Welcome email sent');
  } catch (error) {
    logger.error({ error, userId: user.user_id }, 'Failed to send welcome email');
    // Don't throw — welcome email is non-critical
  }

  // 2. Award 10 signup credits
  try {
    await apiPost(`/internal/users/${user.user_id}/credits`, {
      amount: 10,
      reason: 'signup_bonus',
      source: 'automatic',
    });
    logger.debug({ userId: user.user_id }, 'Signup credits awarded');
  } catch (error) {
    logger.error({ error, userId: user.user_id }, 'Failed to award signup credits');
    // Don't throw — credits can be awarded manually
  }

  // 3. Create initial risk profile baseline
  try {
    await apiPost('/internal/fraud/risk-baseline', {
      user_id: user.user_id,
      email: user.email,
      signup_source: user.signup_source,
      utm_campaign: user.utm_campaign,
      device_fingerprint: user.device_fingerprint,
      ip_address: user.ip_address,
      created_at: new Date().toISOString(),
    });
    logger.debug({ userId: user.user_id }, 'Risk profile baseline created');
  } catch (error) {
    logger.error(
      { error, userId: user.user_id },
      'Failed to create risk profile baseline'
    );
    // Don't throw — risk profile can be created later
  }

  // 4. Track in acquisition analytics
  try {
    await apiPost('/internal/analytics/acquisition', {
      user_id: user.user_id,
      email: user.email,
      signup_source: user.signup_source,
      utm_campaign: user.utm_campaign,
      device_fingerprint: user.device_fingerprint,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error, userId: user.user_id }, 'Failed to track acquisition');
    // Don't throw — analytics are non-critical
  }

  // Audit log
  writeAudit({
    action: 'user_registered_handled',
    actor: 'helix-brain',
    target: `user:${user.user_id}`,
    result: 'welcome_sent_credits_awarded',
    metadata: {
      user_id: user.user_id,
      email: user.email,
      signup_source: user.signup_source,
    },
  });
}
