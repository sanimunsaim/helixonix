/**
 * EVENT: seller.onboarding_complete
 * Handler:
 *   1. Send "Your profile is live" email
 *   2. Create onboarding sequence (Day 1, Day 3, Day 7 automated tips)
 *   3. Add to "new sellers" featured section for 30 days
 */

import { logger } from '../../lib/logger';
import { writeAudit } from '../../lib/audit';
import { sendNotification, createFeaturedCollection } from '../../agent/tools';
import { apiPost } from '../../lib/coreApiClient';
import { sellerEvalQueue } from '../../lib/bullmq';
import type { SellerOnboardingCompletePayload } from '../../types/events';

export async function handleSellerOnboardingComplete(
  payload: Record<string, unknown>
): Promise<void> {
  const seller = payload as unknown as SellerOnboardingCompletePayload;
  logger.info({ sellerId: seller.seller_id }, 'Handling seller.onboarding_complete event');

  // 1. Send "Your profile is live" email
  try {
    await sendNotification({
      user_ids: [seller.user_id],
      type: 'success',
      title: 'Your Seller Profile is Live!',
      message: `Congratulations ${seller.seller_name}! Your seller profile is now live on HelixOnix. You can start receiving orders immediately. Here are some tips to get your first sales: optimize your gig titles with keywords, upload portfolio samples, and set competitive prices.`,
      email: true,
      email_template: 'seller_profile_live',
      action_url: '/seller/dashboard',
    });
    logger.debug({ sellerId: seller.seller_id }, 'Profile live email sent');
  } catch (error) {
    logger.error({ error, sellerId: seller.seller_id }, 'Failed to send profile live email');
  }

  // 2. Create onboarding sequence (Day 1, Day 3, Day 7 automated tips)
  try {
    const tips = [
      {
        day: 1,
        title: 'Tip: Optimize Your Gig Images',
        message: 'Gigs with high-quality preview images get 3x more clicks. Make sure your thumbnails are eye-catching and clearly show what you offer.',
      },
      {
        day: 3,
        title: 'Tip: Respond Quickly to Inquiries',
        message: 'Sellers who respond within 1 hour have a 70% higher conversion rate. Enable notifications to never miss a message.',
      },
      {
        day: 7,
        title: 'Tip: Request Reviews from Buyers',
        message: 'Positive reviews are your most powerful marketing tool. After completing an order, politely ask satisfied buyers to leave a review.',
      },
    ];

    for (const tip of tips) {
      const delayMs = tip.day * 24 * 60 * 60 * 1000; // Convert days to ms

      await sellerEvalQueue.add(
        'onboarding-tip',
        {
          user_id: seller.user_id,
          seller_id: seller.seller_id,
          tip,
        },
        {
          delay: delayMs,
          jobId: `onboarding-tip-${seller.seller_id}-day${tip.day}`,
        }
      );
    }

    logger.debug({ sellerId: seller.seller_id }, 'Onboarding sequence scheduled');
  } catch (error) {
    logger.error(
      { error, sellerId: seller.seller_id },
      'Failed to schedule onboarding sequence'
    );
  }

  // 3. Add to "new sellers" featured section for 30 days
  try {
    // Fetch the seller's portfolio assets
    const portfolioAssets = await apiPost<string[]>('/internal/sellers/new-seller-assets', {
      seller_id: seller.seller_id,
      categories: seller.categories,
      max_assets: 10,
    });

    if (portfolioAssets.length > 0) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

      await createFeaturedCollection({
        name: `New Seller: ${seller.seller_name}`,
        description: `Fresh talent on HelixOnix — check out ${seller.seller_name}'s latest work!`,
        asset_ids: portfolioAssets,
        placement: 'homepage',
        active_from: now.toISOString(),
        active_until: expiresAt.toISOString(),
      });

      logger.debug(
        { sellerId: seller.seller_id, assetCount: portfolioAssets.length },
        'Added to new sellers featured section'
      );
    }
  } catch (error) {
    logger.error(
      { error, sellerId: seller.seller_id },
      'Failed to add to new sellers section'
    );
  }

  // Audit log
  writeAudit({
    action: 'seller_onboarding_handled',
    actor: 'helix-brain',
    target: `seller:${seller.seller_id}`,
    result: 'welcome_sent_sequence_scheduled',
    metadata: {
      seller_id: seller.seller_id,
      user_id: seller.user_id,
      categories: seller.categories,
    },
  });
}
